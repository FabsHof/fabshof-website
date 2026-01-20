import { Canvas } from '@react-three/fiber';
import { useState, useEffect, Suspense } from 'react';
import { SpaceShuttle } from './SpaceShuttle';
import { SpaceEnvironment } from './SpaceEnvironment';
import { ProjectObject } from './ProjectObject';
import { SocialMediaObject } from './SocialMediaObject';
import { ProjectPopup } from './ProjectPopup';
import { FollowCamera } from './FollowCamera';
import { useShuttleControls } from '../hooks/useShuttleControls';

interface Project {
  position: [number, number, number];
  title: string;
  color: string;
  description?: string;
}

interface SocialMedia {
  position: [number, number, number];
  type: 'linkedin' | 'github';
  url: string;
  title: string;
  color: string;
}

interface SceneContentProps {
  onProjectCollision: (project: Project) => void;
  onSocialMediaCollision: (social: SocialMedia) => void;
}

function SceneContent({ onProjectCollision, onSocialMediaCollision }: SceneContentProps) {
  const { position, rotation } = useShuttleControls();

  // Real project positions based on work history
  const projects: Project[] = [
    {
      position: [0, 1, -20],
      title: '🧬 BIOEXOTEC',
      color: '#9b59b6',
      description: 'ML Engineer (Dec 2024 - Present) • Gene expression analysis for early cancer detection • +5% specificity improvement • Migrated PoC to scalable GCP application • Tech: Scikit-Learn, MLFlow, Google Cloud Platform'
    },
    {
      position: [10, 1, 10],
      title: '💡 GHZ Solutions',
      color: '#4a90e2',
      description: 'Data Engineer (Sept 2022 - March 2025) • Developed RAG tool → +30% employee efficiency • Containerized data processing pipelines • Tech: Python (Langchain, Polars, FastAPI), Docker, React'
    },
    {
      position: [-10, 1, 10],
      title: '🏥 Universitätsklinikum Ulm',
      color: '#e74c3c',
      description: 'Data Engineer (July - Dec 2024) • Automated quality assurance tools for data processing (Pydantic) • Project lead: nationwide clinic data network (privacy-focused) • Study data analysis with presentations • Tech: Python, R, SQL'
    },
    {
      position: [15, 1, -5],
      title: '🔬 Universität Ulm',
      color: '#2ecc71',
      description: 'Research Assistant (Sept 2021 - Jan 2023) • Medical informatics research: smartphone/wearable health data • Publications in scientific journals • Supervised bachelor/master theses • Tech: Flutter, PySpark, MongoDB, FastAPI'
    },
    {
      position: [-15, 1, -5],
      title: '🏭 Carl Zeiss MES',
      color: '#f39c12',
      description: 'Frontend Developer (Oct 2023 - June 2024) • Angular applications for industrial measurement technology • Real-time features (WebSockets) for MES platform • Tech: Angular, Next.js, Docker, Azure, JIRA'
    },
    {
      position: [20, 1, 5],
      title: '🔧 Liebherr Hausgeräte',
      color: '#1abc9c',
      description: 'Software Engineer (Feb - Sept 2023) • Vue.js/.NET applications with data processing • Implemented CI/CD pipelines • Extended Kubernetes cluster • Tech: Vue.js, .NET, MS SQL, Kubernetes, Azure'
    },
  ];

  // Social media objects
  const socialMediaObjects: SocialMedia[] = [
    {
      position: [-25, 1, 15],
      type: 'linkedin',
      url: 'https://www.linkedin.com/in/fabshof',
      title: 'LinkedIn Profile',
      color: '#0077B5'
    },
    {
      position: [25, 1, 15],
      type: 'github',
      url: 'https://github.com/FabsHof',
      title: 'GitHub Profile',
      color: '#333333'
    }
  ];

  // Check collision with projects and social media
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
  }, [position]);

  return (
    <>
      <FollowCamera targetPosition={position} targetRotation={rotation} />
      <SpaceEnvironment />
      <SpaceShuttle position={position} rotation={rotation} />

      {projects.map((project, index) => (
        <ProjectObject
          key={index}
          position={project.position}
          title={project.title}
          color={project.color}
          shuttlePosition={position}
        />
      ))}

      {/* Social media objects */}
      {socialMediaObjects.map((social, index) => (
        <SocialMediaObject
          key={`social-${index}`}
          position={social.position}
          type={social.type}
          url={social.url}
          shuttlePosition={position}
        />
      ))}
    </>
  );
}

export function Scene() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedSocial, setSelectedSocial] = useState<SocialMedia | null>(null);
  const [lastCollision, setLastCollision] = useState<string | null>(null);
  const [closedPopups, setClosedPopups] = useState<Set<string>>(new Set());

  const handleProjectCollision = (project: Project) => {
    // Prevent reopening if popup is currently open or was recently closed
    if (lastCollision !== project.title && !closedPopups.has(project.title) && !selectedProject && !selectedSocial) {
      setSelectedProject(project);
      setSelectedSocial(null);
      setLastCollision(project.title);

      // Reset collision tracker after a delay
      setTimeout(() => setLastCollision(null), 3000);
    }
  };

  const handleSocialMediaCollision = (social: SocialMedia) => {
    // Prevent reopening if popup is currently open or was recently closed
    if (lastCollision !== social.title && !closedPopups.has(social.title) && !selectedProject && !selectedSocial) {
      setSelectedSocial(social);
      setSelectedProject(null);
      setLastCollision(social.title);

      // Reset collision tracker after a delay
      setTimeout(() => setLastCollision(null), 3000);
    }
  };

  const handleClosePopup = (title: string) => {
    // Mark this popup as closed
    setClosedPopups(prev => new Set(prev).add(title));
    setSelectedProject(null);
    setSelectedSocial(null);

    // Clear the closed flag after the shuttle has time to move away
    setTimeout(() => {
      setClosedPopups(prev => {
        const newSet = new Set(prev);
        newSet.delete(title);
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
          />
        </Suspense>
      </Canvas>

      {selectedProject && (
        <ProjectPopup
          title={selectedProject.title}
          description={selectedProject.description}
          color={selectedProject.color}
          onClose={() => handleClosePopup(selectedProject.title)}
        />
      )}

      {selectedSocial && (
        <ProjectPopup
          title={selectedSocial.title}
          description={`Visit my ${selectedSocial.type === 'linkedin' ? 'LinkedIn' : 'GitHub'} profile to connect and see more of my work!`}
          color={selectedSocial.color}
          url={selectedSocial.url}
          onClose={() => handleClosePopup(selectedSocial.title)}
        />
      )}
    </div>
  );
}
