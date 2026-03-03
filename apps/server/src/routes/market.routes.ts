import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { MarketService } from '../services/market.service';

const router = Router();
router.use(authenticate);

const orderSchema = z.object({
  regionId: z.string().min(1),
  commodity: z.string().min(1),
  orderType: z.enum(['BUY', 'SELL']),
  quantity: z.number().int().positive(),
  pricePerUnit: z.number().int().positive(),
  currency: z.enum(['AKCE', 'ALTIN']).default('AKCE'),
});

const auctionSchema = z.object({
  itemType: z.string().min(1),
  itemData: z.record(z.unknown()),
  startingPrice: z.number().int().positive(),
  buyNowPrice: z.number().int().positive().nullable().optional(),
  currency: z.enum(['AKCE', 'ALTIN']).default('AKCE'),
  durationHours: z.enum([4, 12, 24, 48]).default(24),
});

const bidSchema = z.object({
  amount: z.number().int().positive(),
});

// Place a market order
router.post('/orders', async (req: AuthRequest, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message });
    return;
  }
  try {
    const order = await MarketService.placeOrder(
      req.playerId!,
      parsed.data.regionId,
      parsed.data.commodity,
      parsed.data.orderType,
      parsed.data.quantity,
      parsed.data.pricePerUnit,
      parsed.data.currency,
    );
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Cancel own market order
router.delete('/orders/:id', async (req: AuthRequest, res) => {
  try {
    const order = await import('../config/prisma').then(({ prisma }) =>
      prisma.marketOrder.findFirst({
        where: { id: req.params.id, playerId: req.playerId },
      }),
    );
    if (!order) { res.status(404).json({ error: 'İlan bulunamadı' }); return; }

    const { prisma } = await import('../config/prisma');
    await prisma.marketOrder.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: 'İlan iptal edilemedi' });
  }
});

// Create auction
router.post('/auctions', async (req: AuthRequest, res) => {
  const parsed = auctionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message });
    return;
  }
  try {
    const listing = await MarketService.createAuction(
      req.playerId!,
      parsed.data.itemType,
      parsed.data.itemData,
      parsed.data.startingPrice,
      parsed.data.buyNowPrice ?? null,
      parsed.data.currency,
      parsed.data.durationHours,
    );
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// List active auctions
router.get('/auctions', async (req: AuthRequest, res) => {
  const page = Number(req.query.page) || 1;
  const result = await MarketService.getActiveAuctions(page);
  res.json(result);
});

// Place bid on auction
router.post('/auctions/:id/bid', async (req: AuthRequest, res) => {
  const parsed = bidSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Geçersiz teklif miktarı' });
    return;
  }
  try {
    const listing = await MarketService.placeBid(req.playerId!, req.params.id, parsed.data.amount);
    res.json(listing);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export { router as marketRouter };
