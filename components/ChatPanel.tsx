'use client';

import { useChatStore } from '@/lib/store/chat-store';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import PTTButton from './PTTButton';

export default function ChatPanel() {
  const { messages } = useChatStore();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-end gap-3">
          <ChatInput />
          <PTTButton />
        </div>
      </div>
    </div>
  );
}


