export type SurfaceId = "duvar" | "ahsap" | "beton" | "beyaz" | "tugla" | "oda";

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
  x: number;             // 0..1 normalized center (in zone-space if zoneId set, else stage-space)
  y: number;
  scale: number;         // 0.05..1 (relative to canvas/zone width)
  rotation: number;      // degrees
  color: string;         // hex
  opacity: number;       // 0..1
  visible: boolean;
  locked: boolean;
  /** Perspective: derece cinsinden 3D X/Y dönüşü (-60..60) */
  perspX?: number;
  perspY?: number;
  /** Skew (eğim) X/Y, derece (-45..45) */
  skewX?: number;
  skewY?: number;
  /** Eğer set ise motif bu zone'un perspektif düzleminde render olur. */
  zoneId?: string | null;
}

export type Pt = { x: number; y: number };

export interface ZoneGridOverride {
  density?: number;     // 3..20
  color?: string;       // hex
  opacity?: number;     // 0..1
}

export interface PaintZone {
  id: string;
  name: string;
  /** Normalize (0..1) tuval koordinatında 4 köşe — TL, TR, BR, BL */
  corners: [Pt, Pt, Pt, Pt];
  fillColor: string | null;     // null = düz boya yok
  fillOpacity: number;          // 0..1
  useGrid: boolean;             // grid bu alana clip-lensin mi
  /** Bu alana özel grid ayarları — set olmayan alanlar global grid'den miras alınır. */
  gridOverride?: ZoneGridOverride;
  visible: boolean;
}

export interface TuvalState {
  surface: SurfaceId;
  motifs: MotifInstance[];
  zones: PaintZone[];
  selectedId: string | null;          // motif seçimi
  selectedZoneId: string | null;      // alan seçimi
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
  zones: [],
  selectedId: null,
  selectedZoneId: null,
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
  | { type: "ADD_ZONE"; zone: PaintZone }
  | { type: "UPDATE_ZONE"; id: string; patch: Partial<PaintZone> }
  | { type: "UPDATE_ZONE_CORNER"; id: string; index: 0 | 1 | 2 | 3; point: Pt }
  | { type: "REMOVE_ZONE"; id: string }
  | { type: "DUPLICATE_ZONE"; id: string; newId: string }
  | { type: "SELECT_ZONE"; id: string | null }
  | { type: "CLEAR" }
  | { type: "LOAD"; state: TuvalState };
