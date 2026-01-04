'use client';

import { Suspense, useState, useEffect } from 'react';
import { useChatStore } from '@/lib/store/chat-store';

// Lazy load Three.js components only on client
let Canvas: any;
let OrbitControls: any;
let PerspectiveCamera: any;
let AvatarModel: any;

export default function Avatar() {
  const { avatarState } = useChatStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Dynamically import Three.js components only on client
    if (typeof window !== 'undefined') {
      Promise.all([
        import('@react-three/fiber').then((mod) => { Canvas = mod.Canvas; }),
        import('@react-three/drei').then((mod) => {
          OrbitControls = mod.OrbitControls;
          PerspectiveCamera = mod.PerspectiveCamera;
        }),
        import('./AvatarModel').then((mod) => { AvatarModel = mod.default; }),
      ]).then(() => {
        setIsLoaded(true);
      }).catch((error) => {
        console.error('Failed to load Three.js components:', error);
      });
    }
  }, []);

  if (!isMounted || !isLoaded) {
    return (
      <div className="relative w-full h-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500 dark:text-gray-400">Loading Avatar...</div>
        </div>
      </div>
    );
  }

  if (!Canvas || !AvatarModel) {
    return (
      <div className="relative w-full h-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500 dark:text-gray-400">Avatar unavailable</div>
        </div>
      </div>
    );
  }

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

