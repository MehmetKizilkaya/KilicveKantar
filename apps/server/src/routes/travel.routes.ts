import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { TravelService } from '../services/travel.service';

const router = Router();
router.use(authenticate);

const startSchema = z.object({
  destinationRegionId: z.string().min(1),
});

router.post('/start', async (req: AuthRequest, res) => {
  const parsed = startSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message });
    return;
  }
  try {
    const result = await TravelService.startTravel(req.playerId!, parsed.data.destinationRegionId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.get('/status', async (req: AuthRequest, res) => {
  try {
    const status = await TravelService.getStatus(req.playerId!);
    res.json(status);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export { router as travelRouter };
