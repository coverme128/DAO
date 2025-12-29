'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { AvatarState } from '@/lib/store/chat-store';

interface AvatarModelProps {
  state: AvatarState;
}

export default function AvatarModel({ state }: AvatarModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mouthOpenness = useRef(0);

  // TODO: Load VRM model
  // For MVP, use a placeholder or simple geometry
  useEffect(() => {
    // Placeholder: In production, load VRM model here
    // const loader = new VRMLoaderPlugin();
    // loader.load('/models/acoda.vrm', (vrm) => {
    //   scene.add(vrm.scene);
    // });
  }, []);

  // Animate mouth based on state
  useFrame(() => {
    if (state === 'speaking') {
      // Simple mouth animation (RMS-driven in production)
      mouthOpenness.current = Math.sin(Date.now() * 0.01) * 0.3 + 0.3;
    } else if (state === 'listening') {
      mouthOpenness.current = 0.1;
    } else {
      mouthOpenness.current = 0;
    }
  });

  // Placeholder geometry
  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      <mesh>
        <boxGeometry args={[0.5, 1.5, 0.3]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      {/* Simple head */}
      <mesh position={[0, 0.75, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      {/* Mouth indicator */}
      <mesh position={[0, 0.65, 0.3]}>
        <boxGeometry args={[0.1, mouthOpenness.current * 0.1, 0.05]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

