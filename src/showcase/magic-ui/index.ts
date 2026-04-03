/**
 * Public surface for the showcase system.
 * Import from here — not from registry-config directly — so the API stays stable.
 */
export type { ComponentEntry as ShowcaseComponent } from "../registry-config";
export { getComponentRegistry } from "../registry-config";

// Evaluated once at module load — returns ComponentEntry[] so all existing
// .map() / .length / .find() usages in the showcase continue to work.
export { registry } from "../registry-config";

import { registry } from "../registry-config";
export const magicUIComponents = registry.getAll();
