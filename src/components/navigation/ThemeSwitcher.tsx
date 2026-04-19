import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

type ThemeColor = "terracotta" | "ocean" | "forest" | "lavender";

interface ThemeOption {
  id: ThemeColor;
  label: string;
  lightPreview: string;
  darkPreview: string;
  className: string;
}

const themes: ThemeOption[] = [
  { id: "terracotta", label: "Terracotta", lightPreview: "hsl(20, 50%, 50%)",  darkPreview: "hsl(25, 55%, 60%)",  className: "" },
  { id: "ocean",      label: "Okyanus",    lightPreview: "hsl(200, 65%, 48%)", darkPreview: "hsl(200, 60%, 58%)", className: "theme-ocean" },
  { id: "forest",     label: "Orman",      lightPreview: "hsl(155, 45%, 38%)", darkPreview: "hsl(155, 50%, 50%)", className: "theme-forest" },
  { id: "lavender",   label: "Lavanta",    lightPreview: "hsl(265, 50%, 55%)", darkPreview: "hsl(265, 55%, 65%)", className: "theme-lavender" },
];

export const ThemeSwitcher = () => {
  const [activeTheme, setActiveTheme] = useState<ThemeColor>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("stencil_color_theme") as ThemeColor) || "terracotta";
    }
    return "terracotta";
  });
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined" && document.documentElement.classList.contains("dark")
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("stencil_color_theme") as ThemeColor;
    if (saved) applyTheme(saved);

    const stored = localStorage.getItem("stencil_theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const applyTheme = (themeId: ThemeColor) => {
    const root = document.documentElement;
    themes.forEach((t) => { if (t.className) root.classList.remove(t.className); });
    const theme = themes.find((t) => t.id === themeId);
    if (theme?.className) root.classList.add(theme.className);
  };

  const selectTheme = (themeId: ThemeColor) => {
    setActiveTheme(themeId);
    applyTheme(themeId);
    localStorage.setItem("stencil_color_theme", themeId);
  };

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("stencil_theme", next ? "dark" : "light");
  };

  const active = themes.find((t) => t.id === activeTheme)!;

  return (
    <div
      className="fixed bottom-6 right-[5.5rem] sm:right-[8.5rem] z-50"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex items-center gap-1.5 rounded-full bg-card/80 backdrop-blur-md border border-border shadow-md px-1.5 py-1.5 transition-all">
        {/* Active theme dot — always visible */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-7 h-7 rounded-full overflow-hidden flex ring-1 ring-border hover:ring-2 hover:ring-primary transition-all"
          aria-label={`Aktif tema: ${active.label}`}
        >
          <div className="w-1/2 h-full" style={{ backgroundColor: active.lightPreview }} />
          <div className="w-1/2 h-full" style={{ backgroundColor: active.darkPreview }} />
        </button>

        {/* Expanded options */}
        <div
          className={`flex items-center gap-1.5 overflow-hidden transition-all duration-300 ease-out ${
            open ? "max-w-[260px] opacity-100 ml-1" : "max-w-0 opacity-0 ml-0"
          }`}
        >
          {themes
            .filter((t) => t.id !== activeTheme)
            .map((theme) => (
              <button
                key={theme.id}
                onClick={() => selectTheme(theme.id)}
                className="w-6 h-6 rounded-full overflow-hidden flex ring-1 ring-border hover:ring-2 hover:ring-muted-foreground transition-all flex-shrink-0"
                aria-label={theme.label}
                title={theme.label}
              >
                <div className="w-1/2 h-full" style={{ backgroundColor: theme.lightPreview }} />
                <div className="w-1/2 h-full" style={{ backgroundColor: theme.darkPreview }} />
              </button>
            ))}

          {/* Divider */}
          <div className="w-px h-5 bg-border mx-0.5 flex-shrink-0" />

          {/* Dark mode mini toggle */}
          <button
            onClick={toggleDark}
            className="w-6 h-6 rounded-full flex items-center justify-center bg-muted hover:bg-accent transition-colors flex-shrink-0"
            aria-label={isDark ? "Aydınlık moda geç" : "Karanlık moda geç"}
            title={isDark ? "Aydınlık" : "Karanlık"}
          >
            {isDark ? <Sun className="w-3 h-3 text-foreground" /> : <Moon className="w-3 h-3 text-foreground" />}
          </button>
        </div>
      </div>
    </div>
  );
};
