import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'de' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button className="language-switcher" onClick={toggleLanguage}>
      <span className="flag">{i18n.language === 'de' ? '🇩🇪' : '🇬🇧'}</span>
      <span className="lang-text">{i18n.language === 'de' ? 'DE' : 'EN'}</span>
    </button>
  );
}
