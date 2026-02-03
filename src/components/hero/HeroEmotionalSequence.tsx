import { motion, AnimatePresence } from "framer-motion";

type Phase = "curiosity" | "relief" | "confidence";

interface HeroEmotionalSequenceProps {
  phase: Phase;
}

const phaseContent = {
  curiosity: {
    badge: "Yeni bir yol",
    headline: "Duvarlarınız\nbir tuval bekliyor",
    subtext: "Hiçbir şeyi bozmadan, sadece dokunarak başlayın",
  },
  relief: {
    badge: "Gördünüz mü?",
    headline: "Bu kadar\nkolay işte",
    subtext: "Her adım geri alınabilir. Denemekten korkmayın",
  },
  confidence: {
    badge: "Hazırsınız",
    headline: "Şimdi gerçeğe\ndönüştürme zamanı",
    subtext: "Fiziksel şablon veya dijital dosya — ikisi de sizin için",
  },
};

export const HeroEmotionalSequence = ({ phase }: HeroEmotionalSequenceProps) => {
  const content = phaseContent[phase];

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Phase badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-sans text-secondary-foreground">
              {content.badge}
            </span>
          </motion.div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-foreground leading-[1.1] whitespace-pre-line">
            {content.headline.split("\n").map((line, i) => (
              <motion.span
                key={i}
                className="block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                {line}
              </motion.span>
            ))}
          </h1>

          {/* Subtext */}
          <motion.p
            className="text-lg md:text-xl text-muted-foreground font-sans max-w-md leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {content.subtext}
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
