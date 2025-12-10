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
   * Note: width and height are in meters (3D space units)
   */
  createTextMesh(
    text: string,
    width: number,
    height: number,
    options: TextOptions = {}
  ): { mesh: Mesh; material: MeshBasicMaterial; texture: CanvasTexture } {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Create a new canvas for each text mesh to avoid conflicts
    const canvas = document.createElement('canvas');
    const scale = 4; // High resolution for crisp text
    
    // Convert meters to pixels (1 meter = 100 pixels at scale)
    const pixelWidth = Math.max(256, Math.round(width * scale * 100));
    const pixelHeight = Math.max(64, Math.round(height * scale * 100));
    
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    
    const ctx = canvas.getContext('2d')!;

    // Clear canvas
    if (opts.backgroundColor !== 'transparent') {
      ctx.fillStyle = opts.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Set text properties
    const scaledFontSize = opts.fontSize * scale;
    ctx.font = `${scaledFontSize}px ${opts.fontFamily}`;
    ctx.fillStyle = opts.color;
    ctx.textAlign = opts.textAlign;
    ctx.textBaseline = 'middle';

    // Draw text
    const x = opts.textAlign === 'center' ? canvas.width / 2 :
              opts.textAlign === 'right' ? canvas.width - opts.padding * scale :
              opts.padding * scale;
    const y = canvas.height / 2;

    // Measure text to ensure it fits
    const metrics = ctx.measureText(text);
    const maxWidth = opts.maxWidth ? opts.maxWidth * scale : canvas.width * 0.9;
    
    // Draw text, truncate if necessary
    let displayText = text;
    if (metrics.width > maxWidth) {
      // Truncate text with ellipsis
      while (ctx.measureText(displayText + '...').width > maxWidth && displayText.length > 0) {
        displayText = displayText.slice(0, -1);
      }
      displayText += '...';
    }

    ctx.fillText(displayText, x, y, maxWidth);

    // Create texture from canvas
    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;

    // Create material and mesh
    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true,
    });

    // Geometry size is in meters (3D space units)
    const geometry = new PlaneGeometry(width, height);
    const mesh = new Mesh(geometry, material);
    mesh.name = `text-${text.substring(0, 10)}`;

    return { mesh, material, texture };
  }

  /**
   * Update text on an existing texture
   * Note: width and height are in meters (3D space units)
   */
  updateText(
    texture: CanvasTexture,
    text: string,
    width: number,
    height: number,
    options: TextOptions = {}
  ): void {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const scale = 4;

    // Convert meters to pixels (1 meter = 100 pixels at scale)
    const pixelWidth = Math.max(256, Math.round(width * scale * 100));
    const pixelHeight = Math.max(64, Math.round(height * scale * 100));

    this.canvas.width = pixelWidth;
    this.canvas.height = pixelHeight;

    if (opts.backgroundColor !== 'transparent') {
      this.ctx.fillStyle = opts.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    const scaledFontSize = opts.fontSize * scale;
    this.ctx.font = `${scaledFontSize}px ${opts.fontFamily}`;
    this.ctx.fillStyle = opts.color;
    this.ctx.textAlign = opts.textAlign;
    this.ctx.textBaseline = 'middle';

    const x = opts.textAlign === 'center' ? this.canvas.width / 2 :
              opts.textAlign === 'right' ? this.canvas.width - opts.padding * scale :
              opts.padding * scale;
    const y = this.canvas.height / 2;

    // Measure text to ensure it fits
    const metrics = this.ctx.measureText(text);
    const maxWidth = opts.maxWidth ? opts.maxWidth * scale : this.canvas.width * 0.9;
    
    // Draw text, truncate if necessary
    let displayText = text;
    if (metrics.width > maxWidth) {
      // Truncate text with ellipsis
      while (this.ctx.measureText(displayText + '...').width > maxWidth && displayText.length > 0) {
        displayText = displayText.slice(0, -1);
      }
      displayText += '...';
    }

    this.ctx.fillText(displayText, x, y, maxWidth);
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
