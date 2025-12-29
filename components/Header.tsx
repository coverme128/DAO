'use client';

import { useState } from 'react';
import { useChatStore } from '@/lib/store/chat-store';
import SettingsDrawer from './SettingsDrawer';

export default function Header() {
  const { usage } = useChatStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Acoda
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {usage && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Plan: <span className="font-semibold">{usage.plan}</span>
              </span>
              {usage.plan === 'FREE' && usage.remaining >= 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Remaining: <span className="font-semibold">{usage.remaining}</span>
                </span>
              )}
            </div>
          )}

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Settings
          </button>
        </div>
      </header>

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}

