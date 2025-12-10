/**
 * KaraokeVerse - Video Screen Entity
 * Requirements: 4.3, 4.4
 * 
 * 3D plane for displaying YouTube karaoke videos in VR.
 * Positioned facing the player spawn point.
 */

import {
  Object3D,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Color,
  Vector3,
  DoubleSide,
} from "@iwsdk/core";

// Video screen dimensions (16:9 aspect ratio)
const SCREEN_DIMENSIONS = {
  width: 4,
  height: 2.25,
  frameThickness: 0.1,
};

// Screen colors
const SCREEN_COLORS = {
  frame: '#1a1a1a',      // Dark frame
  screen: '#000000',      // Black screen when no video
  screenActive: '#111111', // Slightly lighter when video playing
};

/**
 * VideoScreen entity for displaying YouTube videos in VR
 * Requirements: 4.3, 4.4
 */
export class VideoScreen {
  public readonly rootObject: Object3D;
  public isPlaying: boolean = false;
  
  private readonly position: Vector3;
  private screenMesh: Mesh;
  private frameMesh: Mesh;
  private screenMaterial: MeshBasicMaterial;
  private frameMaterial: MeshBasicMaterial;
  
  // YouTube iframe element (rendered as CSS3D or overlay)
  private iframeContainer: HTMLDivElement | null = null;
  private iframe: HTMLIFrameElement | null = null;
  private currentVideoId: string | null = null;
  
  // YouTube Player API reference
  private player: YT.Player | null = null;
  private playerReady: boolean = false;

  constructor(position: Vector3) {
    this.position = position.clone();
    this.rootObject = new Object3D();
    this.rootObject.name = 'video-screen';

    // Create materials
    this.screenMaterial = new MeshBasicMaterial({
      color: new Color(SCREEN_COLORS.screen),
      side: DoubleSide,
    });

    this.frameMaterial = new MeshBasicMaterial({
      color: new Color(SCREEN_COLORS.frame),
    });

    // Create screen mesh
    this.screenMesh = this.createScreen();
    this.frameMesh = this.createFrame();

    // Add meshes to root object
    this.rootObject.add(this.frameMesh);
    this.rootObject.add(this.screenMesh);

    // Set position
    this.rootObject.position.copy(this.position);

    // Initialize YouTube API
    this.initYouTubeAPI();

    console.log('[VideoScreen] Created at position:', this.position);
  }

  /**
   * Create the main screen plane
   */
  private createScreen(): Mesh {
    const geometry = new PlaneGeometry(
      SCREEN_DIMENSIONS.width,
      SCREEN_DIMENSIONS.height
    );

    const mesh = new Mesh(geometry, this.screenMaterial);
    mesh.name = 'screen-surface';
    // Screen is slightly in front of frame
    mesh.position.z = 0.01;

    return mesh;
  }

  /**
   * Create the frame around the screen
   */
  private createFrame(): Mesh {
    const frameWidth = SCREEN_DIMENSIONS.width + SCREEN_DIMENSIONS.frameThickness * 2;
    const frameHeight = SCREEN_DIMENSIONS.height + SCREEN_DIMENSIONS.frameThickness * 2;
    
    const geometry = new PlaneGeometry(frameWidth, frameHeight);
    const mesh = new Mesh(geometry, this.frameMaterial);
    mesh.name = 'screen-frame';

    return mesh;
  }


  /**
   * Initialize YouTube IFrame API
   */
  private initYouTubeAPI(): void {
    // Check if YouTube API is already loaded
    if (typeof YT !== 'undefined' && YT.Player) {
      console.log('[VideoScreen] YouTube API already loaded');
      return;
    }

    // Load YouTube IFrame API script
    if (!document.getElementById('youtube-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      console.log('[VideoScreen] YouTube API script injected');
    }
  }

  /**
   * Create the iframe container for YouTube video
   */
  private createIframeContainer(): void {
    if (this.iframeContainer) return;

    // Create container div for the iframe
    this.iframeContainer = document.createElement('div');
    this.iframeContainer.id = 'youtube-player-container';
    this.iframeContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 640px;
      height: 360px;
      z-index: 1000;
      pointer-events: auto;
      display: none;
    `;

    // Create placeholder div for YouTube player
    const playerDiv = document.createElement('div');
    playerDiv.id = 'youtube-player';
    this.iframeContainer.appendChild(playerDiv);

    document.body.appendChild(this.iframeContainer);
    console.log('[VideoScreen] Iframe container created');
  }

  /**
   * Load a YouTube video by ID
   * Requirements: 4.3
   */
  loadVideo(youtubeId: string): void {
    console.log('[VideoScreen] Loading video:', youtubeId);
    this.currentVideoId = youtubeId;

    // Create iframe container if not exists
    this.createIframeContainer();

    // Show the container
    if (this.iframeContainer) {
      this.iframeContainer.style.display = 'block';
    }

    // Wait for YouTube API to be ready
    if (typeof YT !== 'undefined' && YT.Player) {
      this.createPlayer(youtubeId);
    } else {
      // Set up callback for when API is ready
      (window as any).onYouTubeIframeAPIReady = () => {
        console.log('[VideoScreen] YouTube API ready');
        this.createPlayer(youtubeId);
      };
    }

    // Update screen appearance
    this.screenMaterial.color.set(SCREEN_COLORS.screenActive);
  }

  /**
   * Create YouTube player instance
   */
  private createPlayer(videoId: string): void {
    // Destroy existing player if any
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }

    // Create new player
    this.player = new YT.Player('youtube-player', {
      height: '360',
      width: '640',
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        fs: 0,
        playsinline: 1,
      },
      events: {
        onReady: this.onPlayerReady.bind(this),
        onStateChange: this.onPlayerStateChange.bind(this),
        onError: this.onPlayerError.bind(this),
      },
    });

    console.log('[VideoScreen] YouTube player created for video:', videoId);
  }

  /**
   * Handle player ready event
   */
  private onPlayerReady(event: YT.PlayerEvent): void {
    console.log('[VideoScreen] Player ready');
    this.playerReady = true;
    // Auto-play the video
    event.target.playVideo();
  }

  /**
   * Handle player state change
   */
  private onPlayerStateChange(event: YT.OnStateChangeEvent): void {
    switch (event.data) {
      case YT.PlayerState.PLAYING:
        console.log('[VideoScreen] Video playing');
        this.isPlaying = true;
        break;
      case YT.PlayerState.PAUSED:
        console.log('[VideoScreen] Video paused');
        this.isPlaying = false;
        break;
      case YT.PlayerState.ENDED:
        console.log('[VideoScreen] Video ended');
        this.isPlaying = false;
        break;
      case YT.PlayerState.BUFFERING:
        console.log('[VideoScreen] Video buffering');
        break;
    }
  }

  /**
   * Handle player error
   */
  private onPlayerError(event: YT.OnErrorEvent): void {
    console.error('[VideoScreen] Player error:', event.data);
    this.isPlaying = false;
  }

  /**
   * Play the current video
   * Requirements: 4.4
   */
  play(): void {
    if (this.player && this.playerReady) {
      this.player.playVideo();
      console.log('[VideoScreen] Play requested');
    }
  }

  /**
   * Pause the current video
   */
  pause(): void {
    if (this.player && this.playerReady) {
      this.player.pauseVideo();
      console.log('[VideoScreen] Pause requested');
    }
  }

  /**
   * Stop the video and hide the player
   * Requirements: 4.5
   */
  stop(): void {
    if (this.player && this.playerReady) {
      this.player.stopVideo();
    }

    // Hide the container
    if (this.iframeContainer) {
      this.iframeContainer.style.display = 'none';
    }

    this.isPlaying = false;
    this.currentVideoId = null;

    // Reset screen appearance
    this.screenMaterial.color.set(SCREEN_COLORS.screen);

    console.log('[VideoScreen] Video stopped');
  }

  /**
   * Get the current video ID
   */
  getCurrentVideoId(): string | null {
    return this.currentVideoId;
  }

  /**
   * Check if player is ready
   */
  isReady(): boolean {
    return this.playerReady;
  }

  /**
   * Get screen dimensions
   */
  getScreenDimensions(): { width: number; height: number } {
    return {
      width: SCREEN_DIMENSIONS.width,
      height: SCREEN_DIMENSIONS.height,
    };
  }

  /**
   * Get the screen position
   */
  getPosition(): Vector3 {
    return this.position.clone();
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    // Stop and destroy player
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }

    // Remove iframe container
    if (this.iframeContainer) {
      this.iframeContainer.remove();
      this.iframeContainer = null;
    }

    // Dispose geometries
    this.screenMesh.geometry.dispose();
    this.frameMesh.geometry.dispose();

    // Dispose materials
    this.screenMaterial.dispose();
    this.frameMaterial.dispose();

    this.playerReady = false;
    this.currentVideoId = null;

    console.log('[VideoScreen] Disposed');
  }
}

// YouTube IFrame API type declarations
declare namespace YT {
  interface Player {
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    destroy(): void;
    getPlayerState(): number;
  }

  interface PlayerEvent {
    target: Player;
  }

  interface OnStateChangeEvent {
    data: number;
    target: Player;
  }

  interface OnErrorEvent {
    data: number;
    target: Player;
  }

  const PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };

  class Player {
    constructor(
      elementId: string,
      options: {
        height?: string;
        width?: string;
        videoId?: string;
        playerVars?: {
          autoplay?: number;
          controls?: number;
          modestbranding?: number;
          rel?: number;
          fs?: number;
          playsinline?: number;
        };
        events?: {
          onReady?: (event: PlayerEvent) => void;
          onStateChange?: (event: OnStateChangeEvent) => void;
          onError?: (event: OnErrorEvent) => void;
        };
      }
    );
  }
}
