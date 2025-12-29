// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  asr: `${API_BASE_URL}/api/asr`,
  chat: `${API_BASE_URL}/api/chat`,
  tts: `${API_BASE_URL}/api/tts`,
  usage: {
    check: `${API_BASE_URL}/api/usage/check`,
    consumeVoice: `${API_BASE_URL}/api/usage/consume-voice`,
  },
  sessions: `${API_BASE_URL}/api/sessions`,
  users: `${API_BASE_URL}/api/users`,
  memory: `${API_BASE_URL}/api/memory`,
  stripe: {
    webhook: `${API_BASE_URL}/api/stripe/webhook`,
  },
};

