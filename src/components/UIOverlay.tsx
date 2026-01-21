import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PrivacyPolicy } from './PrivacyPolicy';
import { Impressum } from './Impressum';
import {
  isMobileDevice,
  needsOrientationPermission,
  requestOrientationPermission,
  hasOrientationListener,
  wasPermissionDenied,
  recalibrate,
} from '../utils/deviceOrientation';
import './UIOverlay.css';

export function UIOverlay() {
  const { t } = useTranslation();
  const isMobile = isMobileDevice();
  const [showInstructions, setShowInstructions] = useState(true);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showImpressum, setShowImpressum] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(
    () => hasOrientationListener() || (isMobile && !needsOrientationPermission())
  );
  const [permissionDenied, setPermissionDenied] = useState(() => wasPermissionDenied());
  const needsPermission = isMobile && needsOrientationPermission();

  const handleRequestPermission = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dismissing the instructions
    e.preventDefault();
    console.log('[UIOverlay] Permission button clicked');
    try {
      const granted = await requestOrientationPermission();
      console.log('[UIOverlay] Permission granted:', granted);
      setPermissionGranted(granted);
      setPermissionDenied(!granted);
      // Auto-close modal after permission is granted
      if (granted) {
        setTimeout(() => setShowInstructions(false), 1500);
      }
    } catch (err) {
      console.error('[UIOverlay] Permission request failed:', err);
      setPermissionDenied(true);
    }
  };

  const handleRecalibrate = () => {
    recalibrate();
    // Don't stop propagation - let the modal close
  };

  // Note: permissionGranted and permissionDenied initial values are set at useState declaration
  // based on hasOrientationListener() and wasPermissionDenied() respectively

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 8000);

    // Close on any keystroke (but not click - handled by onClick on the backdrop)
    const handleKeyDismiss = () => {
      if (showInstructions) {
        setShowInstructions(false);
      }
    };

    if (showInstructions) {
      // Delay adding event listener to prevent immediate dismissal when reopening
      const listenerTimer = setTimeout(() => {
        window.addEventListener('keydown', handleKeyDismiss);
      }, 100);

      return () => {
        clearTimeout(timer);
        clearTimeout(listenerTimer);
        window.removeEventListener('keydown', handleKeyDismiss);
      };
    }

    return () => {
      clearTimeout(timer);
    };
  }, [showInstructions]);

  return (
    <div className="ui-overlay">
      {/* Header */}
      <header className="header">
        <h1 className="title">Fabian Hofmann</h1>
        <p className="subtitle">Data Engineer | ML Engineer</p>
      </header>

      {/* Instructions */}
      {showInstructions && (
        <div className="instructions" onClick={() => setShowInstructions(false)}>
          <div className="instructions-content">
            <h2>{t('navigation.controls')}</h2>
            {isMobile ? (
              <>
                {permissionDenied ? (
                  <p className="permission-denied">{t('navigation.permissionDenied')}</p>
                ) : permissionGranted ? (
                  <>
                    <p>{t('navigation.tiltInstructions')}</p>
                    <p className="permission-granted">{t('navigation.motionEnabled')}</p>
                    <button className="recalibrate-button" onClick={handleRecalibrate}>
                      {t('navigation.recalibrate')}
                    </button>
                  </>
                ) : needsPermission ? (
                  <>
                    <p>{t('navigation.tiltDevice')}</p>
                    <button className="permission-button" onClick={handleRequestPermission}>
                      {t('navigation.enableMotion')}
                    </button>
                  </>
                ) : (
                  <>
                    <p>{t('navigation.tiltInstructions')}</p>
                    <button className="recalibrate-button" onClick={handleRecalibrate}>
                      {t('navigation.recalibrate')}
                    </button>
                  </>
                )}
              </>
            ) : (
              <p>
                {t('navigation.arrowKeys')}
                <br />
                <strong>↑ ↓</strong> - Forward/Backward
                <br />
                <strong>← →</strong> - Left/Right
              </p>
            )}
            <small>{t('navigation.clickToDismiss')}</small>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>{t('navigation.explorePortfolio')}</p>
        <div className="footer-links">
          <button className="footer-link" onClick={() => setShowPrivacyPolicy(true)}>
            Datenschutz
          </button>
          <span className="footer-separator">|</span>
          <button className="footer-link" onClick={() => setShowImpressum(true)}>
            Impressum
          </button>
        </div>
      </footer>

      {/* Privacy Policy */}
      {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}

      {/* Impressum */}
      {showImpressum && <Impressum onClose={() => setShowImpressum(false)} />}

      {/* Toggle instructions button */}
      {!showInstructions && (
        <button className="help-button" onClick={() => setShowInstructions(true)}>
          ?
        </button>
      )}
    </div>
  );
}
