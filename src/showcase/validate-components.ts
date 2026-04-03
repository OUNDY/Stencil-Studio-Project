/**
 * Component Validator
 *
 * Probes each registered component via raw dynamic import() (not React.lazy)
 * so errors are catchable and load times are measurable.
 *
 * Import functions come from registry-config, so this file has no import list
 * to maintain — adding a component to the registry automatically covers it here.
 */

import { registry } from "./registry-config";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ValidationStatus = "pending" | "success" | "failed";

export interface ValidationResult {
  id:       string;
  name:     string;
  status:   ValidationStatus;
  /** Error message if status === "failed" */
  error?:   string;
  /** Wall-clock import time in ms */
  loadTime: number;
}

// ─── Single-component probe ───────────────────────────────────────────────────

async function probeOne(id: string, name: string): Promise<ValidationResult> {
  const entry = registry.getById(id);

  if (!entry) {
    return {
      id, name, status: "failed",
      error: "No entry found in registry — id may be stale",
      loadTime: 0,
    };
  }

  const t0 = performance.now();
  try {
    await entry.importFn();
    const loadTime = Math.round(performance.now() - t0);
    console.log(`[Validator] ✓ ${name} (${loadTime}ms)`);
    return { id, name, status: "success", loadTime };
  } catch (err) {
    const loadTime = Math.round(performance.now() - t0);
    const error    = err instanceof Error ? err.message : String(err);
    console.warn(`[Validator] ✗ ${name}: ${error}`);
    return { id, name, status: "failed", error, loadTime };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Validates all components in `list` in parallel.
 * Calls `onResult` as each resolves (for progressive UI updates).
 * Returns the full results array when everything settles.
 */
export async function validateAll(
  list: Array<{ id: string; name: string }>,
  onResult?: (result: ValidationResult) => void
): Promise<ValidationResult[]> {
  const promises = list.map(async ({ id, name }) => {
    const result = await probeOne(id, name);
    onResult?.(result);
    return result;
  });

  const results = await Promise.all(promises);

  const passed  = results.filter((r) => r.status === "success").length;
  const failed  = results.filter((r) => r.status === "failed").length;
  const avgTime = results.length
    ? Math.round(results.reduce((s, r) => s + r.loadTime, 0) / results.length)
    : 0;

  console.log(`[Validator] Done — ${passed} passed, ${failed} failed, avg ${avgTime}ms`);

  return results;
}
