import { useState } from "react";
import { motion } from "framer-motion";

export type StyleType = "minimal" | "bold" | "organic" | "geometric" | "maximalist" | "handcrafted";

interface StyleOption {
  id: StyleType;
  label: string;
  description: string;
  icon: string;
  colors: string[];
}

const styleOptions: StyleOption[] = [
  {
    id: "minimal",
    label: "Minimalist",
    description: "Sade çizgiler, az detay",
    icon: "◯",
    colors: ["hsl(40, 20%, 95%)", "hsl(30, 10%, 40%)", "hsl(0, 0%, 85%)"],
  },
  {
    id: "bold",
    label: "Cesur",
    description: "Güçlü kontrastlar, dikkat çekici",
    icon: "◆",
    colors: ["hsl(20, 60%, 50%)", "hsl(350, 50%, 45%)", "hsl(45, 80%, 55%)"],
  },
  {
    id: "organic",
    label: "Organik",
    description: "Doğal formlar, yumuşak geçişler",
    icon: "❋",
    colors: ["hsl(140, 25%, 45%)", "hsl(35, 40%, 65%)", "hsl(25, 50%, 55%)"],
  },
  {
    id: "geometric",
    label: "Geometrik",
    description: "Keskin hatlar, simetrik desenler",
    icon: "◇",
    colors: ["hsl(220, 30%, 50%)", "hsl(200, 25%, 65%)", "hsl(180, 20%, 75%)"],
  },
  {
    id: "maximalist",
    label: "Maksimalist",
    description: "Bol detay, zengin katmanlar",
    icon: "✦",
    colors: ["hsl(300, 40%, 50%)", "hsl(25, 55%, 55%)", "hsl(45, 70%, 60%)"],
  },
  {
    id: "handcrafted",
    label: "El Yapımı",
    description: "Zanaatkâr dokunuşu, otantik",
    icon: "✿",
    colors: ["hsl(25, 45%, 55%)", "hsl(35, 30%, 70%)", "hsl(15, 50%, 45%)"],
  },
];

interface StyleSelectionProps {
  onSelect: (style: StyleType) => void;
}

export const StyleSelection = ({ onSelect }: StyleSelectionProps) => {
  const [hoveredStyle, setHoveredStyle] = useState<StyleType | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleType | null>(null);

  const handleSelect = (style: StyleType) => {
    setSelectedStyle(style);
    setTimeout(() => onSelect(style), 600);
  };

  return (
    <motion.div
      className="w-full py-20 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className="font-serif text-3xl md:text-5xl text-foreground mb-3">
            Tarzını Keşfet
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
            Sana en yakın hissettiren stili seç, duvarlarını ona göre hayal edelim.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {styleOptions.map((style, index) => {
            const isSelected = selectedStyle === style.id;
            const isHovered = hoveredStyle === style.id;

            return (
              <motion.button
                key={style.id}
                className={`group relative rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                  isSelected
                    ? "border-primary bg-primary/5 scale-[0.97]"
                    : "border-border hover:border-primary/40 bg-card"
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.08, duration: 0.5 }}
                onMouseEnter={() => setHoveredStyle(style.id)}
                onMouseLeave={() => setHoveredStyle(null)}
                onClick={() => handleSelect(style.id)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Color preview */}
                <div className="flex gap-1.5 mb-4">
                  {style.colors.map((color, i) => (
                    <motion.div
                      key={i}
                      className="h-3 rounded-full"
                      style={{
                        backgroundColor: color,
                        width: i === 0 ? "40%" : i === 1 ? "35%" : "25%",
                      }}
                      animate={{
                        scaleY: isHovered ? 1.5 : 1,
                      }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    />
                  ))}
                </div>

                {/* Icon */}
                <span className="text-2xl mb-2 block opacity-70 group-hover:opacity-100 transition-opacity">
                  {style.icon}
                </span>

                {/* Label & description */}
                <h3 className="font-serif text-lg text-foreground mb-1">
                  {style.label}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {style.description}
                </p>

                {/* Selected indicator */}
                {isSelected && (
                  <motion.div
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <span className="text-primary-foreground text-xs">✓</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
