import { useEffect } from 'react';
import './Impressum.css';

interface ImpressumProps {
  onClose: () => void;
}

export function Impressum({ onClose }: ImpressumProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="impressum-overlay" onClick={onClose}>
      <div className="impressum" onClick={(e) => e.stopPropagation()}>
        <button className="impressum-close" onClick={onClose}>×</button>

        <h1>Impressum</h1>

        <section>
          <h2>Angaben gemäß § 5 TMG</h2>
          <address>
            Fabian Hofmann<br />
            Deutschland
          </address>
        </section>

        <section>
          <h2>Kontakt</h2>
          <p>E-Mail: <a href="mailto:contact@fabshof.de">contact@fabshof.de</a></p>
        </section>

        <section>
          <h2>Credits & Assets</h2>
          <ul>
            {/* Add your asset credits here */}
            <li>
              <strong>3D Models</strong><br />
              - Space Shuttle model from <a href="https://science.nasa.gov/3d-resources/" target="_blank">NASA</a>
            </li>
          </ul>
        </section>

        <div className="impressum-footer">
          <p>Drücke <strong>ESC</strong> oder klicke außerhalb, um zu schließen</p>
        </div>
      </div>
    </div>
  );
}
