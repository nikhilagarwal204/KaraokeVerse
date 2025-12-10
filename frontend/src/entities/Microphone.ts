/**
 * KaraokeVerse - Microphone Entity
 * Requirements: 3.1, 3.2, 3.3, 3.4
 * 
 * Grabbable 3D microphone object with visual feedback when held.
 * Returns to spawn position when released.
 */

import {
  Object3D,
  Mesh,
  MeshStandardMaterial,
  CylinderGeometry,
  SphereGeometry,
  Color,
  Vector3,
} from "@iwsdk/core";

// Microphone colors
const MICROPHONE_COLORS = {
  body: '#2c3e50',        // Dark gray body
  head: '#7f8c8d',        // Silver head
  bodyGrabbed: '#27ae60', // Green when grabbed
  headGrabbed: '#2ecc71', // Lighter green head when grabbed
};

// Microphone dimensions
const MICROPHONE_DIMENSIONS = {
  bodyRadius: 0.025,
  bodyHeight: 0.18,
  headRadius: 0.04,
  grabDistance: 0.3,      // Maximum distance to grab the microphone
};

/**
 * MicrophoneEntity class for creating and managing the microphone
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
export class MicrophoneEntity {
  public readonly rootObject: Object3D;
  public isGrabbed: boolean = false;
  
  private readonly spawnPosition: Vector3;
  private bodyMesh: Mesh;
  private headMesh: Mesh;
  private bodyMaterial: MeshStandardMaterial;
  private headMaterial: MeshStandardMaterial;

  // Store original colors for reset
  private originalBodyColor: Color;
  private originalHeadColor: Color;

  // Grab state tracking
  private grabbingController: XRInputSource | null = null;
  private grabOffset: Vector3 = new Vector3();

  constructor(spawnPosition: Vector3) {
    this.spawnPosition = spawnPosition.clone();
    this.rootObject = new Object3D();
    this.rootObject.name = 'microphone';

    // Create materials
    this.bodyMaterial = new MeshStandardMaterial({
      color: new Color(MICROPHONE_COLORS.body),
      roughness: 0.4,
      metalness: 0.6,
    });

    this.headMaterial = new MeshStandardMaterial({
      color: new Color(MICROPHONE_COLORS.head),
      roughness: 0.3,
      metalness: 0.8,
    });

    // Store original colors
    this.originalBodyColor = new Color(MICROPHONE_COLORS.body);
    this.originalHeadColor = new Color(MICROPHONE_COLORS.head);

    // Create microphone mesh
    this.bodyMesh = this.createBody();
    this.headMesh = this.createHead();

    // Add meshes to root object
    this.rootObject.add(this.bodyMesh);
    this.rootObject.add(this.headMesh);

    // Set initial position
    this.rootObject.position.copy(this.spawnPosition);

    console.log('[Microphone] Created at position:', this.spawnPosition);
  }

  /**
   * Create the microphone body (cylinder handle)
   */
  private createBody(): Mesh {
    const geometry = new CylinderGeometry(
      MICROPHONE_DIMENSIONS.bodyRadius,
      MICROPHONE_DIMENSIONS.bodyRadius,
      MICROPHONE_DIMENSIONS.bodyHeight,
      16
    );

    const mesh = new Mesh(geometry, this.bodyMaterial);
    mesh.name = 'microphone-body';
    mesh.position.y = MICROPHONE_DIMENSIONS.bodyHeight / 2;

    return mesh;
  }

  /**
   * Create the microphone head (sphere)
   */
  private createHead(): Mesh {
    const geometry = new SphereGeometry(
      MICROPHONE_DIMENSIONS.headRadius,
      16,
      16
    );

    const mesh = new Mesh(geometry, this.headMaterial);
    mesh.name = 'microphone-head';
    // Position head on top of body
    mesh.position.y = MICROPHONE_DIMENSIONS.bodyHeight + MICROPHONE_DIMENSIONS.headRadius * 0.5;

    return mesh;
  }

  /**
   * Check if a position is within grab range of the microphone
   */
  isWithinGrabRange(position: Vector3): boolean {
    const distance = this.rootObject.position.distanceTo(position);
    return distance <= MICROPHONE_DIMENSIONS.grabDistance;
  }

  /**
   * Handle grab event - change color to indicate grabbed state
   * Requirements: 3.2, 3.4
   */
  grab(controller?: XRInputSource): void {
    if (this.isGrabbed) return;
    
    this.isGrabbed = true;
    this.grabbingController = controller || null;
    
    // Change colors to grabbed state
    this.bodyMaterial.color.set(MICROPHONE_COLORS.bodyGrabbed);
    this.bodyMaterial.emissive.set(MICROPHONE_COLORS.bodyGrabbed);
    this.bodyMaterial.emissiveIntensity = 0.3;
    
    this.headMaterial.color.set(MICROPHONE_COLORS.headGrabbed);
    this.headMaterial.emissive.set(MICROPHONE_COLORS.headGrabbed);
    this.headMaterial.emissiveIntensity = 0.4;

    console.log('[Microphone] Grabbed');
  }

  /**
   * Handle release event - reset color and return to spawn position
   * Requirements: 3.3, 3.4
   */
  release(): void {
    if (!this.isGrabbed) return;
    
    this.isGrabbed = false;
    this.grabbingController = null;
    
    // Reset colors to original state
    this.bodyMaterial.color.copy(this.originalBodyColor);
    this.bodyMaterial.emissive.set(0x000000);
    this.bodyMaterial.emissiveIntensity = 0;
    
    this.headMaterial.color.copy(this.originalHeadColor);
    this.headMaterial.emissive.set(0x000000);
    this.headMaterial.emissiveIntensity = 0;

    // Return to spawn position
    this.rootObject.position.copy(this.spawnPosition);

    console.log('[Microphone] Released, returning to spawn position');
  }

  /**
   * Update microphone position to follow controller when grabbed
   */
  updatePosition(controllerPosition: Vector3): void {
    if (this.isGrabbed) {
      this.rootObject.position.copy(controllerPosition);
    }
  }

  /**
   * Update method called each frame
   */
  update(): void {
    // Additional per-frame updates can be added here
    // e.g., subtle animations, particle effects
  }

  /**
   * Get the spawn position
   */
  getSpawnPosition(): Vector3 {
    return this.spawnPosition.clone();
  }

  /**
   * Get the current position
   */
  getPosition(): Vector3 {
    return this.rootObject.position.clone();
  }

  /**
   * Check if this microphone is being grabbed by a specific controller
   */
  isGrabbedBy(controller: XRInputSource): boolean {
    return this.isGrabbed && this.grabbingController === controller;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    // Dispose geometries
    this.bodyMesh.geometry.dispose();
    this.headMesh.geometry.dispose();

    // Dispose materials
    this.bodyMaterial.dispose();
    this.headMaterial.dispose();

    console.log('[Microphone] Disposed');
  }
}
