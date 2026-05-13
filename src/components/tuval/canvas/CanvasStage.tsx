import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTuval } from "../store/TuvalContext";
import { MotifInstance, SurfaceId } from "../store/types";
import { cn } from "@/lib/utils";

const SURFACE_BG: Record<SurfaceId, string> = {
  duvar: "linear-gradient(135deg, #ede4d3 0%, #d8c9b1 100%)",
  ahsap: "repeating-linear-gradient(90deg, #b08a5b 0px, #9c764a 4px, #b08a5b 8px), linear-gradient(180deg, #b88c5a 0%, #8a6238 100%)",
  beton: "radial-gradient(circle at 20% 30%, #c8c5be 0%, #8e8a82 100%)",
  beyaz: "#ffffff",
};

const SURFACE_TEXTURE: Record<SurfaceId, string> = {
  duvar: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
  ahsap: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='turbulence' baseFrequency='0.02 0.6' numOctaves='2' seed='5'/><feColorMatrix values='0 0 0 0 0.25 0 0 0 0 0.15 0 0 0 0 0.05 0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
  beton: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' seed='7'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
  beyaz: "none",
};

interface DragState {
  id: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  rect: DOMRect;
}

export function CanvasStage() {
  const { state, dispatch } = useTuval();
  const stageRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const onMotifMouseDown = useCallback((e: React.MouseEvent, m: MotifInstance) => {
    e.stopPropagation();
    if (m.locked) return;
    dispatch({ type: "SELECT", id: m.id });
    const rect = stageRef.current!.getBoundingClientRect();
    setDrag({ id: m.id, startX: e.clientX, startY: e.clientY, origX: m.x, origY: m.y, rect });
  }, [dispatch]);

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      const dx = (e.clientX - drag.startX) / drag.rect.width;
      const dy = (e.clientY - drag.startY) / drag.rect.height;
      dispatch({
        type: "UPDATE_MOTIF", id: drag.id,
        patch: {
          x: Math.min(1, Math.max(0, drag.origX + dx)),
          y: Math.min(1, Math.max(0, drag.origY + dy)),
        },
      });
    };
    const onUp = () => setDrag(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [drag, dispatch]);

  const onStageClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) dispatch({ type: "SELECT", id: null });
  };

  const grid = state.gridMode;

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-muted/20 p-4 overflow-hidden">
      <div
        ref={stageRef}
        onClick={onStageClick}
        className="relative aspect-[4/3] w-full max-h-full max-w-[1100px] rounded-xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)] overflow-hidden cursor-default"
        style={{ background: SURFACE_BG[state.surface] }}
      >
        {/* Surface texture overlay */}
        {state.surface !== "beyaz" && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-multiply"
            style={{ backgroundImage: SURFACE_TEXTURE[state.surface] }}
          />
        )}

        {/* Grid mode tiled motif */}
        {grid.enabled && grid.imageUrl && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: grid.color,
              opacity: grid.opacity,
              WebkitMaskImage: `url(${grid.imageUrl})`,
              maskImage: `url(${grid.imageUrl})`,
              WebkitMaskRepeat: "repeat",
              maskRepeat: "repeat",
              WebkitMaskSize: `${100 / grid.density}% auto`,
              maskSize: `${100 / grid.density}% auto`,
            }}
          />
        )}

        {/* Motif instances */}
        {state.motifs.filter(m => m.visible).map(m => {
          const selected = state.selectedId === m.id;
          const sizePct = m.scale * 100;
          return (
            <div
              key={m.id}
              onMouseDown={(e) => onMotifMouseDown(e, m)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 select-none",
                m.locked ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
                selected && "outline-2 outline-dashed outline-primary outline-offset-4"
              )}
              style={{
                left: `${m.x * 100}%`,
                top: `${m.y * 100}%`,
                width: `${sizePct}%`,
                aspectRatio: "1 / 1",
                transform: `translate(-50%, -50%) rotate(${m.rotation}deg)`,
                opacity: m.opacity,
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: m.color,
                  WebkitMaskImage: `url(${m.imageUrl})`,
                  maskImage: `url(${m.imageUrl})`,
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                }}
              />
            </div>
          );
        })}

        {/* Empty state */}
        {state.motifs.length === 0 && !grid.enabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="font-serif italic text-foreground/40 text-lg sm:text-xl">
              Sol panelden bir motif seç ve tuvale dokun
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
