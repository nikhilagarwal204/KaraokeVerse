/**
 * KaraokeVerse - Text Renderer
 * Requirements: 8.1
 * 
 * Renders text on 3D panels using canvas textures.
 */

import {
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  CanvasTexture,
  Color,
} from "@iwsdk/core";

// Text rendering options
export interface TextOptions {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: CanvasTextAlign;
  padding?: number;
  maxWidth?: number;
}

const DEFAULT_OPTIONS: Required<TextOptions> = {
  fontSize: 32,
  fontFamily: 'Arial, sans-serif',
  color: '#ffffff',
  backgroundColor: 'transparent',
  textAlign: 'center',
  padding: 10,
  maxWidth: 256,
};

/**
 * TextRenderer class - creates text meshes using canvas textures
 */
export class TextRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }


  /**
   * Create a text mesh with the given text and options
   */
  createTextMesh(
    text: string,
    width: number,
    height: number,
    options: TextOptions = {}
  ): { mesh: Mesh; material: MeshBasicMaterial; texture: CanvasTexture } {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Set canvas size (use higher resolution for crisp text)
    const scale = 2;
    this.canvas.width = width * scale;
    this.canvas.height = height * scale;

    // Clear canvas
    if (opts.backgroundColor !== 'transparent') {
      this.ctx.fillStyle = opts.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Set text properties
    this.ctx.font = `${opts.fontSize * scale}px ${opts.fontFamily}`;
    this.ctx.fillStyle = opts.color;
    this.ctx.textAlign = opts.textAlign;
    this.ctx.textBaseline = 'middle';

    // Draw text
    const x = opts.textAlign === 'center' ? this.canvas.width / 2 :
              opts.textAlign === 'right' ? this.canvas.width - opts.padding * scale :
              opts.padding * scale;
    const y = this.canvas.height / 2;

    this.ctx.fillText(text, x, y, opts.maxWidth * scale);

    // Create texture from canvas
    const texture = new CanvasTexture(this.canvas);
    texture.needsUpdate = true;

    // Create material and mesh
    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true,
    });

    const geometry = new PlaneGeometry(width / 100, height / 100);
    const mesh = new Mesh(geometry, material);
    mesh.name = `text-${text.substring(0, 10)}`;

    return { mesh, material, texture };
  }

  /**
   * Update text on an existing texture
   */
  updateText(
    texture: CanvasTexture,
    text: string,
    width: number,
    height: number,
    options: TextOptions = {}
  ): void {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const scale = 2;

    this.canvas.width = width * scale;
    this.canvas.height = height * scale;

    if (opts.backgroundColor !== 'transparent') {
      this.ctx.fillStyle = opts.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.ctx.font = `${opts.fontSize * scale}px ${opts.fontFamily}`;
    this.ctx.fillStyle = opts.color;
    this.ctx.textAlign = opts.textAlign;
    this.ctx.textBaseline = 'middle';

    const x = opts.textAlign === 'center' ? this.canvas.width / 2 :
              opts.textAlign === 'right' ? this.canvas.width - opts.padding * scale :
              opts.padding * scale;
    const y = this.canvas.height / 2;

    this.ctx.fillText(text, x, y, opts.maxWidth * scale);
    texture.needsUpdate = true;
  }

  /**
   * Create a button with text label
   */
  createButtonWithLabel(
    label: string,
    width: number,
    height: number,
    bgColor: string = '#2d2d44',
    textColor: string = '#ffffff'
  ): { mesh: Mesh; material: MeshBasicMaterial; texture: CanvasTexture } {
    return this.createTextMesh(label, width, height, {
      backgroundColor: bgColor,
      color: textColor,
      fontSize: 24,
    });
  }
}
