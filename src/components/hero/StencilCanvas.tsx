import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import wallEmpty from "@/assets/wall-empty.png";
import wallPainted from "@/assets/wall-painted.png";

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
};

interface BrushStroke {
  points: { x: number; y: number }[];
  width: number;
  opacity: number;
  createdAt: number;
  angle: number;
}

interface StencilCanvasProps {
  onFirstInteraction: () => void;
  onExplorationComplete: () => void;
}

const BRUSH_WIDTH = 60;
const FADE_DURATION = 25000;
const FADE_START_DELAY = 5000;

export const StencilCanvas = ({ onFirstInteraction, onExplorationComplete }: StencilCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const brushTextureRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<BrushStroke[]>([]);
  const currentStrokeRef = useRef<BrushStroke | null>(null);
  const hasInteractedRef = useRef(false);
  const interactionCountRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const lastPosRef = useRef({ x: 0, y: 0 });
  const isDrawingRef = useRef(false);
  const emptyImageRef = useRef<HTMLImageElement | null>(null);
  const paintedImageRef = useRef<HTMLImageElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [revealProgress, setRevealProgress] = useState(0);
  const isDark = useDarkMode();
  // Create rectangular brush texture with bristles
  const createBrushTexture = useCallback(() => {
    const width = 120;
    const height = 40;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Clear with transparency
    ctx.clearRect(0, 0, width, height);

    // Create rectangular brush base with soft edges
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
    gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.9)");
    gradient.addColorStop(0.8, "rgba(255, 255, 255, 0.9)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.3)");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add bristle lines following brush direction (horizontal)
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * width;
      const y = 4 + Math.random() * (height - 8);
      const bristleLength = 15 + Math.random() * 25;
      const bristleWidth = 0.5 + Math.random() * 1.5;
      
      ctx.save();
      ctx.translate(x, y);
      // Bristles follow horizontal direction with slight variation
      ctx.rotate((Math.random() - 0.5) * 0.15);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.random() * 0.5})`;
      ctx.fillRect(-bristleLength / 2, -bristleWidth / 2, bristleLength, bristleWidth);
      ctx.restore();
    }

    // Add edge softness
    const edgeGradientLeft = ctx.createLinearGradient(0, 0, 20, 0);
    edgeGradientLeft.addColorStop(0, "rgba(0, 0, 0, 1)");
    edgeGradientLeft.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = edgeGradientLeft;
    ctx.fillRect(0, 0, 20, height);

    const edgeGradientRight = ctx.createLinearGradient(width - 20, 0, width, 0);
    edgeGradientRight.addColorStop(0, "rgba(0, 0, 0, 0)");
    edgeGradientRight.addColorStop(1, "rgba(0, 0, 0, 1)");
    ctx.fillStyle = edgeGradientRight;
    ctx.fillRect(width - 20, 0, 20, height);

    return canvas;
  }, []);

  const drawBrushStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: BrushStroke) => {
    if (stroke.points.length < 2 || !brushTextureRef.current) return;

    ctx.save();
    ctx.globalAlpha = stroke.opacity;

    const brushCanvas = brushTextureRef.current;
    const brushWidth = brushCanvas.width;
    const brushHeight = brushCanvas.height;

    for (let i = 1; i < stroke.points.length; i++) {
      const p0 = stroke.points[i - 1];
      const p1 = stroke.points[i];
      
      // Calculate angle based on movement direction
      const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      const distance = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      const steps = Math.max(1, Math.floor(distance / 6));

      for (let j = 0; j <= steps; j++) {
        const t = j / steps;
        const x = p0.x + (p1.x - p0.x) * t;
        const y = p0.y + (p1.y - p0.y) * t;
        
        ctx.save();
        ctx.translate(x, y);
        // Rotate brush to follow movement direction
        ctx.rotate(angle);
        
        // Scale brush with slight variation for realism
        const scaleX = stroke.width * (0.95 + Math.random() * 0.1);
        const scaleY = stroke.width * 0.35 * (0.9 + Math.random() * 0.2);
        
        ctx.drawImage(
          brushCanvas,
          -scaleX / 2,
          -scaleY / 2,
          scaleX,
          scaleY
        );
        ctx.restore();
      }
    }

    ctx.restore();
  }, []);

  const addPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    if (!currentStrokeRef.current) {
      const angle = Math.atan2(y - lastPosRef.current.y, x - lastPosRef.current.x);
      currentStrokeRef.current = {
        points: [{ x, y }],
        width: BRUSH_WIDTH + Math.random() * 20,
        opacity: 1,
        createdAt: Date.now(),
        angle,
      };
    } else {
      currentStrokeRef.current.points.push({ x, y });
    }

    lastPosRef.current = { x, y };

    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      setShowHint(false);
      onFirstInteraction();
    }

    interactionCountRef.current++;
    setRevealProgress(Math.min(100, interactionCountRef.current / 2));
    
    if (interactionCountRef.current === 100) {
      onExplorationComplete();
    }
  }, [onFirstInteraction, onExplorationComplete]);

  const endStroke = useCallback(() => {
    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
      strokesRef.current.push(currentStrokeRef.current);
    }
    currentStrokeRef.current = null;
    isDrawingRef.current = false;
  }, []);

  // Hover-based painting - no click required
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Start a new stroke if not already drawing
    if (!isDrawingRef.current) {
      isDrawingRef.current = true;
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        lastPosRef.current = {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
        };
      }
    }
    addPoint(e.clientX, e.clientY);
  }, [addPoint]);

  const handleMouseEnter = useCallback((e: MouseEvent) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      lastPosRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    endStroke();
  }, [endStroke]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      e.preventDefault();
      addPoint(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [addPoint]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        lastPosRef.current = {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY,
        };
      }
      addPoint(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [addPoint]);

  const handleTouchEnd = useCallback(() => {
    endStroke();
  }, [endStroke]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create brush texture
    brushTextureRef.current = createBrushTexture();

    // Create mask canvas
    maskCanvasRef.current = document.createElement("canvas");

    // Load images
    const emptyImg = new Image();
    const paintedImg = new Image();
    let loadedCount = 0;

    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        setIsReady(true);
        resize();
        startAnimation();
      }
    };

    emptyImg.onload = () => {
      emptyImageRef.current = emptyImg;
      checkLoaded();
    };

    paintedImg.onload = () => {
      paintedImageRef.current = paintedImg;
      checkLoaded();
    };

    emptyImg.src = wallEmpty;
    paintedImg.src = wallPainted;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      if (maskCanvasRef.current) {
        maskCanvasRef.current.width = canvas.width;
        maskCanvasRef.current.height = canvas.height;
      }
    };

    const startAnimation = () => {
      window.addEventListener("resize", resize);
      canvas.addEventListener("mouseenter", handleMouseEnter);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseleave", handleMouseLeave);
      canvas.addEventListener("touchstart", handleTouchStart);
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
      canvas.addEventListener("touchend", handleTouchEnd);
      animate();
    };

    const animate = () => {
      if (!ctx || !maskCanvasRef.current || !emptyImageRef.current || !paintedImageRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const maskCtx = maskCanvasRef.current.getContext("2d");
      if (!maskCtx) return;

      const now = Date.now();

      // Clear mask
      maskCtx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);

      // Update and draw strokes
      strokesRef.current = strokesRef.current.filter(stroke => {
        const age = now - stroke.createdAt;
        
        if (age > FADE_START_DELAY) {
          const fadeProgress = (age - FADE_START_DELAY) / FADE_DURATION;
          stroke.opacity = Math.max(0, 1 - fadeProgress);
        }
        
        return stroke.opacity > 0;
      });

      // Draw all strokes on mask
      strokesRef.current.forEach(stroke => {
        drawBrushStroke(maskCtx, stroke);
      });

      // Draw current stroke
      if (currentStrokeRef.current) {
        drawBrushStroke(maskCtx, currentStrokeRef.current);
      }

      // Composite final image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw painted image
      ctx.drawImage(paintedImageRef.current, 0, 0, canvas.width, canvas.height);
      
      // Apply mask
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(maskCanvasRef.current, 0, 0);
      
      // Draw empty wall underneath
      ctx.globalCompositeOperation = "destination-over";
      ctx.drawImage(emptyImageRef.current, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";

      // Night overlay for dark mode
      if (isDark) {
        // Dark ambient layer
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = "rgba(18, 16, 14, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "source-over";

        const w = canvas.width;
        const h = canvas.height;

        // Top-center soft warm glow
        const g1 = ctx.createRadialGradient(w * 0.5, h * 0.15, 0, w * 0.5, h * 0.15, h * 0.6);
        g1.addColorStop(0, "rgba(255, 195, 120, 0.22)");
        g1.addColorStop(0.35, "rgba(255, 180, 100, 0.10)");
        g1.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = g1;
        ctx.fillRect(0, 0, w, h);

        // Left-side warm accent
        const g2 = ctx.createRadialGradient(w * 0.12, h * 0.35, 0, w * 0.12, h * 0.35, h * 0.45);
        g2.addColorStop(0, "rgba(255, 170, 90, 0.16)");
        g2.addColorStop(0.4, "rgba(255, 160, 80, 0.06)");
        g2.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, w, h);

        // Right-side warm accent
        const g3 = ctx.createRadialGradient(w * 0.88, h * 0.45, 0, w * 0.88, h * 0.45, h * 0.4);
        g3.addColorStop(0, "rgba(255, 180, 100, 0.14)");
        g3.addColorStop(0.4, "rgba(255, 160, 80, 0.05)");
        g3.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = g3;
        ctx.fillRect(0, 0, w, h);

        // Bottom warm fill light
        const g4 = ctx.createRadialGradient(w * 0.5, h * 0.85, 0, w * 0.5, h * 0.85, h * 0.5);
        g4.addColorStop(0, "rgba(255, 190, 110, 0.10)");
        g4.addColorStop(0.5, "rgba(255, 170, 90, 0.04)");
        g4.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = g4;
        ctx.fillRect(0, 0, w, h);

        // Vignette
        const vignette = ctx.createRadialGradient(w * 0.5, h * 0.5, h * 0.25, w * 0.5, h * 0.5, h * 0.75);
        vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
        vignette.addColorStop(1, "rgba(0, 0, 0, 0.35)");
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

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
  }, [isDark, createBrushTexture, drawBrushStroke, handleMouseEnter, handleMouseMove, handleMouseLeave, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[2]"
        style={{ cursor: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><circle cx=\"16\" cy=\"16\" r=\"12\" fill=\"none\" stroke=\"%23666\" stroke-width=\"1\" stroke-dasharray=\"3,3\"/></svg>') 16 16, crosshair" }}
      />

      {/* Loading state */}
      {!isReady && (
        <div className="fixed inset-0 z-[3] bg-background flex items-center justify-center">
          <motion.div
            className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* Minimal guidance overlay */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            className="fixed inset-0 z-[4] pointer-events-none flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {/* Brand mark - centered "Stencil" */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: showHint ? 0.12 : 0.04, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-serif text-7xl md:text-9xl lg:text-[12rem] text-foreground tracking-tight text-center">
                Stencil
              </h1>
            </motion.div>

            {/* Hint text */}
            <motion.div
              className="absolute bottom-20 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showHint ? 1 : 0, y: showHint ? 0 : 10 }}
              transition={{ delay: 1.5, duration: 0.6 }}
            >
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  className="w-8 h-8 rounded-full border border-muted-foreground/40 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    animate={{ x: [-4, 4, -4], y: [-2, 2, -2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
                <p className="text-sm text-muted-foreground/70 font-sans">
                  tıkla ve sürükle
                </p>
              </div>
            </motion.div>

            {/* Progress indicator - subtle */}
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: revealProgress > 0 ? 0.6 : 0 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-24 h-0.5 bg-muted-foreground/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${revealProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
