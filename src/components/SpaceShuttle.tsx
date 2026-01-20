import { useRef } from 'react';
import { Group, Mesh } from 'three';
import { useFrame } from '@react-three/fiber';

interface SpaceShuttleProps {
  position: [number, number, number];
  rotation: number;
}

export function SpaceShuttle({ position, rotation }: SpaceShuttleProps) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      groupRef.current.rotation.y = rotation;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main body - fuselage */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.6, 0.4, 1.8]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cockpit */}
      <mesh position={[0, 0.8, 0.5]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.6]} />
        <meshStandardMaterial color="#f0f0f0" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Wings */}
      <mesh position={[-0.8, 0.4, -0.2]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[1, 0.1, 1]} />
        <meshStandardMaterial color="#ffffff" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.8, 0.4, -0.2]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[1, 0.1, 1]} />
        <meshStandardMaterial color="#ffffff" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Tail fin */}
      <mesh position={[0, 0.9, -0.9]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Engine nozzles */}
      <mesh position={[-0.25, 0.4, -0.9]} castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.3, 8]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.25, 0.4, -0.9]} castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.3, 8]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Engine glow effect */}
      <pointLight position={[0, 0.4, -1.1]} color="#00d4ff" intensity={1.5} distance={3} />
    </group>
  );
}
