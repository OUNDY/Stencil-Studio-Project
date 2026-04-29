import { cn } from "@/lib/utils";

interface PeacockLogoProps {
  className?: string;
  title?: string;
}

/**
 * Stencil Studio peacock emblem.
 *
 * Stylized stencil-style peacock — upright body, crowned head,
 * cascading decorative tail feathers with eye motifs.
 * Uses `currentColor` so the parent can theme it via `text-primary` etc.
 */
export const PeacockLogo = ({ className, title = "Stencil Studio" }: PeacockLogoProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 120"
    className={cn("h-full w-full", className)}
    role="img"
    aria-label={title}
    fill="currentColor"
  >
    <title>{title}</title>
    <g>
      {/* Crown — three plumes above the head */}
      <circle cx="50" cy="6" r="2" />
      <circle cx="44" cy="9" r="1.6" />
      <circle cx="56" cy="9" r="1.6" />
      <path d="M50 8 L50 14" stroke="currentColor" strokeWidth="1" />
      <path d="M44 11 L46 16" stroke="currentColor" strokeWidth="1" />
      <path d="M56 11 L54 16" stroke="currentColor" strokeWidth="1" />

      {/* Head */}
      <circle cx="50" cy="18" r="5" />
      {/* Beak */}
      <path d="M45 18 L40 19 L45 20 Z" />
      {/* Eye highlight (negative space) */}
      <circle cx="51" cy="17" r="1" fill="hsl(var(--background))" />

      {/* Neck — gracefully curved */}
      <path d="M48 22 C44 30 44 38 48 46 L52 46 C56 38 56 30 52 22 Z" />

      {/* Body — rounded teardrop */}
      <ellipse cx="50" cy="54" rx="9" ry="11" />

      {/* Legs */}
      <path d="M47 64 L45 72 M47 72 L43 72 M47 72 L45 70" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M53 64 L55 72 M53 72 L57 72 M53 72 L55 70" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Tail feathers — cascading downward, 7 plumes with eye motifs */}
      {/* Center plume */}
      <path d="M50 60 Q50 90 50 112" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <ellipse cx="50" cy="112" rx="3" ry="4" />
      <circle cx="50" cy="112" r="1.2" fill="hsl(var(--background))" />

      {/* Inner left/right plumes */}
      <path d="M48 60 Q40 88 36 108" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <ellipse cx="36" cy="108" rx="3" ry="4" transform="rotate(-12 36 108)" />
      <circle cx="36" cy="108" r="1.2" fill="hsl(var(--background))" />

      <path d="M52 60 Q60 88 64 108" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <ellipse cx="64" cy="108" rx="3" ry="4" transform="rotate(12 64 108)" />
      <circle cx="64" cy="108" r="1.2" fill="hsl(var(--background))" />

      {/* Mid plumes */}
      <path d="M45 60 Q30 84 22 100" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <ellipse cx="22" cy="100" rx="2.6" ry="3.6" transform="rotate(-28 22 100)" />
      <circle cx="22" cy="100" r="1" fill="hsl(var(--background))" />

      <path d="M55 60 Q70 84 78 100" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <ellipse cx="78" cy="100" rx="2.6" ry="3.6" transform="rotate(28 78 100)" />
      <circle cx="78" cy="100" r="1" fill="hsl(var(--background))" />

      {/* Outer plumes */}
      <path d="M42 60 Q22 76 12 88" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <ellipse cx="12" cy="88" rx="2.2" ry="3.2" transform="rotate(-44 12 88)" />
      <circle cx="12" cy="88" r="0.9" fill="hsl(var(--background))" />

      <path d="M58 60 Q78 76 88 88" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <ellipse cx="88" cy="88" rx="2.2" ry="3.2" transform="rotate(44 88 88)" />
      <circle cx="88" cy="88" r="0.9" fill="hsl(var(--background))" />

      {/* Decorative dots between plumes for filigree feel */}
      <circle cx="30" cy="78" r="0.8" />
      <circle cx="70" cy="78" r="0.8" />
      <circle cx="40" cy="92" r="0.8" />
      <circle cx="60" cy="92" r="0.8" />
    </g>
  </svg>
);

export default PeacockLogo;
