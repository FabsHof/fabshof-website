import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './UIOverlay.css';

export function UIOverlay() {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    setIsMobile(checkMobile);

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
            <small>Click to dismiss</small>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>{t('navigation.explorePortfolio')}</p>
      </footer>

      {/* Toggle instructions button */}
      {!showInstructions && (
        <button className="help-button" onClick={() => setShowInstructions(true)}>
          ?
        </button>
      )}
    </div>
  );
}
