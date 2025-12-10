/**
 * KaraokeVerse - Room Selection Panel
 * Requirements: 2.1, 8.1
 * 
 * Displays 5 themed room buttons for room selection.
 */

import {
  Vector3,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Color,
  CanvasTexture,
} from "@iwsdk/core";

import { RoomTheme, ROOM_THEMES, RoomThemeConfig } from "../types/index.js";
import { UISystem, UIButton, UI_CONSTANTS } from "./UISystem.js";

// Panel dimensions
const PANEL_CONFIG = {
  width: 1.4,
  height: 1.0,
  buttonWidth: 0.55,
  buttonHeight: 0.12,
  buttonSpacing: 0.14,
  titleHeight: 0.1,
  padding: 0.05,
};

/**
 * RoomSelectionPanel - displays themed room selection buttons
 * Requirements: 2.1
 */
export class RoomSelectionPanel {
  private uiSystem: UISystem;
  private panelGroup: Group;
  private buttons: UIButton[] = [];
  private onRoomSelect: ((theme: RoomTheme) => void) | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(uiSystem: UISystem) {
    this.uiSystem = uiSystem;
    this.panelGroup = new Group();
    this.panelGroup.name = 'room-selection-panel';
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    
    this.createPanel();
    console.log('[RoomSelectionPanel] Created');
  }


  /**
   * Set callback for room selection
   */
  setOnRoomSelect(callback: (theme: RoomTheme) => void): void {
    this.onRoomSelect = callback;
  }

  /**
   * Create the panel with all room buttons
   */
  private createPanel(): void {
    // Create panel in UI system
    const panel = this.uiSystem.createPanel(
      'room-selection',
      new Vector3(0, 1.5, -2),
      PANEL_CONFIG.width,
      PANEL_CONFIG.height
    );

    // Create title
    const titleMesh = this.createTextMesh(
      'Select a Room',
      PANEL_CONFIG.width * 100,
      PANEL_CONFIG.titleHeight * 100,
      { fontSize: 28, color: '#ffffff', backgroundColor: 'transparent' }
    );
    titleMesh.position.set(0, (PANEL_CONFIG.height / 2) - PANEL_CONFIG.titleHeight, 0.02);
    panel.rootObject.add(titleMesh);

    // Create room buttons
    const themes: RoomTheme[] = ['anime', 'kpop', 'bollywood', 'hollywood', 'taylor-swift'];
    const startY = (PANEL_CONFIG.height / 2) - PANEL_CONFIG.titleHeight - PANEL_CONFIG.buttonSpacing;

    themes.forEach((theme, index) => {
      const config = ROOM_THEMES[theme];
      const y = startY - (index * PANEL_CONFIG.buttonSpacing);
      
      const button = this.createRoomButton(theme, config, 0, y);
      this.buttons.push(button);
      this.uiSystem.addButtonToPanel(panel, button);
    });

    // Initially hide the panel
    panel.rootObject.visible = false;
  }

  /**
   * Create a room selection button
   */
  private createRoomButton(
    theme: RoomTheme,
    config: RoomThemeConfig,
    x: number,
    y: number
  ): UIButton {
    // Create button mesh with themed color
    const geometry = new PlaneGeometry(PANEL_CONFIG.buttonWidth, PANEL_CONFIG.buttonHeight);
    const material = new MeshBasicMaterial({
      color: new Color(config.primaryColor).multiplyScalar(0.6),
    });
    const mesh = new Mesh(geometry, material);
    mesh.name = `button-room-${theme}`;
    mesh.position.set(x, y, 0.01);
    mesh.userData = { buttonId: `room-${theme}` };

    // Add text label
    const labelMesh = this.createTextMesh(
      config.displayName,
      PANEL_CONFIG.buttonWidth * 100,
      PANEL_CONFIG.buttonHeight * 100,
      { fontSize: 18, color: '#ffffff', backgroundColor: 'transparent' }
    );
    labelMesh.position.set(0, 0, 0.001);
    mesh.add(labelMesh);

    const button: UIButton = {
      id: `room-${theme}`,
      label: config.displayName,
      position: new Vector3(x, y, 0.01),
      width: PANEL_CONFIG.buttonWidth,
      height: PANEL_CONFIG.buttonHeight,
      mesh,
      material,
      onClick: () => this.handleRoomSelect(theme),
      isHovered: false,
      isActive: false,
    };

    return button;
  }

  /**
   * Handle room selection
   */
  private handleRoomSelect(theme: RoomTheme): void {
    console.log(`[RoomSelectionPanel] Room selected: ${theme}`);
    if (this.onRoomSelect) {
      this.onRoomSelect(theme);
    }
  }

  /**
   * Create a text mesh using canvas
   */
  private createTextMesh(
    text: string,
    width: number,
    height: number,
    options: { fontSize: number; color: string; backgroundColor: string }
  ): Mesh {
    const scale = 2;
    this.canvas.width = width * scale;
    this.canvas.height = height * scale;

    // Clear or fill background
    if (options.backgroundColor !== 'transparent') {
      this.ctx.fillStyle = options.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Draw text
    this.ctx.font = `${options.fontSize * scale}px Arial, sans-serif`;
    this.ctx.fillStyle = options.color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);

    // Create texture and mesh
    const texture = new CanvasTexture(this.canvas);
    texture.needsUpdate = true;

    const material = new MeshBasicMaterial({ map: texture, transparent: true });
    const geometry = new PlaneGeometry(width / 100, height / 100);
    const mesh = new Mesh(geometry, material);

    return mesh;
  }

  /**
   * Show the panel
   */
  show(): void {
    this.uiSystem.showPanel('room-selection');
  }

  /**
   * Hide the panel
   */
  hide(): void {
    this.uiSystem.hidePanel('room-selection');
  }

  /**
   * Get the panel group for adding to scene
   */
  getPanelGroup(): Group {
    return this.panelGroup;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    for (const button of this.buttons) {
      button.mesh.geometry.dispose();
      button.material.dispose();
    }
    console.log('[RoomSelectionPanel] Disposed');
  }
}
