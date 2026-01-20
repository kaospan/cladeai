/**
 * Spotify User API Service
 * 
 * Fetches user-specific data from Spotify using their stored access token.
 * Handles token refresh automatically.
 */

import { supabase } from '@/integrations/supabase/client';
import { Track } from '@/types';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

interface SpotifyPlayHistoryItem {
  track: {
    id: string;
    name: string;
    artists: Array<{ id: string; name: string }>;
    album: {
      id: string;
      name: string;
      images: Array<{ url: string; height: number; width: number }>;
    };
    duration_ms: number;
    external_urls: { spotify: string };
    uri: string;
    preview_url?: string;
  };
  played_at: string;
}

interface SpotifyRecentlyPlayedResponse {
  items: SpotifyPlayHistoryItem[];
  next?: string;
  cursors?: { after: string; before: string };
  limit: number;
  href: string;
}

interface UserProviderRow {
  id: string;
  user_id: string;
  provider: string;
  provider_user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  connected_at: string;
}

/**
 * Get user's Spotify credentials from database
 */
async function getSpotifyCredentials(userId: string): Promise<UserProviderRow | null> {
  const { data, error } = await supabase
    .from('user_providers')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'spotify')
    .single();

  if (error || !data) {
    return null;
  }

  return data as UserProviderRow;
}

/**
 * Refresh Spotify access token
 */
async function refreshSpotifyToken(
  userId: string,
  refreshToken: string
): Promise<string | null> {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  
  if (!clientId) {
    console.error('Spotify client ID not configured');
    return null;
  }

  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
      }),
    });

    if (!response.ok) {
      console.error('Failed to refresh Spotify token:', response.status);
      return null;
    }

    const data = await response.json();
    const newExpiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

    // Update token in database
    await supabase
      .from('user_providers')
      .update({
        access_token: data.access_token,
        expires_at: newExpiresAt,
        // Spotify may return a new refresh token
        ...(data.refresh_token && { refresh_token: data.refresh_token }),
      })
      .eq('user_id', userId)
      .eq('provider', 'spotify');

    return data.access_token;
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    return null;
  }
}

/**
 * Get valid access token, refreshing if needed
 */
async function getValidAccessToken(userId: string): Promise<string | null> {
  const credentials = await getSpotifyCredentials(userId);
  
  if (!credentials) {
    return null;
  }

  // Check if token is expired (with 5 min buffer)
  const expiresAt = new Date(credentials.expires_at);
  const now = new Date();
  const bufferMs = 5 * 60 * 1000; // 5 minutes

  if (expiresAt.getTime() - now.getTime() < bufferMs) {
    // Token expired or expiring soon, refresh it
    return await refreshSpotifyToken(userId, credentials.refresh_token);
  }

  return credentials.access_token;
}

/**
 * Transform Spotify track to our Track type
 */
function transformSpotifyTrack(item: SpotifyPlayHistoryItem): Track {
  const { track } = item;
  const artwork = track.album.images.sort((a, b) => b.height - a.height)[0];

  return {
    id: `spotify:${track.id}`,
    title: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    artists: track.artists.map(a => a.name),
    album: track.album.name,
    cover_url: artwork?.url,
    artwork_url: artwork?.url,
    duration_ms: track.duration_ms,
    spotify_id: track.id,
    url_spotify_web: track.external_urls.spotify,
    url_spotify_app: track.uri,
    preview_url: track.preview_url,
    provider: 'spotify',
    external_id: track.id,
  };
}

/**
 * Fetch user's recently played tracks from Spotify
 */
export async function getRecentlyPlayedTracks(
  userId: string,
  limit = 20
): Promise<{ tracks: Track[]; source: 'spotify' } | null> {
  const accessToken = await getValidAccessToken(userId);
  
  if (!accessToken) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      limit: Math.min(limit, 50).toString(), // Spotify max is 50
    });

    const response = await fetch(
      `${SPOTIFY_API_BASE}/me/player/recently-played?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        // Token invalid, try to refresh
        const newToken = await refreshSpotifyToken(userId, '');
        if (!newToken) {
          console.error('Spotify token refresh failed');
          return null;
        }
        // Retry with new token
        return getRecentlyPlayedTracks(userId, limit);
      }
      console.error('Failed to fetch recently played:', response.status);
      return null;
    }

    const data: SpotifyRecentlyPlayedResponse = await response.json();
    const tracks = data.items.map(transformSpotifyTrack);

    return { tracks, source: 'spotify' };
  } catch (error) {
    console.error('Error fetching recently played:', error);
    return null;
  }
}

/**
 * Check if user has Spotify connected
 */
export async function isSpotifyConnected(userId: string): Promise<boolean> {
  const credentials = await getSpotifyCredentials(userId);
  return credentials !== null;
}

/**
 * Get user's Spotify profile info
 */
export async function getSpotifyProfile(userId: string): Promise<{
  displayName: string;
  email: string;
  imageUrl?: string;
} | null> {
  const accessToken = await getValidAccessToken(userId);
  
  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    return {
      displayName: data.display_name || data.id,
      email: data.email,
      imageUrl: data.images?.[0]?.url,
    };
  } catch (error) {
    console.error('Error fetching Spotify profile:', error);
    return null;
  }
}
