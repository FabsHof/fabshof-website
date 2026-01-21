import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

interface FollowCameraProps {
  targetPosition: [number, number, number];
  targetRotation: number;
}

export function FollowCamera({ targetPosition, targetRotation }: FollowCameraProps) {
  const { camera } = useThree();
  const currentPosition = useRef(new Vector3(0, 10, 10));
  const currentLookAt = useRef(new Vector3(0, 2, 0));

  // Pre-allocate reusable Vector3 objects to avoid allocations in useFrame
  const targetCameraPosition = useRef(new Vector3());
  const targetLookAtPosition = useRef(new Vector3());

  useFrame(() => {
    // Calculate camera position behind the shuttle at 45-degree angle
    const distance = 12;
    const height = 8;

    // Position behind shuttle based on its rotation
    const offsetX = -Math.sin(targetRotation) * distance;
    const offsetZ = -Math.cos(targetRotation) * distance;

    // Reuse pre-allocated Vector3 objects
    targetCameraPosition.current.set(
      targetPosition[0] + offsetX,
      targetPosition[1] + height,
      targetPosition[2] + offsetZ
    );

    targetLookAtPosition.current.set(
      targetPosition[0],
      targetPosition[1] + 1,
      targetPosition[2]
    );

    // Smooth camera movement using lerp
    currentPosition.current.lerp(targetCameraPosition.current, 0.05);
    currentLookAt.current.lerp(targetLookAtPosition.current, 0.05);

    camera.position.copy(currentPosition.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
