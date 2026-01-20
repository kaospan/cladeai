/**
 * User Preferences Service
 * 
 * Manages persistent user preferences with localStorage fallback.
 * Syncs with Supabase profile when user is authenticated.
 */

import { MusicProvider } from '@/types';

// Storage keys
const STORAGE_PREFIX = 'harmony_hub_';
const KEYS = {
  PREFERRED_PROVIDER: `${STORAGE_PREFIX}preferred_provider`,
  VOLUME: `${STORAGE_PREFIX}volume`,
  AUTOPLAY: `${STORAGE_PREFIX}autoplay`,
  THEME: `${STORAGE_PREFIX}theme`,
  LAST_PROVIDER_USED: `${STORAGE_PREFIX}last_provider`,
} as const;

export type ThemePreference = 'light' | 'dark' | 'system';

export interface UserPreferences {
  preferredProvider: MusicProvider | null;
  lastProviderUsed: MusicProvider | null;
  volume: number;
  autoplay: boolean;
  theme: ThemePreference;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  preferredProvider: null,
  lastProviderUsed: null,
  volume: 0.7,
  autoplay: true,
  theme: 'system',
};

/**
 * Get a preference value from localStorage
 */
function getLocalPreference<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Set a preference value in localStorage
 */
function setLocalPreference<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save preference:', error);
  }
}

/**
 * Get all preferences from localStorage
 */
export function getPreferences(): UserPreferences {
  return {
    preferredProvider: getLocalPreference<MusicProvider | null>(KEYS.PREFERRED_PROVIDER, DEFAULT_PREFERENCES.preferredProvider),
    lastProviderUsed: getLocalPreference<MusicProvider | null>(KEYS.LAST_PROVIDER_USED, DEFAULT_PREFERENCES.lastProviderUsed),
    volume: getLocalPreference<number>(KEYS.VOLUME, DEFAULT_PREFERENCES.volume),
    autoplay: getLocalPreference<boolean>(KEYS.AUTOPLAY, DEFAULT_PREFERENCES.autoplay),
    theme: getLocalPreference<ThemePreference>(KEYS.THEME, DEFAULT_PREFERENCES.theme),
  };
}

/**
 * Set preferred music provider
 */
export function setPreferredProvider(provider: MusicProvider | null): void {
  setLocalPreference(KEYS.PREFERRED_PROVIDER, provider);
}

/**
 * Get preferred music provider
 */
export function getPreferredProvider(): MusicProvider | null {
  return getLocalPreference<MusicProvider | null>(KEYS.PREFERRED_PROVIDER, null);
}

/**
 * Record the last provider used (for smart defaults)
 */
export function setLastProviderUsed(provider: MusicProvider): void {
  setLocalPreference(KEYS.LAST_PROVIDER_USED, provider);
}

/**
 * Get the last provider used
 */
export function getLastProviderUsed(): MusicProvider | null {
  return getLocalPreference<MusicProvider | null>(KEYS.LAST_PROVIDER_USED, null);
}

/**
 * Get the best provider to use for a track
 * Priority: preferred > last used > first available
 */
export function getBestProvider(availableProviders: MusicProvider[]): MusicProvider | null {
  if (availableProviders.length === 0) return null;
  
  const preferred = getPreferredProvider();
  if (preferred && availableProviders.includes(preferred)) {
    return preferred;
  }
  
  const lastUsed = getLastProviderUsed();
  if (lastUsed && availableProviders.includes(lastUsed)) {
    return lastUsed;
  }
  
  // Default priority: spotify > youtube > apple_music > others
  const priority: MusicProvider[] = ['spotify', 'youtube', 'apple_music', 'deezer', 'soundcloud', 'amazon_music'];
  for (const provider of priority) {
    if (availableProviders.includes(provider)) {
      return provider;
    }
  }
  
  return availableProviders[0];
}

/**
 * Set volume preference (0-1)
 */
export function setVolume(volume: number): void {
  setLocalPreference(KEYS.VOLUME, Math.max(0, Math.min(1, volume)));
}

/**
 * Get volume preference
 */
export function getVolume(): number {
  return getLocalPreference<number>(KEYS.VOLUME, DEFAULT_PREFERENCES.volume);
}

/**
 * Set autoplay preference
 */
export function setAutoplay(enabled: boolean): void {
  setLocalPreference(KEYS.AUTOPLAY, enabled);
}

/**
 * Get autoplay preference
 */
export function getAutoplay(): boolean {
  return getLocalPreference<boolean>(KEYS.AUTOPLAY, DEFAULT_PREFERENCES.autoplay);
}

/**
 * Set theme preference
 */
export function setTheme(theme: ThemePreference): void {
  setLocalPreference(KEYS.THEME, theme);
}

/**
 * Get theme preference
 */
export function getTheme(): ThemePreference {
  return getLocalPreference<ThemePreference>(KEYS.THEME, DEFAULT_PREFERENCES.theme);
}

/**
 * Clear all preferences (for logout)
 */
export function clearPreferences(): void {
  Object.values(KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
