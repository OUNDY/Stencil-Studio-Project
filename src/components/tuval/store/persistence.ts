import { TuvalState } from "./types";

const AUTOSAVE_KEY = "tuval:autosave:v2";
const PROJECTS_KEY = "tuval:projects:v2";

export interface SavedProject {
  id: string;
  name: string;
  updatedAt: number;
  state: TuvalState;
}

export function loadAutosave(): TuvalState | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    return raw ? (JSON.parse(raw) as TuvalState) : null;
  } catch { return null; }
}

export function saveAutosave(state: TuvalState) {
  try { localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

export function clearAutosave() {
  try { localStorage.removeItem(AUTOSAVE_KEY); } catch { /* noop */ }
}

export function loadProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? (JSON.parse(raw) as SavedProject[]) : [];
  } catch { return []; }
}

export function saveProject(name: string, state: TuvalState): SavedProject {
  const projects = loadProjects();
  const id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const project: SavedProject = { id, name, updatedAt: Date.now(), state };
  projects.unshift(project);
  try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects.slice(0, 30))); } catch { /* quota */ }
  return project;
}

export function deleteProject(id: string) {
  const projects = loadProjects().filter(p => p.id !== id);
  try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects)); } catch { /* noop */ }
}
