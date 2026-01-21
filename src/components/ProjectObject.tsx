import { useRef, useState, useMemo } from 'react';
import { Mesh, Group, SphereGeometry, CylinderGeometry, MeshStandardMaterial } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';

interface ProjectObjectProps {
  position: [number, number, number];
  title: string;
  color?: string;
  shuttlePosition: [number, number, number];
}

// Shared geometries - created once and reused across all instances
const sharedSphereGeometry = new SphereGeometry(1, 16, 16); // Reduced from 32 segments
const sharedPedestalGeometry = new CylinderGeometry(0.6, 0.8, 0.2, 8);

export function ProjectObject({
  position,
  title,
  color = '#4a90e2',
  shuttlePosition,
}: ProjectObjectProps) {
  const meshRef = useRef<Mesh>(null);
  const textGroupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  // Store mutable values in refs to avoid state updates in useFrame
  const rotationRef = useRef(0);
  // Use state for light intensity so it can be read during render
  const [lightIntensity, setLightIntensity] = useState(0.3);

  // Memoize materials
  const sphereMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: color,
        metalness: 0.3,
        roughness: 0.7,
        emissive: color,
        emissiveIntensity: 0.05,
      }),
    [color]
  );

  const pedestalMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#1a1a2e',
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.6,
      }),
    []
  );

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Update rotation directly on ref, no state update
      rotationRef.current += delta * 0.5;
      meshRef.current.rotation.y = rotationRef.current;

      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;

      // Calculate distance to shuttle for proximity-based glow
      const dx = shuttlePosition[0] - position[0];
      const dz = shuttlePosition[2] - position[2];
      const distance = Math.sqrt(dx * dx + dz * dz);

      // Glow intensity increases as shuttle gets closer (max distance 15 units)
      const glowStrength = Math.max(0, 1 - distance / 15);

      // Compute light intensity for point light and update state
      const baseLI = 0.3;
      const hoverLI = hovered ? 1.0 : 0;
      const proximityLI = glowStrength * 5;
      setLightIntensity(baseLI + hoverLI + proximityLI);

      // Update material emissive intensity on the actual mesh material (avoid mutating hook-created value)
      const baseEmissive = 0.05;
      const hoverEmissive = hovered ? 0.15 : 0;
      const proximityEmissive = glowStrength * 0.6;
      if (meshRef.current) {
        const mat = meshRef.current.material as MeshStandardMaterial;
        mat.emissiveIntensity = baseEmissive + hoverEmissive + proximityEmissive;
      }

      // Calculate scale
      const baseScale = 0.5;
      const proximityScale = glowStrength * 0.8;
      const hoverScale = hovered ? 0.2 : 0;
      const totalScale = baseScale + proximityScale + hoverScale;
      meshRef.current.scale.setScalar(totalScale);
    }

    // Make text face the camera (billboard effect)
    if (textGroupRef.current) {
      textGroupRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group position={position}>
      {/* Main object - planet sphere */}
      <mesh
        ref={meshRef}
        castShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        geometry={sharedSphereGeometry}
        material={sphereMaterial}
      />

      {/* Glow effect with proximity-based intensity */}
      <pointLight color={color} intensity={lightIntensity} distance={8} />

      {/* Floating text label - always faces camera */}
      <group ref={textGroupRef} position={[0, 2.5, 0]}>
        <Text
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {title}
        </Text>
      </group>

      {/* Base pedestal */}
      <mesh
        position={[0, -0.5, 0]}
        receiveShadow
        geometry={sharedPedestalGeometry}
        material={pedestalMaterial}
      />
    </group>
  );
}
