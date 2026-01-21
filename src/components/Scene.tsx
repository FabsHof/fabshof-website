import { Canvas } from '@react-three/fiber';
import { useState, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { SpaceShuttle } from './SpaceShuttle';
import { SpaceEnvironment } from './SpaceEnvironment';
import { ProjectObject } from './ProjectObject';
import { SocialMediaObject } from './SocialMediaObject';
import { ProjectPopup } from './ProjectPopup';
import { ContactPopup } from './ContactPopup';
import { PrivacyNotice } from './PrivacyNotice';
import { FollowCamera } from './FollowCamera';
import { NebulaLabel } from './NebulaLabel';
import { useShuttleControls } from '../hooks/useShuttleControls';

interface Project {
  position: [number, number, number];
  titleKey: string;  // Translation key instead of translated title
  color: string;
  descriptionKey: string;  // Translation key instead of translated description
}

interface SocialMedia {
  position: [number, number, number];
  type: 'linkedin' | 'github';
  url: string;
  titleKey: string;  // Translation key instead of translated title
  color: string;
}

interface SceneContentProps {
  onProjectCollision: (project: Project) => void;
  onSocialMediaCollision: (social: SocialMedia) => void;
  onContactCollision: () => void;
}

function SceneContent({ onProjectCollision, onSocialMediaCollision, onContactCollision }: SceneContentProps) {
  const { position, rotation } = useShuttleControls();
  const { t } = useTranslation();

  // Convert rotation number to rotation tuple for Three.js
  const rotationTuple: [number, number, number] = [0, rotation, 0];

  // Group center positions
  const contactGroupCenter: [number, number, number] = [0, 1, 25];
  const employersGroupCenter: [number, number, number] = [0, 1, -15];
  const socialGroupCenter: [number, number, number] = [30, 1, 0];

  // Contact object position (near contact group)
  const contactPosition: [number, number, number] = [0, 1, 20];

  // Employers group - arranged in a cluster around the group center
  const projects: Project[] = [
    {
      position: [-8, 1, -20],
      titleKey: 'projects.bioexotec.title',
      color: '#9b59b6',
      descriptionKey: 'projects.bioexotec.description'
    },
    {
      position: [8, 1, -20],
      titleKey: 'projects.ghz.title',
      color: '#4a90e2',
      descriptionKey: 'projects.ghz.description'
    },
    {
      position: [-12, 1, -10],
      titleKey: 'projects.uniklinik.title',
      color: '#e74c3c',
      descriptionKey: 'projects.uniklinik.description'
    },
    {
      position: [12, 1, -10],
      titleKey: 'projects.uni.title',
      color: '#2ecc71',
      descriptionKey: 'projects.uni.description'
    },
    {
      position: [-8, 1, -5],
      titleKey: 'projects.zeiss.title',
      color: '#f39c12',
      descriptionKey: 'projects.zeiss.description'
    },
    {
      position: [8, 1, -5],
      titleKey: 'projects.liebherr.title',
      color: '#1abc9c',
      descriptionKey: 'projects.liebherr.description'
    },
  ];

  // Social/Connect group - arranged near the social group center
  const socialMediaObjects: SocialMedia[] = [
    {
      position: [25, 1, -5],
      type: 'linkedin',
      url: 'https://www.linkedin.com/in/fabshof',
      titleKey: 'social.linkedin.title',
      color: '#0077B5'
    },
    {
      position: [25, 1, 5],
      type: 'github',
      url: 'https://github.com/FabsHof',
      titleKey: 'social.github.title',
      color: '#333333'
    }
  ];

  // Check collision with projects, social media, and contact
  useEffect(() => {
    const collisionDistance = 3;

    // Check project collisions
    projects.forEach((project) => {
      const dx = position[0] - project.position[0];
      const dz = position[2] - project.position[2];
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance < collisionDistance) {
        onProjectCollision(project);
      }
    });

    // Check social media collisions
    socialMediaObjects.forEach((social) => {
      const dx = position[0] - social.position[0];
      const dz = position[2] - social.position[2];
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance < collisionDistance) {
        onSocialMediaCollision(social);
      }
    });

    // Check contact collision
    const contactDx = position[0] - contactPosition[0];
    const contactDz = position[2] - contactPosition[2];
    const contactDistance = Math.sqrt(contactDx * contactDx + contactDz * contactDz);

    if (contactDistance < collisionDistance) {
      onContactCollision();
    }
  }, [position]);

  return (
    <>
      <FollowCamera targetPosition={position} targetRotation={rotation} />
      <SpaceEnvironment />
      <SpaceShuttle position={position} rotation={rotationTuple} />

      {/* Nebula group labels */}
      <NebulaLabel position={employersGroupCenter} label={t('groups.employers')} color="#667eea" />
      <NebulaLabel position={contactGroupCenter} label={t('groups.contact')} color="#e91e63" />
      <NebulaLabel position={socialGroupCenter} label={t('groups.connect')} color="#0077B5" />

      {/* Employers group */}
      {projects.map((project, index) => (
        <ProjectObject
          key={index}
          position={project.position}
          title={t(project.titleKey)}
          color={project.color}
          shuttlePosition={position}
        />
      ))}

      {/* Social/Connect group */}
      {socialMediaObjects.map((social, index) => (
        <SocialMediaObject
          key={`social-${index}`}
          position={social.position}
          type={social.type}
          url={social.url}
          shuttlePosition={position}
        />
      ))}

      {/* Contact object */}
      <ProjectObject
        position={contactPosition}
        title={t('contact.title')}
        color="#e91e63"
        shuttlePosition={position}
      />
    </>
  );
}

export function Scene() {
  const { t } = useTranslation();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedSocial, setSelectedSocial] = useState<SocialMedia | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [lastCollision, setLastCollision] = useState<string | null>(null);
  const [closedPopups, setClosedPopups] = useState<Set<string>>(new Set());

  const handleProjectCollision = (project: Project) => {
    // Prevent reopening if popup is currently open or was recently closed
    if (lastCollision !== project.titleKey && !closedPopups.has(project.titleKey) && !selectedProject && !selectedSocial && !showContact) {
      setSelectedProject(project);
      setSelectedSocial(null);
      setShowContact(false);
      setLastCollision(project.titleKey);

      // Reset collision tracker after a delay
      setTimeout(() => setLastCollision(null), 3000);
    }
  };

  const handleSocialMediaCollision = (social: SocialMedia) => {
    // Prevent reopening if popup is currently open or was recently closed
    if (lastCollision !== social.titleKey && !closedPopups.has(social.titleKey) && !selectedProject && !selectedSocial && !showContact) {
      setSelectedSocial(social);
      setSelectedProject(null);
      setShowContact(false);
      setLastCollision(social.titleKey);

      // Reset collision tracker after a delay
      setTimeout(() => setLastCollision(null), 3000);
    }
  };

  const handleContactCollision = () => {
    // Prevent reopening if popup is currently open or was recently closed
    if (lastCollision !== 'contact' && !closedPopups.has('contact') && !selectedProject && !selectedSocial && !showContact) {
      setShowContact(true);
      setSelectedProject(null);
      setSelectedSocial(null);
      setLastCollision('contact');

      // Reset collision tracker after a delay
      setTimeout(() => setLastCollision(null), 3000);
    }
  };

  const handleClosePopup = (titleKey: string) => {
    // Mark this popup as closed
    setClosedPopups(prev => new Set(prev).add(titleKey));
    setSelectedProject(null);
    setSelectedSocial(null);
    setShowContact(false);

    // Clear the closed flag after the shuttle has time to move away
    setTimeout(() => {
      setClosedPopups(prev => {
        const newSet = new Set(prev);
        newSet.delete(titleKey);
        return newSet;
      });
    }, 5000);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <Canvas
        shadows
        camera={{ position: [0, 15, 15], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <SceneContent
            onProjectCollision={handleProjectCollision}
            onSocialMediaCollision={handleSocialMediaCollision}
            onContactCollision={handleContactCollision}
          />
        </Suspense>
      </Canvas>

      {selectedProject && (
        <ProjectPopup
          title={t(selectedProject.titleKey)}
          description={t(selectedProject.descriptionKey)}
          color={selectedProject.color}
          onClose={() => handleClosePopup(selectedProject.titleKey)}
        />
      )}

      {selectedSocial && (
        <ProjectPopup
          title={t(selectedSocial.titleKey)}
          description={t(`social.${selectedSocial.type}.description`)}
          color={selectedSocial.color}
          url={selectedSocial.url}
          iconType={selectedSocial.type}
          onClose={() => handleClosePopup(selectedSocial.titleKey)}
        />
      )}

      {showContact && (
        <ContactPopup
          onClose={() => handleClosePopup('contact')}
        />
      )}

      <PrivacyNotice />
    </div>
  );
}
