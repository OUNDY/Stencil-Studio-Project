import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { CanvasPaintingController } from "@/components/ui/CanvasPaintingController";

// ── Composition SVG data ───────────────────────────────────────────────────────
const KARO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g>
    <polygon points="50,5 95,50 50,95 5,50" fill="none" stroke="currentColor" stroke-width="3"/>
    <polygon points="50,22 78,50 50,78 22,50" fill="none" stroke="currentColor" stroke-width="2"/>
    <polygon points="50,37 63,50 50,63 37,50" fill="currentColor"/>
    <rect x="47" y="5" width="6" height="90" fill="currentColor"/>
    <rect x="5" y="47" width="90" height="6" fill="currentColor"/>
    <circle cx="50" cy="5" r="6" fill="currentColor"/>
    <circle cx="95" cy="50" r="6" fill="currentColor"/>
    <circle cx="50" cy="95" r="6" fill="currentColor"/>
    <circle cx="5" cy="50" r="6" fill="currentColor"/>
  </g>
</svg>`;

const BOTANIKA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g fill="currentColor">
    <path d="M50 95 C46 72 54 52 50 35 C46 18 50 8 50 8"
          fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M50 76 C65 68 80 54 74 40 C66 54 58 66 50 76 Z"/>
    <path d="M50 62 C35 54 20 40 26 24 C35 36 43 50 50 62 Z"/>
    <path d="M50 46 C63 38 72 22 64 12 C58 22 54 36 50 46 Z"/>
    <path d="M50 30 C40 23 34 12 38 5 C44 13 47 23 50 30 Z"/>
    <ellipse cx="50" cy="6" rx="4" ry="7"/>
  </g>
</svg>`;

const KAPI_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g fill="currentColor">
    <rect x="7" y="50" width="13" height="46"/>
    <rect x="80" y="50" width="13" height="46"/>
    <path d="M7 50 A43 43 0 0 1 93 50 L80 50 A30 30 0 0 0 20 50 Z"/>
    <polygon points="50,4 43,17 57,17"/>
    <circle cx="50" cy="36" r="11"/>
    <circle cx="39" cy="48" r="11"/>
    <circle cx="61" cy="48" r="11"/>
    <rect x="5" y="92" width="90" height="5"/>
  </g>
</svg>`;

interface Composition {
  id:       string;
  label:    string;
  sublabel: string;
  svg:      string;
}

const COMPOSITIONS: Composition[] = [
  { id: "karo",     label: "Geometrik", sublabel: "Modern",  svg: KARO_SVG     },
  { id: "botanika", label: "Botanik",   sublabel: "Organik", svg: BOTANIKA_SVG },
  { id: "kapi",     label: "Mimari",    sublabel: "Klasik",  svg: KAPI_SVG     },
];

// ── Constants ──────────────────────────────────────────────────────────────────
const CANVAS_HEIGHT = 460;   // CSS px
const STENCIL_SIZE  = 300;   // CSS px; shrinks to 85% on narrow screens
const STORAGE_PREFIX = "hero-paint-";
const PAINT_STATE_KEY = "stencil-painting-state";

// ── Module-level reusable scratch canvas ──────────────────────────────────────
// Avoids per-frame allocations during the active-stroke composite operation.
let _tmpCanvas: HTMLCanvasElement | null = null;
function getTmpCtx(w: number, h: number): CanvasRenderingContext2D {
  if (!_tmpCanvas || _tmpCanvas.width !== w || _tmpCanvas.height !== h) {
    _tmpCanvas = document.createElement("canvas");
    _tmpCanvas.width = w;
    _tmpCanvas.height = h;
  }
  const ctx = _tmpCanvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);
  return ctx;
}

// ── Linen surface texture (pre-computed once per init) ────────────────────────
// Drawing a solid fill + vignette every RAF frame is wasteful. We compute the
// surface once, store it in an offscreen canvas, and just drawImage it each frame.
function buildSurface(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;

  // Warm cream base
  ctx.fillStyle = "hsl(42,30%,94%)";
  ctx.fillRect(0, 0, w, h);

  // Subtle woven linen grain
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    d[i]   = Math.max(0, Math.min(255, d[i]   + n));
    d[i+1] = Math.max(0, Math.min(255, d[i+1] + n * 0.9));
    d[i+2] = Math.max(0, Math.min(255, d[i+2] + n * 0.7));
    d[i+3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  // Radial vignette for depth
  const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, h * 0.15, w * 0.5, h * 0.5, h * 0.85);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.09)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  return c;
}

// ── Bristle brush dab ─────────────────────────────────────────────────────────
function drawBristleDab(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  angle: number,
  color: string, size: number, alpha: number,
) {
  const n = Math.ceil(size * 0.45);
  for (let i = 0; i < n; i++) {
    const spread = (i / n - 0.5) * size * 0.28;
    const len    = size * (0.6 + Math.random() * 0.4);
    const jitter = (Math.random() - 0.5) * size * 0.07;
    ctx.save();
    ctx.translate(x + jitter, y + spread);
    ctx.rotate(angle + (Math.random() - 0.5) * 0.22);
    ctx.globalAlpha = alpha * (0.32 + Math.random() * 0.58);
    ctx.fillStyle   = color;
    ctx.fillRect(-len * 0.5, -0.85, len, 1.7 + Math.random() * 0.7);
    ctx.restore();
  }
}

// ── SVG → offscreen canvas mask ───────────────────────────────────────────────
function buildStencilMask(
  mask: HTMLCanvasElement,
  svgString: string,
  ox: number, oy: number, size: number,
): Promise<void> {
  const ctx = mask.getContext("2d")!;
  ctx.clearRect(0, 0, mask.width, mask.height);
  const filled = svgString.replace(/currentColor/g, "#000");
  const blob   = new Blob([filled], { type: "image/svg+xml" });
  const url    = URL.createObjectURL(blob);
  return new Promise<void>(resolve => {
    const img  = new Image();
    img.onload  = () => { ctx.drawImage(img, ox, oy, size, size); URL.revokeObjectURL(url); resolve(); };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(); };
    img.src = url;
  });
}

// ── Saved paint-tool state (keeps canvas + controller in sync on load) ─────────
function readSavedPaintState() {
  try {
    const raw = localStorage.getItem(PAINT_STATE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Record<string, unknown>;
      return {
        color:     typeof p.color     === "string" ? p.color     : "#c8714e",
        brushSize: typeof p.brushSize === "number" ? p.brushSize : 48,
        opacity:   typeof p.opacity   === "number" ? p.opacity   : 0.85,
      };
    }
  } catch { /* ignore */ }
  return { color: "#c8714e", brushSize: 48, opacity: 0.85 };
}

function hasSavedPaint(compId: string) {
  try { return !!localStorage.getItem(`${STORAGE_PREFIX}${compId}`); }
  catch { return false; }
}

// ── Component ──────────────────────────────────────────────────────────────────
export interface HeroPaintingCanvasProps {
  className?: string;
}

export function HeroPaintingCanvas({ className }: HeroPaintingCanvasProps) {
  const [compositionId,  setCompositionId]  = useState(COMPOSITIONS[0].id);
  const [showController, setShowController] = useState(false);
  const [ghostSrc,       setGhostSrc]       = useState("");
  const [isReady,        setIsReady]        = useState(false);
  const [stencilSize,    setStencilSize]    = useState(STENCIL_SIZE);

  // hasDrawn drives the "click to paint" hint visibility.
  // Initialise to true when there's already saved paint so the hint never flashes.
  const [hasDrawn, setHasDrawn] = useState(() => hasSavedPaint(COMPOSITIONS[0].id));
  const hasDrawnRef = useRef(hasDrawn);

  // Paint tool values — both React state (for UI sync) and refs (for RAF callbacks).
  // Refs are updated immediately in the setters so the very next draw call sees the
  // new value without waiting for a re-render cycle.
  const [color,     setColor]     = useState(() => readSavedPaintState().color);
  const [brushSize, setBrushSize] = useState(() => readSavedPaintState().brushSize);
  const [opacity,   setOpacity]   = useState(() => readSavedPaintState().opacity);
  const colorRef    = useRef(color);
  const brushRef    = useRef(brushSize);
  const opacityRef  = useRef(opacity);

  const handleColorChange = useCallback((c: string) => {
    colorRef.current = c; setColor(c);
  }, []);
  const handleBrushChange = useCallback((s: number) => {
    brushRef.current = s; setBrushSize(s);
  }, []);
  const handleOpacityChange = useCallback((o: number) => {
    opacityRef.current = o; setOpacity(o);
  }, []);

  // DOM refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);

  // Offscreen buffer refs
  const surfaceRef = useRef<HTMLCanvasElement | null>(null); // pre-computed linen texture
  const stencilRef = useRef<HTMLCanvasElement | null>(null); // binary mask
  const paintRef   = useRef<HTMLCanvasElement | null>(null); // accumulated strokes
  const strokeRef  = useRef<HTMLCanvasElement | null>(null); // current in-flight stroke

  // Stable drawing-state refs (never trigger re-renders)
  const isDrawingRef     = useRef(false);
  const lastPosRef       = useRef({ x: 0, y: 0 });
  const dirtyRef         = useRef(true);
  const rafRef           = useRef<number>(0);
  const compositionIdRef = useRef(compositionId);
  const stencilSizeRef   = useRef(STENCIL_SIZE);
  useEffect(() => { compositionIdRef.current = compositionId; }, [compositionId]);

  // ── Ghost SVG blob ────────────────────────────────────────────────────────────
  // Object URL is revoked on cleanup; Framer Motion's AnimatePresence keeps the
  // old src alive during exit, so we delay revoke via the effect cleanup.
  useEffect(() => {
    const comp  = COMPOSITIONS.find(c => c.id === compositionId) ?? COMPOSITIONS[0];
    const ghost = comp.svg.replace(/currentColor/g, "hsl(30,10%,20%)");
    const blob  = new Blob([ghost], { type: "image/svg+xml" });
    const url   = URL.createObjectURL(blob);
    setGhostSrc(url);
    return () => { setTimeout(() => URL.revokeObjectURL(url), 500); };
  }, [compositionId]);

  // ── RAF render loop (dirty-flag: only repaints when state changes) ────────────
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;

    // 1. Pre-computed linen surface (no per-frame computation)
    if (surfaceRef.current) {
      ctx.drawImage(surfaceRef.current, 0, 0);
    } else {
      ctx.fillStyle = "hsl(42,30%,94%)";
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Accumulated paint from past strokes (already stencil-clipped)
    if (paintRef.current) ctx.drawImage(paintRef.current, 0, 0);

    // 3. Active stroke clipped to stencil via scratch canvas (one blend op/frame)
    if (isDrawingRef.current && strokeRef.current && stencilRef.current) {
      const tmpCtx = getTmpCtx(w, h);
      tmpCtx.drawImage(strokeRef.current, 0, 0);
      tmpCtx.globalCompositeOperation = "destination-in";
      tmpCtx.drawImage(stencilRef.current, 0, 0);
      tmpCtx.globalCompositeOperation = "source-over";
      ctx.drawImage(_tmpCanvas!, 0, 0);
    }
  }, []);

  useEffect(() => {
    const tick = () => {
      if (dirtyRef.current) { renderFrame(); dirtyRef.current = false; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [renderFrame]);

  // ── Buffer initialisation ─────────────────────────────────────────────────────
  const initBuffers = useCallback(async (w: number, h: number, compId: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width  = w;
    canvas.height = h;

    const ss = Math.min(STENCIL_SIZE, Math.round(w * 0.85));
    stencilSizeRef.current = ss;
    setStencilSize(ss);
    const ox = Math.round((w - ss) / 2);
    const oy = Math.round((h - ss) / 2);

    const mkBuf = () => {
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      return c;
    };

    // Build surface texture once; it stays valid until next resize
    surfaceRef.current = buildSurface(w, h);
    stencilRef.current = mkBuf();
    paintRef.current   = mkBuf();
    strokeRef.current  = mkBuf();

    const comp = COMPOSITIONS.find(c => c.id === compId) ?? COMPOSITIONS[0];
    await buildStencilMask(stencilRef.current, comp.svg, ox, oy, ss);

    // Restore saved paint
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}${compId}`);
      if (saved) {
        const img = new Image();
        img.src = saved;
        img.onload = () => {
          paintRef.current?.getContext("2d")?.drawImage(img, 0, 0);
          dirtyRef.current = true;
        };
      }
    } catch { /* localStorage unavailable */ }

    dirtyRef.current = true;
    setIsReady(true);
  }, []);

  // Mount once; ResizeObserver handles viewport changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    initBuffers(container.clientWidth, CANVAS_HEIGHT, compositionId);

    const ro = new ResizeObserver(entries => {
      const newW = Math.round(entries[0].contentRect.width);
      if (newW === canvasRef.current?.width) return;

      // Persist before rebuild so the restored paint is at the new dimensions
      if (paintRef.current) {
        try {
          localStorage.setItem(
            `${STORAGE_PREFIX}${compositionIdRef.current}`,
            paintRef.current.toDataURL("image/webp", 0.6),
          );
        } catch { /* quota exceeded */ }
      }

      initBuffers(newW, CANVAS_HEIGHT, compositionIdRef.current);
    });

    ro.observe(container);
    return () => ro.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runs once — composition changes are handled below

  // Composition switch: swap stencil + paint buffers, restore saved paint
  useEffect(() => {
    if (!isReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.width, h = canvas.height;
    const ss = stencilSizeRef.current;
    const ox = Math.round((w - ss) / 2);
    const oy = Math.round((h - ss) / 2);

    const newStencil = document.createElement("canvas");
    newStencil.width = w; newStencil.height = h;
    stencilRef.current = newStencil;

    const newStroke = document.createElement("canvas");
    newStroke.width = w; newStroke.height = h;
    strokeRef.current = newStroke;

    const newPaint = document.createElement("canvas");
    newPaint.width = w; newPaint.height = h;
    paintRef.current = newPaint;

    // Update hasDrawn hint for this composition
    const alreadyPainted = hasSavedPaint(compositionId);
    hasDrawnRef.current = alreadyPainted;
    setHasDrawn(alreadyPainted);

    const comp = COMPOSITIONS.find(c => c.id === compositionId) ?? COMPOSITIONS[0];
    buildStencilMask(newStencil, comp.svg, ox, oy, ss).then(() => {
      try {
        const saved = localStorage.getItem(`${STORAGE_PREFIX}${compositionId}`);
        if (saved) {
          const img  = new Image();
          img.src    = saved;
          img.onload = () => { newPaint.getContext("2d")?.drawImage(img, 0, 0); dirtyRef.current = true; };
          return;
        }
      } catch { /* ignore */ }
      dirtyRef.current = true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compositionId]); // isReady intentionally excluded (first-run gate)

  // ── Painting ──────────────────────────────────────────────────────────────────
  const canvasCoords = useCallback((clientX: number, clientY: number) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return null;
    return { x: clientX - r.left, y: clientY - r.top };
  }, []);

  // startStroke uses a ref for hasDrawn so it never needs to recreate,
  // which would otherwise cause the touch listener effect to re-run.
  const startStroke = useCallback((x: number, y: number) => {
    isDrawingRef.current = true;
    lastPosRef.current   = { x, y };
    if (!hasDrawnRef.current) { hasDrawnRef.current = true; setHasDrawn(true); }
  }, []); // stable — no deps

  const addPoint = useCallback((x: number, y: number) => {
    if (!isDrawingRef.current || !strokeRef.current) return;
    const prev  = lastPosRef.current;
    const angle = Math.atan2(y - prev.y, x - prev.x);
    const dist  = Math.hypot(x - prev.x, y - prev.y);
    const steps = Math.max(1, Math.floor(dist / 5));
    const sCtx  = strokeRef.current.getContext("2d")!;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      drawBristleDab(
        sCtx,
        prev.x + (x - prev.x) * t,
        prev.y + (y - prev.y) * t,
        angle,
        colorRef.current,
        brushRef.current,
        opacityRef.current,
      );
    }
    lastPosRef.current = { x, y };
    dirtyRef.current   = true;
  }, []); // stable — reads only from refs

  const endStroke = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const stroke  = strokeRef.current;
    const paint   = paintRef.current;
    const stencil = stencilRef.current;
    if (!stroke || !paint || !stencil) return;

    const w = stroke.width, h = stroke.height;

    // One clip op per stroke, not per dab — blit stroke onto stencil mask
    const sCtx = stroke.getContext("2d")!;
    sCtx.globalCompositeOperation = "destination-in";
    sCtx.drawImage(stencil, 0, 0);
    sCtx.globalCompositeOperation = "source-over";

    // Merge into persistent paint layer
    paint.getContext("2d")!.drawImage(stroke, 0, 0);
    sCtx.clearRect(0, 0, w, h);

    // Persist to localStorage
    try {
      localStorage.setItem(
        `${STORAGE_PREFIX}${compositionIdRef.current}`,
        paint.toDataURL("image/webp", 0.6),
      );
    } catch { /* quota exceeded */ }

    dirtyRef.current = true;
  }, []); // stable — reads only from refs

  const handleReset = useCallback(() => {
    if (!paintRef.current) return;
    paintRef.current.getContext("2d")!.clearRect(
      0, 0, paintRef.current.width, paintRef.current.height,
    );
    try { localStorage.removeItem(`${STORAGE_PREFIX}${compositionIdRef.current}`); } catch { /* ignore */ }
    hasDrawnRef.current = false;
    setHasDrawn(false);
    dirtyRef.current = true;
  }, []);

  // ── Mouse handlers ────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = canvasCoords(e.clientX, e.clientY);
    if (p) startStroke(p.x, p.y);
  }, [canvasCoords, startStroke]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const p = canvasCoords(e.clientX, e.clientY);
    if (p) addPoint(p.x, p.y);
  }, [canvasCoords, addPoint]);

  const onMouseUp    = useCallback(() => endStroke(), [endStroke]);
  const onMouseLeave = useCallback(() => { if (isDrawingRef.current) endStroke(); }, [endStroke]);

  // ── Native touch listeners ({ passive: false } required to preventDefault) ────
  // React 17+ attaches synthetic events at the root with passive:true, so
  // e.preventDefault() in onTouchMove has no effect — the browser scrolls anyway.
  // We bypass React delegation and attach directly to the DOM element.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const onTS = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      const p = canvasCoords(t.clientX, t.clientY);
      if (p) startStroke(p.x, p.y);
    };
    const onTM = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      const p = canvasCoords(t.clientX, t.clientY);
      if (p) addPoint(p.x, p.y);
    };
    const onTE = () => endStroke();

    el.addEventListener("touchstart", onTS, { passive: false });
    el.addEventListener("touchmove",  onTM, { passive: false });
    el.addEventListener("touchend",   onTE);
    return () => {
      el.removeEventListener("touchstart", onTS);
      el.removeEventListener("touchmove",  onTM);
      el.removeEventListener("touchend",   onTE);
    };
  }, [canvasCoords, startStroke, addPoint, endStroke]);
  // startStroke/addPoint/endStroke are now stable (empty deps), so this effect
  // only runs once — no spurious touch listener re-attachment on paint.

  // ── JSX ───────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      ref={containerRef}
      style={{ height: CANVAS_HEIGHT }}
      className={cn("relative overflow-hidden rounded-2xl", className)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* ── Paint canvas ─────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none cursor-crosshair"
        style={{ width: "100%", height: CANVAS_HEIGHT }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      />

      {/* ── Ghost SVG guide ───────────────────────────────── */}
      <AnimatePresence mode="wait">
        {ghostSrc && (
          <motion.img
            key={compositionId}
            src={ghostSrc}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute select-none"
            style={{
              width:     stencilSize,
              height:    stencilSize,
              left:      "50%",
              top:       "50%",
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 0.1,  scale: 1    }}
            exit={{    opacity: 0,    scale: 1.04, transition: { duration: 0.2 } }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* ── "Click to paint" hint ─────────────────────────── */}
      <AnimatePresence>
        {isReady && !hasDrawn && (
          <motion.p
            className="pointer-events-none absolute left-1/2 select-none text-center text-xs text-foreground/30"
            style={{
              top:       "50%",
              transform: `translate(-50%, calc(${stencilSize / 2 + 16}px))`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.9, duration: 0.6 } }}
            exit={{    opacity: 0, transition: { duration: 0.25 } }}
          >
            boyamak için tıkla ve sürükle
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Toolbar: reset + palette toggle ──────────────── */}
      <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          onClick={handleReset}
          title="Boyamayı temizle"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-card/80 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-destructive/40 hover:text-destructive"
        >
          <RotateCcw size={14} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => setShowController(v => !v)}
          title="Boya kontrolleri"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm backdrop-blur-sm transition-colors",
            showController
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border/50 bg-card/80 text-muted-foreground hover:text-foreground",
          )}
        >
          <Palette size={14} />
        </motion.button>
      </div>

      {/* ── Floating painting controller ──────────────────── */}
      <AnimatePresence>
        {showController && (
          <motion.div
            key="ctrl"
            className="absolute right-3 top-[3.25rem] z-20 w-56 sm:w-60"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <CanvasPaintingController
              onColorChange={handleColorChange}
              onOpacityChange={handleOpacityChange}
              onBrushSizeChange={handleBrushChange}
              onReset={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Composition selector ──────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-2 bg-gradient-to-t from-card/70 to-transparent p-3 backdrop-blur-[2px]">
        {COMPOSITIONS.map((comp, i) => {
          const active = comp.id === compositionId;
          return (
            <motion.button
              key={comp.id}
              onClick={() => setCompositionId(comp.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.07, ease: "easeOut" }}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl border px-4 py-2 text-xs font-medium transition-all",
                active
                  ? "border-border bg-card text-foreground shadow-sm"
                  : "border-transparent bg-card/50 text-muted-foreground hover:border-border/50 hover:bg-card/70",
              )}
            >
              <span className="font-medium leading-tight">{comp.label}</span>
              <span className={cn("text-[10px] leading-tight", active ? "text-primary" : "text-muted-foreground/60")}>
                {comp.sublabel}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
