import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Point {
  x: number;
  y: number;
  age: number;
  pattern: number;
}

const stencilPatterns = [
  // Botanical leaf pattern
  (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI * 2);
    
    // Leaf shape
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo(size * 0.5, -size * 0.5, size * 0.5, size * 0.5, 0, size);
    ctx.bezierCurveTo(-size * 0.5, size * 0.5, -size * 0.5, -size * 0.5, 0, -size);
    ctx.fillStyle = "hsl(32, 45%, 55%)";
    ctx.fill();
    
    // Leaf vein
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.8);
    ctx.lineTo(0, size * 0.8);
    ctx.strokeStyle = "hsl(32, 35%, 45%)";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
  },
  // Geometric diamond
  (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    
    ctx.beginPath();
    ctx.rect(-size / 2, -size / 2, size, size);
    ctx.fillStyle = "hsl(142, 25%, 55%)";
    ctx.fill();
    
    // Inner square
    ctx.beginPath();
    ctx.rect(-size / 4, -size / 4, size / 2, size / 2);
    ctx.fillStyle = "hsl(142, 20%, 45%)";
    ctx.fill();
    
    ctx.restore();
  },
  // Mandala circle
  (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    
    // Outer circle
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = "hsl(195, 25%, 52%)";
    ctx.fill();
    
    // Inner petals
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const px = x + Math.cos(angle) * size * 0.5;
      const py = y + Math.sin(angle) * size * 0.5;
      
      ctx.beginPath();
      ctx.arc(px, py, size * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(195, 20%, 42%)";
      ctx.fill();
    }
    
    // Center
    ctx.beginPath();
    ctx.arc(x, y, size * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = "hsl(195, 30%, 62%)";
    ctx.fill();
    
    ctx.restore();
  },
  // Minimal dot cluster
  (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    
    const dots = [
      { dx: 0, dy: 0, r: size * 0.4 },
      { dx: size * 0.6, dy: size * 0.3, r: size * 0.25 },
      { dx: -size * 0.5, dy: size * 0.5, r: size * 0.2 },
      { dx: size * 0.3, dy: -size * 0.6, r: size * 0.3 },
    ];
    
    dots.forEach(dot => {
      ctx.beginPath();
      ctx.arc(x + dot.dx, y + dot.dy, dot.r, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(30, 40%, 65%)";
      ctx.fill();
    });
    
    ctx.restore();
  },
];

interface StencilCanvasProps {
  onFirstInteraction: () => void;
  onExplorationComplete: () => void;
}

export const StencilCanvas = ({ onFirstInteraction, onExplorationComplete }: StencilCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const hasInteractedRef = useRef(false);
  const interactionCountRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);

  const addPoint = useCallback((x: number, y: number) => {
    const distance = Math.hypot(x - lastPosRef.current.x, y - lastPosRef.current.y);
    
    if (distance > 30) {
      pointsRef.current.push({
        x,
        y,
        age: 0,
        pattern: Math.floor(Math.random() * stencilPatterns.length),
      });
      lastPosRef.current = { x, y };
      
      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true;
        onFirstInteraction();
      }
      
      interactionCountRef.current++;
      if (interactionCountRef.current === 15) {
        onExplorationComplete();
      }
    }
  }, [onFirstInteraction, onExplorationComplete]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    addPoint(e.clientX, e.clientY);
  }, [addPoint]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      addPoint(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [addPoint]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);
    
    // Add event listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    setIsReady(true);

    const animate = () => {
      // Semi-transparent overlay for wall texture feel
      ctx.fillStyle = "rgba(250, 247, 242, 0.02)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stencil points
      pointsRef.current.forEach((point, index) => {
        const opacity = Math.max(0, 1 - point.age / 100);
        const size = 20 + Math.sin(point.age * 0.1) * 5;
        
        if (opacity > 0) {
          stencilPatterns[point.pattern](ctx, point.x, point.y, size, opacity * 0.8);
        }
        
        point.age += 0.3;
      });

      // Remove old points
      pointsRef.current = pointsRef.current.filter(p => p.age < 100);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleMouseMove, handleTouchMove]);

  return (
    <>
      {/* Wall texture background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: `
            linear-gradient(135deg, hsl(35, 30%, 96%) 0%, hsl(30, 25%, 92%) 50%, hsl(35, 28%, 94%) 100%)
          `,
        }}
      />
      
      {/* Subtle wall texture overlay */}
      <div 
        className="fixed inset-0 z-[1] opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Canvas for stencil painting */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[2] cursor-crosshair"
      />

      {/* Hint text - fades after interaction */}
      <motion.div
        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[5] pointer-events-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isReady && !hasInteractedRef.current ? 0.6 : 0, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <p className="text-sm text-muted-foreground font-sans tracking-wide">
          duvarı boyamaya başla...
        </p>
      </motion.div>

      {/* Organic floating shapes in background */}
      <motion.div
        className="fixed -top-32 -right-32 w-[400px] h-[400px] rounded-organic bg-accent/20 z-[1] pointer-events-none"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 10, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed -bottom-48 -left-48 w-[500px] h-[500px] rounded-organic bg-secondary/20 z-[1] pointer-events-none"
        animate={{ 
          scale: [1, 1.15, 1],
          rotate: [0, -15, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
};
