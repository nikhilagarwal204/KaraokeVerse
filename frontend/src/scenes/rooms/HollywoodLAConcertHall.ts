/**
 * KaraokeVerse - Hollywood LA Concert Hall Room
 * Requirements: 2.1, 2.2
 * 
 * Blue themed room inspired by Hollywood concert hall aesthetics.
 */

import {
  Mesh,
  MeshStandardMaterial,
  BoxGeometry,
  CylinderGeometry,
  Color,
  PointLight,
} from "@iwsdk/core";

import { ThemedRoom } from "../ThemedRoom.js";

/**
 * Hollywood LA Concert Hall - Blue theme
 * Features professional stage lighting, curtains, and concert hall elements
 */
export class HollywoodLAConcertHall extends ThemedRoom {
  constructor() {
    super('hollywood');
  }

  /**
   * Add Hollywood concert hall themed decorations
   * - Stage curtains
   * - Spotlight rigs
   * - Professional stage elements
   */
  protected override addThemeDecorations(): void {
    this.addStageCurtains();
    this.addSpotlightRigs();
    this.addStageElements();
  }

  /**
   * Add stage curtains on the sides
   */
  private addStageCurtains(): void {
    const curtainMaterial = new MeshStandardMaterial({
      color: new Color('#1a1a4e'),
      roughness: 0.9,
    });

    const curtainGeometry = new BoxGeometry(1.5, 4.5, 0.2);

    // Left curtain
    const leftCurtain = new Mesh(curtainGeometry, curtainMaterial);
    leftCurtain.name = 'curtain-left';
    leftCurtain.position.set(-4.2, 2.25, -4);
    this.rootObject.add(leftCurtain);

    // Right curtain
    const rightCurtain = new Mesh(curtainGeometry.clone(), curtainMaterial.clone());
    rightCurtain.name = 'curtain-right';
    rightCurtain.position.set(4.2, 2.25, -4);
    this.rootObject.add(rightCurtain);

    // Top valance
    const valanceGeometry = new BoxGeometry(10, 0.8, 0.3);
    const valance = new Mesh(valanceGeometry, curtainMaterial.clone());
    valance.name = 'curtain-valance';
    valance.position.set(0, 4.6, -4.5);
    this.rootObject.add(valance);
  }

  /**
   * Add spotlight rigs on the ceiling
   */
  private addSpotlightRigs(): void {
    const rigMaterial = new MeshStandardMaterial({
      color: new Color('#333333'),
      roughness: 0.6,
      metalness: 0.5,
    });

    const spotMaterial = new MeshStandardMaterial({
      color: new Color(this.config.primaryColor),
      emissive: new Color(this.config.primaryColor),
      emissiveIntensity: 0.4,
    });

    // Main rig bar
    const rigGeometry = new CylinderGeometry(0.05, 0.05, 8, 8);
    const rig = new Mesh(rigGeometry, rigMaterial);
    rig.name = 'spotlight-rig';
    rig.rotation.z = Math.PI / 2;
    rig.position.set(0, 4.7, -1);
    this.rootObject.add(rig);

    // Spotlight housings
    const spotGeometry = new CylinderGeometry(0.15, 0.1, 0.3, 8);
    const spotPositions = [-3, -1, 1, 3];

    spotPositions.forEach((x, index) => {
      const spot = new Mesh(spotGeometry.clone(), spotMaterial.clone());
      spot.name = `spotlight-${index}`;
      spot.position.set(x, 4.5, -1);
      this.rootObject.add(spot);

      // Add actual point light for each spotlight
      const light = new PointLight(new Color(this.config.primaryColor), 0.3, 8);
      light.position.set(x, 4.3, -1);
      this.rootObject.add(light);
    });
  }

  /**
   * Add professional stage elements
   */
  private addStageElements(): void {
    const metalMaterial = new MeshStandardMaterial({
      color: new Color('#444444'),
      roughness: 0.4,
      metalness: 0.7,
    });

    // Monitor wedges on stage
    const wedgeGeometry = new BoxGeometry(0.6, 0.3, 0.4);
    
    const leftWedge = new Mesh(wedgeGeometry, metalMaterial);
    leftWedge.name = 'monitor-left';
    leftWedge.rotation.x = -0.3;
    leftWedge.position.set(-2, 0.45, -1);
    this.rootObject.add(leftWedge);

    const rightWedge = new Mesh(wedgeGeometry.clone(), metalMaterial.clone());
    rightWedge.name = 'monitor-right';
    rightWedge.rotation.x = -0.3;
    rightWedge.position.set(2, 0.45, -1);
    this.rootObject.add(rightWedge);

    // Stage edge trim
    const trimMaterial = new MeshStandardMaterial({
      color: new Color(this.config.accentColor),
      emissive: new Color(this.config.accentColor),
      emissiveIntensity: 0.3,
    });

    const trimGeometry = new BoxGeometry(6.2, 0.1, 0.1);
    const stageTrim = new Mesh(trimGeometry, trimMaterial);
    stageTrim.name = 'stage-trim';
    stageTrim.position.set(0, 0.35, 0.05);
    this.rootObject.add(stageTrim);
  }
}
