# Tech Stack

## Frontend (VR Client)

- **Runtime**: IWSDK (`@iwsdk/core`) - WebXR framework for Meta Quest
- **3D Engine**: Three.js (via `super-three@0.177.0`)
- **Build**: Vite 7.x with TypeScript
- **Target**: Meta Quest 3 (WebXR immersive-vr)

### Vite Plugins
- `@iwsdk/vite-plugin-iwer` - WebXR emulation for development
- `@iwsdk/vite-plugin-gltf-optimizer` - GLTF asset optimization
- `@iwsdk/vite-plugin-uikitml` - UI markup compilation (`.uikitml` → JSON)
- `vite-plugin-mkcert` - HTTPS for WebXR

## Backend (API Server)

- **Runtime**: Node.js 20.19+
- **Framework**: Express 4.x
- **Database**: PostgreSQL (via `pg`)
- **Dev Runner**: tsx (TypeScript execution)

## Common Commands

### Frontend
```bash
npm run dev      # Start dev server (https://localhost:8081)
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

### Backend (run from /server)
```bash
npm run dev      # Start with hot reload
npm run build    # Compile TypeScript
npm run start    # Run compiled JS
npm run migrate  # Run database migrations
npm run seed     # Seed database
```

## TypeScript Config

- Target: ES2020
- Module: ESNext with Bundler resolution
- Strict mode enabled
- File extensions required in imports (`.js` suffix)
