// Track Lineage - Musical DNA connections
// Maps how tracks influence, spawn, and evolve from each other
// Focus: harmonic patterns, structural DNA, rhythmic templates

export type LineageType = 
  | 'harmonic_dna'        // Shares core chord progression
  | 'rhythmic_template'   // Drum pattern/groove spawned from
  | 'bassline_evolution'  // Bassline pattern descended from
  | 'structural_blueprint' // Song form/structure inherited
  | 'modal_loop'          // Modal vamp pattern connection
  | 'break_source'        // Drum break sampled/interpolated
  | 'progression_spawn'   // Specific progression originated here
  | 'genre_foundation'    // Established genre conventions
  | 'production_lineage'  // Production technique originated
  | 'call_response';      // Call-and-response pattern inherited

export interface TrackConnection {
  ancestor_id: string;        // Track ID of origin/source
  descendant_id: string;      // Track ID of influenced/derivative
  lineage_type: LineageType;
  confidence: number;         // 0.0-1.0
  description: string;        // Human-readable connection
  musical_element?: string;   // Specific element (e.g., "vi-IV-I-V loop", "Amen break", "I-bVII vamp")
}

// Foundational lineage connections
export const trackLineage: TrackConnection[] = [
  // ============================================
  // BLUES → Everything lineage
  // ============================================
  {
    ancestor_id: 'historical-1', // Crazy Blues (1920)
    descendant_id: 'additional-2', // Robert Johnson - Cross Road Blues
    lineage_type: 'structural_blueprint',
    confidence: 0.95,
    description: 'Established recorded blues vocal form that Robert Johnson built upon',
    musical_element: '12-bar blues structure',
  },
  {
    ancestor_id: 'additional-2', // Robert Johnson - Cross Road Blues
    descendant_id: 'additional-3', // Chuck Berry - Johnny B. Goode
    lineage_type: 'harmonic_dna',
    confidence: 0.98,
    description: 'Classic I-IV-V blues progression evolved into rock & roll template',
    musical_element: 'I-IV-V 12-bar form',
  },
  {
    ancestor_id: 'additional-3', // Chuck Berry - Johnny B. Goode
    descendant_id: 'additional-17', // The White Stripes - Seven Nation Army
    lineage_type: 'structural_blueprint',
    confidence: 0.85,
    description: 'Blues-rock guitar riff formula passed down through generations',
    musical_element: 'Pentatonic riff-based rock',
  },

  // ============================================
  // FUNK BREAKS → Hip-Hop DNA
  // ============================================
  {
    ancestor_id: 'historical-33', // Amen Brother (1969)
    descendant_id: 'historical-49', // Apache - Incredible Bongo Band
    lineage_type: 'break_source',
    confidence: 0.92,
    description: 'Pioneering breakbeat became blueprint for hip-hop and jungle breaks',
    musical_element: 'Amen break (6-second drum solo)',
  },
  {
    ancestor_id: 'historical-40', // Funky Drummer - James Brown
    descendant_id: 'additional-7', // Grandmaster Flash - The Message
    lineage_type: 'rhythmic_template',
    confidence: 0.96,
    description: 'Clyde Stubblefield drum break became foundational hip-hop rhythm',
    musical_element: 'Funky Drummer break',
  },
  {
    ancestor_id: 'historical-40', // Funky Drummer
    descendant_id: 'additional-9', // Public Enemy - Fight the Power
    lineage_type: 'rhythmic_template',
    confidence: 0.94,
    description: 'Funky Drummer break layered into dense political hip-hop production',
    musical_element: 'Funky Drummer break (sampled)',
  },
  {
    ancestor_id: 'historical-50', // Impeach the President
    descendant_id: 'additional-11', // Dr. Dre - Nuthin but a G Thang
    lineage_type: 'break_source',
    confidence: 0.88,
    description: 'Crisp snare break became G-funk rhythm foundation',
    musical_element: 'Impeach break',
  },

  // ============================================
  // DISCO/FUNK → Hip-Hop Bassline Evolution
  // ============================================
  {
    ancestor_id: 'historical-64', // Good Times - CHIC
    descendant_id: 'additional-7', // Grandmaster Flash - The Message
    lineage_type: 'bassline_evolution',
    confidence: 0.99,
    description: 'Iconic disco bassline interpolated into hip-hop, spawning Rapper\'s Delight lineage',
    musical_element: 'Good Times bassline (E-A-D pattern)',
  },
  {
    ancestor_id: 'historical-54', // Leon Haywood - I Want'a Do Something Freaky To You
    descendant_id: 'additional-11', // Dr. Dre - Nuthin but a G Thang
    lineage_type: 'harmonic_dna',
    confidence: 0.97,
    description: 'Slow funk groove interpolated as G-funk foundational track',
    musical_element: 'Freaky To You progression',
  },

  // ============================================
  // JAZZ → Everything Evolution
  // ============================================
  {
    ancestor_id: 'historical-5', // West End Blues - Louis Armstrong
    descendant_id: 'historical-4', // Sing Sing Sing - Benny Goodman
    lineage_type: 'structural_blueprint',
    confidence: 0.88,
    description: 'Armstrong\'s improvisational phrasing became swing band template',
    musical_element: 'Solo-driven jazz structure',
  },
  {
    ancestor_id: 'historical-4', // Sing Sing Sing
    descendant_id: 'historical-20', // Saudade Vem Correndo - Stan Getz
    lineage_type: 'genre_foundation',
    confidence: 0.82,
    description: 'Big band swing influenced bossa nova jazz fusion',
    musical_element: 'Jazz orchestration',
  },

  // ============================================
  // KRAFTWERK → Electronic Music Foundation
  // ============================================
  {
    ancestor_id: 'additional-6', // Kraftwerk - Autobahn
    descendant_id: 'additional-14', // Daft Punk - Da Funk
    lineage_type: 'production_lineage',
    confidence: 0.94,
    description: 'Pioneering synth production became French house blueprint',
    musical_element: 'Analog synth bass + drum machine',
  },
  {
    ancestor_id: 'additional-6', // Kraftwerk - Autobahn
    descendant_id: 'additional-12', // The Prodigy - Out of Space
    lineage_type: 'production_lineage',
    confidence: 0.87,
    description: 'Electronic sequencing influenced big beat production',
    musical_element: 'Sequenced electronic patterns',
  },

  // ============================================
  // VELVET UNDERGROUND → Alternative Rock DNA
  // ============================================
  {
    ancestor_id: 'additional-4', // The Velvet Underground - Heroin
    descendant_id: 'additional-5', // The Stooges - I Wanna Be Your Dog
    lineage_type: 'modal_loop',
    confidence: 0.93,
    description: 'Minimalist two-chord drone became proto-punk foundation',
    musical_element: 'i-iv modal loop',
  },
  {
    ancestor_id: 'additional-5', // The Stooges - I Wanna Be Your Dog
    descendant_id: 'additional-10', // Nirvana - Smells Like Teen Spirit
    lineage_type: 'structural_blueprint',
    confidence: 0.91,
    description: 'Raw garage aesthetic evolved into grunge template',
    musical_element: 'Quiet verse → loud chorus dynamics',
  },
  {
    ancestor_id: 'additional-4', // The Velvet Underground - Heroin
    descendant_id: 'additional-15', // Radiohead - Paranoid Android
    lineage_type: 'structural_blueprint',
    confidence: 0.86,
    description: 'Art rock experimentation passed through to progressive alternative',
    musical_element: 'Multi-movement song structure',
  },

  // ============================================
  // POP PROGRESSION LINEAGE (vi-IV-I-V)
  // ============================================
  {
    ancestor_id: 'seed-1', // Blinding Lights
    descendant_id: 'additional-18', // OutKast - Hey Ya!
    lineage_type: 'progression_spawn',
    confidence: 0.82,
    description: 'Both use variants of the "pop anthem" progression with different feels',
    musical_element: 'vi-IV-I-V / I-V-vi-IV variants',
  },

  // ============================================
  // GARAGE ROCK REVIVAL LINEAGE
  // ============================================
  {
    ancestor_id: 'additional-5', // The Stooges - I Wanna Be Your Dog
    descendant_id: 'additional-16', // The Strokes - Last Nite
    lineage_type: 'genre_foundation',
    confidence: 0.89,
    description: 'Proto-punk minimalism revived in 2000s garage rock',
    musical_element: 'Stripped-down garage aesthetic',
  },
  {
    ancestor_id: 'additional-16', // The Strokes - Last Nite
    descendant_id: 'additional-17', // The White Stripes - Seven Nation Army
    lineage_type: 'structural_blueprint',
    confidence: 0.84,
    description: 'Garage rock revival aesthetics at peak form',
    musical_element: 'Minimalist two-piece rock',
  },

  // ============================================
  // HIP-HOP CONSCIOUS RAP LINEAGE
  // ============================================
  {
    ancestor_id: 'additional-7', // Grandmaster Flash - The Message
    descendant_id: 'additional-9', // Public Enemy - Fight the Power
    lineage_type: 'genre_foundation',
    confidence: 0.96,
    description: 'First socially conscious rap evolved into militant political hip-hop',
    musical_element: 'Social commentary lyrics + funk breaks',
  },

  // ============================================
  // ROCK/RAP FUSION LINEAGE
  // ============================================
  {
    ancestor_id: 'additional-8', // Run-DMC - Rock Box
    descendant_id: 'additional-9', // Public Enemy - Fight the Power
    lineage_type: 'production_lineage',
    confidence: 0.87,
    description: 'Rock guitar + hip-hop fusion production techniques',
    musical_element: 'Live guitar integration',
  },

  // ============================================
  // TRIP-HOP FOUNDATION
  // ============================================
  {
    ancestor_id: 'additional-13', // Portishead - Sour Times
    descendant_id: 'additional-19', // LCD Soundsystem - Losing My Edge
    lineage_type: 'production_lineage',
    confidence: 0.79,
    description: 'Dark electronic production influenced dance-punk textures',
    musical_element: 'Downtempo electronic + live bass',
  },

  // ============================================
  // G-FUNK SPECIFIC LINEAGE
  // ============================================
  {
    ancestor_id: 'seed-2', // Someone Like You (Adele)
    descendant_id: 'seed-1', // Blinding Lights
    lineage_type: 'harmonic_dna',
    confidence: 0.88,
    description: 'Both use I-V-vi-IV (Axis of Awesome progression) in different contexts',
    musical_element: 'I-V-vi-IV progression',
  },

  // ============================================
  // COUNTRY → ROCK EVOLUTION
  // ============================================
  {
    ancestor_id: 'additional-1', // The Carter Family - Can the Circle Be Unbroken
    descendant_id: 'additional-2', // Robert Johnson - Cross Road Blues
    lineage_type: 'structural_blueprint',
    confidence: 0.84,
    description: 'Country folk structure influenced rural blues form',
    musical_element: 'Verse-chorus folk structure',
  },

  // ============================================
  // INDIE ROCK INTERNET ERA
  // ============================================
  {
    ancestor_id: 'additional-16', // The Strokes - Last Nite
    descendant_id: 'additional-20', // Arctic Monkeys
    lineage_type: 'genre_foundation',
    confidence: 0.91,
    description: 'Garage rock revival passed to internet-era indie rock',
    musical_element: 'High-energy indie garage rock',
  },

  // ============================================
  // DANCE-PUNK CONNECTIONS
  // ============================================
  {
    ancestor_id: 'additional-6', // Kraftwerk - Autobahn
    descendant_id: 'additional-19', // LCD Soundsystem - Losing My Edge
    lineage_type: 'production_lineage',
    confidence: 0.88,
    description: 'Krautrock electronic sequencing evolved into dance-punk',
    musical_element: 'Motorik beat + synth bass',
  },
];

// Helper functions for querying lineage
export function getDescendants(trackId: string): TrackConnection[] {
  return trackLineage.filter(conn => conn.ancestor_id === trackId);
}

export function getAncestors(trackId: string): TrackConnection[] {
  return trackLineage.filter(conn => conn.descendant_id === trackId);
}

export function getLineageChain(trackId: string): TrackConnection[] {
  const ancestors = getAncestors(trackId);
  const descendants = getDescendants(trackId);
  return [...ancestors, ...descendants];
}

export function getLineageByType(trackId: string, type: LineageType): TrackConnection[] {
  return getLineageChain(trackId).filter(conn => conn.lineage_type === type);
}

// Get all tracks in a specific lineage path
export function getLineagePath(startId: string, endId: string): TrackConnection[] {
  const visited = new Set<string>();
  const path: TrackConnection[] = [];
  
  function dfs(currentId: string): boolean {
    if (currentId === endId) return true;
    if (visited.has(currentId)) return false;
    
    visited.add(currentId);
    const descendants = getDescendants(currentId);
    
    for (const conn of descendants) {
      path.push(conn);
      if (dfs(conn.descendant_id)) return true;
      path.pop();
    }
    
    return false;
  }
  
  dfs(startId);
  return path;
}

// Lineage type human-readable labels
export const lineageTypeLabels: Record<LineageType, string> = {
  harmonic_dna: 'Shares chord progression',
  rhythmic_template: 'Drum pattern evolved from',
  bassline_evolution: 'Bassline descended from',
  structural_blueprint: 'Song structure inherited from',
  modal_loop: 'Modal pattern connection',
  break_source: 'Drum break sampled from',
  progression_spawn: 'Progression originated in',
  genre_foundation: 'Genre established by',
  production_lineage: 'Production technique from',
  call_response: 'Call-response pattern from',
};
