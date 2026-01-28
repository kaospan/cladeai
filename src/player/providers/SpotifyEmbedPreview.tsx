import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getValidAccessToken } from '@/services/spotifyAuthService';
import { usePlayer } from '../PlayerContext';

type SpotifyPlayer = {
  addListener: (event: string, cb: (...args: any[]) => void) => void;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  pause: () => Promise<void>;
  seek: (ms: number) => Promise<void>;
};

type SpotifySDK = {
  Player: new (options: { name: string; getOAuthToken: (cb: (token: string) => void) => void }) => SpotifyPlayer;
};

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: SpotifySDK;
  }
}

interface SpotifyEmbedPreviewProps {
  providerTrackId: string | null;
  autoplay?: boolean;
}

let sdkPromise: Promise<void> | null = null;
let sdkReady = false;
let spotifyPlayerSingleton: SpotifyPlayer | null = null;
let spotifyListenersAttached = false;

const loadSdk = () => {
  if (sdkReady) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<void>((resolve, reject) => {
    if (window.Spotify) {
      sdkReady = true;
      resolve();
      return;
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      sdkReady = true;
      resolve();
    };

    const existing = document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]');
    if (existing) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    script.onerror = () => reject(new Error('Failed to load Spotify SDK'));
    document.body.appendChild(script);
  });

  return sdkPromise;
};

const getOrCreatePlayer = (getToken: () => string | null): SpotifyPlayer => {
  if (spotifyPlayerSingleton) return spotifyPlayerSingleton;

  spotifyPlayerSingleton = new window.Spotify!.Player({
    name: 'Clade Player',
    getOAuthToken: (cb) => {
      const token = getToken();
      if (token) cb(token);
    },
  });

  return spotifyPlayerSingleton;
};

export function SpotifyEmbedPreview({ providerTrackId, autoplay }: SpotifyEmbedPreviewProps) {
  const { user } = useAuth();
  const { provider, autoplaySpotify, seekToSec, clearSeek, registerProviderControls, setIsPlaying } = usePlayer();
  const tokenRef = useRef<string | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (provider !== 'spotify' || !providerTrackId || !user?.id) return;

    let cancelled = false;

    const setup = async () => {
      try {
        await loadSdk();
        if (cancelled || !window.Spotify) return;

        const token = await getValidAccessToken(user.id);
        tokenRef.current = token;
        if (!token) {
          console.warn('Spotify token unavailable; playback disabled');
          return;
        }

        const player = getOrCreatePlayer(() => tokenRef.current);
        playerRef.current = player;

        if (!spotifyListenersAttached) {
          player.addListener('ready', async ({ device_id }) => {
            deviceIdRef.current = device_id;
            setReady(true);
            const shouldAutoplay = autoplay ?? autoplaySpotify ?? true;
            const transferred = await transferPlayback(device_id, token, shouldAutoplay);
            if (transferred && providerTrackId) {
              await startPlayback(device_id, token, providerTrackId, seekToSec ?? 0);
              setIsPlaying(true);
            }
          });

          player.addListener('player_state_changed', (state) => {
            if (!state) return;
            setIsPlaying(!state.paused);
          });

          player.addListener('not_ready', () => {
            setReady(false);
          });

          spotifyListenersAttached = true;
        }

        await player.connect();

        registerProviderControls('spotify', {
          play: async (startSec) => {
            const tokenVal = tokenRef.current;
            const device = deviceIdRef.current;
            if (!tokenVal || !device) return;
            const transferred = await transferPlayback(device, tokenVal, true);
            if (transferred && providerTrackId) {
              await startPlayback(device, tokenVal, providerTrackId, startSec ?? 0);
            }
            setIsPlaying(true);
          },
          pause: async () => {
            await player.pause();
            setIsPlaying(false);
          },
          seekTo: async (seconds: number) => {
            await player.seek(seconds * 1000);
          },
          teardown: async () => {
            try {
              await player.disconnect();
            } catch (err) {
              console.warn('Spotify teardown disconnect failed', err);
            }
            playerRef.current = null;
            deviceIdRef.current = null;
            setReady(false);
            setIsPlaying(false);
          },
        });
      } catch (err) {
        console.error('Spotify SDK setup failed', err);
      }
    };

    setup();

    return () => {
      cancelled = true;
      playerRef.current = null;
      setReady(false);
    };
  }, [provider, providerTrackId, user?.id, autoplay, autoplaySpotify, registerProviderControls, setIsPlaying, seekToSec]);

  useEffect(() => {
    if (provider !== 'spotify') return;
    if (seekToSec == null) return;
    if (playerRef.current) {
      playerRef.current.seek(seekToSec * 1000).catch(() => {});
    }
    clearSeek();
  }, [seekToSec, provider, clearSeek]);

  useEffect(() => {
    if (provider !== 'spotify') return;
    if (!providerTrackId || !ready) return;
    const token = tokenRef.current;
    const device = deviceIdRef.current;
    if (!token || !device) return;
    const shouldPlay = autoplay ?? autoplaySpotify ?? false;
    if (!shouldPlay) return;
    void transferPlayback(device, token, true).then((transferred) => {
      if (transferred) {
        void startPlayback(device, token, providerTrackId, seekToSec ?? 0);
      }
    });
  }, [provider, providerTrackId, ready, autoplay, autoplaySpotify, seekToSec]);

  if (provider !== 'spotify' || !providerTrackId) return null;

  return ready ? null : (
    <div className="w-full h-14 md:h-20 bg-black rounded-xl overflow-hidden" />
  );
}

async function transferPlayback(deviceId: string, token: string, play: boolean) {
  try {
    const res = await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ device_ids: [deviceId], play }),
    });
    if (!res.ok) {
      console.warn(`[Spotify] Transfer failed: ${res.status} ${res.statusText}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Spotify] Failed to transfer playback', err);
    return false;
  }
}

async function startPlayback(deviceId: string, token: string, trackId: string, startSec: number) {
  try {
    const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [`spotify:track:${trackId}`],
        position_ms: Math.max(0, Math.floor(startSec * 1000)),
      }),
    });
    if (!res.ok) {
      console.warn(`[Spotify] Start playback failed: ${res.status} ${res.statusText}`);
    }
  } catch (err) {
    console.error('[Spotify] Failed to start playback', err);
  }
}
