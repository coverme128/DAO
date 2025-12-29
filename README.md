# Acoda - AI Companion

A warm and gentle AI companion web application featuring 3D avatar, voice interaction, and conversational AI.

## Features

- 🎭 **3D Avatar**: Interactive VRM-based 3D character with state animations (idle, listening, thinking, speaking)
- 🎤 **Voice Interaction**: Push-to-talk (PTT) voice input with ASR (Automatic Speech Recognition)
- 💬 **Conversational AI**: Powered by Azure OpenAI with memory context
- 🔊 **Text-to-Speech**: Natural voice output with mouth synchronization
- 💾 **Memory System**: Context-aware conversations with configurable memory retention
- 💳 **Subscription Model**: Free (10 voice messages/day) and Pro (unlimited) plans
- ⚙️ **Settings Panel**: Comprehensive settings for voice, memory, safety, and account

## Tech Stack

### Frontend
- **Next.js 16** - React framework
- **Three.js** - 3D graphics and VRM loading
- **React Three Fiber** - React renderer for Three.js
- **Zustand** - State management
- **Tailwind CSS** - Styling

### Backend (Node.js)
- **Express.js** - HTTP server framework
- **Supabase** - Database and backend services
- **Supabase Client** - Database operations
- **Azure Speech Services** - ASR and TTS
- **Azure OpenAI** - LLM for conversations (integrated)
- **Stripe** - Payment processing

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account (for PostgreSQL database)
- Azure Speech Services account
- Azure OpenAI account
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DAO
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` with your credentials:

**Supabase:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (bypasses RLS)
- `SUPABASE_ANON_KEY` - Anonymous key (for client-side)

**Azure:**
- `AZURE_SPEECH_KEY` - Azure Speech Services key
- `AZURE_SPEECH_REGION` - Azure region
- `AZURE_OPENAI_API_KEY` - Azure OpenAI API key
- `AZURE_OPENAI_ENDPOINT` - Azure OpenAI endpoint
- `AZURE_OPENAI_DEPLOYMENT_NAME` - Deployment name

**Stripe:**
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

**Server:**
- `PORT` - Backend server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS
- `NEXT_PUBLIC_API_URL` - Backend API URL (for frontend)

4. Set up the database:
   - Go to Supabase Dashboard > SQL Editor
   - Run the SQL script from `supabase/migrations/001_initial_schema.sql`
   - This will create all necessary tables and indexes

5. Run the development servers (frontend + backend):
```bash
npm run dev
```

This will start:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3001](http://localhost:3001)

Or run them separately:
```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

## Project Structure

```
├── server/               # Node.js backend
│   ├── index.ts          # Express server entry
│   ├── routes/           # API routes
│   │   ├── asr.ts        # Speech-to-text endpoint
│   │   ├── chat.ts       # Chat/LLM endpoint
│   │   ├── tts.ts        # Text-to-speech endpoint
│   │   ├── usage.ts      # Usage tracking endpoints
│   │   ├── sessions.ts   # Session management
│   │   ├── users.ts      # User management
│   │   ├── memory.ts     # Memory management
│   │   └── stripe.ts     # Stripe webhooks
│   ├── services/         # Business logic services
│   │   ├── session.ts
│   │   ├── memory.ts
│   │   ├── usage.ts
│   │   ├── billing.ts
│   │   ├── orchestrator.ts
│   │   ├── asr.ts
│   │   └── tts.ts
│   └── lib/              # Shared utilities
│       ├── prisma.ts     # Prisma client
│       └── supabase.ts   # Supabase client
├── app/                  # Next.js frontend
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── components/           # React components
│   ├── Avatar.tsx        # 3D avatar container
│   ├── AvatarModel.tsx   # VRM model loader
│   ├── ChatPanel.tsx     # Chat interface
│   ├── PTTButton.tsx     # Push-to-talk button
│   ├── SettingsDrawer.tsx # Settings panel
│   └── ...
├── lib/
│   ├── store/            # Zustand stores
│   └── config.ts         # API configuration
└── prisma/
    └── schema.prisma     # Database schema
```

## Core Workflow

1. **User presses PTT button** → Starts recording
2. **Recording stops** → Audio sent to `/api/asr`
3. **ASR returns text** → Displayed in chat
4. **Text sent to `/api/chat`** → LLM generates response
5. **Response sent to `/api/tts`** → Audio generated
6. **Audio played** → Avatar animates mouth, shows "Speaking" state

## API Endpoints (Backend Server)

All endpoints are served by the Node.js backend at `http://localhost:3001`:

- `POST /api/asr` - Convert audio to text
- `POST /api/chat` - Generate AI response
- `POST /api/tts` - Convert text to speech
- `POST /api/usage/consume-voice` - Consume voice quota
- `POST /api/usage/check` - Check remaining quota
- `POST /api/sessions` - Create session
- `GET /api/sessions?sessionId=xxx` - Get session
- `POST /api/users` - Create/get user
- `GET /api/memory?userId=xxx` - Get memory summary
- `DELETE /api/memory` - Clear memory
- `POST /api/stripe/webhook` - Stripe webhook handler
- `GET /health` - Health check

## Database Schema

- **User** - User accounts and subscription plans
- **Session** - Conversation sessions
- **Message** - Individual messages (user/assistant)
- **Memory** - Context summaries with expiration
- **Usage** - Daily voice usage tracking

## Development

### Database Management

All database operations are done through Supabase:
- Use Supabase Dashboard > Table Editor to view data
- Use Supabase Dashboard > SQL Editor to run queries
- Database schema is defined in `supabase/migrations/001_initial_schema.sql`

### Environment Variables

See `env.example` for all required environment variables.

## Deployment

### Frontend (Vercel)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL
3. Deploy

### Backend (Node.js Server)

Deploy to any Node.js hosting service (Railway, Render, Fly.io, etc.):

1. Set all environment variables
2. Run `npm run build:backend` to build
3. Start with `npm run start:backend`

### Database (Supabase)

1. Create a Supabase project
2. Get API keys from Supabase Dashboard > Settings > API
3. Run the SQL migration script from `supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor
4. Update `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your environment

## TODO / Future Enhancements

- [ ] Implement full Azure Speech SDK integration
- [ ] Implement Azure OpenAI integration
- [ ] Add VRM model loading and viseme support
- [ ] Implement streaming ASR/TTS
- [ ] Add emotion detection and avatar reactions
- [ ] Implement user authentication
- [ ] Add conversation history UI
- [ ] Implement memory summary generation with LLM

## License

[Your License Here]

## Support

For issues and questions, please open an issue on GitHub.
