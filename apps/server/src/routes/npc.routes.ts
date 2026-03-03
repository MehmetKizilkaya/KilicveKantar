import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { NpcService } from '../services/npc.service';

const router = Router();

// Public: list NPC orders for a region
router.get('/:regionId', async (req, res) => {
  const orders = await NpcService.getOrders(req.params.regionId);
  res.json(orders);
});

const tradeSchema = z.object({
  commodity: z.string().min(1),
  quantity: z.number().int().min(1),
});

// Authenticated: buy from NPC
router.post('/:regionId/buy', authenticate, async (req: AuthRequest, res) => {
  const parsed = tradeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message });
    return;
  }
  try {
    const result = await NpcService.buyFromNpc(
      req.playerId!,
      req.params.regionId,
      parsed.data.commodity,
      parsed.data.quantity,
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Authenticated: sell to NPC
router.post('/:regionId/sell', authenticate, async (req: AuthRequest, res) => {
  const parsed = tradeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message });
    return;
  }
  try {
    const result = await NpcService.sellToNpc(
      req.playerId!,
      req.params.regionId,
      parsed.data.commodity,
      parsed.data.quantity,
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export { router as npcRouter };
