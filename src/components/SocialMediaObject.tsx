import { useRef, useState } from 'react';
import { Group } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';

interface SocialMediaObjectProps {
  position: [number, number, number];
  type: 'linkedin' | 'github';
  url: string;
  shuttlePosition: [number, number, number];
}

export function SocialMediaObject({ position, type, shuttlePosition }: SocialMediaObjectProps) {
  const groupRef = useRef<Group>(null);
  const labelGroupRef = useRef<Group>(null);
  const hintGroupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [proximityGlow, setProximityGlow] = useState(0);
  const { camera } = useThree();

  useFrame((state, delta) => {
    if (groupRef.current) {
      setRotation((prev) => prev + delta * 0.5);
      groupRef.current.rotation.y = rotation;

      // Floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }

    // Calculate distance to shuttle for proximity-based glow
    const dx = shuttlePosition[0] - position[0];
    const dz = shuttlePosition[2] - position[2];
    const distance = Math.sqrt(dx * dx + dz * dz);

    // Glow intensity increases as shuttle gets closer (max distance 15 units)
    const maxGlowDistance = 15;
    const glowStrength = Math.max(0, 1 - distance / maxGlowDistance);
    setProximityGlow(glowStrength);

    // Make text labels face the camera (billboard effect)
    if (labelGroupRef.current) {
      labelGroupRef.current.quaternion.copy(camera.quaternion);
    }
    if (hintGroupRef.current) {
      hintGroupRef.current.quaternion.copy(camera.quaternion);
    }
  });

  const isLinkedIn = type === 'linkedin';
  const color = isLinkedIn ? '#0077B5' : '#24292e';
  const label = isLinkedIn ? 'LinkedIn' : 'GitHub';

  // Calculate combined glow intensity
  const baseEmissive = 0.05;
  const hoverEmissive = 0.15;
  const proximityEmissive = proximityGlow * 0.6;
  const totalEmissive = baseEmissive + (hovered ? hoverEmissive : 0) + proximityEmissive;

  const baseLightIntensity = 0.3;
  const hoverLightIntensity = 1.0;
  const proximityLightIntensity = proximityGlow * 5;
  const totalLightIntensity = baseLightIntensity + (hovered ? hoverLightIntensity : 0) + proximityLightIntensity;

  // Calculate proximity-based scale
  const baseScale = 0.5;
  const proximityScale = proximityGlow * 0.8;
  const hoverScale = hovered ? 0.2 : 0;
  const totalScale = baseScale + proximityScale + hoverScale;

  return (
    <group position={position}>
      <group
        ref={groupRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={totalScale}
      >
        {/* Circular badge background - rotated 90° so it faces outward */}
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.15, 32]} />
          <meshStandardMaterial
            color={color}
            metalness={0.4}
            roughness={0.6}
            emissive={color}
            emissiveIntensity={totalEmissive}
          />
        </mesh>

        {/* Badge rim */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.05, 16, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.8}
            roughness={0.2}
            emissive="#ffffff"
            emissiveIntensity={0.1}
          />
        </mesh>

        {isLinkedIn ? (
          // LinkedIn "in" text - on front face of badge
          <Text
            position={[0, 0, 0.08]}
            rotation={[0, 0, 0]}
            fontSize={0.55}
            color="white"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            in
          </Text>
        ) : (
          // GitHub octocat - simplified, on front face of badge
          <group position={[0, 0, 0.08]} rotation={[0, 0, 0]}>
            {/* Head circle */}
            <mesh>
              <circleGeometry args={[0.35, 32]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* Left ear */}
            <mesh position={[-0.25, 0.32, 0.01]}>
              <circleGeometry args={[0.12, 3]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* Right ear */}
            <mesh position={[0.25, 0.32, 0.01]}>
              <circleGeometry args={[0.12, 3]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* Body */}
            <mesh position={[0, -0.35, 0]}>
              <circleGeometry args={[0.25, 32]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        )}
      </group>

      {/* Glow effect */}
      <pointLight color={color} intensity={totalLightIntensity} distance={8} />

      {/* Floating text label */}
      <group ref={labelGroupRef} position={[0, 2.5, 0]}>
        <Text
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {label}
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

      {/* Clickable hint when hovered */}
      {hovered && (
        <group ref={hintGroupRef} position={[0, -1.2, 0]}>
          <Text
            fontSize={0.2}
            color="#4a90e2"
            anchorX="center"
            anchorY="middle"
          >
            Click to visit
          </Text>
        </group>
      )}
    </group>
  );
}
