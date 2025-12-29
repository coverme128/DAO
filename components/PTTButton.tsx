'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/store/chat-store';
import { api } from '@/lib/config';

export default function PTTButton() {
  const [isPressed, setIsPressed] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const {
    sessionId,
    userId,
    setAvatarState,
    setIsRecording,
    addMessage,
    setUsage,
  } = useChatStore();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processRecording(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAvatarState('listening');
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Microphone permission denied. Please enable microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    if (!sessionId || !userId) return;

    setAvatarState('thinking');

    try {
      // Check usage
      const usageResponse = await fetch(api.usage.consumeVoice, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!usageResponse.ok) {
        const usageData = await usageResponse.json();
        if (!usageData.allowed) {
          alert(`Daily limit reached. Remaining: ${usageData.remaining}`);
          setAvatarState('idle');
          return;
        }
        setUsage(usageData);
      }

      // ASR
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const asrResponse = await fetch(api.asr, {
        method: 'POST',
        body: formData,
      });

      if (!asrResponse.ok) throw new Error('ASR failed');

      const asrData = await asrResponse.json();
      const userText = asrData.text;

      if (!userText || userText.includes('placeholder')) {
        throw new Error('ASR returned no text');
      }

      addMessage({ role: 'user', content: userText });

      // Chat
      const chatResponse = await fetch(api.chat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId,
          userText,
        }),
      });

      if (!chatResponse.ok) throw new Error('Chat failed');

      const chatData = await chatResponse.json();
      addMessage({ role: 'assistant', content: chatData.assistantText });

      // TTS
      setAvatarState('speaking');
      const ttsResponse = await fetch(api.tts, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: chatData.assistantText }),
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
      console.error('Processing error:', error);
      setAvatarState('idle');
      alert('Couldn\'t process that—try again.');
    }
  };

  const handleMouseDown = () => {
    setIsPressed(true);
    startRecording();
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    stopRecording();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isPressed) {
      setIsPressed(false);
      stopRecording();
      setAvatarState('idle');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown as any);
    return () => window.removeEventListener('keydown', handleKeyDown as any);
  }, [isPressed]);

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
        isPressed
          ? 'bg-red-500 scale-110 shadow-lg'
          : 'bg-blue-500 hover:bg-blue-600'
      }`}
      aria-label="Push to talk"
    >
      <svg
        className="w-8 h-8 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}

