import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, ChevronDown, Copy, FolderInput, Layers, Palette,
  RefreshCw, RotateCcw, Search, Terminal, X,
} from "lucide-react";
import { toast } from "sonner";
import { registry, type ComponentEntry, type ComponentCategory } from "@/showcase/registry-config";
import { validateAll, type ValidationResult } from "@/showcase/validate-components";

// ─── Constants ────────────────────────────────────────────────────────────────

const ORGANIC_COLORS = [
  { label: "Terracotta", value: "hsl(20, 50%, 50%)"  },
  { label: "Sage",       value: "hsl(100, 25%, 50%)" },
  { label: "Stone",      value: "hsl(30, 15%, 55%)"  },
  { label: "Ochre",      value: "hsl(40, 65%, 52%)"  },
  { label: "Dusty Rose", value: "hsl(345, 30%, 55%)" },
  { label: "Slate Blue", value: "hsl(215, 30%, 50%)" },
  { label: "Warm Sand",  value: "hsl(38, 50%, 65%)"  },
  { label: "Forest",     value: "hsl(140, 30%, 40%)" },
];

const DEFAULTS = {
  color:             "hsl(20, 50%, 50%)",
  borderRadius:      12,
  padding:           1.5,
  gap:               1,
  fontSize:          1,
  animationDuration: 0.5,
  opacity:           1,
};

const CATEGORIES: Array<{ id: ComponentCategory | "all"; label: string }> = [
  { id: "all",          label: "All"          },
  { id: "backgrounds",  label: "Backgrounds"  },
  { id: "text",         label: "Text"         },
  { id: "buttons",      label: "Buttons"      },
  { id: "cards",        label: "Cards"        },
  { id: "effects",      label: "Effects"      },
  { id: "mockups",      label: "Mockups"      },
  { id: "layout",       label: "Layout"       },
  { id: "media",        label: "Media"        },
  { id: "interactive",  label: "Interactive"  },
  { id: "loaders",      label: "Loaders"      },
];

// ─── Main component ───────────────────────────────────────────────────────────

export function ComponentLibraryManager() {
  const allComponents = useMemo(() => registry.getAll(), []);

  // Validation — stream results in real time
  const [validation, setValidation] = useState<Map<string, ValidationResult>>(
    () => new Map(allComponents.map((c) => [c.id, { id: c.id, name: c.name, status: "pending" as const, loadTime: 0 }]))
  );
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    let cancelled = false;
    validateAll(allComponents, (r) => {
      if (!cancelled) setValidation((prev) => new Map(prev).set(r.id, r));
    }).then(() => { if (!cancelled) setValidating(false); });
    return () => { cancelled = true; };
  }, []);

  // UI state
  const [search,         setSearch]         = useState("");
  const [category,       setCategory]       = useState<ComponentCategory | "all">("all");
  const [preview,        setPreview]        = useState<ComponentEntry | null>(null);
  const [selected,       setSelected]       = useState<Set<string>>(new Set());
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [controlsOpen,   setControlsOpen]   = useState(true);

  // Controls state
  const [color,             setColor]             = useState(DEFAULTS.color);
  const [customColor,       setCustomColor]       = useState("");
  const [borderRadius,      setBorderRadius]      = useState(DEFAULTS.borderRadius);
  const [padding,           setPadding]           = useState(DEFAULTS.padding);
  const [gap,               setGap]               = useState(DEFAULTS.gap);
  const [fontSize,          setFontSize]          = useState(DEFAULTS.fontSize);
  const [animationDuration, setAnimationDuration] = useState(DEFAULTS.animationDuration);
  const [opacity,           setOpacity]           = useState(DEFAULTS.opacity);

  const resetControls = () => {
    setColor(DEFAULTS.color);
    setCustomColor("");
    setBorderRadius(DEFAULTS.borderRadius);
    setPadding(DEFAULTS.padding);
    setGap(DEFAULTS.gap);
    setFontSize(DEFAULTS.fontSize);
    setAnimationDuration(DEFAULTS.animationDuration);
    setOpacity(DEFAULTS.opacity);
  };

  // Derived: only working components
  const workingComponents = useMemo(
    () => allComponents.filter((c) => validation.get(c.id)?.status === "success"),
    [allComponents, validation]
  );

  // Derived counts
  const passed  = workingComponents.length;
  const failed  = [...validation.values()].filter((r) => r.status === "failed").length;

  // Filtered list (working only)
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return workingComponents.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (q && !c.name.toLowerCase().includes(q) &&
               !c.description.toLowerCase().includes(q) &&
               !c.tags.some((t) => t.includes(q))) return false;
      return true;
    });
  }, [workingComponents, category, search]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll    = () => setSelected(new Set(filtered.map((c) => c.id)));
  const clearSelected = () => setSelected(new Set());

  const selectedEntries = allComponents.filter((c) => selected.has(c.id));

  // CSS vars for preview theming
  const previewVars: Record<string, string> = {
    "--showcase-color":              color,
    "--showcase-radius":             `${borderRadius}px`,
    "--showcase-padding":            `${padding}rem`,
    "--showcase-gap":                `${gap}rem`,
    "--showcase-font-size":          `${fontSize}rem`,
    "--showcase-animation-duration": `${animationDuration}s`,
    "--showcase-opacity":            String(opacity),
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-0">
      {/* ── Section header ────────────────────────────────────────────── */}
      <div
        className="rounded-t-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(20, 50%, 50%), hsl(25, 35%, 70%))" }}
      >
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-xl text-white leading-tight">Component Library Manager</h2>
              <p className="text-white/70 text-xs mt-0.5">
                {validating
                  ? `Validating components… (${passed} ready so far)`
                  : `${passed} working components · ${failed} failed`
                }
              </p>
            </div>
          </div>

          {/* Stats pills */}
          <div className="hidden sm:flex items-center gap-3">
            {validating && (
              <span className="flex items-center gap-1.5 text-xs text-white/60">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                scanning
              </span>
            )}
            <StatPill value={passed}  label="working" className="text-emerald-200" />
            {failed > 0 && <StatPill value={failed} label="failed"  className="text-red-200"     />}
          </div>
        </div>

        {/* Validation progress bar */}
        {validating && (
          <div className="h-0.5 bg-white/10 mx-6 mb-4 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/60 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${allComponents.length > 0 ? ((passed + failed) / allComponents.length) * 100 : 0}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>

      {/* ── Main panel ────────────────────────────────────────────────── */}
      <div
        className="rounded-b-2xl border border-t-0 border-border bg-card overflow-hidden"
        style={{ height: "72vh", minHeight: "540px" }}
      >
        <div className="h-full grid grid-cols-1 lg:grid-cols-[280px_1fr]">

          {/* ── Left sidebar: working components only ─────────────────── */}
          <div className="flex flex-col border-r border-border overflow-hidden bg-card">

            {/* Search */}
            <div className="px-3 pt-3 pb-2 border-b border-border shrink-0 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search working components…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-border bg-muted/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Category chips — horizontal scroll */}
              <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-0.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors shrink-0",
                      category === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List header */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border shrink-0">
              <span className="text-[10px] text-muted-foreground">
                {filtered.length} / {workingComponents.length} shown
              </span>
              <div className="flex gap-2">
                {filtered.length > 0 && (
                  <button
                    onClick={selectAll}
                    className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
                  >
                    All
                  </button>
                )}
                {selected.size > 0 && (
                  <button
                    onClick={clearSelected}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear ({selected.size})
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {validating && workingComponents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-muted-foreground">
                  <RefreshCw className="w-4 h-4 animate-spin opacity-40" />
                  <p className="text-xs opacity-60">Scanning components…</p>
                </div>
              ) : filtered.length === 0 ? (
                <p className="px-4 py-6 text-xs text-center text-muted-foreground italic">
                  No working components match.
                </p>
              ) : (
                filtered.map((c) => {
                  const loadTime = validation.get(c.id)?.loadTime;
                  return (
                    <WorkingComponentRow
                      key={c.id}
                      entry={c}
                      loadTime={loadTime}
                      isPreviewed={preview?.id === c.id}
                      isSelected={selected.has(c.id)}
                      onPreview={() => setPreview(c)}
                      onToggleSelect={() => toggleSelect(c.id)}
                    />
                  );
                })
              )}
            </div>

            {/* Footer: apply button */}
            <div
              className="shrink-0 border-t border-border px-3 py-2.5 flex items-center justify-between"
              style={{ background: "hsl(45, 40%, 97%)" }}
            >
              <span className="text-xs text-muted-foreground">
                {selected.size > 0 ? (
                  <span className="font-medium text-foreground">{selected.size} selected</span>
                ) : (
                  "None selected"
                )}
              </span>
              <button
                disabled={selected.size === 0}
                onClick={() => setShowApplyModal(true)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  selected.size > 0
                    ? "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                )}
              >
                <FolderInput className="w-3.5 h-3.5" />
                Apply Selected
              </button>
            </div>
          </div>

          {/* ── Right: preview + controls ─────────────────────────────── */}
          <div className="flex flex-col overflow-hidden">

            {/* Preview header */}
            {preview ? (
              <div
                className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-border"
                style={{ background: "hsl(45, 40%, 97%)" }}
              >
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">{preview.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{preview.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {preview.docsUrl && (
                    <a
                      href={preview.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline underline-offset-2"
                    >
                      Docs ↗
                    </a>
                  )}
                  <button
                    onClick={() => toggleSelect(preview.id)}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                      selected.has(preview.id)
                        ? "bg-emerald-500/10 text-emerald-700 border border-emerald-200"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {selected.has(preview.id)
                      ? <><Check className="w-3 h-3" /> Selected</>
                      : "+ Select"
                    }
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="shrink-0 px-5 py-3 border-b border-border"
                style={{ background: "hsl(45, 40%, 97%)" }}
              >
                <p className="text-xs text-muted-foreground italic">No component selected</p>
              </div>
            )}

            {/* Preview area */}
            <div
              className="flex-1 overflow-auto flex items-center justify-center p-8 min-h-0"
              style={{
                background: "hsl(40, 33%, 97%)",
                ...previewVars as React.CSSProperties,
              }}
            >
              {preview ? (
                <PreviewBoundary key={preview.id} name={preview.name} docsUrl={preview.docsUrl}>
                  <Suspense
                    fallback={
                      <span className="text-xs text-muted-foreground animate-pulse">
                        Loading {preview.name}…
                      </span>
                    }
                  >
                    <preview.component />
                  </Suspense>
                </PreviewBoundary>
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Layers className="w-8 h-8 opacity-20" />
                  <p className="text-sm">Select a component to preview</p>
                  <p className="text-xs opacity-60">
                    {validating ? "Scanning…" : `${passed} components ready`}
                  </p>
                </div>
              )}
            </div>

            {/* ── Controls panel (below preview) ──────────────────────── */}
            <div className="shrink-0 border-t border-border" style={{ background: "hsl(45, 40%, 97%)" }}>
              {/* Controls header toggle */}
              <button
                onClick={() => setControlsOpen((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5" />
                  Appearance Controls
                </span>
                <div className="flex items-center gap-3">
                  {controlsOpen && (
                    <button
                      onClick={(e) => { e.stopPropagation(); resetControls(); }}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Reset
                    </button>
                  )}
                  <motion.span
                    animate={{ rotate: controlsOpen ? 0 : -90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </motion.span>
                </div>
              </button>

              <AnimatePresence>
                {controlsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 space-y-4">
                      {/* Color swatches */}
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">
                          Theme Color
                        </label>
                        <div className="flex flex-wrap gap-2 items-center">
                          {ORGANIC_COLORS.map((c) => (
                            <button
                              key={c.value}
                              onClick={() => { setColor(c.value); setCustomColor(""); }}
                              title={c.label}
                              className={cn(
                                "w-6 h-6 rounded-full border-2 transition-all",
                                color === c.value
                                  ? "border-foreground scale-110 shadow-sm"
                                  : "border-transparent hover:border-foreground/30"
                              )}
                              style={{ background: c.value }}
                            />
                          ))}
                          {/* Custom color input */}
                          <div className="relative">
                            <input
                              type="color"
                              value={customColor || "#cc7a50"}
                              onChange={(e) => { setCustomColor(e.target.value); setColor(e.target.value); }}
                              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                              title="Custom color"
                            />
                            <div
                              className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                customColor
                                  ? "border-foreground scale-110"
                                  : "border-dashed border-muted-foreground/40 hover:border-muted-foreground/60"
                              )}
                              style={customColor ? { background: customColor } : { background: "transparent" }}
                            >
                              {!customColor && <span className="text-[8px] text-muted-foreground/60">+</span>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sliders grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                        <SliderControl
                          label="Border Radius"
                          value={borderRadius}
                          min={0} max={48} step={1}
                          display={`${borderRadius}px`}
                          onChange={setBorderRadius}
                        />
                        <SliderControl
                          label="Padding"
                          value={padding}
                          min={0} max={4} step={0.25}
                          display={`${padding}rem`}
                          onChange={setPadding}
                        />
                        <SliderControl
                          label="Gap"
                          value={gap}
                          min={0} max={3} step={0.25}
                          display={`${gap}rem`}
                          onChange={setGap}
                        />
                        <SliderControl
                          label="Font Size"
                          value={fontSize}
                          min={0.5} max={2} step={0.1}
                          display={`${fontSize.toFixed(1)}rem`}
                          onChange={setFontSize}
                        />
                        <SliderControl
                          label="Animation"
                          value={animationDuration}
                          min={0} max={2} step={0.1}
                          display={`${animationDuration.toFixed(1)}s`}
                          onChange={setAnimationDuration}
                        />
                        <SliderControl
                          label="Opacity"
                          value={opacity}
                          min={0} max={1} step={0.05}
                          display={`${Math.round(opacity * 100)}%`}
                          onChange={setOpacity}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ── Apply modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showApplyModal && (
          <ApplyModal
            entries={selectedEntries}
            onClose={() => setShowApplyModal(false)}
            onApplied={(count) => {
              setShowApplyModal(false);
              clearSelected();
              toast.success(
                `${count} component${count !== 1 ? "s" : ""} applied. They're now available in your project.`,
                { duration: 5000 }
              );
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── WorkingComponentRow ──────────────────────────────────────────────────────

function WorkingComponentRow({
  entry, loadTime, isPreviewed, isSelected, onPreview, onToggleSelect,
}: {
  entry:          ComponentEntry;
  loadTime?:      number;
  isPreviewed:    boolean;
  isSelected:     boolean;
  onPreview:      () => void;
  onToggleSelect: () => void;
}) {
  return (
    <div
      title={loadTime ? `Loaded in ${loadTime}ms` : undefined}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors group",
        isPreviewed
          ? "bg-primary/5 border-l-2 border-primary"
          : "hover:bg-muted/40 border-l-2 border-transparent"
      )}
      onClick={onPreview}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
        className={cn(
          "w-4 h-4 rounded border transition-colors shrink-0 flex items-center justify-center",
          isSelected
            ? "bg-primary border-primary"
            : "border-muted-foreground/30 hover:border-primary group-hover:border-primary/50"
        )}
        aria-label={`Select ${entry.name}`}
      >
        {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
      </button>

      {/* Green working dot */}
      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500" />

      {/* Name + category */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate text-foreground">{entry.name}</p>
        <p className="text-[10px] text-muted-foreground/60 capitalize">{entry.category}</p>
      </div>

      {/* Load time hint */}
      {loadTime && loadTime > 300 && (
        <span className="text-[9px] text-muted-foreground/40 font-mono shrink-0">{loadTime}ms</span>
      )}
    </div>
  );
}

// ─── SliderControl ────────────────────────────────────────────────────────────

function SliderControl({
  label, value, min, max, step, display, onChange,
}: {
  label:    string;
  value:    number;
  min:      number;
  max:      number;
  step:     number;
  display:  string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-medium text-muted-foreground">{label}</label>
        <span className="text-[10px] font-mono text-muted-foreground/80 tabular-nums">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 accent-primary cursor-pointer"
      />
    </div>
  );
}

// ─── ApplyModal ───────────────────────────────────────────────────────────────

function ApplyModal({
  entries, onClose, onApplied,
}: {
  entries:   ComponentEntry[];
  onClose:   () => void;
  onApplied: (count: number) => void;
}) {
  const commands = entries
    .map((e) => `cp src/showcase/magic-ui/${e.id}.tsx src/components/ui/${e.id}.tsx`)
    .join("\n");

  const handleApply = async () => {
    await navigator.clipboard.writeText(commands);
    onApplied(entries.length);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className="relative w-full max-w-md bg-card rounded-2xl shadow-organic-elevated overflow-hidden"
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        transition={{ duration: 0.18 }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, hsl(20,50%,50%), hsl(25,35%,70%))" }}
        >
          <div className="flex items-center gap-2.5">
            <FolderInput className="w-5 h-5 text-white" />
            <h3 className="text-sm font-semibold text-white">Apply to Project</h3>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {entries.length} component{entries.length !== 1 ? "s" : ""}
            </span>{" "}
            will be copied to{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">src/components/ui/</code>
          </p>

          {/* Component list */}
          <div
            className="rounded-xl border border-border overflow-hidden divide-y divide-border"
            style={{ maxHeight: "10rem", overflowY: "auto", background: "hsl(45, 40%, 97%)" }}
          >
            {entries.map((e) => (
              <div key={e.id} className="flex items-center gap-2.5 px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-medium flex-1">{e.name}</span>
                <span className="text-[10px] text-muted-foreground/60 font-mono">{e.id}.tsx</span>
              </div>
            ))}
          </div>

          {/* Shell commands */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground font-medium">Terminal commands</p>
            </div>
            <pre
              className="text-[11px] font-mono leading-relaxed bg-foreground/5 border border-border rounded-xl px-4 py-3 overflow-x-auto scrollbar-hide text-foreground/80"
              style={{ maxHeight: "8rem" }}
            >
              {commands}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 flex items-center justify-end gap-2 border-t border-border"
          style={{ background: "hsl(45, 40%, 97%)" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy & Apply
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── StatPill ─────────────────────────────────────────────────────────────────

function StatPill({ value, label, className }: { value: number; label: string; className: string }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className={cn("text-sm font-semibold tabular-nums", className)}>{value}</span>
      <span className="text-xs text-white/50">{label}</span>
    </span>
  );
}

// ─── PreviewBoundary ──────────────────────────────────────────────────────────

interface PBProps { name: string; docsUrl?: string; children: ReactNode }
interface PBState { error: Error | null }

class PreviewBoundary extends Component<PBProps, PBState> {
  state: PBState = { error: null };

  static getDerivedStateFromError(e: Error): PBState { return { error: e }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ComponentLibraryManager] Preview failed: ${this.props.name}`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center gap-3 p-6 text-center max-w-xs">
          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-destructive font-bold text-sm">!</span>
          </div>
          <div>
            <p className="text-sm font-medium">Failed to render</p>
            <p className="text-xs text-muted-foreground mt-0.5">{this.props.name}</p>
          </div>
          <p className="text-xs font-mono text-destructive/70 bg-destructive/5 rounded px-3 py-2 w-full text-left break-all">
            {this.state.error.message}
          </p>
          {this.props.docsUrl && (
            <a
              href={this.props.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline underline-offset-2"
            >
              View docs ↗
            </a>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
