/**
 * KaraokeVerse - Loading Indicator
 * Requirements: 6.4
 * 
 * Displays a loading indicator during API calls and async operations.
 */

import {
  Vector3,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  RingGeometry,
  Color,
  CanvasTexture,
} from "@iwsdk/core";

// Loading indicator configuration
const LOADING_CONFIG = {
  panelWidth: 0.6,
  panelHeight: 0.3,
  spinnerRadius: 0.06,
  spinnerThickness: 0.01,
  backgroundColor: '#1a1a2e',
  spinnerColor: '#ff6b9d',
  textColor: '#ffffff',
};

/**
 * LoadingIndicator - displays a loading spinner with optional message
 */
export class LoadingIndicator {
  private rootObject: Group;
  private spinnerMesh: Mesh;
  private messageMesh: Mesh | null = null;
  private isVisible: boolean = false;
  private rotationSpeed: number = 2; // radians per second
  
  // Canvas for text rendering
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.rootObject = new Group();
    this.rootObject.name = 'loading-indicator';
    this.rootObject.visible = false;
    
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    
    // Create background panel
    this.createBackground();
    
    // Create spinner
    this.spinnerMesh = this.createSpinner();
    this.rootObject.add(this.spinnerMesh);
    
    console.log('[LoadingIndicator] Created');
  }

  /**
   * Create the background panel
   */
  private createBackground(): void {
    const geometry = new PlaneGeometry(
      LOADING_CONFIG.panelWidth,
      LOADING_CONFIG.panelHeight
    );
    const material = new MeshBasicMaterial({
      color: new Color(LOADING_CONFIG.backgroundColor),
      transparent: true,
      opacity: 0.95,
    });
    const mesh = new Mesh(geometry, material);
    mesh.name = 'loading-background';
    this.rootObject.add(mesh);
  }

  /**
   * Create the spinner ring
   */
  private createSpinner(): Mesh {
    const geometry = new RingGeometry(
      LOADING_CONFIG.spinnerRadius - LOADING_CONFIG.spinnerThickness,
      LOADING_CONFIG.spinnerRadius,
      32,
      1,
      0,
      Math.PI * 1.5 // 3/4 of a circle
    );
    const material = new MeshBasicMaterial({
      color: new Color(LOADING_CONFIG.spinnerColor),
      side: 2, // DoubleSide
    });
    const mesh = new Mesh(geometry, material);
    mesh.name = 'loading-spinner';
    mesh.position.set(0, 0.04, 0.01);
    return mesh;
  }

  /**
   * Create a text mesh using canvas
   */
  private createTextMesh(text: string): Mesh {
    const width = LOADING_CONFIG.panelWidth * 100;
    const height = 30;
    const scale = 2;
    
    this.canvas.width = width * scale;
    this.canvas.height = height * scale;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.font = `${14 * scale}px Arial, sans-serif`;
    this.ctx.fillStyle = LOADING_CONFIG.textColor;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
    
    const texture = new CanvasTexture(this.canvas);
    texture.needsUpdate = true;
    
    const material = new MeshBasicMaterial({ map: texture, transparent: true });
    const geometry = new PlaneGeometry(width / 100, height / 100);
    const mesh = new Mesh(geometry, material);
    mesh.position.set(0, -0.06, 0.01);
    return mesh;
  }

  /**
   * Show the loading indicator with optional message
   */
  show(message: string = 'Loading...'): void {
    // Remove old message mesh
    if (this.messageMesh) {
      this.rootObject.remove(this.messageMesh);
      this.messageMesh.geometry.dispose();
      (this.messageMesh.material as MeshBasicMaterial).dispose();
    }
    
    // Create new message mesh
    this.messageMesh = this.createTextMesh(message);
    this.rootObject.add(this.messageMesh);
    
    this.rootObject.visible = true;
    this.isVisible = true;
    console.log('[LoadingIndicator] Showing:', message);
  }

  /**
   * Hide the loading indicator
   */
  hide(): void {
    this.rootObject.visible = false;
    this.isVisible = false;
    console.log('[LoadingIndicator] Hidden');
  }

  /**
   * Update the spinner animation
   */
  update(delta: number): void {
    if (this.isVisible) {
      this.spinnerMesh.rotation.z -= this.rotationSpeed * delta;
    }
  }

  /**
   * Position the indicator in front of the camera
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
    this.spinnerMesh.geometry.dispose();
    (this.spinnerMesh.material as MeshBasicMaterial).dispose();
    
    if (this.messageMesh) {
      this.messageMesh.geometry.dispose();
      (this.messageMesh.material as MeshBasicMaterial).dispose();
    }
    
    console.log('[LoadingIndicator] Disposed');
  }
}
