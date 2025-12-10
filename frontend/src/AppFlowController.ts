/**
 * KaraokeVerse - App Flow Controller
 * Requirements: All (Integration)
 * 
 * Manages the complete user flow:
 * App start → Profile check/create → Room selection → Enter room → Song selection → Sing
 */

import { World, Vector3, Raycaster } from "@iwsdk/core";

import { RoomTheme } from "./types/index.js";
import { SceneManager } from "./scenes/SceneManager.js";
import { ProfileService } from "./services/ProfileService.js";
import {
  UISystem,
  UIController,
  ProfileInputPanel,
  RoomSelectionPanel,
  SongSearchPanel,
  VirtualKeyboard,
  LoadingIndicator,
  ErrorDisplay,
} from "./ui/index.js";

/**
 * Application states for the user flow
 */
export type AppState = 
  | 'initializing'
  | 'profile-input'
  | 'room-selection'
  | 'loading-room'
  | 'in-room'
  | 'song-search'
  | 'playing-song'
  | 'error';

/**
 * AppFlowController - orchestrates the complete user experience
 */
export class AppFlowController {
  private world: World;
  private sceneManager: SceneManager;
  private profileService: ProfileService;
  
  // UI Components
  private uiSystem: UISystem;
  private uiController: UIController;
  private profileInputPanel: ProfileInputPanel;
  private roomSelectionPanel: RoomSelectionPanel;
  private songSearchPanel: SongSearchPanel;
  private virtualKeyboard: VirtualKeyboard;
  private loadingIndicator: LoadingIndicator;
  private errorDisplay: ErrorDisplay;
  
  // State management
  private currentState: AppState = 'initializing';
  private currentKeyboardTarget: 'profile' | 'song-search' | null = null;
  private lastFailedAction: (() => Promise<void>) | null = null;
  
  // Track trigger state per controller
  private triggerStates: Map<XRInputSource, boolean> = new Map();

  constructor(
    world: World,
    sceneManager: SceneManager,
    profileService: ProfileService
  ) {
    this.world = world;
    this.sceneManager = sceneManager;
    this.profileService = profileService;
    
    // Initialize UI system
    this.uiSystem = new UISystem();
    this.uiController = new UIController(this.uiSystem);
    
    // Initialize UI panels
    this.profileInputPanel = new ProfileInputPanel(this.uiSystem);
    this.roomSelectionPanel = new RoomSelectionPanel(this.uiSystem);
    this.songSearchPanel = new SongSearchPanel(this.uiSystem);
    this.virtualKeyboard = new VirtualKeyboard(this.uiSystem);
    
    // Initialize loading and error displays
    this.loadingIndicator = new LoadingIndicator();
    this.errorDisplay = new ErrorDisplay();
    
    // Set up callbacks
    this.setupCallbacks();
    
    // Add UI elements to scene
    this.addUIToScene();
    
    // Set up desktop input for browser testing
    this.setupDesktopInput();
    
    console.log('[AppFlowController] Initialized');
  }

  /**
   * Set up all UI callbacks
   */
  private setupCallbacks(): void {
    // Profile input callbacks
    this.profileInputPanel.setOnSubmit((name) => this.handleProfileSubmit(name));
    this.profileInputPanel.setOnOpenKeyboard(() => this.openKeyboard('profile'));
    
    // Room selection callback
    this.roomSelectionPanel.setOnRoomSelect((theme) => this.handleRoomSelect(theme));
    
    // Song search callbacks
    this.songSearchPanel.setOnSongSelect((youtubeId) => this.handleSongSelect(youtubeId));
    this.songSearchPanel.setOnStop(() => this.handleStopSong());
    this.songSearchPanel.setOnBack(() => this.handleBackToRoomSelection());
    this.songSearchPanel.setOnOpenKeyboard(() => this.openKeyboard('song-search'));
    
    // Virtual keyboard callbacks
    this.virtualKeyboard.setOnTextChange((text) => this.handleKeyboardTextChange(text));
    this.virtualKeyboard.setOnDone((text) => this.handleKeyboardDone(text));
    
    // Error display callbacks
    this.errorDisplay.setOnRetry(() => this.handleErrorRetry());
    this.errorDisplay.setOnDismiss(() => this.handleErrorDismiss());
  }

  /**
   * Add UI elements to the scene
   */
  private addUIToScene(): void {
    // Add UI panel objects to scene
    const profilePanel = this.uiSystem.getPanelObject('profile-input');
    const roomPanel = this.uiSystem.getPanelObject('room-selection');
    const songPanel = this.uiSystem.getPanelObject('song-search');
    const keyboardPanel = this.uiSystem.getPanelObject('keyboard');
    
    if (profilePanel) this.world.scene.add(profilePanel);
    if (roomPanel) this.world.scene.add(roomPanel);
    if (songPanel) this.world.scene.add(songPanel);
    if (keyboardPanel) this.world.scene.add(keyboardPanel);
    
    // Add loading indicator and error display
    this.world.scene.add(this.loadingIndicator.getRootObject());
    this.world.scene.add(this.errorDisplay.getRootObject());
    
    // Add ray visualization
    this.world.scene.add(this.uiController.getRayContainer());
  }

  /**
   * Start the application flow
   * Requirements: 5.1, 5.4
   */
  async start(): Promise<void> {
    console.log('[AppFlowController] Starting application flow...');
    this.setState('initializing');
    
    // Show loading indicator
    this.showLoading('Loading profile...');
    
    try {
      // Check for existing profile
      const existingProfile = await this.profileService.loadCachedProfile();
      
      // Hide loading
      this.hideLoading();
      
      if (existingProfile) {
        console.log('[AppFlowController] Found existing profile:', existingProfile.displayName);
        // Go directly to room selection
        this.showRoomSelection();
      } else {
        console.log('[AppFlowController] No profile found, showing profile input');
        // Show profile input for new users
        this.showProfileInput();
      }
    } catch (error) {
      console.error('[AppFlowController] Error during startup:', error);
      this.hideLoading();
      // On error, show profile input as fallback
      this.showProfileInput();
    }
  }

  /**
   * Set the current application state
   */
  private setState(state: AppState): void {
    console.log(`[AppFlowController] State: ${this.currentState} → ${state}`);
    this.currentState = state;
  }

  /**
   * Get the current application state
   */
  getState(): AppState {
    return this.currentState;
  }

  /**
   * Show loading indicator
   * Requirements: 6.4
   */
  private showLoading(message: string): void {
    this.positionOverlayInFrontOfCamera(this.loadingIndicator);
    this.loadingIndicator.show(message);
  }

  /**
   * Hide loading indicator
   */
  private hideLoading(): void {
    this.loadingIndicator.hide();
  }

  /**
   * Show error display
   * Requirements: 6.4
   */
  private showError(message: string, retryAction?: () => Promise<void>): void {
    this.lastFailedAction = retryAction || null;
    this.positionOverlayInFrontOfCamera(this.errorDisplay);
    this.errorDisplay.show(message);
    this.setState('error');
  }

  /**
   * Position an overlay (loading/error) in front of camera
   */
  private positionOverlayInFrontOfCamera(overlay: LoadingIndicator | ErrorDisplay): void {
    const camera = this.world.camera;
    const cameraPosition = camera.position.clone();
    const cameraDirection = new Vector3(0, 0, -1);
    cameraDirection.applyQuaternion(camera.quaternion);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    overlay.positionInFrontOfCamera(cameraPosition, cameraDirection);
  }

  /**
   * Handle error retry button
   */
  private async handleErrorRetry(): Promise<void> {
    if (this.lastFailedAction) {
      await this.lastFailedAction();
    }
  }

  /**
   * Handle error dismiss button
   */
  private handleErrorDismiss(): void {
    this.errorDisplay.hide();
    // Return to appropriate state based on context
    if (this.sceneManager.getCurrentRoom()) {
      this.showSongSearch();
    } else {
      this.showRoomSelection();
    }
  }

  /**
   * Show the profile input panel
   * Requirements: 5.1
   */
  private showProfileInput(): void {
    this.setState('profile-input');
    this.uiSystem.hideAllPanels();
    this.profileInputPanel.reset();
    this.profileInputPanel.show();
    this.positionPanelInFrontOfCamera('profile-input');
  }

  /**
   * Show the room selection panel
   * Requirements: 2.1
   */
  private showRoomSelection(): void {
    this.setState('room-selection');
    this.uiSystem.hideAllPanels();
    this.roomSelectionPanel.show();
    this.positionPanelInFrontOfCamera('room-selection');
  }

  /**
   * Show the song search panel
   * Requirements: 4.1
   */
  private async showSongSearch(): Promise<void> {
    this.setState('song-search');
    this.uiSystem.hideAllPanels();
    
    // Show loading while fetching songs
    this.showLoading('Loading songs...');
    
    try {
      // Load songs for the current room theme
      const currentTheme = this.sceneManager.getCurrentTheme();
      if (currentTheme) {
        await this.songSearchPanel.loadSongs(currentTheme);
      } else {
        await this.songSearchPanel.loadSongs();
      }
      
      this.hideLoading();
      this.songSearchPanel.show();
      this.positionPanelInFrontOfCamera('song-search');
    } catch (error) {
      this.hideLoading();
      console.error('[AppFlowController] Failed to load songs:', error);
      this.showError('Failed to load songs. Please try again.', () => this.showSongSearch());
    }
  }

  /**
   * Position a panel in front of the camera
   */
  private positionPanelInFrontOfCamera(panelType: 'profile-input' | 'room-selection' | 'song-search' | 'keyboard'): void {
    const camera = this.world.camera;
    const cameraPosition = camera.position.clone();
    
    // Get camera forward direction
    const cameraDirection = new Vector3(0, 0, -1);
    cameraDirection.applyQuaternion(camera.quaternion);
    cameraDirection.y = 0; // Keep horizontal
    cameraDirection.normalize();
    
    this.uiSystem.positionPanelInFrontOfCamera(
      panelType,
      cameraPosition,
      cameraDirection
    );
  }

  /**
   * Open the virtual keyboard
   */
  private openKeyboard(target: 'profile' | 'song-search'): void {
    this.currentKeyboardTarget = target;
    
    // Set initial text based on target
    if (target === 'profile') {
      this.virtualKeyboard.setText(this.profileInputPanel.getDisplayName());
      this.virtualKeyboard.setMaxLength(20);
    } else {
      this.virtualKeyboard.setText('');
      this.virtualKeyboard.setMaxLength(50);
    }
    
    this.virtualKeyboard.show();
    this.positionPanelInFrontOfCamera('keyboard');
  }

  /**
   * Handle keyboard text changes
   */
  private handleKeyboardTextChange(text: string): void {
    if (this.currentKeyboardTarget === 'profile') {
      this.profileInputPanel.setDisplayName(text);
    } else if (this.currentKeyboardTarget === 'song-search') {
      this.songSearchPanel.setSearchQuery(text);
    }
  }

  /**
   * Handle keyboard done
   */
  private async handleKeyboardDone(text: string): Promise<void> {
    if (this.currentKeyboardTarget === 'profile') {
      this.profileInputPanel.setDisplayName(text);
    } else if (this.currentKeyboardTarget === 'song-search') {
      this.songSearchPanel.setSearchQuery(text);
      // Trigger search
      await this.songSearchPanel.searchSongs(text);
    }
    
    this.currentKeyboardTarget = null;
  }

  /**
   * Handle profile submission
   * Requirements: 5.2, 5.3, 6.4
   */
  private async handleProfileSubmit(name: string): Promise<void> {
    console.log('[AppFlowController] Profile submitted:', name);
    
    // Show loading
    this.showLoading('Creating profile...');
    
    try {
      // Create profile via API
      await this.profileService.createProfile(name);
      console.log('[AppFlowController] Profile created successfully');
      
      this.hideLoading();
      
      // Move to room selection
      this.showRoomSelection();
    } catch (error) {
      this.hideLoading();
      console.error('[AppFlowController] Failed to create profile:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile';
      this.showError(errorMessage, () => this.handleProfileSubmit(name));
    }
  }

  /**
   * Handle room selection
   * Requirements: 2.2, 2.3, 6.4
   */
  private async handleRoomSelect(theme: RoomTheme): Promise<void> {
    console.log('[AppFlowController] Room selected:', theme);
    this.setState('loading-room');
    
    // Hide UI while loading
    this.uiSystem.hideAllPanels();
    
    // Show loading indicator
    this.showLoading('Loading room...');
    
    try {
      // Load the selected room
      await this.sceneManager.loadRoom(theme);
      console.log('[AppFlowController] Room loaded successfully');
      
      this.hideLoading();
      
      // Transition to in-room state
      this.setState('in-room');
      
      // Show song search panel after a brief delay
      setTimeout(() => {
        this.showSongSearch();
      }, 500);
    } catch (error) {
      this.hideLoading();
      console.error('[AppFlowController] Failed to load room:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to load room';
      this.showError(errorMessage, () => this.handleRoomSelect(theme));
    }
  }

  /**
   * Handle song selection
   * Requirements: 4.3, 4.4
   */
  private handleSongSelect(youtubeId: string): void {
    console.log('[AppFlowController] Song selected:', youtubeId);
    this.setState('playing-song');
    
    // Hide song search panel
    this.songSearchPanel.hide();
    
    // Play the video
    this.sceneManager.playVideo(youtubeId);
  }

  /**
   * Handle stop song
   * Requirements: 4.5
   */
  private handleStopSong(): void {
    console.log('[AppFlowController] Stopping song');
    
    // Stop video playback
    this.sceneManager.stopVideo();
    
    // Return to song search
    this.setState('in-room');
  }

  /**
   * Handle back to room selection
   */
  private handleBackToRoomSelection(): void {
    console.log('[AppFlowController] Returning to room selection');
    
    // Stop any playing video
    this.sceneManager.stopVideo();
    
    // Unload current room
    this.sceneManager.unloadCurrentRoom();
    
    // Show room selection
    this.showRoomSelection();
  }

  /**
   * Update method - called each frame
   * Processes controller input for UI interaction (XR mode)
   * Also handles desktop mouse/keyboard input for testing
   */
  update(delta: number): void {
    // Update loading indicator animation
    this.loadingIndicator.update(delta);
    
    const xrSession = this.world.xrSession;
    const xrFrame = this.world.xrFrame;
    const referenceSpace = this.world.xrReferenceSpace;
    
    // Don't process UI input while loading or showing error
    if (this.loadingIndicator.getIsVisible()) return;
    
    // Process XR controller input if in XR mode
    if (xrSession && xrFrame && referenceSpace) {
      // Process UI controller input for 3D spatial interaction
      // This handles raycasting from VR controllers and trigger presses
      this.uiController.processControllerInput(
        xrFrame,
        referenceSpace,
        xrSession.inputSources
      );
      
      // Process microphone grabbing when in room
      if (this.currentState === 'in-room' || this.currentState === 'playing-song') {
        this.processMicrophoneInput(xrFrame, referenceSpace, xrSession.inputSources);
      }
    } else {
      // Desktop mode - process mouse input for browser testing only
      // In XR mode, VR controllers are used automatically
      this.processDesktopInput();
    }
  }

  /**
   * Process desktop mouse and keyboard input for browser testing
   * This allows testing UI interactions without VR headset
   */
  private processDesktopInput(): void {
    // This will be called from event handlers
    // Mouse click and keyboard handling is set up in setupDesktopInput()
  }

  /**
   * Set up desktop input handlers for browser testing
   * Allows clicking buttons with mouse (for testing without VR headset)
   * In XR mode, VR controllers are used automatically
   */
  private setupDesktopInput(): void {
    // Get the renderer canvas
    const canvas = this.world.renderer.domElement;
    
    // Mouse click handler
    const onMouseClick = (event: MouseEvent) => {
      if (!this.uiSystem.hasVisiblePanel()) return;
      
      // Get mouse position in normalized device coordinates (-1 to +1)
      const rect = canvas.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Create ray from camera through mouse position
      const camera = this.world.camera;
      
      // Calculate direction: forward direction adjusted by mouse offset
      // Camera forward is -Z, so we adjust based on mouse position
      const forward = new Vector3(0, 0, -1);
      forward.applyQuaternion(camera.quaternion);
      
      // Calculate right and up vectors
      const right = new Vector3(1, 0, 0);
      right.applyQuaternion(camera.quaternion);
      const up = new Vector3(0, 1, 0);
      up.applyQuaternion(camera.quaternion);
      
      // Adjust direction based on mouse position (simple approximation)
      const fov = Math.PI / 4; // 45 degrees, adjust if needed
      const direction = forward.clone()
        .add(right.clone().multiplyScalar(mouseX * Math.tan(fov / 2)))
        .add(up.clone().multiplyScalar(mouseY * Math.tan(fov / 2)))
        .normalize();
      
      // Use UISystem's raycast method
      const hoveredButton = this.uiSystem.handleRaycast(camera.position, direction);
      
      if (hoveredButton) {
        console.log(`[AppFlowController] Desktop click on button: ${hoveredButton.id} (${hoveredButton.label})`);
        hoveredButton.onClick();
      }
    };
    
    // Mouse move handler for hover feedback
    const onMouseMove = (event: MouseEvent) => {
      if (!this.uiSystem.hasVisiblePanel()) return;
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      const camera = this.world.camera;
      
      // Calculate direction same as click handler
      const forward = new Vector3(0, 0, -1);
      forward.applyQuaternion(camera.quaternion);
      const right = new Vector3(1, 0, 0);
      right.applyQuaternion(camera.quaternion);
      const up = new Vector3(0, 1, 0);
      up.applyQuaternion(camera.quaternion);
      
      const fov = Math.PI / 4;
      const direction = forward.clone()
        .add(right.clone().multiplyScalar(mouseX * Math.tan(fov / 2)))
        .add(up.clone().multiplyScalar(mouseY * Math.tan(fov / 2)))
        .normalize();
      
      // Update hover state using UISystem
      this.uiSystem.handleRaycast(camera.position, direction);
    };
    
    // Add event listeners (mouse only - no keyboard shortcuts)
    canvas.addEventListener('click', onMouseClick);
    canvas.addEventListener('mousemove', onMouseMove);
    
    // Store handlers for cleanup
    (this as any).desktopInputHandlers = {
      click: onMouseClick,
      move: onMouseMove,
      canvas
    };
    
    console.log('[AppFlowController] Desktop mouse input set up for browser testing');
    console.log('[AppFlowController] Note: In XR mode, use VR controllers to interact with buttons');
  }

  /**
   * Process microphone grabbing input
   * Requirements: 3.2, 3.3
   */
  private processMicrophoneInput(
    xrFrame: XRFrame,
    referenceSpace: XRReferenceSpace,
    inputSources: XRInputSourceArray
  ): void {
    const microphone = this.sceneManager.getCurrentMicrophone();
    if (!microphone) return;

    const tempVec3 = new Vector3();

    for (const source of inputSources) {
      if (!source.gamepad) continue;

      const triggerButton = source.gamepad.buttons[0];
      const isTriggerPressed = triggerButton && triggerButton.pressed;
      const wasTriggerPressed = this.triggerStates.get(source) || false;

      const gripSpace = source.gripSpace;
      if (!gripSpace) continue;

      const pose = xrFrame.getPose(gripSpace, referenceSpace);
      if (!pose) continue;

      const controllerPosition = tempVec3.set(
        pose.transform.position.x,
        pose.transform.position.y,
        pose.transform.position.z
      );

      // Handle trigger press (grab)
      if (isTriggerPressed && !wasTriggerPressed) {
        if (!microphone.isGrabbed && microphone.isWithinGrabRange(controllerPosition)) {
          microphone.grab(source);
        }
      }

      // Handle trigger release (release)
      if (!isTriggerPressed && wasTriggerPressed) {
        if (microphone.isGrabbedBy(source)) {
          microphone.release();
        }
      }

      // Update microphone position if grabbed
      if (microphone.isGrabbedBy(source)) {
        microphone.updatePosition(controllerPosition);
      }

      this.triggerStates.set(source, isTriggerPressed);
    }
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    this.profileInputPanel.dispose();
    this.roomSelectionPanel.dispose();
    this.songSearchPanel.dispose();
    this.virtualKeyboard.dispose();
    this.loadingIndicator.dispose();
    this.errorDisplay.dispose();
    this.uiController.dispose();
    this.uiSystem.dispose();
    console.log('[AppFlowController] Disposed');
  }
}
