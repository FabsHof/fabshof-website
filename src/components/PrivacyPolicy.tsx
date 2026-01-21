import { useEffect } from 'react';
import './PrivacyPolicy.css';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export function PrivacyPolicy({ onClose }: PrivacyPolicyProps) {
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
    <div className="privacy-policy-overlay" onClick={onClose}>
      <div className="privacy-policy" onClick={(e) => e.stopPropagation()}>
        <button className="privacy-policy-close" onClick={onClose}>×</button>

        <h1>Datenschutzerklärung</h1>

        <section>
          <h2>1. Verantwortlicher</h2>
          <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
          <address>
            Fabian Hofmann<br />
            89073 Ulm<br />
            Deutschland<br />
            E-Mail: <a href="mailto:contact@fabshof.de">contact@fabshof.de</a>
          </address>
        </section>

        <section>
          <h2>2. Allgemeine Hinweise zur Datenverarbeitung</h2>
          <p>
            Diese Website ist bewusst datensparsam gestaltet. Es werden keine personenbezogenen
            Daten zu Werbe- oder Trackingzwecken erhoben. Es findet keine Einbindung externer
            Tracking-Dienste (z. B. Google Analytics, Facebook Pixel) und keine Nachladung
            externer Schriftarten (z. B. Google Fonts) statt.
          </p>
        </section>

        <section>
          <h2>3. Server-Logfiles</h2>
          <p>
            Beim Aufruf dieser Website übermittelt Ihr Browser automatisch Daten an den Server
            (z. B. IP-Adresse, Datum und Uhrzeit des Abrufs, aufgerufene Datei, Browser-Typ).
            Diese Daten werden ausschließlich zur Sicherstellung des technischen Betriebs und
            zur Abwehr von Angriffen verarbeitet und automatisch gelöscht, sobald sie für
            diesen Zweck nicht mehr erforderlich sind.
          </p>
        </section>

        <section>
          <h2>4. Einsatz von Local Storage (lokaler Speicher)</h2>
          <p>
            Diese Website verwendet den lokalen Speicher (localStorage) Ihres Browsers, um
            bestimmte Einstellungen zu speichern. Folgende Einträge werden verwendet:
          </p>
          <ul>
            <li>
              <strong>i18nextLng</strong><br />
              Zweck: Speicherung der von Ihnen gewählten Sprache, damit die Website bei
              Ihrem nächsten Besuch automatisch in dieser Sprache angezeigt wird.<br />
              Rechtsgrundlage: Berechtigtes Interesse an einer nutzerfreundlichen Darstellung
              der Website (Art. 6 Abs. 1 lit. f DSGVO).
            </li>
            <li>
              <strong>userConsent</strong><br />
              Zweck: Speicherung Ihrer Auswahl im Datenschutz-Hinweis (z. B. „Alle akzeptieren"
              oder „Nur Essenzielles"), damit der Hinweis nicht bei jedem Seitenaufruf erneut
              erscheint.<br />
              Rechtsgrundlage: Berechtigtes Interesse an einer nutzerfreundlichen und
              rechtssicheren Gestaltung des Hinweises (Art. 6 Abs. 1 lit. f DSGVO).
            </li>
          </ul>
          <p>
            Sie können den lokalen Speicher jederzeit über die Einstellungen Ihres Browsers löschen.
          </p>
        </section>

        <section>
          <h2>5. Keine Verwendung von Cookies zu Tracking- oder Werbezwecken</h2>
          <p>
            Es werden keine Cookies oder vergleichbare Technologien zu Analyse-, Profiling- oder
            Werbezwecken eingesetzt. Insbesondere werden keine Daten an Dritte wie Google, Meta
            oder andere Werbe- und Trackingnetzwerke übertragen.
          </p>
        </section>

        <section>
          <h2>6. Keine Analyse- und Tracking-Dienste</h2>
          <p>
            Diese Website nutzt keine Dienste wie Google Analytics, Matomo, Hotjar oder
            vergleichbare Webanalyse-Tools. Es findet keine Erstellung von Nutzungsprofilen
            und kein geräte- oder dienstübergreifendes Tracking statt.
          </p>
        </section>

        <section>
          <h2>7. Einbindung externer Inhalte</h2>
          <p>
            Es werden keine extern gehosteten Schriften (z. B. Google Fonts) eingebunden; es
            kommen ausschließlich Systemschriften zum Einsatz. Sofern zukünftig externe Inhalte
            (z. B. YouTube-Videos, Karten) eingebunden werden, wird diese Datenschutzerklärung
            entsprechend ergänzt.
          </p>
        </section>

        <section>
          <h2>8. Ihre Rechte</h2>
          <p>
            Soweit im Einzelfall personenbezogene Daten verarbeitet werden, haben Sie nach der
            DSGVO insbesondere folgende Rechte: Auskunft, Berichtigung, Löschung, Einschränkung
            der Verarbeitung, Widerspruch sowie Datenübertragbarkeit. Hierzu sowie zu weiteren
            Fragen zum Datenschutz können Sie sich jederzeit an die oben angegebene Kontaktadresse
            wenden.
          </p>
        </section>

        <div className="privacy-policy-footer">
          <p>Drücke <strong>ESC</strong> oder klicke außerhalb, um zu schließen</p>
        </div>
      </div>
    </div>
  );
}
