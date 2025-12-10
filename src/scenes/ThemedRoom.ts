/**
 * KaraokeVerse - Themed Room Base Class
 * Requirements: 2.2, 2.3
 * 
 * Creates 3D environment geometry and lighting for themed karaoke rooms.
 * Positions player spawn point, microphone, and video screen.
 */

import {
  Object3D,
  Mesh,
  MeshStandardMaterial,
  BoxGeometry,
  PlaneGeometry,
  AmbientLight,
  PointLight,
  Color,
  Vector3,
} from "@iwsdk/core";

import { RoomTheme, RoomThemeConfig, ROOM_THEMES } from "../types/index.js";

/**
 * Interface for ThemedRoom as specified in design document
 */
export interface IThemedRoom {
  theme: RoomTheme;
  spawnPoint: Vector3;
  microphonePosition: Vector3;
  screenPosition: Vector3;
  setup(): void;
  cleanup(): void;
}

/**
 * Base ThemedRoom class
 * Creates a 3D karaoke room environment with themed colors and lighting
 */
export class ThemedRoom implements IThemedRoom {
  public readonly theme: RoomTheme;
  public readonly config: RoomThemeConfig;
  public readonly spawnPoint: Vector3;
  public readonly microphonePosition: Vector3;
  public readonly screenPosition: Vector3;
  
  // Root object containing all room geometry
  public readonly rootObject: Object3D;
  
  // Room dimensions
  protected readonly roomWidth = 10;
  protected readonly roomDepth = 10;
  protected readonly roomHeight = 5;
  protected readonly stageWidth = 6;
  protected readonly stageDepth = 4;
  protected readonly stageHeight = 0.3;

  constructor(theme: RoomTheme) {
    this.theme = theme;
    this.config = ROOM_THEMES[theme];
    
    if (!this.config) {
      throw new Error(`Unknown room theme: ${theme}`);
    }

    // Create root object for the room
    this.rootObject = new Object3D();
    this.rootObject.name = `room-${theme}`;

    // Define standard positions
    // Player spawns in the room facing the screen
    this.spawnPoint = new Vector3(0, 0, 2);
    
    // Microphone within reach of player at spawn
    this.microphonePosition = new Vector3(0.5, 1.0, 1.5);
    
    // Screen on the back wall, facing the player
    this.screenPosition = new Vector3(0, 2, -3);
  }

  /**
   * Set up the room - creates all geometry and lighting
   * Call this after construction to build the room
   */
  setup(): void {
    console.log(`[ThemedRoom] Setting up: ${this.config.displayName}`);
    
    this.createFloor();
    this.createWalls();
    this.createCeiling();
    this.createStage();
    this.createLighting();
    this.addThemeDecorations();
    
    console.log(`[ThemedRoom] Setup complete: ${this.config.displayName}`);
  }

  /**
   * Clean up the room - disposes all geometry and materials
   */
  cleanup(): void {
    console.log(`[ThemedRoom] Cleaning up: ${this.config.displayName}`);
    
    this.rootObject.traverse((child) => {
      if (child instanceof Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });

    // Remove all children
    while (this.rootObject.children.length > 0) {
      this.rootObject.remove(this.rootObject.children[0]);
    }
    
    console.log(`[ThemedRoom] Cleanup complete: ${this.config.displayName}`);
  }

  /**
   * Get the primary color for this theme
   */
  protected getPrimaryColor(): Color {
    return new Color(this.config.primaryColor);
  }

  /**
   * Get the accent color for this theme
   */
  protected getAccentColor(): Color {
    return new Color(this.config.accentColor);
  }

  /**
   * Create the floor geometry
   */
  protected createFloor(): void {
    const floorGeometry = new PlaneGeometry(this.roomWidth, this.roomDepth);
    const floorMaterial = new MeshStandardMaterial({
      color: this.getPrimaryColor().multiplyScalar(0.3),
      roughness: 0.8,
    });
    
    const floor = new Mesh(floorGeometry, floorMaterial);
    floor.name = 'floor';
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    
    this.rootObject.add(floor);
  }

  /**
   * Create the wall geometry (back, left, right walls)
   */
  protected createWalls(): void {
    const wallGeometry = new PlaneGeometry(this.roomWidth, this.roomHeight);
    const wallMaterial = new MeshStandardMaterial({
      color: this.getPrimaryColor().multiplyScalar(0.5),
      roughness: 0.9,
    });

    // Back wall (where screen will be mounted)
    const backWall = new Mesh(wallGeometry, wallMaterial);
    backWall.name = 'back-wall';
    backWall.position.set(0, this.roomHeight / 2, -this.roomDepth / 2);
    this.rootObject.add(backWall);

    // Left wall
    const leftWallGeometry = new PlaneGeometry(this.roomDepth, this.roomHeight);
    const leftWall = new Mesh(leftWallGeometry, wallMaterial.clone());
    leftWall.name = 'left-wall';
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-this.roomWidth / 2, this.roomHeight / 2, 0);
    this.rootObject.add(leftWall);

    // Right wall
    const rightWall = new Mesh(leftWallGeometry.clone(), wallMaterial.clone());
    rightWall.name = 'right-wall';
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(this.roomWidth / 2, this.roomHeight / 2, 0);
    this.rootObject.add(rightWall);
  }

  /**
   * Create the ceiling geometry
   */
  protected createCeiling(): void {
    const ceilingGeometry = new PlaneGeometry(this.roomWidth, this.roomDepth);
    const ceilingMaterial = new MeshStandardMaterial({
      color: this.getPrimaryColor().multiplyScalar(0.2),
      roughness: 0.9,
    });
    
    const ceiling = new Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.name = 'ceiling';
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = this.roomHeight;
    
    this.rootObject.add(ceiling);
  }

  /**
   * Create the stage platform
   */
  protected createStage(): void {
    const stageGeometry = new BoxGeometry(
      this.stageWidth,
      this.stageHeight,
      this.stageDepth
    );
    const stageMaterial = new MeshStandardMaterial({
      color: this.getAccentColor(),
      roughness: 0.6,
    });
    
    const stage = new Mesh(stageGeometry, stageMaterial);
    stage.name = 'stage';
    stage.position.set(0, this.stageHeight / 2, -2);
    stage.receiveShadow = true;
    
    this.rootObject.add(stage);
  }

  /**
   * Create room lighting based on theme configuration
   */
  protected createLighting(): void {
    // Ambient light for base illumination
    const ambient = new AmbientLight(0xffffff, this.config.ambientLight);
    ambient.name = 'ambient-light';
    this.rootObject.add(ambient);

    // Main spotlight with theme color
    const mainLight = new PointLight(this.getPrimaryColor(), 1, 15);
    mainLight.name = 'main-light';
    mainLight.position.set(0, this.roomHeight - 1, 0);
    mainLight.castShadow = true;
    this.rootObject.add(mainLight);

    // Accent lights on either side of the stage
    const accentColor = this.getAccentColor();
    
    const leftLight = new PointLight(accentColor, 0.5, 10);
    leftLight.name = 'left-accent-light';
    leftLight.position.set(-3, 3, -2);
    this.rootObject.add(leftLight);

    const rightLight = new PointLight(accentColor, 0.5, 10);
    rightLight.name = 'right-accent-light';
    rightLight.position.set(3, 3, -2);
    this.rootObject.add(rightLight);
  }

  /**
   * Add theme-specific decorations
   * Override in subclasses for custom decorations
   */
  protected addThemeDecorations(): void {
    // Base implementation - no additional decorations
    // Subclasses can override to add theme-specific elements
  }
}
