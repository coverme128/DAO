import express, { Request, Response } from 'express';
import { z } from 'zod';
import { ttsProvider } from '../services/tts';

const router = express.Router();

const ttsRequestSchema = z.object({
  text: z.string(),
  voice: z.string().optional(),
  rate: z.number().optional(),
  pitch: z.number().optional(),
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = ttsRequestSchema.parse(req.body);

    const result = await ttsProvider.speak(validated.text, {
      voice: validated.voice,
      rate: validated.rate,
      pitch: validated.pitch,
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    return res.send(result.audio);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }

    console.error('TTS error:', error);
    return res.status(500).json({ error: 'TTS processing failed' });
  }
});

export default router;


