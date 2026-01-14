import { motion } from 'framer-motion';
import { Heart, Bookmark, X, Sparkles, Waves, Share2, Play, Pause } from 'lucide-react';
import { HarmonyCard } from './HarmonyCard';
import { Button } from '@/components/ui/button';
import { Track, InteractionType } from '@/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TrackCardProps {
  track: Track;
  isActive: boolean;
  onInteraction: (type: InteractionType) => void;
  interactions?: Set<InteractionType>;
}

export function TrackCard({ track, isActive, onInteraction, interactions = new Set() }: TrackCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0.5 }}
      className="relative w-full h-full flex flex-col"
    >
      {/* Background with cover art */}
      <div className="absolute inset-0 z-0">
        {track.cover_url ? (
          <>
            <img
              src={track.cover_url}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary to-background" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-end p-6 pb-8 space-y-4">
        {/* Track info */}
        <div className="space-y-2">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-bold text-foreground line-clamp-2"
          >
            {track.title}
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="text-lg text-muted-foreground"
          >
            {track.artist}
          </motion.p>
        </div>

        {/* Play button */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            variant="outline"
            size="lg"
            onClick={handlePlayPause}
            className="gap-2 glass border-white/20 hover:bg-white/10"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            {isPlaying ? 'Pause' : 'Play Hook'}
          </Button>
        </motion.div>

        {/* Harmony card */}
        {track.progression_roman && track.progression_roman.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <HarmonyCard
              progression={track.progression_roman}
              detectedKey={track.detected_key}
              detectedMode={track.detected_mode}
              cadenceType={track.cadence_type}
              confidenceScore={track.confidence_score}
              matchReason="Same vi–IV–I–V loop with similar energy"
            />
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between pt-4"
        >
          {/* Skip */}
          <ActionButton
            icon={X}
            label="Skip"
            isActive={interactions.has('skip')}
            onClick={() => onInteraction('skip')}
            variant="muted"
          />

          {/* More like this (harmonic) */}
          <ActionButton
            icon={Sparkles}
            label="Harmonic"
            isActive={interactions.has('more_harmonic')}
            onClick={() => onInteraction('more_harmonic')}
            variant="primary"
          />

          {/* Like */}
          <ActionButton
            icon={Heart}
            label="Like"
            isActive={interactions.has('like')}
            onClick={() => onInteraction('like')}
            variant="accent"
          />

          {/* More like this (vibe) */}
          <ActionButton
            icon={Waves}
            label="Vibe"
            isActive={interactions.has('more_vibe')}
            onClick={() => onInteraction('more_vibe')}
            variant="primary"
          />

          {/* Save */}
          <ActionButton
            icon={Bookmark}
            label="Save"
            isActive={interactions.has('save')}
            onClick={() => onInteraction('save')}
            variant="muted"
          />
        </motion.div>

        {/* Share */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-2"
            onClick={() => onInteraction('share')}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
  variant: 'primary' | 'accent' | 'muted';
}

function ActionButton({ icon: Icon, label, isActive, onClick, variant }: ActionButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 p-3 rounded-xl transition-all',
        isActive && variant === 'accent' && 'text-accent glow-accent',
        isActive && variant === 'primary' && 'text-primary glow-primary',
        isActive && variant === 'muted' && 'text-foreground',
        !isActive && 'text-muted-foreground hover:text-foreground'
      )}
    >
      <div
        className={cn(
          'p-3 rounded-full transition-all',
          isActive && variant === 'accent' && 'bg-accent/20',
          isActive && variant === 'primary' && 'bg-primary/20',
          isActive && variant === 'muted' && 'bg-muted',
          !isActive && 'bg-muted/50 hover:bg-muted'
        )}
      >
        <Icon className={cn('w-6 h-6', isActive && variant === 'accent' && 'fill-current')} />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </motion.button>
  );
}
