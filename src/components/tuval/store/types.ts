export type SurfaceId = "duvar" | "ahsap" | "beton" | "beyaz";

export interface MotifSource {
  /** Stable id (e.g. preset motif id, or custom-XXXX) */
  id: string;
  name: string;
  /** Image URL (PNG) — preferred for masking */
  imageUrl?: string;
  /** Inline SVG string fallback */
  svg?: string;
}

export interface MotifInstance {
  id: string;            // unique instance id
  sourceId: string;      // points to MotifSource.id (cached in registry)
  name: string;
  imageUrl: string;      // resolved data url or asset url for mask
  x: number;             // 0..1 normalized center
  y: number;
  scale: number;         // 0.05..1 (relative to canvas width)
  rotation: number;      // degrees
  color: string;         // hex
  opacity: number;       // 0..1
  visible: boolean;
  locked: boolean;
}

export interface TuvalState {
  surface: SurfaceId;
  motifs: MotifInstance[];
  selectedId: string | null;
  /** Repeat-grid mode places the active motif as a tiled background */
  gridMode: {
    enabled: boolean;
    sourceId: string | null;
    imageUrl: string | null;
    color: string;
    opacity: number;
    density: number;     // tiles across canvas width (4..20)
  };
}

export const DEFAULT_STATE: TuvalState = {
  surface: "duvar",
  motifs: [],
  selectedId: null,
  gridMode: {
    enabled: false,
    sourceId: null,
    imageUrl: null,
    color: "#3d3530",
    opacity: 0.85,
    density: 8,
  },
};

export type Action =
  | { type: "SET_SURFACE"; surface: SurfaceId }
  | { type: "ADD_MOTIF"; motif: MotifInstance }
  | { type: "UPDATE_MOTIF"; id: string; patch: Partial<MotifInstance> }
  | { type: "REMOVE_MOTIF"; id: string }
  | { type: "DUPLICATE_MOTIF"; id: string; newId: string }
  | { type: "SELECT"; id: string | null }
  | { type: "REORDER"; id: string; direction: "up" | "down" | "top" | "bottom" }
  | { type: "SET_GRID"; patch: Partial<TuvalState["gridMode"]> }
  | { type: "CLEAR" }
  | { type: "LOAD"; state: TuvalState };
