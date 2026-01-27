/**
 * Play Events API
 * Simple wrapper for recording play events without requiring React hooks
 */

import { supabase } from '@/integrations/supabase/client';
import { MusicProvider } from '@/types';

type PlayAction = 'open_app' | 'open_web' | 'preview';

interface RecordPlayEventParams {
  track_id: string;
  provider: MusicProvider;
  action: PlayAction;
  context?: string;
  device?: string;
  metadata?: Record<string, unknown>;
}

let interactionsDisabled = false;
let interactionsDisabledReason: string | null = null;
let interactionsWarned = false;

function disableInteractions(reason: string) {
  interactionsDisabled = true;
  interactionsDisabledReason = reason;
  if (!interactionsWarned) {
    console.warn('[PlayEvents] disabled user_interactions:', reason);
    interactionsWarned = true;
  }
}

/**
 * Record a play event (non-hook version for use outside React components)
 */
export async function recordPlayEvent(params: RecordPlayEventParams): Promise<void> {
  if (interactionsDisabled) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase.from('user_interactions').insert({
        user_id: user.id,
        track_id: params.track_id,
        interaction_type: `play_${params.action}`,
      });

      if (error) {
        // Common causes: missing track row (FK), RLS, or anon session
        const reason = error.message || error.code || 'unknown';
        disableInteractions(`insert failed (${reason})`);
      }
    }
  } catch (error) {
    disableInteractions(error?.message ? `exception: ${error.message}` : 'exception during insert');
  }
}
