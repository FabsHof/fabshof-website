import { useRef, useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpaceShuttleProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

export function SpaceShuttle({ position, rotation }: SpaceShuttleProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/assets/Space Shuttle (D).glb');

  // Clone the scene once using useMemo
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Ensure materials are properly set up - only run once
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  // Bounce animation - store bounce offset directly without state
  useFrame((state) => {
    if (groupRef.current) {
      const bounce = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      groupRef.current.position.y = position[1] + bounce;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <primitive object={clonedScene} scale={0.003} rotation={[Math.PI / 2, Math.PI, Math.PI / 2]} />
      <pointLight position={[0, 2, 0]} intensity={1} color="#ffffff" />
    </group>
  );
}

// Preload the model
useGLTF.preload('/assets/Space Shuttle (D).glb');
