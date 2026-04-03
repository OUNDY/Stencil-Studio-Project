import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  FlaskConical,
  Layers,
  Palette,
  RefreshCw,
  Route,
  Search,
  Shield,
  XCircle,
} from "lucide-react";
import { tokens, ORGANIC_COLOR_VARS } from "@/design/tokens";
import { componentManifest, CATEGORY_LABELS, type ComponentCategory, type ComponentStatus } from "@/lib/component-manifest";
import { pageDependencyMap } from "@/lib/page-components";
import { runTokenValidation, getComplianceScore, type TokenValidationReport } from "@/lib/token-validator";
import { TokenEditor } from "@/components/design-system/TokenEditor";
import { ComponentTree } from "@/components/design-system/ComponentTree";
import { TokenSwatch } from "@/components/design-system/TokenSwatch";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminTab = "tokens" | "components" | "usage" | "validation";

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminDesignSystem() {
  const [activeTab, setActiveTab] = useState<AdminTab>("tokens");

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(20, 50%, 50%), hsl(140, 25%, 40%))" }}
      >
        <div className="px-6 py-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-white leading-tight">Design System</h2>
            <p className="text-white/70 text-xs mt-0.5">
              {componentManifest.length} components · {ORGANIC_COLOR_VARS.length} brand colors · {pageDependencyMap.length} routes
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex gap-1">
        {(
          [
            { id: "tokens",     icon: Palette,       label: "Design Tokens"  },
            { id: "components", icon: Layers,        label: "Bileşenler"     },
            { id: "usage",      icon: Route,         label: "Kullanım"       },
            { id: "validation", icon: Shield,        label: "Doğrulama"      },
          ] as const
        ).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "tokens"     && <TokensPanel />}
        {activeTab === "components" && <ComponentsPanel />}
        {activeTab === "usage"      && <UsagePanel />}
        {activeTab === "validation" && <ValidationPanel />}
      </div>
    </motion.div>
  );
}

// ─── Tokens Panel ─────────────────────────────────────────────────────────────

function TokensPanel() {
  const [section, setSection] = useState<"colors" | "typography" | "spacing" | "effects">("colors");

  return (
    <div className="space-y-6">
      {/* Section switcher */}
      <div className="flex gap-2 flex-wrap">
        {(["colors", "typography", "spacing", "effects"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              section === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {section === "colors"     && <ColorsSection />}
      {section === "typography" && <TypographySection />}
      {section === "spacing"    && <SpacingSection />}
      {section === "effects"    && <EffectsSection />}
    </div>
  );
}

function ColorsSection() {
  return (
    <div className="space-y-8">
      {/* Live swatches */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">Organic Palette</h3>
        <div className="flex flex-wrap gap-6">
          {ORGANIC_COLOR_VARS.map(({ varName, label }) => (
            <TokenSwatch key={varName} varName={varName} label={label} size="lg" />
          ))}
        </div>
      </div>

      {/* Semantic colors row */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">Semantic Colors</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { varName: "--background",  label: "Background"  },
            { varName: "--foreground",  label: "Foreground"  },
            { varName: "--primary",     label: "Primary"     },
            { varName: "--secondary",   label: "Secondary"   },
            { varName: "--muted",       label: "Muted"       },
            { varName: "--accent",      label: "Accent"      },
            { varName: "--border",      label: "Border"      },
            { varName: "--destructive", label: "Destructive" },
          ].map(({ varName, label }) => (
            <TokenSwatch key={varName} varName={varName} label={label} size="md" />
          ))}
        </div>
      </div>

      {/* Live editor */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">Live Token Editor</h3>
        <div className="max-w-lg">
          <TokenEditor
            onSaved={() => {
              // Could show toast here via parent context, but kept self-contained
            }}
          />
        </div>
      </div>
    </div>
  );
}

function TypographySection() {
  return (
    <div className="space-y-6">
      {/* Font families */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">Font Families</h3>
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">font-serif — Cormorant Garamond</p>
            <p className="font-serif text-2xl text-foreground">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">font-sans — DM Sans</p>
            <p className="font-sans text-lg text-foreground">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">font-mono</p>
            <p className="font-mono text-base text-foreground">const design = system.tokens.color.primary</p>
          </div>
        </div>
      </div>

      {/* Type scale */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">Type Scale</h3>
        <div className="space-y-2 p-4 rounded-xl border border-border bg-card">
          {Object.entries(tokens.fontSize).map(([key, value]) => (
            <div key={key} className="flex items-baseline gap-4">
              <span className="text-[10px] font-mono text-muted-foreground w-12 shrink-0">{key}</span>
              <span className="text-[10px] font-mono text-muted-foreground/50 w-16 shrink-0">{value}</span>
              <span style={{ fontSize: value }} className="text-foreground font-sans leading-tight truncate">
                Stencil Studio
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SpacingSection() {
  const entries = Object.entries(tokens.space).filter(([k]) => !isNaN(Number(k))).slice(0, 20);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Spacing Scale (4px base)</h3>
      <div className="p-4 rounded-xl border border-border bg-card space-y-2">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-muted-foreground w-8 shrink-0">{key}</span>
            <span className="text-[10px] font-mono text-muted-foreground/50 w-12 shrink-0">{value}</span>
            <div
              className="bg-primary/30 h-3 rounded-sm shrink-0"
              style={{ width: value }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function EffectsSection() {
  return (
    <div className="space-y-6">
      {/* Shadows */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">Shadows</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(tokens.shadow).filter(([k]) => !k.startsWith("--")).map(([key, value]) => (
            <div key={key} className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 rounded-xl bg-card border border-border"
                style={{ boxShadow: value }}
              />
              <span className="text-[10px] font-mono text-muted-foreground">{key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Border radius */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">Border Radius</h3>
        <div className="flex flex-wrap gap-4 items-end">
          {(["none", "sm", "md", "lg", "xl", "2xl", "3xl", "full"] as const).map((key) => (
            <div key={key} className="flex flex-col items-center gap-2">
              <div
                className="w-12 h-12 bg-primary/20 border border-primary/30"
                style={{ borderRadius: tokens.radius[key] }}
              />
              <span className="text-[10px] font-mono text-muted-foreground">{key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Easing */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">Animation Easings</h3>
        <div className="space-y-2 p-4 rounded-xl border border-border bg-card">
          {Object.entries(tokens.easing).map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-muted-foreground w-24 shrink-0">{key}</span>
              <span className="text-[10px] font-mono text-muted-foreground/50 flex-1 truncate">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Components Panel ─────────────────────────────────────────────────────────

function ComponentsPanel() {
  const [search,      setSearch]      = useState("");
  const [category,    setCategory]    = useState<ComponentCategory | "all">("all");
  const [status,      setStatus]      = useState<ComponentStatus | "all">("all");
  const [compliance,  setCompliance]  = useState<"all" | "compliant" | "non-compliant">("all");
  const [statsOpen,   setStatsOpen]   = useState(true);

  const categoryOptions: Array<{ id: ComponentCategory | "all"; label: string }> = [
    { id: "all",          label: "All"          },
    { id: "navigation",   label: "Navigation"   },
    { id: "hero",         label: "Hero"         },
    { id: "sections",     label: "Sections"     },
    { id: "admin",        label: "Admin"        },
    { id: "account",      label: "Account"      },
    { id: "design-system",label: "Design Sys"   },
    { id: "ui-primitive", label: "UI / shadcn"  },
  ];

  const total      = componentManifest.length;
  const stable     = componentManifest.filter((c) => c.status === "stable").length;
  const beta       = componentManifest.filter((c) => c.status === "beta").length;
  const compliant  = componentManifest.filter((c) => c.tokenCompliant).length;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <button
        onClick={() => setStatsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-border bg-card/50 text-xs text-muted-foreground hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span><strong className="text-foreground">{total}</strong> total</span>
          <span><strong className="text-emerald-600">{stable}</strong> stable</span>
          <span><strong className="text-amber-600">{beta}</strong> beta</span>
          <span><strong className="text-primary">{compliant}</strong> token-compliant</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${statsOpen ? "" : "-rotate-90"}`} />
      </button>

      {/* Filters */}
      <div className="space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search components…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-1.5">
          {categoryOptions.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                category === c.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Status + compliance row */}
        <div className="flex flex-wrap gap-2">
          {(["all", "stable", "beta", "deprecated", "experimental"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium capitalize transition-colors ${
                status === s
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {s}
            </button>
          ))}
          <span className="w-px h-4 bg-border self-center mx-1" />
          {(["all", "compliant", "non-compliant"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCompliance(c)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                compliance === c
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Tree */}
      <ComponentTree
        searchQuery={search}
        filterCategory={category}
        filterStatus={status}
        filterCompliance={compliance}
      />
    </div>
  );
}

// ─── Usage Panel ──────────────────────────────────────────────────────────────

function UsagePanel() {
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground mb-4">
        {pageDependencyMap.length} routes · click a route to see its component list
      </p>

      {pageDependencyMap.map((page) => {
        const isOpen = expandedRoute === page.route;
        return (
          <div key={page.route} className="border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedRoute(isOpen ? null : page.route)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors text-left"
              style={{ background: isOpen ? "hsl(45, 40%, 97%)" : undefined }}
            >
              <div className="flex items-center gap-3">
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isOpen ? "" : "-rotate-90"}`}
                />
                <div>
                  <span className="text-sm font-medium text-foreground">{page.pageName}</span>
                  <span className="ml-2 text-xs font-mono text-muted-foreground/60">{page.route}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {page.isProtected && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-200/60">
                    auth
                  </span>
                )}
                {page.lazyLoaded && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 border border-blue-200/60">
                    lazy
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {page.components.length} components
                </span>
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-3 pt-1">
                <p className="text-[10px] font-mono text-muted-foreground mb-2">
                  {page.pageFile}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {page.components.map((id) => (
                    <span
                      key={id}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono"
                    >
                      {id}
                    </span>
                  ))}
                  {page.components.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">Dynamic imports only</span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Validation Panel ─────────────────────────────────────────────────────────

function ValidationPanel() {
  const [report,   setReport]   = useState<TokenValidationReport | null>(null);
  const [loading,  setLoading]  = useState(false);

  const runValidation = async () => {
    setLoading(true);
    const result = await runTokenValidation();
    setReport(result);
    setLoading(false);
  };

  const score = report ? getComplianceScore(report) : null;

  const healthColor = {
    healthy:  "text-emerald-600 bg-emerald-500/10 border-emerald-200",
    warning:  "text-amber-600 bg-amber-500/10 border-amber-200",
    critical: "text-destructive bg-destructive/10 border-destructive/20",
  };

  const healthIcon = {
    healthy:  <CheckCircle2 className="w-4 h-4" />,
    warning:  <AlertTriangle className="w-4 h-4" />,
    critical: <XCircle className="w-4 h-4" />,
  };

  return (
    <div className="space-y-6">
      {/* Run button */}
      <div className="flex items-center gap-4">
        <button
          onClick={runValidation}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Validating…" : "Run Validation"}
        </button>
        {report && (
          <span className="text-xs text-muted-foreground">
            Last run: {new Date(report.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>

      {!report && !loading && (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <Shield className="w-8 h-8 opacity-20" />
          <p className="text-sm">Run validation to check design token health</p>
        </div>
      )}

      {report && (
        <div className="space-y-4">
          {/* Health badge */}
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium ${healthColor[report.overallHealth]}`}>
            {healthIcon[report.overallHealth]}
            System is <span className="capitalize">{report.overallHealth}</span>
            {score !== null && (
              <span className="ml-auto text-xs font-normal">
                {score}% token-compliant
              </span>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="CSS Vars OK"    value={report.cssVarsPresent.length} color="text-emerald-600" />
            <StatCard label="CSS Vars Missing" value={report.cssVarsMissing.length} color={report.cssVarsMissing.length > 0 ? "text-destructive" : "text-muted-foreground"} />
            <StatCard label="Token-Compliant" value={report.tokenCompliant.length}    color="text-emerald-600" />
            <StatCard label="Non-Compliant"   value={report.tokenNonCompliant.length} color={report.tokenNonCompliant.length > 0 ? "text-amber-600" : "text-muted-foreground"} />
          </div>

          {/* Status summary */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-xs font-medium text-foreground mb-3">Component Status</p>
            <div className="flex items-center gap-4 flex-wrap">
              <StatusPill icon={<CheckCircle2 className="w-3 h-3 text-emerald-500" />} label="Stable"       value={report.statusSummary.stable} />
              <StatusPill icon={<FlaskConical className="w-3 h-3 text-amber-500" />}  label="Beta"         value={report.statusSummary.beta} />
              <StatusPill icon={<AlertTriangle className="w-3 h-3 text-red-500" />}   label="Deprecated"   value={report.statusSummary.deprecated} />
              <StatusPill icon={<FlaskConical className="w-3 h-3 text-blue-500" />}   label="Experimental" value={report.statusSummary.experimental} />
            </div>
          </div>

          {/* Warnings */}
          {report.warnings.length > 0 && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 space-y-1.5">
              <p className="text-xs font-medium text-amber-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {report.warnings.length} warning{report.warnings.length !== 1 ? "s" : ""}
              </p>
              {report.warnings.map((w, i) => (
                <p key={i} className="text-[11px] text-amber-700/80 font-mono">{w}</p>
              ))}
            </div>
          )}

          {/* Non-compliant components */}
          {report.tokenNonCompliant.length > 0 && (
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-xs font-medium text-foreground mb-3">Non-Compliant Components</p>
              <div className="space-y-1">
                {report.tokenNonCompliant.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-xs font-medium text-foreground">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground/60 font-mono flex-1 truncate">
                      {c.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-3 rounded-xl border border-border bg-card text-center">
      <p className={`text-2xl font-serif tabular-nums ${color}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function StatusPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <span className="flex items-center gap-1.5 text-xs">
      {icon}
      <span className="font-medium tabular-nums">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}
