import { cn } from '@/lib/utils';
import { ROMAN_NUMERALS } from '@/types';

interface ChordBadgeProps {
  chord: string;
  keySignature?: string; // e.g., "C", "D", "F#"
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Convert roman numeral to actual chord letter with full quality
 */
function romanToChordLetter(roman: string, key: string = 'C'): string {
  // Parse the roman numeral and extract quality indicators
  const isMinorChord = roman.charAt(0) === roman.charAt(0).toLowerCase();
  
  // Extract base roman numeral (I, II, III, IV, V, VI, VII)
  let baseRoman = '';
  let modifiers = '';
  let i = 0;
  
  while (i < roman.length && /[IVXivx]/.test(roman[i])) {
    baseRoman += roman[i].toUpperCase();
    i++;
  }
  
  // Rest is modifiers (7, maj7, dim, °, +, sus4, etc.)
  modifiers = roman.slice(i);
  
  // Scale degrees from root
  const majorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const romanMap: Record<string, number> = {
    'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4, 'VI': 5, 'VII': 6
  };
  
  const keyIndex = majorScale.indexOf(key.charAt(0).toUpperCase());
  if (keyIndex === -1) return roman; // Invalid key
  
  const degree = romanMap[baseRoman];
  if (degree === undefined) return roman; // Invalid roman numeral
  
  // Calculate chord root using chromatic scale for sharps/flats
  const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11]; // Semitones from root
  const keyChromatic = chromaticScale.indexOf(key.charAt(0).toUpperCase());
  const chordRootChromatic = (keyChromatic + majorScaleIntervals[degree]) % 12;
  const chordRoot = chromaticScale[chordRootChromatic];
  
  // Build chord quality string
  let quality = '';
  
  // Check for diminished
  if (modifiers.includes('°') || modifiers.includes('dim')) {
    quality = 'dim';
  }
  // Check for augmented
  else if (modifiers.includes('+') || modifiers.includes('aug')) {
    quality = 'aug';
  }
  // Check for minor
  else if (isMinorChord) {
    quality = 'm';
  }
  
  // Add 7th qualities
  if (modifiers.includes('maj7')) {
    quality += 'maj7';
  } else if (modifiers.includes('m7')) {
    quality = 'm7'; // Override earlier 'm'
  } else if (modifiers.includes('7')) {
    quality += '7';
  }
  
  // Add suspended
  if (modifiers.includes('sus4')) {
    quality += 'sus4';
  } else if (modifiers.includes('sus2')) {
    quality += 'sus2';
  }
  
  // Add extensions
  if (modifiers.includes('9') && !modifiers.includes('sus')) {
    if (quality.includes('7')) {
      quality = quality.replace('7', '9');
    } else {
      quality += 'add9';
    }
  }
  
  if (modifiers.includes('11')) {
    quality += '11';
  }
  
  if (modifiers.includes('13')) {
    quality += '13';
  }
  
  return chordRoot + quality;
}

export function ChordBadge({ chord, keySignature, size = 'md', className }: ChordBadgeProps) {
  const config = ROMAN_NUMERALS[chord as keyof typeof ROMAN_NUMERALS];
  const chordLetter = keySignature ? romanToChordLetter(chord, keySignature) : null;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex flex-col items-center justify-center font-mono font-semibold rounded-lg border transition-all duration-200',
        sizeClasses[size],
        config?.class || 'chord-i',
        className
      )}
    >
      <span className="leading-tight">{config?.label || chord}</span>
      {chordLetter && (
        <span className="text-[0.7em] opacity-70 leading-tight mt-0.5 font-normal">
          {chordLetter}
        </span>
      )}
    </span>
  );
}
