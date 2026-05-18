import { useSyncExternalStore } from "react";

const KEY = "tuval:snap:v1";
let snap = (() => { try { return localStorage.getItem(KEY) !== "0"; } catch { return true; } })();
const subs = new Set<() => void>();

export const snapStore = {
  get: () => snap,
  set: (v: boolean) => {
    snap = v;
    try { localStorage.setItem(KEY, v ? "1" : "0"); } catch { /* noop */ }
    subs.forEach(f => f());
  },
  subscribe: (cb: () => void) => { subs.add(cb); return () => { subs.delete(cb); }; },
};

export function useSnap() {
  return useSyncExternalStore(snapStore.subscribe, snapStore.get, () => true);
}

/** Snap a normalized 0..1 value to the nearest step (default 0.02). */
export function snapToStep(v: number, step = 0.02) {
  return Math.round(v / step) * step;
}

/**
 * Given a point being dragged and a list of reference points, snap to
 * matching x or y when within `threshold` (normalized). Returns new point.
 */
export function alignToPoints(p: { x: number; y: number }, refs: { x: number; y: number }[], threshold = 0.015) {
  let nx = p.x, ny = p.y;
  for (const r of refs) {
    if (Math.abs(r.x - nx) < threshold) nx = r.x;
    if (Math.abs(r.y - ny) < threshold) ny = r.y;
  }
  return { x: nx, y: ny };
}
