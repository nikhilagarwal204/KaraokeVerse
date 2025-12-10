/**
 * KaraokeVerse - Bollywood Mumbai Rooftop Room
 * Requirements: 2.1, 2.2
 * 
 * Orange/gold themed room inspired by Bollywood rooftop party aesthetics.
 */

import {
  Mesh,
  MeshStandardMaterial,
  BoxGeometry,
  SphereGeometry,
  CylinderGeometry,
  Color,
} from "@iwsdk/core";

import { ThemedRoom } from "../ThemedRoom.js";

/**
 * Bollywood Mumbai Rooftop - Orange/Gold theme
 * Features warm lighting, decorative pillars, and festive elements
 */
export class BollywoodMumbaiRooftop extends ThemedRoom {
  constructor() {
    super('bollywood');
  }

  /**
   * Add Bollywood-themed decorations
   * - Decorative pillars
   * - String lights (represented as glowing spheres)
   * - Ornate border elements
   */
  protected override addThemeDecorations(): void {
    this.addDecorativePillars();
    this.addStringLights();
    this.addOrnateBorders();
  }

  /**
   * Add decorative pillars at corners
   */
  private addDecorativePillars(): void {
    const pillarMaterial = new MeshStandardMaterial({
      color: new Color('#d4a574'),
      roughness: 0.6,
      metalness: 0.2,
    });

    const capMaterial = new MeshStandardMaterial({
      color: new Color(this.config.primaryColor),
      roughness: 0.4,
      metalness: 0.4,
    });

    const pillarGeometry = new CylinderGeometry(0.2, 0.25, 4, 16);
    const capGeometry = new SphereGeometry(0.3, 16, 16);

    const positions = [
      { x: -4, z: -4 },
      { x: 4, z: -4 },
    ];

    positions.forEach((pos, index) => {
      // Pillar
      const pillar = new Mesh(pillarGeometry.clone(), pillarMaterial.clone());
      pillar.name = `pillar-${index}`;
      pillar.position.set(pos.x, 2, pos.z);
      this.rootObject.add(pillar);

      // Decorative cap
      const cap = new Mesh(capGeometry.clone(), capMaterial.clone());
      cap.name = `pillar-cap-${index}`;
      cap.position.set(pos.x, 4.2, pos.z);
      this.rootObject.add(cap);
    });
  }

  /**
   * Add string lights across the ceiling
   */
  private addStringLights(): void {
    const lightMaterial = new MeshStandardMaterial({
      color: new Color(this.config.primaryColor),
      emissive: new Color(this.config.primaryColor),
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.9,
    });

    const bulbGeometry = new SphereGeometry(0.08, 8, 8);

    // Create a string of lights across the room
    for (let i = 0; i < 8; i++) {
      const x = -3.5 + i;
      const bulb = new Mesh(bulbGeometry.clone(), lightMaterial.clone());
      bulb.name = `string-light-${i}`;
      // Slight wave pattern
      const y = 4.5 - Math.sin(i * 0.5) * 0.2;
      bulb.position.set(x, y, -2);
      this.rootObject.add(bulb);
    }

    // Second row
    for (let i = 0; i < 8; i++) {
      const x = -3.5 + i;
      const bulb = new Mesh(bulbGeometry.clone(), lightMaterial.clone());
      bulb.name = `string-light-row2-${i}`;
      const y = 4.5 - Math.sin(i * 0.5 + 1) * 0.2;
      bulb.position.set(x, y, 0);
      this.rootObject.add(bulb);
    }
  }

  /**
   * Add ornate border elements
   */
  private addOrnateBorders(): void {
    const borderMaterial = new MeshStandardMaterial({
      color: new Color(this.config.accentColor),
      roughness: 0.5,
      metalness: 0.3,
    });

    // Decorative border along the top of back wall
    const borderGeometry = new BoxGeometry(9, 0.3, 0.15);
    const topBorder = new Mesh(borderGeometry, borderMaterial);
    topBorder.name = 'ornate-border-top';
    topBorder.position.set(0, 4.5, -4.85);
    this.rootObject.add(topBorder);

    // Side borders
    const sideBorderGeometry = new BoxGeometry(0.15, 4, 0.15);
    
    const leftBorder = new Mesh(sideBorderGeometry, borderMaterial.clone());
    leftBorder.name = 'ornate-border-left';
    leftBorder.position.set(-4.5, 2.5, -4.85);
    this.rootObject.add(leftBorder);

    const rightBorder = new Mesh(sideBorderGeometry.clone(), borderMaterial.clone());
    rightBorder.name = 'ornate-border-right';
    rightBorder.position.set(4.5, 2.5, -4.85);
    this.rootObject.add(rightBorder);
  }
}
