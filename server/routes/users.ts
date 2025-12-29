import express, { Request, Response } from 'express';
import { z } from 'zod';
import { billingService } from '../services/billing';

const router = express.Router();

const createUserSchema = z.object({
  email: z.string().email().optional(),
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = createUserSchema.parse(req.body);
    const user = await billingService.createOrGetUser(validated.email);

    return res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }

    console.error('User creation error:', error);
    return res.status(500).json({ error: 'User creation failed' });
  }
});

export default router;

