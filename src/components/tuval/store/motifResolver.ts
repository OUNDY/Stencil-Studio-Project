import { motifs as PRESET_MOTIFS } from "@/components/hero/motifs";

/** Convert raw SVG markup into a data URL suitable for CSS mask-image. */
export function svgToDataUrl(svg: string): string {
  const cleaned = svg.replace(/\s+/g, " ").trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
}

export function resolveMotifImage(sourceId: string): { url: string; name: string } | null {
  const m = PRESET_MOTIFS.find(x => x.id === sourceId);
  if (!m) return null;
  return {
    url: m.pngDataUrl ?? svgToDataUrl(m.svg),
    name: m.name,
  };
}

export { PRESET_MOTIFS };
