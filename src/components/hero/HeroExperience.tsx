import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InteractiveCanvas } from "./InteractiveCanvas";
import { HeroEmotionalSequence } from "./HeroEmotionalSequence";
import { HeroRevealText } from "./HeroRevealText";

type Phase = "curiosity" | "relief" | "confidence";

export const HeroExperience = () => {
  const [phase, setPhase] = useState<Phase>("curiosity");
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleFirstInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setPhase("relief");
    }
  };

  const handleExplorationComplete = () => {
    setPhase("confidence");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden texture-grain">
      {/* Background organic shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-accent/30 rounded-organic animate-blob-morph"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <motion.div
          className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-secondary/40 rounded-organic animate-blob-morph"
          style={{ animationDelay: "-4s" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-primary/10 rounded-organic animate-blob-morph"
          style={{ animationDelay: "-2s" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[80vh]">
          {/* Left side: Text content with emotional progression */}
          <motion.div
            className="flex flex-col justify-center space-y-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <HeroEmotionalSequence phase={phase} />
            <HeroRevealText phase={phase} hasInteracted={hasInteracted} />
          </motion.div>

          {/* Right side: Interactive canvas */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <InteractiveCanvas
              onFirstInteraction={handleFirstInteraction}
              onExplorationComplete={handleExplorationComplete}
              phase={phase}
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <AnimatePresence>
        {phase === "confidence" && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <span className="text-sm text-muted-foreground font-sans">
              Keşfetmeye devam et
            </span>
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
