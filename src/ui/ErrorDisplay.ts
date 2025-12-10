/**
 * KaraokeVerse - Error Display
 * Requirements: 6.4
 * 
 * Displays error messages for failures with retry/dismiss options.
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

// Error display configuration
const ERROR_CONFIG = {
  panelWidth: 0.8,
  panelHeight: 0.4,
  buttonWidth: 0.2,
  buttonHeight: 0.06,
  backgroundColor: '#2d1f1f',
  borderColor: '#c0392b',
  textColor: '#ffffff',
  errorColor: '#e74c3c',
  retryButtonColor: '#27ae60',
  dismissButtonColor: '#7f8c8d',
};

/**
 * ErrorDisplay - displays error messages with action buttons
 */
export class ErrorDisplay {
  private rootObject: Group;
  private messageMesh: Mesh | null = null;
  private retryButton: Mesh | null = null;
  private dismissButton: Mesh | null = null;
  private isVisible: boolean = false;
  
  // Callbacks
  private onRetry: (() => void) | null = null;
  private onDismiss: (() => void) | null = null;
  
  // Canvas for text rendering
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.rootObject = new Group();
    this.rootObject.name = 'error-display';
    this.rootObject.visible = false;
    
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    
    // Create background panel
    this.createBackground();
    
    // Create title
    this.createTitle();
    
    // Create buttons
    this.createButtons();
    
    console.log('[ErrorDisplay] Created');
  }

  /**
   * Set callback for retry button
   */
  setOnRetry(callback: () => void): void {
    this.onRetry = callback;
  }

  /**
   * Set callback for dismiss button
   */
  setOnDismiss(callback: () => void): void {
    this.onDismiss = callback;
  }

  /**
   * Create the background panel
   */
  private createBackground(): void {
    const geometry = new PlaneGeometry(
      ERROR_CONFIG.panelWidth,
      ERROR_CONFIG.panelHeight
    );
    const material = new MeshBasicMaterial({
      color: new Color(ERROR_CONFIG.backgroundColor),
      transparent: true,
      opacity: 0.95,
    });
    const mesh = new Mesh(geometry, material);
    mesh.name = 'error-background';
    this.rootObject.add(mesh);
    
    // Add border indicator (top bar)
    const borderGeometry = new PlaneGeometry(ERROR_CONFIG.panelWidth, 0.02);
    const borderMaterial = new MeshBasicMaterial({
      color: new Color(ERROR_CONFIG.borderColor),
    });
    const borderMesh = new Mesh(borderGeometry, borderMaterial);
    borderMesh.position.set(0, ERROR_CONFIG.panelHeight / 2 - 0.01, 0.005);
    this.rootObject.add(borderMesh);
  }

  /**
   * Create the error title
   */
  private createTitle(): void {
    const titleMesh = this.createTextMesh(
      'Error',
      ERROR_CONFIG.panelWidth * 100,
      30,
      { fontSize: 18, color: ERROR_CONFIG.errorColor }
    );
    titleMesh.position.set(0, ERROR_CONFIG.panelHeight / 2 - 0.06, 0.01);
    this.rootObject.add(titleMesh);
  }

  /**
   * Create action buttons
   */
  private createButtons(): void {
    const buttonY = -ERROR_CONFIG.panelHeight / 2 + 0.08;
    
    // Retry button
    this.retryButton = this.createButton(
      'Retry',
      -0.12,
      buttonY,
      ERROR_CONFIG.retryButtonColor
    );
    this.retryButton.userData = { action: 'retry' };
    this.rootObject.add(this.retryButton);
    
    // Dismiss button
    this.dismissButton = this.createButton(
      'Dismiss',
      0.12,
      buttonY,
      ERROR_CONFIG.dismissButtonColor
    );
    this.dismissButton.userData = { action: 'dismiss' };
    this.rootObject.add(this.dismissButton);
  }

  /**
   * Create a button mesh
   */
  private createButton(label: string, x: number, y: number, color: string): Mesh {
    const geometry = new PlaneGeometry(
      ERROR_CONFIG.buttonWidth,
      ERROR_CONFIG.buttonHeight
    );
    const material = new MeshBasicMaterial({
      color: new Color(color),
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, 0.01);
    
    // Add label
    const labelMesh = this.createTextMesh(
      label,
      ERROR_CONFIG.buttonWidth * 100,
      ERROR_CONFIG.buttonHeight * 100,
      { fontSize: 12, color: '#ffffff' }
    );
    labelMesh.position.set(0, 0, 0.001);
    mesh.add(labelMesh);
    
    return mesh;
  }

  /**
   * Create a text mesh using canvas
   */
  private createTextMesh(
    text: string,
    width: number,
    height: number,
    options: { fontSize: number; color: string }
  ): Mesh {
    const scale = 2;
    this.canvas.width = width * scale;
    this.canvas.height = height * scale;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.font = `${options.fontSize * scale}px Arial, sans-serif`;
    this.ctx.fillStyle = options.color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
    
    const texture = new CanvasTexture(this.canvas);
    texture.needsUpdate = true;
    
    const material = new MeshBasicMaterial({ map: texture, transparent: true });
    const geometry = new PlaneGeometry(width / 100, height / 100);
    return new Mesh(geometry, material);
  }

  /**
   * Show the error display with a message
   */
  show(message: string): void {
    // Remove old message mesh
    if (this.messageMesh) {
      this.rootObject.remove(this.messageMesh);
      this.messageMesh.geometry.dispose();
      (this.messageMesh.material as MeshBasicMaterial).dispose();
    }
    
    // Create new message mesh (wrap long messages)
    const displayMessage = message.length > 50 
      ? message.substring(0, 47) + '...' 
      : message;
    
    this.messageMesh = this.createTextMesh(
      displayMessage,
      ERROR_CONFIG.panelWidth * 100 - 20,
      40,
      { fontSize: 14, color: ERROR_CONFIG.textColor }
    );
    this.messageMesh.position.set(0, 0.02, 0.01);
    this.rootObject.add(this.messageMesh);
    
    this.rootObject.visible = true;
    this.isVisible = true;
    console.log('[ErrorDisplay] Showing:', message);
  }

  /**
   * Hide the error display
   */
  hide(): void {
    this.rootObject.visible = false;
    this.isVisible = false;
    console.log('[ErrorDisplay] Hidden');
  }

  /**
   * Handle button click based on intersection
   */
  handleClick(intersectedObject: Mesh): boolean {
    const action = intersectedObject.userData?.action;
    
    if (action === 'retry' && this.onRetry) {
      this.onRetry();
      this.hide();
      return true;
    }
    
    if (action === 'dismiss' && this.onDismiss) {
      this.onDismiss();
      this.hide();
      return true;
    }
    
    return false;
  }

  /**
   * Get clickable button meshes for raycasting
   */
  getClickableObjects(): Mesh[] {
    const objects: Mesh[] = [];
    if (this.retryButton) objects.push(this.retryButton);
    if (this.dismissButton) objects.push(this.dismissButton);
    return objects;
  }

  /**
   * Position the display in front of the camera
   */
  positionInFrontOfCamera(cameraPosition: Vector3, cameraDirection: Vector3): void {
    const distance = 1.5;
    const position = cameraPosition.clone().add(
      cameraDirection.clone().multiplyScalar(distance)
    );
    position.y += 0.1;
    
    this.rootObject.position.copy(position);
    this.rootObject.lookAt(cameraPosition);
  }

  /**
   * Get the root object for adding to scene
   */
  getRootObject(): Group {
    return this.rootObject;
  }

  /**
   * Check if currently visible
   */
  getIsVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    if (this.messageMesh) {
      this.messageMesh.geometry.dispose();
      (this.messageMesh.material as MeshBasicMaterial).dispose();
    }
    
    if (this.retryButton) {
      this.retryButton.geometry.dispose();
      (this.retryButton.material as MeshBasicMaterial).dispose();
    }
    
    if (this.dismissButton) {
      this.dismissButton.geometry.dispose();
      (this.dismissButton.material as MeshBasicMaterial).dispose();
    }
    
    console.log('[ErrorDisplay] Disposed');
  }
}
