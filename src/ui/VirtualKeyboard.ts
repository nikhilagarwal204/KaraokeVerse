/**
 * KaraokeVerse - Virtual Keyboard
 * Requirements: 8.4
 * 
 * Displays a virtual keyboard for text input in VR.
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

import { UISystem, UIButton, UI_CONSTANTS } from "./UISystem.js";

// Keyboard layout
const KEYBOARD_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
  ['Space', 'Done'],
];

// Keyboard dimensions
const KEYBOARD_CONFIG = {
  width: 1.8,
  height: 0.8,
  keyWidth: 0.12,
  keyHeight: 0.1,
  keySpacing: 0.02,
  spaceKeyWidth: 0.6,
  doneKeyWidth: 0.3,
  backspaceKeyWidth: 0.18,
};

/**
 * VirtualKeyboard - displays a keyboard for text input
 * Requirements: 8.4
 */
export class VirtualKeyboard {
  private uiSystem: UISystem;
  private keyButtons: UIButton[] = [];
  private currentText: string = '';
  private maxLength: number = 50;

  // Callbacks
  private onTextChange: ((text: string) => void) | null = null;
  private onDone: ((text: string) => void) | null = null;

  // Canvas for text rendering
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(uiSystem: UISystem) {
    this.uiSystem = uiSystem;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    
    this.createKeyboard();
    console.log('[VirtualKeyboard] Created');
  }

  /**
   * Set callback for text changes
   */
  setOnTextChange(callback: (text: string) => void): void {
    this.onTextChange = callback;
  }

  /**
   * Set callback for done button
   */
  setOnDone(callback: (text: string) => void): void {
    this.onDone = callback;
  }

  /**
   * Set maximum text length
   */
  setMaxLength(length: number): void {
    this.maxLength = length;
  }

  /**
   * Create the keyboard panel
   */
  private createKeyboard(): void {
    const panel = this.uiSystem.createPanel(
      'keyboard',
      new Vector3(0, 1.0, -1.5),
      KEYBOARD_CONFIG.width,
      KEYBOARD_CONFIG.height
    );

    // Create keys for each row
    let rowY = (KEYBOARD_CONFIG.height / 2) - 0.1;

    KEYBOARD_ROWS.forEach((row, rowIndex) => {
      this.createKeyRow(panel, row, rowY, rowIndex);
      rowY -= KEYBOARD_CONFIG.keyHeight + KEYBOARD_CONFIG.keySpacing;
    });

    // Initially hide the keyboard
    panel.rootObject.visible = false;
  }

  /**
   * Create a row of keys
   */
  private createKeyRow(
    panel: ReturnType<UISystem['createPanel']>,
    keys: string[],
    y: number,
    rowIndex: number
  ): void {
    // Calculate total row width
    let totalWidth = 0;
    keys.forEach((key) => {
      totalWidth += this.getKeyWidth(key) + KEYBOARD_CONFIG.keySpacing;
    });
    totalWidth -= KEYBOARD_CONFIG.keySpacing; // Remove last spacing

    // Start position (centered)
    let x = -totalWidth / 2;

    keys.forEach((key) => {
      const keyWidth = this.getKeyWidth(key);
      const keyX = x + keyWidth / 2;

      const button = this.createKeyButton(key, keyX, y, keyWidth);
      this.keyButtons.push(button);
      this.uiSystem.addButtonToPanel(panel, button);

      x += keyWidth + KEYBOARD_CONFIG.keySpacing;
    });
  }

  /**
   * Get the width for a specific key
   */
  private getKeyWidth(key: string): number {
    switch (key) {
      case 'Space':
        return KEYBOARD_CONFIG.spaceKeyWidth;
      case 'Done':
        return KEYBOARD_CONFIG.doneKeyWidth;
      case '⌫':
        return KEYBOARD_CONFIG.backspaceKeyWidth;
      default:
        return KEYBOARD_CONFIG.keyWidth;
    }
  }

  /**
   * Create a key button
   */
  private createKeyButton(
    key: string,
    x: number,
    y: number,
    width: number
  ): UIButton {
    const geometry = new PlaneGeometry(width, KEYBOARD_CONFIG.keyHeight);
    
    // Different colors for special keys
    let bgColor = '#3d3d5c';
    if (key === 'Done') bgColor = '#27ae60';
    else if (key === '⌫') bgColor = '#c0392b';
    else if (key === 'Space') bgColor = '#4a4a6a';

    const material = new MeshBasicMaterial({ color: new Color(bgColor) });
    const mesh = new Mesh(geometry, material);
    mesh.name = `key-${key}`;
    mesh.position.set(x, y, 0.01);
    mesh.userData = { buttonId: `key-${key}` };

    // Add label
    const displayLabel = key === 'Space' ? '␣' : key;
    const labelMesh = this.createTextMesh(
      displayLabel,
      width * 100,
      KEYBOARD_CONFIG.keyHeight * 100,
      { fontSize: key.length > 1 ? 12 : 18, color: '#ffffff', backgroundColor: 'transparent' }
    );
    labelMesh.position.set(0, 0, 0.001);
    mesh.add(labelMesh);

    return {
      id: `key-${key}`,
      label: key,
      position: new Vector3(x, y, 0.01),
      width,
      height: KEYBOARD_CONFIG.keyHeight,
      mesh,
      material,
      onClick: () => this.handleKeyPress(key),
      isHovered: false,
      isActive: false,
    };
  }

  /**
   * Create a text mesh using canvas
   */
  private createTextMesh(
    text: string,
    width: number,
    height: number,
    options: { fontSize: number; color: string; backgroundColor: string }
  ): Mesh {
    const scale = 2;
    this.canvas.width = width * scale;
    this.canvas.height = height * scale;

    if (options.backgroundColor !== 'transparent') {
      this.ctx.fillStyle = options.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

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
   * Handle key press
   */
  private handleKeyPress(key: string): void {
    switch (key) {
      case '⌫':
        // Backspace
        if (this.currentText.length > 0) {
          this.currentText = this.currentText.slice(0, -1);
          this.notifyTextChange();
        }
        break;

      case 'Space':
        // Add space
        if (this.currentText.length < this.maxLength) {
          this.currentText += ' ';
          this.notifyTextChange();
        }
        break;

      case 'Done':
        // Submit
        console.log('[VirtualKeyboard] Done pressed, text:', this.currentText);
        if (this.onDone) {
          this.onDone(this.currentText);
        }
        this.hide();
        break;

      default:
        // Regular key
        if (this.currentText.length < this.maxLength) {
          this.currentText += key;
          this.notifyTextChange();
        }
        break;
    }
  }

  /**
   * Notify text change callback
   */
  private notifyTextChange(): void {
    if (this.onTextChange) {
      this.onTextChange(this.currentText);
    }
  }

  /**
   * Set the current text
   */
  setText(text: string): void {
    this.currentText = text.substring(0, this.maxLength);
  }

  /**
   * Get the current text
   */
  getText(): string {
    return this.currentText;
  }

  /**
   * Clear the current text
   */
  clear(): void {
    this.currentText = '';
    this.notifyTextChange();
  }

  /**
   * Show the keyboard
   */
  show(): void {
    this.uiSystem.showPanel('keyboard');
  }

  /**
   * Hide the keyboard
   */
  hide(): void {
    this.uiSystem.hidePanel('keyboard');
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    for (const button of this.keyButtons) {
      button.mesh.geometry.dispose();
      button.material.dispose();
    }
    console.log('[VirtualKeyboard] Disposed');
  }
}
