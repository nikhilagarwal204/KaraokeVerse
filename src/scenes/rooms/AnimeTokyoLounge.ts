/**
 * KaraokeVerse - Anime Tokyo Lounge Room
 * Requirements: 2.1, 2.2
 * 
 * Pink/magenta themed room inspired by Tokyo anime aesthetics.
 */

import {
  Mesh,
  MeshStandardMaterial,
  BoxGeometry,
  SphereGeometry,
  Color,
} from "@iwsdk/core";

import { ThemedRoom } from "../ThemedRoom.js";

/**
 * Anime Tokyo Lounge - Pink/Magenta theme
 * Features neon-style accent elements and anime-inspired decorations
 */
export class AnimeTokyoLounge extends ThemedRoom {
  constructor() {
    super('anime');
  }

  /**
   * Add anime-themed decorations
   * - Neon accent strips
   * - Decorative spheres (like lanterns)
   */
  protected override addThemeDecorations(): void {
    this.addNeonStrips();
    this.addDecorativeLanterns();
  }

  /**
   * Add neon-style accent strips along the walls
   */
  private addNeonStrips(): void {
    const neonMaterial = new MeshStandardMaterial({
      color: new Color(this.config.accentColor),
      emissive: new Color(this.config.accentColor),
      emissiveIntensity: 0.5,
      roughness: 0.3,
    });

    // Horizontal neon strip on back wall
    const stripGeometry = new BoxGeometry(8, 0.1, 0.1);
    const backStrip = new Mesh(stripGeometry, neonMaterial);
    backStrip.name = 'neon-strip-back';
    backStrip.position.set(0, 3.5, -4.9);
    this.rootObject.add(backStrip);

    // Lower strip
    const lowerStrip = new Mesh(stripGeometry.clone(), neonMaterial.clone());
    lowerStrip.name = 'neon-strip-lower';
    lowerStrip.position.set(0, 1.5, -4.9);
    this.rootObject.add(lowerStrip);
  }

  /**
   * Add decorative lantern-like spheres
   */
  private addDecorativeLanterns(): void {
    const lanternMaterial = new MeshStandardMaterial({
      color: new Color('#ff9ff3'),
      emissive: new Color('#ff6b9d'),
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8,
    });

    const sphereGeometry = new SphereGeometry(0.2, 16, 16);

    // Add lanterns in corners
    const positions = [
      { x: -4, y: 3, z: -4 },
      { x: 4, y: 3, z: -4 },
      { x: -4, y: 3, z: 2 },
      { x: 4, y: 3, z: 2 },
    ];

    positions.forEach((pos, index) => {
      const lantern = new Mesh(sphereGeometry.clone(), lanternMaterial.clone());
      lantern.name = `lantern-${index}`;
      lantern.position.set(pos.x, pos.y, pos.z);
      this.rootObject.add(lantern);
    });
  }
}
