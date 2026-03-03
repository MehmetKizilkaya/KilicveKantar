import { prisma } from '../config/prisma';
import { TRAVEL_TIMES, TRAVEL_ENERGY_COST } from '@kilic-ve-kantar/shared';

export const TravelService = {
  async startTravel(playerId: string, destinationRegionId: string) {
    const player = await prisma.player.findUniqueOrThrow({
      where: { id: playerId },
      select: {
        energy: true,
        currentRegionId: true,
        travelEndsAt: true,
        currentRegion: { select: { neighborIds: true } },
      },
    });

    if (player.travelEndsAt && player.travelEndsAt > new Date()) {
      throw new Error('Zaten seyahatte olduğunuz sürece yeni bir seyahat başlatamazsınız');
    }
    if (player.energy < TRAVEL_ENERGY_COST) {
      throw new Error(`Seyahat için ${TRAVEL_ENERGY_COST} enerji gereklidir`);
    }
    if (player.currentRegionId === destinationRegionId) {
      throw new Error('Zaten bu şehirdesiniz');
    }

    const destination = await prisma.region.findUniqueOrThrow({
      where: { id: destinationRegionId },
      select: { id: true, name: true },
    });

    const neighborIds: string[] = player.currentRegion?.neighborIds ?? [];
    const isNeighbor = neighborIds.includes(destinationRegionId);
    const durationMs = isNeighbor ? TRAVEL_TIMES.NEIGHBOR : TRAVEL_TIMES.DISTANT;
    const travelEndsAt = new Date(Date.now() + durationMs);

    await prisma.player.update({
      where: { id: playerId },
      data: {
        destinationRegionId,
        travelStartsAt: new Date(),
        travelEndsAt,
        energy: { decrement: TRAVEL_ENERGY_COST },
      },
    });

    return {
      destinationRegionId,
      destinationName: destination.name,
      travelEndsAt,
      durationMinutes: durationMs / 60000,
      isNeighbor,
    };
  },

  async getStatus(playerId: string) {
    const player = await prisma.player.findUniqueOrThrow({
      where: { id: playerId },
      select: {
        currentRegionId: true,
        currentRegion: { select: { id: true, name: true, code: true } },
        destinationRegionId: true,
        destinationRegion: { select: { id: true, name: true, code: true } },
        travelStartsAt: true,
        travelEndsAt: true,
      },
    });

    const isTraveling = !!player.travelEndsAt && player.travelEndsAt > new Date();

    return {
      currentRegion: player.currentRegion,
      destination: isTraveling ? player.destinationRegion : null,
      travelStartsAt: player.travelStartsAt,
      travelEndsAt: player.travelEndsAt,
      isTraveling,
      remainingMs: isTraveling
        ? player.travelEndsAt!.getTime() - Date.now()
        : 0,
    };
  },

  // Called by tick engine — resolves all arrived travelers
  async resolveArrivals() {
    const arrived = await prisma.player.findMany({
      where: {
        travelEndsAt: { lte: new Date() },
        destinationRegionId: { not: null },
      },
      select: { id: true, destinationRegionId: true },
    });

    for (const player of arrived) {
      await prisma.player.update({
        where: { id: player.id },
        data: {
          currentRegionId: player.destinationRegionId,
          destinationRegionId: null,
          travelStartsAt: null,
          travelEndsAt: null,
        },
      });
    }

    return arrived.length;
  },
};
