/**
 * Centralized Component Registry
 *
 * Single source of truth for all showcased components.
 * Supports Magic UI built-ins and external plugins (custom components).
 *
 * Architecture:
 *   registry-config.ts  ← this file; defines types, class, default entries
 *   validate-components.ts  ← uses importFn from each entry to probe modules
 *   admin/components-management.ts  ← imports registry for admin UI
 *   ComponentShowcase.tsx  ← consumes registry + validation results
 */

import { lazy, type LazyExoticComponent, type ComponentType } from "react";

// Minimal structural type — avoids a circular dep with validate-components.ts
interface WithStatus { status: string }

// ─── Types ────────────────────────────────────────────────────────────────────

export type ComponentCategory =
  | "backgrounds"
  | "text"
  | "buttons"
  | "cards"
  | "effects"
  | "mockups"
  | "layout"
  | "media"
  | "interactive"
  | "loaders";

export interface ComponentEntry {
  id:          string;
  name:        string;
  description: string;
  category:    ComponentCategory;
  /** Magic UI / custom docs URL — shown in error fallback */
  docsUrl:     string;
  tags:        string[];
  /** "magic-ui" | "custom" | plugin namespace */
  source:      string;
  /**
   * Returns the component constructor.
   * Must be a static `import()` call so Vite can create a code-split chunk.
   * The registry derives `component` (React.lazy) from this automatically.
   */
  importFn: () => Promise<ComponentType>;
  /** Derived by ComponentRegistry.register() — do not set manually */
  component: LazyExoticComponent<ComponentType>;
}

/** What a plugin provides — `component` is derived, so it's omitted */
export type ComponentPluginEntry = Omit<ComponentEntry, "component">;

export interface ComponentPlugin {
  /** Unique namespace, e.g. "my-app" or "stencil-custom" */
  namespace: string;
  entries:   ComponentPluginEntry[];
}

// ─── Registry class ───────────────────────────────────────────────────────────

export class ComponentRegistry {
  private _entries = new Map<string, ComponentEntry>();

  /**
   * Register a single component.
   * Wraps `importFn` in React.lazy automatically.
   */
  register(entry: ComponentPluginEntry): this {
    const component = lazy(() =>
      entry.importFn().then((C) => ({ default: C }))
    );
    this._entries.set(entry.id, { ...entry, component });
    return this;
  }

  /** Batch-register a plugin's entries */
  registerPlugin(plugin: ComponentPlugin): this {
    plugin.entries.forEach((e) => this.register(e));
    return this;
  }

  /** All registered entries, in insertion order */
  getAll(): ComponentEntry[] {
    return [...this._entries.values()];
  }

  getById(id: string): ComponentEntry | undefined {
    return this._entries.get(id);
  }

  getByCategory(category: ComponentCategory): ComponentEntry[] {
    return this.getAll().filter((e) => e.category === category);
  }

  getBySource(source: string): ComponentEntry[] {
    return this.getAll().filter((e) => e.source === source);
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const registry = new ComponentRegistry();

// ─── Magic UI entries ─────────────────────────────────────────────────────────
// Organized by category. importFn must use a string-literal import() path so
// Vite creates a code-split chunk at this call site.

const DOCS = (id: string) => `https://magicui.design/docs/components/${id}`;

// — Backgrounds —
registry
  .register({ id: "retro-grid",             name: "Retro Grid",              description: "Perspective 80s-style grid floor",               category: "backgrounds", docsUrl: DOCS("retro-grid"),             tags: ["grid","retro","perspective","bg"],  source: "magic-ui", importFn: () => import("./magic-ui/retro-grid").then(m => m.RetroGrid) })
  .register({ id: "dot-pattern",            name: "Dot Pattern",             description: "SVG dot grid background",                        category: "backgrounds", docsUrl: DOCS("dot-pattern"),            tags: ["dots","pattern","svg","bg"],       source: "magic-ui", importFn: () => import("./magic-ui/dot-pattern").then(m => m.DotPattern) })
  .register({ id: "grid-pattern",           name: "Grid Pattern",            description: "Customisable SVG grid/line background",          category: "backgrounds", docsUrl: DOCS("grid-pattern"),           tags: ["grid","lines","svg","bg"],          source: "magic-ui", importFn: () => import("./magic-ui/grid-pattern").then(m => m.GridPattern) })
  .register({ id: "flickering-grid",        name: "Flickering Grid",         description: "Grid of cells that randomly flicker",            category: "backgrounds", docsUrl: DOCS("flickering-grid"),        tags: ["grid","flicker","random","bg"],    source: "magic-ui", importFn: () => import("./magic-ui/flickering-grid").then(m => m.FlickeringGrid) })
  .register({ id: "striped-pattern",        name: "Striped Pattern",         description: "Diagonal or linear striped SVG background",      category: "backgrounds", docsUrl: DOCS("striped-pattern"),        tags: ["stripes","pattern","svg","bg"],    source: "magic-ui", importFn: () => import("./magic-ui/striped-pattern").then(m => m.StripedPattern) })
  .register({ id: "animated-grid-pattern",  name: "Animated Grid Pattern",   description: "Animated SVG grid that fades in and out",        category: "backgrounds", docsUrl: DOCS("animated-grid-pattern"),  tags: ["grid","animated","svg","bg"],      source: "magic-ui", importFn: () => import("./magic-ui/animated-grid-pattern").then(m => m.AnimatedGridPattern) })
  .register({ id: "interactive-grid-pattern", name: "Interactive Grid Pattern", description: "Grid that reacts to mouse position",          category: "backgrounds", docsUrl: DOCS("interactive-grid-pattern"), tags: ["grid","interactive","mouse","bg"], source: "magic-ui", importFn: () => import("./magic-ui/interactive-grid-pattern").then(m => m.InteractiveGridPattern) })
  .register({ id: "warp-background",        name: "Warp Background",         description: "Animated warp-speed star field",                 category: "backgrounds", docsUrl: DOCS("warp-background"),        tags: ["stars","warp","speed","bg"],       source: "magic-ui", importFn: () => import("./magic-ui/warp-background").then(m => m.WarpBackground) })
  .register({ id: "particles",              name: "Particles",               description: "Interactive floating particle system",           category: "backgrounds", docsUrl: DOCS("particles"),              tags: ["particles","interactive","bg"],    source: "magic-ui", importFn: () => import("./magic-ui/particles").then(m => m.Particles) })
  .register({ id: "meteors",               name: "Meteors",                 description: "Animated meteor shower background",              category: "backgrounds", docsUrl: DOCS("meteors"),                tags: ["meteors","rain","bg","animation"], source: "magic-ui", importFn: () => import("./magic-ui/meteors").then(m => m.Meteors) })
  .register({ id: "light-rays",            name: "Light Rays",              description: "Radial light ray background effect",            category: "backgrounds", docsUrl: DOCS("light-rays"),             tags: ["light","rays","radial","bg"],      source: "magic-ui", importFn: () => import("./magic-ui/light-rays").then(m => m.LightRays) })

// — Text —
  .register({ id: "animated-gradient-text", name: "Animated Gradient Text", description: "Text with animated gradient fill",               category: "text", docsUrl: DOCS("animated-gradient-text"), tags: ["gradient","text","animation"],     source: "magic-ui", importFn: () => import("./magic-ui/animated-gradient-text").then(m => m.AnimatedGradientText) })
  .register({ id: "animated-shiny-text",    name: "Animated Shiny Text",    description: "Text with a moving shine effect",                category: "text", docsUrl: DOCS("animated-shiny-text"),    tags: ["shine","text","animation"],        source: "magic-ui", importFn: () => import("./magic-ui/animated-shiny-text").then(m => m.AnimatedShinyText) })
  .register({ id: "aurora-text",            name: "Aurora Text",            description: "Text with aurora borealis colour effect",        category: "text", docsUrl: DOCS("aurora-text"),            tags: ["aurora","gradient","text"],        source: "magic-ui", importFn: () => import("./magic-ui/aurora-text").then(m => m.AuroraText) })
  .register({ id: "hyper-text",             name: "Hyper Text",             description: "Text that scrambles characters on hover",        category: "text", docsUrl: DOCS("hyper-text"),             tags: ["scramble","hover","text"],         source: "magic-ui", importFn: () => import("./magic-ui/hyper-text").then(m => m.HyperText) })
  .register({ id: "line-shadow-text",       name: "Line Shadow Text",       description: "Text with an animated line shadow",              category: "text", docsUrl: DOCS("line-shadow-text"),       tags: ["shadow","text","animation"],       source: "magic-ui", importFn: () => import("./magic-ui/line-shadow-text").then(m => m.LineShadowText) })
  .register({ id: "morphing-text",          name: "Morphing Text",          description: "Text that morphs between multiple strings",      category: "text", docsUrl: DOCS("morphing-text"),          tags: ["morph","text","animation"],        source: "magic-ui", importFn: () => import("./magic-ui/morphing-text").then(m => m.MorphingText) })
  .register({ id: "number-ticker",          name: "Number Ticker",          description: "Number that animates to its target value",       category: "text", docsUrl: DOCS("number-ticker"),          tags: ["counter","number","animation"],    source: "magic-ui", importFn: () => import("./magic-ui/number-ticker").then(m => m.NumberTicker) })
  .register({ id: "sparkles-text",          name: "Sparkles Text",          description: "Text surrounded by twinkling sparkle particles", category: "text", docsUrl: DOCS("sparkles-text"),          tags: ["sparkles","particles","text"],     source: "magic-ui", importFn: () => import("./magic-ui/sparkles-text").then(m => m.SparklesText) })
  .register({ id: "spinning-text",          name: "Spinning Text",          description: "Text arranged in a spinning circular path",      category: "text", docsUrl: DOCS("spinning-text"),          tags: ["spin","circle","text"],            source: "magic-ui", importFn: () => import("./magic-ui/spinning-text").then(m => m.SpinningText) })
  .register({ id: "text-animate",           name: "Text Animate",           description: "Text with configurable word/char animations",    category: "text", docsUrl: DOCS("text-animate"),           tags: ["animate","text","word","char"],    source: "magic-ui", importFn: () => import("./magic-ui/text-animate").then(m => m.TextAnimate) })
  .register({ id: "text-reveal",            name: "Text Reveal",            description: "Text that reveals on scroll",                    category: "text", docsUrl: DOCS("text-reveal"),            tags: ["reveal","scroll","text"],          source: "magic-ui", importFn: () => import("./magic-ui/text-reveal").then(m => m.TextReveal) })
  .register({ id: "typing-animation",       name: "Typing Animation",       description: "Text that types itself out character by character", category: "text", docsUrl: DOCS("typing-animation"),   tags: ["typing","typewriter","text"],      source: "magic-ui", importFn: () => import("./magic-ui/typing-animation").then(m => m.TypingAnimation) })
  .register({ id: "word-rotate",            name: "Word Rotate",            description: "Words that cycle through a rotating list",       category: "text", docsUrl: DOCS("word-rotate"),            tags: ["rotate","words","cycle","text"],   source: "magic-ui", importFn: () => import("./magic-ui/word-rotate").then(m => m.WordRotate) })
  .register({ id: "comic-text",             name: "Comic Text",             description: "Comic book style text with bold outlines",       category: "text", docsUrl: DOCS("comic-text"),             tags: ["comic","bold","text","outline"],   source: "magic-ui", importFn: () => import("./magic-ui/comic-text").then(m => m.ComicText) })

// — Buttons —
  .register({ id: "animated-subscribe-button", name: "Animated Subscribe Button", description: "Subscribe button with animated state transitions", category: "buttons", docsUrl: DOCS("animated-subscribe-button"), tags: ["subscribe","button","animation"], source: "magic-ui", importFn: () => import("./magic-ui/animated-subscribe-button").then(m => m.AnimatedSubscribeButton) })
  .register({ id: "interactive-hover-button",  name: "Interactive Hover Button",  description: "Button with interactive fill on hover",           category: "buttons", docsUrl: DOCS("interactive-hover-button"),  tags: ["hover","button","fill"],          source: "magic-ui", importFn: () => import("./magic-ui/interactive-hover-button").then(m => m.InteractiveHoverButton) })
  .register({ id: "pulsating-button",          name: "Pulsating Button",          description: "Button with a pulsating ring animation",          category: "buttons", docsUrl: DOCS("pulsating-button"),          tags: ["pulse","ring","button"],          source: "magic-ui", importFn: () => import("./magic-ui/pulsating-button").then(m => m.PulsatingButton) })
  .register({ id: "rainbow-button",            name: "Rainbow Button",            description: "Button with an animated rainbow border",          category: "buttons", docsUrl: DOCS("rainbow-button"),            tags: ["rainbow","border","button"],      source: "magic-ui", importFn: () => import("./magic-ui/rainbow-button").then(m => m.RainbowButton) })
  .register({ id: "ripple-button",             name: "Ripple Button",             description: "Button that emits a ripple on click",            category: "buttons", docsUrl: DOCS("ripple-button"),             tags: ["ripple","click","button"],        source: "magic-ui", importFn: () => import("./magic-ui/ripple-button").then(m => m.RippleButton) })
  .register({ id: "shimmer-button",            name: "Shimmer Button",            description: "Button with a travelling shimmer highlight",      category: "buttons", docsUrl: DOCS("shimmer-button"),            tags: ["shimmer","highlight","button"],   source: "magic-ui", importFn: () => import("./magic-ui/shimmer-button").then(m => m.ShimmerButton) })
  .register({ id: "shiny-button",              name: "Shiny Button",              description: "Button with a sheen/gloss animation",            category: "buttons", docsUrl: DOCS("shiny-button"),              tags: ["sheen","gloss","button"],         source: "magic-ui", importFn: () => import("./magic-ui/shiny-button").then(m => m.ShinyButton) })

// — Cards —
  .register({ id: "bento-grid",         name: "Bento Grid",          description: "Responsive bento box grid layout",               category: "cards", docsUrl: DOCS("bento-grid"),         tags: ["bento","grid","layout","card"],   source: "magic-ui", importFn: () => import("./magic-ui/bento-grid").then(m => m.BentoGrid) })
  .register({ id: "magic-card",         name: "Magic Card",          description: "Card with a spotlight that follows the cursor",  category: "cards", docsUrl: DOCS("magic-card"),         tags: ["spotlight","cursor","card"],      source: "magic-ui", importFn: () => import("./magic-ui/magic-card").then(m => m.MagicCard) })
  .register({ id: "neon-gradient-card", name: "Neon Gradient Card",  description: "Card with animated neon gradient border",        category: "cards", docsUrl: DOCS("neon-gradient-card"), tags: ["neon","gradient","border","card"], source: "magic-ui", importFn: () => import("./magic-ui/neon-gradient-card").then(m => m.NeonGradientCard) })
  .register({ id: "shine-border",       name: "Shine Border",        description: "Card with an animated shining border",          category: "cards", docsUrl: DOCS("shine-border"),       tags: ["shine","border","card"],          source: "magic-ui", importFn: () => import("./magic-ui/shine-border").then(m => m.ShineBorder) })

// — Effects —
  .register({ id: "animated-beam",    name: "Animated Beam",    description: "Animated connection beam between elements",          category: "effects", docsUrl: DOCS("animated-beam"),    tags: ["beam","connection","svg"],       source: "magic-ui", importFn: () => import("./magic-ui/animated-beam").then(m => m.AnimatedBeam) })
  .register({ id: "backlight",        name: "Backlight",        description: "Glowing backlight effect behind elements",          category: "effects", docsUrl: DOCS("backlight"),        tags: ["glow","light","backlight"],     source: "magic-ui", importFn: () => import("./magic-ui/backlight").then(m => m.Backlight) })
  .register({ id: "blur-fade",        name: "Blur Fade",        description: "Blur and fade in/out transition",                   category: "effects", docsUrl: DOCS("blur-fade"),        tags: ["blur","fade","transition"],     source: "magic-ui", importFn: () => import("./magic-ui/blur-fade").then(m => m.BlurFade) })
  .register({ id: "border-beam",      name: "Border Beam",      description: "Animated beam travelling around a border",          category: "effects", docsUrl: DOCS("border-beam"),      tags: ["beam","border","animation"],    source: "magic-ui", importFn: () => import("./magic-ui/border-beam").then(m => m.BorderBeam) })
  .register({ id: "cool-mode",        name: "Cool Mode",        description: "Particle trail that follows the cursor",            category: "effects", docsUrl: DOCS("cool-mode"),        tags: ["particles","cursor","trail"],   source: "magic-ui", importFn: () => import("./magic-ui/cool-mode").then(m => m.CoolMode) })
  .register({ id: "lens",             name: "Lens",             description: "Magnifying lens that follows the cursor",           category: "effects", docsUrl: DOCS("lens"),             tags: ["magnify","lens","cursor"],      source: "magic-ui", importFn: () => import("./magic-ui/lens").then(m => m.Lens) })
  .register({ id: "progressive-blur", name: "Progressive Blur", description: "Directional blur that fades across an element",    category: "effects", docsUrl: DOCS("progressive-blur"), tags: ["blur","directional","fade"],    source: "magic-ui", importFn: () => import("./magic-ui/progressive-blur").then(m => m.ProgressiveBlur) })
  .register({ id: "ripple",           name: "Ripple",           description: "Concentric ripple rings from a centre point",      category: "effects", docsUrl: DOCS("ripple"),           tags: ["ripple","rings","pulse"],       source: "magic-ui", importFn: () => import("./magic-ui/ripple").then(m => m.Ripple) })
  .register({ id: "scroll-progress",  name: "Scroll Progress",  description: "Scroll position indicator bar",                    category: "effects", docsUrl: DOCS("scroll-progress"),  tags: ["scroll","progress","indicator"], source: "magic-ui", importFn: () => import("./magic-ui/scroll-progress").then(m => m.ScrollProgress) })
  .register({ id: "scroll-velocity",  name: "Scroll Velocity",  description: "Text that scrolls at varying speeds",              category: "effects", docsUrl: DOCS("scroll-based-velocity"), tags: ["scroll","velocity","text"], source: "magic-ui", importFn: () => import("./magic-ui/scroll-based-velocity").then(m => m.ScrollVelocityContainer) })
  .register({ id: "orbiting-circles", name: "Orbiting Circles", description: "Elements orbiting a central point",                category: "effects", docsUrl: DOCS("orbiting-circles"), tags: ["orbit","circles","animation"],  source: "magic-ui", importFn: () => import("./magic-ui/orbiting-circles").then(m => m.OrbitingCircles) })

// — Mockups —
  .register({ id: "android", name: "Android", description: "Android device frame mockup", category: "mockups", docsUrl: DOCS("android"), tags: ["android","mockup","device"],   source: "magic-ui", importFn: () => import("./magic-ui/android").then(m => m.Android) })
  .register({ id: "iphone",  name: "iPhone",  description: "iPhone device frame mockup",  category: "mockups", docsUrl: DOCS("iphone"),  tags: ["iphone","mockup","device"],    source: "magic-ui", importFn: () => import("./magic-ui/iphone").then(m => m.Iphone) })
  .register({ id: "safari",  name: "Safari",  description: "Safari browser window mockup", category: "mockups", docsUrl: DOCS("safari"),  tags: ["safari","browser","mockup"],  source: "magic-ui", importFn: () => import("./magic-ui/safari").then(m => m.Safari) })

// — Layout —
  .register({ id: "dock",          name: "Dock",           description: "macOS-style magnifying dock",               category: "layout", docsUrl: DOCS("dock"),          tags: ["dock","macos","magnify"],          source: "magic-ui", importFn: () => import("./magic-ui/dock").then(m => m.Dock) })
  .register({ id: "file-tree",     name: "File Tree",      description: "Collapsible file/folder tree component",   category: "layout", docsUrl: DOCS("file-tree"),     tags: ["file","tree","folder","collapse"],  source: "magic-ui", importFn: () => import("./magic-ui/file-tree").then(m => m.Tree) })
  .register({ id: "marquee",       name: "Marquee",        description: "Infinitely scrolling marquee strip",       category: "layout", docsUrl: DOCS("marquee"),       tags: ["marquee","scroll","infinite"],     source: "magic-ui", importFn: () => import("./magic-ui/marquee").then(m => m.Marquee) })
  .register({ id: "animated-list", name: "Animated List",  description: "List items that animate in sequence",      category: "layout", docsUrl: DOCS("animated-list"), tags: ["list","animate","sequence"],       source: "magic-ui", importFn: () => import("./magic-ui/animated-list").then(m => m.AnimatedList) })

// — Media —
  .register({ id: "hero-video-dialog", name: "Hero Video Dialog", description: "Video thumbnail that opens in a modal", category: "media", docsUrl: DOCS("hero-video-dialog"), tags: ["video","dialog","modal"],     source: "magic-ui", importFn: () => import("./magic-ui/hero-video-dialog").then(m => m.HeroVideoDialog) })
  .register({ id: "icon-cloud",        name: "Icon Cloud",        description: "Rotating sphere of tech icons",         category: "media", docsUrl: DOCS("icon-cloud"),        tags: ["icons","sphere","rotate"],    source: "magic-ui", importFn: () => import("./magic-ui/icon-cloud").then(m => m.IconCloud) })
  .register({ id: "avatar-circles",   name: "Avatar Circles",    description: "Stacked avatar circles with overflow",  category: "media", docsUrl: DOCS("avatar-circles"),    tags: ["avatar","circles","stack"],   source: "magic-ui", importFn: () => import("./magic-ui/avatar-circles").then(m => m.AvatarCircles) })
  .register({ id: "pixel-image",      name: "Pixel Image",       description: "Image with pixelation reveal effect",   category: "media", docsUrl: DOCS("pixel-image"),       tags: ["pixel","image","reveal"],     source: "magic-ui", importFn: () => import("./magic-ui/pixel-image").then(m => m.PixelImage) })
  .register({ id: "video-text",       name: "Video Text",        description: "Video playing through a text mask",     category: "media", docsUrl: DOCS("video-text"),        tags: ["video","text","mask","clip"], source: "magic-ui", importFn: () => import("./magic-ui/video-text").then(m => m.VideoText) })

// — Interactive —
  .register({ id: "pointer",               name: "Pointer",               description: "Custom animated cursor pointer",              category: "interactive", docsUrl: DOCS("pointer"),               tags: ["cursor","pointer","custom"],       source: "magic-ui", importFn: () => import("./magic-ui/pointer").then(m => m.Pointer) })
  .register({ id: "smooth-cursor",         name: "Smooth Cursor",         description: "Smoothly animated custom cursor",             category: "interactive", docsUrl: DOCS("smooth-cursor"),         tags: ["cursor","smooth","animation"],     source: "magic-ui", importFn: () => import("./magic-ui/smooth-cursor").then(m => m.SmoothCursor) })
  .register({ id: "animated-theme-toggler", name: "Animated Theme Toggler", description: "Dark/light mode toggle with animation",    category: "interactive", docsUrl: DOCS("animated-theme-toggler"), tags: ["theme","dark","toggle","animate"], source: "magic-ui", importFn: () => import("./magic-ui/animated-theme-toggler").then(m => m.AnimatedThemeToggler) })

// — Loaders —
  .register({ id: "animated-circular-progress-bar", name: "Animated Circular Progress", description: "Circular progress bar with smooth animation", category: "loaders", docsUrl: DOCS("animated-circular-progress-bar"), tags: ["progress","circular","loader"], source: "magic-ui", importFn: () => import("./magic-ui/animated-circular-progress-bar").then(m => m.AnimatedCircularProgressBar) });

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns only the components that passed validation.
 * Pass `undefined` to get the full unfiltered list (e.g. for the showcase).
 *
 * Usage:
 *   // In production — only safe, validated components
 *   const working = getComponentRegistry(validationResults);
 *
 *   // In showcase — everything, including pending/failed
 *   const all = getComponentRegistry();
 */
export function getComponentRegistry(
  validationResults?: Map<string, WithStatus>
): ComponentEntry[] {
  const all = registry.getAll();
  if (!validationResults) return all;
  return all.filter((e) => validationResults.get(e.id)?.status === "success");
}
