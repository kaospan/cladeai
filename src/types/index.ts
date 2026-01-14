export interface Track {
  id: string;
  external_id: string;
  provider: 'spotify' | 'youtube' | 'apple_music';
  title: string;
  artist: string;
  album?: string;
  cover_url?: string;
  preview_url?: string;
  duration_ms?: number;
  detected_key?: string;
  detected_mode?: 'major' | 'minor' | 'unknown';
  progression_raw?: string[];
  progression_roman?: string[];
  loop_length_bars?: number;
  cadence_type?: 'none' | 'loop' | 'plagal' | 'authentic' | 'deceptive' | 'other';
  confidence_score?: number;
  analysis_source?: 'metadata' | 'crowd' | 'analysis';
  energy?: number;
  danceability?: number;
  valence?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface UserProvider {
  id: string;
  user_id: string;
  provider: 'spotify' | 'youtube' | 'apple_music';
  provider_user_id?: string;
  connected_at: string;
}

export interface UserInteraction {
  id: string;
  user_id: string;
  track_id: string;
  interaction_type: 'like' | 'save' | 'skip' | 'more_harmonic' | 'more_vibe' | 'share';
  created_at: string;
}

export interface UserCredits {
  id: string;
  user_id: string;
  monthly_allowance: number;
  credits_used: number;
  last_reset: string;
}

export interface ChordSubmission {
  id: string;
  track_id: string;
  user_id: string;
  detected_key?: string;
  detected_mode?: 'major' | 'minor';
  progression_roman?: string[];
  status: 'pending' | 'approved' | 'rejected';
  moderated_by?: string;
  created_at: string;
}

export type InteractionType = 'like' | 'save' | 'skip' | 'more_harmonic' | 'more_vibe' | 'share';

// Roman numeral to display mapping
export const ROMAN_NUMERALS = {
  'I': { label: 'I', class: 'chord-i' },
  'i': { label: 'i', class: 'chord-i' },
  'II': { label: 'II', class: 'chord-ii' },
  'ii': { label: 'ii', class: 'chord-ii' },
  'III': { label: 'III', class: 'chord-iii' },
  'iii': { label: 'iii', class: 'chord-iii' },
  'IV': { label: 'IV', class: 'chord-iv' },
  'iv': { label: 'iv', class: 'chord-iv' },
  'V': { label: 'V', class: 'chord-v' },
  'v': { label: 'v', class: 'chord-v' },
  'VI': { label: 'VI', class: 'chord-vi' },
  'vi': { label: 'vi', class: 'chord-vi' },
  'VII': { label: 'VII', class: 'chord-vii' },
  'vii': { label: 'vii', class: 'chord-vii' },
} as const;
