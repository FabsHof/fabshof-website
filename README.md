# Space Portfolio - Interactive 3D Portfolio Website

An immersive 3D portfolio platform featuring a navigable space shuttle exploring projects in a space environment.

## Features

- **3D Space Environment**: Realistic space scene with stars, sun lighting, and a reflective black glass surface
- **Interactive Space Shuttle**: Simplified 3D space shuttle model that you can control
- **Keyboard Navigation** (Desktop): Use arrow keys to navigate
  - ↑/↓: Move forward/backward
  - ←/→: Rotate left/right
- **Device Motion Controls** (Mobile): Tilt your smartphone to control the shuttle
- **Project Displays**: Floating 3D objects representing different projects
- **Responsive Design**: Works seamlessly on both desktop and mobile devices
- **Optimized Build**: Production build with code minification and chunking

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for React Three Fiber

## Getting Started

### Prerequisites

- Node.js (v20.11.1 or higher)
- npm (v10.2.4 or higher)

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The development server will start at `http://localhost:3000` and automatically open in your browser.

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The production build will be output to the `dist` directory with:

- Minified code (console logs and debugger statements removed)
- Code splitting (separate chunks for Three.js and React Three libraries)
- Optimized assets

## Project Structure

```
src/
├── components/
│   ├── Scene.tsx              # Main 3D scene component
│   ├── SpaceShuttle.tsx       # Space shuttle 3D model
│   ├── SpaceEnvironment.tsx   # Space background (stars, sun, surface)
│   ├── ProjectObject.tsx      # Project placeholder objects
│   ├── UIOverlay.tsx          # UI overlay with instructions
│   └── UIOverlay.css          # UI overlay styles
├── hooks/
│   └── useShuttleControls.ts  # Custom hook for keyboard & device motion controls
├── App.tsx                    # Main app component
├── App.css                    # Global app styles
└── index.css                  # Global base styles
```

## Customization

### Adding Your Projects

Edit [src/components/Scene.tsx](src/components/Scene.tsx#L10-L18) to customize project positions, titles, and colors:

```typescript
const projects = [
  { position: [10, 1, 10], title: 'Your Project Name', color: '#4a90e2' },
  // Add more projects...
];
```

### Adjusting Controls

Modify [src/hooks/useShuttleControls.ts](src/hooks/useShuttleControls.ts) to adjust:

- Acceleration speed
- Max speed
- Rotation speed
- Friction
- Navigation boundaries

### Styling

Update colors and styling in:

- [src/components/UIOverlay.css](src/components/UIOverlay.css) - UI overlay styles
- [src/components/SpaceShuttle.tsx](src/components/SpaceShuttle.tsx) - Shuttle colors and materials
- [src/components/ProjectObject.tsx](src/components/ProjectObject.tsx) - Project object appearance

## Controls

### Desktop

- **Arrow Up**: Move forward
- **Arrow Down**: Move backward
- **Arrow Left**: Rotate left
- **Arrow Right**: Rotate right
- **Mouse**: Orbit camera view (drag)
- **Scroll**: Zoom in/out

### Mobile

- **Tilt Device**: Navigate the shuttle
- **Touch**: Orbit camera view (drag)
- **Pinch**: Zoom in/out

## Performance

The application is optimized for performance with:

- Hardware-accelerated WebGL rendering
- Efficient 3D model geometry
- Proper code splitting
- Production minification
- Shadow mapping for realistic lighting

## Code Quality

### Linting & Formatting

This project uses ESLint and Prettier for consistent code quality:

```bash
# Check code style
npm run lint

# Auto-fix ESLint issues
npm run lint:fix

# Format all files with Prettier
npm run format

# Check formatting (used in CI)
npm run format:check
```

### Pre-commit Hooks

Husky + lint-staged automatically run on every commit to ensure code quality:

- **TypeScript/TSX files**: ESLint fix + Prettier format
- **Other files** (JS, JSON, CSS, MD): Prettier format

### VS Code Integration

The project includes VS Code settings for the best developer experience:

- **Format on save** enabled
- **ESLint auto-fix** on save
- Recommended extensions: Prettier + ESLint

Install recommended extensions when prompted, or run:
`Extensions: Show Recommended Extensions` from the command palette.

### CI/CD

Pull requests are automatically checked for:

1. ✅ Formatting (Prettier)
2. ✅ Linting (ESLint)
3. ✅ Build success

## Browser Compatibility

Works best on modern browsers with WebGL 2.0 support:

- Chrome/Edge 80+
- Firefox 75+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android)

## License

MIT License - feel free to use this for your own portfolio!

## Author

Fabian Hofmann - Data Engineer | ML Engineer
