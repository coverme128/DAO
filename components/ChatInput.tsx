'use client';

import { useState, KeyboardEvent } from 'react';
import { useChatStore } from '@/lib/store/chat-store';
import { api } from '@/lib/config';

export default function ChatInput() {
  const [input, setInput] = useState('');
  const { sessionId, userId, addMessage, setAvatarState } = useChatStore();

  const handleSend = async () => {
    if (!input.trim() || !sessionId || !userId) return;

    const userText = input.trim();
    setInput('');
    addMessage({ role: 'user', content: userText });

    setAvatarState('thinking');

    try {
      const response = await fetch(api.chat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId,
          userText,
        }),
      });

      if (!response.ok) throw new Error('Chat failed');

      const data = await response.json();
      addMessage({ role: 'assistant', content: data.assistantText });

      // TTS
      setAvatarState('speaking');
      const ttsResponse = await fetch(api.tts, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.assistantText }),
      });

      if (ttsResponse.ok) {
        const audioBlob = await ttsResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setAvatarState('idle');
        };

        await audio.play();
      } else {
        setAvatarState('idle');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setAvatarState('idle');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder="Type a message..."
      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

