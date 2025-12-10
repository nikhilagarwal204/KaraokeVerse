/**
 * KaraokeVerse - K-pop Seoul Studio Room
 * Requirements: 2.1, 2.2
 * 
 * Purple themed room inspired by K-pop studio aesthetics.
 */

import {
  Mesh,
  MeshStandardMaterial,
  BoxGeometry,
  CylinderGeometry,
  Color,
} from "@iwsdk/core";

import { ThemedRoom } from "../ThemedRoom.js";

/**
 * K-pop Seoul Studio - Purple theme
 * Features modern studio elements with purple lighting accents
 */
export class KpopSeoulStudio extends ThemedRoom {
  constructor() {
    super('kpop');
  }

  /**
   * Add K-pop studio themed decorations
   * - LED light panels
   * - Speaker towers
   */
  protected override addThemeDecorations(): void {
    this.addLEDPanels();
    this.addSpeakerTowers();
  }

  /**
   * Add LED light panel strips
   */
  private addLEDPanels(): void {
    const ledMaterial = new MeshStandardMaterial({
      color: new Color(this.config.primaryColor),
      emissive: new Color(this.config.primaryColor),
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });

    // Vertical LED strips on back wall
    const stripGeometry = new BoxGeometry(0.15, 3, 0.1);
    
    const positions = [-3, -1.5, 1.5, 3];
    positions.forEach((x, index) => {
      const strip = new Mesh(stripGeometry.clone(), ledMaterial.clone());
      strip.name = `led-strip-${index}`;
      strip.position.set(x, 2.5, -4.9);
      this.rootObject.add(strip);
    });

    // Horizontal LED strip at top
    const horizontalGeometry = new BoxGeometry(8, 0.15, 0.1);
    const topStrip = new Mesh(horizontalGeometry, ledMaterial.clone());
    topStrip.name = 'led-strip-top';
    topStrip.position.set(0, 4.2, -4.9);
    this.rootObject.add(topStrip);
  }

  /**
   * Add decorative speaker towers
   */
  private addSpeakerTowers(): void {
    const speakerMaterial = new MeshStandardMaterial({
      color: new Color('#2d2d2d'),
      roughness: 0.7,
      metalness: 0.3,
    });

    const coneMaterial = new MeshStandardMaterial({
      color: new Color(this.config.accentColor),
      roughness: 0.5,
    });

    // Speaker tower geometry
    const towerGeometry = new BoxGeometry(0.8, 2, 0.6);
    const coneGeometry = new CylinderGeometry(0.15, 0.2, 0.1, 16);

    // Left speaker tower
    const leftTower = new Mesh(towerGeometry, speakerMaterial);
    leftTower.name = 'speaker-left';
    leftTower.position.set(-4, 1, -3);
    this.rootObject.add(leftTower);

    // Speaker cones on left tower
    const leftCone1 = new Mesh(coneGeometry.clone(), coneMaterial.clone());
    leftCone1.rotation.x = Math.PI / 2;
    leftCone1.position.set(-4, 1.5, -2.65);
    this.rootObject.add(leftCone1);

    const leftCone2 = new Mesh(coneGeometry.clone(), coneMaterial.clone());
    leftCone2.rotation.x = Math.PI / 2;
    leftCone2.position.set(-4, 0.8, -2.65);
    this.rootObject.add(leftCone2);

    // Right speaker tower
    const rightTower = new Mesh(towerGeometry.clone(), speakerMaterial.clone());
    rightTower.name = 'speaker-right';
    rightTower.position.set(4, 1, -3);
    this.rootObject.add(rightTower);

    // Speaker cones on right tower
    const rightCone1 = new Mesh(coneGeometry.clone(), coneMaterial.clone());
    rightCone1.rotation.x = Math.PI / 2;
    rightCone1.position.set(4, 1.5, -2.65);
    this.rootObject.add(rightCone1);

    const rightCone2 = new Mesh(coneGeometry.clone(), coneMaterial.clone());
    rightCone2.rotation.x = Math.PI / 2;
    rightCone2.position.set(4, 0.8, -2.65);
    this.rootObject.add(rightCone2);
  }
}
