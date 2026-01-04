// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Get project root - try multiple methods
let projectRoot = process.cwd();

// If cwd ends with 'server', go up one level
if (projectRoot.endsWith('server') || projectRoot.endsWith('server/')) {
  projectRoot = path.resolve(projectRoot, '..');
}

const envLocalPath = path.resolve(projectRoot, '.env.local');
const envPath = path.resolve(projectRoot, '.env');

// Debug: Log paths and loading status
console.log('📁 process.cwd():', process.cwd());
console.log('📁 Project root:', projectRoot);
console.log('📄 .env.local path:', envLocalPath);
console.log('📄 File exists:', fs.existsSync(envLocalPath));

const envLocalResult = dotenv.config({ path: envLocalPath });
if (envLocalResult.error) {
  console.warn('⚠️  Warning: Could not load .env.local:', envLocalResult.error.message);
} else {
  console.log('✅ Loaded .env.local');
  if (envLocalResult.parsed) {
    console.log('   Found', Object.keys(envLocalResult.parsed).length, 'variables');
  }
}

const envResult = dotenv.config({ path: envPath, override: false });
if (envResult.error && envResult.error.code !== 'ENOENT') {
  console.warn('⚠️  Warning: Could not load .env:', envResult.error.message);
}

// Verify critical environment variables
console.log('🔍 Verifying environment variables...');
console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✓' : '✗');
console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ (' + process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...)' : '✗');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables!');
}

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

import asrRoutes from './routes/asr';
import chatRoutes from './routes/chat';
import ttsRoutes from './routes/tts';
import usageRoutes from './routes/usage';
import sessionRoutes from './routes/sessions';
import userRoutes from './routes/users';
import memoryRoutes from './routes/memory';
import stripeRoutes from './routes/stripe';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Stripe webhook needs raw body, so handle it before json parser
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/asr', asrRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/stripe', stripeRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});

export default app;

