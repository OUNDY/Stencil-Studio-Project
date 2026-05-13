import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { reducer, TRANSIENT_ACTIONS } from "./reducer";
import { Action, DEFAULT_STATE, TuvalState } from "./types";
import { loadAutosave, saveAutosave } from "./persistence";

interface History {
  past: TuvalState[];
  future: TuvalState[];
}

interface Ctx {
  state: TuvalState;
  dispatch: (a: Action) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: () => void;
}

const TuvalCtx = createContext<Ctx | null>(null);

const HISTORY_LIMIT = 50;

export function TuvalProvider({ children, initial }: { children: ReactNode; initial?: TuvalState }) {
  const [state, dispatchBase] = useReducer(reducer, initial ?? DEFAULT_STATE);
  const [history, setHistory] = useState<History>({ past: [], future: [] });
  const stateRef = useRef(state);
  stateRef.current = state;

  const dispatch = useCallback((action: Action) => {
    if (!TRANSIENT_ACTIONS.has(action.type)) {
      setHistory(h => ({
        past: [...h.past, stateRef.current].slice(-HISTORY_LIMIT),
        future: [],
      }));
    }
    dispatchBase(action);
  }, []);

  const undo = useCallback(() => {
    setHistory(h => {
      if (h.past.length === 0) return h;
      const prev = h.past[h.past.length - 1];
      const newPast = h.past.slice(0, -1);
      const current = stateRef.current;
      dispatchBase({ type: "LOAD", state: prev });
      return { past: newPast, future: [current, ...h.future].slice(0, HISTORY_LIMIT) };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(h => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      const newFuture = h.future.slice(1);
      const current = stateRef.current;
      dispatchBase({ type: "LOAD", state: next });
      return { past: [...h.past, current].slice(-HISTORY_LIMIT), future: newFuture };
    });
  }, []);

  const reset = useCallback(() => {
    setHistory(h => ({ past: [...h.past, stateRef.current].slice(-HISTORY_LIMIT), future: [] }));
    dispatchBase({ type: "CLEAR" });
  }, []);

  // Autosave (debounced)
  useEffect(() => {
    const t = setTimeout(() => saveAutosave(state), 800);
    return () => clearTimeout(t);
  }, [state]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement | null;
      const inField = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (inField) return;
      if (meta && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      else if (meta && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) { e.preventDefault(); redo(); }
      else if (e.key === "Delete" || e.key === "Backspace") {
        const selM = stateRef.current.selectedId;
        const selZ = stateRef.current.selectedZoneId;
        if (selM) { e.preventDefault(); dispatch({ type: "REMOVE_MOTIF", id: selM }); }
        else if (selZ) { e.preventDefault(); dispatch({ type: "REMOVE_ZONE", id: selZ }); }
      } else if (meta && e.key.toLowerCase() === "d") {
        const selM = stateRef.current.selectedId;
        const selZ = stateRef.current.selectedZoneId;
        if (selM) { e.preventDefault(); dispatch({ type: "DUPLICATE_MOTIF", id: selM, newId: `m-${Date.now()}` }); }
        else if (selZ) { e.preventDefault(); dispatch({ type: "DUPLICATE_ZONE", id: selZ, newId: `z-${Date.now()}` }); }
      } else if (e.key === "Escape") {
        dispatch({ type: "SELECT", id: null });
        dispatch({ type: "SELECT_ZONE", id: null });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, dispatch]);

  const value = useMemo<Ctx>(() => ({
    state, dispatch, undo, redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    reset,
  }), [state, dispatch, undo, redo, history.past.length, history.future.length, reset]);

  return <TuvalCtx.Provider value={value}>{children}</TuvalCtx.Provider>;
}

export function useTuval() {
  const ctx = useContext(TuvalCtx);
  if (!ctx) throw new Error("useTuval must be inside TuvalProvider");
  return ctx;
}

export { loadAutosave };
