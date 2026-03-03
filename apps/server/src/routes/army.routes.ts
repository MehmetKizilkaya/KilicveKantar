import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { ArmyService } from '../services/army.service';

const router = Router();
router.use(authenticate);

const recruitSchema = z.object({
  unitType: z.enum(['INFANTRY', 'CAVALRY', 'ARTILLERY']),
  count: z.number().int().min(1).max(100),
});

const moveSchema = z.object({
  unitId: z.string().min(1),
  destinationRegionId: z.string().min(1),
});

const attackSchema = z.object({
  targetRegionId: z.string().min(1),
  units: z.object({
    INFANTRY:  z.number().int().min(0).optional(),
    CAVALRY:   z.number().int().min(0).optional(),
    ARTILLERY: z.number().int().min(0).optional(),
  }),
});

router.get('/', async (req: AuthRequest, res) => {
  const units = await ArmyService.getArmy(req.playerId!);
  res.json(units);
});

router.post('/recruit', async (req: AuthRequest, res) => {
  const parsed = recruitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message });
    return;
  }
  try {
    const result = await ArmyService.recruit(req.playerId!, parsed.data.unitType, parsed.data.count);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/move', async (req: AuthRequest, res) => {
  const parsed = moveSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message });
    return;
  }
  try {
    const unit = await ArmyService.moveUnits(req.playerId!, parsed.data.unitId, parsed.data.destinationRegionId);
    res.json(unit);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/attack', async (req: AuthRequest, res) => {
  const parsed = attackSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message });
    return;
  }
  try {
    const result = await ArmyService.attack(
      req.playerId!,
      parsed.data.targetRegionId,
      parsed.data.units as Record<'INFANTRY' | 'CAVALRY' | 'ARTILLERY', number>,
    );
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.get('/sieges', async (_req: AuthRequest, res) => {
  const sieges = await ArmyService.getActiveSieges();
  res.json(sieges);
});

export { router as armyRouter };
