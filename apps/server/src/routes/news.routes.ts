import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { ENERGY_COSTS } from '@kilic-ve-kantar/shared';

const router = Router();

// Public: get latest news feed
router.get('/feed', async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const [articles, autoEvents] = await Promise.all([
    prisma.newsArticle.findMany({
      where: { isApproved: true },
      include: { author: { select: { username: true, vipPlan: true } } },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.autoNewsEvent.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
  ]);

  // Merge and sort by date
  const playerItems = articles.map((a) => ({ ...a, source: 'player' as const }));
  const autoItems = autoEvents.map((e) => ({ ...e, source: 'auto' as const }));
  type MergedItem = typeof playerItems[number] | typeof autoItems[number];
  const getItemDate = (item: MergedItem): Date =>
    'publishedAt' in item ? item.publishedAt : item.createdAt;
  const merged: MergedItem[] = ([...playerItems, ...autoItems] as MergedItem[]).sort(
    (a, b) => getItemDate(b).getTime() - getItemDate(a).getTime(),
  );

  res.json(merged.slice(0, pageSize));
});

// Public: get single article
router.get('/:id', async (req, res) => {
  try {
    const article = await prisma.newsArticle.findUniqueOrThrow({
      where: { id: req.params.id, isApproved: true },
      include: { author: { select: { username: true } } },
    });
    await prisma.newsArticle.update({
      where: { id: req.params.id },
      data: { readCount: { increment: 1 } },
    });
    res.json(article);
  } catch {
    res.status(404).json({ error: 'Makale bulunamadı' });
  }
});

// Authenticated: write article
const articleSchema = z.object({
  title: z.string().min(5).max(150),
  content: z.string().min(50).max(10000),
  type: z.enum(['NEWS', 'COLUMN', 'PROPAGANDA', 'ADVERTISEMENT', 'INTERVIEW']),
  targetRegionId: z.string().optional(),
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  const parsed = articleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message });
    return;
  }

  try {
    const player = await prisma.player.findUniqueOrThrow({
      where: { id: req.playerId },
      select: { energy: true },
    });

    if (player.energy < ENERGY_COSTS.WRITE_ARTICLE) {
      res.status(400).json({ error: 'Yeterli enerji yok' });
      return;
    }

    const propagandaStrength =
      parsed.data.type === 'PROPAGANDA'
        ? Math.floor(Math.random() * 30) + 10
        : 0;

    const [article] = await prisma.$transaction([
      prisma.newsArticle.create({
        data: {
          authorId: req.playerId!,
          title: parsed.data.title,
          content: parsed.data.content,
          type: parsed.data.type,
          targetRegionId: parsed.data.targetRegionId,
          propagandaStrength,
          isApproved: true, // Auto-approve; add moderation queue later
        },
      }),
      prisma.player.update({
        where: { id: req.playerId },
        data: { energy: { decrement: ENERGY_COSTS.WRITE_ARTICLE } },
      }),
    ]);

    // Apply propaganda effect if applicable
    if (parsed.data.type === 'PROPAGANDA' && parsed.data.targetRegionId) {
      const moraleChange = -Math.ceil(propagandaStrength / 10);
      await prisma.region.update({
        where: { id: parsed.data.targetRegionId },
        data: { morale: { increment: moraleChange } },
      });
    }

    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Like an article
router.post('/:id/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const article = await prisma.newsArticle.update({
      where: { id: req.params.id },
      data: { likeCount: { increment: 1 } },
      select: { likeCount: true },
    });
    res.json(article);
  } catch {
    res.status(404).json({ error: 'Makale bulunamadı' });
  }
});

export { router as newsRouter };
