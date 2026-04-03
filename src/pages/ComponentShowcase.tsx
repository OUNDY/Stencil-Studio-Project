import { Component, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import { magicUIComponents, type ShowcaseComponent } from "@/showcase/magic-ui";
import { validateAll, type ValidationResult } from "@/showcase/validate-components";

// ─── Organic palette (mirrors CSS vars in index.css) ─────────────────────────
const ORGANIC_COLORS = [
  { id: "cream",      label: "Cream",      value: "hsl(45, 40%, 95%)" },
  { id: "sand",       label: "Sand",       value: "hsl(35, 30%, 85%)" },
  { id: "moss",       label: "Moss",       value: "hsl(140, 25%, 40%)" },
  { id: "terracotta", label: "Terracotta", value: "hsl(20, 50%, 50%)" },
  { id: "clay",       label: "Clay",       value: "hsl(25, 35%, 70%)" },
  { id: "charcoal",   label: "Charcoal",   value: "hsl(30, 10%, 25%)" },
] as const;

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULTS = {
  color:             "hsl(20, 50%, 50%)",  // terracotta
  borderRadius:      12,                   // px
  padding:           1.5,                  // rem
  gap:               1,                    // rem
  fontSize:          1,                    // rem
  animationDuration: 0.5,                  // s
  opacity:           1,
} as const;

type ControlValues = {
  color:             string;
  borderRadius:      number;
  padding:           number;
  gap:               number;
  fontSize:          number;
  animationDuration: number;
  opacity:           number;
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ComponentShowcase() {
  const [selected, setSelected] = useState<ShowcaseComponent | null>(
    magicUIComponents[0] ?? null
  );
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(magicUIComponents.map((c) => [c.id, true]))
  );
  const [controls, setControls] = useState<ControlValues>({ ...DEFAULTS });
  const [customHex, setCustomHex] = useState("#bf6840");

  // ── Validation state ───────────────────────────────────────────────────────
  const [validation, setValidation] = useState<Map<string, ValidationResult>>(
    () => new Map(magicUIComponents.map((c) => [c.id, { id: c.id, name: c.name, status: "pending" as const, loadTime: 0 }]))
  );
  const [validating, setValidating] = useState(true);
  const [showFailed, setShowFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setValidating(true);

    validateAll(magicUIComponents, (result) => {
      if (cancelled) return;
      setValidation((prev) => new Map(prev).set(result.id, result));
    }).then(() => {
      if (!cancelled) setValidating(false);
    });

    return () => { cancelled = true; };
  }, []);

  const set = <K extends keyof ControlValues>(key: K, val: ControlValues[K]) =>
    setControls((prev) => ({ ...prev, [key]: val }));

  // CSS custom properties consumed by previewed components via var()
  const previewVars = {
    "--showcase-color":              controls.color,
    "--showcase-radius":             `${controls.borderRadius}px`,
    "--showcase-padding":            `${controls.padding}rem`,
    "--showcase-gap":                `${controls.gap}rem`,
    "--showcase-font-size":          `${controls.fontSize}rem`,
    "--showcase-animation-duration": `${controls.animationDuration}s`,
    "--showcase-opacity":            String(controls.opacity),
  } as React.CSSProperties;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* ── Column 1: Component list + dashboard ─────────────────────────── */}
      <aside className="w-56 shrink-0 border-r border-border flex flex-col bg-card">

        {/* Header */}
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Components
            </h1>
            {validating && (
              <span className="text-[10px] text-muted-foreground/60 animate-pulse">
                scanning…
              </span>
            )}
          </div>
        </div>

        {/* Dashboard */}
        <ValidationDashboard
          total={magicUIComponents.length}
          validation={validation}
          validating={validating}
          showFailed={showFailed}
          onToggleFailed={() => setShowFailed((v) => !v)}
          onSelect={(id) => {
            const c = magicUIComponents.find((x) => x.id === id);
            if (c) setSelected(c);
          }}
          selected={selected?.id}
        />

        {/* Working components */}
        <nav className="flex-1 overflow-y-auto py-2 scrollbar-hide">
          {magicUIComponents
            .filter((c) => {
              const v = validation.get(c.id);
              return !v || v.status !== "failed";
            })
            .map((c) => {
              const v = validation.get(c.id);
              const isPending = !v || v.status === "pending";
              return (
                <ComponentRow
                  key={c.id}
                  name={c.name}
                  status={v?.status ?? "pending"}
                  loadTime={v?.loadTime}
                  selected={selected?.id === c.id}
                  enabled={!!enabled[c.id]}
                  isPending={isPending}
                  onToggle={(val) => setEnabled((prev) => ({ ...prev, [c.id]: val }))}
                  onSelect={() => {
                    console.log(`[Showcase] Loading: ${c.name} (${c.id})`);
                    setSelected(c);
                  }}
                />
              );
            })}
        </nav>
      </aside>

      {/* ── Column 2: Controls panel ──────────────────────────────────────── */}
      <aside className="w-72 shrink-0 border-r border-border flex flex-col bg-card overflow-hidden">
        <div className="px-4 py-4 border-b border-border flex items-center justify-between shrink-0">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Controls
          </h2>
          <button
            onClick={() => setControls({ ...DEFAULTS })}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Reset to Default
          </button>
        </div>

        {/* Scrollable controls */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-5 space-y-6">

          {/* Color */}
          <ControlGroup label="Color" display={controls.color}>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {ORGANIC_COLORS.map((c) => (
                <button
                  key={c.id}
                  title={c.label}
                  onClick={() => set("color", c.value)}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-all hover:scale-110",
                    controls.color === c.value
                      ? "border-foreground scale-110 shadow-sm"
                      : "border-transparent hover:border-muted-foreground/40"
                  )}
                  style={{ background: c.value }}
                />
              ))}

              {/* Custom color — transparent input overlaid on styled swatch */}
              <label
                title="Custom color"
                className="relative cursor-pointer w-7 h-7 shrink-0"
              >
                <span
                  className={cn(
                    "absolute inset-0 rounded-full border-2 transition-all hover:scale-110",
                    controls.color === customHex
                      ? "border-foreground scale-110 shadow-sm"
                      : "border-dashed border-muted-foreground/50"
                  )}
                  style={{ background: customHex }}
                />
                <input
                  type="color"
                  value={customHex}
                  onChange={(e) => {
                    setCustomHex(e.target.value);
                    set("color", e.target.value);
                  }}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer rounded-full"
                />
              </label>
            </div>
          </ControlGroup>

          <SliderControl
            label="Border Radius"
            value={controls.borderRadius}
            unit="px"
            min={0} max={100} step={1}
            onChange={(v) => set("borderRadius", v)}
          />

          <SliderControl
            label="Padding"
            value={controls.padding}
            unit="rem"
            min={0} max={5} step={0.25}
            onChange={(v) => set("padding", v)}
          />

          <SliderControl
            label="Gap"
            value={controls.gap}
            unit="rem"
            min={0} max={4} step={0.25}
            onChange={(v) => set("gap", v)}
          />

          <SliderControl
            label="Font Size"
            value={controls.fontSize}
            unit="rem"
            min={0.5} max={3} step={0.125}
            onChange={(v) => set("fontSize", v)}
          />

          <SliderControl
            label="Animation Duration"
            value={controls.animationDuration}
            unit="s"
            min={0.1} max={5} step={0.1}
            onChange={(v) => set("animationDuration", v)}
          />

          <SliderControl
            label="Opacity"
            value={controls.opacity}
            unit=""
            min={0} max={1} step={0.01}
            onChange={(v) => set("opacity", v)}
          />
        </div>

        {/* Live values readout */}
        <div className="border-t border-border px-4 py-4 shrink-0">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
            Live Values
          </p>
          <pre className="text-[11px] text-muted-foreground leading-relaxed font-mono overflow-x-auto scrollbar-hide">
{`color:     ${controls.color}
radius:    ${controls.borderRadius}px
padding:   ${controls.padding}rem
gap:       ${controls.gap}rem
fontSize:  ${controls.fontSize}rem
duration:  ${controls.animationDuration}s
opacity:   ${controls.opacity}`}
          </pre>
        </div>
      </aside>

      {/* ── Column 3: Preview pane ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {selected && enabled[selected.id] ? (
          <>
            <div className="px-6 py-4 border-b border-border shrink-0 flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shrink-0 ring-1 ring-border"
                style={{ background: controls.color }}
              />
              <div>
                <h2 className="text-sm font-semibold leading-none">
                  {selected.name}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selected.description}
                </p>
              </div>
            </div>

            <div
              className="flex-1 overflow-auto flex items-center justify-center p-10 bg-muted/20"
              style={previewVars}
            >
              {/* key resets the boundary automatically when selection changes */}
              <PreviewErrorBoundary key={selected.id} componentName={selected.name} docsUrl={selected.docsUrl}>
                <Suspense
                  fallback={
                    <span className="text-xs text-muted-foreground animate-pulse">
                      Loading {selected.name}…
                    </span>
                  }
                >
                  <selected.component />
                </Suspense>
              </PreviewErrorBoundary>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <span className="text-sm">
              {magicUIComponents.length === 0
                ? "No components registered — add one to src/showcase/magic-ui/index.ts"
                : "Select a component from the left to preview"}
            </span>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ControlGroup({
  label,
  display,
  children,
}: {
  label: string;
  display: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span
          className="text-xs text-muted-foreground font-mono truncate max-w-[140px]"
          title={display}
        >
          {display}
        </span>
      </div>
      {children}
    </div>
  );
}

function SliderControl({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground font-mono tabular-nums">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: "hsl(20, 50%, 50%)" }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted-foreground/50">
          {min}
          {unit}
        </span>
        <span className="text-[10px] text-muted-foreground/50">
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "relative w-8 h-4 rounded-full transition-colors shrink-0",
        on ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform",
          on ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── ValidationDashboard ──────────────────────────────────────────────────────

function ValidationDashboard({
  total,
  validation,
  validating,
  showFailed,
  onToggleFailed,
  onSelect,
  selected,
}: {
  total: number;
  validation: Map<string, ValidationResult>;
  validating: boolean;
  showFailed: boolean;
  onToggleFailed: () => void;
  onSelect: (id: string) => void;
  selected?: string;
}) {
  const results = [...validation.values()];
  const passed  = results.filter((r) => r.status === "success").length;
  const failed  = results.filter((r) => r.status === "failed").length;
  const pending = results.filter((r) => r.status === "pending").length;

  return (
    <div className="border-b border-border shrink-0">
      {/* Count row */}
      <div className="flex items-center gap-1 px-4 py-2.5">
        <Stat label="total"   value={total}  color="text-muted-foreground" />
        <span className="text-border mx-0.5">·</span>
        <Stat label="ok"      value={passed} color="text-emerald-600 dark:text-emerald-400" />
        <span className="text-border mx-0.5">·</span>
        <Stat
          label={validating ? `${pending} left` : "failed"}
          value={failed}
          color={failed > 0 ? "text-destructive" : "text-muted-foreground"}
        />
      </div>

      {/* Progress bar */}
      {validating && (
        <div className="h-0.5 bg-muted mx-4 mb-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${total > 0 ? ((passed + failed) / total) * 100 : 0}%` }}
          />
        </div>
      )}

      {/* Failed toggle */}
      {failed > 0 && (
        <button
          onClick={onToggleFailed}
          className="w-full flex items-center justify-between px-4 py-1.5 text-xs text-destructive hover:bg-destructive/5 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <span>{showFailed ? "▾" : "▸"}</span>
            <span>{failed} failed</span>
          </span>
          <span className="text-muted-foreground/50">{showFailed ? "hide" : "show"}</span>
        </button>
      )}

      {/* Expandable failed list */}
      {showFailed && failed > 0 && (
        <div className="border-t border-border/50 py-1 max-h-48 overflow-y-auto scrollbar-hide">
          {results
            .filter((r) => r.status === "failed")
            .map((r) => (
              <button
                key={r.id}
                onClick={() => onSelect(r.id)}
                title={r.error}
                className={cn(
                  "w-full text-left px-4 py-1.5 group",
                  selected === r.id && "bg-muted/50"
                )}
              >
                <p className={cn(
                  "text-xs truncate text-muted-foreground/50 line-through",
                  selected === r.id && "text-muted-foreground"
                )}>
                  {r.name}
                </p>
                {r.error && (
                  <p className="text-[10px] text-destructive/70 truncate mt-0.5 font-mono">
                    {r.error}
                  </p>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className="flex items-baseline gap-0.5">
      <span className={cn("text-xs font-semibold tabular-nums", color)}>{value}</span>
      <span className="text-[10px] text-muted-foreground/50">{label}</span>
    </span>
  );
}

// ─── ComponentRow ─────────────────────────────────────────────────────────────

function ComponentRow({
  name,
  status,
  loadTime,
  selected,
  enabled,
  isPending,
  onToggle,
  onSelect,
}: {
  name: string;
  status: ValidationResult["status"];
  loadTime?: number;
  selected: boolean;
  enabled: boolean;
  isPending: boolean;
  onToggle: (v: boolean) => void;
  onSelect: () => void;
}) {
  const statusDot = {
    success: "bg-emerald-500",
    failed:  "bg-destructive",
    pending: "bg-muted-foreground/30 animate-pulse",
  }[status];

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 group",
        selected && "bg-muted/50"
      )}
      title={status === "failed" ? undefined : loadTime !== undefined ? `${loadTime}ms` : undefined}
    >
      {/* Status dot */}
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 mt-px", statusDot)} />

      {/* Toggle */}
      <Toggle on={enabled && !isPending} onChange={onToggle} />

      {/* Name button */}
      <button
        onClick={onSelect}
        disabled={!enabled || isPending}
        className={cn(
          "flex-1 text-left text-xs truncate transition-colors",
          selected
            ? "text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground",
          (!enabled || isPending) && "opacity-40 cursor-not-allowed"
        )}
      >
        {name}
      </button>
    </div>
  );
}

// ─── Error Boundary ───────────────────────────────────────────────────────────
// Must be a class component — React's reconciler surfaces render errors outside
// the normal call stack, so try/catch in function components cannot catch them.

interface ErrorBoundaryProps {
  componentName: string;
  docsUrl?:      string;
  children:      ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class PreviewErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[Showcase] Component failed to load: ${this.props.componentName}`,
      error,
      info.componentStack
    );
  }

  render() {
    if (this.state.error) {
      const { componentName, docsUrl } = this.props;
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center max-w-sm">
          {/* Icon */}
          <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <span className="text-destructive text-base font-bold leading-none">!</span>
          </div>

          {/* Title + component name */}
          <div>
            <p className="text-sm font-semibold text-foreground">
              Component failed to load
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              {componentName}
            </p>
          </div>

          {/* Error message */}
          <p className="text-xs font-mono text-destructive/80 bg-destructive/5 border border-destructive/10 rounded px-3 py-2 w-full text-left break-all leading-relaxed">
            {this.state.error.message}
          </p>

          {/* Actions row */}
          <div className="flex items-center gap-3 text-xs">
            {docsUrl && (
              <a
                href={docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline underline-offset-2 transition-colors"
              >
                View docs
                <span aria-hidden>↗</span>
              </a>
            )}
            <span className="text-muted-foreground/50">
              Full trace in console
            </span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
