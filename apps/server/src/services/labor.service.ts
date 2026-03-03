import { prisma } from '../config/prisma';
import { LABOR_DURATIONS, LABOR_REWARDS } from '@kilic-ve-kantar/shared';
import type { LaborType } from '@kilic-ve-kantar/shared';
import { LABOR_EXTEND_COST_ALTIN, LABOR_RESTART_COST } from '@kilic-ve-kantar/shared';

const PRISMA_TO_SHARED: Record<string, LaborType> = {
  BASIC_WORKER: 'basic_worker',
  CRAFTSMAN: 'craftsman',
  TRADER_LABOR: 'trader',
  SOLDIER: 'soldier',
};

const SHARED_TO_PRISMA: Record<string, string> = {
  basic_worker: 'BASIC_WORKER',
  craftsman: 'CRAFTSMAN',
  trader: 'TRADER_LABOR',
  soldier: 'SOLDIER',
};

export const LaborService = {
  async getActiveCycle(playerId: string) {
    return prisma.laborCycle.findFirst({
      where: { playerId, isActive: true },
    });
  },

  async startCycle(playerId: string, type: LaborType) {
    const existing = await prisma.laborCycle.findFirst({
      where: { playerId, isActive: true },
    });
    if (existing) throw new Error('Zaten aktif bir çalışma döngüsü var');

    const player = await prisma.player.findUniqueOrThrow({
      where: { id: playerId },
      select: { vipPlan: true },
    });

    const isPremium = player.vipPlan !== 'FREE';
    const durations = LABOR_DURATIONS[type];
    const durationMinutes = isPremium ? durations.premium : durations.normal;
    const akceReward = LABOR_REWARDS[type];

    const endsAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    return prisma.laborCycle.create({
      data: {
        playerId,
        type: SHARED_TO_PRISMA[type] as never,
        endsAt,
        akceReward,
        isActive: true,
      },
    });
  },

  async collect(playerId: string, cycleId: string) {
    const cycle = await prisma.laborCycle.findFirst({
      where: { id: cycleId, playerId, isActive: true },
    });
    if (!cycle) throw new Error('Döngü bulunamadı');
    if (cycle.endsAt > new Date()) {
      throw new Error('Döngü henüz tamamlanmadı');
    }
    if (cycle.collected) throw new Error('Bu döngü zaten toplandı');

    const [updatedCycle] = await prisma.$transaction([
      prisma.laborCycle.update({
        where: { id: cycleId },
        data: { isActive: false, collected: true, collectedAt: new Date() },
      }),
      prisma.player.update({
        where: { id: playerId },
        data: { akceBalance: { increment: cycle.akceReward } },
      }),
    ]);

    return { cycle: updatedCycle, akceEarned: cycle.akceReward };
  },

  async extendCycle(playerId: string, cycleId: string) {
    const cycle = await prisma.laborCycle.findFirst({
      where: { id: cycleId, playerId, isActive: true },
    });
    if (!cycle) throw new Error('Döngü bulunamadı');
    if (cycle.extendedCount >= 2) throw new Error('Maksimum uzatma sayısına ulaşıldı');

    const player = await prisma.player.findUniqueOrThrow({
      where: { id: playerId },
      select: { vipPlan: true, altinBalance: true },
    });

    if (player.vipPlan === 'FREE') {
      throw new Error('Bu özellik premium kullanıcılara özeldir');
    }
    if (player.altinBalance < LABOR_EXTEND_COST_ALTIN) {
      throw new Error('Yeterli Altın yok');
    }

    const sharedType = PRISMA_TO_SHARED[cycle.type];
    const durations = LABOR_DURATIONS[sharedType];
    // vipPlan cannot be 'FREE' here — guard above already threw
    const baseDuration = durations.premium;
    const extensionMinutes = Math.floor(baseDuration * 0.5);

    const newEndsAt = new Date(cycle.endsAt.getTime() + extensionMinutes * 60 * 1000);

    await prisma.$transaction([
      prisma.player.update({
        where: { id: playerId },
        data: { altinBalance: { decrement: LABOR_EXTEND_COST_ALTIN } },
      }),
      prisma.laborCycle.update({
        where: { id: cycleId },
        data: { endsAt: newEndsAt, extendedCount: { increment: 1 } },
      }),
    ]);

    return { newEndsAt, altinSpent: LABOR_EXTEND_COST_ALTIN };
  },

  async instantRestart(playerId: string, type: LaborType) {
    const player = await prisma.player.findUniqueOrThrow({
      where: { id: playerId },
      select: { vipPlan: true, altinBalance: true },
    });

    const vipKey = player.vipPlan.toLowerCase() as keyof typeof LABOR_RESTART_COST;
    const cost = LABOR_RESTART_COST[vipKey];

    if (cost === null) throw new Error('Bu özellik premium kullanıcılara özeldir');
    if (player.altinBalance < cost) throw new Error('Yeterli Altın yok');

    const existing = await prisma.laborCycle.findFirst({
      where: { playerId, isActive: true },
    });
    if (existing) throw new Error('Aktif bir döngü zaten var');

    const durations = LABOR_DURATIONS[type];
    const durationMinutes = player.vipPlan !== 'FREE' ? durations.premium : durations.normal;
    const endsAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    await prisma.$transaction([
      prisma.player.update({
        where: { id: playerId },
        data: { altinBalance: { decrement: cost } },
      }),
      prisma.laborCycle.create({
        data: {
          playerId,
          type: SHARED_TO_PRISMA[type] as never,
          endsAt,
          akceReward: LABOR_REWARDS[type],
          isActive: true,
        },
      }),
    ]);

    return { cost, endsAt };
  },
};
