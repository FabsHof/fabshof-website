import { useRef } from 'react';
import { Group } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';

interface NebulaLabelProps {
  position: [number, number, number];
  label: string;
  color?: string;
}

export function NebulaLabel({ position, label, color = '#667eea' }: NebulaLabelProps) {
  const groupRef = useRef<Group>(null);
  const { camera } = useThree();

  // Billboard effect - always face camera
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group position={position}>
      {/* Nebula glow effect - multiple overlapping transparent spheres */}
      <mesh>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Point light for glow */}
      <pointLight color={color} intensity={2} distance={15} />

      {/* Label text */}
      <group ref={groupRef} position={[0, 0, 0]}>
        <Text
          fontSize={0.8}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
          font={undefined}
        >
          {label}
        </Text>
      </group>
    </group>
  );
}
