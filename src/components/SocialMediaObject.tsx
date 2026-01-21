import { useRef, useState, useMemo } from 'react';
import { Group, CylinderGeometry, TorusGeometry, CircleGeometry, MeshStandardMaterial, Mesh } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';

interface SocialMediaObjectProps {
  position: [number, number, number];
  type: 'linkedin' | 'github';
  url: string;
  shuttlePosition: [number, number, number];
}

// Shared geometries - created once and reused across all instances
const sharedBadgeGeometry = new CylinderGeometry(0.8, 0.8, 0.15, 16); // Reduced from 32 segments
const sharedRimGeometry = new TorusGeometry(0.8, 0.05, 8, 16); // Reduced segments
const sharedPedestalGeometry = new CylinderGeometry(0.6, 0.8, 0.2, 8);
const sharedHeadGeometry = new CircleGeometry(0.35, 16); // Reduced from 32
const sharedEarGeometry = new CircleGeometry(0.12, 3);
const sharedBodyGeometry = new CircleGeometry(0.25, 16); // Reduced from 32

// Shared materials that don't change
const whiteMaterial = new MeshStandardMaterial({ color: '#ffffff' });
const rimMaterial = new MeshStandardMaterial({
  color: '#ffffff',
  metalness: 0.8,
  roughness: 0.2,
  emissive: '#ffffff',
  emissiveIntensity: 0.1
});
const pedestalMaterial = new MeshStandardMaterial({
  color: '#1a1a2e',
  metalness: 0.9,
  roughness: 0.1,
  transparent: true,
  opacity: 0.6
});

export function SocialMediaObject({ position, type, shuttlePosition }: SocialMediaObjectProps) {
  const groupRef = useRef<Group>(null);
  const badgeMeshRef = useRef<Mesh>(null);
  const labelGroupRef = useRef<Group>(null);
  const hintGroupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  // Store mutable values in refs to avoid state updates in useFrame
  const rotationRef = useRef(0);
  // Use state for light intensity so it can be read during render
  const [lightIntensity, setLightIntensity] = useState(0.3);

  const isLinkedIn = type === 'linkedin';
  const color = isLinkedIn ? '#0077B5' : '#24292e';
  const label = isLinkedIn ? 'LinkedIn' : 'GitHub';

  // Memoize badge material (color-dependent)
  const badgeMaterial = useMemo(() => new MeshStandardMaterial({
    color: color,
    metalness: 0.4,
    roughness: 0.6,
    emissive: color,
    emissiveIntensity: 0.05
  }), [color]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Update rotation directly on ref, no state update
      rotationRef.current += delta * 0.5;
      groupRef.current.rotation.y = rotationRef.current;

      // Floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;

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

      // Update material emissive intensity on the badge mesh material
      const baseEmissive = 0.05;
      const hoverEmissive = hovered ? 0.15 : 0;
      const proximityEmissive = glowStrength * 0.6;
      if (badgeMeshRef.current) {
        const mat = badgeMeshRef.current.material as MeshStandardMaterial;
        mat.emissiveIntensity = baseEmissive + hoverEmissive + proximityEmissive;
      }

      // Calculate and apply scale
      const baseScale = 0.5;
      const proximityScale = glowStrength * 0.8;
      const hoverScale = hovered ? 0.2 : 0;
      const totalScale = baseScale + proximityScale + hoverScale;
      groupRef.current.scale.setScalar(totalScale);
    }

    // Make text labels face the camera (billboard effect)
    if (labelGroupRef.current) {
      labelGroupRef.current.quaternion.copy(camera.quaternion);
    }
    if (hintGroupRef.current) {
      hintGroupRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group position={position}>
      <group
        ref={groupRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Circular badge background - rotated 90 so it faces outward */}
        <mesh
          ref={badgeMeshRef}
          castShadow
          rotation={[Math.PI / 2, 0, 0]}
          geometry={sharedBadgeGeometry}
          material={badgeMaterial}
        />

        {/* Badge rim */}
        <mesh
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          geometry={sharedRimGeometry}
          material={rimMaterial}
        />

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
            <mesh geometry={sharedHeadGeometry} material={whiteMaterial} />
            {/* Left ear */}
            <mesh
              position={[-0.25, 0.32, 0.01]}
              geometry={sharedEarGeometry}
              material={whiteMaterial}
            />
            {/* Right ear */}
            <mesh
              position={[0.25, 0.32, 0.01]}
              geometry={sharedEarGeometry}
              material={whiteMaterial}
            />
            {/* Body */}
            <mesh
              position={[0, -0.35, 0]}
              geometry={sharedBodyGeometry}
              material={whiteMaterial}
            />
          </group>
        )}
      </group>

      {/* Glow effect */}
      <pointLight color={color} intensity={lightIntensity} distance={8} />

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
      <mesh
        position={[0, -0.5, 0]}
        receiveShadow
        geometry={sharedPedestalGeometry}
        material={pedestalMaterial}
      />

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
