/**
 * Spotify User Data Hooks
 * 
 * React Query hooks for fetching user-specific Spotify data.
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
  getRecentlyPlayedTracks,
  isSpotifyConnected,
  getSpotifyProfile,
} from '@/services/spotifyUserService';

/**
 * Hook to check if user has Spotify connected
 */
export function useSpotifyConnected() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['spotify-connected', user?.id],
    queryFn: () => isSpotifyConnected(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch user's recently played tracks from Spotify
 */
export function useSpotifyRecentlyPlayed(limit = 20) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['spotify-recently-played', user?.id, limit],
    queryFn: () => getRecentlyPlayedTracks(user!.id, limit),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes - recent plays change frequently
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch user's Spotify profile
 */
export function useSpotifyProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['spotify-profile', user?.id],
    queryFn: () => getSpotifyProfile(user!.id),
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
