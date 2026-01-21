import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaLinkedinIn, FaGithub } from 'react-icons/fa';
import './ProjectPopup.css';

interface ProjectPopupProps {
  title: string;
  description?: string;
  color: string;
  onClose: () => void;
  url?: string;
  iconType?: 'linkedin' | 'github';
}

export function ProjectPopup({ title, description, color, onClose, url, iconType }: ProjectPopupProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Extract emoji from title (if present at the start)
  const extractEmoji = (text: string): { emoji: string | null; cleanTitle: string } => {
    // Match emoji at the start of the string (including multi-codepoint emojis)
    const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u;
    const match = text.match(emojiRegex);
    if (match) {
      return {
        emoji: match[0],
        cleanTitle: text.slice(match[0].length).trim()
      };
    }
    return { emoji: null, cleanTitle: text };
  };

  const { emoji, cleanTitle } = extractEmoji(title);

  // Extract tech tags from description
  const extractTechTags = (desc?: string): string[] => {
    if (!desc) return [];
    const techMatch = desc.match(/Tech:\s*([^•]+)(?:•|$)/);
    if (!techMatch) return [];

    return techMatch[1]
      .split(',')
      .map(tech => tech.trim())
      .filter(tech => tech.length > 0)
      .slice(0, 6); // Limit to 6 tags
  };

  const techTags = extractTechTags(description);

  return (
    <div className="project-popup-overlay" onClick={onClose}>
      <div className="project-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>
        <div className="popup-header" style={{ borderColor: color }}>
          <div
            className="popup-icon"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 20px ${color}`
            }}
          >
            {iconType === 'linkedin' && <FaLinkedinIn className="popup-react-icon" />}
            {iconType === 'github' && <FaGithub className="popup-react-icon" />}
            {!iconType && emoji && <span className="popup-emoji">{emoji}</span>}
          </div>
          <h2>{cleanTitle}</h2>
        </div>
        <div className="popup-content">
          <p>{description || 'Project details coming soon...'}</p>
          {!url && techTags.length > 0 && (
            <div className="popup-tags">
              {techTags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          )}
          {url && (
            <div className="popup-actions">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="visit-link-button"
                style={{ backgroundColor: color }}
              >
                {t('popup.visitProfile')} →
              </a>
            </div>
          )}
        </div>
        <div className="popup-footer">
          <p dangerouslySetInnerHTML={{ __html: t('popup.close') }} />
        </div>
      </div>
    </div>
  );
}
