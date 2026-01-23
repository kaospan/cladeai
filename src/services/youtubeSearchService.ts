/**
 * YouTube Search Service
 * 
 * Automatically search for music videos on YouTube
 */

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

interface YouTubeSearchResult {
  items: Array<{
    id: { videoId: string };
    snippet: {
      title: string;
      description: string;
      channelTitle: string;
    };
  }>;
}

export interface VideoResult {
  videoId: string;
  title: string;
  channel: string;
  type: 'official' | 'cover' | 'live' | 'lyric' | 'audio';
}

/**
 * Fetch a single YouTube video by ID and return minimal metadata as a Track-like object
 */
export async function getYouTubeVideo(videoId: string) {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn('YouTube API key not configured');
    return null;
  }

  const params = new URLSearchParams({
    part: 'snippet,contentDetails',
    id: videoId,
    key: apiKey,
  });

  try {
    const res = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return null;

    // Rough parse of title into artist - title when possible
    const titleText: string = item.snippet.title || '';
    const [maybeArtist, maybeTitle] = titleText.includes(' - ') ? titleText.split(' - ', 2) : [undefined, titleText];

    // Convert ISO 8601 duration to ms
    const durationIso: string = item.contentDetails?.duration || '';
    const durationMs = iso8601DurationToMs(durationIso);

    return {
      id: `youtube:${videoId}`,
      title: maybeTitle || titleText,
      artist: maybeArtist || item.snippet.channelTitle,
      cover_url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
      youtube_id: videoId,
      duration_ms: durationMs,
      provider: 'youtube' as const,
    };
  } catch (err) {
    console.error('getYouTubeVideo error', err);
    return null;
  }
}

function iso8601DurationToMs(iso: string): number {
  // Very small parser for PT#M#S
  try {
    const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!m) return 0;
    const hours = parseInt(m[1] || '0', 10);
    const minutes = parseInt(m[2] || '0', 10);
    const seconds = parseInt(m[3] || '0', 10);
    return ((hours * 3600) + (minutes * 60) + seconds) * 1000;
  } catch {
    return 0;
  }
}

/**
 * Search YouTube for a song
 * Returns multiple video types: official, covers, live performances, etc.
 */
export async function searchYouTubeVideos(
  artist: string,
  title: string
): Promise<VideoResult[]> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  
  if (!apiKey) {
    console.warn('YouTube API key not configured');
    return [];
  }

  try {
    const results: VideoResult[] = [];
    
    // Search 1: Official video/audio
    const officialQuery = `${artist} ${title} official`;
    const officialResults = await searchYouTube(officialQuery, apiKey, 3);
    results.push(...officialResults.map(r => ({ ...r, type: 'official' as const })));
    
    // Search 2: Live performances
    const liveQuery = `${artist} ${title} live`;
    const liveResults = await searchYouTube(liveQuery, apiKey, 2);
    results.push(...liveResults.map(r => ({ ...r, type: 'live' as const })));
    
    // Search 3: Covers
    const coverQuery = `${title} cover`;
    const coverResults = await searchYouTube(coverQuery, apiKey, 2);
    results.push(...coverResults.map(r => ({ ...r, type: 'cover' as const })));
    
    // Remove duplicates by videoId
    const unique = results.filter((v, i, arr) => 
      arr.findIndex(x => x.videoId === v.videoId) === i
    );
    
    return unique;
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return [];
  }
}

/**
 * Search YouTube API
 */
async function searchYouTube(
  query: string,
  apiKey: string,
  maxResults: number
): Promise<Omit<VideoResult, 'type'>[]> {
  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    videoCategoryId: '10', // Music category
    maxResults: maxResults.toString(),
    key: apiKey,
  });

  const response = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);
  
  if (!response.ok) {
    console.error('YouTube API error:', response.status);
    return [];
  }

  const data: YouTubeSearchResult = await response.json();
  
  return data.items.map(item => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
  }));
}
