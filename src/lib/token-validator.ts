/**
 * Stencil Studio — Token Validator
 *
 * Validates the design system at runtime:
 *  1. CSS variable integrity — checks that all organic vars resolve to non-empty strings
 *  2. Token compliance — reports components that use hardcoded colors
 *  3. Component status audit — counts stable/beta/deprecated/experimental
 */

import {
  colorRaw,
  ORGANIC_COLOR_VARS,
} from "@/design/tokens";

import {
  componentManifest,
  getByStatus,
  getTokenNonCompliant,
  type ComponentManifestEntry,
} from "@/lib/component-manifest";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TokenValidationReport {
  timestamp:          number;
  cssVarsPresent:     string[];   // var names that resolved correctly
  cssVarsMissing:     string[];   // var names that are empty/undefined
  tokenCompliant:     ComponentManifestEntry[];
  tokenNonCompliant:  ComponentManifestEntry[];
  statusSummary: {
    stable:       number;
    beta:         number;
    deprecated:   number;
    experimental: number;
  };
  overallHealth: "healthy" | "warning" | "critical";
  warnings:       string[];
}

// ─── CSS variable check ───────────────────────────────────────────────────────

/**
 * Checks that every organic color CSS variable resolves to a non-empty value.
 * Must run after the DOM is ready (not in SSR).
 */
function checkCSSVars(): { present: string[]; missing: string[] } {
  const present: string[] = [];
  const missing: string[] = [];

  const root = document.documentElement;
  const style = getComputedStyle(root);

  // Check all organic palette vars
  for (const { varName } of ORGANIC_COLOR_VARS) {
    const value = style.getPropertyValue(varName).trim();
    if (value) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  }

  // Also check semantic vars that every component depends on
  const semanticVars = [
    "--background", "--foreground", "--primary", "--primary-foreground",
    "--secondary", "--muted", "--muted-foreground", "--accent",
    "--border", "--ring", "--destructive",
    "--shadow-soft", "--shadow-elevated", "--shadow-glow",
    "--radius",
  ];

  for (const varName of semanticVars) {
    const value = style.getPropertyValue(varName).trim();
    if (value) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  }

  return { present, missing };
}

// ─── Value drift detection ────────────────────────────────────────────────────

/**
 * Checks if any organic color var's resolved H value drifts more than 5 degrees
 * from the canonical value in tokens.ts.
 * Returns warning messages for detected drifts.
 */
function checkValueDrift(): string[] {
  const warnings: string[] = [];
  const root = document.documentElement;
  const style = getComputedStyle(root);

  for (const { key, varName, label } of ORGANIC_COLOR_VARS) {
    const raw = style.getPropertyValue(varName).trim();
    if (!raw) continue;

    // CSS var format: "H S% L%" — parse H as first token
    const hStr = raw.split(" ")[0];
    const h = parseFloat(hStr);
    if (isNaN(h)) continue;

    const canonical = colorRaw[key].h;
    const drift = Math.abs(h - canonical);

    // Allow for theme overrides (ocean, forest, lavender have different hues)
    // Only warn if this looks like an unintentional mismatch (drift > 5 from any known theme)
    if (drift > 5 && drift < 170) {
      // Could be intentional (admin token edit) or accidental — note it
      warnings.push(
        `[${label}] CSS var ${varName} hue (${Math.round(h)}) differs from tokens.ts canonical value (${canonical})`
      );
    }
  }

  return warnings;
}

// ─── Main validator ───────────────────────────────────────────────────────────

export async function runTokenValidation(): Promise<TokenValidationReport> {
  const { present, missing } = checkCSSVars();
  const driftWarnings = checkValueDrift();

  const nonCompliant = getTokenNonCompliant();
  const compliant = componentManifest.filter((c) => c.tokenCompliant);

  const statusSummary = {
    stable:       getByStatus("stable").length,
    beta:         getByStatus("beta").length,
    deprecated:   getByStatus("deprecated").length,
    experimental: getByStatus("experimental").length,
  };

  const warnings: string[] = [
    ...missing.map((v) => `Missing CSS variable: ${v}`),
    ...driftWarnings,
  ];

  if (statusSummary.deprecated > 0) {
    warnings.push(`${statusSummary.deprecated} deprecated component(s) still in the manifest`);
  }

  // Health: critical if any CSS vars missing; warning if non-compliance > 20%; else healthy
  const nonCompliantRatio = nonCompliant.length / componentManifest.length;

  let overallHealth: TokenValidationReport["overallHealth"] = "healthy";
  if (missing.length > 0) {
    overallHealth = "critical";
  } else if (nonCompliantRatio > 0.2 || statusSummary.deprecated > 0) {
    overallHealth = "warning";
  }

  return {
    timestamp:         Date.now(),
    cssVarsPresent:    present,
    cssVarsMissing:    missing,
    tokenCompliant:    compliant,
    tokenNonCompliant: nonCompliant,
    statusSummary,
    overallHealth,
    warnings,
  };
}

// ─── Compliance score helper ──────────────────────────────────────────────────

export function getComplianceScore(report: TokenValidationReport): number {
  const total = report.tokenCompliant.length + report.tokenNonCompliant.length;
  if (total === 0) return 100;
  return Math.round((report.tokenCompliant.length / total) * 100);
}
