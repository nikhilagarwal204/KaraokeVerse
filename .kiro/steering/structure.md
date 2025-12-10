# Project Structure

```
├── src/                    # Frontend VR application
│   ├── index.ts           # Entry point, World initialization
│   ├── AppFlowController.ts  # Main state machine orchestrating user flow
│   ├── entities/          # 3D interactive objects
│   │   ├── Microphone.ts  # Grabbable microphone with visual feedback
│   │   └── VideoScreen.ts # YouTube video display
│   ├── scenes/
│   │   ├── SceneManager.ts   # Room loading/unloading, entity spawning
│   │   ├── ThemedRoom.ts     # Base class for all rooms
│   │   └── rooms/            # 5 themed room implementations
│   ├── services/
│   │   └── ProfileService.ts # API client for profile management
│   ├── types/
│   │   └── index.ts       # Shared types (RoomTheme, Song, Player, etc.)
│   └── ui/                # VR UI system
│       ├── UISystem.ts    # Panel/button management, raycasting
│       ├── UIController.ts   # Controller input processing
│       ├── *Panel.ts      # Individual UI panels (Profile, Room, Song)
│       └── VirtualKeyboard.ts
├── server/                # Express API backend
│   └── src/
│       ├── index.ts       # Server entry, middleware setup
│       ├── controllers/   # Request handlers
│       ├── routes/        # API route definitions
│       └── db/            # Database connection, migrations, seeds
├── public/                # Static assets
│   ├── audio/            # Sound effects
│   ├── gltf/             # 3D models
│   ├── textures/         # Image textures
│   └── ui/               # Compiled UI JSON
├── ui/                    # UIKitML source files (.uikitml)
└── dist/                  # Production build output
```

## Key Patterns

- **State Machine**: `AppFlowController` manages app states (initializing → profile-input → room-selection → in-room → song-search → playing-song)
- **Entity Pattern**: Interactive 3D objects extend a common pattern with `rootObject`, `dispose()`, position management
- **Scene Composition**: `ThemedRoom` base class with room-specific subclasses for decorations
- **UI Panels**: Each panel class wraps `UISystem` for specific functionality (profile input, room selection, etc.)
- **Service Layer**: Frontend services handle API communication with error handling
