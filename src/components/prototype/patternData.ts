export type Mood = "Minimal" | "Bold" | "Organic" | "Geometric" | "Maximalist" | "Handcrafted";
export type Surface = "Wall" | "Fabric" | "Ceramic" | "Apparel" | "Paper" | "Digital";

export interface PatternItem {
  id: string;
  name: string;
  mood: Mood;
  surface: Surface;
  gradient: string;
}

export const moods: { label: Mood; gradient: string; description: string }[] = [
  { label: "Minimal", gradient: "from-stone-200 to-stone-300", description: "Clean & quiet" },
  { label: "Bold", gradient: "from-amber-300 to-orange-400", description: "Statement pieces" },
  { label: "Organic", gradient: "from-emerald-200 to-teal-300", description: "Nature-inspired" },
  { label: "Geometric", gradient: "from-slate-300 to-zinc-400", description: "Structured forms" },
  { label: "Maximalist", gradient: "from-rose-200 to-pink-300", description: "Rich & layered" },
  { label: "Handcrafted", gradient: "from-amber-200 to-yellow-300", description: "Artisan touch" },
];

export const surfaces: { label: Surface; icon: string }[] = [
  { label: "Wall", icon: "🧱" },
  { label: "Fabric", icon: "🧵" },
  { label: "Ceramic", icon: "🏺" },
  { label: "Apparel", icon: "👕" },
  { label: "Paper", icon: "📄" },
  { label: "Digital", icon: "💻" },
];

/* Generate 54 mock patterns (6 moods × 6 surfaces × ~1.5 each) */
const gradientPool = [
  "from-stone-100 via-stone-200 to-stone-300",
  "from-amber-100 via-amber-200 to-orange-200",
  "from-emerald-100 via-teal-200 to-cyan-200",
  "from-slate-200 via-zinc-300 to-gray-300",
  "from-rose-100 via-pink-200 to-fuchsia-200",
  "from-yellow-100 via-amber-200 to-orange-100",
  "from-sky-100 via-blue-200 to-indigo-200",
  "from-lime-100 via-green-200 to-emerald-200",
  "from-violet-100 via-purple-200 to-pink-200",
];

const namePool: Record<Mood, string[]> = {
  Minimal: ["Hush", "Silence", "Whisper", "Void", "Still", "Drift", "Calm", "Mist", "Echo"],
  Bold: ["Flare", "Surge", "Blaze", "Strike", "Punch", "Edge", "Burst", "Clash", "Ignite"],
  Organic: ["Fern", "Petal", "Moss", "Bloom", "Coral", "Root", "Leaf", "Vine", "Dew"],
  Geometric: ["Grid", "Facet", "Prism", "Axis", "Node", "Lattice", "Tile", "Frame", "Arc"],
  Maximalist: ["Lush", "Opulent", "Gilt", "Velvet", "Plush", "Royal", "Crown", "Revel", "Splendor"],
  Handcrafted: ["Woven", "Stitch", "Clay", "Brush", "Loom", "Knot", "Press", "Carve", "Grain"],
};

export const patterns: PatternItem[] = [];

let id = 0;
for (const mood of moods) {
  for (const surface of surfaces) {
    // 1-2 patterns per combo
    const count = Math.random() > 0.4 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const names = namePool[mood.label];
      patterns.push({
        id: `p-${id++}`,
        name: `${names[id % names.length]} ${surface.label}`,
        mood: mood.label,
        surface: surface.label,
        gradient: gradientPool[id % gradientPool.length],
      });
    }
  }
}

export function filterPatterns(mood?: Mood, surface?: Surface): PatternItem[] {
  return patterns.filter(
    (p) => (!mood || p.mood === mood) && (!surface || p.surface === surface)
  );
}
