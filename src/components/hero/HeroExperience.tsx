import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SurfaceReveal } from "./SurfaceReveal";

type Phase = "curiosity" | "relief" | "confidence";

interface HeroExperienceProps {
  onPhaseChange?: (phase: Phase) => void;
}

export const HeroExperience = ({ onPhaseChange }: HeroExperienceProps) => {
  const [phase, setPhase] = useState<Phase>("curiosity");

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
      <SurfaceReveal
        onFirstInteraction={handleFirstInteraction}
        onExplorationComplete={handleExplorationComplete}
      />

      {/* Scroll indicator - appears after exploration */}
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
