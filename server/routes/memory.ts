import express, { Request, Response } from 'express';
import { z } from 'zod';
import { memoryService } from '../services/memory';
import { billingService } from '../services/billing';

const router = express.Router();

// Get memory
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const plan = await billingService.getUserPlan(userId);
    const summary = await memoryService.getMemorySummary(userId);

    return res.json({ summary });
  } catch (error) {
    console.error('Memory fetch error:', error);
    return res.status(500).json({ error: 'Memory fetch failed' });
  }
});

// Clear memory
router.delete('/', async (req: Request, res: Response) => {
  try {
    const { userId } = z.object({ userId: z.string() }).parse(req.body);

    await memoryService.clearMemory(userId);

    return res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }

    console.error('Memory clear error:', error);
    return res.status(500).json({ error: 'Memory clear failed' });
  }
});

export default router;


