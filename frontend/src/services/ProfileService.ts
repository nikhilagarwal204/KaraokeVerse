/**
 * KaraokeVerse - Profile Service
 * Requirements: 5.3, 5.4
 * 
 * Handles communication with backend API for profile CRUD operations
 * and caches profile data in local storage.
 */

import { Player, ProfileResponse, CreateProfileRequest } from "../types/index.js";

const API_BASE_URL = 'http://localhost:3001/api';
const PROFILE_STORAGE_KEY = 'karaokeverse_profile_id';

/**
 * Profile Service - manages player profiles via API and local storage
 */
export class ProfileService {
  private cachedProfile: Player | null = null;

  constructor() {
    console.log('[ProfileService] Initialized');
  }

  /**
   * Get the cached profile ID from local storage
   */
  getCachedProfileId(): string | null {
    try {
      return localStorage.getItem(PROFILE_STORAGE_KEY);
    } catch (error) {
      console.warn('[ProfileService] Failed to read from localStorage:', error);
      return null;
    }
  }

  /**
   * Save profile ID to local storage
   */
  private saveProfileId(profileId: string): void {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, profileId);
    } catch (error) {
      console.warn('[ProfileService] Failed to save to localStorage:', error);
    }
  }

  /**
   * Clear cached profile data
   */
  clearCache(): void {
    this.cachedProfile = null;
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch (error) {
      console.warn('[ProfileService] Failed to clear localStorage:', error);
    }
  }

  /**
   * Get the cached profile (in-memory)
   */
  getCachedProfile(): Player | null {
    return this.cachedProfile;
  }

  /**
   * Convert API response to Player object
   */
  private responseToPlayer(response: ProfileResponse): Player {
    return {
      id: response.id,
      displayName: response.displayName,
      createdAt: new Date(response.createdAt),
      lastActive: new Date(response.lastActive),
    };
  }

  /**
   * Create a new player profile
   * Requirements: 5.3
   */
  async createProfile(displayName: string): Promise<Player> {
    console.log('[ProfileService] Creating profile:', displayName);

    const request: CreateProfileRequest = { displayName };

    const response = await fetch(`${API_BASE_URL}/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to create profile: ${response.status}`);
    }

    const data: ProfileResponse = await response.json();
    const player = this.responseToPlayer(data);

    // Cache the profile
    this.cachedProfile = player;
    this.saveProfileId(player.id);

    console.log('[ProfileService] Profile created:', player.id);
    return player;
  }

  /**
   * Get a player profile by ID
   * Requirements: 5.4
   */
  async getProfile(playerId: string): Promise<Player | null> {
    console.log('[ProfileService] Fetching profile:', playerId);

    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${playerId}`);

      if (response.status === 404) {
        console.log('[ProfileService] Profile not found:', playerId);
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data: ProfileResponse = await response.json();
      const player = this.responseToPlayer(data);

      // Cache the profile
      this.cachedProfile = player;

      console.log('[ProfileService] Profile fetched:', player.displayName);
      return player;
    } catch (error) {
      console.error('[ProfileService] Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Update a player profile
   */
  async updateProfile(playerId: string, displayName: string): Promise<Player> {
    console.log('[ProfileService] Updating profile:', playerId);

    const response = await fetch(`${API_BASE_URL}/profiles/${playerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ displayName }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to update profile: ${response.status}`);
    }

    const data: ProfileResponse = await response.json();
    const player = this.responseToPlayer(data);

    // Update cache
    this.cachedProfile = player;

    console.log('[ProfileService] Profile updated:', player.displayName);
    return player;
  }

  /**
   * Load existing profile from local storage cache
   * Returns the profile if found, null otherwise
   * Requirements: 5.4
   */
  async loadCachedProfile(): Promise<Player | null> {
    const profileId = this.getCachedProfileId();
    
    if (!profileId) {
      console.log('[ProfileService] No cached profile ID found');
      return null;
    }

    try {
      return await this.getProfile(profileId);
    } catch (error) {
      console.warn('[ProfileService] Failed to load cached profile:', error);
      // Clear invalid cache
      this.clearCache();
      return null;
    }
  }

  /**
   * Check if a profile exists (either cached or needs to be created)
   */
  hasProfile(): boolean {
    return this.cachedProfile !== null || this.getCachedProfileId() !== null;
  }
}
