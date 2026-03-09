import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StencilCanvas } from "./StencilCanvas";
import { StyleSelection, type StyleType } from "./StyleSelection";
import { WallMotifDemo } from "./WallMotifDemo";

type Phase = "curiosity" | "relief" | "confidence" | "style-select" | "motif-demo";

interface HeroExperienceProps {
  onPhaseChange?: (phase: string) => void;
}

export const HeroExperience = ({ onPhaseChange }: HeroExperienceProps) => {
  const [phase, setPhase] = useState<Phase>("curiosity");
  const [selectedStyle, setSelectedStyle] = useState<StyleType>("organic");

  const handleFirstInteraction = () => {
    setPhase("relief");
    onPhaseChange?.("relief");
  };

  const handleExplorationComplete = () => {
    setPhase("style-select");
    onPhaseChange?.("confidence");
  };

  const handleStyleSelect = (style: StyleType) => {
    setSelectedStyle(style);
    setTimeout(() => {
      setPhase("motif-demo");
    }, 400);
  };

  return (
    <>
      {/* Hero canvas section */}
      <section className="relative h-screen w-full overflow-hidden">
        <StencilCanvas
          onFirstInteraction={handleFirstInteraction}
          onExplorationComplete={handleExplorationComplete}
        />

        {/* Scroll indicator */}
        <AnimatePresence>
          {phase === "style-select" && (
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

      {/* Style Selection - appears after hero painting */}
      <AnimatePresence>
        {(phase === "style-select" || phase === "motif-demo") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-background"
          >
            {phase === "style-select" && (
              <StyleSelection onSelect={handleStyleSelect} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motif Demo - appears after style selection */}
      <AnimatePresence>
        {phase === "motif-demo" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-background"
          >
            <WallMotifDemo selectedStyle={selectedStyle} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
