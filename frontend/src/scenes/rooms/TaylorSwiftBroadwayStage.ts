/**
 * KaraokeVerse - Taylor Swift Broadway Stage Room
 * Requirements: 2.1, 2.2
 * 
 * Pink/purple themed room inspired by Taylor Swift concert aesthetics.
 */

import {
  Mesh,
  MeshStandardMaterial,
  BoxGeometry,
  SphereGeometry,
  CylinderGeometry,
  Color,
  PointLight,
} from "@iwsdk/core";

import { ThemedRoom } from "../ThemedRoom.js";

/**
 * Taylor Swift Broadway Stage - Pink/Purple theme
 * Features sparkly elements, heart decorations, and concert-style lighting
 */
export class TaylorSwiftBroadwayStage extends ThemedRoom {
  constructor() {
    super('taylor-swift');
  }

  /**
   * Add Taylor Swift themed decorations
   * - Sparkle/star elements
   * - Heart decorations
   * - Concert-style LED strips
   */
  protected override addThemeDecorations(): void {
    this.addSparkleElements();
    this.addHeartDecorations();
    this.addConcertLEDs();
  }

  /**
   * Add sparkle/star elements scattered around
   */
  private addSparkleElements(): void {
    const sparkleMaterial = new MeshStandardMaterial({
      color: new Color('#ffffff'),
      emissive: new Color(this.config.primaryColor),
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9,
    });

    const sparkleGeometry = new SphereGeometry(0.05, 8, 8);

    // Scatter sparkles around the room
    const sparklePositions = [
      { x: -3, y: 4, z: -3 },
      { x: 2, y: 4.2, z: -2 },
      { x: -1, y: 4.5, z: -4 },
      { x: 3.5, y: 3.8, z: -3.5 },
      { x: -2.5, y: 4.3, z: -1 },
      { x: 1, y: 4.1, z: -3 },
      { x: -4, y: 3.5, z: -2 },
      { x: 4, y: 4, z: -1 },
      { x: 0, y: 4.6, z: -2.5 },
      { x: -1.5, y: 3.9, z: -4.2 },
    ];

    sparklePositions.forEach((pos, index) => {
      const sparkle = new Mesh(sparkleGeometry.clone(), sparkleMaterial.clone());
      sparkle.name = `sparkle-${index}`;
      sparkle.position.set(pos.x, pos.y, pos.z);
      this.rootObject.add(sparkle);

      // Add small point light for extra sparkle effect
      if (index % 3 === 0) {
        const light = new PointLight(new Color(this.config.primaryColor), 0.1, 3);
        light.position.set(pos.x, pos.y, pos.z);
        this.rootObject.add(light);
      }
    });
  }

  /**
   * Add heart-shaped decorations
   */
  private addHeartDecorations(): void {
    // Simplified heart using spheres and boxes
    const heartMaterial = new MeshStandardMaterial({
      color: new Color(this.config.accentColor),
      emissive: new Color(this.config.accentColor),
      emissiveIntensity: 0.4,
      roughness: 0.3,
    });

    // Create simplified heart shapes on the back wall
    const createHeart = (x: number, y: number, z: number, scale: number, name: string) => {
      // Heart made of overlapping spheres and a rotated box
      const sphereGeometry = new SphereGeometry(0.15 * scale, 12, 12);
      
      const leftLobe = new Mesh(sphereGeometry, heartMaterial.clone());
      leftLobe.position.set(x - 0.1 * scale, y + 0.05 * scale, z);
      this.rootObject.add(leftLobe);

      const rightLobe = new Mesh(sphereGeometry.clone(), heartMaterial.clone());
      rightLobe.position.set(x + 0.1 * scale, y + 0.05 * scale, z);
      this.rootObject.add(rightLobe);

      const bottomGeometry = new BoxGeometry(0.2 * scale, 0.2 * scale, 0.1 * scale);
      const bottom = new Mesh(bottomGeometry, heartMaterial.clone());
      bottom.rotation.z = Math.PI / 4;
      bottom.position.set(x, y - 0.1 * scale, z);
      bottom.name = name;
      this.rootObject.add(bottom);
    };

    // Add hearts at different positions
    createHeart(-3, 3.5, -4.8, 1, 'heart-left');
    createHeart(3, 3.5, -4.8, 1, 'heart-right');
    createHeart(0, 4.2, -4.8, 0.7, 'heart-center');
  }

  /**
   * Add concert-style LED strips
   */
  private addConcertLEDs(): void {
    const ledMaterial = new MeshStandardMaterial({
      color: new Color(this.config.primaryColor),
      emissive: new Color(this.config.primaryColor),
      emissiveIntensity: 0.7,
      roughness: 0.2,
    });

    const altLedMaterial = new MeshStandardMaterial({
      color: new Color(this.config.accentColor),
      emissive: new Color(this.config.accentColor),
      emissiveIntensity: 0.7,
      roughness: 0.2,
    });

    // Vertical LED strips alternating colors
    const stripGeometry = new BoxGeometry(0.08, 4, 0.08);
    
    for (let i = 0; i < 10; i++) {
      const x = -4.5 + i;
      const material = i % 2 === 0 ? ledMaterial.clone() : altLedMaterial.clone();
      const strip = new Mesh(stripGeometry.clone(), material);
      strip.name = `led-strip-${i}`;
      strip.position.set(x, 2.5, -4.95);
      this.rootObject.add(strip);
    }

    // Stage edge LEDs
    const edgeGeometry = new CylinderGeometry(0.03, 0.03, 6, 8);
    const stageEdge = new Mesh(edgeGeometry, ledMaterial.clone());
    stageEdge.name = 'stage-edge-led';
    stageEdge.rotation.z = Math.PI / 2;
    stageEdge.position.set(0, 0.32, 0.05);
    this.rootObject.add(stageEdge);
  }
}
