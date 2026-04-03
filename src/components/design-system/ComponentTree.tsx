import { useState } from "react";
import { ChevronRight, CheckCircle2, AlertCircle, Clock, FlaskConical } from "lucide-react";
import {
  componentManifest,
  CATEGORY_LABELS,
  type ComponentCategory,
  type ComponentManifestEntry,
  type ComponentStatus,
} from "@/lib/component-manifest";
import { UsageBadge } from "./UsageBadge";

const STATUS_ICON: Record<ComponentStatus, React.ReactNode> = {
  stable:       <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />,
  beta:         <Clock        className="w-3 h-3 text-amber-500 shrink-0" />,
  deprecated:   <AlertCircle  className="w-3 h-3 text-destructive shrink-0" />,
  experimental: <FlaskConical className="w-3 h-3 text-blue-500 shrink-0" />,
};

const STATUS_LABEL: Record<ComponentStatus, string> = {
  stable:       "stable",
  beta:         "beta",
  deprecated:   "deprecated",
  experimental: "experimental",
};

function ComponentRow({ entry }: { entry: ComponentManifestEntry }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 hover:bg-accent/40 transition-colors rounded-lg group">
      {/* Status icon */}
      <span title={STATUS_LABEL[entry.status]}>
        {STATUS_ICON[entry.status]}
      </span>

      {/* Name + path */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground truncate">{entry.name}</span>
          {!entry.tokenCompliant && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-200/60 shrink-0">
              tokens
            </span>
          )}
        </div>
        <p className="text-[10px] font-mono text-muted-foreground/50 truncate mt-0.5">
          src/{entry.path}
        </p>
      </div>

      {/* Usage badge */}
      <UsageBadge count={entry.usedOnPages.length} pages={entry.usedOnPages} />
    </div>
  );
}

function CategoryGroup({
  category,
  entries,
  defaultOpen,
}: {
  category: ComponentCategory;
  entries: ComponentManifestEntry[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const stableCount = entries.filter((e) => e.status === "stable").length;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-accent/30 transition-colors"
        style={{ background: "hsl(45, 40%, 97%)" }}
      >
        <div className="flex items-center gap-2.5">
          <ChevronRight
            className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
          />
          <span className="text-sm font-medium text-foreground">
            {CATEGORY_LABELS[category]}
          </span>
          <span className="text-xs text-muted-foreground/60">
            {entries.length} component{entries.length !== 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-[10px] text-emerald-600 font-medium">
          {stableCount} stable
        </span>
      </button>

      {open && (
        <div className="p-2 space-y-0.5">
          {entries.map((entry) => (
            <ComponentRow key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ComponentTreeProps {
  searchQuery?:       string;
  filterCategory?:    ComponentCategory | "all";
  filterStatus?:      ComponentStatus | "all";
  filterCompliance?:  "all" | "compliant" | "non-compliant";
}

/**
 * Filterable, groupable tree view of the entire component manifest.
 * Does not import actual component implementations — reads only static manifest data.
 */
export function ComponentTree({
  searchQuery      = "",
  filterCategory   = "all",
  filterStatus     = "all",
  filterCompliance = "all",
}: ComponentTreeProps) {
  const q = searchQuery.toLowerCase();

  const filtered = componentManifest.filter((c) => {
    if (filterCategory !== "all" && c.category !== filterCategory) return false;
    if (filterStatus   !== "all" && c.status   !== filterStatus)   return false;
    if (filterCompliance === "compliant"     && !c.tokenCompliant)  return false;
    if (filterCompliance === "non-compliant" &&  c.tokenCompliant)  return false;
    if (q && !c.name.toLowerCase().includes(q) &&
             !c.description.toLowerCase().includes(q) &&
             !c.id.includes(q)) return false;
    return true;
  });

  if (filtered.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8 italic">
        No components match your filters.
      </p>
    );
  }

  // Group by category
  const groups: Partial<Record<ComponentCategory, ComponentManifestEntry[]>> = {};
  for (const entry of filtered) {
    if (!groups[entry.category]) groups[entry.category] = [];
    groups[entry.category]!.push(entry);
  }

  const categoryOrder: ComponentCategory[] = [
    "navigation", "hero", "sections", "account",
    "admin", "design-system", "ui-primitive", "magic-ui",
  ];

  const orderedGroups = categoryOrder
    .filter((cat) => groups[cat] && groups[cat]!.length > 0)
    .map((cat) => ({ category: cat, entries: groups[cat]! }));

  return (
    <div className="space-y-2">
      {orderedGroups.map(({ category, entries }, i) => (
        <CategoryGroup
          key={category}
          category={category}
          entries={entries}
          defaultOpen={i < 3}
        />
      ))}
    </div>
  );
}
