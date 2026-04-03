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
import { Check, Copy, FolderInput, Layers, RefreshCw, Search, Terminal, X } from "lucide-react";
import { toast } from "sonner";
import { registry, type ComponentEntry, type ComponentCategory } from "@/showcase/registry-config";
import { validateAll, type ValidationResult } from "@/showcase/validate-components";

// ─── Constants ────────────────────────────────────────────────────────────────

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

export function AdminComponentLibrary() {
  const allComponents = useMemo(() => registry.getAll(), []);

  // Validation
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
  const [panelOpen,      setPanelOpen]      = useState(true);

  // Derived counts
  const passed  = [...validation.values()].filter((r) => r.status === "success").length;
  const failed  = [...validation.values()].filter((r) => r.status === "failed").length;

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allComponents.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (q && !c.name.toLowerCase().includes(q) &&
               !c.description.toLowerCase().includes(q) &&
               !c.tags.some((t) => t.includes(q))) return false;
      return true;
    });
  }, [allComponents, category, search]);

  const toggleSelect = (id: string) => {
    const v = validation.get(id);
    if (!v || v.status !== "success") return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const working = filtered
      .filter((c) => validation.get(c.id)?.status === "success")
      .map((c) => c.id);
    setSelected(new Set(working));
  };

  const clearSelection = () => setSelected(new Set());

  const selectedEntries = allComponents.filter((c) => selected.has(c.id));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* ── Section header ────────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{ background: "linear-gradient(135deg, hsl(20, 50%, 50%), hsl(25, 35%, 70%))" }}
      >
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-xl text-white leading-tight">Component Library</h2>
              <p className="text-white/70 text-xs mt-0.5">
                {allComponents.length} Magic UI components · {validating ? "scanning…" : `${passed} working, ${failed} failed`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
            title={panelOpen ? "Collapse" : "Expand"}
          >
            <motion.span
              animate={{ rotate: panelOpen ? 0 : 180 }}
              transition={{ duration: 0.2 }}
              className="block leading-none text-sm"
            >
              ▾
            </motion.span>
          </button>
        </div>

        {/* Validation progress bar */}
        {validating && (
          <div className="h-0.5 bg-white/10 mx-6 mb-4 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/60 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${allComponents.length > 0 ? ((passed + failed) / allComponents.length) * 100 : 0}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>

      {/* ── Collapsible panel body ─────────────────────────────────────── */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {/* Search + category filters */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search components…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category chips */}
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-colors",
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

            {/* Two-column body */}
            <div
              className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 rounded-2xl overflow-hidden border border-border bg-card"
              style={{ height: "60vh", minHeight: "480px" }}
            >
              {/* ── Left: component list ─────────────────────────────── */}
              <div className="flex flex-col border-r border-border overflow-hidden">
                {/* List header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {filtered.length} components
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAll}
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Select all
                    </button>
                    {selected.size > 0 && (
                      <button
                        onClick={clearSelection}
                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Scrollable list */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  {filtered.length === 0 ? (
                    <p className="px-4 py-6 text-xs text-center text-muted-foreground italic">
                      No components match your filters.
                    </p>
                  ) : (
                    filtered.map((c) => {
                      const v     = validation.get(c.id);
                      const st    = v?.status ?? "pending";
                      const isPrev = preview?.id === c.id;
                      const isSel  = selected.has(c.id);

                      return (
                        <ComponentListRow
                          key={c.id}
                          entry={c}
                          status={st}
                          error={v?.status === "failed" ? v.error : undefined}
                          loadTime={v?.loadTime}
                          isPreviewed={isPrev}
                          isSelected={isSel}
                          onPreview={() => setPreview(c)}
                          onToggleSelect={() => toggleSelect(c.id)}
                        />
                      );
                    })
                  )}
                </div>

                {/* Footer — apply action */}
                <div
                  className="shrink-0 border-t border-border px-4 py-3 flex items-center justify-between"
                  style={{ background: "hsl(45, 40%, 97%)" }}
                >
                  <span className="text-xs text-muted-foreground">
                    {selected.size > 0 ? (
                      <span className="text-foreground font-medium">{selected.size} selected</span>
                    ) : (
                      "No components selected"
                    )}
                  </span>
                  <button
                    disabled={selected.size === 0}
                    onClick={() => setShowApplyModal(true)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      selected.size > 0
                        ? "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    <FolderInput className="w-3.5 h-3.5" />
                    Apply to Project
                  </button>
                </div>
              </div>

              {/* ── Right: preview panel ──────────────────────────────── */}
              <div className="flex flex-col overflow-hidden">
                {preview ? (
                  <>
                    {/* Preview header */}
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
                        {validation.get(preview.id)?.status === "success" && (
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
                        )}
                      </div>
                    </div>

                    {/* Preview area */}
                    <div
                      className="flex-1 overflow-auto flex items-center justify-center p-8"
                      style={{ background: "hsl(40, 33%, 97%)" }}
                    >
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
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Layers className="w-8 h-8 opacity-20" />
                    <p className="text-sm">Select a component to preview</p>
                    <p className="text-xs opacity-60">
                      {validating ? "Scanning…" : `${passed} ready to use`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats row below the panel */}
            <div className="flex items-center gap-4 mt-3 px-1">
              <StatPill label="registered" value={allComponents.length} color="text-muted-foreground" />
              <StatPill label="working"    value={passed}              color="text-emerald-600" />
              <StatPill label="failed"     value={failed}              color={failed > 0 ? "text-destructive" : "text-muted-foreground"} />
              {validating && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  scanning
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Apply modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showApplyModal && (
          <ApplyModal
            entries={selectedEntries}
            onClose={() => setShowApplyModal(false)}
            onApplied={(count) => {
              setShowApplyModal(false);
              clearSelection();
              toast.success(`${count} component${count !== 1 ? "s" : ""} added to project`, {
                description: "Commands copied to clipboard — run in your terminal.",
              });
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── ComponentListRow ─────────────────────────────────────────────────────────

function ComponentListRow({
  entry, status, error, loadTime, isPreviewed, isSelected, onPreview, onToggleSelect,
}: {
  entry:          ComponentEntry;
  status:         ValidationResult["status"];
  error?:         string;
  loadTime?:      number;
  isPreviewed:    boolean;
  isSelected:     boolean;
  onPreview:      () => void;
  onToggleSelect: () => void;
}) {
  const canSelect = status === "success";
  const isFailed  = status === "failed";
  const isPending = status === "pending";

  const dot = {
    success: "bg-emerald-500",
    failed:  "bg-destructive",
    pending: "bg-muted-foreground/30 animate-pulse",
  }[status];

  return (
    <div
      title={isFailed ? `Failed: ${error ?? "unknown error"}` : loadTime ? `${loadTime}ms` : undefined}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors group",
        isPreviewed ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-muted/40 border-l-2 border-transparent",
        isFailed && "opacity-50"
      )}
      onClick={onPreview}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
        disabled={!canSelect}
        className={cn(
          "w-4 h-4 rounded border transition-colors shrink-0 flex items-center justify-center",
          isSelected
            ? "bg-primary border-primary"
            : canSelect
              ? "border-muted-foreground/30 hover:border-primary group-hover:border-primary/50"
              : "border-muted-foreground/20 cursor-not-allowed"
        )}
        aria-label={`Select ${entry.name}`}
      >
        {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
      </button>

      {/* Status dot */}
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />

      {/* Name + category */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-xs font-medium truncate",
          isFailed ? "line-through text-muted-foreground" : "text-foreground"
        )}>
          {entry.name}
        </p>
        <p className="text-[10px] text-muted-foreground/60 capitalize">{entry.category}</p>
      </div>

      {/* Failed badge */}
      {isFailed && (
        <span className="text-[9px] text-destructive bg-destructive/5 border border-destructive/10 px-1.5 py-0.5 rounded shrink-0">
          fail
        </span>
      )}

      {/* Pending shimmer */}
      {isPending && (
        <span className="w-8 h-2.5 bg-muted rounded-full animate-pulse shrink-0" />
      )}
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

  const handleCopy = async () => {
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
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
          <button onClick={onClose} className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Summary */}
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{entries.length} component{entries.length !== 1 ? "s" : ""}</span>{" "}
            will be copied from{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">src/showcase/magic-ui/</code>{" "}
            to{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">src/components/ui/</code>
          </p>

          {/* Component list */}
          <div
            className="rounded-xl border border-border overflow-hidden divide-y divide-border"
            style={{ background: "hsl(45, 40%, 97%)" }}
          >
            {entries.map((e) => (
              <div key={e.id} className="flex items-center gap-2.5 px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-medium flex-1">{e.name}</span>
                <span className="text-[10px] text-muted-foreground/60 font-mono">{e.id}.tsx</span>
              </div>
            ))}
          </div>

          {/* Shell command block */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground font-medium">Terminal commands</p>
            </div>
            <pre
              className="text-[11px] font-mono leading-relaxed bg-foreground/5 border border-border rounded-xl px-4 py-3 overflow-x-auto scrollbar-hide text-foreground/80"
              style={{ maxHeight: "9rem" }}
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
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Commands
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── StatPill ─────────────────────────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className={cn("text-sm font-semibold tabular-nums", color)}>{value}</span>
      <span className="text-xs text-muted-foreground/60">{label}</span>
    </span>
  );
}

// ─── PreviewBoundary (local Error Boundary) ───────────────────────────────────

interface PBProps { name: string; docsUrl?: string; children: ReactNode }
interface PBState { error: Error | null }

class PreviewBoundary extends Component<PBProps, PBState> {
  state: PBState = { error: null };

  static getDerivedStateFromError(e: Error): PBState { return { error: e }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[Admin] Preview failed: ${this.props.name}`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center gap-3 p-6 text-center max-w-xs">
          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-destructive font-bold">!</span>
          </div>
          <div>
            <p className="text-sm font-medium">Failed to render</p>
            <p className="text-xs text-muted-foreground mt-0.5">{this.props.name}</p>
          </div>
          <p className="text-xs font-mono text-destructive/70 bg-destructive/5 rounded px-3 py-2 w-full text-left break-all">
            {this.state.error.message}
          </p>
          {this.props.docsUrl && (
            <a href={this.props.docsUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary hover:underline underline-offset-2">
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
