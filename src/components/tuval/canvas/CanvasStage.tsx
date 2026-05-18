import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTuval } from "../store/TuvalContext";
import { MotifInstance, SurfaceId, PaintZone } from "../store/types";
import { cn } from "@/lib/utils";
import { quadToMatrix3d } from "./perspective";
import { ZoneOverlay } from "./ZoneOverlay";
import { SURFACE_REGISTRY } from "../panels/SurfacePanel";

const SOLID_BG: Partial<Record<SurfaceId, string>> = {
  beyaz: "#ffffff",
};

interface DragState {
  id: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  rect: DOMRect;
}

function MotifNode({
  m,
  selected,
  aspect,
  onMouseDown,
}: {
  m: MotifInstance;
  selected: boolean;
  aspect: number;
  onMouseDown: (e: React.MouseEvent, m: MotifInstance) => void;
}) {
  const sizePct = m.scale * 100;
  const rx = m.perspY ?? 0;
  const ry = m.perspX ?? 0;
  const sx = m.skewX ?? 0;
  const sy = m.skewY ?? 0;
  const hasPersp = rx !== 0 || ry !== 0;
  return (
    <div
      onMouseDown={(e) => onMouseDown(e, m)}
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2 select-none",
        m.locked ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
        selected && "outline-2 outline-dashed outline-primary outline-offset-4"
      )}
      style={{
        left: `${m.x * 100}%`,
        top: `${m.y * 100}%`,
        width: `${sizePct}%`,
        aspectRatio: `${aspect} / 1`,
        transform: `translate(-50%, -50%) rotate(${m.rotation}deg) skew(${sx}deg, ${sy}deg) ${hasPersp ? `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)` : ""}`,
        transformStyle: "preserve-3d",
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
}

function ZoneContent({
  zone,
  width,
  height,
  motifs,
  aspectMap,
  selectedId,
  onMotifMouseDown,
  grid,
}: {
  zone: PaintZone;
  width: number;
  height: number;
  motifs: MotifInstance[];
  aspectMap: Record<string, number>;
  selectedId: string | null;
  onMotifMouseDown: (e: React.MouseEvent, m: MotifInstance) => void;
  grid: { enabled: boolean; imageUrl: string | null; color: string; opacity: number; density: number };
}) {
  const dst = zone.corners.map(c => ({ x: c.x * width, y: c.y * height })) as [
    { x: number; y: number }, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }
  ];
  const matrix = useMemo(() => quadToMatrix3d(width, height, dst), [width, height, dst[0].x, dst[0].y, dst[1].x, dst[1].y, dst[2].x, dst[2].y, dst[3].x, dst[3].y]);
  const zoneMotifs = motifs.filter(m => m.zoneId === zone.id && m.visible);

  return (
    <div
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        width: width,
        height: height,
        transform: matrix,
        transformOrigin: "0 0",
      }}
    >
      {/* Solid fill */}
      {zone.fillColor && (
        <div
          className="absolute inset-0"
          style={{ background: zone.fillColor, opacity: zone.fillOpacity }}
        />
      )}
      {/* Grid clipped to zone (with optional per-zone override) */}
      {zone.useGrid && grid.enabled && grid.imageUrl && (() => {
        const o = zone.gridOverride ?? {};
        const density = o.density ?? grid.density;
        const opacity = o.opacity ?? grid.opacity;
        const color = o.color ?? grid.color;
        return (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: color,
              opacity,
              WebkitMaskImage: `url(${grid.imageUrl})`,
              maskImage: `url(${grid.imageUrl})`,
              WebkitMaskRepeat: "repeat",
              maskRepeat: "repeat",
              WebkitMaskSize: `${100 / density}% auto`,
              maskSize: `${100 / density}% auto`,
            }}
          />
        );
      })()}
      {/* Motifs assigned to this zone — re-enable pointer events for these */}
      <div className="absolute inset-0" style={{ pointerEvents: "auto" }}>
        {zoneMotifs.map(m => (
          <MotifNode
            key={m.id}
            m={m}
            selected={selectedId === m.id}
            aspect={aspectMap[m.imageUrl] ?? 1}
            onMouseDown={onMotifMouseDown}
          />
        ))}
      </div>
    </div>
  );
}

export function CanvasStage() {
  const { state, dispatch } = useTuval();
  const stageRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [aspectMap, setAspectMap] = useState<Record<string, number>>({});
  const [stageSize, setStageSize] = useState({ w: 1000, h: 750 });

  // Track stage pixel size for perspective math
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const cr = entry.contentRect;
      setStageSize({ w: Math.max(1, Math.round(cr.width)), h: Math.max(1, Math.round(cr.height)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Preload motif images for intrinsic aspect ratio
  const uniqueUrls = useMemo(() => {
    const urls = new Set<string>();
    state.motifs.forEach(m => urls.add(m.imageUrl));
    if (state.gridMode.imageUrl) urls.add(state.gridMode.imageUrl);
    return Array.from(urls);
  }, [state.motifs, state.gridMode.imageUrl]);

  useEffect(() => {
    uniqueUrls.forEach(url => {
      if (aspectMap[url]) return;
      const img = new Image();
      img.onload = () => {
        const ratio = img.naturalWidth / Math.max(1, img.naturalHeight);
        setAspectMap(prev => (prev[url] ? prev : { ...prev, [url]: ratio }));
      };
      img.src = url;
    });
  }, [uniqueUrls, aspectMap]);

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
    if (e.target === e.currentTarget) {
      dispatch({ type: "SELECT", id: null });
      dispatch({ type: "SELECT_ZONE", id: null });
    }
  };

  const grid = state.gridMode;
  const surface = SURFACE_REGISTRY[state.surface];
  const stageBg = surface?.image
    ? { backgroundImage: `url(${surface.image})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: SOLID_BG[state.surface] ?? "#ffffff" };

  // Free (unassigned) motifs
  const freeMotifs = state.motifs.filter(m => m.visible && !m.zoneId);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-muted/20 p-4 overflow-hidden">
      <div
        ref={stageRef}
        onClick={onStageClick}
        className="relative aspect-[4/3] w-full max-h-full max-w-[1100px] rounded-xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)] overflow-hidden cursor-default"
        style={stageBg}
      >
        {/* Free grid mode (not bound to a zone) */}
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

        {/* Free motifs (unassigned) */}
        {freeMotifs.map(m => (
          <MotifNode
            key={m.id}
            m={m}
            selected={state.selectedId === m.id}
            aspect={aspectMap[m.imageUrl] ?? 1}
            onMouseDown={onMotifMouseDown}
          />
        ))}

        {/* Zone perspective contents */}
        {state.zones.filter(z => z.visible).map(z => (
          <ZoneContent
            key={z.id}
            zone={z}
            width={stageSize.w}
            height={stageSize.h}
            motifs={state.motifs}
            aspectMap={aspectMap}
            selectedId={state.selectedId}
            onMotifMouseDown={onMotifMouseDown}
            grid={grid}
          />
        ))}

        {/* Zone overlay (handles + outlines) */}
        {state.zones.length > 0 && (
          <ZoneOverlay width={stageSize.w} height={stageSize.h} />
        )}

        {/* Empty state */}
        {state.motifs.length === 0 && state.zones.length === 0 && !grid.enabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="font-serif italic text-foreground/40 text-lg sm:text-xl text-center px-6">
              Sol panelden bir motif seç ya da “Alan” sekmesinden boyanacak bir bölge çiz
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
