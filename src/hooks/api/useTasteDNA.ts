/**
 * Taste DNA Hooks
 * 
 * React Query hooks for fetching user's musical taste profile
 */

import { useQuery } from '@tanstack/react-query';
import { computeTasteDNA, getTracksWithProgression, getTracksInMode } from '@/api/tasteDNA';
import type { TasteDNAProfile } from '@/api/tasteDNA';
import { useAuth } from '@/hooks/useAuth';

/**
 * Fetch user's computed taste DNA profile
 */
export function useTasteDNA() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['taste-dna', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return computeTasteDNA(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get tracks matching a specific progression
 */
export function useTracksWithProgression(progression: string[] | null) {
  return useQuery({
    queryKey: ['tracks-progression', progression],
    queryFn: () => {
      if (!progression) return [];
      return getTracksWithProgression(progression);
    },
    enabled: !!progression && progression.length > 0,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get tracks in a specific mode
 */
export function useTracksInMode(mode: 'major' | 'minor' | null, limit = 20) {
  return useQuery({
    queryKey: ['tracks-mode', mode, limit],
    queryFn: () => {
      if (!mode) return [];
      return getTracksInMode(mode, limit);
    },
    enabled: !!mode,
    staleTime: 10 * 60 * 1000,
  });
}

export type { TasteDNAProfile };
