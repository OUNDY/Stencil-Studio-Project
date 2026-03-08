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
    <div className={`aspect-square bg-gradient-to-br ${pattern.gradient} relative`}>
      {/* Abstract shape overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="w-2/3 h-2/3 rounded-full border-2 border-foreground/30 rotate-45" />
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
    ? filterPatterns(selectedMood, selectedSurface).slice(0, 9)
    : [];

  return (
    <div className="space-y-10">
      {/* Step 1: Mood */}
      <div>
        <p className="text-sm font-sans text-muted-foreground mb-4 tracking-wide uppercase">
          Step 1 — Choose a mood
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {moods.map((m) => (
            <motion.button
              key={m.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedMood(m.label);
                setSelectedSurface(null);
              }}
              className={`relative rounded-xl overflow-hidden aspect-[4/3] flex flex-col items-center justify-end p-3 transition-all border-2 ${
                selectedMood === m.label
                  ? "border-foreground shadow-organic-elevated"
                  : "border-transparent hover:border-border"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} opacity-60`} />
              <div className="relative z-10 text-center">
                <span className="block text-sm font-sans font-medium text-foreground">{m.label}</span>
                <span className="block text-xs text-muted-foreground">{m.description}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Step 2: Surface — appears after mood */}
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
            <div className="flex flex-wrap gap-3">
              {surfaces.map((s) => (
                <motion.button
                  key={s.label}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedSurface(s.label)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full border text-sm font-sans transition-all ${
                    selectedSurface === s.label
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground hover:border-foreground/40"
                  }`}
                >
                  <span>{s.icon}</span>
                  {s.label}
                </motion.button>
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
