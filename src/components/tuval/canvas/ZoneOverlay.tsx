import { useTuval } from "../store/TuvalContext";
import type { Pt } from "../store/types";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  /** Stage pixel size; used to convert normalized corners → screen px. */
  width: number;
  height: number;
}

interface DragState {
  zoneId: string;
  cornerIdx: 0 | 1 | 2 | 3 | "body";
  startX: number;
  startY: number;
  origCorners: [Pt, Pt, Pt, Pt];
}

/**
 * SVG overlay that renders zone outlines + 4 draggable corner handles per zone.
 * Sits absolutely over the stage. Pointer events pass through except on shapes.
 */
export function ZoneOverlay({ width, height }: Props) {
  const { state, dispatch } = useTuval();
  const [drag, setDrag] = useState<DragState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const onCornerDown = useCallback((e: React.PointerEvent, zoneId: string, idx: 0 | 1 | 2 | 3) => {
    e.stopPropagation();
    const z = state.zones.find(z => z.id === zoneId);
    if (!z) return;
    dispatch({ type: "SELECT_ZONE", id: zoneId });
    setDrag({ zoneId, cornerIdx: idx, startX: e.clientX, startY: e.clientY, origCorners: z.corners });
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [state.zones, dispatch]);

  const onBodyDown = useCallback((e: React.PointerEvent, zoneId: string) => {
    e.stopPropagation();
    const z = state.zones.find(z => z.id === zoneId);
    if (!z) return;
    dispatch({ type: "SELECT_ZONE", id: zoneId });
    setDrag({ zoneId, cornerIdx: "body", startX: e.clientX, startY: e.clientY, origCorners: z.corners });
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [state.zones, dispatch]);

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => {
      const dx = (e.clientX - drag.startX) / Math.max(1, width);
      const dy = (e.clientY - drag.startY) / Math.max(1, height);
      if (drag.cornerIdx === "body") {
        const newCorners = drag.origCorners.map(p => ({
          x: Math.min(1, Math.max(0, p.x + dx)),
          y: Math.min(1, Math.max(0, p.y + dy)),
        })) as [Pt, Pt, Pt, Pt];
        dispatch({ type: "UPDATE_ZONE", id: drag.zoneId, patch: { corners: newCorners } });
      } else {
        const orig = drag.origCorners[drag.cornerIdx];
        dispatch({
          type: "UPDATE_ZONE_CORNER",
          id: drag.zoneId,
          index: drag.cornerIdx,
          point: {
            x: Math.min(1, Math.max(0, orig.x + dx)),
            y: Math.min(1, Math.max(0, orig.y + dy)),
          },
        });
      }
    };
    const onUp = () => setDrag(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, width, height, dispatch]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {state.zones.filter(z => z.visible).map(z => {
        const selected = state.selectedZoneId === z.id;
        const pts = z.corners.map(c => `${c.x * width},${c.y * height}`).join(" ");
        const stroke = selected ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)";
        return (
          <g key={z.id}>
            {/* Body — clickable to select & drag whole zone */}
            <polygon
              points={pts}
              fill={selected ? "hsl(var(--primary) / 0.06)" : "transparent"}
              stroke={stroke}
              strokeWidth={selected ? 2 : 1.5}
              strokeDasharray={selected ? "0" : "6 4"}
              style={{ pointerEvents: "all", cursor: selected ? "move" : "pointer" }}
              onPointerDown={(e) => onBodyDown(e, z.id)}
            />
            {/* Label */}
            <text
              x={z.corners[0].x * width + 6}
              y={z.corners[0].y * height + 14}
              fontSize={10}
              fill={stroke}
              style={{ pointerEvents: "none", userSelect: "none", fontFamily: "var(--font-sans, system-ui)" }}
            >
              {z.name}
            </text>
            {/* Corner handles */}
            {selected && z.corners.map((c, i) => (
              <g key={i}>
                <circle
                  cx={c.x * width}
                  cy={c.y * height}
                  r={8}
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  style={{ pointerEvents: "all", cursor: "grab" }}
                  onPointerDown={(e) => onCornerDown(e, z.id, i as 0 | 1 | 2 | 3)}
                />
                <circle
                  cx={c.x * width}
                  cy={c.y * height}
                  r={2.5}
                  fill="hsl(var(--primary))"
                  style={{ pointerEvents: "none" }}
                />
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
