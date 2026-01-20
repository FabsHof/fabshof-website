import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FlyingSaucerProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

export function FlyingSaucer({ position, rotation }: FlyingSaucerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const saucerRef = useRef<THREE.Group>(null);

  // Gentle hovering animation
  useFrame((state) => {
    if (saucerRef.current) {
      saucerRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <group ref={saucerRef}>
        {/* Simple UFO disc - single piece */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[1.5, 1.8, 0.4, 16]} />
          <meshLambertMaterial
            color="#FFFFFF"
          />
        </mesh>

        {/* Large glass canopy dome on top - centered and sized to match top disc */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshLambertMaterial
            color="#0066CC"
            transparent={true}
            opacity={0.9}
          />
        </mesh>

        {/* Bottom lights - arranged in a circle */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 1.4;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
          const color = colors[i % colors.length];

          return (
            <group key={i}>
              <mesh position={[x, -0.15, z]} castShadow>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshLambertMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.5}
                />
              </mesh>
              <pointLight
                position={[x, -0.15, z]}
                color={color}
                intensity={1.5}
                distance={3}
              />
            </group>
          );
        })}

        {/* UFO glow light underneath */}
        <pointLight
          position={[0, -0.5, 0]}
          color="#00FFFF"
          intensity={3}
          distance={6}
        />
      </group>
    </group>
  );
}
