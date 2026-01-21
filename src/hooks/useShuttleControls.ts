import { useEffect, useRef, useState } from 'react';
import {
  getCalibratedOrientation,
  isOrientationListenerActive,
  isMobileDevice,
  startOrientationListening,
  cleanup,
} from '../utils/deviceOrientation';

interface ShuttleState {
  position: [number, number, number];
  rotation: number;
  velocity: { x: number; z: number };
}

export function useShuttleControls(disabled = false) {
  const [shuttleState, setShuttleState] = useState<ShuttleState>({
    position: [0, 2, 0],
    rotation: 0,
    velocity: { x: 0, z: 0 },
  });

  const keysPressed = useRef<Set<string>>(new Set());
  const isMobile = useRef(false);
  const disabledRef = useRef(disabled);

  // Keep the ref in sync with the prop
  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    // Check if device is mobile
    isMobile.current = isMobileDevice();

    // Keyboard event handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // For non-iOS mobile devices, start listening immediately
    if (isMobile.current) {
      startOrientationListening();
    }

    // Animation loop for smooth movement
    const animate = () => {
      setShuttleState((prev) => {
        let { x: vx, z: vz } = prev.velocity;
        let newRotation = prev.rotation;

        const acceleration = 0.015;
        const mobileAcceleration = 0.025; // Faster for mobile
        const friction = 0.92;
        const maxSpeed = 0.4; // Increased max speed
        const rotationSpeed = 0.04;
        const mobileRotationSpeed = 0.06;

        // Skip input processing when disabled, but still apply friction
        if (!disabledRef.current) {
          if (isMobile.current && isOrientationListenerActive()) {
            // Mobile: use calibrated device orientation
            const { tiltForward, tiltSide } = getCalibratedOrientation();

            // Tilt forward/backward moves the shuttle in the direction it's facing
            if (Math.abs(tiltForward) > 0.05) {
              // Small deadzone
              vz += Math.cos(newRotation) * tiltForward * mobileAcceleration;
              vx += Math.sin(newRotation) * tiltForward * mobileAcceleration;
            }

            // Tilt left/right rotates the shuttle (not moving sideways)
            if (Math.abs(tiltSide) > 0.05) {
              // Small deadzone
              newRotation -= tiltSide * mobileRotationSpeed;
            }
          } else if (!isMobile.current) {
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
        }

        // Apply friction (always, even when disabled to slow down)
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
      cleanup();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return { shuttleState };
}
