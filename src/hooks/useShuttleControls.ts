import { useEffect, useRef, useState } from 'react';

interface ShuttleState {
  position: [number, number, number];
  rotation: number;
  velocity: { x: number; z: number };
}

export function useShuttleControls() {
  const [shuttleState, setShuttleState] = useState<ShuttleState>({
    position: [0, 2, 0],
    rotation: 0,
    velocity: { x: 0, z: 0 },
  });

  const keysPressed = useRef<Set<string>>(new Set());
  const deviceOrientation = useRef({ beta: 0, gamma: 0 });
  const isMobile = useRef(false);

  useEffect(() => {
    // Check if device is mobile
    isMobile.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Keyboard event handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    // Device orientation handler for mobile
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        deviceOrientation.current = {
          beta: e.beta,
          gamma: e.gamma,
        };
      }
    };

    // Request permission for iOS devices (typed to avoid `any`)
    type DeviceOrientationWithRequest = {
      requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
    };

    const requestOrientationPermission = async () => {
      const docAny = DeviceOrientationEvent as unknown as DeviceOrientationWithRequest;
      if (typeof docAny.requestPermission === 'function') {
        try {
          const permission = await docAny.requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleDeviceOrientation);
          }
        } catch (err) {
          console.error('Error requesting device orientation permission:', err);
        }
      } else {
        window.addEventListener('deviceorientation', handleDeviceOrientation);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    if (isMobile.current) {
      requestOrientationPermission();
    }

    // Animation loop for smooth movement
    const animate = () => {
      setShuttleState((prev) => {
        let { x: vx, z: vz } = prev.velocity;
        let newRotation = prev.rotation;

        const acceleration = 0.015;
        const friction = 0.92;
        const maxSpeed = 0.3;
        const rotationSpeed = 0.04;

        if (isMobile.current) {
          // Mobile: use device orientation
          const { beta, gamma } = deviceOrientation.current;

          // Tilt forward/backward (beta: -90 to 90)
          const tiltForward = Math.max(-1, Math.min(1, (beta - 45) / 30));
          // Tilt left/right (gamma: -90 to 90)
          const tiltSide = Math.max(-1, Math.min(1, gamma / 30));

          // Apply acceleration based on tilt
          vz += tiltForward * acceleration;
          vx += tiltSide * acceleration;

          // Rotate shuttle based on horizontal tilt
          newRotation = -tiltSide * 0.5;
        } else {
          // Desktop: use arrow keys
          if (keysPressed.current.has('ArrowUp')) {
            vz += Math.cos(newRotation) * acceleration;
            vx += Math.sin(newRotation) * acceleration;
          }
          if (keysPressed.current.has('ArrowDown')) {
            vz -= Math.cos(newRotation) * acceleration;
            vx -= Math.sin(newRotation) * acceleration;
          }
          if (keysPressed.current.has('ArrowLeft')) {
            newRotation += rotationSpeed;
          }
          if (keysPressed.current.has('ArrowRight')) {
            newRotation -= rotationSpeed;
          }
        }

        // Apply friction
        vx *= friction;
        vz *= friction;

        // Clamp speed
        const speed = Math.sqrt(vx * vx + vz * vz);
        if (speed > maxSpeed) {
          vx = (vx / speed) * maxSpeed;
          vz = (vz / speed) * maxSpeed;
        }

        // Update position
        const newX = prev.position[0] + vx;
        const newZ = prev.position[2] + vz;

        // Keep shuttle within bounds
        const boundary = 45;
        const clampedX = Math.max(-boundary, Math.min(boundary, newX));
        const clampedZ = Math.max(-boundary, Math.min(boundary, newZ));

        return {
          position: [clampedX, 2, clampedZ],
          rotation: newRotation,
          velocity: { x: vx, z: vz },
        };
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    let animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return shuttleState;
}
