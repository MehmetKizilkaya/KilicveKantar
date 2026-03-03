import { prisma } from '../config/prisma';

export const NpcService = {
  async getOrders(regionId: string) {
    return prisma.npcOrder.findMany({
      where: { regionId },
      orderBy: { commodity: 'asc' },
    });
  },

  // Player buys from NPC (NPC sells)
  async buyFromNpc(playerId: string, regionId: string, commodity: string, quantity: number) {
    if (quantity < 1) throw new Error('Geçersiz miktar');

    const order = await prisma.npcOrder.findUnique({
      where: { regionId_commodity: { regionId, commodity } },
    });
    if (!order) throw new Error('Bu ürün bu şehirde satılmıyor');
    if (order.stock < quantity) throw new Error(`Yeterli stok yok. Mevcut: ${order.stock}`);

    const totalCost = order.buyPrice * quantity;

    const player = await prisma.player.findUniqueOrThrow({
      where: { id: playerId },
      select: { akceBalance: true, currentRegionId: true },
    });
    if (player.currentRegionId !== regionId) {
      throw new Error('Bu şehirde değilsiniz');
    }
    if (player.akceBalance < totalCost) {
      throw new Error(`Yeterli Akçe yok. Gerekli: ${totalCost}`);
    }

    await prisma.$transaction([
      prisma.npcOrder.update({
        where: { regionId_commodity: { regionId, commodity } },
        data: { stock: { decrement: quantity } },
      }),
      prisma.player.update({
        where: { id: playerId },
        data: { akceBalance: { decrement: totalCost } },
      }),
      prisma.inventoryItem.upsert({
        where: { playerId_commodity_regionId: { playerId, commodity, regionId } },
        update: { quantity: { increment: quantity } },
        create: { playerId, commodity, quantity, regionId },
      }),
    ]);

    return { commodity, quantity, totalCost, remainingStock: order.stock - quantity };
  },

  // Player sells to NPC (NPC buys)
  async sellToNpc(playerId: string, regionId: string, commodity: string, quantity: number) {
    if (quantity < 1) throw new Error('Geçersiz miktar');

    const order = await prisma.npcOrder.findUnique({
      where: { regionId_commodity: { regionId, commodity } },
    });
    if (!order) throw new Error('Bu ürünü bu şehirde satın alan NPC yok');

    const player = await prisma.player.findUniqueOrThrow({
      where: { id: playerId },
      select: { currentRegionId: true },
    });
    if (player.currentRegionId !== regionId) {
      throw new Error('Bu şehirde değilsiniz');
    }

    const inventory = await prisma.inventoryItem.findFirst({
      where: { playerId, commodity },
    });
    if (!inventory || inventory.quantity < quantity) {
      throw new Error(`Envanterde yeterli ${commodity} yok`);
    }

    const totalEarned = order.sellPrice * quantity;

    await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id: inventory.id },
        data: { quantity: { decrement: quantity } },
      }),
      prisma.player.update({
        where: { id: playerId },
        data: { akceBalance: { increment: totalEarned } },
      }),
      prisma.npcOrder.update({
        where: { regionId_commodity: { regionId, commodity } },
        data: { stock: { increment: quantity } },
      }),
    ]);

    return { commodity, quantity, totalEarned };
  },

  // Called by tick engine — refresh NPC stocks
  async refreshStocks() {
    // Use raw update: stock = LEAST(stock + refreshAmount, maxStock)
    await prisma.$executeRaw`
      UPDATE "NpcOrder"
      SET stock = LEAST(stock + "refreshAmount", "maxStock")
      WHERE stock < "maxStock"
    `;
  },
};
