/**
 * KaraokeVerse - Song Search Panel
 * Requirements: 4.1, 4.2, 4.5
 * 
 * Displays song search interface with search input, song list,
 * and playback controls.
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

import { Song, SongResponse } from "../types/index.js";
import { UISystem, UIButton, UI_CONSTANTS } from "./UISystem.js";

// Panel dimensions
const PANEL_CONFIG = {
  width: 1.6,
  height: 1.2,
  searchInputWidth: 1.2,
  searchInputHeight: 0.1,
  songButtonWidth: 1.4,
  songButtonHeight: 0.1,
  songSpacing: 0.12,
  controlButtonWidth: 0.3,
  controlButtonHeight: 0.08,
  maxVisibleSongs: 6,
  padding: 0.05,
};

// API base URL
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * SongSearchPanel - displays song search and selection interface
 * Requirements: 4.1, 4.2, 4.5
 */
export class SongSearchPanel {
  private uiSystem: UISystem;
  private panelGroup: Group;
  private songButtons: UIButton[] = [];
  private controlButtons: UIButton[] = [];
  private songs: SongResponse[] = [];
  private searchQuery: string = '';
  private currentTheme: string | null = null;

  // Callbacks
  private onSongSelect: ((youtubeId: string) => void) | null = null;
  private onStop: (() => void) | null = null;
  private onBack: (() => void) | null = null;
  private onOpenKeyboard: (() => void) | null = null;

  // Canvas for text rendering
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // Search input display
  private searchInputMesh: Mesh | null = null;
  private searchInputTexture: CanvasTexture | null = null;

  constructor(uiSystem: UISystem) {
    this.uiSystem = uiSystem;
    this.panelGroup = new Group();
    this.panelGroup.name = 'song-search-panel';
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    
    this.createPanel();
    console.log('[SongSearchPanel] Created');
  }

  /**
   * Set callback for song selection
   */
  setOnSongSelect(callback: (youtubeId: string) => void): void {
    this.onSongSelect = callback;
  }

  /**
   * Set callback for stop button
   */
  setOnStop(callback: () => void): void {
    this.onStop = callback;
  }

  /**
   * Set callback for back button
   */
  setOnBack(callback: () => void): void {
    this.onBack = callback;
  }

  /**
   * Set callback for opening keyboard
   */
  setOnOpenKeyboard(callback: () => void): void {
    this.onOpenKeyboard = callback;
  }

  /**
   * Create the panel with search input and controls
   */
  private createPanel(): void {
    const panel = this.uiSystem.createPanel(
      'song-search',
      new Vector3(0, 1.5, -2),
      PANEL_CONFIG.width,
      PANEL_CONFIG.height
    );

    // Create title
    const titleMesh = this.createTextMesh(
      'Song Search',
      PANEL_CONFIG.width,
      0.06,
      { fontSize: 24, color: '#ffffff', backgroundColor: 'transparent' }
    );
    titleMesh.position.set(0, (PANEL_CONFIG.height / 2) - 0.06, 0.02);
    panel.rootObject.add(titleMesh);

    // Create search input field (clickable to open keyboard)
    this.createSearchInput(panel);

    // Create control buttons (Stop, Back)
    this.createControlButtons(panel);

    // Initially hide the panel
    panel.rootObject.visible = false;
  }

  /**
   * Create the search input field
   */
  private createSearchInput(panel: ReturnType<UISystem['createPanel']>): void {
    const y = (PANEL_CONFIG.height / 2) - 0.18;

    // Create input background
    const inputGeometry = new PlaneGeometry(
      PANEL_CONFIG.searchInputWidth,
      PANEL_CONFIG.searchInputHeight
    );
    const inputMaterial = new MeshBasicMaterial({
      color: new Color('#2d2d44'),
    });
    const inputMesh = new Mesh(inputGeometry, inputMaterial);
    inputMesh.name = 'search-input-bg';
    inputMesh.position.set(0, y, 0.01);
    inputMesh.userData = { buttonId: 'search-input' };
    panel.rootObject.add(inputMesh);

    // Create search input button for keyboard trigger
    const searchButton: UIButton = {
      id: 'search-input',
      label: 'Search...',
      position: new Vector3(0, y, 0.01),
      width: PANEL_CONFIG.searchInputWidth,
      height: PANEL_CONFIG.searchInputHeight,
      mesh: inputMesh,
      material: inputMaterial,
      onClick: () => {
        if (this.onOpenKeyboard) {
          this.onOpenKeyboard();
        }
      },
      isHovered: false,
      isActive: false,
    };
    this.uiSystem.addButtonToPanel(panel, searchButton);

    // Create text display for search query
    this.updateSearchInputDisplay(panel, 'Tap to search...');
  }

  /**
   * Update the search input display text
   */
  private updateSearchInputDisplay(
    panel: ReturnType<UISystem['createPanel']>,
    text: string
  ): void {
    // Remove old mesh if exists
    if (this.searchInputMesh) {
      panel.rootObject.remove(this.searchInputMesh);
      this.searchInputMesh.geometry.dispose();
      (this.searchInputMesh.material as MeshBasicMaterial).dispose();
    }

    const y = (PANEL_CONFIG.height / 2) - 0.18;
    this.searchInputMesh = this.createTextMesh(
      text || 'Tap to search...',
      PANEL_CONFIG.searchInputWidth,
      PANEL_CONFIG.searchInputHeight,
      { fontSize: 16, color: text ? '#ffffff' : '#888888', backgroundColor: 'transparent' }
    );
    this.searchInputMesh.position.set(0, y, 0.02);
    panel.rootObject.add(this.searchInputMesh);
  }

  /**
   * Create control buttons (Stop, Back)
   */
  private createControlButtons(panel: ReturnType<UISystem['createPanel']>): void {
    const y = -(PANEL_CONFIG.height / 2) + 0.08;

    // Stop button
    const stopButton = this.createControlButton(
      'stop',
      'Stop',
      -0.2,
      y,
      '#c0392b',
      () => {
        if (this.onStop) this.onStop();
      }
    );
    this.controlButtons.push(stopButton);
    this.uiSystem.addButtonToPanel(panel, stopButton);

    // Back button
    const backButton = this.createControlButton(
      'back',
      'Back',
      0.2,
      y,
      '#7f8c8d',
      () => {
        if (this.onBack) this.onBack();
      }
    );
    this.controlButtons.push(backButton);
    this.uiSystem.addButtonToPanel(panel, backButton);
  }

  /**
   * Create a control button
   */
  private createControlButton(
    id: string,
    label: string,
    x: number,
    y: number,
    color: string,
    onClick: () => void
  ): UIButton {
    const geometry = new PlaneGeometry(
      PANEL_CONFIG.controlButtonWidth,
      PANEL_CONFIG.controlButtonHeight
    );
    const material = new MeshBasicMaterial({ color: new Color(color) });
    const mesh = new Mesh(geometry, material);
    mesh.name = `button-${id}`;
    mesh.position.set(x, y, 0.01);
    mesh.userData = { buttonId: id };

    // Add label
    const labelMesh = this.createTextMesh(
      label,
      PANEL_CONFIG.controlButtonWidth,
      PANEL_CONFIG.controlButtonHeight,
      { fontSize: 14, color: '#ffffff', backgroundColor: 'transparent' }
    );
    labelMesh.position.set(0, 0, 0.001);
    mesh.add(labelMesh);

    return {
      id,
      label,
      position: new Vector3(x, y, 0.01),
      width: PANEL_CONFIG.controlButtonWidth,
      height: PANEL_CONFIG.controlButtonHeight,
      mesh,
      material,
      onClick,
      isHovered: false,
      isActive: false,
    };
  }

  /**
   * Create a text mesh using canvas
   * Note: width and height are in meters (3D space units)
   */
  private createTextMesh(
    text: string,
    width: number,
    height: number,
    options: { fontSize: number; color: string; backgroundColor: string }
  ): Mesh {
    // Create a new canvas for each text mesh to avoid conflicts
    const canvas = document.createElement('canvas');
    const scale = 4; // High resolution for crisp text
    
    // Convert meters to pixels (1 meter = 100 pixels at scale)
    const pixelWidth = Math.max(256, Math.round(width * scale * 100));
    const pixelHeight = Math.max(64, Math.round(height * scale * 100));
    
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    
    const ctx = canvas.getContext('2d')!;

    // Clear or fill background
    if (options.backgroundColor !== 'transparent') {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Set font with proper scaling
    const scaledFontSize = options.fontSize * scale;
    ctx.font = `bold ${scaledFontSize}px Arial, sans-serif`;
    ctx.fillStyle = options.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Measure text to ensure it fits
    const metrics = ctx.measureText(text);
    const maxWidth = canvas.width * 0.9; // Leave 10% padding
    
    // Draw text, truncate if necessary
    let displayText = text;
    if (metrics.width > maxWidth) {
      // Truncate text with ellipsis
      while (ctx.measureText(displayText + '...').width > maxWidth && displayText.length > 0) {
        displayText = displayText.slice(0, -1);
      }
      displayText += '...';
    }
    
    ctx.fillText(displayText, canvas.width / 2, canvas.height / 2, maxWidth);

    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new MeshBasicMaterial({ map: texture, transparent: true });
    // Geometry size is in meters (3D space units)
    const geometry = new PlaneGeometry(width, height);
    return new Mesh(geometry, material);
  }

  /**
   * Set the search query and update display
   */
  setSearchQuery(query: string): void {
    this.searchQuery = query;
    const panel = this.uiSystem.getPanel('song-search');
    if (panel) {
      this.updateSearchInputDisplay(panel, query);
    }
  }

  /**
   * Load songs from API
   * Requirements: 4.2
   */
  async loadSongs(theme?: string): Promise<void> {
    this.currentTheme = theme || null;
    
    try {
      let url = `${API_BASE_URL}/songs`;
      if (theme) {
        url += `?theme=${encodeURIComponent(theme)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load songs: ${response.status}`);
      }

      const data = await response.json();
      this.songs = data.songs || [];
      this.updateSongList();
      console.log(`[SongSearchPanel] Loaded ${this.songs.length} songs`);
    } catch (error) {
      console.error('[SongSearchPanel] Error loading songs:', error);
      this.songs = [];
      this.updateSongList();
    }
  }

  /**
   * Search songs by query
   * Requirements: 4.2
   */
  async searchSongs(query: string): Promise<void> {
    if (!query.trim()) {
      await this.loadSongs(this.currentTheme || undefined);
      return;
    }

    try {
      const url = `${API_BASE_URL}/songs/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to search songs: ${response.status}`);
      }

      const data = await response.json();
      this.songs = data.songs || [];
      this.updateSongList();
      console.log(`[SongSearchPanel] Found ${this.songs.length} songs for "${query}"`);
    } catch (error) {
      console.error('[SongSearchPanel] Error searching songs:', error);
    }
  }

  /**
   * Update the song list display
   */
  private updateSongList(): void {
    const panel = this.uiSystem.getPanel('song-search');
    if (!panel) return;

    // Remove existing song buttons
    for (const button of this.songButtons) {
      panel.rootObject.remove(button.mesh);
      button.mesh.geometry.dispose();
      button.material.dispose();
    }
    this.songButtons = [];

    // Add new song buttons
    const startY = (PANEL_CONFIG.height / 2) - 0.32;
    const visibleSongs = this.songs.slice(0, PANEL_CONFIG.maxVisibleSongs);

    visibleSongs.forEach((song, index) => {
      const y = startY - (index * PANEL_CONFIG.songSpacing);
      const button = this.createSongButton(song, 0, y);
      this.songButtons.push(button);
      this.uiSystem.addButtonToPanel(panel, button);
    });
  }

  /**
   * Create a song button
   */
  private createSongButton(song: SongResponse, x: number, y: number): UIButton {
    const geometry = new PlaneGeometry(
      PANEL_CONFIG.songButtonWidth,
      PANEL_CONFIG.songButtonHeight
    );
    const material = new MeshBasicMaterial({ color: new Color('#2d2d44') });
    const mesh = new Mesh(geometry, material);
    mesh.name = `button-song-${song.id}`;
    mesh.position.set(x, y, 0.01);
    mesh.userData = { buttonId: `song-${song.id}` };

    // Add song info label
    const label = `${song.title} - ${song.artist}`;
    const labelMesh = this.createTextMesh(
      label,
      PANEL_CONFIG.songButtonWidth,
      PANEL_CONFIG.songButtonHeight,
      { fontSize: 14, color: '#ffffff', backgroundColor: 'transparent' }
    );
    labelMesh.position.set(0, 0, 0.001);
    mesh.add(labelMesh);

    return {
      id: `song-${song.id}`,
      label,
      position: new Vector3(x, y, 0.01),
      width: PANEL_CONFIG.songButtonWidth,
      height: PANEL_CONFIG.songButtonHeight,
      mesh,
      material,
      onClick: () => this.handleSongSelect(song),
      isHovered: false,
      isActive: false,
    };
  }

  /**
   * Handle song selection
   */
  private handleSongSelect(song: SongResponse): void {
    console.log(`[SongSearchPanel] Song selected: ${song.title}`);
    if (this.onSongSelect) {
      this.onSongSelect(song.youtubeId);
    }
  }

  /**
   * Show the panel
   */
  show(): void {
    this.uiSystem.showPanel('song-search');
  }

  /**
   * Hide the panel
   */
  hide(): void {
    this.uiSystem.hidePanel('song-search');
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    for (const button of this.songButtons) {
      button.mesh.geometry.dispose();
      button.material.dispose();
    }
    for (const button of this.controlButtons) {
      button.mesh.geometry.dispose();
      button.material.dispose();
    }
    console.log('[SongSearchPanel] Disposed');
  }
}
