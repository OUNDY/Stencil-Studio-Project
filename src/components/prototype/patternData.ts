export type Mood = "Minimal" | "Bold" | "Organic" | "Geometric" | "Maximalist" | "Handcrafted";
export type Surface = "Wall" | "Fabric" | "Ceramic" | "Apparel" | "Paper" | "Digital";

export interface PatternItem {
  id: number;
  name: string;
  mood: Mood;
  surface: Surface;
  color: string;
}

export const moods: Mood[] = ["Minimal", "Bold", "Organic", "Geometric", "Maximalist", "Handcrafted"];
export const surfaces: Surface[] = ["Wall", "Fabric", "Ceramic", "Apparel", "Paper", "Digital"];

export const patterns: PatternItem[] = [
  { id: 1, name: "Runic Scatter", mood: "Minimal", surface: "Wall", color: "#E8E4DF" },
  { id: 2, name: "Stone Arch", mood: "Geometric", surface: "Wall", color: "#D4CFC9" },
  { id: 3, name: "Leaf Drift", mood: "Organic", surface: "Fabric", color: "#C8D4C0" },
  { id: 4, name: "Grid Bloom", mood: "Bold", surface: "Apparel", color: "#2C2C2C" },
  { id: 5, name: "Rune Circle", mood: "Handcrafted", surface: "Ceramic", color: "#B8C4BE" },
  { id: 6, name: "Hex Flow", mood: "Geometric", surface: "Fabric", color: "#D8D0C8" },
  { id: 7, name: "Wild Stroke", mood: "Maximalist", surface: "Wall", color: "#C4B8A8" },
  { id: 8, name: "Petal Ring", mood: "Organic", surface: "Paper", color: "#D0C8BC" },
  { id: 9, name: "Shadow Mark", mood: "Minimal", surface: "Digital", color: "#E0DCD8" },
];

export function filterPatterns(mood?: Mood, surface?: Surface): PatternItem[] {
  return patterns.filter(
    (p) => (!mood || p.mood === mood) && (!surface || p.surface === surface)
  );
}
