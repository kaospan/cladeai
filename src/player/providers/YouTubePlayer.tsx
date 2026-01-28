import { useEffect, useRef } from 'react';
import { usePlayer } from '../PlayerContext';

interface YouTubePlayerProps {
  providerTrackId: string | null;
  autoplay?: boolean;
}

// YouTube IFrame API types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        config: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  mute: () => void;
  unMute: () => void;
  destroy: () => void;
  loadVideoById?: (videoId: string, startSeconds?: number) => void;
}

let apiLoaded = false;
let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (apiLoaded) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      apiLoaded = true;
      resolve();
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true;
      resolve();
    };

    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existing) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  });

  return apiLoadPromise;
}

/**
 * Seekable YouTube player using IFrame API.
 * Plays audio inline in the shared universal player container.
 */
export function YouTubePlayer({ providerTrackId, autoplay = true }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const playerDivRef = useRef<HTMLDivElement | null>(null);
  const { seekToSec, clearSeek, registerProviderControls, setIsPlaying } = usePlayer();
  const teardownRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!providerTrackId) return () => undefined;

    loadYouTubeAPI().then(() => {
      if (!mounted || !containerRef.current) return;

      if (playerRef.current && playerRef.current.loadVideoById) {
        playerRef.current.loadVideoById(providerTrackId, 0);
        return;
      }

      const playerId = `yt-player-${providerTrackId}-${Date.now()}`;
      const playerDiv = document.createElement('div');
      playerDiv.id = playerId;
      playerDivRef.current = playerDiv;

      if (containerRef.current) {
        if (playerDivRef.current?.parentNode) {
          playerDivRef.current.parentNode.removeChild(playerDivRef.current);
        }
        containerRef.current.appendChild(playerDiv);
      }

      playerRef.current = new window.YT.Player(playerId, {
        videoId: providerTrackId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (!mounted) return;
            // Autoplay policy: start muted, then unmute immediately after play.
            if (autoplay) {
              event.target.mute();
              event.target.playVideo();
              window.setTimeout(() => {
                event.target.unMute();
              }, 150);
            }
          },
          onStateChange: (event) => {
            if (!mounted) return;
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          },
        },
      });

      registerProviderControls('youtube', {
        play: (startSec) => {
          if (!playerRef.current) return;
          if (typeof startSec === 'number') {
            playerRef.current.seekTo(startSec, true);
          }
          playerRef.current.mute();
          playerRef.current.playVideo();
          window.setTimeout(() => {
            playerRef.current?.unMute();
          }, 150);
        },
        pause: () => {
          playerRef.current?.pauseVideo();
        },
        seekTo: (seconds) => {
          playerRef.current?.seekTo(seconds, true);
        },
        teardown: () => {
          if (playerRef.current) {
            try {
              playerRef.current.pauseVideo();
              playerRef.current.destroy();
            } catch (err) {
              console.warn('YouTube teardown failed', err);
            }
          }
          playerRef.current = null;
          if (playerDivRef.current?.parentNode) {
            playerDivRef.current.parentNode.removeChild(playerDivRef.current);
          }
          playerDivRef.current = null;
        },
      });
      teardownRef.current = () => {
        playerRef.current?.pauseVideo();
        try {
          playerRef.current?.destroy();
        } catch {
          // Ignore teardown errors
        }
        if (playerDivRef.current?.parentNode) {
          playerDivRef.current.parentNode.removeChild(playerDivRef.current);
        }
        playerDivRef.current = null;
        playerRef.current = null;
      };
    });

    return () => {
      mounted = false;
      teardownRef.current?.();
    };
  }, [providerTrackId, autoplay, registerProviderControls, setIsPlaying]);

  // Handle seek requests from context
  useEffect(() => {
    if (seekToSec !== null && playerRef.current) {
      playerRef.current.seekTo(seekToSec, true);
      playerRef.current.playVideo();
      clearSeek();
    }
  }, [seekToSec, clearSeek]);

  if (!providerTrackId) return null;

  return (
    <div className="w-full h-14 md:h-20 bg-gradient-to-r from-red-950/80 via-black to-red-950/80 rounded-xl overflow-hidden">
      <div ref={containerRef} className="w-full h-full relative z-[110]" />
    </div>
  );
}
