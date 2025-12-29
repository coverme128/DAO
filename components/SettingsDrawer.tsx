'use client';

import { useState } from 'react';
import { useChatStore } from '@/lib/store/chat-store';
import { api } from '@/lib/config';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { userId } = useChatStore();
  const [activeTab, setActiveTab] = useState<'voice-input' | 'voice-output' | 'memory' | 'safety' | 'account'>('voice-input');
  const [memorySummary, setMemorySummary] = useState<string>('');

  const handleLoadMemory = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${api.memory}?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMemorySummary(data.summary || '');
      }
    } catch (error) {
      console.error('Failed to load memory:', error);
    }
  };

  const handleClearMemory = async () => {
    if (!userId) return;
    if (confirm('Are you sure you want to clear all memory?')) {
      try {
        const response = await fetch(api.memory, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        if (response.ok) {
          setMemorySummary('');
        }
      } catch (error) {
        console.error('Failed to clear memory:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          {[
            { id: 'voice-input', label: 'Voice Input' },
            { id: 'voice-output', label: 'Voice Output' },
            { id: 'memory', label: 'Memory' },
            { id: 'safety', label: 'Safety' },
            { id: 'account', label: 'Account' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'voice-input' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Microphone
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option>Default Microphone</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Input Volume
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {activeTab === 'voice-output' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  TTS Voice
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option>Azure Neural Voice (Default)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Speech Rate
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  defaultValue="1"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Volume
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="80"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {activeTab === 'memory' && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Acoda remembers a short summary of recent chats to provide context in conversations.
                </p>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={handleLoadMemory}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    View Summary
                  </button>
                  <button
                    onClick={handleClearMemory}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Clear Memory
                  </button>
                </div>
                {memorySummary && (
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {memorySummary || 'No memory summary available.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Important Guidelines
                </h3>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                  <li>• Acoda is an AI companion, not a real person</li>
                  <li>• Acoda does not provide medical, legal, or financial advice</li>
                  <li>• For crisis situations, please seek professional help</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subscription
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Current plan: Free
                </p>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Upgrade to Pro
                </button>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <button className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  Delete My Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

