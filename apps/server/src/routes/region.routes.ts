import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { MarketService } from '../services/market.service';

const router = Router();

// Public: get all regions (for map)
router.get('/', async (_req, res) => {
  const regions = await prisma.region.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      type: true,
      morale: true,
      economicValue: true,
      militaryValue: true,
      isUnderSiege: true,
      specialResource: true,
      svgPathId: true,
      neighborIds: true,
      factionId: true,
      governorId: true,
      faction: { select: { name: true, tag: true } },
      governor: { select: { username: true } },
    },
  });
  res.json(regions);
});

// Public: get single region
router.get('/:id', async (req, res) => {
  try {
    const region = await prisma.region.findUniqueOrThrow({
      where: { id: req.params.id },
      include: {
        stats: true,
        faction: { select: { name: true, tag: true } },
        governor: { select: { id: true, username: true } },
      },
    });
    res.json(region);
  } catch {
    res.status(404).json({ error: 'Bölge bulunamadı' });
  }
});

// Get market prices for a region
router.get('/:id/prices', async (req, res) => {
  const prices = await MarketService.getRegionPrices(req.params.id);
  res.json(prices);
});

// Get open market orders for a region
router.get('/:id/orders', async (req, res) => {
  const orders = await MarketService.getOpenOrders(req.params.id, req.query.commodity as string);
  res.json(orders);
});

// Set home region (authenticated)
router.post('/:id/set-home', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.player.update({
      where: { id: req.playerId },
      data: { homeRegionId: req.params.id },
    });
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: 'Bölge ayarlanamadı' });
  }
});

export { router as regionRouter };
