/**
 * Admin: Component Management API (scaffold)
 *
 * Imports the registry and validation layer to provide a typed interface
 * for the future admin panel. Stub implementations are marked TODO.
 *
 * Intended usage:
 *   import { createManagementAPI } from "@/admin/components-management";
 *   const mgmt = createManagementAPI();
 *   mgmt.getStats(validationResults); // { total: 64, working: 59, failed: 5, ... }
 */

import { registry, type ComponentEntry, type ComponentCategory } from "@/showcase/registry-config";
import type { ValidationResult } from "@/showcase/validate-components";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ManagementStats {
  total:      number;
  working:    number;
  failed:     number;
  pending:    number;
  byCategory: Partial<Record<ComponentCategory, number>>;
  bySource:   Record<string, number>;
  avgLoadTime: number;
}

export interface ComponentManagementAPI {
  // ── Read ──────────────────────────────────────────────────────────────────
  getAll(): ComponentEntry[];
  getById(id: string): ComponentEntry | undefined;
  getWorking(results: Map<string, ValidationResult>): ComponentEntry[];
  getFailed(results: Map<string, ValidationResult>): ComponentEntry[];
  getPending(results: Map<string, ValidationResult>): ComponentEntry[];
  getStats(results?: Map<string, ValidationResult>): ManagementStats;

  // ── Filtering ─────────────────────────────────────────────────────────────
  getByCategory(category: ComponentCategory): ComponentEntry[];
  getBySource(source: string): ComponentEntry[];
  search(query: string): ComponentEntry[];

  // ── Write (future — not yet implemented) ──────────────────────────────────
  /** TODO: persist to localStorage or API */
  enable(id: string): void;
  /** TODO: persist to localStorage or API */
  disable(id: string): void;

  // ── Plugins (future) ──────────────────────────────────────────────────────
  /**
   * TODO: Load a custom component plugin at runtime.
   * The plugin file must define static import() paths so Vite can chunk them.
   */
  loadPlugin(pluginModulePath: string): Promise<void>;
}

// ─── Implementation ───────────────────────────────────────────────────────────

export function createManagementAPI(): ComponentManagementAPI {
  return {
    getAll: () => registry.getAll(),

    getById: (id) => registry.getById(id),

    getWorking: (results) =>
      registry.getAll().filter((e) => results.get(e.id)?.status === "success"),

    getFailed: (results) =>
      registry.getAll().filter((e) => results.get(e.id)?.status === "failed"),

    getPending: (results) =>
      registry.getAll().filter((e) => {
        const s = results.get(e.id)?.status;
        return !s || s === "pending";
      }),

    getStats: (results) => {
      const all = registry.getAll();
      const vals = results ? [...results.values()] : [];

      const working = vals.filter((r) => r.status === "success").length;
      const failed  = vals.filter((r) => r.status === "failed").length;
      const pending = all.length - working - failed;

      const byCategory = all.reduce<Partial<Record<ComponentCategory, number>>>(
        (acc, e) => ({ ...acc, [e.category]: (acc[e.category] ?? 0) + 1 }),
        {}
      );
      const bySource = all.reduce<Record<string, number>>(
        (acc, e) => ({ ...acc, [e.source]: (acc[e.source] ?? 0) + 1 }),
        {}
      );
      const avgLoadTime = vals.length
        ? Math.round(vals.reduce((s, r) => s + r.loadTime, 0) / vals.length)
        : 0;

      return { total: all.length, working, failed, pending, byCategory, bySource, avgLoadTime };
    },

    getByCategory: (category) => registry.getByCategory(category),

    getBySource: (source) => registry.getBySource(source),

    search: (query) => {
      const q = query.toLowerCase();
      return registry.getAll().filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.tags.some((t) => t.includes(q))
      );
    },

    // ── Stubs for future write operations ──────────────────────────────────
    enable:  (id)  => { console.warn(`[Admin] enable(${id}) — not yet implemented`) },
    disable: (id)  => { console.warn(`[Admin] disable(${id}) — not yet implemented`) },
    loadPlugin: async (_path) => { console.warn("[Admin] loadPlugin — not yet implemented") },
  };
}

// ─── Singleton for convenience ────────────────────────────────────────────────
export const management = createManagementAPI();
