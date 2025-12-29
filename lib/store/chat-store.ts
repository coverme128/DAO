import { create } from 'zustand';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatState {
  userId: string | null;
  sessionId: string | null;
  messages: Message[];
  avatarState: AvatarState;
  isRecording: boolean;
  isPlaying: boolean;
  currentAudio: HTMLAudioElement | null;
  usage: {
    remaining: number;
    plan: 'FREE' | 'PRO';
  } | null;
}

interface ChatActions {
  setUserId: (userId: string) => void;
  setSessionId: (sessionId: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setAvatarState: (state: AvatarState) => void;
  setIsRecording: (isRecording: boolean) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentAudio: (audio: HTMLAudioElement | null) => void;
  setUsage: (usage: { remaining: number; plan: 'FREE' | 'PRO' }) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState & ChatActions>((set) => ({
  userId: null,
  sessionId: null,
  messages: [],
  avatarState: 'idle',
  isRecording: false,
  isPlaying: false,
  currentAudio: null,
  usage: null,

  setUserId: (userId) => set({ userId }),
  setSessionId: (sessionId) => set({ sessionId }),
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date(),
        },
      ],
    })),
  setAvatarState: (state) => set({ avatarState: state }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentAudio: (audio) => set({ currentAudio: audio }),
  setUsage: (usage) => set({ usage }),
  clearMessages: () => set({ messages: [] }),
}));

