import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
interface PaintingState {
  color:     string;
  opacity:   number;  // 0.0–1.0
  brushSize: number;  // 10–120
}

export interface CanvasPaintingControllerProps {
  onColorChange?:     (color: string) => void;
  onOpacityChange?:   (opacity: number) => void;
  onBrushSizeChange?: (size: number) => void;
  onReset?:           () => void;
  className?:         string;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = "stencil-painting-state";
const MODE_KEY    = "stencil-controller-mode";

const DEFAULTS: PaintingState = {
  color:     "#c8714e",  // terracotta — natural stencil paint
  opacity:   0.85,
  brushSize: 48,
};

// Stencil Studio organic design palette
const COLOR_PRESETS = [
  "#c8714e", // terracotta
  "#e8c56a", // ochre
  "#7a9e7e", // sage
  "#e8dcc8", // warm stone
  "#d4847a", // dusty rose
  "#4a6789", // slate blue
  "#3d3530", // charcoal
  "#f5f0e8", // warm white
] as const;

// ── localStorage helpers ───────────────────────────────────────────────────────
function readState(): PaintingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function readMode(): "simple" | "advanced" {
  try {
    return localStorage.getItem(MODE_KEY) === "advanced" ? "advanced" : "simple";
  } catch {
    return "simple";
  }
}

// ── Component ──────────────────────────────────────────────────────────────────
export function CanvasPaintingController({
  onColorChange,
  onOpacityChange,
  onBrushSizeChange,
  onReset,
  className,
}: CanvasPaintingControllerProps) {
  // Lazy initializers read localStorage before first render — no hydration flash.
  const [state, setState] = useState<PaintingState>(readState);
  const [mode,  setMode]  = useState<"simple" | "advanced">(readMode);

  // Persist on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  // Generic typed updater fires the matching callback
  const update = useCallback(
    <K extends keyof PaintingState>(key: K, value: PaintingState[K]) => {
      setState(prev => ({ ...prev, [key]: value }));
      if (key === "color")     onColorChange?.(value as string);
      if (key === "opacity")   onOpacityChange?.(value as number);
      if (key === "brushSize") onBrushSizeChange?.(value as number);
    },
    [onColorChange, onOpacityChange, onBrushSizeChange],
  );

  const handleReset = useCallback(() => {
    setState(DEFAULTS);
    onColorChange?.(DEFAULTS.color);
    onOpacityChange?.(DEFAULTS.opacity);
    onBrushSizeChange?.(DEFAULTS.brushSize);
    onReset?.();
  }, [onColorChange, onOpacityChange, onBrushSizeChange, onReset]);

  const isAdvanced = mode === "advanced";

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-elevated)]", className)}>
      {/* ── Header with mode toggle ────────────────────── */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Painting Controls</h3>
        <div className="flex items-center gap-2">
          <span className="select-none text-xs text-muted-foreground">
            {isAdvanced ? "Advanced" : "Simple"}
          </span>
          <button
            onClick={() => setMode(m => m === "simple" ? "advanced" : "simple")}
            aria-label={`Switch to ${isAdvanced ? "simple" : "advanced"} mode`}
            aria-checked={isAdvanced}
            role="switch"
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              isAdvanced ? "bg-primary" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm",
                "transition-transform duration-200",
                isAdvanced ? "translate-x-4" : "translate-x-0.5",
              )}
            />
          </button>
        </div>
      </div>

      {/* ── Color ──────────────────────────────────────── */}
      <fieldset className="m-0 mb-4 border-0 p-0">
        <legend className="mb-2 text-xs font-medium text-muted-foreground">Color</legend>
        <div className="flex flex-wrap gap-1.5">
          {COLOR_PRESETS.map(preset => (
            <button
              key={preset}
              onClick={() => update("color", preset)}
              title={preset}
              aria-label={`Select color ${preset}`}
              aria-pressed={state.color === preset}
              style={{ background: preset }}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-all duration-150",
                "hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                state.color === preset
                  ? "scale-110 border-foreground shadow-md"
                  : "border-transparent hover:border-border",
              )}
            />
          ))}
        </div>

        {/* Advanced: hex + native color picker */}
        {isAdvanced && (
          <div className="mt-3 flex items-center gap-2">
            <div
              aria-hidden="true"
              className="h-6 w-6 shrink-0 rounded border border-border"
              style={{ background: state.color }}
            />
            <input
              type="text"
              value={state.color}
              onChange={e => {
                const v = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) update("color", v);
              }}
              onBlur={e => {
                if (!/^#[0-9a-fA-F]{6}$/.test(e.target.value))
                  update("color", state.color.length === 7 ? state.color : DEFAULTS.color);
              }}
              maxLength={7}
              spellCheck={false}
              aria-label="Hex color value"
              className="flex-1 rounded-lg border border-border bg-background px-2 py-1 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <input
              type="color"
              value={state.color}
              onChange={e => update("color", e.target.value)}
              aria-label="Open color picker"
              className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
            />
          </div>
        )}
      </fieldset>

      {/* ── Brush Size ─────────────────────────────────── */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="ctrl-brush-size" className="text-xs font-medium text-muted-foreground">
            Brush Size
          </label>
          <span className="tabular-nums text-xs text-foreground">{state.brushSize}</span>
        </div>
        <input
          id="ctrl-brush-size"
          type="range"
          min={10} max={120} step={2}
          value={state.brushSize}
          onChange={e => update("brushSize", Number(e.target.value))}
          className="w-full cursor-pointer accent-primary"
        />
      </div>

      {/* ── Opacity ────────────────────────────────────── */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="ctrl-opacity" className="text-xs font-medium text-muted-foreground">
            Opacity
          </label>
          <span className="tabular-nums text-xs text-foreground">
            {Math.round(state.opacity * 100)}%
          </span>
        </div>
        <input
          id="ctrl-opacity"
          type="range"
          min={0} max={1} step={0.01}
          value={state.opacity}
          onChange={e => update("opacity", Number(e.target.value))}
          className="w-full cursor-pointer accent-primary"
        />
      </div>

      {/* ── Brush Preview (advanced only) ──────────────── */}
      {isAdvanced && (
        <div
          aria-hidden="true"
          className="mb-4 flex items-center justify-center rounded-xl border border-border bg-muted/30 py-5"
        >
          <div
            className="rounded-full transition-all duration-150"
            style={{
              width:      Math.max(8, state.brushSize * 0.55),
              height:     Math.max(8, state.brushSize * 0.55),
              background: state.color,
              opacity:    state.opacity,
              boxShadow:  `0 0 ${Math.round(state.brushSize * 0.3)}px ${state.color}88`,
            }}
          />
        </div>
      )}

      {/* ── Reset ──────────────────────────────────────── */}
      <button
        onClick={handleReset}
        className={cn(
          "w-full rounded-xl border border-border bg-background",
          "px-3 py-2 text-xs text-muted-foreground",
          "transition-colors duration-150",
          "hover:border-destructive/50 hover:text-destructive",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        Reset to Defaults
      </button>
    </div>
  );
}
