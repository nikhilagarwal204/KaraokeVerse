/**
 * KaraokeVerse - UI System
 * Requirements: 8.1, 8.2, 8.3
 * 
 * Manages 3D UI panels in VR space with controller-based interaction.
 * Handles ray casting, hover highlighting, and trigger-based selection.
 */

import {
  Object3D,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Color,
  Vector3,
  Raycaster,
  Group,
} from "@iwsdk/core";

// UI Panel types
export type UIPanelType = 'room-selection' | 'song-search' | 'profile-input' | 'keyboard';

// Panel positioning constants
const UI_CONSTANTS = {
  // Distance from player for comfortable viewing
  panelDistance: 1.8,
  // Height offset from eye level
  panelHeightOffset: -0.1,
  // Panel dimensions
  defaultPanelWidth: 1.4,
  defaultPanelHeight: 0.8,
  // Colors
  panelBackground: '#16213e',
  panelBorder: '#4a4a6a',
  buttonDefault: '#2d2d44',
  buttonHover: '#4a4a6a',
  buttonActive: '#6a6a8a',
  textColor: '#ffffff',
  accentColor: '#ff6b9d',
};

/**
 * UI Button interface
 */
export interface UIButton {
  id: string;
  label: string;
  position: Vector3;
  width: number;
  height: number;
  mesh: Mesh;
  material: MeshBasicMaterial;
  onClick: () => void;
  isHovered: boolean;
  isActive: boolean;
}

/**
 * UI Panel interface
 */
export interface UIPanel {
  type: UIPanelType;
  rootObject: Group;
  buttons: UIButton[];
  isVisible: boolean;
  position: Vector3;
  width: number;
  height: number;
}

/**
 * UISystem class - manages all VR UI panels and interactions
 * Requirements: 8.1, 8.2, 8.3
 */
export class UISystem {
  private panels: Map<UIPanelType, UIPanel> = new Map();
  private raycaster: Raycaster;
  private hoveredButton: UIButton | null = null;
  private activePanel: UIPanelType | null = null;
  
  // Callback handlers
  private onRoomSelect: ((theme: string) => void) | null = null;
  private onSongSelect: ((youtubeId: string) => void) | null = null;
  private onProfileSubmit: ((name: string) => void) | null = null;
  private onKeyPress: ((key: string) => void) | null = null;

  // Ray visualization
  private rayLine: Mesh | null = null;
  private rayMaterial: MeshBasicMaterial;

  constructor() {
    this.raycaster = new Raycaster();
    this.rayMaterial = new MeshBasicMaterial({ color: 0x00ff00 });
    console.log('[UISystem] Initialized');
  }

  /**
   * Set callback for room selection
   */
  setOnRoomSelect(callback: (theme: string) => void): void {
    this.onRoomSelect = callback;
  }

  /**
   * Set callback for song selection
   */
  setOnSongSelect(callback: (youtubeId: string) => void): void {
    this.onSongSelect = callback;
  }

  /**
   * Set callback for profile submission
   */
  setOnProfileSubmit(callback: (name: string) => void): void {
    this.onProfileSubmit = callback;
  }

  /**
   * Set callback for keyboard key press
   */
  setOnKeyPress(callback: (key: string) => void): void {
    this.onKeyPress = callback;
  }

  /**
   * Create a basic panel background
   */
  private createPanelBackground(width: number, height: number): Mesh {
    const geometry = new PlaneGeometry(width, height);
    const material = new MeshBasicMaterial({
      color: new Color(UI_CONSTANTS.panelBackground),
      transparent: true,
      opacity: 0.95,
    });
    const mesh = new Mesh(geometry, material);
    mesh.name = 'panel-background';
    return mesh;
  }

  /**
   * Create a UI button
   */
  createButton(
    id: string,
    label: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): UIButton {
    const geometry = new PlaneGeometry(width, height);
    const material = new MeshBasicMaterial({
      color: new Color(UI_CONSTANTS.buttonDefault),
    });
    const mesh = new Mesh(geometry, material);
    mesh.name = `button-${id}`;
    mesh.position.set(x, y, 0.01); // Slightly in front of panel
    mesh.userData = { buttonId: id };

    return {
      id,
      label,
      position: new Vector3(x, y, 0.01),
      width,
      height,
      mesh,
      material,
      onClick,
      isHovered: false,
      isActive: false,
    };
  }

  /**
   * Create a panel at the specified position
   * Requirements: 8.1
   */
  createPanel(
    type: UIPanelType,
    position: Vector3,
    width: number = UI_CONSTANTS.defaultPanelWidth,
    height: number = UI_CONSTANTS.defaultPanelHeight
  ): UIPanel {
    const rootObject = new Group();
    rootObject.name = `panel-${type}`;
    rootObject.position.copy(position);

    // Create background
    const background = this.createPanelBackground(width, height);
    rootObject.add(background);

    const panel: UIPanel = {
      type,
      rootObject,
      buttons: [],
      isVisible: false,
      position: position.clone(),
      width,
      height,
    };

    this.panels.set(type, panel);
    console.log(`[UISystem] Panel created: ${type}`);
    return panel;
  }

  /**
   * Add a button to a panel
   */
  addButtonToPanel(panel: UIPanel, button: UIButton): void {
    panel.buttons.push(button);
    panel.rootObject.add(button.mesh);
  }

  /**
   * Show a panel
   */
  showPanel(type: UIPanelType): void {
    const panel = this.panels.get(type);
    if (panel) {
      panel.isVisible = true;
      panel.rootObject.visible = true;
      this.activePanel = type;
      console.log(`[UISystem] Panel shown: ${type}`);
    }
  }

  /**
   * Hide a panel
   */
  hidePanel(type: UIPanelType): void {
    const panel = this.panels.get(type);
    if (panel) {
      panel.isVisible = false;
      panel.rootObject.visible = false;
      if (this.activePanel === type) {
        this.activePanel = null;
      }
      console.log(`[UISystem] Panel hidden: ${type}`);
    }
  }

  /**
   * Hide all panels
   */
  hideAllPanels(): void {
    for (const [type] of this.panels) {
      this.hidePanel(type);
    }
  }

  /**
   * Get a panel by type
   */
  getPanel(type: UIPanelType): UIPanel | undefined {
    return this.panels.get(type);
  }

  /**
   * Get the root object of a panel for adding to scene
   */
  getPanelObject(type: UIPanelType): Group | undefined {
    return this.panels.get(type)?.rootObject;
  }

  /**
   * Position panel in front of camera
   * Requirements: 8.1 - position at comfortable viewing distance
   */
  positionPanelInFrontOfCamera(
    type: UIPanelType,
    cameraPosition: Vector3,
    cameraDirection: Vector3
  ): void {
    const panel = this.panels.get(type);
    if (!panel) return;

    // Calculate position in front of camera
    const panelPosition = cameraPosition.clone().add(
      cameraDirection.clone().multiplyScalar(UI_CONSTANTS.panelDistance)
    );
    panelPosition.y += UI_CONSTANTS.panelHeightOffset;

    panel.rootObject.position.copy(panelPosition);
    
    // Make panel face the camera
    panel.rootObject.lookAt(cameraPosition);
  }

  /**
   * Handle controller ray casting for UI interaction
   * Requirements: 8.2
   */
  handleRaycast(
    controllerPosition: Vector3,
    controllerDirection: Vector3
  ): UIButton | null {
    this.raycaster.set(controllerPosition, controllerDirection);

    // Collect all button meshes from visible panels
    const buttonMeshes: Mesh[] = [];
    for (const [, panel] of this.panels) {
      if (panel.isVisible) {
        for (const button of panel.buttons) {
          buttonMeshes.push(button.mesh);
        }
      }
    }

    if (buttonMeshes.length === 0) return null;

    const intersects = this.raycaster.intersectObjects(buttonMeshes, false);

    // Reset previous hover state
    if (this.hoveredButton) {
      this.setButtonHover(this.hoveredButton, false);
      this.hoveredButton = null;
    }

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as Mesh;
      const buttonId = hitMesh.userData.buttonId;

      // Find the button
      for (const [, panel] of this.panels) {
        for (const button of panel.buttons) {
          if (button.id === buttonId) {
            this.setButtonHover(button, true);
            this.hoveredButton = button;
            return button;
          }
        }
      }
    }

    return null;
  }

  /**
   * Set button hover state with visual feedback
   * Requirements: 8.2 - highlight elements on hover
   */
  private setButtonHover(button: UIButton, isHovered: boolean): void {
    button.isHovered = isHovered;
    if (isHovered) {
      button.material.color.set(UI_CONSTANTS.buttonHover);
    } else {
      button.material.color.set(UI_CONSTANTS.buttonDefault);
    }
  }

  /**
   * Handle trigger press on hovered button
   * Requirements: 8.3 - trigger actions on trigger press
   */
  handleTriggerPress(): boolean {
    if (this.hoveredButton) {
      // Visual feedback for press
      this.hoveredButton.material.color.set(UI_CONSTANTS.buttonActive);
      this.hoveredButton.isActive = true;
      
      // Execute callback
      this.hoveredButton.onClick();
      
      console.log(`[UISystem] Button pressed: ${this.hoveredButton.id}`);
      return true;
    }
    return false;
  }

  /**
   * Handle trigger release
   */
  handleTriggerRelease(): void {
    if (this.hoveredButton && this.hoveredButton.isActive) {
      this.hoveredButton.isActive = false;
      // Return to hover state if still hovering
      if (this.hoveredButton.isHovered) {
        this.hoveredButton.material.color.set(UI_CONSTANTS.buttonHover);
      } else {
        this.hoveredButton.material.color.set(UI_CONSTANTS.buttonDefault);
      }
    }
  }

  /**
   * Get currently hovered button
   */
  getHoveredButton(): UIButton | null {
    return this.hoveredButton;
  }

  /**
   * Check if any panel is currently visible
   */
  hasVisiblePanel(): boolean {
    for (const [, panel] of this.panels) {
      if (panel.isVisible) return true;
    }
    return false;
  }

  /**
   * Get the active panel type
   */
  getActivePanel(): UIPanelType | null {
    return this.activePanel;
  }

  /**
   * Dispose all panels and resources
   */
  dispose(): void {
    for (const [type, panel] of this.panels) {
      // Dispose button materials and geometries
      for (const button of panel.buttons) {
        button.mesh.geometry.dispose();
        button.material.dispose();
      }
      
      // Dispose panel background
      panel.rootObject.traverse((child) => {
        if (child instanceof Mesh) {
          child.geometry.dispose();
          if (child.material instanceof MeshBasicMaterial) {
            child.material.dispose();
          }
        }
      });
      
      console.log(`[UISystem] Panel disposed: ${type}`);
    }
    
    this.panels.clear();
    this.rayMaterial.dispose();
    console.log('[UISystem] Disposed');
  }
}

// Export UI constants for use in other modules
export { UI_CONSTANTS };
