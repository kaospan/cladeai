/**
 * React hooks for track connections (WhoSampled-style relationships)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrackConnection, ConnectionGraph, ConnectionType, Track } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook to fetch connection graph for a track
 */
export function useTrackConnections(trackId: string) {
  return useQuery({
    queryKey: ['track-connections', trackId],
    queryFn: async (): Promise<ConnectionGraph | null> => {
      if (!trackId) return null;

      // Get the track itself
      const { data: track, error: trackError } = await supabase
        .from('tracks')
        .select('*')
        .eq('id', trackId)
        .single();

      if (trackError || !track) throw trackError || new Error('Track not found');

      // Get upstream connections (what this track comes from)
      const { data: upstreamConnections, error: upstreamError } = await supabase
        .from('track_connections')
        .select(`
          *,
          from_track:tracks!track_connections_from_track_id_fkey (*)
        `)
        .eq('to_track_id', trackId);

      if (upstreamError) throw upstreamError;

      // Get downstream connections (what this track influenced)
      const { data: downstreamConnections, error: downstreamError } = await supabase
        .from('track_connections')
        .select(`
          *,
          to_track:tracks!track_connections_to_track_id_fkey (*)
        `)
        .eq('from_track_id', trackId);

      if (downstreamError) throw downstreamError;

      // Find most popular derivative
      let mostPopularDerivative: Track | undefined;
      if (downstreamConnections && downstreamConnections.length > 0) {
        const derivatives = downstreamConnections.map((c: any) => c.to_track);
        mostPopularDerivative = derivatives.reduce((best: any, current: any) => {
          return (current.popularity_score || 0) > (best.popularity_score || 0) ? current : best;
        });
      }

      return {
        track: track as Track,
        upstream: (upstreamConnections || []).map((c: any) => ({
          ...c,
          track: c.from_track,
        })),
        downstream: (downstreamConnections || []).map((c: any) => ({
          ...c,
          track: c.to_track,
        })),
        most_popular_derivative: mostPopularDerivative,
      };
    },
    enabled: !!trackId,
  });
}

interface CreateConnectionParams {
  from_track_id: string;
  to_track_id: string;
  connection_type: ConnectionType;
  confidence?: number;
  evidence_url?: string;
  evidence_text?: string;
}

/**
 * Hook to create a new track connection
 */
export function useCreateConnection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateConnectionParams) => {
      if (!user) throw new Error('Must be logged in to create connections');

      const { data, error } = await supabase
        .from('track_connections')
        .insert({
          from_track_id: params.from_track_id,
          to_track_id: params.to_track_id,
          connection_type: params.connection_type,
          confidence: params.confidence,
          evidence_url: params.evidence_url,
          evidence_text: params.evidence_text,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as TrackConnection;
    },
    onSuccess: (_, variables) => {
      // Invalidate connection queries for both tracks
      queryClient.invalidateQueries({ queryKey: ['track-connections', variables.from_track_id] });
      queryClient.invalidateQueries({ queryKey: ['track-connections', variables.to_track_id] });
    },
  });
}

/**
 * Hook to get all connections with pagination
 */
export function useAllConnections(limit: number = 50) {
  return useQuery({
    queryKey: ['all-connections', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('track_connections')
        .select(`
          *,
          from_track:tracks!track_connections_from_track_id_fkey (id, title, artists, artwork_url),
          to_track:tracks!track_connections_to_track_id_fkey (id, title, artists, artwork_url)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to get connection statistics
 */
export function useConnectionStats() {
  return useQuery({
    queryKey: ['connection-stats'],
    queryFn: async () => {
      // Get total connections
      const { count: totalConnections } = await supabase
        .from('track_connections')
        .select('*', { count: 'exact', head: true });

      // Get connections by type
      const { data: typeData } = await supabase
        .from('track_connections')
        .select('connection_type');

      const typeCounts: Record<string, number> = {};
      typeData?.forEach(conn => {
        typeCounts[conn.connection_type] = (typeCounts[conn.connection_type] || 0) + 1;
      });

      // Get tracks with most connections
      const { data: mostConnected } = await supabase
        .from('tracks')
        .select(`
          id,
          title,
          artists,
          artwork_url,
          upstream_count:track_connections!track_connections_to_track_id_fkey(count),
          downstream_count:track_connections!track_connections_from_track_id_fkey(count)
        `)
        .limit(10);

      return {
        totalConnections: totalConnections || 0,
        typeCounts,
        mostConnected: mostConnected || [],
      };
    },
  });
}
