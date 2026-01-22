/**
 * Taste DNA API
 * 
 * Computes user's musical taste profile from their listening history:
 * - Favorite chord progressions
 * - Mode preferences (major vs minor)
 * - Energy preferences
 * - Cadence patterns
 */

import { supabase } from '@/integrations/supabase/client';
import type { Track } from '@/types';

export interface ProgressionFrequency {
  progression: string[];
  count: number;
  tracks: string[]; // Track IDs
}

export interface ModePreference {
  mode: 'major' | 'minor';
  percentage: number;
  count: number;
}

export interface TasteDNAProfile {
  favoriteProgressions: ProgressionFrequency[];
  preferredModes: ModePreference[];
  energyPreference: number; // 0-1
  cadencePreference: 'loop' | 'authentic' | 'plagal' | 'deceptive' | 'mixed';
  averageTempo: number;
  totalTracksAnalyzed: number;
}

/**
 * Compute user's taste DNA from their listening history
 */
export async function computeTasteDNA(userId: string): Promise<TasteDNAProfile | null> {
  try {
    // Get user's play history and saved tracks
    const [playHistoryResult, interactionsResult] = await Promise.all([
      supabase
        .from('play_history')
        .select('track_id, tracks!inner(*)')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(200),
      supabase
        .from('user_interactions')
        .select('track_id, tracks!inner(*)')
        .eq('user_id', userId)
        .in('interaction_type', ['like', 'save'])
        .order('created_at', { ascending: false })
        .limit(100)
    ]);

    // Combine and deduplicate tracks
    const playedTracks = (playHistoryResult.data || [])
      .map(pe => (pe as any).tracks as Track)
      .filter(Boolean);
    
    const likedTracks = (interactionsResult.data || [])
      .map(int => (int as any).tracks as Track)
      .filter(Boolean);

    // Merge and deduplicate
    const trackMap = new Map<string, Track>();
    [...playedTracks, ...likedTracks].forEach(track => {
      if (track?.id) trackMap.set(track.id, track);
    });

    const allTracks = Array.from(trackMap.values());

    if (allTracks.length === 0) {
      return null;
    }

    // Calculate progression frequencies
    const progressionMap = new Map<string, { count: number; tracks: string[] }>();
    
    allTracks.forEach(track => {
      if (track.progression_roman && track.progression_roman.length > 0) {
        const key = track.progression_roman.join('→');
        const existing = progressionMap.get(key);
        if (existing) {
          existing.count++;
          existing.tracks.push(track.id);
        } else {
          progressionMap.set(key, { count: 1, tracks: [track.id] });
        }
      }
    });

    // Sort progressions by frequency
    const favoriteProgressions = Array.from(progressionMap.entries())
      .map(([key, value]) => ({
        progression: key.split('→'),
        count: value.count,
        tracks: value.tracks,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate mode preferences
    const modeStats = allTracks.reduce(
      (acc, track) => {
        if (track.detected_mode === 'major') {
          acc.major++;
        } else if (track.detected_mode === 'minor') {
          acc.minor++;
        }
        return acc;
      },
      { major: 0, minor: 0 }
    );

    const totalModes = modeStats.major + modeStats.minor;
    const preferredModes: ModePreference[] = totalModes > 0
      ? [
          {
            mode: 'major' as const,
            percentage: Math.round((modeStats.major / totalModes) * 100),
            count: modeStats.major,
          },
          {
            mode: 'minor' as const,
            percentage: Math.round((modeStats.minor / totalModes) * 100),
            count: modeStats.minor,
          },
        ].sort((a, b) => b.percentage - a.percentage)
      : [];

    // Calculate energy preference
    const energyValues = allTracks
      .filter(t => typeof t.energy === 'number')
      .map(t => t.energy as number);
    
    const energyPreference = energyValues.length > 0
      ? energyValues.reduce((sum, val) => sum + val, 0) / energyValues.length
      : 0.5;

    // Calculate cadence preference
    const cadenceFreq = allTracks.reduce(
      (acc, track) => {
        const cadence = track.cadence_type || 'loop';
        acc[cadence] = (acc[cadence] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topCadence = Object.entries(cadenceFreq)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as TasteDNAProfile['cadencePreference'] || 'loop';

    // Calculate average tempo
    const tempoValues = allTracks
      .filter(t => typeof t.tempo === 'number')
      .map(t => t.tempo as number);
    
    const averageTempo = tempoValues.length > 0
      ? Math.round(tempoValues.reduce((sum, val) => sum + val, 0) / tempoValues.length)
      : 120;

    return {
      favoriteProgressions,
      preferredModes,
      energyPreference,
      cadencePreference: topCadence,
      averageTempo,
      totalTracksAnalyzed: allTracks.length,
    };
  } catch (error) {
    console.error('Error computing taste DNA:', error);
    return null;
  }
}

/**
 * Get tracks with specific progression
 */
export async function getTracksWithProgression(
  progression: string[]
): Promise<Track[]> {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .contains('progression_roman', progression)
      .limit(20);

    if (error) throw error;
    return (data || []) as unknown as Track[];
  } catch (error) {
    console.error('Error fetching tracks with progression:', error);
    return [];
  }
}

/**
 * Get tracks in specific mode (major/minor)
 */
export async function getTracksInMode(
  mode: 'major' | 'minor',
  limit = 20
): Promise<Track[]> {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('detected_mode', mode)
      .limit(limit);

    if (error) throw error;
    return (data || []) as unknown as Track[];
  } catch (error) {
    console.error('Error fetching tracks in mode:', error);
    return [];
  }
}
