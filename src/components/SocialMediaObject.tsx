import { useRef, useState } from 'react';
import { Mesh, Group } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';

interface SocialMediaObjectProps {
  position: [number, number, number];
  type: 'linkedin' | 'github';
  url: string;
  shuttlePosition: [number, number, number];
}

export function SocialMediaObject({ position, type, url, shuttlePosition }: SocialMediaObjectProps) {
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

  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isLinkedIn = type === 'linkedin';
  const color = isLinkedIn ? '#0077B5' : '#333333';
  const label = isLinkedIn ? 'LinkedIn' : 'GitHub';

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
      <group
        ref={groupRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={totalScale}
      >
        {isLinkedIn ? (
          // LinkedIn logo - rounded square with "in" text
          <>
            {/* Background rounded square */}
            <mesh castShadow>
              <boxGeometry args={[1.4, 1.4, 0.15]} />
              <meshStandardMaterial
                color={color}
                metalness={0.3}
                roughness={0.7}
                emissive={color}
                emissiveIntensity={totalEmissive}
              />
            </mesh>

            {/* "in" text - styled like LinkedIn */}
            <Text
              position={[0, 0, 0.12]}
              fontSize={0.7}
              color="white"
              anchorX="center"
              anchorY="middle"
              letterSpacing={-0.05}
            >
              in
            </Text>
          </>
        ) : (
          // GitHub logo - flat rectangular dark icon
          <>
            {/* Background rounded square - dark theme */}
            <mesh castShadow>
              <boxGeometry args={[1.4, 1.4, 0.15]} />
              <meshStandardMaterial
                color="#24292e"
                metalness={0.3}
                roughness={0.7}
                emissive="#24292e"
                emissiveIntensity={totalEmissive}
              />
            </mesh>

            {/* GitHub cat logo - simplified white mark */}
            <group position={[0, 0, 0.12]}>
              {/* Main circle for head */}
              <mesh position={[0, 0.15, 0]}>
                <sphereGeometry args={[0.32, 32, 32]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>

              {/* Cat ears */}
              <mesh position={[-0.2, 0.42, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>
              <mesh position={[0.2, 0.42, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>

              {/* Body - rounded rectangle */}
              <mesh position={[0, -0.2, 0]}>
                <boxGeometry args={[0.5, 0.3, 0.05]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>

              {/* Arms */}
              <mesh position={[-0.3, -0.15, 0]} rotation={[0, 0, 0.5]}>
                <boxGeometry args={[0.12, 0.08, 0.05]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>
              <mesh position={[0.3, -0.15, 0]} rotation={[0, 0, -0.5]}>
                <boxGeometry args={[0.12, 0.08, 0.05]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>

              {/* Legs */}
              <mesh position={[-0.12, -0.42, 0]}>
                <boxGeometry args={[0.1, 0.12, 0.05]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>
              <mesh position={[0.12, -0.42, 0]}>
                <boxGeometry args={[0.1, 0.12, 0.05]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>
            </group>
          </>
        )}
      </group>

      {/* Glow effect with proximity-based intensity */}
      <pointLight color={color} intensity={totalLightIntensity} distance={8} />

      {/* Floating text label - always faces camera */}
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

      {/* Clickable hint when hovered - always faces camera */}
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
