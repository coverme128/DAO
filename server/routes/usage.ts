import express, { Request, Response } from 'express';
import { z } from 'zod';
import { usageService } from '../services/usage';
import { billingService } from '../services/billing';

const router = express.Router();

const userIdSchema = z.object({
  userId: z.string(),
});

// Check usage
router.post('/check', async (req: Request, res: Response) => {
  try {
    const validated = userIdSchema.parse(req.body);
    const plan = await billingService.getUserPlan(validated.userId);
    const result = await usageService.checkVoiceUsage(validated.userId, plan);

    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }

    console.error('Usage check error:', error);
    return res.status(500).json({ error: 'Usage check failed' });
  }
});

// Consume voice
router.post('/consume-voice', async (req: Request, res: Response) => {
  try {
    const validated = userIdSchema.parse(req.body);
    const plan = await billingService.getUserPlan(validated.userId);
    const result = await usageService.consumeVoice(validated.userId, plan);

    if (!result.allowed) {
      return res.status(403).json(result);
    }

    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }

    console.error('Usage consume error:', error);
    return res.status(500).json({ error: 'Usage check failed' });
  }
});

export default router;

