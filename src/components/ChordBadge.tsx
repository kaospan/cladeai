import { cn } from '@/lib/utils';
import { ROMAN_NUMERALS } from '@/types';

interface ChordBadgeProps {
  chord: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ChordBadge({ chord, size = 'md', className }: ChordBadgeProps) {
  const config = ROMAN_NUMERALS[chord as keyof typeof ROMAN_NUMERALS];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-mono font-semibold rounded-lg border transition-all duration-200',
        sizeClasses[size],
        config?.class || 'chord-i',
        className
      )}
    >
      {config?.label || chord}
    </span>
  );
}
