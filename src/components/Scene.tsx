import { Canvas } from '@react-three/fiber';
import { useState, useEffect, Suspense, useRef, useMemo } from 'react';
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
  titleKey: string; // Translation key instead of translated title
  color: string;
  descriptionKey: string; // Translation key instead of translated description
}

interface SocialMedia {
  position: [number, number, number];
  type: 'linkedin' | 'github';
  url: string;
  titleKey: string; // Translation key instead of translated title
  color: string;
}

interface SceneContentProps {
  onProjectCollision: (project: Project) => void;
  onSocialMediaCollision: (social: SocialMedia) => void;
  onContactCollision: () => void;
  navigationDisabled: boolean;
}

// Static data defined outside component to prevent recreation
const PROJECTS: Project[] = [
  {
    position: [-8, 1, -20],
    titleKey: 'projects.bioexotec.title',
    color: '#9b59b6',
    descriptionKey: 'projects.bioexotec.description',
  },
  {
    position: [8, 1, -20],
    titleKey: 'projects.ghz.title',
    color: '#4a90e2',
    descriptionKey: 'projects.ghz.description',
  },
  {
    position: [-12, 1, -10],
    titleKey: 'projects.uniklinik.title',
    color: '#e74c3c',
    descriptionKey: 'projects.uniklinik.description',
  },
  {
    position: [12, 1, -10],
    titleKey: 'projects.uni.title',
    color: '#2ecc71',
    descriptionKey: 'projects.uni.description',
  },
  {
    position: [-8, 1, -5],
    titleKey: 'projects.zeiss.title',
    color: '#f39c12',
    descriptionKey: 'projects.zeiss.description',
  },
  {
    position: [8, 1, -5],
    titleKey: 'projects.liebherr.title',
    color: '#1abc9c',
    descriptionKey: 'projects.liebherr.description',
  },
];

const SOCIAL_MEDIA: SocialMedia[] = [
  {
    position: [25, 1, -5],
    type: 'linkedin',
    url: 'https://www.linkedin.com/in/fabshof',
    titleKey: 'social.linkedin.title',
    color: '#0077B5',
  },
  {
    position: [25, 1, 5],
    type: 'github',
    url: 'https://github.com/FabsHof',
    titleKey: 'social.github.title',
    color: '#333333',
  },
];

const CONTACT_POSITION: [number, number, number] = [0, 1, 20];
const COLLISION_DISTANCE_SQUARED = 9; // 3 * 3 - avoid sqrt by comparing squared distances

// Group center positions
const CONTACT_GROUP_CENTER: [number, number, number] = [0, 1, 25];
const EMPLOYERS_GROUP_CENTER: [number, number, number] = [0, 1, -15];
const SOCIAL_GROUP_CENTER: [number, number, number] = [30, 1, 0];

function SceneContent({
  onProjectCollision,
  onSocialMediaCollision,
  onContactCollision,
  navigationDisabled,
}: SceneContentProps) {
  const { shuttleState } = useShuttleControls(navigationDisabled);
  const { position, rotation } = shuttleState;
  const { t } = useTranslation();
  const lastCheckRef = useRef(0);

  // Convert rotation number to rotation tuple for Three.js
  const rotationTuple: [number, number, number] = useMemo(() => [0, rotation, 0], [rotation]);

  // Throttled collision detection - only check every 100ms
  useEffect(() => {
    const now = Date.now();
    if (now - lastCheckRef.current < 100) return;
    lastCheckRef.current = now;

    // Check project collisions using squared distances (no sqrt needed)
    for (const project of PROJECTS) {
      const dx = position[0] - project.position[0];
      const dz = position[2] - project.position[2];
      const distanceSquared = dx * dx + dz * dz;

      if (distanceSquared < COLLISION_DISTANCE_SQUARED) {
        onProjectCollision(project);
        return; // Only trigger one collision at a time
      }
    }

    // Check social media collisions
    for (const social of SOCIAL_MEDIA) {
      const dx = position[0] - social.position[0];
      const dz = position[2] - social.position[2];
      const distanceSquared = dx * dx + dz * dz;

      if (distanceSquared < COLLISION_DISTANCE_SQUARED) {
        onSocialMediaCollision(social);
        return;
      }
    }

    // Check contact collision
    const contactDx = position[0] - CONTACT_POSITION[0];
    const contactDz = position[2] - CONTACT_POSITION[2];
    const contactDistanceSquared = contactDx * contactDx + contactDz * contactDz;

    if (contactDistanceSquared < COLLISION_DISTANCE_SQUARED) {
      onContactCollision();
    }
  }, [position, onProjectCollision, onSocialMediaCollision, onContactCollision]);

  return (
    <>
      <FollowCamera targetPosition={position} targetRotation={rotation} />
      <SpaceEnvironment />
      <SpaceShuttle position={position} rotation={rotationTuple} />

      {/* Nebula group labels */}
      <NebulaLabel
        position={EMPLOYERS_GROUP_CENTER}
        label={t('groups.employers')}
        color="#667eea"
      />
      <NebulaLabel position={CONTACT_GROUP_CENTER} label={t('groups.contact')} color="#e91e63" />
      <NebulaLabel position={SOCIAL_GROUP_CENTER} label={t('groups.connect')} color="#0077B5" />

      {/* Employers group */}
      {PROJECTS.map((project, index) => (
        <ProjectObject
          key={index}
          position={project.position}
          title={t(project.titleKey)}
          color={project.color}
          shuttlePosition={position}
        />
      ))}

      {/* Social/Connect group */}
      {SOCIAL_MEDIA.map((social, index) => (
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
        position={CONTACT_POSITION}
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
    if (
      lastCollision !== project.titleKey &&
      !closedPopups.has(project.titleKey) &&
      !selectedProject &&
      !selectedSocial &&
      !showContact
    ) {
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
    if (
      lastCollision !== social.titleKey &&
      !closedPopups.has(social.titleKey) &&
      !selectedProject &&
      !selectedSocial &&
      !showContact
    ) {
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
    if (
      lastCollision !== 'contact' &&
      !closedPopups.has('contact') &&
      !selectedProject &&
      !selectedSocial &&
      !showContact
    ) {
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
    setClosedPopups((prev) => new Set(prev).add(titleKey));
    setSelectedProject(null);
    setSelectedSocial(null);
    setShowContact(false);

    // Clear the closed flag after the shuttle has time to move away
    setTimeout(() => {
      setClosedPopups((prev) => {
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
            navigationDisabled={!!(selectedProject || selectedSocial || showContact)}
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

      {showContact && <ContactPopup onClose={() => handleClosePopup('contact')} />}

      <PrivacyNotice />
    </div>
  );
}
