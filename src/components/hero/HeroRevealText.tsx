import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Undo2 } from "lucide-react";

type Phase = "curiosity" | "relief" | "confidence";

interface HeroRevealTextProps {
  phase: Phase;
  hasInteracted: boolean;
}

export const HeroRevealText = ({ phase, hasInteracted }: HeroRevealTextProps) => {
  return (
    <div className="space-y-6">
      {/* Interactive hint - only show in curiosity phase */}
      <AnimatePresence>
        {phase === "curiosity" && !hasInteracted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 text-muted-foreground"
          >
            <motion.div
              className="w-10 h-10 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.1, 1],
                borderColor: ["hsl(var(--primary) / 0.4)", "hsl(var(--primary) / 0.8)", "hsl(var(--primary) / 0.4)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-lg">👆</span>
            </motion.div>
            <span className="text-sm font-sans">
              Sağdaki tuvale dokunun ve keşfedin
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reversibility indicator - show after first interaction */}
      <AnimatePresence>
        {hasInteracted && phase !== "confidence" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 text-muted-foreground"
          >
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <Undo2 className="w-4 h-4" />
            </div>
            <span className="text-sm font-sans">
              Her şey geri alınabilir — rahatça deneyin
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Buttons - progressive reveal */}
      <AnimatePresence>
        {phase === "confidence" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Button
              size="lg"
              className="group bg-primary hover:bg-primary/90 text-primary-foreground font-sans shadow-organic-glow"
            >
              Koleksiyonu Keşfet
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-sans border-border hover:bg-accent"
            >
              Özel Tasarım İste
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
