import { useEffect } from 'react';
import './ProjectPopup.css';

interface ProjectPopupProps {
  title: string;
  description?: string;
  color: string;
  onClose: () => void;
  url?: string;
}

export function ProjectPopup({ title, description, color, onClose, url }: ProjectPopupProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

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
          />
          <h2>{title}</h2>
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
                Visit Profile →
              </a>
            </div>
          )}
        </div>
        <div className="popup-footer">
          <p>Press <strong>ESC</strong> or click anywhere to close</p>
        </div>
      </div>
    </div>
  );
}
