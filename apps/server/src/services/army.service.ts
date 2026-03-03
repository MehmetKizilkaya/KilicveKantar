import { prisma } from '../config/prisma';
import { UNIT_TRAINING, UNIT_POWER, ARMY_MOVE_MINUTES } from '@kilic-ve-kantar/shared';

type UnitKind = 'INFANTRY' | 'CAVALRY' | 'ARTILLERY';

export const ArmyService = {
  async getArmy(playerId: string) {
    return prisma.armyUnit.findMany({
      where: { playerId },
      include: {
        garrisonRegion: { select: { id: true, name: true } },
        destinationRegion: { select: { id: true, name: true } },
      },
    });
  },

  async recruit(playerId: string, unitType: UnitKind, count: number) {
    if (count < 1 || count > 100) throw new Error('Adet 1-100 arasında olmalıdır');

    const training = UNIT_TRAINING[unitType];
    const totalCost = training.costAkce * count;

    const player = await prisma.player.findUniqueOrThrow({
      where: { id: playerId },
      select: { akceBalance: true, currentRegionId: true },
    });

    if (player.akceBalance < totalCost) {
      throw new Error(`Yeterli Akçe yok. Gerekli: ${totalCost}, Mevcut: ${player.akceBalance}`);
    }
    if (!player.currentRegionId) {
      throw new Error('Asker toplamak için bir şehirde olmanız gerekir');
    }

    const trainingEndsAt = new Date(Date.now() + training.trainMinutes * 60 * 1000);

    const [unit] = await prisma.$transaction([
      prisma.armyUnit.create({
        data: {
          playerId,
          unitType,
          count,
          isTraining: true,
          trainingEndsAt,
          garrisonRegionId: player.currentRegionId,
        },
      }),
      prisma.player.update({
        where: { id: playerId },
        data: { akceBalance: { decrement: totalCost } },
      }),
    ]);

    return { unit, totalCost, trainingEndsAt };
  },

  async moveUnits(playerId: string, unitId: string, destinationRegionId: string) {
    const unit = await prisma.armyUnit.findFirst({
      where: { id: unitId, playerId },
    });
    if (!unit) throw new Error('Birlik bulunamadı');
    if (unit.isTraining) throw new Error('Eğitimdeki birlikler hareket edemez');
    if (unit.isInTransit) throw new Error('Birlikler zaten hareket halinde');

    const travelEndsAt = new Date(Date.now() + ARMY_MOVE_MINUTES * 60 * 1000);

    return prisma.armyUnit.update({
      where: { id: unitId },
      data: {
        isInTransit: true,
        destinationRegionId,
        travelEndsAt,
      },
    });
  },

  async attack(playerId: string, targetRegionId: string, units: Partial<Record<UnitKind, number>>) {
    const player = await prisma.player.findUniqueOrThrow({
      where: { id: playerId },
      select: { currentRegionId: true, militaryLevel: true },
    });

    if (!player.currentRegionId) throw new Error('Saldırmak için bir şehirde olmanız gerekir');

    // Check existing siege
    const existingSiege = await prisma.siege.findFirst({
      where: { targetRegionId, status: 'ACTIVE' },
    });
    if (existingSiege) throw new Error('Bu şehir zaten kuşatma altında');

    // Calculate attacker power from units
    const armyUnits = await prisma.armyUnit.findMany({
      where: { playerId, garrisonRegionId: player.currentRegionId, isTraining: false, isInTransit: false },
    });

    let attackerPower = 0;
    for (const unit of armyUnits) {
      const requestedCount = units[unit.unitType as UnitKind] ?? 0;
      if (requestedCount > unit.count) {
        throw new Error(`Yeterli ${unit.unitType} birliğiniz yok`);
      }
      attackerPower += requestedCount * UNIT_POWER[unit.unitType as UnitKind];
    }

    if (attackerPower === 0) throw new Error('Saldıracak birlik seçmediniz');

    // Calculate defender power (garrison + region defense)
    const targetStats = await prisma.regionStats.findUnique({ where: { regionId: targetRegionId } });
    const defenseBonus = (targetStats?.defenseLevel ?? 1) * 15;
    const garrisonPower = (targetStats?.garrisonSize ?? 0) * UNIT_POWER.INFANTRY;
    const defenderPower = garrisonPower + defenseBonus + (player.militaryLevel * 5);

    // Siege resolves in 5 minutes
    const endsAt = new Date(Date.now() + 5 * 60 * 1000);

    const siege = await prisma.siege.create({
      data: {
        attackerPlayerId: playerId,
        targetRegionId,
        attackerPower,
        defenderPower,
        endsAt,
      },
    });

    return { siege, attackerPower, defenderPower };
  },

  async getActiveSieges() {
    return prisma.siege.findMany({
      where: { status: 'ACTIVE' },
      include: {
        attacker: { select: { username: true } },
        targetRegion: { select: { name: true, code: true } },
      },
    });
  },

  // Called by tick engine
  async resolveTraining() {
    const ready = await prisma.armyUnit.findMany({
      where: { isTraining: true, trainingEndsAt: { lte: new Date() } },
    });
    for (const unit of ready) {
      await prisma.armyUnit.update({
        where: { id: unit.id },
        data: { isTraining: false, trainingEndsAt: null },
      });
    }
    return ready.length;
  },

  async resolveArmyMovements(io?: { emit: (event: string, data: unknown) => void }) {
    const arrived = await prisma.armyUnit.findMany({
      where: { isInTransit: true, travelEndsAt: { lte: new Date() } },
    });
    for (const unit of arrived) {
      await prisma.armyUnit.update({
        where: { id: unit.id },
        data: {
          garrisonRegionId: unit.destinationRegionId,
          isInTransit: false,
          destinationRegionId: null,
          travelEndsAt: null,
        },
      });
    }
    return arrived.length;
  },

  async resolveSieges(io?: { emit: (event: string, data: unknown) => void }) {
    const activeSieges = await prisma.siege.findMany({
      where: { status: 'ACTIVE', endsAt: { lte: new Date() } },
      include: { targetRegion: true },
    });

    for (const siege of activeSieges) {
      const attackerWins = siege.attackerPower > siege.defenderPower;
      const result = attackerWins ? 'ATTACKER_WINS' : 'DEFENDER_WINS';

      await prisma.siege.update({
        where: { id: siege.id },
        data: { status: 'RESOLVED', result },
      });

      if (attackerWins) {
        await prisma.region.update({
          where: { id: siege.targetRegionId },
          data: { governorId: siege.attackerPlayerId },
        });

        await prisma.autoNewsEvent.create({
          data: {
            type: 'region_captured',
            title: `${siege.targetRegion.name} Ele Geçirildi!`,
            body: `Saldırganlar ${siege.targetRegion.name} şehrini kuşatma ile ele geçirdi.`,
            involvedRegionIds: [siege.targetRegionId],
            involvedPlayerIds: [siege.attackerPlayerId],
          },
        });

        io?.emit('region:captured', { regionId: siege.targetRegionId });
      }
    }

    return activeSieges.length;
  },
};
