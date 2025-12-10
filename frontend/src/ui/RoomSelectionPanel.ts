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
  width: 1.6, // Increased to fit longer text
  height: 1.0,
  buttonWidth: 0.7, // Increased from 0.55 to fit full room names
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

    // Create title - ensure full text displays
    const titleMesh = this.createTextMesh(
      'Select a Room',
      PANEL_CONFIG.width * 0.95, // Use 95% of panel width
      PANEL_CONFIG.titleHeight,
      { fontSize: 26, color: '#ffffff', backgroundColor: 'transparent' }
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
    const buttonColor = new Color(config.primaryColor).multiplyScalar(0.6);
    const material = new MeshBasicMaterial({
      color: buttonColor,
    });
    const mesh = new Mesh(geometry, material);
    mesh.name = `button-room-${theme}`;
    mesh.position.set(x, y, 0.01);
    mesh.userData = { 
      buttonId: `room-${theme}`,
      originalColor: buttonColor.clone() // Store original color for hover restoration
    };

    // Add text label - allow text to expand beyond button if needed
    // The text mesh will scale to fit the full text
    const labelMesh = this.createTextMesh(
      config.displayName,
      PANEL_CONFIG.buttonWidth * 1.1, // Allow 10% expansion beyond button width
      PANEL_CONFIG.buttonHeight,
      { fontSize: 13, color: '#ffffff', backgroundColor: 'transparent' } // Smaller font to fit more text
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
   * Note: width and height are in meters (3D space units)
   * Following Meta Horizon SDK best practices for spatial UI text rendering
   */
  private createTextMesh(
    text: string,
    width: number,
    height: number,
    options: { fontSize: number; color: string; backgroundColor: string }
  ): Mesh {
    // Create a new canvas for each text mesh to avoid conflicts
    const canvas = document.createElement('canvas');
    const scale = 4; // High resolution for crisp text
    
    // Convert target dimensions to pixels
    const targetPixelWidth = width * scale * 100;
    const targetPixelHeight = height * scale * 100;
    
    // Start with base font size and measure text
    let baseFontSize = options.fontSize * scale;
    const tempCtx = canvas.getContext('2d')!;
    tempCtx.font = `bold ${baseFontSize}px Arial, sans-serif`;
    let textMetrics = tempCtx.measureText(text);
    let textWidth = textMetrics.width;
    
    // Calculate optimal font size to fit within available width
    // Use 90% of width for padding (5% on each side)
    const maxTextWidth = targetPixelWidth * 0.9;
    let finalFontSize = baseFontSize;
    
    if (textWidth > maxTextWidth) {
      // Scale font down proportionally to fit
      finalFontSize = (maxTextWidth / textWidth) * baseFontSize;
      // Ensure minimum readable size (at least 60% of original)
      finalFontSize = Math.max(finalFontSize, baseFontSize * 0.6);
      
      // Re-measure with new font size
      tempCtx.font = `bold ${finalFontSize}px Arial, sans-serif`;
      textMetrics = tempCtx.measureText(text);
      textWidth = textMetrics.width;
    }
    
    // Calculate canvas size - must be large enough for the text
    // Add padding on both sides (10% total)
    const padding = targetPixelWidth * 0.05; // 5% padding on each side
    const requiredCanvasWidth = Math.max(
      targetPixelWidth,
      Math.ceil(textWidth + padding * 2)
    );
    const canvasHeight = Math.max(
      targetPixelHeight,
      Math.ceil(finalFontSize * 1.4) // 40% extra for vertical padding
    );
    
    canvas.width = requiredCanvasWidth;
    canvas.height = canvasHeight;
    
    const ctx = canvas.getContext('2d')!;

    // Clear or fill background
    if (options.backgroundColor !== 'transparent') {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Set final font and draw text
    ctx.font = `bold ${finalFontSize}px Arial, sans-serif`;
    ctx.fillStyle = options.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw text centered - this will show the full text
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Create texture and mesh
    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new MeshBasicMaterial({ map: texture, transparent: true });
    
    // Calculate geometry size based on actual canvas dimensions
    // Convert canvas pixels back to meters: divide by (scale * 100)
    const geometryWidth = canvas.width / (scale * 100);
    const geometryHeight = canvas.height / (scale * 100);
    
    // Use actual canvas-based geometry size to prevent cropping
    const geometry = new PlaneGeometry(geometryWidth, geometryHeight);
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
