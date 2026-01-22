import { Track } from '../src/types';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse CSV and convert to Track objects
function parseCSV(csvContent: string): Track[] {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  const tracks: Track[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    // Parse CSV line (handling quoted fields)
    const fields = parseCSVLine(lines[i]);
    
    if (fields.length < 10) continue;

    const trackUri = fields[2]?.trim();
    const trackName = fields[3]?.trim();
    const artistNames = fields[5]?.trim();
    const year = parseInt(fields[31]) || parseInt(fields[26]);
    const decade = fields[32] || fields[27];
    const genres = fields[12]?.split(',').map(g => g.trim()).filter(Boolean) || [];
    const notes = fields[30]?.trim() || '';
    
    // Skip if no track name or artist
    if (!trackName || !artistNames) continue;

    // Extract Spotify ID from URI
    let spotifyId = '';
    if (trackUri && trackUri.startsWith('spotify:track:')) {
      spotifyId = trackUri.replace('spotify:track:', '');
    }

    // Determine if this is a culturally significant "common ancestor" track
    const isCommonAncestor = 
      notes.toLowerCase().includes('first') ||
      notes.toLowerCase().includes('landmark') ||
      notes.toLowerCase().includes('groundbreaking') ||
      notes.toLowerCase().includes('foundational') ||
      notes.toLowerCase().includes('catalyzed') ||
      notes.toLowerCase().includes('launched') ||
      notes.toLowerCase().includes('sampled') ||
      notes.toLowerCase().includes('break') ||
      notes.toLowerCase().includes('heavily sampled') ||
      notes.toLowerCase().includes('drum break') ||
      notes.toLowerCase().includes('bassline') ||
      trackName.toLowerCase().includes('amen') ||
      trackName.toLowerCase().includes('apache') ||
      trackName.toLowerCase().includes('funky drummer') ||
      trackName.toLowerCase().includes('good times') ||
      trackName.toLowerCase().includes('synthetic substitution') ||
      trackName.toLowerCase().includes('impeach the president') ||
      trackName.toLowerCase().includes('assembly line') ||
      genres.some(g => g.includes('breakbeat'));

    const track: Track = {
      id: `historical-${i}`,
      external_id: trackUri || `historical:${trackName}:${artistNames}`,
      provider: spotifyId ? 'spotify' : undefined,
      title: trackName,
      artist: artistNames,
      album: fields[4]?.trim() || undefined,
      cover_url: `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop`,
      detected_key: fields[16] ? getMusicalKey(parseFloat(fields[16])) : undefined,
      detected_mode: fields[18] === '1.0' ? 'major' : fields[18] === '0.0' ? 'minor' : undefined,
      progression_roman: [],
      loop_length_bars: 4,
      cadence_type: 'loop',
      confidence_score: 0.75,
      analysis_source: 'metadata',
      energy: parseFloat(fields[15]) || undefined,
      danceability: parseFloat(fields[14]) || undefined,
      valence: parseFloat(fields[23]) || undefined,
      tempo: parseFloat(fields[24]) || undefined,
      genre: genres[0] || 'historical',
      genres: genres.length > 0 ? genres : ['historical'],
      genre_description: notes || `Historical recording from ${year}`,
      songwriter: undefined,
      producer: undefined,
      label: fields[13]?.trim() || undefined,
      release_date: fields[6]?.trim() || `${year}-01-01`,
      spotify_id: spotifyId || undefined,
      youtube_id: undefined,
      url_spotify_web: spotifyId ? `https://open.spotify.com/track/${spotifyId}` : undefined,
      url_spotify_app: spotifyId ? `spotify:track:${spotifyId}` : undefined,
      url_youtube: undefined,
      is_common_ancestor: isCommonAncestor,
      historical_year: year,
      historical_decade: decade,
      historical_notes: notes,
    };

    tracks.push(track);
  }

  return tracks;
}

// Parse a single CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }

  fields.push(currentField);
  return fields;
}

// Convert Spotify pitch class (0-11) to musical key
function getMusicalKey(pitchClass: number): string {
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return keys[Math.round(pitchClass) % 12];
}

// Read CSV and generate TypeScript code
function main() {
  const csvPath = join(__dirname, '../src/data/updated_chronology_FULL_enriched.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');
  
  const tracks = parseCSV(csvContent);
  
  console.log(`✅ Parsed ${tracks.length} historical tracks from CSV`);
  console.log(`📊 Common ancestors: ${tracks.filter(t => t.is_common_ancestor).length}`);
  console.log(`📅 Date range: ${Math.min(...tracks.map(t => t.historical_year || 9999))} - ${Math.max(...tracks.map(t => t.historical_year || 0))}`);
  
  // Generate TypeScript code
  const tsCode = generateTypeScriptCode(tracks);
  
  const outputPath = join(__dirname, '../src/data/historicalTracks.ts');
  writeFileSync(outputPath, tsCode, 'utf-8');
  
  console.log(`💾 Written to ${outputPath}`);
}

function generateTypeScriptCode(tracks: Track[]): string {
  return `// Historical foundational tracks (1920s-2020s)
// Auto-generated from updated_chronology_FULL_enriched.csv

import { Track } from '@/types';

export const historicalTracks: Track[] = ${JSON.stringify(tracks, null, 2)};
`;
}

main();
