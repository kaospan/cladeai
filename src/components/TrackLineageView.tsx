import { motion } from 'framer-motion';
import { GitBranch, ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  trackLineage, 
  getDescendants, 
  getAncestors, 
  lineageTypeLabels,
  type TrackConnection 
} from '@/data/trackLineage';
import { seedTracks } from '@/data/seedTracks';
import { AncestorBadge } from '@/components/icons/CladeIcon';

interface TrackLineageViewProps {
  trackId: string;
  className?: string;
}

/**
 * Displays musical DNA connections for a track
 * Shows what tracks influenced this one and what it influenced
 */
export function TrackLineageView({ trackId, className }: TrackLineageViewProps) {
  const ancestors = getAncestors(trackId);
  const descendants = getDescendants(trackId);

  if (ancestors.length === 0 && descendants.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Musical DNA</h3>
      </div>

      <div className="space-y-6">
        {/* Ancestors - what influenced this track */}
        {ancestors.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-muted-foreground">Evolved from</span>
            </div>
            <div className="space-y-2">
              {ancestors.map((connection) => (
                <ConnectionCard
                  key={`ancestor-${connection.ancestor_id}`}
                  connection={connection}
                  direction="ancestor"
                />
              ))}
            </div>
          </div>
        )}

        {/* Descendants - what this track influenced */}
        {descendants.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-muted-foreground">Influenced</span>
            </div>
            <div className="space-y-2">
              {descendants.map((connection) => (
                <ConnectionCard
                  key={`descendant-${connection.descendant_id}`}
                  connection={connection}
                  direction="descendant"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ConnectionCardProps {
  connection: TrackConnection;
  direction: 'ancestor' | 'descendant';
}

function ConnectionCard({ connection, direction }: ConnectionCardProps) {
  const relatedTrackId = direction === 'ancestor' 
    ? connection.ancestor_id 
    : connection.descendant_id;
  
  const relatedTrack = seedTracks.find(t => t.id === relatedTrackId);
  
  if (!relatedTrack) return null;

  const confidenceColor = 
    connection.confidence >= 0.9 ? 'text-green-600' :
    connection.confidence >= 0.8 ? 'text-yellow-600' :
    'text-orange-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-4 hover:bg-accent/50 transition-colors">
        <div className="flex items-start gap-3">
          {/* Direction indicator */}
          <div className="flex-shrink-0 mt-1">
            <ArrowRight 
              className={`w-4 h-4 text-muted-foreground ${
                direction === 'ancestor' ? 'rotate-180' : ''
              }`} 
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Track info */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-sm truncate">
                  {relatedTrack.title}
                </span>
                {relatedTrack.is_common_ancestor && (
                  <AncestorBadge className="flex-shrink-0" />
                )}
              </div>
              {relatedTrack.historical_year && (
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {relatedTrack.historical_year}
                </span>
              )}
            </div>

            <div className="text-xs text-muted-foreground mb-2">
              {relatedTrack.artist}
            </div>

            {/* Connection description */}
            <p className="text-sm text-foreground/80 mb-2">
              {connection.description}
            </p>

            {/* Lineage type badge and musical element */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {lineageTypeLabels[connection.lineage_type]}
              </Badge>
              
              {connection.musical_element && (
                <div className="flex items-center gap-1 text-xs text-primary">
                  <Sparkles className="w-3 h-3" />
                  <span>{connection.musical_element}</span>
                </div>
              )}

              {/* Confidence indicator */}
              <span className={`text-xs font-medium ${confidenceColor}`}>
                {Math.round(connection.confidence * 100)}% match
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/**
 * Compact lineage indicator for track cards
 * Shows count of connections
 */
export function LineageIndicator({ trackId }: { trackId: string }) {
  const ancestors = getAncestors(trackId);
  const descendants = getDescendants(trackId);
  const totalConnections = ancestors.length + descendants.length;

  if (totalConnections === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-1 text-xs text-muted-foreground"
    >
      <GitBranch className="w-3 h-3" />
      <span>{totalConnections} connection{totalConnections !== 1 ? 's' : ''}</span>
    </motion.div>
  );
}

/**
 * Lineage path visualization (for compare view)
 * Shows the evolution chain between two tracks
 */
export function LineagePath({ startId, endId }: { startId: string; endId: string }) {
  // Simple breadth-first search to find path
  const findPath = (start: string, end: string): TrackConnection[] => {
    const queue: { id: string; path: TrackConnection[] }[] = [{ id: start, path: [] }];
    const visited = new Set<string>([start]);

    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      
      if (id === end) return path;

      const connections = getDescendants(id);
      for (const conn of connections) {
        if (!visited.has(conn.descendant_id)) {
          visited.add(conn.descendant_id);
          queue.push({
            id: conn.descendant_id,
            path: [...path, conn],
          });
        }
      }
    }

    return [];
  };

  const path = findPath(startId, endId);

  if (path.length === 0) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold">Evolution Chain</h3>
      </div>

      <div className="space-y-3">
        {path.map((connection, index) => {
          const track = seedTracks.find(t => t.id === connection.ancestor_id);
          if (!track) return null;

          return (
            <div key={`path-${index}`} className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground w-12 flex-shrink-0">
                {track.historical_year || '—'}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{track.title}</div>
                <div className="text-xs text-muted-foreground">{track.artist}</div>
                <div className="text-xs text-primary mt-1">
                  → {connection.musical_element}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
