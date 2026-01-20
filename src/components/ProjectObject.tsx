import { useRef, useState } from 'react';
import { Mesh, Group } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';

interface ProjectObjectProps {
  position: [number, number, number];
  title: string;
  color?: string;
  shuttlePosition: [number, number, number];
}

export function ProjectObject({ position, title, color = '#4a90e2', shuttlePosition }: ProjectObjectProps) {
  const meshRef = useRef<Mesh>(null);
  const textGroupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [proximityGlow, setProximityGlow] = useState(0);
  const { camera } = useThree();

  useFrame((state, delta) => {
    if (meshRef.current) {
      setRotation((prev) => prev + delta * 0.5);
      meshRef.current.rotation.y = rotation;

      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }

    // Calculate distance to shuttle for proximity-based glow
    const dx = shuttlePosition[0] - position[0];
    const dz = shuttlePosition[2] - position[2];
    const distance = Math.sqrt(dx * dx + dz * dz);

    // Glow intensity increases as shuttle gets closer (max distance 15 units)
    const maxGlowDistance = 15;
    const glowStrength = Math.max(0, 1 - distance / maxGlowDistance);
    setProximityGlow(glowStrength);

    // Make text face the camera (billboard effect)
    if (textGroupRef.current) {
      textGroupRef.current.quaternion.copy(camera.quaternion);
    }
  });

  // Calculate combined glow intensity (very minimal by default)
  const baseEmissive = 0.05;
  const hoverEmissive = 0.15;
  const proximityEmissive = proximityGlow * 0.6;
  const totalEmissive = baseEmissive + (hovered ? hoverEmissive : 0) + proximityEmissive;

  const baseLightIntensity = 0.3;
  const hoverLightIntensity = 1.0;
  const proximityLightIntensity = proximityGlow * 5;
  const totalLightIntensity = baseLightIntensity + (hovered ? hoverLightIntensity : 0) + proximityLightIntensity;

  // Calculate proximity-based scale (smaller by default, grows when approaching)
  const baseScale = 0.5;
  const proximityScale = proximityGlow * 0.8;
  const hoverScale = hovered ? 0.2 : 0;
  const totalScale = baseScale + proximityScale + hoverScale;

  return (
    <group position={position}>
      {/* Main object - planet sphere */}
      <mesh
        ref={meshRef}
        castShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={totalScale}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.7}
          emissive={color}
          emissiveIntensity={totalEmissive}
        />
      </mesh>

      {/* Glow effect with proximity-based intensity */}
      <pointLight color={color} intensity={totalLightIntensity} distance={8} />

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
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <cylinderGeometry args={[0.6, 0.8, 0.2, 8]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}
