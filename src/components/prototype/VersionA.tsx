import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { moods, surfaces, filterPatterns, type Mood, type Surface, type PatternItem } from "./patternData";

const PatternCard = ({ pattern }: { pattern: PatternItem }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3 }}
    className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden"
  >
    <div
      className="aspect-square relative"
      style={{ backgroundColor: pattern.color }}
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="w-2/3 h-2/3 rounded-full border-2 border-foreground/40 rotate-45" />
      </div>
    </div>
    <div className="p-4 flex items-center justify-between">
      <span className="text-sm font-sans text-foreground">{pattern.name}</span>
      <button className="text-xs font-sans px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
        Use This
      </button>
    </div>
  </motion.div>
);

export const VersionA = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedSurface, setSelectedSurface] = useState<Surface | null>(null);

  const results = selectedMood && selectedSurface
    ? filterPatterns(selectedMood, selectedSurface)
    : selectedMood
    ? filterPatterns(selectedMood)
    : [];

  return (
    <div className="space-y-10">
      {/* Step 1: Mood */}
      <div>
        <p className="text-sm font-sans text-muted-foreground mb-4 tracking-wide uppercase">
          Step 1 — Choose a mood
        </p>
        <div className="flex flex-wrap gap-2">
          {moods.map((m) => (
            <button
              key={m}
              onClick={() => { setSelectedMood(m); setSelectedSurface(null); }}
              className={`px-5 py-2.5 rounded-full text-sm font-sans transition-all border ${
                selectedMood === m
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-foreground hover:border-foreground/40"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Surface */}
      <AnimatePresence>
        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-sm font-sans text-muted-foreground mb-4 tracking-wide uppercase">
              Step 2 — Where will you use it?
            </p>
            <div className="flex flex-wrap gap-2">
              {surfaces.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSurface(s)}
                  className={`px-5 py-2.5 rounded-full text-sm font-sans transition-all border ${
                    selectedSurface === s
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground hover:border-foreground/40"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3: Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-sm font-sans text-muted-foreground mb-4 tracking-wide uppercase">
              Step 3 — Patterns for you
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {results.map((p) => (
                  <PatternCard key={p.id} pattern={p} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
