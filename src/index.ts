/**
 * KaraokeVerse - Main Entry Point
 * Requirements: 1.2, 1.3, All (Integration)
 * 
 * Initializes IWSDK application with WebXR session,
 * controller input handling, and main render loop.
 * Orchestrates the complete user flow via AppFlowController.
 */

import {
  AssetManifest,
  AssetType,
  SessionMode,
  World,
  createSystem,
  Vector3,
} from "@iwsdk/core";

import { RoomTheme } from "./types/index.js";
import { SceneManager } from "./scenes/SceneManager.js";
import { ProfileService } from "./services/ProfileService.js";
import { MicrophoneEntity } from "./entities/index.js";
import { AppFlowController } from "./AppFlowController.js";

// Asset manifest for KaraokeVerse
const assets: AssetManifest = {
  chimeSound: {
    url: "./audio/chime.mp3",
    type: AssetType.Audio,
    priority: "background",
  },
};

// App configuration interface
export interface AppConfig {
  vrMode: 'vr' | 'ar';
  grabbing: boolean;
}

// Default app configuration
const appConfig: AppConfig = {
  vrMode: 'vr',
  grabbing: true,
};

// Global references for app state
let worldInstance: World | null = null;
let sceneManagerInstance: SceneManager | null = null;
let profileServiceInstance: ProfileService | null = null;
let appFlowControllerInstance: AppFlowController | null = null;

/**
 * Main application system that handles the render loop
 * and controller input processing
 * Requirements: 3.2, 3.3, All (Integration)
 */
export class KaraokeVerseSystem extends createSystem({}) {
  private frameCount = 0;
  private hasStartedFlow = false;

  init() {
    console.log('[KaraokeVerse] System initialized');
  }

  /**
   * Main render loop - called every frame
   * Handles controller input and scene updates
   */
  update(delta: number) {
    this.frameCount++;
    
    // Start the app flow once we're in VR (after first few frames to ensure everything is ready)
    if (!this.hasStartedFlow && this.frameCount > 10 && appFlowControllerInstance) {
      this.hasStartedFlow = true;
      appFlowControllerInstance.start();
    }
    
    // Update app flow controller (handles UI and microphone input)
    if (appFlowControllerInstance) {
      appFlowControllerInstance.update(delta);
    }
    
    // Update scene manager if active
    if (sceneManagerInstance) {
      sceneManagerInstance.update(delta);
    }
  }
}

/**
 * Initialize the KaraokeVerse application
 */
async function initializeApp(): Promise<void> {
  console.log('[KaraokeVerse] Initializing application...');

  try {
    // Create the IWSDK World with WebXR configuration
    const world = await World.create(
      document.getElementById("scene-container") as HTMLDivElement,
      {
        assets,
        xr: {
          sessionMode: SessionMode.ImmersiveVR,
          offer: "always",
          features: {
            handTracking: { optional: true },
            layers: { optional: true },
          },
        },
        features: {
          locomotion: false,
          grabbing: appConfig.grabbing,
          physics: false,
          sceneUnderstanding: false,
        },
      }
    );

    worldInstance = world;
    console.log('[KaraokeVerse] World created successfully');

    // Set initial camera position
    const { camera } = world;
    camera.position.set(0, 1.6, 0); // Standing height
    camera.rotation.set(0, 0, 0);

    // Initialize services
    profileServiceInstance = new ProfileService();
    console.log('[KaraokeVerse] Profile service initialized');

    // Initialize scene manager
    sceneManagerInstance = new SceneManager(world);
    console.log('[KaraokeVerse] Scene manager initialized');

    // Initialize app flow controller (orchestrates the complete user flow)
    appFlowControllerInstance = new AppFlowController(
      world,
      sceneManagerInstance,
      profileServiceInstance
    );
    console.log('[KaraokeVerse] App flow controller initialized');

    // Register the main application system
    world.registerSystem(KaraokeVerseSystem);
    console.log('[KaraokeVerse] Main system registered');

    // Set up XR session event handlers
    setupXREventHandlers(world);

    console.log('[KaraokeVerse] Application initialized successfully');
    console.log('[KaraokeVerse] Click "Enter VR" to start the experience');

  } catch (error) {
    console.error('[KaraokeVerse] Failed to initialize:', error);
    showErrorMessage('Failed to initialize VR application. Please check WebXR support.');
  }
}

/**
 * Set up WebXR session event handlers
 * Requirements: 6.4 - Handle WebXR session errors gracefully
 */
function setupXREventHandlers(world: World): void {
  // Listen for XR session start
  world.visibilityState.subscribe((state) => {
    console.log('[KaraokeVerse] Visibility state changed:', state);
  });

  // Handle XR session errors
  if (world.xrSession) {
    world.xrSession.addEventListener('end', () => {
      console.log('[KaraokeVerse] XR session ended');
      showInfoMessage('VR session ended. Click "Enter VR" to restart.');
    });
  }
}

/**
 * Display info message to user
 * Requirements: 6.4
 */
function showInfoMessage(message: string): void {
  const container = document.getElementById("scene-container");
  if (container) {
    // Remove any existing info messages
    const existingInfo = container.querySelector('.info-message');
    if (existingInfo) {
      existingInfo.remove();
    }
    
    const infoDiv = document.createElement("div");
    infoDiv.className = 'info-message';
    infoDiv.style.cssText = `
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(39, 174, 96, 0.9);
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      font-family: sans-serif;
      text-align: center;
      z-index: 1000;
    `;
    infoDiv.textContent = message;
    container.appendChild(infoDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      infoDiv.remove();
    }, 5000);
  }
}

/**
 * Display error message to user
 */
function showErrorMessage(message: string): void {
  const container = document.getElementById("scene-container");
  if (container) {
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 0, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 8px;
      font-family: sans-serif;
      text-align: center;
    `;
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
  }
}

// Export getters for global instances
export function getWorld(): World | null {
  return worldInstance;
}

export function getSceneManager(): SceneManager | null {
  return sceneManagerInstance;
}

export function getProfileService(): ProfileService | null {
  return profileServiceInstance;
}

export function getAppFlowController(): AppFlowController | null {
  return appFlowControllerInstance;
}

// Initialize the application when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
