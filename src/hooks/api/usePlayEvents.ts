/**
 * React hooks for play events tracking
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlayEvent, PlayAction, MusicProvider } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RecordPlayEventParams {
  track_id: string;
  provider: MusicProvider;
  action: PlayAction;
  context?: string;
  device?: string;
  metadata?: Record<string, any>;
}

/**
 * Hook to record a play event
 */
export function useRecordPlayEvent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: RecordPlayEventParams) => {
      const { data, error } = await supabase
        .from('play_events')
        .insert({
          user_id: user?.id,
          track_id: params.track_id,
          provider: params.provider,
          action: params.action,
          context: params.context,
          device: params.device,
          metadata: params.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;
      return data as PlayEvent;
    },
    onSuccess: () => {
      // Invalidate play history queries
      queryClient.invalidateQueries({ queryKey: ['play-history'] });
    },
  });
}

interface PlayHistoryParams {
  limit?: number;
  cursor?: string;
  provider?: MusicProvider;
  startDate?: string;
  endDate?: string;
}

/**
 * Hook to fetch user's play history
 */
export function usePlayHistory(params: PlayHistoryParams = {}) {
  const { user } = useAuth();
  const { limit = 20, provider, startDate, endDate } = params;

  return useQuery({
    queryKey: ['play-history', user?.id, limit, provider, startDate, endDate],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('play_events')
        .select(`
          *,
          tracks (
            id,
            title,
            artists,
            album,
            artwork_url,
            duration_ms
          )
        `)
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
        .limit(limit);

      if (provider) {
        query = query.eq('provider', provider);
      }

      if (startDate) {
        query = query.gte('played_at', startDate);
      }

      if (endDate) {
        query = query.lte('played_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as PlayEvent[];
    },
    enabled: !!user,
  });
}

/**
 * Hook to get play stats for a user
 */
export function usePlayStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['play-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get total plays
      const { count: totalPlays } = await supabase
        .from('play_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get plays by provider
      const { data: providerStats } = await supabase
        .from('play_events')
        .select('provider')
        .eq('user_id', user.id);

      const providerCounts: Record<string, number> = {};
      providerStats?.forEach(event => {
        providerCounts[event.provider] = (providerCounts[event.provider] || 0) + 1;
      });

      // Get recent plays (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: recentPlays } = await supabase
        .from('play_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('played_at', sevenDaysAgo);

      return {
        totalPlays: totalPlays || 0,
        providerCounts,
        recentPlays: recentPlays || 0,
      };
    },
    enabled: !!user,
  });
}
