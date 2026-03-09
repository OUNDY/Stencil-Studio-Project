import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { motifs, type Motif } from "./motifs";
import { Slider } from "@/components/ui/slider";
import type { StyleType } from "./StyleSelection";

interface WallMotifDemoProps {
  selectedStyle?: StyleType;
}

const STYLE_PALETTES: Record<StyleType, string[]> = {
  minimal: ["#8B8680", "#B5AFA8", "#6B6560"],
  bold: ["#C0392B", "#E67E22", "#2C3E50"],
  organic: ["#5D8A66", "#C4956A", "#8B6F47"],
  geometric: ["#3B6B8C", "#5A8FA8", "#7FAFCA"],
  maximalist: ["#9B59B6", "#E67E22", "#E74C3C"],
  handcrafted: ["#A0522D", "#CD853F", "#8B4513"],
};

export const WallMotifDemo = ({ selectedStyle = "organic" }: WallMotifDemoProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedMotif, setSelectedMotif] = useState<Motif>(motifs[0]);
  const [brushSize, setBrushSize] = useState(50);
  const [density, setDensity] = useState(60);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const palette = STYLE_PALETTES[selectedStyle];

  const drawMotifAt = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      const size = brushSize * 0.8 + Math.random() * brushSize * 0.4;
      const rotation = Math.random() * Math.PI * 2;
      const color = palette[Math.floor(Math.random() * palette.length)];
      const alpha = 0.4 + Math.random() * 0.5;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(size / 120, size / 120);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.fillStyle = "none";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      selectedMotif.paths.forEach((pathData) => {
        const path = new Path2D(pathData);
        ctx.stroke(path);
      });

      ctx.restore();
    },
    [brushSize, selectedMotif, palette]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const dist = Math.hypot(x - lastPosRef.current.x, y - lastPosRef.current.y);
      const spacing = Math.max(15, 120 - density);

      if (dist >= spacing) {
        const steps = Math.floor(dist / spacing);
        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          const mx = lastPosRef.current.x + (x - lastPosRef.current.x) * t;
          const my = lastPosRef.current.y + (y - lastPosRef.current.y) * t;
          drawMotifAt(ctx, mx, my);
        }
        lastPosRef.current = { x, y };
      }
    },
    [isDrawing, density, drawMotifAt]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      setIsDrawing(true);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      lastPosRef.current = { x, y };

      const ctx = canvas.getContext("2d");
      if (ctx) drawMotifAt(ctx, x, y);
    },
    [drawMotifAt]
  );

  const handlePointerUp = useCallback(() => setIsDrawing(false), []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Redraw wall background
    drawWallTexture(ctx, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const container = canvas.parentElement;
    if (!container) return;
    const w = container.clientWidth;
    const h = 420;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      drawWallTexture(ctx, canvas.width, canvas.height);
    }
  }, []);

  return (
    <motion.section
      className="w-full py-16 px-4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-2">
            Motifini Dene
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Bir desen seç, duvar üzerine boyamaya başla
          </p>
        </motion.div>

        {/* Motif selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {motifs.map((motif) => (
            <motion.button
              key={motif.id}
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all ${
                selectedMotif.id === motif.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/30"
              }`}
              onClick={() => setSelectedMotif(motif)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                viewBox={motif.viewBox}
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                {motif.paths.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </svg>
              <span className="text-xs text-muted-foreground">{motif.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
          <div className="flex items-center gap-3 min-w-[180px]">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Boyut</span>
            <Slider
              value={[brushSize]}
              onValueChange={([v]) => setBrushSize(v)}
              min={20}
              max={100}
              step={5}
              className="w-28"
            />
            <span className="text-xs text-foreground w-6 text-right">{brushSize}</span>
          </div>
          <div className="flex items-center gap-3 min-w-[180px]">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Yoğunluk</span>
            <Slider
              value={[density]}
              onValueChange={([v]) => setDensity(v)}
              min={20}
              max={100}
              step={5}
              className="w-28"
            />
            <span className="text-xs text-foreground w-6 text-right">{density}</span>
          </div>
          <motion.button
            className="px-4 py-2 text-xs rounded-lg border border-border bg-card hover:bg-accent text-foreground transition-colors"
            onClick={clearCanvas}
            whileTap={{ scale: 0.95 }}
          >
            Temizle
          </motion.button>
        </div>

        {/* Canvas */}
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-organic-elevated">
          <canvas
            ref={canvasRef}
            className="w-full cursor-crosshair touch-none"
            style={{ height: 420 }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        </div>
      </div>
    </motion.section>
  );
};

/** Draw a subtle wall-like texture background on the canvas */
function drawWallTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Base color
  ctx.fillStyle = "#F5F0EB";
  ctx.fillRect(0, 0, w, h);

  // Subtle grain noise
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const gray = 180 + Math.random() * 50;
    ctx.fillStyle = `rgba(${gray}, ${gray - 5}, ${gray - 10}, 0.15)`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }
}
