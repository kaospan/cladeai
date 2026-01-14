import { useState } from 'react';
import { motion } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { ChordBadge } from '@/components/ChordBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { seedTracks, progressionArchetypes } from '@/data/seedTracks';
import { Track } from '@/types';
import { Search, Music, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'song' | 'chord'>('song');
  const [results, setResults] = useState<Track[]>([]);

  const handleSearch = () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (searchMode === 'song') {
      // Search by song/artist
      const filtered = seedTracks.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.artist.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      // Search by chord progression
      const chords = query
        .toUpperCase()
        .split(/[-–—,\s]+/)
        .map((c) => c.trim())
        .filter(Boolean);
      
      const filtered = seedTracks.filter((t) => {
        if (!t.progression_roman) return false;
        const progression = t.progression_roman.map((c) => c.toUpperCase());
        return chords.every((chord) => 
          progression.includes(chord) || progression.includes(chord.toLowerCase())
        );
      });
      setResults(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong safe-top">
        <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
          <h1 className="text-xl font-bold">Search</h1>
          
          {/* Search mode toggle */}
          <div className="flex gap-2">
            <Button
              variant={searchMode === 'song' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchMode('song')}
              className="flex-1"
            >
              <Music className="w-4 h-4 mr-1.5" />
              Song / Artist
            </Button>
            <Button
              variant={searchMode === 'chord' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchMode('chord')}
              className="flex-1"
            >
              <TrendingUp className="w-4 h-4 mr-1.5" />
              Chord Progression
            </Button>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={
                searchMode === 'song'
                  ? 'Search songs or artists...'
                  : 'e.g., vi-IV-I-V or I-V-vi-IV'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-muted/50"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {/* Quick chord searches */}
        {searchMode === 'chord' && !query && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">
              Popular Progressions
            </h2>
            <div className="space-y-2">
              {progressionArchetypes.slice(0, 5).map((archetype, index) => (
                <motion.button
                  key={archetype.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    setQuery(archetype.progression.join('-'));
                    handleSearch();
                  }}
                  className="w-full p-4 glass rounded-xl text-left group hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{archetype.name}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {archetype.progression.map((chord, i) => (
                      <ChordBadge key={i} chord={chord} size="sm" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {archetype.description}
                  </p>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* Search results */}
        {results.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">
              Results ({results.length})
            </h2>
            <div className="space-y-2">
              {results.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 glass rounded-xl"
                >
                  <div className="flex gap-4">
                    {track.cover_url && (
                      <img
                        src={track.cover_url}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{track.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artist}
                      </p>
                      {track.progression_roman && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {track.progression_roman.map((chord, i) => (
                            <ChordBadge key={i} chord={chord} size="sm" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* No results */}
        {query && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No results found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different search term
            </p>
          </div>
        )}

        {/* Trending section when no query */}
        {!query && searchMode === 'song' && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">
              Trending Tracks
            </h2>
            <div className="space-y-2">
              {seedTracks.slice(0, 5).map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 glass rounded-xl"
                >
                  <div className="flex gap-4">
                    <div className="flex items-center justify-center w-8 text-lg font-bold text-muted-foreground">
                      {index + 1}
                    </div>
                    {track.cover_url && (
                      <img
                        src={track.cover_url}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{track.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
