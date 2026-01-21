// Shared device orientation handler
// This module manages device orientation permission and events

// Type for iOS DeviceOrientationEvent with requestPermission
type DeviceOrientationWithRequest = {
  requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
};

// Shared state
let orientationData: { beta: number | null; gamma: number | null; alpha: number | null } = {
  beta: null,
  gamma: null,
  alpha: null,
};
let calibrationData: { beta: number | null; gamma: number | null } = { beta: null, gamma: null };
let isOrientationActive = false;
let isCalibrated = false;
let listenerAdded = false;
let permissionDenied = false;
let permissionCallbacks: Array<(granted: boolean) => void> = [];
let lastScreenOrientation: number | null = null;
let orientationChangeTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingRecalibration = false;

// Get current screen orientation angle
function getScreenOrientation(): number {
  if (typeof screen !== 'undefined' && screen.orientation) {
    return screen.orientation.angle;
  }
  // Fallback for older browsers
  return (window.orientation as number) ?? 0;
}

// Device orientation event handler
function handleDeviceOrientation(e: DeviceOrientationEvent) {
  if (e.beta !== null && e.gamma !== null) {
    orientationData = {
      beta: e.beta,
      gamma: e.gamma,
      alpha: e.alpha,
    };

    // Check if screen orientation changed - schedule recalibration with delay
    const currentOrientation = getScreenOrientation();
    if (lastScreenOrientation !== null && lastScreenOrientation !== currentOrientation) {
      console.log('[DeviceOrientation] Screen orientation changed, scheduling recalibration...');
      pendingRecalibration = true;

      // Clear any existing timeout
      if (orientationChangeTimeout) {
        clearTimeout(orientationChangeTimeout);
      }

      // Delay recalibration to let the device settle
      orientationChangeTimeout = setTimeout(() => {
        if (
          pendingRecalibration &&
          orientationData.beta !== null &&
          orientationData.gamma !== null
        ) {
          calibrationData = {
            beta: orientationData.beta,
            gamma: orientationData.gamma,
          };
          console.log(
            '[DeviceOrientation] Recalibrated after orientation change at beta:',
            orientationData.beta,
            'gamma:',
            orientationData.gamma
          );
          pendingRecalibration = false;
        }
      }, 500); // 500ms delay to let device settle
    }
    lastScreenOrientation = currentOrientation;

    // Calibrate on first valid reading - use current position as neutral
    if (!isCalibrated) {
      calibrationData = {
        beta: e.beta,
        gamma: e.gamma,
      };
      isCalibrated = true;
      console.log('[DeviceOrientation] Calibrated at beta:', e.beta, 'gamma:', e.gamma);
    }

    isOrientationActive = true;
  }
}

// Check if iOS permission is required
export function needsOrientationPermission(): boolean {
  const docAny = DeviceOrientationEvent as unknown as DeviceOrientationWithRequest;
  return typeof docAny.requestPermission === 'function';
}

// Check if device is mobile
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Request orientation permission (must be called from user gesture on iOS)
export async function requestOrientationPermission(): Promise<boolean> {
  console.log('[DeviceOrientation] requestOrientationPermission called');

  if (listenerAdded) {
    console.log('[DeviceOrientation] Listener already added, returning true');
    return true;
  }

  const docAny = DeviceOrientationEvent as unknown as DeviceOrientationWithRequest;
  console.log(
    '[DeviceOrientation] requestPermission available:',
    typeof docAny.requestPermission === 'function'
  );

  if (typeof docAny.requestPermission === 'function') {
    // iOS 13+ requires user gesture
    try {
      console.log('[DeviceOrientation] Calling requestPermission...');
      const permission = await docAny.requestPermission();
      console.log('[DeviceOrientation] Permission result:', permission);
      if (permission === 'granted') {
        window.addEventListener('deviceorientation', handleDeviceOrientation);
        listenerAdded = true;
        permissionDenied = false;
        notifyPermissionCallbacks(true);
        return true;
      }
      permissionDenied = true;
      notifyPermissionCallbacks(false);
      return false;
    } catch (err) {
      console.error('[DeviceOrientation] Error requesting permission:', err);
      permissionDenied = true;
      notifyPermissionCallbacks(false);
      return false;
    }
  } else {
    // Non-iOS devices don't need permission
    console.log('[DeviceOrientation] No permission needed, adding listener directly');
    window.addEventListener('deviceorientation', handleDeviceOrientation);
    listenerAdded = true;
    notifyPermissionCallbacks(true);
    return true;
  }
}

// Start listening for non-iOS devices (can be called automatically)
export function startOrientationListening(): void {
  if (!needsOrientationPermission() && !listenerAdded) {
    window.addEventListener('deviceorientation', handleDeviceOrientation);
    listenerAdded = true;
  }
}

// Get current orientation data (raw values)
export function getOrientationData(): {
  beta: number | null;
  gamma: number | null;
  alpha: number | null;
} {
  return orientationData;
}

// Get calibrated orientation data (relative to initial position)
export function getCalibratedOrientation(): { tiltForward: number; tiltSide: number } {
  if (!isCalibrated || orientationData.beta === null || orientationData.gamma === null) {
    return { tiltForward: 0, tiltSide: 0 };
  }

  const calibBeta = calibrationData.beta ?? 0;
  const calibGamma = calibrationData.gamma ?? 0;
  const screenAngle = getScreenOrientation();

  // Calculate delta from calibrated position
  let deltaBeta = orientationData.beta - calibBeta;
  const deltaGamma = orientationData.gamma - calibGamma;

  // Normalize beta for extreme angles
  if (deltaBeta > 90) deltaBeta = 180 - deltaBeta;
  if (deltaBeta < -90) deltaBeta = -180 - deltaBeta;

  let tiltForward: number;
  let tiltSide: number;

  // Adjust axes based on screen orientation
  // Screen angles: 0 = portrait, 90 = landscape-left, -90/270 = landscape-right, 180 = portrait-upside-down
  if (screenAngle === 90) {
    // Landscape left (home button on right): gamma becomes forward/back, beta becomes left/right
    tiltForward = Math.max(-1, Math.min(1, deltaGamma / 30));
    tiltSide = Math.max(-1, Math.min(1, deltaBeta / 50));
  } else if (screenAngle === -90 || screenAngle === 270) {
    // Landscape right (home button on left): gamma becomes forward/back (inverted), beta becomes left/right (inverted)
    tiltForward = Math.max(-1, Math.min(1, -deltaGamma / 30));
    tiltSide = Math.max(-1, Math.min(1, -deltaBeta / 50));
  } else {
    // Portrait (0) or upside-down portrait (180)
    // Forward/backward: tilting top of phone toward you = move forward (negative deltaBeta)
    tiltForward = Math.max(-1, Math.min(1, -deltaBeta / 30));
    // Left/right: tilting phone to the right = turn right
    tiltSide = Math.max(-1, Math.min(1, deltaGamma / 50));
  }

  return { tiltForward, tiltSide };
}

// Recalibrate to current position
export function recalibrate(): void {
  if (orientationData.beta !== null && orientationData.gamma !== null) {
    calibrationData = {
      beta: orientationData.beta,
      gamma: orientationData.gamma,
    };
    console.log(
      '[DeviceOrientation] Recalibrated at beta:',
      orientationData.beta,
      'gamma:',
      orientationData.gamma
    );
  }
}

// Check if orientation is active (has received valid data)
export function isOrientationListenerActive(): boolean {
  return isOrientationActive;
}

// Check if listener has been added
export function hasOrientationListener(): boolean {
  return listenerAdded;
}

// Check if permission was denied
export function wasPermissionDenied(): boolean {
  return permissionDenied;
}

// Subscribe to permission changes
export function onPermissionChange(callback: (granted: boolean) => void): () => void {
  permissionCallbacks.push(callback);
  return () => {
    permissionCallbacks = permissionCallbacks.filter((cb) => cb !== callback);
  };
}

function notifyPermissionCallbacks(granted: boolean): void {
  permissionCallbacks.forEach((cb) => cb(granted));
}

// Cleanup (for testing or unmount)
export function cleanup(): void {
  window.removeEventListener('deviceorientation', handleDeviceOrientation);
  if (orientationChangeTimeout) {
    clearTimeout(orientationChangeTimeout);
    orientationChangeTimeout = null;
  }
  listenerAdded = false;
  isOrientationActive = false;
  isCalibrated = false;
  permissionDenied = false;
  pendingRecalibration = false;
  orientationData = { beta: null, gamma: null, alpha: null };
  calibrationData = { beta: null, gamma: null };
  lastScreenOrientation = null;
}
