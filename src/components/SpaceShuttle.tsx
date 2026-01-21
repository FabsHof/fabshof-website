import { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface SpaceShuttleProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

export function SpaceShuttle({ position, rotation }: SpaceShuttleProps) {
  const groupRef = useRef<THREE.Group>(null);
  // In Vite, assets are resolved relative to src or use absolute paths without /src
  const { scene } = useGLTF('/assets/Space Shuttle (D).glb');

  // Clone the scene to avoid reusing the same instance
  const clonedScene = scene.clone();

  // Ensure materials are properly set up
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Ensure materials are visible
        if (mesh.material) {
          const material = mesh.material as THREE.MeshStandardMaterial;
          if (material.isMeshStandardMaterial) {
            material.needsUpdate = true;
          }
        }
      }
    });
  }, [clonedScene]);

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Rotate -90° on Z-axis to make the shuttle point upward */}
      <primitive object={clonedScene} scale={0.003} rotation={[Math.PI / 2, Math.PI, Math.PI / 2]} />
      {/* Add a light to illuminate the shuttle */}
      <pointLight position={[0, 2, 0]} intensity={1} color="#ffffff" />
    </group>
  );
}

// Preload the model
useGLTF.preload('/assets/Space Shuttle (D).glb');
