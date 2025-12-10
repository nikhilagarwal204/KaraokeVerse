/**
 * KaraokeVerse - UI Controller
 * Requirements: 8.2, 8.3
 * 
 * Handles controller input for UI interaction including ray casting,
 * hover detection, and trigger-based selection.
 */

import {
  Vector3,
  Quaternion,
  Object3D,
  Mesh,
  MeshBasicMaterial,
  CylinderGeometry,
  SphereGeometry,
  Color,
} from "@iwsdk/core";

import { UISystem } from "./UISystem.js";

// Ray visualization constants
const RAY_CONSTANTS = {
  length: 5,
  radius: 0.002,
  color: '#00ff00',
  hoverColor: '#ffff00',
  hitPointRadius: 0.01,
};

/**
 * UIController class - processes controller input for UI interaction
 * Requirements: 8.2, 8.3
 */
export class UIController {
  private uiSystem: UISystem;
  
  // Ray visualization
  private rayMesh: Mesh | null = null;
  private rayMaterial: MeshBasicMaterial;
  private hitPointMesh: Mesh | null = null;
  private hitPointMaterial: MeshBasicMaterial;
  private rayContainer: Object3D;
  
  // Controller state tracking
  private triggerStates: Map<XRInputSource, boolean> = new Map();
  
  // Temporary vectors for calculations
  private tempPosition: Vector3 = new Vector3();
  private tempDirection: Vector3 = new Vector3();
  private tempQuaternion: Quaternion = new Quaternion();

  constructor(uiSystem: UISystem) {
    this.uiSystem = uiSystem;
    this.rayContainer = new Object3D();
    this.rayContainer.name = 'ui-ray-container';

    // Create ray material
    this.rayMaterial = new MeshBasicMaterial({
      color: new Color(RAY_CONSTANTS.color),
    });

    // Create hit point material
    this.hitPointMaterial = new MeshBasicMaterial({
      color: new Color(RAY_CONSTANTS.hoverColor),
    });

    // Create ray visualization
    this.createRayVisualization();

    console.log('[UIController] Initialized');
  }

  /**
   * Create the ray visualization mesh
   */
  private createRayVisualization(): void {
    // Create ray line (cylinder)
    const rayGeometry = new CylinderGeometry(
      RAY_CONSTANTS.radius,
      RAY_CONSTANTS.radius,
      RAY_CONSTANTS.length,
      8
    );
    // Rotate geometry so it points forward (along -Z)
    rayGeometry.rotateX(Math.PI / 2);
    rayGeometry.translate(0, 0, -RAY_CONSTANTS.length / 2);

    this.rayMesh = new Mesh(rayGeometry, this.rayMaterial);
    this.rayMesh.name = 'ui-ray';
    this.rayMesh.visible = false;
    this.rayContainer.add(this.rayMesh);

    // Create hit point indicator (sphere)
    const hitPointGeometry = new SphereGeometry(RAY_CONSTANTS.hitPointRadius, 8, 8);
    this.hitPointMesh = new Mesh(hitPointGeometry, this.hitPointMaterial);
    this.hitPointMesh.name = 'ui-hit-point';
    this.hitPointMesh.visible = false;
    this.rayContainer.add(this.hitPointMesh);
  }

  /**
   * Get the ray container object for adding to scene
   */
  getRayContainer(): Object3D {
    return this.rayContainer;
  }

  /**
   * Show the ray visualization
   */
  showRay(): void {
    if (this.rayMesh) {
      this.rayMesh.visible = true;
    }
  }

  /**
   * Hide the ray visualization
   */
  hideRay(): void {
    if (this.rayMesh) {
      this.rayMesh.visible = false;
    }
    if (this.hitPointMesh) {
      this.hitPointMesh.visible = false;
    }
  }

  /**
   * Update ray position and orientation based on controller
   */
  updateRayPosition(position: Vector3, direction: Vector3): void {
    if (!this.rayMesh) return;

    this.rayContainer.position.copy(position);
    
    // Calculate rotation to point ray in direction
    const forward = direction.clone().normalize();
    
    // Point the ray container in the direction
    // The ray geometry is already oriented along -Z, so we need to look at the target
    const target = position.clone().add(forward);
    this.rayContainer.lookAt(target);
  }

  /**
   * Process controller input for UI interaction
   * Requirements: 8.2, 8.3
   * Handles XR controller raycasting and trigger input for 3D UI interaction
   */
  processControllerInput(
    xrFrame: XRFrame,
    referenceSpace: XRReferenceSpace,
    inputSources: XRInputSourceArray
  ): void {
    // Only process if UI is visible
    if (!this.uiSystem.hasVisiblePanel()) {
      this.hideRay();
      return;
    }

    // Process each controller
    let controllerFound = false;
    for (const source of inputSources) {
      // Only process tracked-pointer controllers (VR controllers with ray)
      if (source.targetRayMode !== 'tracked-pointer') continue;

      controllerFound = true;
      const targetRaySpace = source.targetRaySpace;
      if (!targetRaySpace) {
        console.warn('[UIController] Controller found but no targetRaySpace');
        continue;
      }

      const pose = xrFrame.getPose(targetRaySpace, referenceSpace);
      if (!pose) {
        console.warn('[UIController] Controller found but no pose available');
        continue;
      }

      // Get ray origin and direction
      this.tempPosition.set(
        pose.transform.position.x,
        pose.transform.position.y,
        pose.transform.position.z
      );

      // Get direction from orientation
      this.tempQuaternion.set(
        pose.transform.orientation.x,
        pose.transform.orientation.y,
        pose.transform.orientation.z,
        pose.transform.orientation.w
      );

      // Forward direction is -Z in controller space
      this.tempDirection.set(0, 0, -1);
      this.tempDirection.applyQuaternion(this.tempQuaternion);

      // Update ray visualization
      this.showRay();
      this.updateRayPosition(this.tempPosition, this.tempDirection);

      // Perform raycast against UI
      const hoveredButton = this.uiSystem.handleRaycast(
        this.tempPosition,
        this.tempDirection
      );

      // Update ray color based on hover state
      if (hoveredButton) {
        this.rayMaterial.color.set(RAY_CONSTANTS.hoverColor);
        if (this.hitPointMesh) {
          this.hitPointMesh.visible = true;
        }
      } else {
        this.rayMaterial.color.set(RAY_CONSTANTS.color);
        if (this.hitPointMesh) {
          this.hitPointMesh.visible = false;
        }
      }

      // Handle trigger input for button clicking
      if (source.gamepad) {
        const triggerButton = source.gamepad.buttons[0];
        const isTriggerPressed = triggerButton && triggerButton.pressed;
        const wasTriggerPressed = this.triggerStates.get(source) || false;

        // Trigger just pressed - click the hovered button
        if (isTriggerPressed && !wasTriggerPressed) {
          const clicked = this.uiSystem.handleTriggerPress();
          if (clicked) {
            console.log('[UIController] XR Controller trigger pressed - button clicked');
          }
        }

        // Trigger just released
        if (!isTriggerPressed && wasTriggerPressed) {
          this.uiSystem.handleTriggerRelease();
        }

        this.triggerStates.set(source, isTriggerPressed);
      }

      // Only process first controller with UI
      break;
    }
    
    // Log if no controllers found (for debugging)
    if (!controllerFound && inputSources.length > 0) {
      console.warn('[UIController] Controllers detected but none are tracked-pointer type');
    }
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    if (this.rayMesh) {
      this.rayMesh.geometry.dispose();
    }
    if (this.hitPointMesh) {
      this.hitPointMesh.geometry.dispose();
    }
    this.rayMaterial.dispose();
    this.hitPointMaterial.dispose();
    console.log('[UIController] Disposed');
  }
}
