import express, { Request, Response } from 'express';
import { z } from 'zod';
import { orchestratorService } from '../services/orchestrator';

const router = express.Router();

const chatRequestSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  userText: z.string(),
  history: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })).optional(),
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = chatRequestSchema.parse(req.body);

    const result = await orchestratorService.processChat({
      userId: validated.userId,
      sessionId: validated.sessionId,
      userText: validated.userText,
      history: validated.history,
    });

    return res.json({
      assistantText: result.assistantText,
      controlTags: result.controlTags,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }

    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Chat processing failed' });
  }
});

export default router;


