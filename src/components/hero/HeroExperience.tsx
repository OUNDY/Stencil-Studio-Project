import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SplineIntro } from "./SplineIntro";
import { StencilCanvas } from "./StencilCanvas";

type Phase = "intro" | "curiosity" | "relief" | "confidence";

interface HeroExperienceProps {
  onPhaseChange?: (phase: Exclude<Phase, "intro">) => void;
}

export const HeroExperience = ({ onPhaseChange }: HeroExperienceProps) => {
  const [phase, setPhase] = useState<Phase>("intro");

  const handleIntroComplete = () => {
    setPhase("curiosity");
    onPhaseChange?.("curiosity");
  };

  const handleFirstInteraction = () => {
    setPhase("relief");
    onPhaseChange?.("relief");
  };

  const handleExplorationComplete = () => {
    setPhase("confidence");
    onPhaseChange?.("confidence");
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">

      {/* ── Spline Intro ── */}
      <AnimatePresence>
        {phase === "intro" && (
          <SplineIntro onComplete={handleIntroComplete} autoSkipMs={4500} />
        )}
      </AnimatePresence>

      {/* ── Canvas — intro biter bitmez mount olur, fade-in ile gelir ── */}
      <AnimatePresence>
        {phase !== "intro" && (
          <motion.div
            key="canvas-scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <StencilCanvas
              embedded
              onFirstInteraction={handleFirstInteraction}
              onExplorationComplete={handleExplorationComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scroll indicator — confidence aşamasında ── */}
      <AnimatePresence>
        {phase === "confidence" && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <motion.div
              className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
