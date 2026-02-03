import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Sparkles, RotateCcw, Check } from "lucide-react";

type Phase = "curiosity" | "relief" | "confidence";

interface InteractiveCanvasProps {
  onFirstInteraction: () => void;
  onExplorationComplete: () => void;
  phase: Phase;
}

const stencilPatterns = [
  { id: "botanical", name: "Botanik", emoji: "🌿" },
  { id: "geometric", name: "Geometrik", emoji: "◇" },
  { id: "mandala", name: "Mandala", emoji: "✿" },
  { id: "minimal", name: "Minimal", emoji: "○" },
];

const colorPalettes = [
  { id: "terracotta", colors: ["#c77b58", "#e8c4a8", "#8b5a3c"] },
  { id: "sage", colors: ["#7d9a78", "#c5d4c0", "#4a5d47"] },
  { id: "ocean", colors: ["#6b8f9c", "#b8d4dc", "#3d5c66"] },
  { id: "sunset", colors: ["#d4a574", "#f2d9c4", "#a67c52"] },
];

export const InteractiveCanvas = ({
  onFirstInteraction,
  onExplorationComplete,
  phase,
}: InteractiveCanvasProps) => {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handlePatternSelect = (patternId: string) => {
    setSelectedPattern(patternId);
    const newCount = interactionCount + 1;
    setInteractionCount(newCount);
    
    if (newCount === 1) {
      onFirstInteraction();
    }
  };

  const handlePaletteSelect = (paletteId: string) => {
    setSelectedPalette(paletteId);
    const newCount = interactionCount + 1;
    setInteractionCount(newCount);
    
    if (newCount === 1) {
      onFirstInteraction();
    }
  };

  const handleReset = () => {
    setSelectedPattern(null);
    setSelectedPalette(null);
    setShowConfirmation(false);
  };

  const handleConfirm = () => {
    setShowConfirmation(true);
    setTimeout(() => {
      onExplorationComplete();
    }, 800);
  };

  const currentPalette = colorPalettes.find((p) => p.id === selectedPalette);
  const canConfirm = selectedPattern && selectedPalette;

  return (
    <div className="relative w-full max-w-lg">
      {/* Main canvas area */}
      <motion.div
        ref={canvasRef}
        className="relative aspect-square rounded-3xl overflow-hidden shadow-organic-elevated"
        style={{
          background: currentPalette
            ? `linear-gradient(135deg, ${currentPalette.colors[1]}, ${currentPalette.colors[0]}40)`
            : "hsl(var(--card))",
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {/* Canvas content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!selectedPattern ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center p-8"
              >
                <motion.div
                  className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center"
                  animate={{ 
                    rotate: 360,
                    borderColor: ["hsl(var(--muted-foreground) / 0.3)", "hsl(var(--primary) / 0.5)", "hsl(var(--muted-foreground) / 0.3)"]
                  }}
                  transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, borderColor: { duration: 3, repeat: Infinity } }}
                >
                  <Sparkles className="w-8 h-8 text-muted-foreground/50" />
                </motion.div>
                <p className="text-muted-foreground text-sm font-sans">
                  Aşağıdan bir desen seçin
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedPattern}
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <motion.div
                  className="text-8xl mb-4"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {stencilPatterns.find((p) => p.id === selectedPattern)?.emoji}
                </motion.div>
                <p className="text-foreground font-serif text-xl">
                  {stencilPatterns.find((p) => p.id === selectedPattern)?.name}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Success overlay */}
        <AnimatePresence>
          {showConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="w-20 h-20 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="w-10 h-10 text-primary-foreground" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Pattern selector */}
      <motion.div
        className="mt-6 flex justify-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {stencilPatterns.map((pattern) => (
          <motion.button
            key={pattern.id}
            onClick={() => handlePatternSelect(pattern.id)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${
              selectedPattern === pattern.id
                ? "bg-primary text-primary-foreground shadow-organic-glow scale-110"
                : "bg-card hover:bg-accent border border-border"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {pattern.emoji}
          </motion.button>
        ))}
      </motion.div>

      {/* Color palette selector */}
      <motion.div
        className="mt-4 flex justify-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Palette className="w-5 h-5 text-muted-foreground self-center mr-2" />
        {colorPalettes.map((palette) => (
          <motion.button
            key={palette.id}
            onClick={() => handlePaletteSelect(palette.id)}
            className={`w-10 h-10 rounded-full overflow-hidden transition-all ${
              selectedPalette === palette.id
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                : ""
            }`}
            style={{
              background: `linear-gradient(135deg, ${palette.colors[0]}, ${palette.colors[1]})`,
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
          />
        ))}
      </motion.div>

      {/* Action buttons */}
      <AnimatePresence>
        {(selectedPattern || selectedPalette) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 flex justify-center gap-4"
          >
            <motion.button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
              Sıfırla
            </motion.button>

            {canConfirm && phase !== "confidence" && (
              <motion.button
                onClick={handleConfirm}
                className="flex items-center gap-2 px-6 py-2 rounded-full text-sm bg-primary text-primary-foreground shadow-organic-glow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Check className="w-4 h-4" />
                Tamam, bu güzel!
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
