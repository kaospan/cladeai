interface SpotifyEmbedPreviewProps {
  providerTrackId: string | null;
  autoplay?: boolean;
}

export function SpotifyEmbedPreview({ providerTrackId, autoplay }: SpotifyEmbedPreviewProps) {
  if (!providerTrackId) return null;
  const params = new URLSearchParams({
    utm_source: 'harmony-hub',
    theme: '0', // Dark theme
  });
  // When a user explicitly requested autoplay, try to request it on the embed.
  // Spotify may ignore autoplay depending on browser or account, but adding the
  // query param makes the intent explicit and improves consistency across pages.
  if (autoplay) params.set('autoplay', '1');

  // Use compact embed (height 80) for audio-only experience
  const src = `https://open.spotify.com/embed/track/${providerTrackId}?${params.toString()}`;
  return (
    <div className="w-full h-14 md:h-20 bg-gradient-to-r from-green-950/80 via-black to-green-950/80 rounded-xl overflow-hidden">
      <iframe
        className="w-full h-full border-0 relative z-[110]"
        src={src}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen"
        loading="lazy"
        title="Spotify player"
        style={{ borderRadius: '12px' }}
      />
    </div>
  );
}
