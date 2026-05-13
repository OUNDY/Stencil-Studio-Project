import { Action, DEFAULT_STATE, TuvalState } from "./types";

export function reducer(state: TuvalState, action: Action): TuvalState {
  switch (action.type) {
    case "SET_SURFACE":
      return { ...state, surface: action.surface };
    case "ADD_MOTIF":
      return {
        ...state,
        motifs: [...state.motifs, action.motif],
        selectedId: action.motif.id,
        selectedZoneId: null,
      };
    case "UPDATE_MOTIF":
      return {
        ...state,
        motifs: state.motifs.map(m =>
          m.id === action.id ? { ...m, ...action.patch } : m
        ),
      };
    case "REMOVE_MOTIF":
      return {
        ...state,
        motifs: state.motifs.filter(m => m.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };
    case "DUPLICATE_MOTIF": {
      const src = state.motifs.find(m => m.id === action.id);
      if (!src) return state;
      const copy = { ...src, id: action.newId, x: Math.min(src.x + 0.05, 0.95), y: Math.min(src.y + 0.05, 0.95) };
      return { ...state, motifs: [...state.motifs, copy], selectedId: copy.id };
    }
    case "SELECT":
      return { ...state, selectedId: action.id, selectedZoneId: action.id ? null : state.selectedZoneId };
    case "REORDER": {
      const idx = state.motifs.findIndex(m => m.id === action.id);
      if (idx < 0) return state;
      const arr = [...state.motifs];
      const [item] = arr.splice(idx, 1);
      let target = idx;
      if (action.direction === "up") target = Math.min(arr.length, idx + 1);
      else if (action.direction === "down") target = Math.max(0, idx - 1);
      else if (action.direction === "top") target = arr.length;
      else target = 0;
      arr.splice(target, 0, item);
      return { ...state, motifs: arr };
    }
    case "SET_GRID":
      return { ...state, gridMode: { ...state.gridMode, ...action.patch } };

    case "ADD_ZONE":
      return {
        ...state,
        zones: [...state.zones, action.zone],
        selectedZoneId: action.zone.id,
        selectedId: null,
      };
    case "UPDATE_ZONE":
      return {
        ...state,
        zones: state.zones.map(z => z.id === action.id ? { ...z, ...action.patch } : z),
      };
    case "UPDATE_ZONE_CORNER":
      return {
        ...state,
        zones: state.zones.map(z => {
          if (z.id !== action.id) return z;
          const corners = [...z.corners] as typeof z.corners;
          corners[action.index] = action.point;
          return { ...z, corners };
        }),
      };
    case "REMOVE_ZONE":
      return {
        ...state,
        zones: state.zones.filter(z => z.id !== action.id),
        // Detach motifs that pointed at this zone
        motifs: state.motifs.map(m => m.zoneId === action.id ? { ...m, zoneId: null } : m),
        selectedZoneId: state.selectedZoneId === action.id ? null : state.selectedZoneId,
      };
    case "DUPLICATE_ZONE": {
      const src = state.zones.find(z => z.id === action.id);
      if (!src) return state;
      const offset = 0.04;
      const copy: typeof src = {
        ...src,
        id: action.newId,
        name: `${src.name} kopya`,
        corners: src.corners.map(p => ({
          x: Math.min(0.98, p.x + offset),
          y: Math.min(0.98, p.y + offset),
        })) as typeof src.corners,
      };
      return { ...state, zones: [...state.zones, copy], selectedZoneId: copy.id };
    }
    case "SELECT_ZONE":
      return { ...state, selectedZoneId: action.id, selectedId: action.id ? null : state.selectedId };

    case "CLEAR":
      return { ...DEFAULT_STATE };
    case "LOAD":
      // backward-compat: older saves may not have zones/selectedZoneId
      return {
        ...DEFAULT_STATE,
        ...action.state,
        zones: action.state.zones ?? [],
        selectedZoneId: action.state.selectedZoneId ?? null,
      };
    default:
      return state;
  }
}

/** Actions that should not push a new history entry (selection/UI-only). */
export const TRANSIENT_ACTIONS = new Set<Action["type"]>(["SELECT", "SELECT_ZONE"]);
