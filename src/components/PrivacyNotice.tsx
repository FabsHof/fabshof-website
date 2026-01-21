import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './PrivacyNotice.css';

export function PrivacyNotice() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted
    const userConsent = localStorage.getItem('userConsent');
    if (!userConsent) {
      // Show notice after a short delay
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('userConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('userConsent', 'declined');
    // Clear any stored preferences if declined
    localStorage.removeItem('i18nextLng');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="privacy-notice-overlay">
      <div className="privacy-notice">
        <div className="privacy-content">
          <h3>{t('cookies.title')}</h3>
          <p>{t('cookies.description')}</p>

          <div className="privacy-details">
            <div className="privacy-category">
              <strong>{t('cookies.essential.title')}</strong>
              <p>{t('cookies.essential.description')}</p>
            </div>

            <div className="privacy-category">
              <strong>{t('cookies.preferences.title')}</strong>
              <p>{t('cookies.preferences.description')}</p>
            </div>
          </div>
        </div>

        <div className="privacy-actions">
          <button className="privacy-btn privacy-btn-decline" onClick={handleDecline}>
            {t('cookies.decline')}
          </button>
          <button className="privacy-btn privacy-btn-accept" onClick={handleAccept}>
            {t('cookies.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
