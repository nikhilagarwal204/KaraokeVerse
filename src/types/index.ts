/**
 * KaraokeVerse - Shared Types and Constants
 * Requirements: 2.1, 2.2
 */

// Room theme type
export type RoomTheme = 'anime' | 'kpop' | 'bollywood' | 'hollywood' | 'taylor-swift';

// Room theme configuration
export interface RoomThemeConfig {
  theme: RoomTheme;
  displayName: string;
  primaryColor: string;
  accentColor: string;
  ambientLight: number;
}

// All 5 themed room configurations
export const ROOM_THEMES: Record<RoomTheme, RoomThemeConfig> = {
  'anime': {
    theme: 'anime',
    displayName: 'Anime Tokyo Lounge',
    primaryColor: '#ff6b9d',
    accentColor: '#c44569',
    ambientLight: 0.6
  },
  'kpop': {
    theme: 'kpop',
    displayName: 'K-pop Seoul Studio',
    primaryColor: '#a55eea',
    accentColor: '#8854d0',
    ambientLight: 0.7
  },
  'bollywood': {
    theme: 'bollywood',
    displayName: 'Bollywood Mumbai Rooftop',
    primaryColor: '#f7b731',
    accentColor: '#fa8231',
    ambientLight: 0.8
  },
  'hollywood': {
    theme: 'hollywood',
    displayName: 'Hollywood LA Concert Hall',
    primaryColor: '#3867d6',
    accentColor: '#2d98da',
    ambientLight: 0.5
  },
  'taylor-swift': {
    theme: 'taylor-swift',
    displayName: 'Taylor Swift Broadway Stage',
    primaryColor: '#e056fd',
    accentColor: '#be2edd',
    ambientLight: 0.65
  }
};

// Player profile
export interface Player {
  id: string;
  displayName: string;
  createdAt: Date;
  lastActive: Date;
}

// Song data
export interface Song {
  id: string;
  youtubeId: string;
  title: string;
  artist: string;
  theme: RoomTheme;
}

// API Request/Response types
export interface CreateProfileRequest {
  displayName: string;
}

export interface ProfileResponse {
  id: string;
  displayName: string;
  createdAt: string;
  lastActive: string;
}

export interface SongResponse {
  id: string;
  youtubeId: string;
  title: string;
  artist: string;
  theme: string;
}

export interface SongsListResponse {
  songs: SongResponse[];
  total: number;
}
