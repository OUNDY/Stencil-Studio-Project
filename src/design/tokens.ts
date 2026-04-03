/**
 * Stencil Studio — Design Tokens
 *
 * Single source of truth for the design system.
 *
 * Two export forms:
 *   1. TS constants  — for runtime JS logic, canvas ops, validation
 *   2. CSS var refs  — for style/className props (mirrors what Tailwind generates)
 *
 * The raw HSL numbers in `colorRaw` are IDENTICAL to the values in index.css :root.
 * Both must stay in sync; token-validator.ts checks this at runtime.
 *
 * Format note: index.css stores vars as "H S% L%" (no hsl() wrapper) so that
 * Tailwind can compose them as `hsl(var(--X))`. The `color.*` refs here match
 * the exact strings that Tailwind generates for `text-primary`, `bg-organic-terracotta`, etc.
 */

// ─── Raw HSL values (matches index.css :root exactly) ────────────────────────

/** HSL channel values for the default light theme. */
export const colorRaw = {
  // Organic named palette
  cream:      { h: 45,  s: 40, l: 95 },
  sand:       { h: 35,  s: 30, l: 85 },
  moss:       { h: 140, s: 25, l: 40 },
  terracotta: { h: 20,  s: 50, l: 50 },
  clay:       { h: 25,  s: 35, l: 70 },
  charcoal:   { h: 30,  s: 10, l: 25 },

  // Semantic aliases (light theme resolved values)
  background:  { h: 40,  s: 33, l: 97 },
  foreground:  { h: 30,  s: 10, l: 20 },
  card:        { h: 40,  s: 40, l: 98 },
  primary:     { h: 20,  s: 50, l: 50 },
  secondary:   { h: 150, s: 20, l: 90 },
  muted:       { h: 40,  s: 20, l: 93 },
  accent:      { h: 25,  s: 40, l: 85 },
  border:      { h: 35,  s: 20, l: 88 },
  destructive: { h: 10,  s: 60, l: 55 },
} as const;

/** Nine-step lightness scale per brand color (50→900). */
export const colorScale = {
  terracotta: {
    50:  "hsl(20 50% 97%)",
    100: "hsl(20 50% 93%)",
    200: "hsl(20 50% 85%)",
    300: "hsl(20 50% 73%)",
    400: "hsl(20 50% 62%)",
    500: "hsl(20 50% 50%)", // base
    600: "hsl(20 52% 42%)",
    700: "hsl(20 54% 34%)",
    800: "hsl(20 56% 26%)",
    900: "hsl(20 58% 18%)",
  },
  moss: {
    50:  "hsl(140 25% 97%)",
    100: "hsl(140 25% 92%)",
    200: "hsl(140 25% 83%)",
    300: "hsl(140 25% 70%)",
    400: "hsl(140 25% 56%)",
    500: "hsl(140 25% 40%)", // base
    600: "hsl(140 27% 34%)",
    700: "hsl(140 29% 27%)",
    800: "hsl(140 31% 20%)",
    900: "hsl(140 33% 13%)",
  },
  clay: {
    50:  "hsl(25 35% 97%)",
    100: "hsl(25 35% 93%)",
    200: "hsl(25 35% 85%)",
    300: "hsl(25 35% 78%)",
    400: "hsl(25 35% 73%)",
    500: "hsl(25 35% 70%)", // base
    600: "hsl(25 37% 58%)",
    700: "hsl(25 39% 45%)",
    800: "hsl(25 41% 33%)",
    900: "hsl(25 43% 22%)",
  },
  sand: {
    50:  "hsl(35 30% 97%)",
    100: "hsl(35 30% 93%)",
    200: "hsl(35 30% 88%)",
    300: "hsl(35 30% 85%)", // base
    400: "hsl(35 30% 75%)",
    500: "hsl(35 30% 65%)",
    600: "hsl(35 32% 55%)",
    700: "hsl(35 34% 44%)",
    800: "hsl(35 36% 33%)",
    900: "hsl(35 38% 22%)",
  },
} as const;

// ─── CSS variable reference strings ──────────────────────────────────────────

/** Use these in `style={{ color: color.primary }}` or as CSS value props. */
export const color = {
  // Organic palette
  cream:      "hsl(var(--organic-cream))",
  sand:       "hsl(var(--organic-sand))",
  moss:       "hsl(var(--organic-moss))",
  terracotta: "hsl(var(--organic-terracotta))",
  clay:       "hsl(var(--organic-clay))",
  charcoal:   "hsl(var(--organic-charcoal))",

  // Semantic
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  card:       "hsl(var(--card))",
  primary:    "hsl(var(--primary))",
  secondary:  "hsl(var(--secondary))",
  muted:      "hsl(var(--muted))",
  accent:     "hsl(var(--accent))",
  border:     "hsl(var(--border))",
  ring:       "hsl(var(--ring))",
  destructive:"hsl(var(--destructive))",
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const fontFamily = {
  serif: '"Cormorant Garamond", ui-serif, Georgia, Cambria, serif',
  sans:  '"DM Sans", ui-sans-serif, system-ui, sans-serif',
  mono:  'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace',
} as const;

export const fontSize = {
  "2xs": "0.625rem",  // 10px
  xs:    "0.75rem",   // 12px
  sm:    "0.875rem",  // 14px
  base:  "1rem",      // 16px
  lg:    "1.125rem",  // 18px
  xl:    "1.25rem",   // 20px
  "2xl": "1.5rem",    // 24px
  "3xl": "1.875rem",  // 30px
  "4xl": "2.25rem",   // 36px
  "5xl": "3rem",      // 48px
  "6xl": "3.75rem",   // 60px
  "7xl": "4.5rem",    // 72px
} as const;

export const fontWeight = {
  light:    300,
  regular:  400,
  medium:   500,
  semibold: 600,
} as const;

export const lineHeight = {
  none:    1,
  tight:   1.25,
  snug:    1.375,
  normal:  1.5,
  relaxed: 1.625,
  loose:   2,
} as const;

export const letterSpacing = {
  tighter: "-0.05em",
  tight:   "-0.025em",
  normal:  "0em",
  wide:    "0.025em",
  wider:   "0.05em",
  widest:  "0.1em",
} as const;

// ─── Spacing — 4px base scale ─────────────────────────────────────────────────

export const space = {
  0:    "0px",
  px:   "1px",
  0.5:  "2px",
  1:    "4px",
  1.5:  "6px",
  2:    "8px",
  2.5:  "10px",
  3:    "12px",
  3.5:  "14px",
  4:    "16px",
  5:    "20px",
  6:    "24px",
  7:    "28px",
  8:    "32px",
  9:    "36px",
  10:   "40px",
  11:   "44px",
  12:   "48px",
  14:   "56px",
  16:   "64px",
  20:   "80px",
  24:   "96px",
  28:   "112px",
  32:   "128px",
  36:   "144px",
  40:   "160px",
  48:   "192px",
  56:   "224px",
  64:   "256px",
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────

export const radius = {
  none:    "0px",
  sm:      "calc(var(--radius) - 4px)",  // = 0.75rem
  md:      "calc(var(--radius) - 2px)",  // = 0.875rem
  lg:      "var(--radius)",              // = 1rem
  xl:      "1.25rem",
  "2xl":   "1.5rem",
  "3xl":   "2rem",
  full:    "9999px",
  organic: "60% 40% 30% 70% / 60% 30% 70% 40%",
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadow = {
  none:     "none",
  sm:       "0 1px 3px 0 hsl(30 10% 20% / 0.08)",
  md:       "0 4px 6px -1px hsl(30 10% 20% / 0.08)",
  lg:       "0 10px 15px -3px hsl(30 10% 20% / 0.10)",
  inner:    "inset 0 2px 4px 0 hsl(30 10% 20% / 0.06)",
  soft:     "var(--shadow-soft)",
  elevated: "var(--shadow-elevated)",
  glow:     "var(--shadow-glow)",
} as const;

// ─── Animation ────────────────────────────────────────────────────────────────

export const duration = {
  instant: "0ms",
  fast:    "150ms",
  base:    "200ms",
  slow:    "300ms",
  slower:  "500ms",
  slowest: "800ms",
} as const;

export const easing = {
  linear:    "linear",
  easeIn:    "cubic-bezier(0.4, 0, 1, 1)",
  easeOut:   "cubic-bezier(0, 0, 0.2, 1)",
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  spring:    "cubic-bezier(0.34, 1.56, 0.64, 1)",
  organic:   "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  bounce:    "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
} as const;

// ─── Z-index scale ────────────────────────────────────────────────────────────

export const zIndex = {
  hide:     -1,
  base:      0,
  raised:   10,
  dropdown: 20,
  sticky:   30,
  overlay:  40,
  modal:    50,
  popover:  60,
  toast:    70,
  tooltip:  80,
} as const;

// ─── Breakpoints ──────────────────────────────────────────────────────────────

export const breakpoint = {
  sm:  "640px",
  md:  "768px",
  lg:  "1024px",
  xl:  "1280px",
  "2xl": "1400px",
} as const;

// ─── CSS variable injection ───────────────────────────────────────────────────

/**
 * Injects extra design-system CSS variables onto the root element at runtime.
 * Only writes vars that are NOT already defined in index.css.
 * Call once at app init: `injectTokenCSSVars()`.
 *
 * @param overrides - Additional key→value pairs to set (e.g. from localStorage)
 * @param root      - Target element (defaults to documentElement)
 */
export function injectTokenCSSVars(
  overrides: Record<string, string> = {},
  root: HTMLElement = document.documentElement
): void {
  const vars: Record<string, string> = {
    "--ds-font-serif":       fontFamily.serif,
    "--ds-font-sans":        fontFamily.sans,
    "--ds-font-mono":        fontFamily.mono,
    "--ds-duration-fast":    duration.fast,
    "--ds-duration-base":    duration.base,
    "--ds-duration-slow":    duration.slow,
    "--ds-easing-spring":    easing.spring,
    "--ds-easing-organic":   easing.organic,
    "--ds-shadow-sm":        shadow.sm,
    "--ds-shadow-md":        shadow.md,
    "--ds-shadow-lg":        shadow.lg,
    ...overrides,
  };

  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

/**
 * Apply a color override to a CSS variable in the Tailwind-compatible format.
 * Writes "H S% L%" (no hsl() wrapper) because Tailwind composes as hsl(var(--X)).
 *
 * @example
 * setColorVar("--organic-terracotta", 25, 60, 55);
 * // document.documentElement now has: --organic-terracotta: 25 60% 55%
 */
export function setColorVar(
  varName: string,
  h: number,
  s: number,
  l: number,
  root: HTMLElement = document.documentElement
): void {
  root.style.setProperty(varName, `${h} ${s}% ${l}%`);
}

/**
 * Read the current resolved value of a CSS var from the live stylesheet.
 * Returns null if the variable is not defined.
 */
export function readColorVar(
  varName: string,
  root: HTMLElement = document.documentElement
): string | null {
  const val = getComputedStyle(root).getPropertyValue(varName).trim();
  return val || null;
}

/**
 * Remove an inline style override, reverting to the stylesheet definition.
 */
export function resetColorVar(
  varName: string,
  root: HTMLElement = document.documentElement
): void {
  root.style.removeProperty(varName);
}

// ─── Persistence helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = "stencil-token-overrides";

/** Persist current inline overrides from the root element to localStorage. */
export function saveTokenOverrides(root: HTMLElement = document.documentElement): void {
  const overrides: Record<string, string> = {};
  const organicVars = [
    "--organic-cream", "--organic-sand", "--organic-moss",
    "--organic-terracotta", "--organic-clay", "--organic-charcoal",
  ];
  for (const v of organicVars) {
    const inline = root.style.getPropertyValue(v);
    if (inline) overrides[v] = inline;
  }

  if (Object.keys(overrides).length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/** Restore persisted token overrides. Call at app init. */
export function restoreTokenOverrides(root: HTMLElement = document.documentElement): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const overrides = JSON.parse(raw) as Record<string, string>;
    for (const [key, value] of Object.entries(overrides)) {
      root.style.setProperty(key, value);
    }
  } catch {
    // corrupted storage — ignore
  }
}

/** Clear all persisted and inline overrides. */
export function resetAllTokenOverrides(root: HTMLElement = document.documentElement): void {
  localStorage.removeItem(STORAGE_KEY);
  const organicVars = [
    "--organic-cream", "--organic-sand", "--organic-moss",
    "--organic-terracotta", "--organic-clay", "--organic-charcoal",
  ];
  for (const v of organicVars) {
    root.style.removeProperty(v);
  }
}

// ─── Master export ────────────────────────────────────────────────────────────

export const tokens = {
  color, colorRaw, colorScale,
  fontFamily, fontSize, fontWeight, lineHeight, letterSpacing,
  space, radius, shadow, duration, easing, zIndex, breakpoint,
} as const;

export type Tokens = typeof tokens;

// Named organic colors for iteration (used by token editors and validators)
export const ORGANIC_COLOR_VARS = [
  { key: "cream",      varName: "--organic-cream",      label: "Cream"      },
  { key: "sand",       varName: "--organic-sand",        label: "Sand"       },
  { key: "moss",       varName: "--organic-moss",        label: "Moss"       },
  { key: "terracotta", varName: "--organic-terracotta",  label: "Terracotta" },
  { key: "clay",       varName: "--organic-clay",        label: "Clay"       },
  { key: "charcoal",   varName: "--organic-charcoal",    label: "Charcoal"   },
] as const satisfies ReadonlyArray<{
  key:     keyof typeof colorRaw;
  varName: string;
  label:   string;
}>;
