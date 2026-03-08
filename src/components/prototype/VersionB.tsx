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

export const VersionB = () => {
  const [selectedMood, setSelectedMood] = useState<Mood>("Minimal");
  const [selectedSurface, setSelectedSurface] = useState<Surface>("Wall");

  const results = filterPatterns(selectedMood, selectedSurface).slice(0, 9);

  return (
    <div className="space-y-8">
      {/* Two-axis filter panel */}
      <div className="grid md:grid-cols-2 gap-6 p-6 rounded-2xl border border-border bg-card/50">
        {/* Mood axis */}
        <div>
          <p className="text-sm font-sans text-muted-foreground mb-3 tracking-wide uppercase">
            Mood
          </p>
          <div className="flex flex-wrap gap-2">
            {moods.map((m) => (
              <button
                key={m.label}
                onClick={() => setSelectedMood(m.label)}
                className={`px-4 py-2 rounded-full text-sm font-sans transition-all border ${
                  selectedMood === m.label
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-foreground hover:border-foreground/40"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Surface axis */}
        <div>
          <p className="text-sm font-sans text-muted-foreground mb-3 tracking-wide uppercase">
            Surface
          </p>
          <div className="flex flex-wrap gap-2">
            {surfaces.map((s) => (
              <button
                key={s.label}
                onClick={() => setSelectedSurface(s.label)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-sans transition-all border ${
                  selectedSurface === s.label
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-foreground hover:border-foreground/40"
                }`}
              >
                <span className="text-xs">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live results */}
      <div>
        <p className="text-sm font-sans text-muted-foreground mb-4">
          {results.length} pattern{results.length !== 1 ? "s" : ""} found
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {results.map((p) => (
              <PatternCard key={p.id} pattern={p} />
            ))}
          </AnimatePresence>
        </div>
        {results.length === 0 && (
          <p className="text-center text-muted-foreground font-sans py-12">
            No patterns match this combination yet.
          </p>
        )}
      </div>
    </div>
  );
};
