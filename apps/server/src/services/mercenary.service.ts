import { prisma } from '../config/prisma';

export const MercenaryService = {
  async createProfile(
    playerId: string,
    specialization: string[],
    dailyRateAkce: number,
    dailyRateAltin: number,
    description: string,
  ) {
    const player = await prisma.player.findUniqueOrThrow({
      where: { id: playerId },
      select: { militaryLevel: true },
    });

    if (player.militaryLevel < 3) {
      throw new Error('Paralı asker profili açmak için Askeri Seviye 3 gereklidir');
    }

    const existing = await prisma.mercenaryProfile.findUnique({ where: { playerId } });
    if (existing) {
      return prisma.mercenaryProfile.update({
        where: { playerId },
        data: { specialization, dailyRateAkce, dailyRateAltin, description },
      });
    }

    return prisma.mercenaryProfile.create({
      data: { playerId, specialization, dailyRateAkce, dailyRateAltin, description },
    });
  },

  async listAvailable(
    specializationFilter?: string,
    maxRateAkce?: number,
    page = 1,
    pageSize = 20,
  ) {
    const skip = (page - 1) * pageSize;
    const where: Record<string, unknown> = { isAvailable: true };
    if (specializationFilter) {
      where.specialization = { has: specializationFilter };
    }
    if (maxRateAkce) {
      where.dailyRateAkce = { lte: maxRateAkce };
    }

    const [profiles, total] = await Promise.all([
      prisma.mercenaryProfile.findMany({
        where,
        include: {
          player: {
            select: {
              username: true,
              militaryLevel: true,
              tradeLevel: true,
              reputationScore: true,
              factionId: true,
              faction: { select: { name: true, tag: true } },
            },
          },
        },
        orderBy: { reputationScore: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.mercenaryProfile.count({ where }),
    ]);
    return { profiles, total, pages: Math.ceil(total / pageSize) };
  },

  async sendContractOffer(
    employerId: string,
    mercenaryId: string,
    type: string,
    durationDays: number,
    totalAkce: number,
    totalAltin = 0,
  ) {
    const employer = await prisma.player.findUniqueOrThrow({
      where: { id: employerId },
      select: { akceBalance: true, altinBalance: true },
    });

    if (employer.akceBalance < totalAkce) throw new Error('Yeterli Akçe yok');
    if (employer.altinBalance < totalAltin) throw new Error('Yeterli Altın yok');

    const profile = await prisma.mercenaryProfile.findUnique({
      where: { playerId: mercenaryId },
    });
    if (!profile) throw new Error('Paralı asker profili bulunamadı');
    if (!profile.isAvailable) throw new Error('Bu paralı asker şu an müsait değil');

    return prisma.mercenaryContract.create({
      data: {
        employerId,
        mercenaryId,
        type: type as never,
        durationDays,
        totalAkce,
        totalAltin,
      },
    });
  },

  async respondToContract(
    mercenaryId: string,
    contractId: string,
    accept: boolean,
  ) {
    const contract = await prisma.mercenaryContract.findFirst({
      where: { id: contractId, mercenaryId, status: 'PENDING' },
    });
    if (!contract) throw new Error('Sözleşme bulunamadı');

    if (!accept) {
      return prisma.mercenaryContract.update({
        where: { id: contractId },
        data: { status: 'CANCELLED' },
      });
    }

    const endedAt = new Date(Date.now() + contract.durationDays * 24 * 60 * 60 * 1000);

    const [updated] = await prisma.$transaction([
      prisma.mercenaryContract.update({
        where: { id: contractId },
        data: { status: 'ACTIVE', startedAt: new Date(), endedAt },
      }),
      prisma.player.update({
        where: { id: contract.employerId },
        data: {
          akceBalance: { decrement: contract.totalAkce },
          altinBalance: { decrement: contract.totalAltin },
        },
      }),
      prisma.mercenaryProfile.update({
        where: { playerId: mercenaryId },
        data: { isAvailable: false },
      }),
    ]);

    return updated;
  },

  async completeContract(contractId: string) {
    const contract = await prisma.mercenaryContract.findUniqueOrThrow({
      where: { id: contractId },
    });
    if (contract.status !== 'ACTIVE') throw new Error('Sözleşme aktif değil');

    await prisma.$transaction([
      prisma.mercenaryContract.update({
        where: { id: contractId },
        data: { status: 'COMPLETED', endedAt: new Date() },
      }),
      prisma.player.update({
        where: { id: contract.mercenaryId },
        data: {
          akceBalance: { increment: contract.totalAkce },
          altinBalance: { increment: contract.totalAltin },
        },
      }),
      prisma.mercenaryProfile.update({
        where: { playerId: contract.mercenaryId },
        data: {
          isAvailable: true,
          totalContracts: { increment: 1 },
        },
      }),
    ]);
  },

  async getMyContracts(playerId: string) {
    return prisma.mercenaryContract.findMany({
      where: { OR: [{ employerId: playerId }, { mercenaryId: playerId }] },
      include: {
        employer: { select: { username: true } },
        mercenary: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  async getMyProfile(playerId: string) {
    return prisma.mercenaryProfile.findUnique({ where: { playerId } });
  },

  async rateContract(
    raterId: string,
    contractId: string,
    rating: number,
  ) {
    const contract = await prisma.mercenaryContract.findUniqueOrThrow({
      where: { id: contractId },
    });
    if (contract.status !== 'COMPLETED') throw new Error('Yalnızca tamamlanan sözleşmeler değerlendirilebilir');

    const isEmployer = contract.employerId === raterId;
    const isMercenary = contract.mercenaryId === raterId;
    if (!isEmployer && !isMercenary) throw new Error('Bu sözleşmeye taraf değilsiniz');

    const clampedRating = Math.min(5, Math.max(1, rating));

    if (isEmployer) {
      await prisma.mercenaryContract.update({
        where: { id: contractId },
        data: { mercenaryRating: clampedRating },
      });
      // Update mercenary reputation
      const profiles = await prisma.mercenaryContract.findMany({
        where: { mercenaryId: contract.mercenaryId, status: 'COMPLETED', mercenaryRating: { not: null } },
        select: { mercenaryRating: true },
      });
      const avgRating = profiles.reduce((a, b) => a + (b.mercenaryRating ?? 0), 0) / profiles.length;
      await prisma.mercenaryProfile.update({
        where: { playerId: contract.mercenaryId },
        data: { reputationScore: Math.round(avgRating * 20) },
      });
    } else {
      await prisma.mercenaryContract.update({
        where: { id: contractId },
        data: { employerRating: clampedRating },
      });
    }
  },
};
