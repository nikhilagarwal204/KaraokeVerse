# Requirements Document

## Introduction

KaraokeVerse is a browser-native VR karaoke platform built with the Immersive Web SDK (IWSDK). The platform enables fans to sing in themed virtual rooms styled after different fandoms (Anime, K-pop, Bollywood, Hollywood, Taylor Swift). This MVP focuses on a single-player karaoke experience with controller-based microphone interaction and YouTube-embedded song playback. Development uses Chrome with WebXR Emulator on macOS; the final app deploys to Meta Quest browser. Multiplayer synchronization is deferred to a future version.

## Glossary

- **IWSDK**: Immersive Web SDK - Meta's framework for building WebXR experiences
- **WebXR**: Web standard for VR/AR experiences in browsers
- **WebXR Emulator**: Chrome extension that simulates VR headset and controllers for development without hardware
- **Themed Room**: A virtual 3D environment styled after a specific fandom (e.g., Tokyo anime lounge, Seoul K-pop studio)
- **Controller**: VR input device (physical on Quest, emulated in Chrome) with trigger button for grabbing
- **Grab Button**: Controller trigger used to pick up and hold virtual objects
- **Player Profile**: User data including display name stored in the database
- **YouTube Embed**: Iframe-based integration of YouTube karaoke tracks for audio/video playback with built-in lyrics

## Requirements

### Requirement 1: Project Setup and WebXR Foundation

**User Story:** As a developer, I want a properly configured IWSDK project with WebXR capabilities, so that I can build immersive VR experiences testable in Chrome with WebXR Emulator and deployable to Meta Quest browsers.

#### Acceptance Criteria

1. WHEN the developer runs the project setup THEN the IWSDK Project SHALL initialize with TypeScript, VR mode, and grabbing features enabled
2. WHEN the application starts THEN the WebXR System SHALL request and establish an immersive VR session with controller support
3. WHEN running in Chrome with WebXR Emulator THEN the Application SHALL function correctly with emulated controllers

### Requirement 2: Themed Room System

**User Story:** As a karaoke fan, I want to select and enter themed virtual rooms based on my fandom interests, so that I can sing in an environment that matches my musical passion.

#### Acceptance Criteria

1. WHEN a player opens the application THEN the Room Selection UI SHALL display a menu of 5 themed rooms (Anime Tokyo Lounge, K-pop Seoul Studio, Bollywood Mumbai Rooftop, Hollywood LA Concert Hall, Taylor Swift Broadway Stage)
2. WHEN a player selects a themed room THEN the Room System SHALL load a simple 3D environment with colors and basic geometry representing that theme
3. WHEN a room is loaded THEN the Room System SHALL position the player in a designated singing area facing a virtual screen for lyrics/video

### Requirement 3: Controller-Based Microphone Interaction

**User Story:** As a singer, I want to grab a virtual microphone with my controller, so that I can have an intuitive and immersive karaoke experience.

#### Acceptance Criteria

1. WHEN a player enters a room THEN the Microphone System SHALL spawn a grabbable virtual microphone object within reach of the player
2. WHEN a player presses the grab button (trigger) near the microphone THEN the Grabbing System SHALL attach the microphone to the controller
3. WHEN a player releases the grab button THEN the Grabbing System SHALL detach the microphone and return it to its spawn position
4. WHEN a player holds the microphone THEN the Visual Feedback System SHALL display a color change indicating active state

### Requirement 4: Song Selection and YouTube Integration

**User Story:** As a singer, I want to search and select karaoke songs from YouTube, so that I can access a large catalog of music without licensing complexity.

#### Acceptance Criteria

1. WHEN a player is in a room THEN the Song Selection UI SHALL display a panel with a search input and song list
2. WHEN a player enters a search query THEN the Song Selection System SHALL filter or search for matching karaoke tracks
3. WHEN a player selects a song THEN the YouTube Integration System SHALL display the YouTube video on the virtual screen in the room
4. WHEN a song is playing THEN the Audio System SHALL output YouTube audio audibly in the VR environment
5. WHEN a player wants to stop or change songs THEN the Song Selection UI SHALL provide controls to stop playback and return to song selection

### Requirement 5: Player Profile System

**User Story:** As a returning user, I want to create and maintain a simple profile, so that my preferences are saved between sessions.

#### Acceptance Criteria

1. WHEN a new user opens the application THEN the Profile System SHALL prompt for a display name
2. WHEN a player sets their display name THEN the Profile System SHALL validate that the name is between 3 and 20 characters
3. WHEN a player's profile is created THEN the Storage System SHALL persist the profile data to the PostgreSQL database
4. WHEN a player returns to the application THEN the Profile System SHALL restore their previously saved display name

### Requirement 6: Backend API System

**User Story:** As a developer, I want a Node.js/Express backend with PostgreSQL, so that I can persist player profiles and song metadata.

#### Acceptance Criteria

1. WHEN the backend starts THEN the API System SHALL establish a connection to the PostgreSQL database
2. WHEN a client requests to create or update a profile THEN the API System SHALL store the player data and return confirmation
3. WHEN a client requests their profile THEN the API System SHALL return the stored profile data as JSON
4. WHEN the API receives invalid requests THEN the API System SHALL return appropriate HTTP error codes with descriptive messages

### Requirement 7: Database Schema Design

**User Story:** As a developer, I want a clean PostgreSQL schema for players and songs, so that data is organized and queryable.

#### Acceptance Criteria

1. WHEN the database is initialized THEN the Schema System SHALL create a players table with id, display_name, created_at, and last_active columns
2. WHEN the database is initialized THEN the Schema System SHALL create a songs table with id, youtube_id, title, artist, and theme columns for curated song suggestions
3. WHEN serializing player data THEN the Serialization System SHALL encode player objects as JSON for API responses
4. WHEN deserializing player data THEN the Serialization System SHALL decode JSON into valid player objects

### Requirement 8: VR User Interface

**User Story:** As a VR user, I want intuitive menus and controls that work with controllers, so that I can navigate the app without frustration.

#### Acceptance Criteria

1. WHEN displaying UI panels THEN the UI System SHALL render menus as 3D panels positioned in the user's view
2. WHEN a user points a controller at a UI element THEN the UI System SHALL highlight the element to indicate it is selectable
3. WHEN a user presses the trigger on a highlighted UI element THEN the UI System SHALL trigger the associated action (select room, play song, etc.)
4. WHEN a user needs to type THEN the UI System SHALL display a virtual keyboard for text input
