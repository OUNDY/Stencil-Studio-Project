import { useState, useEffect, useRef } from "react";
import { Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ThemeColor = "terracotta" | "ocean" | "forest" | "lavender";

interface ThemeOption {
  id: ThemeColor;
  label: string;
  lightPreview: string; // HSL color for light mode primary
  darkPreview: string;  // HSL color for dark mode primary
  className: string;    // CSS class to apply
}

const themes: ThemeOption[] = [
  {
    id: "terracotta",
    label: "Terracotta",
    lightPreview: "hsl(20, 50%, 50%)",
    darkPreview: "hsl(25, 55%, 60%)",
    className: "",
  },
  {
    id: "ocean",
    label: "Okyanus",
    lightPreview: "hsl(200, 65%, 48%)",
    darkPreview: "hsl(200, 60%, 58%)",
    className: "theme-ocean",
  },
  {
    id: "forest",
    label: "Orman",
    lightPreview: "hsl(155, 45%, 38%)",
    darkPreview: "hsl(155, 50%, 50%)",
    className: "theme-forest",
  },
  {
    id: "lavender",
    label: "Lavanta",
    lightPreview: "hsl(265, 50%, 55%)",
    darkPreview: "hsl(265, 55%, 65%)",
    className: "theme-lavender",
  },
];

export const ThemeSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeColor>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("stencil_color_theme") as ThemeColor) || "terracotta";
    }
    return "terracotta";
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const isDark = typeof window !== "undefined" && document.documentElement.classList.contains("dark");

  useEffect(() => {
    // Apply saved theme on mount
    const saved = localStorage.getItem("stencil_color_theme") as ThemeColor;
    if (saved) {
      applyTheme(saved);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyTheme = (themeId: ThemeColor) => {
    const root = document.documentElement;
    // Remove all theme classes
    themes.forEach((t) => {
      if (t.className) root.classList.remove(t.className);
    });
    // Apply new theme class
    const theme = themes.find((t) => t.id === themeId);
    if (theme?.className) {
      root.classList.add(theme.className);
    }
  };

  const selectTheme = (themeId: ThemeColor) => {
    setActiveTheme(themeId);
    applyTheme(themeId);
    localStorage.setItem("stencil_color_theme", themeId);
  };

  return (
    <div ref={containerRef} className="fixed bottom-6 right-[7rem] sm:right-[10.5rem] z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-14 right-0 bg-card border border-border rounded-2xl shadow-2xl p-3 min-w-[180px]"
          >
            <p className="text-xs font-medium text-muted-foreground mb-2 px-1">
              Renk Teması
            </p>
            <div className="space-y-1">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => selectTheme(theme.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm ${
                    activeTheme === theme.id
                      ? "bg-primary/10 text-foreground"
                      : "hover:bg-accent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {/* Color preview dots - light & dark */}
                  <div className="flex items-center gap-1">
                    <div
                      className="w-4 h-4 rounded-full border border-border/50"
                      style={{ backgroundColor: theme.lightPreview }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-border/50"
                      style={{ backgroundColor: theme.darkPreview }}
                    />
                  </div>
                  <span className="flex-1 text-left">{theme.label}</span>
                  {activeTheme === theme.id && (
                    <motion.div
                      layoutId="theme-check"
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-card border border-border text-foreground rounded-full shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Renk temasını değiştir"
      >
        <Palette className="w-5 h-5 text-muted-foreground" />
      </motion.button>
    </div>
  );
};
