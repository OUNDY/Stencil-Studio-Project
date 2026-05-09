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
      return { ...state, selectedId: action.id };
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
    case "CLEAR":
      return { ...DEFAULT_STATE };
    case "LOAD":
      return action.state;
    default:
      return state;
  }
}

/** Actions that should not push a new history entry (selection/UI-only). */
export const TRANSIENT_ACTIONS = new Set<Action["type"]>(["SELECT"]);
