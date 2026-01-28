import { createContext, useContext, useMemo, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import { recordPlayEvent } from '@/api/playEvents';
import { MusicProvider } from '@/types';
import { getPreferredProvider } from '@/lib/preferences';

interface ConnectedProviders {
  spotify?: { connected: boolean };
  youtube?: { connected: boolean };
  apple_music?: { connected: boolean };
} 

export interface PlayerState {
  provider: MusicProvider | null;
  trackId: string | null;
  spotifyOpen: boolean;
  youtubeOpen: boolean;
  canonicalTrackId: string | null;
  spotifyTrackId: string | null;
  youtubeTrackId: string | null;
  autoplaySpotify: boolean;
  autoplayYoutube: boolean;
  /** Start time in seconds for seeking (e.g., section navigation) */
  seekToSec: number | null;
  /** Currently active section ID */
  currentSectionId: string | null;
  /** Whether playback is active */
  isPlaying: boolean;
  /** Queue of tracks */
  queue: import('@/types').Track[];
  /** Current index in queue */
  queueIndex: number;
}

type ProviderControls = {
  play: (startSec?: number | null) => Promise<void> | void;
  pause: () => Promise<void> | void;
  seekTo: (seconds: number) => Promise<void> | void;
  teardown?: () => Promise<void> | void;
};

type OpenPlayerPayload = {
  canonicalTrackId: string | null;
  provider: MusicProvider;
  providerTrackId: string | null;
  autoplay?: boolean;
  context?: string;
  /** Optional start time in seconds */
  startSec?: number;
};

interface PlayerContextValue extends PlayerState {
  openPlayer: (payload: OpenPlayerPayload) => void;
  /** High-level play API: canonicalTrackId may be the app track id (optional), provider selects the provider, providerTrackId is the provider-specific id, startSec optional */
  play: (canonicalTrackId: string | null, provider: MusicProvider, providerTrackId?: string | null, startSec?: number) => void;
  pause: () => void;
  stop: () => void;
  closeSpotify: () => void;
  closeYoutube: () => void;
  switchProvider: (provider: MusicProvider, providerTrackId: string | null, canonicalTrackId?: string | null) => void;
  registerProviderControls: (provider: MusicProvider, controls: ProviderControls) => void;
  /** Seek to a specific time (seconds). Used for section navigation. */
  seekTo: (sec: number) => void;
  /** Clear seekToSec after the player has performed the seek */
  clearSeek: () => void;
  /** Set the currently active section */
  setCurrentSection: (sectionId: string | null) => void;
  /** Set playback state */
  setIsPlaying: (playing: boolean) => void;
  /** Add track to queue */
  addToQueue: (track: import('@/types').Track) => void;
  /** Play track from queue at index */
  playFromQueue: (index: number) => void;
  /** Remove track from queue */
  removeFromQueue: (index: number) => void;
  /** Reorder queue */
  reorderQueue: (newQueue: import('@/types').Track[]) => void;
  /** Clear queue */
  clearQueue: () => void;
  /** Shuffle queue */
  shuffleQueue: () => void;
  /** Go to next track in queue */
  nextTrack: () => void;
  /** Go to previous track in queue */
  previousTrack: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    provider: null,
    trackId: null,
    spotifyOpen: false,
    youtubeOpen: false,
    canonicalTrackId: null,
    spotifyTrackId: null,
    youtubeTrackId: null,
    autoplaySpotify: false,
    autoplayYoutube: false,
    seekToSec: null,
    currentSectionId: null,
    isPlaying: false,
    queue: [],
    queueIndex: -1,
  });
  const providerControlsRef = useRef<Partial<Record<MusicProvider, ProviderControls>>>({});
  const activeProviderRef = useRef<MusicProvider | null>(null);

  useEffect(() => {
    activeProviderRef.current = state.provider;
  }, [state.provider]);

  const stopProvider = useCallback((provider: MusicProvider | null) => {
    if (!provider) return;
    const controls = providerControlsRef.current[provider];
    controls?.pause?.();
    controls?.teardown?.();
  }, []);

  const seekTo = useCallback((sec: number) => {
    setState((prev) => ({ ...prev, seekToSec: sec }));
  }, []);

  const clearSeek = useCallback(() => {
    setState((prev) => ({ ...prev, seekToSec: null }));
  }, []);

  const setCurrentSection = useCallback((sectionId: string | null) => {
    setState((prev) => ({ ...prev, currentSectionId: sectionId }));
  }, []);

  const setIsPlaying = useCallback((playing: boolean) => {
    setState((prev) => ({ ...prev, isPlaying: playing }));
  }, []);

  const addToQueue = useCallback((track: import('@/types').Track) => {
    setState((prev) => ({ ...prev, queue: [...prev.queue, track] }));
  }, []);

  const playFromQueue = useCallback((index: number) => {
    setState((prev) => {
      const track = prev.queue[index];
      if (!track) return prev;

      const provider = getPreferredProvider();
      const providerTrackId = provider === 'spotify' ? track.spotify_id : track.youtube_id;

      return {
        ...prev,
        queueIndex: index,
        canonicalTrackId: track.id,
        provider,
        trackId: providerTrackId,
        spotifyOpen: provider === 'spotify',
        youtubeOpen: provider === 'youtube',
        spotifyTrackId: provider === 'spotify' ? providerTrackId : null,
        youtubeTrackId: provider === 'youtube' ? providerTrackId : null,
        autoplaySpotify: provider === 'spotify',
        autoplayYoutube: provider === 'youtube',
      };
    });
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setState((prev) => {
      const newQueue = prev.queue.filter((_, i) => i !== index);
      const newIndex = index < prev.queueIndex ? prev.queueIndex - 1 : prev.queueIndex;
      return { ...prev, queue: newQueue, queueIndex: newIndex };
    });
  }, []);

  const reorderQueue = useCallback((newQueue: import('@/types').Track[]) => {
    setState((prev) => ({ ...prev, queue: newQueue }));
  }, []);

  const clearQueue = useCallback(() => {
    setState((prev) => ({ ...prev, queue: [], queueIndex: -1 }));
  }, []);

  const shuffleQueue = useCallback(() => {
    setState((prev) => {
      const currentTrack = prev.queue[prev.queueIndex];
      const remainingTracks = prev.queue.slice(prev.queueIndex + 1);
      const shuffled = [...remainingTracks].sort(() => Math.random() - 0.5);
      const newQueue = [
        ...prev.queue.slice(0, prev.queueIndex + 1),
        ...shuffled
      ];
      return { ...prev, queue: newQueue };
    });
  }, []);

  const nextTrack = useCallback(() => {
    setState((prev) => {
      if (prev.queue.length === 0) return prev;
      
      // Loop to first track if at the end
      const nextIndex = prev.queueIndex >= prev.queue.length - 1 ? 0 : prev.queueIndex + 1;
      const track = prev.queue[nextIndex];
      if (!track) return prev;

      const provider = getPreferredProvider();
      const providerTrackId = provider === 'spotify' ? track.spotify_id : track.youtube_id;

      return {
        ...prev,
        queueIndex: nextIndex,
        canonicalTrackId: track.id,
        provider,
        trackId: providerTrackId,
        spotifyTrackId: provider === 'spotify' ? providerTrackId : null,
        youtubeTrackId: provider === 'youtube' ? providerTrackId : null,
        autoplaySpotify: provider === 'spotify',
        autoplayYoutube: provider === 'youtube',
      };
    });
  }, []);

  const previousTrack = useCallback(() => {
    setState((prev) => {
      if (prev.queue.length === 0) return prev;
      
      // Loop to last track if at the beginning
      const prevIndex = prev.queueIndex <= 0 ? prev.queue.length - 1 : prev.queueIndex - 1;
      const track = prev.queue[prevIndex];
      if (!track) return prev;

      const provider = getPreferredProvider();
      const providerTrackId = provider === 'spotify' ? track.spotify_id : track.youtube_id;

      return {
        ...prev,
        queueIndex: prevIndex,
        canonicalTrackId: track.id,
        provider,
        trackId: providerTrackId,
        spotifyTrackId: provider === 'spotify' ? providerTrackId : null,
        youtubeTrackId: provider === 'youtube' ? providerTrackId : null,
        autoplaySpotify: provider === 'spotify',
        autoplayYoutube: provider === 'youtube',
      };
    });
  }, []);

  // High-level play/pause/stop helpers
  const play = useCallback((canonicalTrackId: string | null, provider: MusicProvider, providerTrackId?: string | null, startSec?: number) => {
    const prevProvider = activeProviderRef.current;
    if (prevProvider && prevProvider !== provider) {
      stopProvider(prevProvider);
    }

    setState((prev) => {
      const updates: Partial<PlayerState> = {
        canonicalTrackId: canonicalTrackId ?? prev.canonicalTrackId,
        seekToSec: startSec ?? null,
        provider,
        trackId: providerTrackId ?? prev.trackId,
      };

      if (provider === 'spotify') {
        updates.spotifyOpen = true;
        updates.spotifyTrackId = providerTrackId ?? prev.spotifyTrackId;
        updates.autoplaySpotify = true;
        updates.youtubeOpen = false;
        updates.autoplayYoutube = false;
      } else {
        updates.youtubeOpen = true;
        updates.youtubeTrackId = providerTrackId ?? prev.youtubeTrackId;
        updates.autoplayYoutube = true;
        updates.spotifyOpen = false;
        updates.autoplaySpotify = false;
      }

      updates.isPlaying = true;

      return { ...prev, ...updates };
    });

    if (canonicalTrackId) {
      recordPlayEvent({ track_id: canonicalTrackId, provider, action: 'preview', context: 'player' }).catch((err) => console.error('Failed to record play event', err));
    }
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false, autoplaySpotify: false, autoplayYoutube: false }));
    const activeProvider = activeProviderRef.current;
    if (activeProvider) {
      providerControlsRef.current[activeProvider]?.pause?.();
    }
  }, [stopProvider]);

  const stop = useCallback(() => {
    stopProvider(activeProviderRef.current);
    setState((prev) => ({
      ...prev,
      isPlaying: false,
      provider: null,
      trackId: null,
      spotifyOpen: false,
      youtubeOpen: false,
      spotifyTrackId: null,
      youtubeTrackId: null,
      canonicalTrackId: null,
      autoplaySpotify: false,
      autoplayYoutube: false,
      seekToSec: null,
    }));
  }, [stopProvider]);

  const value = useMemo<PlayerContextValue>(() => ({
    ...state,
    play,
    pause,
    stop,
    seekTo,
    clearSeek,
    setCurrentSection,
    setIsPlaying,
    addToQueue,
    playFromQueue,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    shuffleQueue,
    nextTrack,
    previousTrack,
    openPlayer: (payload) => {
      const prevProvider = activeProviderRef.current;
      if (prevProvider && prevProvider !== payload.provider) {
        stopProvider(prevProvider);
      }

      setState((prev) => {
        const updates: Partial<PlayerState> = {
          canonicalTrackId: payload.canonicalTrackId ?? prev.canonicalTrackId,
          seekToSec: payload.startSec ?? null,
          provider: payload.provider,
          trackId: payload.providerTrackId,
        };

        if (payload.provider === 'spotify') {
          updates.spotifyOpen = true;
          updates.spotifyTrackId = payload.providerTrackId;
          updates.autoplaySpotify = payload.autoplay ?? true;
          updates.youtubeOpen = false;
          updates.autoplayYoutube = false;
        } else {
          updates.youtubeOpen = true;
          updates.youtubeTrackId = payload.providerTrackId;
          updates.autoplayYoutube = payload.autoplay ?? true;
          updates.spotifyOpen = false;
          updates.autoplaySpotify = false;
        }

        // mark playback active when opening a provider
        updates.isPlaying = true;

        return { ...prev, ...updates };
      });

      if (payload.canonicalTrackId) {
        recordPlayEvent({
          track_id: payload.canonicalTrackId,
          provider: payload.provider,
          action: 'preview',
          context: payload.context ?? 'player',
        }).catch((err) => {
          console.error('Failed to record play event', err);
        });
      }
    },
    closeSpotify: () => setState((prev) => ({ ...prev, spotifyOpen: false, autoplaySpotify: false })),
    closeYoutube: () => setState((prev) => ({ ...prev, youtubeOpen: false, autoplayYoutube: false })),
    switchProvider: (provider, providerTrackId, canonicalTrackId) => {
      const prevProvider = activeProviderRef.current;
      if (prevProvider && prevProvider !== provider) {
        stopProvider(prevProvider);
      }

      setState((prev) => {
        const updates: Partial<PlayerState> = {
          canonicalTrackId: canonicalTrackId ?? prev.canonicalTrackId,
          seekToSec: null,
          provider,
          trackId: providerTrackId,
        };

        if (provider === 'spotify') {
          updates.spotifyOpen = true;
          updates.spotifyTrackId = providerTrackId;
          updates.autoplaySpotify = true;
          updates.youtubeOpen = false;
          updates.autoplayYoutube = false;
        } else {
          updates.youtubeOpen = true;
          updates.youtubeTrackId = providerTrackId;
          updates.autoplayYoutube = true;
          updates.spotifyOpen = false;
          updates.autoplaySpotify = false;
        }

        return { ...prev, ...updates };
      });

      const trackIdToLog = canonicalTrackId ?? state.canonicalTrackId;
      if (trackIdToLog) {
        recordPlayEvent({
          track_id: trackIdToLog,
          provider,
          action: 'preview',
          context: 'provider-switch',
        }).catch((err) => {
          console.error('Failed to record provider switch event', err);
        });
      }
    },
    registerProviderControls: (provider, controls) => {
      providerControlsRef.current[provider] = controls;
    },
  }), [state, play, pause, stop, seekTo, clearSeek, setCurrentSection, setIsPlaying, addToQueue, playFromQueue, removeFromQueue, reorderQueue, clearQueue, shuffleQueue, nextTrack, previousTrack, stopProvider]);

  useEffect(() => {
    if (state.spotifyOpen && state.youtubeOpen) {
      throw new Error('Invariant violated: both providers open; only one provider may be active.');
    }
    if (state.provider && !state.isPlaying && (state.spotifyOpen || state.youtubeOpen)) {
      // Allows paused state while ensuring only one provider stays active.
      return;
    }
    if (state.provider === 'spotify' && state.youtubeOpen) {
      throw new Error('Invariant violated: YouTube open while Spotify is active.');
    }
    if (state.provider === 'youtube' && state.spotifyOpen) {
      throw new Error('Invariant violated: Spotify open while YouTube is active.');
    }
  }, [state.provider, state.spotifyOpen, state.youtubeOpen, state.isPlaying]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}

export function resolveDefaultProvider(connected: ConnectedProviders): MusicProvider {
  // First check user's preferred provider from localStorage
  const preferred = getPreferredProvider();
  if (preferred) {
    // If user prefers Spotify, check if it's connected
    if (preferred === 'spotify' && connected?.spotify?.connected) {
      return 'spotify';
    }
    // For other providers, use the preference if it's valid
    if (preferred === 'youtube' || preferred === 'apple_music') {
      return preferred;
    }
  }
  
  // Fallback: if Spotify is connected, use it
  if (connected?.spotify?.connected) return 'spotify';
  
  // Default to YouTube
  return 'youtube';
}
