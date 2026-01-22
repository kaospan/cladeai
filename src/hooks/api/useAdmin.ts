/**
 * Admin Hooks
 * 
 * React hooks for checking admin permissions and managing admin features
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Check if current user has admin role
 */
export function useIsAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .rpc('is_admin', { user_id: user.id });

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return data === true;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get all users (admin only)
 */
export function useAdminUsers(params: {
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*, user_roles(*)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (params.search) {
        query = query.or(`username.ilike.%${params.search}%,email.ilike.%${params.search}%`);
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { users: data || [], total: count || 0 };
    },
    enabled: !!user && isAdmin === true,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Get system statistics (admin only)
 */
export function useAdminStats() {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Get counts in parallel
      const [
        usersResult,
        tracksResult,
        playsResult,
        interactionsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('tracks').select('*', { count: 'exact', head: true }),
        supabase.from('play_history').select('*', { count: 'exact', head: true }),
        supabase.from('user_interactions').select('*', { count: 'exact', head: true }),
      ]);

      // Get active users (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeUsersCount } = await supabase
        .from('play_history')
        .select('user_id', { count: 'exact', head: true })
        .gte('played_at', sevenDaysAgo.toISOString());

      return {
        totalUsers: usersResult.count || 0,
        totalTracks: tracksResult.count || 0,
        totalPlays: playsResult.count || 0,
        totalInteractions: interactionsResult.count || 0,
        activeUsers: activeUsersCount || 0,
      };
    },
    enabled: !!user && isAdmin === true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get flagged content for moderation (admin only)
 */
export function useFlaggedContent() {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ['flagged-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_interactions')
        .select('*, tracks(*), profiles(*)')
        .eq('interaction_type', 'flag')
        .is('resolved_at', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return data || [];
    },
    enabled: !!user && isAdmin === true,
    staleTime: 30 * 1000, // 30 seconds
  });
}
