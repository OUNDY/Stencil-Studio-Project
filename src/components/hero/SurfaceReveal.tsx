import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import wallEmpty from "@/assets/wall-empty.png";
import { motifs, type Motif } from "./motifs";

interface MotifState {
  motif: Motif;
  x: number; // percentage position
  y: number;
  passes: number; // 0 = hidden, 1 = 50%, 2 = 100%
  revealedAt: number;
  size: number; // px
}

interface SurfaceRevealProps {
  onFirstInteraction: () => void;
  onExplorationComplete: () => void;
}

const MAX_VISIBLE_MOTIFS = 3;
const ZONE_COLS = 4;
const ZONE_ROWS = 3;
const DWELL_THRESHOLD = 400; // ms to trigger motif reveal
const MOTIF_SIZE_MIN = 80;
const MOTIF_SIZE_MAX = 140;

// Pre-assign motifs to zones
function buildZoneGrid() {
  const zones: { motif: Motif; revealed: number; dwellStart: number | null }[] = [];
  const shuffled = [...motifs].sort(() => Math.random() - 0.5);
  for (let i = 0; i < ZONE_COLS * ZONE_ROWS; i++) {
    zones.push({
      motif: shuffled[i % shuffled.length],
      revealed: 0,
      dwellStart: null,
    });
  }
  return zones;
}

export const SurfaceReveal = ({ onFirstInteraction, onExplorationComplete }: SurfaceRevealProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [activeMotifs, setActiveMotifs] = useState<MotifState[]>([]);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  const hasInteractedRef = useRef(false);
  const totalRevealsRef = useRef(0);
  const zonesRef = useRef(buildZoneGrid());
  const cursorPosRef = useRef<{ x: number; y: number } | null>(null);
  const animFrameRef = useRef<number>();
  const activeZoneRef = useRef<number | null>(null);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load background
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      bgImageRef.current = img;
      setIsReady(true);
    };
    img.src = wallEmpty;
  }, []);

  // Canvas resize & render loop for gradient trace
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      if (bgImageRef.current) {
        ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
      }

      // Draw subtle gradient trace at cursor
      const pos = cursorPosRef.current;
      if (pos) {
        const x = pos.x * dpr;
        const y = pos.y * dpr;
        const radius = 180 * dpr;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, "hsla(40, 33%, 92%, 0.18)");
        grad.addColorStop(0.4, "hsla(40, 33%, 94%, 0.08)");
        grad.addColorStop(1, "hsla(40, 33%, 97%, 0)");

        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = grad;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        ctx.globalCompositeOperation = "source-over";
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const getZoneIndex = useCallback((clientX: number, clientY: number) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const col = Math.floor((clientX / w) * ZONE_COLS);
    const row = Math.floor((clientY / h) * ZONE_ROWS);
    return Math.min(row * ZONE_COLS + col, ZONE_COLS * ZONE_ROWS - 1);
  }, []);

  const revealMotif = useCallback((zoneIdx: number, clientX: number, clientY: number) => {
    const zone = zonesRef.current[zoneIdx];
    if (!zone) return;

    zone.revealed = Math.min(zone.revealed + 1, 2);

    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      onFirstInteraction();
    }

    totalRevealsRef.current++;
    if (totalRevealsRef.current >= 4) {
      onExplorationComplete();
    }

    const xPct = (clientX / window.innerWidth) * 100;
    const yPct = (clientY / window.innerHeight) * 100;
    const size = MOTIF_SIZE_MIN + Math.random() * (MOTIF_SIZE_MAX - MOTIF_SIZE_MIN);

    setActiveMotifs(prev => {
      // Check if this zone's motif is already visible
      const existingIdx = prev.findIndex(m => m.motif.id === zone.motif.id && Math.abs(m.x - xPct) < 15);
      
      if (existingIdx >= 0) {
        // Update passes
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], passes: zone.revealed };
        return updated;
      }

      const newMotif: MotifState = {
        motif: zone.motif,
        x: xPct,
        y: yPct,
        passes: zone.revealed,
        revealedAt: Date.now(),
        size,
      };

      let next = [...prev, newMotif];

      // Enforce max 3 motifs
      if (next.length > MAX_VISIBLE_MOTIFS) {
        next = next.slice(next.length - MAX_VISIBLE_MOTIFS);
      }

      return next;
    });
  }, [onFirstInteraction, onExplorationComplete]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    cursorPosRef.current = { x: e.clientX, y: e.clientY };
    setCursorPos({ x: e.clientX, y: e.clientY });

    const zoneIdx = getZoneIndex(e.clientX, e.clientY);

    if (zoneIdx !== activeZoneRef.current) {
      activeZoneRef.current = zoneIdx;
      // Clear previous dwell timer
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
      
      // Start new dwell timer
      dwellTimerRef.current = setTimeout(() => {
        const zone = zonesRef.current[zoneIdx];
        if (zone && zone.revealed < 2) {
          revealMotif(zoneIdx, e.clientX, e.clientY);
        }
      }, DWELL_THRESHOLD);
    }
  }, [getZoneIndex, revealMotif]);

  const handleMouseLeave = useCallback(() => {
    cursorPosRef.current = null;
    setCursorPos(null);
    activeZoneRef.current = null;
    if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      e.preventDefault();
      const t = e.touches[0];
      cursorPosRef.current = { x: t.clientX, y: t.clientY };
      setCursorPos({ x: t.clientX, y: t.clientY });

      const zoneIdx = getZoneIndex(t.clientX, t.clientY);
      if (zoneIdx !== activeZoneRef.current) {
        activeZoneRef.current = zoneIdx;
        if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
        dwellTimerRef.current = setTimeout(() => {
          const zone = zonesRef.current[zoneIdx];
          if (zone && zone.revealed < 2) {
            revealMotif(zoneIdx, t.clientX, t.clientY);
          }
        }, DWELL_THRESHOLD);
      }
    }
  }, [getZoneIndex, revealMotif]);

  const handleTouchEnd = useCallback(() => {
    cursorPosRef.current = null;
    setCursorPos(null);
    activeZoneRef.current = null;
    if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
  }, []);

  // Attach events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    };
  }, [handleMouseMove, handleMouseLeave, handleTouchMove, handleTouchEnd]);

  return (
    <>
      {/* Background canvas with gradient trace */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[2]"
        style={{ cursor: "default" }}
      />

      {/* Loading */}
      {!isReady && (
        <div className="fixed inset-0 z-[3] bg-background flex items-center justify-center">
          <motion.div
            className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* Motifs layer */}
      <div className="fixed inset-0 z-[3] pointer-events-none">
        <AnimatePresence mode="popLayout">
          {activeMotifs.map((m, i) => (
            <motion.div
              key={`${m.motif.id}-${m.revealedAt}`}
              className="absolute"
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
                transform: "translate(-50%, -50%)",
                width: m.size,
                height: m.size,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: m.passes >= 2 ? 0.85 : 0.4,
                scale: 1,
              }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 1.5 } }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <div
                className="w-full h-full text-foreground"
                dangerouslySetInnerHTML={{ __html: m.motif.svg }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Subtle brand watermark */}
      <div className="fixed inset-0 z-[3] pointer-events-none flex items-center justify-center">
        <motion.h1
          className="font-serif text-7xl md:text-9xl lg:text-[12rem] text-foreground tracking-tight text-center select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.04 }}
          transition={{ delay: 1, duration: 1.5 }}
        >
          Stencil
        </motion.h1>
      </div>
    </>
  );
};
