'use client';

import { useEffect } from 'react';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import ChatPanel from '@/components/ChatPanel';
import { useChatStore } from '@/lib/store/chat-store';
import { api } from '@/lib/config';

export default function Home() {
  const { userId, sessionId, setUserId, setSessionId, setUsage } = useChatStore();

  useEffect(() => {
    // Initialize user and session
    const initialize = async () => {
      if (!userId) {
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
          const usageResponse = await fetch(api.usage.check, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
          });

          if (usageResponse.ok) {
            const usageData = await usageResponse.json();
            setUsage(usageData);
          }

          // Create session
          const sessionResponse = await fetch(api.sessions, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
          });

          if (sessionResponse.ok) {
            const session = await sessionResponse.json();
            setSessionId(session.id);
          }
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
