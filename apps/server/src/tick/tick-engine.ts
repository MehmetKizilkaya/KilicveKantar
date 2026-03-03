import Queue from 'bull';
import { redis } from '../config/redis';
import { prisma } from '../config/prisma';
import { TICK_INTERVALS, ENERGY_REGEN, MAX_ENERGY } from '@kilic-ve-kantar/shared';
import type { Server } from 'socket.io';

let io: Server;
export function setSocketIo(socketIo: Server) {
  io = socketIo;
}

// ─── Queues ───────────────────────────────────────────────────────────────────

export const microTickQueue = new Queue('micro-tick', { redis: { enableReadyCheck: false } });
export const macroTickQueue = new Queue('macro-tick', { redis: { enableReadyCheck: false } });
export const warTickQueue = new Queue('war-tick', { redis: { enableReadyCheck: false } });

// ─── Scheduler ───────────────────────────────────────────────────────────────

export async function startTickEngine() {
  console.log('⚙️  Tick engine başlatılıyor...');

  // Schedule recurring jobs
  await microTickQueue.add({}, { repeat: { every: TICK_INTERVALS.MICRO }, removeOnComplete: 5 });
  await macroTickQueue.add({}, { repeat: { every: TICK_INTERVALS.MACRO }, removeOnComplete: 5 });
  await warTickQueue.add({}, { repeat: { every: TICK_INTERVALS.WAR }, removeOnComplete: 5 });

  // Process handlers
  microTickQueue.process(processMicroTick);
  macroTickQueue.process(processMacroTick);
  warTickQueue.process(processWarTick);

  console.log('✅ Tick engine hazır');
}

// ─── MicroTick (15 min) ───────────────────────────────────────────────────────

async function processMicroTick() {
  const now = new Date().toISOString();
  console.log(`[MicroTick] ${now}`);

  await Promise.all([
    regenerateEnergy(),
    checkCompletedLaborCycles(),
    checkExpiredAuctions(),
  ]);

  io?.emit('tick:micro', now);
}

async function regenerateEnergy() {
  // Energy regens per hour — micro tick is 15 min = 0.25 hour
  // Batch update: only players below max
  const vipGroups = [
    { plan: 'FREE', regenPer15Min: Math.round(ENERGY_REGEN.free / 4), max: MAX_ENERGY.free },
    { plan: 'TRADER', regenPer15Min: Math.round(ENERGY_REGEN.trader / 4), max: MAX_ENERGY.trader },
    { plan: 'COMMANDER', regenPer15Min: Math.round(ENERGY_REGEN.commander / 4), max: MAX_ENERGY.commander },
    { plan: 'SULTAN', regenPer15Min: Math.round(ENERGY_REGEN.sultan / 4), max: MAX_ENERGY.sultan },
  ];

  for (const group of vipGroups) {
    await prisma.$executeRaw`
      UPDATE "Player"
      SET energy = LEAST(energy + ${group.regenPer15Min}, ${group.max})
      WHERE "vipPlan" = ${group.plan}::"VipPlan"
        AND energy < ${group.max}
    `;
  }
}

async function checkCompletedLaborCycles() {
  const completed = await prisma.laborCycle.findMany({
    where: { isActive: true, endsAt: { lte: new Date() }, collected: false },
    include: { player: { select: { id: true } } },
  });

  for (const cycle of completed) {
    // Notify player via socket
    io?.to(`player:${cycle.playerId}`).emit('labor:completed', {
      cycleId: cycle.id,
      reward: cycle.akceReward,
    });

    // Sultan VIP auto-chain: automatically collect and start new cycle
    const player = await prisma.player.findUnique({
      where: { id: cycle.playerId },
      select: { vipPlan: true },
    });
    if (player?.vipPlan === 'SULTAN') {
      await prisma.$transaction([
        prisma.laborCycle.update({
          where: { id: cycle.id },
          data: { isActive: false, collected: true, collectedAt: new Date() },
        }),
        prisma.player.update({
          where: { id: cycle.playerId },
          data: { akceBalance: { increment: cycle.akceReward } },
        }),
      ]);
      // Auto-chain deduct 3 Altin and start new cycle
      const costAltin = 3;
      await prisma.player.update({
        where: { id: cycle.playerId },
        data: { altinBalance: { decrement: costAltin } },
      });
      const durationMs = cycle.endsAt.getTime() - cycle.startedAt.getTime();
      await prisma.laborCycle.create({
        data: {
          playerId: cycle.playerId,
          type: cycle.type,
          endsAt: new Date(Date.now() + durationMs),
          akceReward: cycle.akceReward,
          isActive: true,
        },
      });
    }
  }
}

async function checkExpiredAuctions() {
  const expired = await prisma.auctionListing.findMany({
    where: { status: 'ACTIVE', endsAt: { lte: new Date() } },
  });

  for (const listing of expired) {
    if (listing.currentBidder && listing.currentBid > 0) {
      // Transfer item to winner, money to seller
      const fee = Math.ceil(listing.currentBid * (AUCTION_FEE_PERCENT / 100));
      const sellerGets = listing.currentBid - fee;

      await prisma.$transaction([
        prisma.auctionListing.update({
          where: { id: listing.id },
          data: { status: 'SOLD' },
        }),
        prisma.player.update({
          where: { id: listing.sellerId },
          data: listing.currency === 'AKCE'
            ? { akceBalance: { increment: sellerGets } }
            : { altinBalance: { increment: sellerGets } },
        }),
      ]);

      io?.to(`player:${listing.currentBidder}`).emit('auction:won', {
        listingId: listing.id,
        winnerId: listing.currentBidder,
        finalPrice: listing.currentBid,
      });
      io?.to(`player:${listing.sellerId}`).emit('notification', {
        id: `auc-sold-${listing.id}`,
        playerId: listing.sellerId,
        type: 'auction_won',
        title: 'İlan Satıldı',
        body: `İlanınız ${listing.currentBid} ${listing.currency} karşılığında satıldı.`,
        isRead: false,
        data: { listingId: listing.id },
        createdAt: new Date().toISOString(),
      });
    } else {
      await prisma.auctionListing.update({
        where: { id: listing.id },
        data: { status: 'EXPIRED' },
      });
    }
  }
}

const AUCTION_FEE_PERCENT = 2;

// ─── MacroTick (6h) ───────────────────────────────────────────────────────────

async function processMacroTick() {
  console.log('[MacroTick]', new Date().toISOString());

  await Promise.all([
    collectRegionTaxes(),
    updateFactionWeeklyPoints(),
  ]);
}

async function collectRegionTaxes() {
  const regions = await prisma.region.findMany({
    where: { governorId: { not: null } },
    include: { stats: true },
  });

  for (const region of regions) {
    if (!region.governorId || !region.stats) continue;
    const taxRevenue = Math.floor(region.economicValue * (region.stats.taxRate / 100));
    await prisma.player.update({
      where: { id: region.governorId },
      data: { akceBalance: { increment: taxRevenue } },
    });
  }
}

async function updateFactionWeeklyPoints() {
  const factions = await prisma.faction.findMany({
    include: { regions: true, members: true },
  });

  for (const faction of factions) {
    const regionPoints = faction.regions.length * 100;
    await prisma.faction.update({
      where: { id: faction.id },
      data: { weeklyPoints: { increment: regionPoints } },
    });
  }
}

// ─── WarTick (30 min) ─────────────────────────────────────────────────────────

async function processWarTick() {
  console.log('[WarTick]', new Date().toISOString());

  const activeWars = await prisma.war.findMany({
    where: { status: 'ACTIVE' },
    include: {
      targetRegion: { include: { stats: true } },
    },
  });

  for (const war of activeWars) {
    const defenseBonus = (war.targetRegion.stats?.defenseLevel ?? 1) * 10;
    const garrisonPower = war.targetRegion.stats?.garrisonSize ?? 0;
    const defenderPower = garrisonPower + defenseBonus + war.defenderPower;
    const attackerPower = war.attackerPower;

    io?.emit('war:tick_result', {
      warId: war.id,
      attackerPower,
      defenderPower,
    });

    // Resolution: attacker needs 20% more power to advance
    if (attackerPower > defenderPower * 1.5) {
      // Attacker wins
      await prisma.$transaction([
        prisma.war.update({
          where: { id: war.id },
          data: { status: 'FINISHED', result: 'ATTACKER_WINS', endsAt: new Date() },
        }),
        prisma.region.update({
          where: { id: war.targetRegionId },
          data: {
            governorId: war.attackerPlayerId,
            factionId: war.attackerFactionId,
          },
        }),
      ]);

      const autoNews = await prisma.autoNewsEvent.create({
        data: {
          type: 'region_captured',
          title: `${war.targetRegion.name} El Değiştirdi!`,
          body: `Şiddetli çatışmaların ardından ${war.targetRegion.name} yeni bir yönetici altına girdi.`,
          involvedPlayerIds: [war.attackerPlayerId],
          involvedRegionIds: [war.targetRegionId],
        },
      });

      io?.emit('region:captured', {
        regionId: war.targetRegionId,
        newOwnerId: war.attackerPlayerId,
        newOwnerName: '',
      });
      io?.emit('news:published', {
        id: autoNews.id,
        title: autoNews.title,
        type: 'war_ended',
      });
    } else if (defenderPower > attackerPower * 1.5) {
      // Defender wins
      await prisma.war.update({
        where: { id: war.id },
        data: { status: 'FINISHED', result: 'DEFENDER_WINS', endsAt: new Date() },
      });
    }
    // else: war continues
  }
}
