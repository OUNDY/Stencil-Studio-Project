import { useRef, useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import wallEmpty from "@/assets/wall-empty.png";
import wallPainted from "@/assets/wall-painted.png";

interface BrushPoint {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  createdAt: number;
}

interface StencilCanvasProps {
  onFirstInteraction: () => void;
  onExplorationComplete: () => void;
}

const BRUSH_RADIUS = 80;
const FADE_DURATION = 25000; // 25 seconds to fully fade
const FADE_START_DELAY = 5000; // Start fading after 5 seconds of inactivity

export const StencilCanvas = ({ onFirstInteraction, onExplorationComplete }: StencilCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const brushPointsRef = useRef<BrushPoint[]>([]);
  const hasInteractedRef = useRef(false);
  const interactionCountRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const lastPosRef = useRef({ x: 0, y: 0 });
  const imagesLoadedRef = useRef({ empty: false, painted: false });
  const emptyImageRef = useRef<HTMLImageElement | null>(null);
  const paintedImageRef = useRef<HTMLImageElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const addBrushPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    const distance = Math.hypot(x - lastPosRef.current.x, y - lastPosRef.current.y);
    
    if (distance > 15) {
      // Add intermediate points for smooth strokes
      const steps = Math.ceil(distance / 15);
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const px = lastPosRef.current.x + (x - lastPosRef.current.x) * t;
        const py = lastPosRef.current.y + (y - lastPosRef.current.y) * t;
        
        brushPointsRef.current.push({
          x: px,
          y: py,
          radius: BRUSH_RADIUS + Math.random() * 20,
          opacity: 1,
          createdAt: Date.now(),
        });
      }
      
      lastPosRef.current = { x, y };
      
      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true;
        setShowHint(false);
        onFirstInteraction();
      }
      
      interactionCountRef.current++;
      if (interactionCountRef.current === 50) {
        onExplorationComplete();
      }
    }
  }, [onFirstInteraction, onExplorationComplete]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    addBrushPoint(e.clientX, e.clientY);
  }, [addBrushPoint]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      e.preventDefault();
      addBrushPoint(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [addBrushPoint]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      lastPosRef.current = {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create mask canvas
    maskCanvasRef.current = document.createElement("canvas");
    const maskCtx = maskCanvasRef.current.getContext("2d");
    if (!maskCtx) return;

    // Load images
    const emptyImg = new Image();
    const paintedImg = new Image();

    emptyImg.onload = () => {
      emptyImageRef.current = emptyImg;
      imagesLoadedRef.current.empty = true;
      checkImagesLoaded();
    };

    paintedImg.onload = () => {
      paintedImageRef.current = paintedImg;
      imagesLoadedRef.current.painted = true;
      checkImagesLoaded();
    };

    emptyImg.src = wallEmpty;
    paintedImg.src = wallPainted;

    const checkImagesLoaded = () => {
      if (imagesLoadedRef.current.empty && imagesLoadedRef.current.painted) {
        setIsReady(true);
        resize();
        startAnimation();
      }
    };

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
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchstart", handleTouchStart);
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

      // Clear mask canvas
      maskCtx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);

      // Update and draw brush points on mask
      brushPointsRef.current = brushPointsRef.current.filter(point => {
        const age = now - point.createdAt;
        
        if (age > FADE_START_DELAY) {
          const fadeProgress = (age - FADE_START_DELAY) / FADE_DURATION;
          point.opacity = Math.max(0, 1 - fadeProgress);
        }
        
        return point.opacity > 0;
      });

      // Draw brush strokes on mask
      brushPointsRef.current.forEach(point => {
        const gradient = maskCtx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, point.radius
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${point.opacity})`);
        gradient.addColorStop(0.6, `rgba(255, 255, 255, ${point.opacity * 0.5})`);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        maskCtx.fillStyle = gradient;
        maskCtx.beginPath();
        maskCtx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        maskCtx.fill();
      });

      // Draw empty wall as background
      ctx.drawImage(emptyImageRef.current, 0, 0, canvas.width, canvas.height);

      // Draw painted wall with mask
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      
      // Create clipping from mask
      const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Draw painted image
      ctx.drawImage(paintedImageRef.current, 0, 0, canvas.width, canvas.height);
      
      // Apply mask using destination-in
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(maskCanvasRef.current, 0, 0);
      
      ctx.restore();

      // Redraw empty wall underneath
      ctx.globalCompositeOperation = "destination-over";
      ctx.drawImage(emptyImageRef.current, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchStart);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleMouseMove, handleTouchMove, handleTouchStart]);

  return (
    <>
      {/* Canvas for stencil reveal effect */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[2] cursor-crosshair"
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

      {/* Hint text - fades after interaction */}
      <motion.div
        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[5] pointer-events-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showHint && isReady ? 0.7 : 0, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <p className="text-sm text-muted-foreground font-sans tracking-wide bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full">
          duvarı boyamaya başla...
        </p>
      </motion.div>
    </>
  );
};
