import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ProjectPopup.css';

interface ContactPopupProps {
  onClose: () => void;
}

export function ContactPopup({ onClose }: ContactPopupProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    // Obfuscated email address - decoded at runtime
    const parts = ['contact', 'fabshof', 'de'];
    const email = `${parts[0]}@${parts[1]}.${parts[2]}`;

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(`Contact from ${formData.name}`)}&body=${encodeURIComponent(
      `Name: ${formData.name}\n\nMessage:\n${formData.message}`
    )}`;

    try {
      // Open mailto link
      window.location.href = mailtoLink;
      setStatus('success');

      // Close after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="project-popup-overlay" onClick={onClose}>
      <div className="project-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          ×
        </button>
        <h2 style={{ color: '#4a90e2' }}>📧 {t('contact.title')}</h2>

        {status === 'success' ? (
          <div className="contact-success">
            <p>{t('contact.success')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">{t('contact.name')}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={status === 'sending'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">{t('contact.message')}</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                disabled={status === 'sending'}
              />
            </div>

            {status === 'error' && <div className="contact-error">{t('contact.error')}</div>}

            <button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? t('contact.sending') : t('contact.send')}
            </button>
          </form>
        )}

        <p className="popup-close-hint" dangerouslySetInnerHTML={{ __html: t('popup.close') }} />
      </div>
    </div>
  );
}
