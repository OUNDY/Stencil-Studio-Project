import { useCallback, useEffect, useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import {
  colorRaw,
  ORGANIC_COLOR_VARS,
  setColorVar,
  resetColorVar,
  resetAllTokenOverrides,
  saveTokenOverrides,
} from "@/design/tokens";
import { TokenSwatch } from "./TokenSwatch";

interface ChannelState {
  h: number;
  s: number;
  l: number;
}

type ColorKey = typeof ORGANIC_COLOR_VARS[number]["key"];

type ChannelEditorState = Record<ColorKey, ChannelState>;

function initState(): ChannelEditorState {
  const root = typeof window !== "undefined" ? document.documentElement : null;
  const style = root ? getComputedStyle(root) : null;

  const result = {} as ChannelEditorState;

  for (const { key, varName } of ORGANIC_COLOR_VARS) {
    let h = colorRaw[key].h;
    let s = colorRaw[key].s;
    let l = colorRaw[key].l;

    if (style) {
      const val = style.getPropertyValue(varName).trim();
      if (val) {
        const parts = val.replace(/%/g, "").split(/\s+/);
        if (parts.length >= 3) {
          h = (parseFloat(parts[0]) || h) as number;
          s = (parseFloat(parts[1]) || s) as number;
          l = (parseFloat(parts[2]) || l) as number;
        }
      }
    }

    result[key] = { h, s, l };
  }

  return result;
}

interface TokenEditorProps {
  onSaved?: () => void;
}

/**
 * Live HSL color editor. Mutates CSS variables directly on document.documentElement
 * so all Tailwind classes using hsl(var(--organic-*)) update instantly.
 *
 * Format written: "H S% L%" — matches how index.css defines the variables.
 */
export function TokenEditor({ onSaved }: TokenEditorProps) {
  const [channels, setChannels] = useState<ChannelEditorState>(initState);
  const [dirty, setDirty] = useState(false);
  const [activeKey, setActiveKey] = useState<ColorKey>("terracotta");

  const update = useCallback((key: ColorKey, channel: keyof ChannelState, value: number) => {
    setChannels((prev) => {
      const next = { ...prev, [key]: { ...prev[key], [channel]: value } };

      // Apply immediately to root
      const entry = ORGANIC_COLOR_VARS.find((v) => v.key === key);
      if (entry) {
        setColorVar(entry.varName, next[key].h, next[key].s, next[key].l);
      }

      return next;
    });
    setDirty(true);
  }, []);

  const resetOne = (key: ColorKey) => {
    const entry = ORGANIC_COLOR_VARS.find((v) => v.key === key);
    if (entry) resetColorVar(entry.varName);
    setChannels((prev) => ({
      ...prev,
      [key]: { h: colorRaw[key].h, s: colorRaw[key].s, l: colorRaw[key].l },
    }));
    setDirty(true);
  };

  const resetAll = () => {
    resetAllTokenOverrides();
    setChannels(initState());
    setDirty(false);
  };

  const save = () => {
    saveTokenOverrides();
    setDirty(false);
    onSaved?.();
  };

  // Re-initialize when external theme changes (e.g. theme-ocean class added)
  useEffect(() => {
    setChannels(initState());
    setDirty(false);
  }, []);

  const active = channels[activeKey];
  const activeEntry = ORGANIC_COLOR_VARS.find((v) => v.key === activeKey)!;

  return (
    <div className="space-y-5">
      {/* Swatch grid — click to select */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Organic Palette
        </p>
        <div className="flex flex-wrap gap-4">
          {ORGANIC_COLOR_VARS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveKey(key as ColorKey)}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className={`relative transition-transform ${activeKey === key ? "scale-110" : "hover:scale-105"}`}
              >
                <TokenSwatch varName={`--organic-${key}`} label={label} size="lg" />
                {activeKey === key && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active color HSL sliders */}
      <div
        className="rounded-2xl border border-border p-4 space-y-4"
        style={{ background: "hsl(45, 40%, 97%)" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            Editing: <span className="text-primary">{activeEntry.label}</span>
          </p>
          <button
            onClick={() => resetOne(activeKey)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        {/* Preview */}
        <div
          className="h-12 rounded-xl border border-white/40"
          style={{ background: `hsl(${active.h} ${active.s}% ${active.l}%)` }}
        />

        {/* Sliders */}
        {(["h", "s", "l"] as const).map((channel) => {
          const ranges = { h: [0, 360], s: [0, 100], l: [0, 100] };
          const labels = { h: "Hue", s: "Saturation", l: "Lightness" };
          const [min, max] = ranges[channel];

          return (
            <div key={channel} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  {labels[channel]}
                </label>
                <span className="text-xs font-mono text-muted-foreground/80 tabular-nums">
                  {Math.round(active[channel])}{channel !== "h" ? "%" : "°"}
                </span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={channel === "h" ? 1 : 0.5}
                value={active[channel]}
                onChange={(e) => update(activeKey, channel, parseFloat(e.target.value))}
                className="w-full h-1.5 accent-primary cursor-pointer rounded-full"
              />
            </div>
          );
        })}

        {/* CSS value */}
        <p className="text-[10px] font-mono text-muted-foreground/60 bg-muted/50 rounded px-2 py-1">
          {activeEntry.varName}: {Math.round(active.h)} {Math.round(active.s)}% {Math.round(active.l)}%
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={resetAll}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset all colors
        </button>

        <button
          onClick={save}
          disabled={!dirty}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            dirty
              ? "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
          }`}
        >
          <Save className="w-3 h-3" />
          Save to session
        </button>
      </div>

      {dirty && (
        <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
          Unsaved changes — colors update live across the site. Save to persist through page reloads.
        </p>
      )}
    </div>
  );
}
