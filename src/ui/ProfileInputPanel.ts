/**
 * KaraokeVerse - Profile Input Panel
 * Requirements: 5.1, 5.2, 8.4
 * 
 * Displays name prompt for new users with virtual keyboard integration.
 */

import {
  Vector3,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Color,
  CanvasTexture,
} from "@iwsdk/core";

import { UISystem, UIButton } from "./UISystem.js";

// Panel dimensions
const PANEL_CONFIG = {
  width: 1.4,
  height: 0.8,
  inputWidth: 1.0,
  inputHeight: 0.12,
  buttonWidth: 0.4,
  buttonHeight: 0.1,
  padding: 0.08,
};

// Validation constants (Requirements: 5.2)
const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 20;

/**
 * ProfileInputPanel - displays name input for new users
 * Requirements: 5.1, 5.2, 8.4
 */
export class ProfileInputPanel {
  private uiSystem: UISystem;
  private displayName: string = '';
  private errorMessage: string = '';
  
  // Callbacks
  private onSubmit: ((name: string) => void) | null = null;
  private onOpenKeyboard: (() => void) | null = null;

  // Input display - keep reference to update texture
  private inputMesh: Mesh | null = null;
  private inputCanvas: HTMLCanvasElement;
  private inputCtx: CanvasRenderingContext2D;
  private inputTexture: CanvasTexture | null = null;

  // Error display
  private errorMesh: Mesh | null = null;
  private errorCanvas: HTMLCanvasElement;
  private errorCtx: CanvasRenderingContext2D;
  private errorTexture: CanvasTexture | null = null;

  // Desktop keyboard input handler
  private keyboardHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(uiSystem: UISystem) {
    this.uiSystem = uiSystem;
    
    // Create persistent canvases for input and error
    this.inputCanvas = document.createElement('canvas');
    this.inputCanvas.width = 1024;
    this.inputCanvas.height = 128;
    this.inputCtx = this.inputCanvas.getContext('2d')!;
    
    this.errorCanvas = document.createElement('canvas');
    this.errorCanvas.width = 1024;
    this.errorCanvas.height = 64;
    this.errorCtx = this.errorCanvas.getContext('2d')!;
    
    this.createPanel();
    this.setupDesktopKeyboardInput();
    console.log('[ProfileInputPanel] Created');
  }

  /**
   * Set up desktop keyboard input for easier testing
   */
  private setupDesktopKeyboardInput(): void {
    this.keyboardHandler = (e: KeyboardEvent) => {
      const panel = this.uiSystem.getPanel('profile-input');
      if (!panel || !panel.isVisible) return;

      e.preventDefault(); // Prevent default browser behavior

      if (e.key === 'Enter') {
        this.handleSubmit();
      } else if (e.key === 'Backspace') {
        if (this.displayName.length > 0) {
          this.displayName = this.displayName.slice(0, -1);
          this.redrawInputText();
        }
      } else if (e.key.length === 1 && this.displayName.length < NAME_MAX_LENGTH) {
        this.displayName += e.key;
        this.redrawInputText();
      }
    };

    window.addEventListener('keydown', this.keyboardHandler);
  }

  /**
   * Redraw the input text on the existing canvas/texture
   */
  private redrawInputText(): void {
    const displayText = this.displayName || 'Type your name...';
    const textColor = this.displayName ? '#ffffff' : '#666666';

    // Clear and redraw canvas
    this.inputCtx.clearRect(0, 0, this.inputCanvas.width, this.inputCanvas.height);
    this.inputCtx.font = 'bold 48px Arial, sans-serif';
    this.inputCtx.fillStyle = textColor;
    this.inputCtx.textAlign = 'center';
    this.inputCtx.textBaseline = 'middle';
    this.inputCtx.fillText(displayText, this.inputCanvas.width / 2, this.inputCanvas.height / 2);

    // Update texture
    if (this.inputTexture) {
      this.inputTexture.needsUpdate = true;
    }
  }

  /**
   * Redraw the error text
   */
  private redrawErrorText(): void {
    this.errorCtx.clearRect(0, 0, this.errorCanvas.width, this.errorCanvas.height);
    
    if (this.errorMessage) {
      this.errorCtx.font = 'bold 32px Arial, sans-serif';
      this.errorCtx.fillStyle = '#e74c3c';
      this.errorCtx.textAlign = 'center';
      this.errorCtx.textBaseline = 'middle';
      this.errorCtx.fillText(this.errorMessage, this.errorCanvas.width / 2, this.errorCanvas.height / 2);
    }

    if (this.errorTexture) {
      this.errorTexture.needsUpdate = true;
    }
    
    if (this.errorMesh) {
      this.errorMesh.visible = !!this.errorMessage;
    }
  }

  setOnSubmit(callback: (name: string) => void): void {
    this.onSubmit = callback;
  }

  setOnOpenKeyboard(callback: () => void): void {
    this.onOpenKeyboard = callback;
  }

  /**
   * Create a static text mesh (for title, subtitle, button label)
   */
  private createStaticTextMesh(
    text: string,
    meshWidth: number,
    meshHeight: number,
    fontSize: number,
    textColor: string
  ): Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = Math.round((meshHeight / meshWidth) * 512);
    
    const ctx = canvas.getContext('2d')!;
    ctx.font = `bold ${fontSize * 4}px Arial, sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new CanvasTexture(canvas);
    const material = new MeshBasicMaterial({ map: texture, transparent: true });
    const geometry = new PlaneGeometry(meshWidth, meshHeight);
    return new Mesh(geometry, material);
  }

  /**
   * Create the panel
   */
  private createPanel(): void {
    const panel = this.uiSystem.createPanel(
      'profile-input',
      new Vector3(0, 1.5, -2),
      PANEL_CONFIG.width,
      PANEL_CONFIG.height
    );

    // Title
    const titleMesh = this.createStaticTextMesh('Enter Your Name', 1.0, 0.15, 32, '#ffffff');
    titleMesh.position.set(0, 0.22, 0.02);
    panel.rootObject.add(titleMesh);

    // Subtitle
    const subtitleMesh = this.createStaticTextMesh('(3-20 characters)', 0.6, 0.08, 18, '#888888');
    subtitleMesh.position.set(0, 0.10, 0.02);
    panel.rootObject.add(subtitleMesh);

    // Input field
    this.createInputField(panel);

    // Submit button
    this.createSubmitButton(panel);

    // Error display
    this.createErrorDisplay(panel);

    panel.rootObject.visible = false;
  }

  private createInputField(panel: ReturnType<UISystem['createPanel']>): void {
    const y = -0.05;

    // Border
    const borderGeometry = new PlaneGeometry(PANEL_CONFIG.inputWidth + 0.02, PANEL_CONFIG.inputHeight + 0.02);
    const borderMaterial = new MeshBasicMaterial({ color: new Color('#4a4a6a') });
    const borderMesh = new Mesh(borderGeometry, borderMaterial);
    borderMesh.position.set(0, y, 0.005);
    panel.rootObject.add(borderMesh);

    // Background
    const inputGeometry = new PlaneGeometry(PANEL_CONFIG.inputWidth, PANEL_CONFIG.inputHeight);
    const inputMaterial = new MeshBasicMaterial({ color: new Color('#0f0f23') });
    const inputBgMesh = new Mesh(inputGeometry, inputMaterial);
    inputBgMesh.name = 'name-input-bg';
    inputBgMesh.position.set(0, y, 0.01);
    inputBgMesh.userData = { buttonId: 'name-input' };
    panel.rootObject.add(inputBgMesh);

    // Input text mesh with persistent texture
    this.inputTexture = new CanvasTexture(this.inputCanvas);
    const textMaterial = new MeshBasicMaterial({ map: this.inputTexture, transparent: true });
    const textGeometry = new PlaneGeometry(PANEL_CONFIG.inputWidth - 0.04, PANEL_CONFIG.inputHeight - 0.02);
    this.inputMesh = new Mesh(textGeometry, textMaterial);
    this.inputMesh.position.set(0, y, 0.02);
    panel.rootObject.add(this.inputMesh);

    // Draw initial text
    this.redrawInputText();

    // Button for VR keyboard trigger
    const inputButton: UIButton = {
      id: 'name-input',
      label: 'Enter name...',
      position: new Vector3(0, y, 0.01),
      width: PANEL_CONFIG.inputWidth,
      height: PANEL_CONFIG.inputHeight,
      mesh: inputBgMesh,
      material: inputMaterial,
      onClick: () => { if (this.onOpenKeyboard) this.onOpenKeyboard(); },
      isHovered: false,
      isActive: false,
    };
    this.uiSystem.addButtonToPanel(panel, inputButton);
  }

  private createErrorDisplay(panel: ReturnType<UISystem['createPanel']>): void {
    const y = -0.18;

    this.errorTexture = new CanvasTexture(this.errorCanvas);
    const material = new MeshBasicMaterial({ map: this.errorTexture, transparent: true });
    const geometry = new PlaneGeometry(1.0, 0.08);
    this.errorMesh = new Mesh(geometry, material);
    this.errorMesh.position.set(0, y, 0.02);
    this.errorMesh.visible = false;
    panel.rootObject.add(this.errorMesh);
  }

  private createSubmitButton(panel: ReturnType<UISystem['createPanel']>): void {
    const y = -0.30;

    const geometry = new PlaneGeometry(PANEL_CONFIG.buttonWidth, PANEL_CONFIG.buttonHeight);
    const material = new MeshBasicMaterial({ color: new Color('#27ae60') });
    const mesh = new Mesh(geometry, material);
    mesh.name = 'button-submit';
    mesh.position.set(0, y, 0.01);
    mesh.userData = { buttonId: 'submit-name' };
    panel.rootObject.add(mesh);

    const labelMesh = this.createStaticTextMesh('Continue', PANEL_CONFIG.buttonWidth - 0.02, PANEL_CONFIG.buttonHeight - 0.02, 22, '#ffffff');
    labelMesh.position.set(0, 0, 0.005);
    mesh.add(labelMesh);

    const submitButton: UIButton = {
      id: 'submit-name',
      label: 'Continue',
      position: new Vector3(0, y, 0.01),
      width: PANEL_CONFIG.buttonWidth,
      height: PANEL_CONFIG.buttonHeight,
      mesh,
      material,
      onClick: () => this.handleSubmit(),
      isHovered: false,
      isActive: false,
    };
    this.uiSystem.addButtonToPanel(panel, submitButton);
  }

  setDisplayName(name: string): void {
    this.displayName = name;
    this.errorMessage = '';
    this.redrawInputText();
    this.redrawErrorText();
  }

  getDisplayName(): string {
    return this.displayName;
  }

  private validateName(): boolean {
    const name = this.displayName.trim();
    if (name.length < NAME_MIN_LENGTH) {
      this.errorMessage = `Name must be at least ${NAME_MIN_LENGTH} characters`;
      return false;
    }
    if (name.length > NAME_MAX_LENGTH) {
      this.errorMessage = `Name must be at most ${NAME_MAX_LENGTH} characters`;
      return false;
    }
    this.errorMessage = '';
    return true;
  }

  private handleSubmit(): void {
    if (!this.validateName()) {
      this.redrawErrorText();
      console.log('[ProfileInputPanel] Validation failed:', this.errorMessage);
      return;
    }
    console.log('[ProfileInputPanel] Submitting name:', this.displayName);
    if (this.onSubmit) {
      this.onSubmit(this.displayName.trim());
    }
  }

  show(): void {
    this.uiSystem.showPanel('profile-input');
  }

  hide(): void {
    this.uiSystem.hidePanel('profile-input');
  }

  reset(): void {
    this.displayName = '';
    this.errorMessage = '';
    this.redrawInputText();
    this.redrawErrorText();
  }

  dispose(): void {
    if (this.keyboardHandler) {
      window.removeEventListener('keydown', this.keyboardHandler);
    }
    if (this.inputMesh) {
      this.inputMesh.geometry.dispose();
      (this.inputMesh.material as MeshBasicMaterial).dispose();
    }
    if (this.errorMesh) {
      this.errorMesh.geometry.dispose();
      (this.errorMesh.material as MeshBasicMaterial).dispose();
    }
    this.inputTexture?.dispose();
    this.errorTexture?.dispose();
    console.log('[ProfileInputPanel] Disposed');
  }
}
