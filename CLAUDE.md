# Project Overview

Personal portfolio website for Fabian Hofmann featuring an interactive 3D space exploration experience.

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **3D**: Three.js via @react-three/fiber and @react-three/drei
- **i18n**: i18next with browser language detection (German/English)

## Architecture

### Core Concept

Users navigate a space shuttle through a 3D environment, colliding with floating objects that represent projects, social media links, and a contact form. Each collision triggers a popup with relevant information.

### Key Components

- `Scene.tsx` - Main scene orchestrator, handles collision detection and popup state
- `SpaceShuttle.tsx` - The controllable spacecraft
- `useShuttleControls.ts` - Hook for keyboard/device tilt controls
- `ProjectObject.tsx` / `SocialMediaObject.tsx` - Floating 3D objects
- `ProjectPopup.tsx` / `ContactPopup.tsx` - Info popups on collision
- `PrivacyNotice.tsx` - Cookie/localStorage consent banner
- `PrivacyPolicy.tsx` - Full GDPR privacy policy page (German only, accessed via footer link)
- `Impressum.tsx` - Legal notice with credits section (German only, accessed via footer link)
- `LanguageSwitcher.tsx` - DE/EN toggle

### Data Flow

1. `useShuttleControls` tracks shuttle position via arrow keys or device tilt
2. `SceneContent` checks distances between shuttle and objects each frame
3. On collision (distance < 3 units), parent `Scene` shows relevant popup
4. Popup state prevents re-triggering until user moves away

## Localization

Translation files in `src/locales/{en,de}.json`. Project/social descriptions use translation keys (e.g., `projects.bioexotec.description`).

## Architecture Decisions

- **No analytics/tracking**: Only localStorage for consent and language preference
- **Translation keys over strings**: All user-facing text uses i18next keys for full localization support
- **Collision-based navigation**: Interactive discovery rather than traditional menu navigation

## Assets & Credits

## <!-- Add asset sources/credits here -->

## Notes for Future Sessions

<!-- Add notes here as the project evolves -->
