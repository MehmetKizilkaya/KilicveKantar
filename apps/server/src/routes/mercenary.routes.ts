import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { MercenaryService } from '../services/mercenary.service';

const router = Router();
router.use(authenticate);

// Get own mercenary profile
router.get('/my-profile', async (req: AuthRequest, res) => {
  const profile = await MercenaryService.getMyProfile(req.playerId!);
  res.json(profile ?? null);
});

// Get own contracts (as employer or mercenary)
router.get('/my-contracts', async (req: AuthRequest, res) => {
  const contracts = await MercenaryService.getMyContracts(req.playerId!);
  res.json(contracts);
});

const profileSchema = z.object({
  specialization: z.array(z.string()).min(1).max(5),
  dailyRateAkce: z.number().int().min(100),
  dailyRateAltin: z.number().int().min(0),
  description: z.string().max(500).default(''),
});

const contractOfferSchema = z.object({
  mercenaryId: z.string().min(1),
  type: z.enum([
    'DAILY_RAID',
    'DEFENSE_PACT',
    'RECONNAISSANCE',
    'FACTION_ALLIANCE',
    'SPECIAL_MISSION',
  ]),
  durationDays: z.number().int().min(1).max(30),
  totalAkce: z.number().int().min(0),
  totalAltin: z.number().int().min(0).default(0),
});

// Browse available mercenaries
router.get('/', async (req: AuthRequest, res) => {
  const page = Number(req.query.page) || 1;
  const spec = req.query.specialization as string | undefined;
  const maxRate = req.query.maxRate ? Number(req.query.maxRate) : undefined;
  const result = await MercenaryService.listAvailable(spec, maxRate, page);
  res.json(result);
});

// Create/update own mercenary profile
router.put('/profile', async (req: AuthRequest, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message });
    return;
  }
  try {
    const profile = await MercenaryService.createProfile(
      req.playerId!,
      parsed.data.specialization,
      parsed.data.dailyRateAkce,
      parsed.data.dailyRateAltin,
      parsed.data.description,
    );
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Send a contract offer
router.post('/contracts', async (req: AuthRequest, res) => {
  const parsed = contractOfferSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message });
    return;
  }
  try {
    const contract = await MercenaryService.sendContractOffer(
      req.playerId!,
      parsed.data.mercenaryId,
      parsed.data.type,
      parsed.data.durationDays,
      parsed.data.totalAkce,
      parsed.data.totalAltin,
    );
    res.status(201).json(contract);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Accept/reject a contract
router.post('/contracts/:id/respond', async (req: AuthRequest, res) => {
  const accept = Boolean(req.body.accept);
  try {
    const contract = await MercenaryService.respondToContract(
      req.playerId!,
      req.params.id,
      accept,
    );
    res.json(contract);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Rate a completed contract
router.post('/contracts/:id/rate', async (req: AuthRequest, res) => {
  const rating = Number(req.body.rating);
  if (!rating || rating < 1 || rating > 5) {
    res.status(400).json({ error: '1-5 arası bir puan giriniz' });
    return;
  }
  try {
    await MercenaryService.rateContract(req.playerId!, req.params.id, rating);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export { router as mercenaryRouter };
