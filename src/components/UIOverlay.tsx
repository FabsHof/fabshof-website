import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PrivacyPolicy } from './PrivacyPolicy';
import { Impressum } from './Impressum';
import './UIOverlay.css';

export function UIOverlay() {
  const { t } = useTranslation();
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showImpressum, setShowImpressum] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 8000);

    // Close on any keystroke or click
    const handleDismiss = () => {
      if (showInstructions) {
        setShowInstructions(false);
      }
    };

    if (showInstructions) {
      // Delay adding event listeners to prevent immediate dismissal when reopening
      const listenerTimer = setTimeout(() => {
        window.addEventListener('keydown', handleDismiss);
        window.addEventListener('click', handleDismiss);
      }, 100);

      return () => {
        clearTimeout(timer);
        clearTimeout(listenerTimer);
        window.removeEventListener('keydown', handleDismiss);
        window.removeEventListener('click', handleDismiss);
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
              <p>
                {t('navigation.tiltDevice')}
                <br />
                {t('navigation.controls')}!
              </p>
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
          <button
            className="footer-link"
            onClick={() => setShowPrivacyPolicy(true)}
          >
            Datenschutz
          </button>
          <span className="footer-separator">|</span>
          <button
            className="footer-link"
            onClick={() => setShowImpressum(true)}
          >
            Impressum
          </button>
        </div>
      </footer>

      {/* Privacy Policy */}
      {showPrivacyPolicy && (
        <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />
      )}

      {/* Impressum */}
      {showImpressum && (
        <Impressum onClose={() => setShowImpressum(false)} />
      )}

      {/* Toggle instructions button */}
      {!showInstructions && (
        <button className="help-button" onClick={() => setShowInstructions(true)}>
          ?
        </button>
      )}
    </div>
  );
}
