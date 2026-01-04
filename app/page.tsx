'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import ChatPanel from '@/components/ChatPanel';
import { useChatStore } from '@/lib/store/chat-store';
import { api } from '@/lib/config';

// Dynamically import Avatar with SSR disabled (Three.js requires client-side only)
// Use a wrapper component to ensure it only renders on client
const Avatar = dynamic(
  () => import('@/components/Avatar').then((mod) => ({ default: mod.default })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-gray-500 dark:text-gray-400">Loading Avatar...</div>
      </div>
    ),
  }
);

export default function Home() {
  const { userId, sessionId, setUserId, setSessionId, setUsage } = useChatStore();

  useEffect(() => {
    // Initialize user and session
    const initialize = async () => {
      if (!userId) {
        try {
          // Create or get user (anonymous for MVP)
          const response = await fetch(api.users, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });
          
          if (response.ok) {
            const user = await response.json();
            setUserId(user.id);

            // Check usage
            try {
              const usageResponse = await fetch(api.usage.check, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
              });

              if (usageResponse.ok) {
                const usageData = await usageResponse.json();
                setUsage(usageData);
              }
            } catch (error) {
              console.error('Failed to check usage:', error);
            }

            // Create session
            try {
              const sessionResponse = await fetch(api.sessions, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
              });

              if (sessionResponse.ok) {
                const session = await sessionResponse.json();
                setSessionId(session.id);
              }
            } catch (error) {
              console.error('Failed to create session:', error);
            }
          } else {
            console.error('Failed to create user:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Failed to initialize:', error);
          console.error('API URL:', api.users);
          console.error('Make sure backend is running on http://localhost:3001');
        }
      }
    };

    initialize();
  }, [userId, setUserId, setSessionId, setUsage]);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Avatar */}
        <div className="w-2/3 border-r border-gray-200 dark:border-gray-800">
          <Avatar />
        </div>
        {/* Right: Chat Panel */}
        <div className="w-1/3">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}
