import { useState, useEffect } from 'react';
import './UIOverlay.css';

export function UIOverlay() {
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

    return () => clearTimeout(timer);
  }, []);

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
            <h2>Controls</h2>
            {isMobile ? (
              <p>
                Tilt your device to navigate the space shuttle.
                <br />
                Explore the projects floating in space!
              </p>
            ) : (
              <p>
                Use <strong>Arrow Keys</strong> to navigate the space shuttle.
                <br />
                <strong>↑ ↓</strong> - Move Forward/Backward
                <br />
                <strong>← →</strong> - Rotate Left/Right
                <br />
                <br />
                Explore the projects floating in space!
              </p>
            )}
            <small>Click anywhere to dismiss</small>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>Navigate through space to explore my portfolio</p>
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
