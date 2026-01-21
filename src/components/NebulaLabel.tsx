import { useRef, useMemo } from 'react';
import { Group, SphereGeometry, MeshBasicMaterial } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';

interface NebulaLabelProps {
  position: [number, number, number];
  label: string;
  color?: string;
}

// Shared geometries - created once and reused across all instances
const sharedOuterSphereGeometry = new SphereGeometry(3, 12, 12); // Reduced from 32 segments
const sharedMiddleSphereGeometry = new SphereGeometry(2.5, 12, 12);
const sharedInnerSphereGeometry = new SphereGeometry(2, 12, 12);

export function NebulaLabel({ position, label, color = '#667eea' }: NebulaLabelProps) {
  const groupRef = useRef<Group>(null);
  const { camera } = useThree();

  // Memoize materials since they depend on color prop
  const materials = useMemo(() => ({
    outer: new MeshBasicMaterial({ color, transparent: true, opacity: 0.08 }),
    middle: new MeshBasicMaterial({ color, transparent: true, opacity: 0.1 }),
    inner: new MeshBasicMaterial({ color, transparent: true, opacity: 0.12 })
  }), [color]);

  // Billboard effect - always face camera
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group position={position}>
      {/* Nebula glow effect - multiple overlapping transparent spheres */}
      <mesh geometry={sharedOuterSphereGeometry} material={materials.outer} />
      <mesh geometry={sharedMiddleSphereGeometry} material={materials.middle} />
      <mesh geometry={sharedInnerSphereGeometry} material={materials.inner} />

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
        >
          {label}
        </Text>
      </group>
    </group>
  );
}
