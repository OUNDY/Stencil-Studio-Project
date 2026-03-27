import { useRef, useEffect, useCallback } from "react";
import type { Motif } from "../motifs";

interface BrushStroke {
  points: { x: number; y: number }[];
  width: number;
  opacity: number;
  angle: number;
}

interface StencilCanvasProps {
  motif: Motif;
}

const BRUSH_WIDTH = 60;

export const StencilCanvas = ({ motif }: StencilCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const wallCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const motifCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const brushTextureRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<BrushStroke[]>([]);
  const currentStrokeRef = useRef<BrushStroke | null>(null);
  const animationFrameRef = useRef<number>();
  const lastPosRef = useRef({ x: 0, y: 0 });
  const isDrawingRef = useRef(false);

  // ── Procedural wall texture ──────────────────────────────────────────
  const createWallTexture = useCallback(
    (width: number, height: number) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return canvas;

      // Base plaster colour
      ctx.fillStyle = "#e8ddd0";
      ctx.fillRect(0, 0, width, height);

      // Subtle noise grain
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 18;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
      }
      ctx.putImageData(imageData, 0, 0);

      // Large-scale colour variation
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = 100 + Math.random() * 200;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const tone = Math.random() > 0.5 ? "rgba(200,185,165," : "rgba(220,210,195,";
        g.addColorStop(0, tone + "0.12)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      }

      // Fine cracks / surface lines
      ctx.strokeStyle = "rgba(180,165,145,0.15)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        let cx = Math.random() * width;
        let cy = Math.random() * height;
        ctx.moveTo(cx, cy);
        for (let j = 0; j < 4; j++) {
          cx += (Math.random() - 0.5) * 80;
          cy += (Math.random() - 0.5) * 80;
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();
      }

      return canvas;
    },
    []
  );

  // ── Render SVG motif to offscreen canvas ─────────────────────────────
  const createMotifTexture = useCallback(
    (width: number, height: number) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return canvas;

      const blob = new Blob([motif.svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        // Tile the motif across the canvas
        const tileW = img.naturalWidth;
        const tileH = img.naturalHeight;
        for (let y = 0; y < height; y += tileH) {
          for (let x = 0; x < width; x += tileW) {
            ctx.drawImage(img, x, y, tileW, tileH);
          }
        }
        URL.revokeObjectURL(url);
      };

      img.src = url;
      return canvas;
    },
    [motif.svg]
  );

  // ── Brush bristle texture (adapted from hero StencilCanvas) ──────────
  const createBrushTexture = useCallback(() => {
    const w = 120;
    const h = 40;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, w, h);

    // Rectangular base with soft vertical edges
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(255,255,255,0.3)");
    grad.addColorStop(0.2, "rgba(255,255,255,0.9)");
    grad.addColorStop(0.8, "rgba(255,255,255,0.9)");
    grad.addColorStop(1, "rgba(255,255,255,0.3)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Bristle lines
    for (let i = 0; i < 60; i++) {
      const bx = Math.random() * w;
      const by = 4 + Math.random() * (h - 8);
      const bLen = 15 + Math.random() * 25;
      const bW = 0.5 + Math.random() * 1.5;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate((Math.random() - 0.5) * 0.15);
      ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.random() * 0.5})`;
      ctx.fillRect(-bLen / 2, -bW / 2, bLen, bW);
      ctx.restore();
    }

    // Soft left edge
    ctx.globalCompositeOperation = "destination-out";
    const edgeL = ctx.createLinearGradient(0, 0, 20, 0);
    edgeL.addColorStop(0, "rgba(0,0,0,1)");
    edgeL.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = edgeL;
    ctx.fillRect(0, 0, 20, h);

    // Soft right edge
    const edgeR = ctx.createLinearGradient(w - 20, 0, w, 0);
    edgeR.addColorStop(0, "rgba(0,0,0,0)");
    edgeR.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = edgeR;
    ctx.fillRect(w - 20, 0, 20, h);

    return canvas;
  }, []);

  // ── Draw a single brush stroke onto a context ────────────────────────
  const drawBrushStroke = useCallback(
    (ctx: CanvasRenderingContext2D, stroke: BrushStroke) => {
      if (stroke.points.length < 2 || !brushTextureRef.current) return;

      ctx.save();
      ctx.globalAlpha = stroke.opacity;

      const tex = brushTextureRef.current;

      for (let i = 1; i < stroke.points.length; i++) {
        const p0 = stroke.points[i - 1];
        const p1 = stroke.points[i];
        const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
        const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        const steps = Math.max(1, Math.floor(dist / 6));

        for (let j = 0; j <= steps; j++) {
          const t = j / steps;
          const x = p0.x + (p1.x - p0.x) * t;
          const y = p0.y + (p1.y - p0.y) * t;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);

          const sx = stroke.width * (0.95 + Math.random() * 0.1);
          const sy = stroke.width * 0.35 * (0.9 + Math.random() * 0.2);

          ctx.drawImage(tex, -sx / 2, -sy / 2, sx, sy);
          ctx.restore();
        }
      }

      ctx.restore();
    },
    []
  );

  // ── Coordinate helper ────────────────────────────────────────────────
  const canvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    []
  );

  // ── Add a point to the current stroke ────────────────────────────────
  const addPoint = useCallback(
    (clientX: number, clientY: number) => {
      const { x, y } = canvasCoords(clientX, clientY);

      if (!currentStrokeRef.current) {
        const angle = Math.atan2(
          y - lastPosRef.current.y,
          x - lastPosRef.current.x
        );
        currentStrokeRef.current = {
          points: [{ x, y }],
          width: BRUSH_WIDTH + Math.random() * 20,
          opacity: 1,
          angle,
        };
      } else {
        currentStrokeRef.current.points.push({ x, y });
      }

      lastPosRef.current = { x, y };
    },
    [canvasCoords]
  );

  const endStroke = useCallback(() => {
    if (
      currentStrokeRef.current &&
      currentStrokeRef.current.points.length > 1
    ) {
      strokesRef.current.push(currentStrokeRef.current);
    }
    currentStrokeRef.current = null;
    isDrawingRef.current = false;
  }, []);

  // ── Mouse handlers (hover-to-paint) ──────────────────────────────────
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDrawingRef.current) {
        isDrawingRef.current = true;
        lastPosRef.current = canvasCoords(e.clientX, e.clientY);
      }
      addPoint(e.clientX, e.clientY);
    },
    [addPoint, canvasCoords]
  );

  const handleMouseEnter = useCallback(
    (e: MouseEvent) => {
      isDrawingRef.current = true;
      lastPosRef.current = canvasCoords(e.clientX, e.clientY);
    },
    [canvasCoords]
  );

  const handleMouseLeave = useCallback(() => {
    endStroke();
  }, [endStroke]);

  // ── Touch handlers ───────────────────────────────────────────────────
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length > 0) {
        lastPosRef.current = canvasCoords(
          e.touches[0].clientX,
          e.touches[0].clientY
        );
        addPoint(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [addPoint, canvasCoords]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        addPoint(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [addPoint]
  );

  const handleTouchEnd = useCallback(() => {
    endStroke();
  }, [endStroke]);

  // ── Main effect: setup canvases, event listeners, animation ──────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create brush texture
    brushTextureRef.current = createBrushTexture();

    // Create mask canvas
    maskCanvasRef.current = document.createElement("canvas");

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      if (maskCanvasRef.current) {
        maskCanvasRef.current.width = canvas.width;
        maskCanvasRef.current.height = canvas.height;
      }

      // Regenerate wall + motif textures at new size
      wallCanvasRef.current = createWallTexture(canvas.width, canvas.height);
      motifCanvasRef.current = createMotifTexture(canvas.width, canvas.height);

      // Re-draw existing mask strokes so they aren't lost on resize
      if (maskCanvasRef.current) {
        const maskCtx = maskCanvasRef.current.getContext("2d");
        if (maskCtx) {
          strokesRef.current.forEach((s) => drawBrushStroke(maskCtx, s));
        }
      }
    };

    resize();

    // ── Animation loop ───────────────────────────────────────────────
    const animate = () => {
      if (!maskCanvasRef.current || !wallCanvasRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const maskCtx = maskCanvasRef.current.getContext("2d");
      if (!maskCtx) return;

      // Draw any new in-progress stroke onto the persistent mask
      if (currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
        drawBrushStroke(maskCtx, currentStrokeRef.current);
      }

      // Composite final image
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw motif
      if (motifCanvasRef.current) {
        ctx.drawImage(motifCanvasRef.current, 0, 0);
      }

      // 2. Mask: keep only motif where brush strokes exist
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(maskCanvasRef.current, 0, 0);

      // 3. Fill remaining area with wall texture
      ctx.globalCompositeOperation = "destination-over";
      ctx.drawImage(wallCanvasRef.current, 0, 0);

      ctx.globalCompositeOperation = "source-over";

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start listeners + loop
    window.addEventListener("resize", resize);
    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mouseenter", handleMouseEnter);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    createBrushTexture,
    createWallTexture,
    createMotifTexture,
    drawBrushStroke,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{
        cursor:
          "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><circle cx=\"16\" cy=\"16\" r=\"12\" fill=\"none\" stroke=\"%23666\" stroke-width=\"1\" stroke-dasharray=\"3,3\"/></svg>') 16 16, crosshair",
      }}
    />
  );
};
