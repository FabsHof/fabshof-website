import * as THREE from 'three';

// Pre-create shared geometries and materials outside component
const sunGeometry = new THREE.SphereGeometry(20, 32, 32); // Reduced from 64 segments
const sunMaterial = new THREE.MeshStandardMaterial({
  color: '#FDB813',
  emissive: '#FDB813',
  emissiveIntensity: 2.0,
  metalness: 0.2,
  roughness: 0.6
});

const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshPhysicalMaterial({
  color: '#1a1a1a',
  metalness: 1.0,
  roughness: 0.05,
  reflectivity: 1.0,
  transparent: true,
  opacity: 0.9,
  clearcoat: 1,
  clearcoatRoughness: 0.05,
  envMapIntensity: 1.5
});

const starsMaterial = new THREE.PointsMaterial({
  color: '#ffffff',
  size: 0.15,
  sizeAttenuation: false
});

// Pre-generate star positions once at module load to avoid calling Math.random during render
const sharedStarsGeometry = (() => {
  const geometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(2000 * 3); // Reduced from 5000

  for (let i = 0; i < 2000; i++) {
    const i3 = i * 3;
    starPositions[i3] = (Math.random() - 0.5) * 200;
    starPositions[i3 + 1] = (Math.random() - 0.5) * 200;
    starPositions[i3 + 2] = (Math.random() - 0.5) * 200;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  return geometry;
})();

export function SpaceEnvironment() {
  // Use pre-generated stars geometry
  const starsGeometry = sharedStarsGeometry;

  return (
    <>
      {/* Stars background */}
      <points geometry={starsGeometry} material={starsMaterial} />

      {/* Sun - planet-like sphere at horizon */}
      <mesh
        position={[0, 15, -80]}
        castShadow
        geometry={sunGeometry}
        material={sunMaterial}
      />

      {/* Minimal ambient light */}
      <ambientLight intensity={0.15} />

      {/* Main directional light from sun - only direct light source */}
      <directionalLight
        position={[0, 15, -80]}
        intensity={2.0}
        castShadow
        color="#FDB813"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      {/* Strong point light from sun for nearby illumination */}
      <pointLight position={[0, 15, -80]} color="#FDB813" intensity={8} distance={300} />

      {/* Highly reflective black glass surface */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        geometry={floorGeometry}
        material={floorMaterial}
      />

      {/* Whitish grid lines on surface for depth perception */}
      <gridHelper args={[100, 50, '#808080', '#505050']} position={[0, 0.01, 0]} />
    </>
  );
}
