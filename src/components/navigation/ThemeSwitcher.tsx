import { useState, useEffect } from "react";

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
  const [activeTheme, setActiveTheme] = useState<ThemeColor>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("stencil_color_theme") as ThemeColor) || "terracotta";
    }
    return "terracotta";
  });

  useEffect(() => {
    const saved = localStorage.getItem("stencil_color_theme") as ThemeColor;
    if (saved) {
      applyTheme(saved);
    }
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
    <div className="fixed bottom-6 right-[7rem] sm:right-[10.5rem] z-50 flex items-center gap-2">
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => selectTheme(theme.id)}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex transition-all ${
            activeTheme === theme.id
              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
              : "ring-1 ring-border hover:ring-2 hover:ring-muted-foreground"
          }`}
          aria-label={theme.label}
        >
          <div
            className="w-1/2 h-full"
            style={{ backgroundColor: theme.lightPreview }}
          />
          <div
            className="w-1/2 h-full"
            style={{ backgroundColor: theme.darkPreview }}
          />
        </button>
      ))}
    </div>
  );
};
