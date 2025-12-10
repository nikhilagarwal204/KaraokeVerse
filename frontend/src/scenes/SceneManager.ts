/**
 * KaraokeVerse - Scene Manager
 * Requirements: 2.2, 2.3, 3.1
 * 
 * Manages loading/unloading of themed rooms and handles scene transitions.
 * Also manages microphone spawning when rooms are loaded.
 */

import {
  World,
  Vector3,
} from "@iwsdk/core";

import { RoomTheme } from "../types/index.js";
import { ThemedRoom } from "./ThemedRoom.js";
import {
  AnimeTokyoLounge,
  KpopSeoulStudio,
  BollywoodMumbaiRooftop,
  HollywoodLAConcertHall,
  TaylorSwiftBroadwayStage,
} from "./rooms/index.js";
import { MicrophoneEntity, VideoScreen } from "../entities/index.js";

/**
 * Factory function to create the appropriate ThemedRoom instance
 */
function createThemedRoom(theme: RoomTheme): ThemedRoom {
  switch (theme) {
    case 'anime':
      return new AnimeTokyoLounge();
    case 'kpop':
      return new KpopSeoulStudio();
    case 'bollywood':
      return new BollywoodMumbaiRooftop();
    case 'hollywood':
      return new HollywoodLAConcertHall();
    case 'taylor-swift':
      return new TaylorSwiftBroadwayStage();
    default:
      throw new Error(`Unknown room theme: ${theme}`);
  }
}

/**
 * Scene Manager - handles loading and unloading of themed rooms
 */
export class SceneManager {
  private world: World;
  private currentRoom: ThemedRoom | null = null;
  private currentMicrophone: MicrophoneEntity | null = null;
  private currentVideoScreen: VideoScreen | null = null;

  constructor(world: World) {
    this.world = world;
    console.log('[SceneManager] Initialized');
  }

  /**
   * Get the current microphone instance
   */
  getCurrentMicrophone(): MicrophoneEntity | null {
    return this.currentMicrophone;
  }

  /**
   * Get the current video screen instance
   * Requirements: 4.3
   */
  getCurrentVideoScreen(): VideoScreen | null {
    return this.currentVideoScreen;
  }

  /**
   * Get the currently loaded room theme
   */
  getCurrentTheme(): RoomTheme | null {
    return this.currentRoom?.theme ?? null;
  }

  /**
   * Get the current room data
   */
  getCurrentRoom(): ThemedRoom | null {
    return this.currentRoom;
  }

  /**
   * Load a themed room by theme name
   * Requirements: 2.2, 2.3
   */
  async loadRoom(theme: RoomTheme): Promise<void> {
    console.log(`[SceneManager] Loading room: ${theme}`);

    // Unload current room if one exists
    if (this.currentRoom) {
      this.unloadCurrentRoom();
    }

    // Create the appropriate themed room instance
    const room = createThemedRoom(theme);
    
    // Set up the room (creates geometry, lighting, decorations)
    room.setup();

    // Add room to scene
    this.world.scene.add(room.rootObject);

    // Store current room
    this.currentRoom = room;

    // Position player at spawn point
    const spawnPosition = new Vector3().copy(room.spawnPoint);
    spawnPosition.y = 1.6; // Eye height
    this.world.camera.position.copy(spawnPosition);

    // Spawn microphone in the room
    // Requirements: 3.1 - spawn grabbable microphone within reach of player
    this.spawnMicrophone(room.microphonePosition);

    // Spawn video screen in the room
    // Requirements: 4.3 - display YouTube video on virtual screen
    this.spawnVideoScreen(room.screenPosition);

    console.log(`[SceneManager] Room loaded: ${room.config.displayName}`);
  }

  /**
   * Spawn a microphone at the specified position
   * Requirements: 3.1
   */
  private spawnMicrophone(position: Vector3): void {
    // Clean up existing microphone if any
    if (this.currentMicrophone) {
      this.despawnMicrophone();
    }

    // Create new microphone entity
    this.currentMicrophone = new MicrophoneEntity(position);
    
    // Add to scene
    this.world.scene.add(this.currentMicrophone.rootObject);

    console.log('[SceneManager] Microphone spawned at:', position);
  }

  /**
   * Remove the current microphone from the scene
   */
  private despawnMicrophone(): void {
    if (!this.currentMicrophone) return;

    // Remove from scene
    this.world.scene.remove(this.currentMicrophone.rootObject);
    
    // Dispose resources
    this.currentMicrophone.dispose();
    this.currentMicrophone = null;

    console.log('[SceneManager] Microphone despawned');
  }

  /**
   * Spawn a video screen at the specified position
   * Requirements: 4.3
   */
  private spawnVideoScreen(position: Vector3): void {
    // Clean up existing video screen if any
    if (this.currentVideoScreen) {
      this.despawnVideoScreen();
    }

    // Create new video screen entity
    this.currentVideoScreen = new VideoScreen(position);
    
    // Add to scene
    this.world.scene.add(this.currentVideoScreen.rootObject);

    console.log('[SceneManager] Video screen spawned at:', position);
  }

  /**
   * Remove the current video screen from the scene
   */
  private despawnVideoScreen(): void {
    if (!this.currentVideoScreen) return;

    // Remove from scene
    this.world.scene.remove(this.currentVideoScreen.rootObject);
    
    // Dispose resources
    this.currentVideoScreen.dispose();
    this.currentVideoScreen = null;

    console.log('[SceneManager] Video screen despawned');
  }

  /**
   * Unload the current room and clean up resources
   */
  unloadCurrentRoom(): void {
    if (!this.currentRoom) {
      console.log('[SceneManager] No room to unload');
      return;
    }

    console.log(`[SceneManager] Unloading room: ${this.currentRoom.theme}`);

    // Despawn microphone first
    this.despawnMicrophone();

    // Despawn video screen
    this.despawnVideoScreen();

    // Remove room from scene
    this.world.scene.remove(this.currentRoom.rootObject);
    
    // Clean up room resources
    this.currentRoom.cleanup();

    this.currentRoom = null;

    console.log('[SceneManager] Room unloaded');
  }

  /**
   * Update method called each frame
   */
  update(delta: number): void {
    // Room-specific updates can be added here
    // e.g., animated elements, particle effects
  }

  /**
   * Load and play a YouTube video on the current room's video screen
   * Requirements: 4.3, 4.4
   */
  playVideo(youtubeId: string): void {
    if (!this.currentVideoScreen) {
      console.warn('[SceneManager] No video screen available');
      return;
    }
    this.currentVideoScreen.loadVideo(youtubeId);
  }

  /**
   * Pause the current video
   */
  pauseVideo(): void {
    if (!this.currentVideoScreen) {
      console.warn('[SceneManager] No video screen available');
      return;
    }
    this.currentVideoScreen.pause();
  }

  /**
   * Resume the current video
   */
  resumeVideo(): void {
    if (!this.currentVideoScreen) {
      console.warn('[SceneManager] No video screen available');
      return;
    }
    this.currentVideoScreen.play();
  }

  /**
   * Stop the current video
   * Requirements: 4.5
   */
  stopVideo(): void {
    if (!this.currentVideoScreen) {
      console.warn('[SceneManager] No video screen available');
      return;
    }
    this.currentVideoScreen.stop();
  }

  /**
   * Check if a video is currently playing
   */
  isVideoPlaying(): boolean {
    return this.currentVideoScreen?.isPlaying ?? false;
  }
}
