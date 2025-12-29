import express, { Request, Response } from 'express';
import multer from 'multer';
import { asrProvider } from '../services/asr';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioBuffer = Buffer.from(req.file.buffer);
    const result = await asrProvider.transcribe(audioBuffer);

    return res.json({ text: result.text });
  } catch (error) {
    console.error('ASR error:', error);
    return res.status(500).json({ error: 'ASR processing failed' });
  }
});

export default router;


