import { useEffect, useRef } from 'react';
import { usePlayer } from '../PlayerContext';

interface YouTubePlayerProps {
  providerTrackId: string | null;
  autoplay?: boolean;
}

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytPromise: Promise<void> | null = null;

const loadYouTubeApi = () => {
  if (window.YT?.Player) return Promise.resolve();
  if (ytPromise) return ytPromise;
  ytPromise = new Promise<void>((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }
    window.onYouTubeIframeAPIReady = () => resolve();
    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existing) return;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
  });
  return ytPromise;
};

/**
 * YouTube player using IFrame API with deterministic seeks and state sync.
 */
export function YouTubePlayer({ providerTrackId, autoplay = true }: YouTubePlayerProps) {
  const { provider, isMuted, registerProviderControls, updatePlaybackState, clearSeek, seekToSec } = usePlayer();

  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const readyRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const stopRaf = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  const startRaf = () => {
    if (rafIdRef.current !== null) return;
    const tick = () => {
      if (playerRef.current) {
        const pos = playerRef.current.getCurrentTime?.();
        const dur = playerRef.current.getDuration?.();
        if (Number.isFinite(pos)) {
          updatePlaybackState({
            positionMs: pos * 1000,
            durationMs: Number.isFinite(dur) ? dur * 1000 : 0,
            isMuted: playerRef.current.isMuted?.() ?? isMuted,
          });
        }
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };
    rafIdRef.current = requestAnimationFrame(tick);
  };

  const attemptSeek = (sec: number, forcePlay = false) => {
    pendingSeekRef.current = sec;
    if (readyRef.current && playerRef.current?.seekTo) {
      playerRef.current.seekTo(sec, true);
      if (forcePlay) playerRef.current.playVideo?.();
      updatePlaybackState({ positionMs: sec * 1000 });
      pendingSeekRef.current = null;
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (provider !== 'youtube' || !providerTrackId) return;
    let destroyed = false;
    readyRef.current = false;

    const setup = async () => {
      await loadYouTubeApi();
      if (destroyed || !window.YT || !hostRef.current) return;

      const startPlayback = (player: any) => {
        if (autoplay) {
          player.playVideo?.();
        }
        if (isMuted) player.mute?.();
        else player.unMute?.();
      };

      const onPlayerReady = (event: any) => {
        readyRef.current = true;
        startPlayback(event.target);
        const dur = event.target.getDuration?.() * 1000;
        if (Number.isFinite(dur)) updatePlaybackState({ durationMs: dur });
        if (pendingSeekRef.current !== null) {
          attemptSeek(pendingSeekRef.current, true);
        }
        startRaf();
      };

      const onStateChange = (event: any) => {
        const ytState = window.YT?.PlayerState;
        const isPlaying = event.data === ytState?.PLAYING;
        if (isPlaying && !isMuted) event.target.unMute?.();
        if (isPlaying) startRaf();
        else stopRaf();
      };

      if (playerRef.current?.loadVideoById) {
        playerRef.current.loadVideoById(providerTrackId, 0);
        readyRef.current = true;
        if (pendingSeekRef.current !== null) attemptSeek(pendingSeekRef.current, true);
        startRaf();
      } else {
        playerRef.current = new window.YT.Player(hostRef.current, {
          videoId: providerTrackId,
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            mute: isMuted ? 1 : 0,
            controls: 0,
            rel: 0,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: onPlayerReady,
            onStateChange,
          },
        });
      }

      registerProviderControls('youtube', {
        play: async (startSec) => {
          if (!playerRef.current) return;
          if (typeof startSec === 'number') {
            if (!attemptSeek(startSec, true)) pendingSeekRef.current = startSec;
          } else {
            playerRef.current.playVideo?.();
          }
        },
        pause: async () => playerRef.current?.pauseVideo?.(),
        seekTo: async (seconds: number) => {
          if (!attemptSeek(seconds, true)) {
            pendingSeekRef.current = seconds;
            setTimeout(() => attemptSeek(seconds, true), 200);
          }
        },
        setVolume: async (vol: number) => playerRef.current?.setVolume?.(Math.round(vol * 100)),
        setMute: async (muted: boolean) => (muted ? playerRef.current?.mute?.() : playerRef.current?.unMute?.()),
        teardown: async () => {
          stopRaf();
          readyRef.current = false;
          pendingSeekRef.current = null;
          try {
            playerRef.current?.stopVideo?.();
            playerRef.current?.destroy?.();
          } catch {}
          playerRef.current = null;
          hostRef.current?.replaceChildren();
        },
      });
    };

    setup();

    return () => {
      destroyed = true;
      stopRaf();
    };
  }, [provider, providerTrackId, autoplay, isMuted, registerProviderControls, updatePlaybackState]);

  useEffect(() => {
    if (provider !== 'youtube') return;
    if (seekToSec == null) return;
    if (attemptSeek(seekToSec, true)) {
      clearSeek();
      return;
    }
    setTimeout(() => {
      if (attemptSeek(seekToSec, true)) clearSeek();
    }, 200);
  }, [provider, seekToSec, clearSeek]);

  if (provider !== 'youtube' || !providerTrackId) return null;

  return <div ref={hostRef} className="w-full max-w-full bg-black overflow-hidden aspect-video rounded-none sm:rounded-xl" />;
}
