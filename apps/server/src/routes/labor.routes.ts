import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { LaborService } from '../services/labor.service';

const router = Router();
router.use(authenticate);

const laborTypeSchema = z.enum(['basic_worker', 'craftsman', 'trader', 'soldier']);

router.get('/active', async (req: AuthRequest, res) => {
  const cycle = await LaborService.getActiveCycle(req.playerId!);
  res.json({ cycle });
});

router.post('/start', async (req: AuthRequest, res) => {
  const parsed = laborTypeSchema.safeParse(req.body.type);
  if (!parsed.success) {
    res.status(400).json({ error: 'Geçersiz çalışma türü' });
    return;
  }

  try {
    const cycle = await LaborService.startCycle(req.playerId!, parsed.data);
    res.status(201).json({ cycle });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/:cycleId/collect', async (req: AuthRequest, res) => {
  try {
    const result = await LaborService.collect(req.playerId!, req.params.cycleId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/:cycleId/extend', async (req: AuthRequest, res) => {
  try {
    const result = await LaborService.extendCycle(req.playerId!, req.params.cycleId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/instant-restart', async (req: AuthRequest, res) => {
  const parsed = laborTypeSchema.safeParse(req.body.type);
  if (!parsed.success) {
    res.status(400).json({ error: 'Geçersiz çalışma türü' });
    return;
  }

  try {
    const result = await LaborService.instantRestart(req.playerId!, parsed.data);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export { router as laborRouter };
