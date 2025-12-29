'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useChatStore } from '@/lib/store/chat-store';
import AvatarModel from './AvatarModel';

export default function Avatar() {
  const { avatarState } = useChatStore();

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 1.6, 2.5]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-5, 5, -5]} intensity={0.5} />
          <AvatarModel state={avatarState} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Canvas>
      </Suspense>

      {/* Status indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm font-medium">
          {avatarState === 'idle' && 'Ready'}
          {avatarState === 'listening' && 'Listening...'}
          {avatarState === 'thinking' && 'Thinking...'}
          {avatarState === 'speaking' && 'Speaking...'}
        </div>
      </div>
    </div>
  );
}

