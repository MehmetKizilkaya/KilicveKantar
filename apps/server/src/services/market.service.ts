import { prisma } from '../config/prisma';
import { BASE_PRICES, AUCTION_FEE_PERCENT, MAX_AUCTION_LISTINGS } from '@kilic-ve-kantar/shared';
import type { Commodity } from '@kilic-ve-kantar/shared';

export const MarketService = {
  async getRegionPrices(regionId: string): Promise<Record<string, number>> {
    const orders = await prisma.marketOrder.findMany({
      where: { regionId, status: 'OPEN' },
      orderBy: { pricePerUnit: 'asc' },
    });

    const prices: Record<string, number> = { ...BASE_PRICES };

    // Simple supply/demand: lowest sell order sets price
    const sellOrders = orders.filter((o) => o.orderType === 'SELL');
    for (const order of sellOrders) {
      if (!prices[order.commodity] || order.pricePerUnit < prices[order.commodity]) {
        prices[order.commodity] = order.pricePerUnit;
      }
    }

    return prices;
  },

  async placeOrder(
    playerId: string,
    regionId: string,
    commodity: string,
    orderType: 'BUY' | 'SELL',
    quantity: number,
    pricePerUnit: number,
    currency: 'AKCE' | 'ALTIN',
  ) {
    const player = await prisma.player.findUniqueOrThrow({
      where: { id: playerId },
      select: { akceBalance: true, altinBalance: true },
    });

    if (orderType === 'BUY') {
      const totalCost = quantity * pricePerUnit;
      if (currency === 'AKCE' && player.akceBalance < totalCost) {
        throw new Error('Yeterli Akçe yok');
      }
      if (currency === 'ALTIN' && player.altinBalance < totalCost) {
        throw new Error('Yeterli Altın yok');
      }
    }

    if (orderType === 'SELL') {
      const inventory = await prisma.inventoryItem.findFirst({
        where: { playerId, commodity, regionId },
      });
      if (!inventory || inventory.quantity < quantity) {
        throw new Error('Envanterde yeterli mal yok');
      }
    }

    return prisma.marketOrder.create({
      data: {
        playerId,
        regionId,
        commodity,
        orderType,
        quantity,
        pricePerUnit,
        currency,
      },
    });
  },

  async getOpenOrders(regionId: string, commodity?: string) {
    return prisma.marketOrder.findMany({
      where: {
        regionId,
        status: 'OPEN',
        ...(commodity ? { commodity } : {}),
      },
      include: { player: { select: { username: true } } },
      orderBy: { pricePerUnit: 'asc' },
    });
  },

  async createAuction(
    playerId: string,
    itemType: string,
    itemData: Record<string, unknown>,
    startingPrice: number,
    buyNowPrice: number | null,
    currency: 'AKCE' | 'ALTIN',
    durationHours: number,
  ) {
    const player = await prisma.player.findUniqueOrThrow({
      where: { id: playerId },
      select: { vipPlan: true },
    });

    const vipKey = player.vipPlan.toLowerCase() as keyof typeof MAX_AUCTION_LISTINGS;
    const maxListings = MAX_AUCTION_LISTINGS[vipKey];

    const activeCount = await prisma.auctionListing.count({
      where: { sellerId: playerId, status: 'ACTIVE' },
    });
    if (activeCount >= maxListings) {
      throw new Error(`Maksimum ${maxListings} aktif ilan açabilirsiniz`);
    }

    const endsAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

    return prisma.auctionListing.create({
      data: {
        sellerId: playerId,
        itemType,
        itemData,
        startingPrice,
        buyNowPrice,
        currency,
        currentBid: 0,
        endsAt,
      },
    });
  },

  async placeBid(playerId: string, listingId: string, amount: number) {
    const listing = await prisma.auctionListing.findUniqueOrThrow({
      where: { id: listingId },
    });

    if (listing.status !== 'ACTIVE') throw new Error('İlan artık aktif değil');
    if (listing.endsAt < new Date()) throw new Error('İlan süresi doldu');
    if (listing.sellerId === playerId) throw new Error('Kendi ilanınıza teklif veremezsiniz');
    if (amount <= listing.currentBid) {
      throw new Error(`Mevcut tekliften (${listing.currentBid}) yüksek bir teklif giriniz`);
    }

    const player = await prisma.player.findUniqueOrThrow({
      where: { id: playerId },
      select: { akceBalance: true, altinBalance: true },
    });

    if (listing.currency === 'AKCE' && player.akceBalance < amount) {
      throw new Error('Yeterli Akçe yok');
    }

    return prisma.auctionListing.update({
      where: { id: listingId },
      data: { currentBid: amount, currentBidder: playerId },
    });
  },

  async getActiveAuctions(page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [listings, total] = await Promise.all([
      prisma.auctionListing.findMany({
        where: { status: 'ACTIVE', endsAt: { gt: new Date() } },
        include: { seller: { select: { username: true } } },
        orderBy: { endsAt: 'asc' },
        skip,
        take: pageSize,
      }),
      prisma.auctionListing.count({
        where: { status: 'ACTIVE', endsAt: { gt: new Date() } },
      }),
    ]);
    return { listings, total, pages: Math.ceil(total / pageSize) };
  },
};
