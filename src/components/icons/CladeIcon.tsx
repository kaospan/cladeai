/**
 * Clade Logo Icon - Phylogenetic Tree Design
 * Represents evolutionary relationships and musical ancestry
 * Smart, elegant, fun for all ages
 */

interface CladeIconProps {
  className?: string;
  size?: number;
}

export function CladeIcon({ className = "", size = 24 }: CladeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main trunk */}
      <path
        d="M12 20V12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* First branching (common ancestor level) */}
      <path
        d="M12 12C12 12 9 10 6 10M12 12C12 12 15 10 18 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Second branching (species level) */}
      <path
        d="M6 10V6M18 10V6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Leaf nodes (circles representing songs/species) */}
      <circle cx="6" cy="4" r="2" fill="currentColor" />
      <circle cx="18" cy="4" r="2" fill="currentColor" />
      <circle cx="12" cy="20" r="2" fill="currentColor" />
      
      {/* Additional branches for complexity */}
      <path
        d="M6 8C6 8 4 7 3 7M18 8C18 8 20 7 21 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="3" cy="6" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="21" cy="6" r="1.5" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

/**
 * Simplified ancestor badge icon
 * Used to mark foundational/influential songs
 */
export function AncestorBadge({ className = "", size = 16 }: CladeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Common Ancestor - Influential Track"
    >
      {/* Compact tree structure */}
      <path
        d="M8 14V8M8 8L5 6M8 8L11 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="5" cy="4" r="1.5" fill="currentColor" />
      <circle cx="11" cy="4" r="1.5" fill="currentColor" />
      <circle cx="8" cy="14" r="1.5" fill="currentColor" />
      
      {/* Sparkle effect for "influential" */}
      <path
        d="M8 2L8.5 3.5L10 4L8.5 4.5L8 6L7.5 4.5L6 4L7.5 3.5L8 2Z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

/**
 * Animated Clade Logo for header/branding
 */
export function CladeLogoAnimated({ className = "", size = 32 }: CladeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="cladeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
      </defs>
      
      {/* Main evolutionary tree */}
      <g className="animate-pulse-subtle">
        <path
          d="M16 28V16"
          stroke="url(#cladeGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        
        <path
          d="M16 16C16 16 11 13 7 13M16 16C16 16 21 13 25 13"
          stroke="url(#cladeGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        <path
          d="M7 13V7M25 13V7"
          stroke="url(#cladeGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        
        {/* Nodes with gradient */}
        <circle cx="7" cy="5" r="3" fill="url(#cladeGradient)" />
        <circle cx="25" cy="5" r="3" fill="url(#cladeGradient)" />
        <circle cx="16" cy="28" r="3" fill="url(#cladeGradient)" />
        
        {/* Extra branches */}
        <path
          d="M7 10C7 10 4 9 2 9M25 10C25 10 28 9 30 9"
          stroke="url(#cladeGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
        <circle cx="2" cy="8" r="2" fill="url(#cladeGradient)" opacity="0.7" />
        <circle cx="30" cy="8" r="2" fill="url(#cladeGradient)" opacity="0.7" />
      </g>
    </svg>
  );
}
