import express, { Request, Response } from 'express';
import { z } from 'zod';
import { sessionService } from '../services/session';

const router = express.Router();

const createSessionSchema = z.object({
  userId: z.string(),
});

// Create session
router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = createSessionSchema.parse(req.body);
    const session = await sessionService.createSession({
      userId: validated.userId,
    });

    return res.json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }

    console.error('Session creation error:', error);
    return res.status(500).json({ error: 'Session creation failed' });
  }
});

// Get session
router.get('/', async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const session = await sessionService.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.json(session);
  } catch (error) {
    console.error('Session fetch error:', error);
    return res.status(500).json({ error: 'Session fetch failed' });
  }
});

export default router;


