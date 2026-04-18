import { useRef, useEffect, useState, useCallback } from "react";
import { motifs as PRESET_MOTIFS, type Motif } from "./motifs";

const CANVAS_W = 800;
const CANVAS_H = 600;
const STENCIL_THRESHOLD = 12;
const BRISTLES_PER_PX = 2.0;   // enough density for slow buildup feel
const B_ALPHA_MIN = 0.078;      // +30% opacity — more solid buildup per pass
const B_ALPHA_MAX = 0.39;
const B_W_MIN = 1.1;
const B_W_MAX = 3.6;
const B_ELONGATION = 9.5;       // long bristle streaks
const B_DIR_JITTER = 0.28;      // slight misalignment adds hand-made quality
const B_EDGE_FADE = 0.34;       // broader feather at brush boundary

type SurfaceId = "duvar" | "ahsap" | "beton" | "foto" | "beyaz";
const SURFACES: { id: SurfaceId; name: string }[] = [
  { id: "duvar", name: "Duvar" },
  { id: "ahsap", name: "Ahşap" },
  { id: "beton", name: "Beton" },
];
type PlacementMode = "grid" | "tekli";
type TekliPhase = "placing" | "painting";
type PaintTarget = "all" | "selected";

interface StencilInstance {
  id: string;
  motifId: string;
  x: number;
  y: number;
  locked?: boolean;
}

interface InstanceAssets {
  // stencilFull: hard binary mask at position — rebuilt only on size/position change
  stencilFull: HTMLCanvasElement;
  // paintFull: colored bristle accumulation, clipped to stencil — color baked in at stamp time
  paintFull: HTMLCanvasElement;
}

interface GridPaintAssets {
  stencilFull: HTMLCanvasElement; // tiled hard binary mask (800×600)
  paintFull:   HTMLCanvasElement; // bristle accumulation (800×600)
}

// ── Noise / FBM — integer hash, no Math.sin, ~20× faster than trig-based ─────
function smoothstep(t: number) { return t * t * (3 - 2 * t); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// Pure integer hash — avoids Math.sin entirely
function ihash(ix: number, iy: number): number {
  let h = Math.imul(ix ^ Math.imul(iy, 2654435761), 2246822519) ^ Math.imul(iy ^ Math.imul(ix, 2654435761), 3266489917);
  h ^= h >>> 17; h = Math.imul(h, 0xbf324c81 | 0); h ^= h >>> 11;
  return (h >>> 0) / 0x100000000;
}

function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = smoothstep(x - ix), fy = smoothstep(y - iy);
  return lerp(lerp(ihash(ix,iy), ihash(ix+1,iy), fx), lerp(ihash(ix,iy+1), ihash(ix+1,iy+1), fx), fy);
}
function fbm(x: number, y: number, octaves: number): number {
  let v = 0, a = 0.5, f = 1, max = 0;
  for (let i = 0; i < octaves; i++) { v += a * valueNoise(x*f, y*f); max += a; a *= 0.5; f *= 2.1; }
  return v / max;
}

// ── Surface renderers ─────────────────────────────────────────────────────────

// Photorealistic plaster wall — wide luminance range, sharp grit, deep groove shadows
function renderWall(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!; const w = CANVAS_W, h = CANVAS_H;
  const id = ctx.createImageData(w, h); const d = id.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const nx = x / 380, ny = y / 380;

    // Layer 1: large-scale unevenness (uneven paint absorption, mottled patches)
    const macro = fbm(nx * 0.85, ny * 0.85, 4);

    // Layer 2: medium skim-coat bumps — domain-warped for organic irregularity
    const wx = (fbm(nx * 2.2 + 3.4, ny * 2.2 + 1.1, 2) - 0.5) * 0.55;
    const wy = (fbm(nx * 2.2 + 1.9, ny * 2.2 + 4.6, 2) - 0.5) * 0.55;
    const bumps = fbm(nx * 4.8 + wx, ny * 4.8 + wy, 3);

    // Layer 3: roller grain — directional horizontal streaks
    const grain = fbm(nx * 22 + macro * 1.4 + 7.4, ny * 11 + macro * 0.3 + 2.2, 3);

    // Layer 4: medium grit — sand aggregate in plaster
    const grit = fbm(nx * 68 + 11.3, ny * 68 + 6.9, 3);

    // Layer 5: ultra-fine micro-roughness — surface chalky feel
    const micro = fbm(nx * 140 + 4.7, ny * 140 + 9.1, 2);

    // Layer 6: colour temperature — warm cream vs cooler near-white
    const temp = fbm(nx * 0.52 + 2.5, ny * 0.52 + 1.8, 3);

    // Combine — wider range for more physical depth
    const val = macro * 0.28 + bumps * 0.24 + grain * 0.22 + grit * 0.16 + micro * 0.10;
    const lum = 172 + val * 78;   // range ~172–250, much wider than before

    // Groove shadow: recesses are noticeably darker
    const groove = Math.max(0, 0.5 - macro) * 2; // deepens dark areas
    const ws   = (temp - 0.5) * 28;
    const bump = (macro - 0.5) * 14 - groove * 12;

    const i = (y * w + x) * 4;
    d[i]   = Math.min(255, Math.max(140, lum + bump + ws * 0.82 + 3));
    d[i+1] = Math.min(255, Math.max(134, lum + bump + ws * 0.26 - 1));
    d[i+2] = Math.min(255, Math.max(118, lum + bump - ws * 0.52 - 8));
    d[i+3] = 255;
  }
  ctx.putImageData(id, 0, 0);
  const topLight = ctx.createLinearGradient(0, 0, 0, h);
  topLight.addColorStop(0,   "rgba(255,252,244,0.10)");
  topLight.addColorStop(0.45,"rgba(0,0,0,0)");
  topLight.addColorStop(1,   "rgba(18,10,2,0.13)");
  ctx.fillStyle = topLight; ctx.fillRect(0, 0, w, h);
  const vig = ctx.createRadialGradient(w*0.5, h*0.46, h*0.21, w*0.5, h*0.5, h*0.91);
  vig.addColorStop(0,   "rgba(0,0,0,0)");
  vig.addColorStop(0.65,"rgba(0,0,0,0)");
  vig.addColorStop(1,   "rgba(28,16,4,0.28)");
  ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);
}

// Photorealistic wood — sharp ring boundaries, prominent knots, high-contrast grain
function renderWood(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!; const w = CANVAS_W, h = CANVAS_H;
  const knots = [
    { x: w*0.22, y: h*0.42, r: 52 },
    { x: w*0.74, y: h*0.58, r: 42 },
    { x: w*0.48, y: h*0.17, r: 30 },
  ];
  const id = ctx.createImageData(w, h); const d = id.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const nx = x / 350, ny = y / 350;

    // Domain warp: natural waviness and bowing
    const warpX = (fbm(nx * 0.8 + 0.4, ny * 0.8 + 0.2, 3) - 0.5);
    const warpY = (fbm(nx * 0.8 + 2.9, ny * 0.8 + 1.9, 3) - 0.5);
    let sx = x + warpX * 62, sy = y + warpY * 26;

    // Knot spin
    for (const k of knots) {
      const kdx = x - k.x, kdy = y - k.y, dist = Math.hypot(kdx, kdy);
      const reach = k.r * 3.6;
      if (dist < reach) {
        const inf = Math.pow(Math.max(0, 1 - dist / reach), 1.8);
        const ang = Math.atan2(kdy, kdx);
        sx += Math.cos(ang + Math.PI * 0.5) * inf * k.r * 1.15;
        sy += Math.sin(ang + Math.PI * 0.5) * inf * k.r * 0.52;
      }
    }

    // Growth rings — sharper dark lines using aggressive smoothstep
    const ringRaw = (Math.sin((sy / 24.0) * Math.PI * 2) + 1) * 0.5;
    const ring1 = smoothstep(smoothstep(smoothstep(ringRaw))); // triple = very sharp
    const ringVar = fbm(sx / 310 + 0.6, sy / 310 + 3.3, 2);
    const ringFinal = Math.pow(ring1, 0.55 + ringVar * 0.8);

    // Along-grain fiber
    const fiber = fbm(sx / 140 + 13.6, sy / 22 + 7.3, 4);

    // Cross-grain micro texture
    const crossFiber = fbm(sx / 18 + 5.2, sy / 140 + 3.0, 2);

    // Fine surface scratch/sanding
    const sand = fbm(sx / 6 + 2.1, sy / 220 + 4.7, 2);

    // Knot darkness + concentric halo rings
    let knotInf = 0, nearestKnotDist = Infinity;
    for (const k of knots) {
      const kd = Math.hypot(x - k.x, y - k.y);
      if (kd < nearestKnotDist) nearestKnotDist = kd;
      knotInf = Math.max(knotInf, Math.pow(Math.max(0, 1 - kd / (k.r * 1.7)), 2.3));
    }
    const knotHalo = nearestKnotDist < 110
      ? Math.pow(Math.max(0, (Math.sin(nearestKnotDist / 5.2 * Math.PI * 2) + 1) * 0.5), 2)
        * Math.pow(Math.max(0, 1 - nearestKnotDist / 110), 1.6) * 0.44
      : 0;

    // Final brightness 0–1
    const n = Math.max(0, Math.min(1,
      ringFinal * 0.54 + fiber * 0.26 + crossFiber * 0.08 + sand * 0.06
      - knotInf * 0.46 - knotHalo
    ));

    // 5-stop colour ramp: very dark brown → mid → amber → honey → cream highlight
    const c0=[28,10,2], c1=[105,46,10], c2=[188,112,32], c3=[228,180,82], c4=[248,218,145];
    const seg = n * 4;
    const si = Math.min(3, Math.floor(seg));
    const t = seg - si;
    const cols = [c0, c1, c2, c3, c4];
    const r = lerp(cols[si][0], cols[si+1][0], t);
    const g = lerp(cols[si][1], cols[si+1][1], t);
    const b = lerp(cols[si][2], cols[si+1][2], t);

    const i = (y * w + x) * 4;
    d[i] = Math.min(255, Math.round(r)); d[i+1] = Math.min(255, Math.round(g));
    d[i+2] = Math.min(255, Math.round(b)); d[i+3] = 255;
  }
  ctx.putImageData(id, 0, 0);
  const sheen = ctx.createLinearGradient(0, 0, w, 0);
  sheen.addColorStop(0,    "rgba(120,65,10,0.09)");
  sheen.addColorStop(0.40, "rgba(255,200,90,0.14)");
  sheen.addColorStop(0.60, "rgba(255,200,90,0.14)");
  sheen.addColorStop(1,    "rgba(120,65,10,0.09)");
  ctx.fillStyle = sheen; ctx.fillRect(0, 0, w, h);
  const topLight = ctx.createLinearGradient(0, 0, 0, h);
  topLight.addColorStop(0,   "rgba(255,225,170,0.07)");
  topLight.addColorStop(0.32,"rgba(0,0,0,0)");
  topLight.addColorStop(1,   "rgba(0,0,0,0.10)");
  ctx.fillStyle = topLight; ctx.fillRect(0, 0, w, h);
}

// Photorealistic concrete — strong pore definition, sharp aggregate shadows, cool gray
function renderConcrete(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!; const w = CANVAS_W, h = CANVAS_H;
  const id = ctx.createImageData(w, h); const d = id.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const nx = x / 280, ny = y / 280;

    // Large paste variation
    const macro = fbm(nx * 0.72, ny * 0.72, 4);

    // Aggregate — domain-warped lumps and gravel shadows
    const awx = (fbm(nx * 2.5 + 1.2, ny * 2.5 + 0.7, 2) - 0.5) * 0.48;
    const awy = (fbm(nx * 2.5 + 3.8, ny * 2.5 + 2.4, 2) - 0.5) * 0.48;
    const agg = fbm(nx * 4.4 + awx, ny * 4.4 + awy, 3);

    // Laitance — fine cement-rich surface skin (lighter patches)
    const laitance = fbm(nx * 9.5 + 5.9, ny * 9.5 + 3.3, 3);

    // Medium surface roughness
    const med = fbm(nx * 22 + 7.1, ny * 22 + 2.8, 3);

    // Micro dust / surface roughness
    const micro = fbm(nx * 55 + 9.6, ny * 55 + 5.0, 2);

    // Pores — two scales, deeper/darker than before
    const poreSmall = fbm(nx * 38 + 2.4, ny * 38 + 8.1, 2);
    const pore = poreSmall < 0.26 ? Math.pow((0.26 - poreSmall) / 0.26, 2.2) : 0;
    const poreBig = fbm(nx * 14 + 6.3, ny * 14 + 1.5, 2);
    const bigPore = poreBig < 0.22 ? Math.pow((0.22 - poreBig) / 0.22, 2.8) * 0.65 : 0;

    // Form-board banding: wavy horizontal lines from plank formwork
    const bandShift = (fbm(nx * 2.8 + 0.6, ny * 0.22 + 1.2, 2) - 0.5) * 16;
    const formBand = Math.pow(Math.max(0, Math.sin(((y + bandShift) / 72) * Math.PI * 2) * 0.5 + 0.5), 6) * 0.12;

    // Mineral colour variation: cool vs warm
    const mineral = fbm(nx * 0.88 + 4.3, ny * 0.88 + 2.2, 4);

    // Efflorescence: scattered white mineral deposits
    const efflN = fbm(nx * 5.8 + 8.4, ny * 5.8 + 3.8, 2);
    const efflor = efflN > 0.74 ? Math.pow((efflN - 0.74) / 0.26, 1.5) * 0.50 : 0;

    // Combined luminance — base 118–192 (wider range, deeper shadows)
    const val = macro * 0.30 + agg * 0.28 + laitance * 0.18 + med * 0.14 + micro * 0.10 + formBand;
    const base = 118 + val * 74;

    const warmShift = (mineral - 0.5) * 32;
    const poreDeep  = (pore + bigPore) * 72;  // deeper pore shadows
    const eff       = efflor * 95;

    const i = (y * w + x) * 4;
    d[i]   = Math.min(255, Math.max(30, base - poreDeep + warmShift * 0.54 + eff + 2));
    d[i+1] = Math.min(255, Math.max(28, base - poreDeep + warmShift * 0.18 + eff));
    d[i+2] = Math.min(255, Math.max(26, base - poreDeep - warmShift * 0.38 + eff + 14));
    d[i+3] = 255;
  }
  ctx.putImageData(id, 0, 0);
  const topLight = ctx.createLinearGradient(0, 0, 0, h);
  topLight.addColorStop(0,   "rgba(210,218,235,0.09)");
  topLight.addColorStop(0.38,"rgba(0,0,0,0)");
  topLight.addColorStop(1,   "rgba(0,0,0,0.09)");
  ctx.fillStyle = topLight; ctx.fillRect(0, 0, w, h);
  const vig = ctx.createRadialGradient(w*0.5, h*0.44, h*0.19, w*0.5, h*0.5, h*0.91);
  vig.addColorStop(0,   "rgba(0,0,0,0)");
  vig.addColorStop(0.58,"rgba(0,0,0,0)");
  vig.addColorStop(1,   "rgba(0,0,0,0.34)");
  ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);
}

// ── Paint clip buffer — composite paint clipped to stencil before drawing to canvas ─
let _paintClipBuf: HTMLCanvasElement | null = null;
function getPaintClipBuf(): CanvasRenderingContext2D {
  if (!_paintClipBuf) { _paintClipBuf = document.createElement("canvas"); _paintClipBuf.width = CANVAS_W; _paintClipBuf.height = CANVAS_H; }
  const bc = _paintClipBuf.getContext("2d")!;
  bc.clearRect(0, 0, CANVAS_W, CANVAS_H); bc.globalCompositeOperation = "source-over"; bc.globalAlpha = 1;
  return bc;
}

// ── Perspective warp — triangle-split affine approach ─────────────────────────
type PerspCorner = [number, number];
type PerspQuad   = [PerspCorner, PerspCorner, PerspCorner, PerspCorner]; // TL TR BR BL

function drawAffineTriangle(
  ctx: CanvasRenderingContext2D, src: HTMLCanvasElement,
  d0: PerspCorner, d1: PerspCorner, d2: PerspCorner,
  s0: PerspCorner, s1: PerspCorner, s2: PerspCorner,
) {
  const [x0,y0]=s0,[x1,y1]=s1,[x2,y2]=s2;
  const [u0,v0]=d0,[u1,v1]=d1,[u2,v2]=d2;
  const det = x0*(y1-y2)+x1*(y2-y0)+x2*(y0-y1);
  if (Math.abs(det)<1e-8) return;
  const a=(u0*(y1-y2)+u1*(y2-y0)+u2*(y0-y1))/det;
  const b=(v0*(y1-y2)+v1*(y2-y0)+v2*(y0-y1))/det;
  const c=(u0*(x2-x1)+u1*(x0-x2)+u2*(x1-x0))/det;
  const d=(v0*(x2-x1)+v1*(x0-x2)+v2*(x1-x0))/det;
  const e=(u0*(x1*y2-x2*y1)+u1*(x2*y0-x0*y2)+u2*(x0*y1-x1*y0))/det;
  const f=(v0*(x1*y2-x2*y1)+v1*(x2*y0-x0*y2)+v2*(x0*y1-x1*y0))/det;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(d0[0],d0[1]); ctx.lineTo(d1[0],d1[1]); ctx.lineTo(d2[0],d2[1]);
  ctx.closePath(); ctx.clip();
  ctx.transform(a,b,c,d,e,f);
  ctx.drawImage(src,0,0);
  ctx.restore();
}

function drawPerspectiveWarped(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, q: PerspQuad) {
  const [tl,tr,br,bl]=q; const W=src.width,H=src.height;
  drawAffineTriangle(ctx,src,tl,tr,br,[0,0],[W,0],[W,H]);
  drawAffineTriangle(ctx,src,tl,br,bl,[0,0],[W,H],[0,H]);
}

// Full-canvas warp source buffer — accumulates paint layers before perspective transform
let _warpSrcBuf: HTMLCanvasElement|null=null;
function getWarpSrcBuf(): CanvasRenderingContext2D {
  if (!_warpSrcBuf){_warpSrcBuf=document.createElement("canvas");_warpSrcBuf.width=CANVAS_W;_warpSrcBuf.height=CANVAS_H;}
  const wc=_warpSrcBuf.getContext("2d")!;
  wc.clearRect(0,0,CANVAS_W,CANVAS_H); wc.globalCompositeOperation="source-over"; wc.globalAlpha=1;
  return wc;
}

function renderSurface(id: SurfaceId): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width=CANVAS_W; c.height=CANVAS_H;
  if (id==="duvar") renderWall(c); else if (id==="ahsap") renderWood(c); else if (id==="beton") renderConcrete(c);
  else { const wctx=c.getContext("2d")!; wctx.fillStyle="#ffffff"; wctx.fillRect(0,0,CANVAS_W,CANVAS_H); }
  return c;
}

// ── Tile / stencil helpers ────────────────────────────────────────────────────
function normalizeSvg(raw: string): string {
  let svg = raw.trim();
  if (!svg.includes("xmlns=")) svg = svg.replace("<svg", `<svg xmlns="http://www.w3.org/2000/svg"`);
  return svg.replace(/\s+width="[^"]*"/g, "").replace(/\s+height="[^"]*"/g, "");
}
function renderColorTile(motif: Motif, color: string, tileSize: number): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas"); canvas.width=tileSize; canvas.height=tileSize;
  const ctx = canvas.getContext("2d")!;
  const p = Math.round(tileSize * 0.05);

  // PNG motif: remap alpha by luminance (bright=hole=paint-through, dark=stencil=blocked), then tint
  if (motif.pngDataUrl) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const tmp = document.createElement("canvas"); tmp.width=tileSize; tmp.height=tileSize;
        const tctx = tmp.getContext("2d")!;
        tctx.drawImage(img, p, p, tileSize-p*2, tileSize-p*2);
        const id2 = tctx.getImageData(0, 0, tileSize, tileSize);
        const d = id2.data;
        for (let i = 0; i < d.length; i += 4) {
          const lum = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2];
          d[i+3] = lum > 200 ? d[i+3] : 0;
        }
        tctx.putImageData(id2, 0, 0);
        ctx.drawImage(tmp, 0, 0);
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, tileSize, tileSize);
        resolve(canvas);
      };
      img.onerror = () => resolve(canvas);
      img.src = motif.pngDataUrl!;
    });
  }

  return new Promise(resolve => {
    const img = new Image();
    const renderSize = tileSize - p * 2;
    let src = motif.svg.includes("currentColor") ? motif.svg.replace(/currentColor/g, color) : motif.svg;
    // Inject explicit width/height so the browser scales the SVG as a vector at any tile size.
    // normalizeSvg already strips these on upload; preset SVGs may have their own — replace either way.
    src = src.replace(/<svg(\s[^>]*)?>/, (_m: string, attrs: string = '') => {
      const a = attrs.replace(/\s*(width|height)\s*=\s*["'][^"']*["']/gi, '');
      return `<svg${a} width="${renderSize}" height="${renderSize}">`;
    });
    const blob = new Blob([src], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => { ctx.drawImage(img, p, p, renderSize, renderSize); URL.revokeObjectURL(url); resolve(canvas); };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(canvas); };
    img.src = url;
  });
}
function makeHardMaskTile(colorTile: HTMLCanvasElement): HTMLCanvasElement {
  const mask = document.createElement("canvas"); mask.width=colorTile.width; mask.height=colorTile.height;
  const ctx = mask.getContext("2d")!; ctx.drawImage(colorTile, 0, 0);
  const id = ctx.getImageData(0,0,mask.width,mask.height); const d=id.data;
  for (let i=0; i<d.length; i+=4) { const a=d[i+3]; d[i]=255; d[i+1]=255; d[i+2]=255; d[i+3]=a>STENCIL_THRESHOLD?255:0; }
  ctx.putImageData(id, 0, 0); return mask;
}
// Place a tile centred at (cx, cy) on a full-canvas, returning the canvas.
function placeTileOnFull(tile: HTMLCanvasElement, cx: number, cy: number): HTMLCanvasElement {
  const full = document.createElement("canvas"); full.width=CANVAS_W; full.height=CANVAS_H;
  full.getContext("2d")!.drawImage(tile, Math.round(cx-tile.width/2), Math.round(cy-tile.height/2));
  return full;
}
// Tile a motif canvas wall-to-wall across the full canvas with an optional pixel offset.
function tileToFull(tile: HTMLCanvasElement, offX: number, offY: number): HTMLCanvasElement {
  const full = document.createElement("canvas"); full.width=CANVAS_W; full.height=CANVAS_H;
  const ctx = full.getContext("2d")!;
  const tw = tile.width, th = tile.height;
  const ox = ((offX % tw) + tw) % tw;
  const oy = ((offY % th) + th) % th;
  for (let y = oy - th; y < CANVAS_H; y += th)
    for (let x = ox - tw; x < CANVAS_W; x += tw)
      ctx.drawImage(tile, x, y);
  return full;
}
// Tile a motif wall-to-wall onto an existing ctx with optional per-tile and whole-pattern rotation.
// Treats the tile plane as infinite: when patRotDeg ≠ 0, tile a square centered on the canvas
// center with half-side = full diagonal. Any screen corner is ≤ diagonal/2 from center, so
// ±diagonal in every direction covers all four corners at any rotation angle with no gaps.
function tileOnto(
  ctx: CanvasRenderingContext2D,
  tile: HTMLCanvasElement,
  offX: number, offY: number,
  tileRotDeg: number, patRotDeg: number,
  alpha: number
) {
  const tw = tile.width, th = tile.height;
  const ox = ((offX % tw) + tw) % tw;
  const oy = ((offY % th) + th) % th;
  const pRad = patRotDeg * Math.PI / 180;
  const tRad = tileRotDeg * Math.PI / 180;

  let gxStart: number, gyStart: number, gxEnd: number, gyEnd: number;
  if (pRad) {
    // Tile a square centered on (CX, CY) with half-side = canvas diagonal (~1000px for 800×600).
    // Snap start to the tile grid aligned at (ox, oy): largest grid pos ≤ center − diagonal.
    const diag = Math.hypot(CANVAS_W, CANVAS_H);
    const CX = CANVAS_W / 2, CY = CANVAS_H / 2;
    gxStart = ox + Math.floor((CX - diag - ox) / tw) * tw;
    gyStart = oy + Math.floor((CY - diag - oy) / th) * th;
    gxEnd   = CX + diag + tw;
    gyEnd   = CY + diag + th;
  } else {
    // No pattern rotation — tight bounds suffice.
    gxStart = ox - tw; gyStart = oy - th;
    gxEnd   = CANVAS_W; gyEnd   = CANVAS_H;
  }

  ctx.save(); ctx.globalAlpha = alpha;
  if (pRad) { ctx.translate(CANVAS_W/2, CANVAS_H/2); ctx.rotate(pRad); ctx.translate(-CANVAS_W/2, -CANVAS_H/2); }
  if (tRad) {
    for (let gy = gyStart; gy < gyEnd; gy += th)
      for (let gx = gxStart; gx < gxEnd; gx += tw) {
        ctx.save(); ctx.translate(gx + tw/2, gy + th/2); ctx.rotate(tRad);
        ctx.drawImage(tile, -tw/2, -th/2); ctx.restore();
      }
  } else {
    for (let gy = gyStart; gy < gyEnd; gy += th)
      for (let gx = gxStart; gx < gxEnd; gx += tw)
        ctx.drawImage(tile, gx, gy);
  }
  ctx.restore();
}
// Ghost tile: warm semi-opaque card with the motif shape cut out.
function buildGhostTile(motif: Motif, tileSize: number): Promise<HTMLCanvasElement> {
  return renderColorTile(motif, "black", tileSize).then(colorTile => {
    const ghost = document.createElement("canvas"); ghost.width=tileSize; ghost.height=tileSize;
    const ctx = ghost.getContext("2d")!;
    ctx.fillStyle = "rgba(230,220,195,0.88)";
    ctx.fillRect(0, 0, tileSize, tileSize);
    // Check if colorTile has any painted pixels (SVG may have failed to load)
    const maskTile = makeHardMaskTile(colorTile);
    const maskData = maskTile.getContext("2d")!.getImageData(0,0,maskTile.width,maskTile.height).data;
    const hasPixels = maskData.some((_,i) => i%4===3 && maskData[i]>0);
    if (hasPixels) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.drawImage(maskTile, 0, 0);
    } else {
      // Fallback: draw a simple motif outline so the ghost card is still functional
      ctx.save(); ctx.globalCompositeOperation="destination-out"; ctx.globalAlpha=0.85;
      ctx.beginPath(); ctx.arc(tileSize/2, tileSize/2, tileSize*0.38, 0, Math.PI*2);
      ctx.fill(); ctx.restore();
    }
    return ghost;
  });
}

// Outline tile: 2px border around the motif shape, warm amber, transparent interior.
function buildOutlineTile(maskTile: HTMLCanvasElement): HTMLCanvasElement {
  const sz = maskTile.width;
  const out = document.createElement("canvas"); out.width = sz; out.height = sz;
  const ctx = out.getContext("2d")!;
  // Dilate mask in 8 directions to get expanded silhouette
  for (const [dx, dy] of [[-2,0],[2,0],[0,-2],[0,2],[-1,-2],[1,-2],[-1,2],[1,2]])
    ctx.drawImage(maskTile, dx, dy);
  // Cut out the original interior — leaves only the border band
  ctx.globalCompositeOperation = "destination-out";
  ctx.drawImage(maskTile, 0, 0);
  // Tint the border with warm amber
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = "rgba(210,160,55,1)";
  ctx.fillRect(0, 0, sz, sz);
  return out;
}

// Build a thin amber outline ring from a binary stencil mask (full-canvas sized).
function buildOutlineFromFull(stencilFull: HTMLCanvasElement, thickness = 2): HTMLCanvasElement {
  const oc = document.createElement("canvas"); oc.width = CANVAS_W; oc.height = CANVAS_H;
  const octx = oc.getContext("2d")!;
  // Dilate: stamp shifted copies in all directions within radius
  for (let dx = -thickness; dx <= thickness; dx++)
    for (let dy = -thickness; dy <= thickness; dy++)
      if (Math.sqrt(dx * dx + dy * dy) <= thickness + 0.5)
        octx.drawImage(stencilFull, dx, dy);
  // Erase the original interior — only the border ring remains
  octx.globalCompositeOperation = "destination-out";
  octx.drawImage(stencilFull, 0, 0);
  // Tint ring amber to match the outline tile style
  octx.globalCompositeOperation = "source-in";
  octx.fillStyle = "rgba(210,160,55,1)";
  octx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  return oc;
}

// Rotate a full-canvas (CANVAS_W×CANVAS_H) around the canvas centre by deg degrees.
function rotateFullCanvas(src: HTMLCanvasElement, deg: number): HTMLCanvasElement {
  if (!deg) return src;
  const out = document.createElement("canvas"); out.width = CANVAS_W; out.height = CANVAS_H;
  const ctx = out.getContext("2d")!;
  ctx.translate(CANVAS_W / 2, CANVAS_H / 2);
  ctx.rotate(deg * Math.PI / 180);
  ctx.translate(-CANVAS_W / 2, -CANVAS_H / 2);
  ctx.drawImage(src, 0, 0);
  return out;
}
// Rotate a point around the canvas centre by deg degrees.
function applyPatRot(pos: { x: number; y: number }, deg: number): { x: number; y: number } {
  if (!deg) return pos;
  const rad = deg * Math.PI / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const dx = pos.x - CANVAS_W / 2, dy = pos.y - CANVAS_H / 2;
  return { x: CANVAS_W / 2 + dx * cos - dy * sin, y: CANVAS_H / 2 + dx * sin + dy * cos };
}
// Rotate a tile canvas around its own centre, expanding the canvas to fit the full rotated bounding box.
function rotateTile(tile: HTMLCanvasElement, deg: number): HTMLCanvasElement {
  if (deg === 0) return tile;
  const rad = deg * Math.PI / 180;
  const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
  const w = tile.width, h = tile.height;
  const newW = Math.ceil(w * cos + h * sin);
  const newH = Math.ceil(w * sin + h * cos);
  const c = document.createElement("canvas"); c.width = newW; c.height = newH;
  const ctx = c.getContext("2d")!;
  ctx.translate(newW / 2, newH / 2);
  ctx.rotate(rad);
  ctx.drawImage(tile, -w / 2, -h / 2);
  return c;
}


// ── Bristle stamp ─────────────────────────────────────────────────────────────
let _scratch: HTMLCanvasElement | null = null;
function getScratch(size: number): CanvasRenderingContext2D {
  if (!_scratch) _scratch = document.createElement("canvas");
  _scratch.width = size; _scratch.height = size;
  return _scratch.getContext("2d")!;
}
function stampBristles(
  paintCtx: CanvasRenderingContext2D, stencil: HTMLCanvasElement,
  x: number, y: number, radius: number, strokeAngle: number | null,
  fillColor = "white", opacityMult = 1.0
) {
  // Pad extra to accommodate stray bristles that feather beyond the nominal radius
  const pad = Math.ceil(radius * 1.22) + 4, size = pad * 2;
  const sctx = getScratch(size);
  sctx.fillStyle = fillColor;
  const count = Math.max(12, Math.floor(radius * BRISTLES_PER_PX));

  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    // Stray bristles: ~15% escape slightly beyond the brush edge for natural feathering
    const isStray = Math.random() < 0.15;
    const maxR = isStray ? radius * (1.05 + Math.random() * 0.14) : radius;
    const r = Math.sqrt(Math.random()) * maxR;
    const bx = pad + Math.cos(a) * r;
    const by = pad + Math.sin(a) * r;
    const t = r / radius;

    // Edge fade: broader taper + stray bristles are always faint
    const ef = isStray
      ? 0.08 + Math.random() * 0.10
      : t < (1 - B_EDGE_FADE) ? 1.0 : (1 - t) / B_EDGE_FADE;

    // Skew distribution toward lighter end — slow buildup over multiple passes
    const rawRandom = Math.pow(Math.random(), 1.6);
    const alpha = ef * (B_ALPHA_MIN + rawRandom * (B_ALPHA_MAX - B_ALPHA_MIN)) * opacityMult;
    if (alpha <= 0.01) continue;

    const bw = B_W_MIN + Math.pow(Math.random(), 1.2) * (B_W_MAX - B_W_MIN);

    const ang = strokeAngle !== null
      ? strokeAngle + (Math.random() - 0.5) * B_DIR_JITTER * 2
      : a;
    const elong = strokeAngle !== null
      ? 3.5 + Math.random() * B_ELONGATION
      : 1.5 + Math.random() * B_ELONGATION * 0.4;

    // ~28% of bristles get split ends: drawn as two thin diverging tines
    const isSplit = !isStray && Math.random() < 0.28;
    if (isSplit) {
      const splay = 0.12 + Math.random() * 0.10;
      const tineW = bw * 0.42;
      const tineElong = elong * 0.72;
      // Offset tines perpendicular to bristle direction
      const perp = ang + Math.PI / 2;
      const offset = bw * 0.38;
      for (const side of [-1, 1]) {
        const ox = Math.cos(perp) * offset * side;
        const oy = Math.sin(perp) * offset * side;
        sctx.globalAlpha = alpha * (0.72 + Math.random() * 0.28);
        sctx.beginPath();
        sctx.save();
        sctx.translate(bx + ox, by + oy);
        sctx.rotate(ang + splay * side);
        sctx.ellipse(0, 0, (tineW * tineElong) / 2, tineW / 2, 0, 0, Math.PI * 2);
        sctx.restore();
        sctx.fill();
      }
    } else {
      sctx.globalAlpha = alpha;
      sctx.beginPath();
      sctx.save();
      sctx.translate(bx, by);
      sctx.rotate(ang);
      sctx.ellipse(0, 0, (bw * elong) / 2, bw / 2, 0, 0, Math.PI * 2);
      sctx.restore();
      sctx.fill();
    }
  }

  // Clip to stencil — paint stays strictly inside motif shape
  sctx.globalAlpha = 1;
  sctx.globalCompositeOperation = "destination-in";
  sctx.drawImage(stencil, -(x - pad), -(y - pad));

  paintCtx.globalCompositeOperation = "source-over";
  paintCtx.drawImage(_scratch!, x - pad, y - pad);
}

// ── Scrubber number input ─────────────────────────────────────────────────────
const numStyle: React.CSSProperties = {
  cursor:"ns-resize", userSelect:"none", width:46,
  background:"#111", border:"1px solid #333", borderRadius:4,
  color:"#ccc", fontSize:11, padding:"2px 4px",
};
function ScrubNumber({ min, max, step=1, value, onChange }: {
  min: number; max: number; step?: number; value: number; onChange: (v: number) => void;
}) {
  const scrub = useRef<{ startY: number; startVal: number } | null>(null);
  const onMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    scrub.current = { startY: e.clientY, startVal: value };
    const onMove = (me: MouseEvent) => {
      if (!scrub.current) return;
      const delta = scrub.current.startY - me.clientY; // drag up = increase
      const raw = scrub.current.startVal + Math.round(delta * step);
      onChange(Math.min(max, Math.max(min, raw)));
    };
    const onUp = () => { scrub.current = null; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
  return (
    <input type="number" min={min} max={max} step={step} value={value}
      onChange={e => { const v = Number(e.target.value); if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v))); }}
      onMouseDown={onMouseDown}
      style={numStyle}/>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
interface StencilCanvasProps {
  /** Gömülü mod: Studio gibi dış layout içinde kullanıldığında.
   *  minHeight kaldırılır, top bar sticky değil, canvas max-width serbest. */
  embedded?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function StencilCanvas({ embedded = false, className, style }: StencilCanvasProps = {}) {
  // DOM refs
  const canvasRef  = useRef<HTMLCanvasElement>(null);

  // Off-DOM asset refs
  const surfaceRef      = useRef<HTMLCanvasElement | null>(null);
  const photoSurfaceRef   = useRef(false);
  // ghost tiles keyed by `${motifId}:${sizeKey}` (grid) or `${motifId}:px${size}` (tekli)
  const ghostTilesRef   = useRef(new Map<string, HTMLCanvasElement>());
  // per-instance rendering assets keyed by instance.id
  const instanceAssetsRef = useRef(new Map<string, InstanceAssets>());
  // Grid mode: colored tiles keyed by `${motifId}:${sz}:${color}`
  const gridColorTilesRef = useRef(new Map<string, HTMLCanvasElement>());
  // Grid mode: tiled full-canvas per active motif (rebuilt on color/size/offset change)
  const gridFullsRef = useRef(new Map<string, HTMLCanvasElement>());
  // Grid mode: outline tiles keyed by `${motifId}:${sz}` (shape-only, color-independent)
  const gridOutlineTilesRef = useRef(new Map<string, HTMLCanvasElement>());

  // State mirror refs (allow stable callbacks to read current values)
  const modeRef        = useRef<PlacementMode>("grid");
  const phaseRef       = useRef<TekliPhase>("placing");
  const paintTargetRef = useRef<PaintTarget>("all");
  const instanceColorsRef = useRef<Record<string, string>>({});
  const sizesRef       = useRef<Record<string, number>>({});
  const instRef        = useRef<StencilInstance[]>([]);
  const selIdRef       = useRef<string | null>(null);
  const allMotifsRef   = useRef<Motif[]>([...PRESET_MOTIFS]);
  const brushRef       = useRef(48);
  const brushOpacityRef = useRef(0.7);
  const blendModeRef    = useRef<GlobalCompositeOperation>("multiply");
  const advancedRef     = useRef<HTMLDivElement>(null);

  // Interaction refs
  const dragging     = useRef<{ id: string; dx: number; dy: number; x: number; y: number } | null>(null);
  const isPainting   = useRef(false);
  const lastPos      = useRef<{ x: number; y: number } | null>(null);
  // Grid mode interaction refs
  const gridDrag        = useRef<{ motifId: string; sx: number; sy: number; sox: number; soy: number } | null>(null);
  const gridPaintAssetsRef = useRef(new Map<string, GridPaintAssets>());
  const gridPhaseRef    = useRef<"placing" | "painting">("placing");
  const instanceRotationsRef    = useRef<Record<string, number>>({});
  const instancePatRotationsRef = useRef<Record<string, number>>({});
  const instanceSizesRef        = useRef<Record<string, number>>({});
  const gridTileRotationRef   = useRef<Record<string, number>>({});
  const gridPatternRotationRef = useRef<Record<string, number>>({});
  const gridOffsetsRef  = useRef<Record<string, { x: number; y: number }>>({});
  const gridActiveIdsRef    = useRef<Set<string>>(new Set([PRESET_MOTIFS[0].id]));
  const gridColorsRef       = useRef<Record<string, string>>({});
  const gridSelMotifRef     = useRef<string>(PRESET_MOTIFS[0].id);
  // Coverage (0–1) per instance — how much of the stencil area has been painted over
  const instanceCoverageRef = useRef<Map<string, number>>(new Map());
  // Cached outline canvases — amber rings rebuilt whenever stencilFull changes
  const instanceOutlinesRef = useRef(new Map<string, HTMLCanvasElement>());
  const gridOutlinesRef     = useRef(new Map<string, HTMLCanvasElement>());
  const gridCoverageRef     = useRef(new Map<string, number>());
  // Version counter per instance — incremented on every transform call; async rebuilds
  // bail if a newer call has already superseded them (rapid slider drags).
  const transformVersionRef  = useRef<Record<string, number>>({});
  // Committed transform per instance — the size/tileRot/patRot at which stencil+paint are aligned.
  // "Transformu Uygula" bakes the delta from committed→current into paintFull and updates this.
  const instanceCommittedTransformRef = useRef<Record<string, { size: number; tileRot: number; patRot: number }>>({});

  // ── State ──────────────────────────────────────────────────────────────────
  const [customMotifs,    setCustomMotifs]    = useState<Motif[]>([]);
  const [tekliActiveIds,  setTekliActiveIds]  = useState<Set<string>>(new Set([PRESET_MOTIFS[0].id]));
  const [motifCounts,     setMotifCounts]     = useState<Record<string, number>>({});
  const [motifSizes,      setMotifSizes]      = useState<Record<string, number>>(
    () => Object.fromEntries(PRESET_MOTIFS.map(m => [m.id, 150]))
  );
  // Instances: positions of all ghost stencils. Reconciled from (tekliActiveIds × motifCounts).
  const [instances,       setInstances]       = useState<StencilInstance[]>([
    { id: "inst_0", motifId: PRESET_MOTIFS[0].id, x: CANVAS_W/2, y: CANVAS_H/2 }
  ]);
  const [surface,         setSurface]         = useState<SurfaceId>("beyaz");
  const [instanceColors,  setInstanceColors]  = useState<Record<string, string>>({});
  const [brushSize,       setBrushSize]       = useState(48);
  const [brushOpacity,    setBrushOpacity]    = useState(0.7);
  const [placementMode,   setPlacementMode]   = useState<PlacementMode>("grid");
  const [gridActiveIds,      setGridActiveIds]      = useState<Set<string>>(new Set([PRESET_MOTIFS[0].id]));
  const [gridColors,         setGridColors]         = useState<Record<string, string>>({});
  const [gridSelectedMotifId,setGridSelectedMotifId] = useState<string>(PRESET_MOTIFS[0].id);
  const [gridPhase,          setGridPhase]          = useState<"placing"|"painting">("placing");
  const [instanceRotations,    setInstanceRotations]    = useState<Record<string, number>>({});
  const [instancePatRotations, setInstancePatRotations] = useState<Record<string, number>>({});
  const [instanceSizes,        setInstanceSizes]        = useState<Record<string, number>>({});
  const [gridTileRotations,  setGridTileRotations]  = useState<Record<string, number>>({});
  const [gridPatternRotations,setGridPatternRotations] = useState<Record<string, number>>({});
  const [tekliPhase,      setTekliPhase]      = useState<TekliPhase>("placing");
  const [selectedInstId,  setSelectedInstId]  = useState<string | null>(null);
  const [paintTarget,     setPaintTarget]     = useState<PaintTarget>("all");
  const [showPerspWarp,   setShowPerspWarp]   = useState(false);
  const [perspCorners,    setPerspCorners]    = useState<PerspQuad>(
    [[0,0],[CANVAS_W,0],[CANVAS_W,CANVAS_H],[0,CANVAS_H]]
  );
  const [showAdvanced,    setShowAdvanced]    = useState(false);
  const [blendMode,       setBlendMode]       = useState<GlobalCompositeOperation>("multiply");

  // Sync mirror refs every render
  const allMotifs = [...PRESET_MOTIFS, ...customMotifs];
  modeRef.current        = placementMode;
  phaseRef.current       = tekliPhase;
  paintTargetRef.current = paintTarget;
  instanceColorsRef.current = instanceColors;
  sizesRef.current       = motifSizes;
  instRef.current      = instances;
  selIdRef.current     = selectedInstId;
  allMotifsRef.current   = allMotifs;
  brushRef.current       = brushSize;
  brushOpacityRef.current = brushOpacity;
  blendModeRef.current    = blendMode;
  gridActiveIdsRef.current = gridActiveIds;
  gridColorsRef.current    = gridColors;
  gridSelMotifRef.current  = gridSelectedMotifId;
  gridPhaseRef.current       = gridPhase;
  instanceRotationsRef.current    = instanceRotations;
  instancePatRotationsRef.current = instancePatRotations;
  instanceSizesRef.current        = instanceSizes;
  gridTileRotationRef.current   = gridTileRotations;
  gridPatternRotationRef.current = gridPatternRotations;
  photoSurfaceRef.current = (surface === "foto");
  const perspWarpRef   = useRef(false);
  perspWarpRef.current = showPerspWarp;
  const perspCornersRef = useRef<PerspQuad>([[0,0],[CANVAS_W,0],[CANVAS_W,CANVAS_H],[0,CANVAS_H]]);
  perspCornersRef.current = perspCorners;
  const dragCornerRef  = useRef<number|null>(null);

  // ── Redraw ─────────────────────────────────────────────────────────────────
  // Reads everything from refs → stable, no deps.
  const redraw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Layer 1: surface
    if (surfaceRef.current) ctx.drawImage(surfaceRef.current, 0, 0);
    else { ctx.fillStyle="#f0e8d0"; ctx.fillRect(0,0,CANVAS_W,CANVAS_H); }

    // Grid mode
    if (modeRef.current === "grid") {
      // tileLayer: draws a tile wall-to-wall on ctx with per-motif tile + pattern rotation
      const tileLayer = (tile: HTMLCanvasElement, motifId: string, alpha: number) => {
        const off = gridOffsetsRef.current[motifId] ?? { x: 0, y: 0 };
        const tileRot = gridTileRotationRef.current[motifId] ?? 0;
        const patRot  = gridPatternRotationRef.current[motifId] ?? 0;
        tileOnto(ctx, tile, off.x, off.y, tileRot, patRot, alpha);
      };

      if (gridPhaseRef.current === "placing") {
        for (const motifId of gridActiveIdsRef.current) {
          const sz = sizesRef.current[motifId] ?? 120;
          const ghost   = ghostTilesRef.current.get(`${motifId}:${sz}`);
          const outline = gridOutlineTilesRef.current.get(`${motifId}:${sz}`);
          if (ghost)   tileLayer(ghost,   motifId, 0.38);
          if (outline) tileLayer(outline, motifId, 0.60);
        }
      } else {
        // Painting: composite paint into warp buffer (if warp active) or directly to ctx
        const warpActive = perspWarpRef.current;
        const pctx = warpActive ? getWarpSrcBuf() : ctx;
        // Layer 2: stencil outline — drawn first so brush reveal sits on top
        for (const motifId of gridActiveIdsRef.current) {
          const outline = gridOutlinesRef.current.get(motifId);
          if (!outline) continue;
          const coverage = gridCoverageRef.current.get(motifId) ?? 0;
          const oa = (1 - coverage) * 0.55;
          if (oa < 0.01) continue;
          pctx.save();
          pctx.globalAlpha = oa;
          pctx.drawImage(outline, 0, 0);
          pctx.restore();
        }
        // Layer 3: brush reveal — paint clipped to stencil, composited on top
        for (const motifId of gridActiveIdsRef.current) {
          const assets = gridPaintAssetsRef.current.get(motifId);
          if (!assets) continue;
          const bc = getPaintClipBuf();
          bc.drawImage(assets.paintFull, 0, 0);
          bc.globalCompositeOperation = "destination-in";
          bc.drawImage(assets.stencilFull, 0, 0);
          bc.globalCompositeOperation = "source-over";
          pctx.save();
          pctx.globalCompositeOperation = (warpActive||photoSurfaceRef.current) ? "source-over" : blendModeRef.current;
          pctx.globalAlpha = 0.85;
          pctx.drawImage(_paintClipBuf!, 0, 0);
          pctx.restore();
        }
        if (warpActive) {
          ctx.save();
          ctx.globalCompositeOperation = photoSurfaceRef.current ? "source-over" : blendModeRef.current;
          ctx.globalAlpha = 0.85;
          drawPerspectiveWarped(ctx, _warpSrcBuf!, perspCornersRef.current);
          ctx.restore();
        }
      }
      return;
    }

    if (phaseRef.current === "placing") {
      // Tekli placing: draw each ghost at its (possibly dragged) position
      for (const inst of instRef.current) {
        const ts = instanceSizesRef.current[inst.id] ?? 120;
        const ghost = ghostTilesRef.current.get(`${inst.motifId}:px${ts}`);
        if (!ghost) continue;
        const pos = dragging.current?.id===inst.id
          ? { x: dragging.current.x, y: dragging.current.y }
          : { x: inst.x, y: inst.y };
        const tileRot = (instanceRotationsRef.current[inst.id] ?? 0) * Math.PI / 180;
        const patRad  = (instancePatRotationsRef.current[inst.id] ?? 0) * Math.PI / 180;
        ctx.save();
        if (patRad) { ctx.translate(CANVAS_W/2,CANVAS_H/2); ctx.rotate(patRad); ctx.translate(-CANVAS_W/2,-CANVAS_H/2); }
        ctx.globalAlpha=0.82; ctx.translate(pos.x,pos.y); if (tileRot) ctx.rotate(tileRot);
        ctx.drawImage(ghost,-ts/2,-ts/2,ts,ts); ctx.restore();
        ctx.save();
        if (patRad) { ctx.translate(CANVAS_W/2,CANVAS_H/2); ctx.rotate(patRad); ctx.translate(-CANVAS_W/2,-CANVAS_H/2); }
        ctx.setLineDash([5,4]); ctx.strokeStyle="rgba(85,85,85,0.9)"; ctx.lineWidth=1.2;
        ctx.translate(pos.x,pos.y); if (tileRot) ctx.rotate(tileRot);
        ctx.strokeRect(-ts/2+0.5,-ts/2+0.5,ts-1,ts-1); ctx.restore();
      }

    } else {
      // Tekli painting: composite paint (hard-clipped) to warp buffer or directly to ctx
      const warpActive = perspWarpRef.current;
      const pctx = warpActive ? getWarpSrcBuf() : ctx;
      // Layer 2: stencil contour outline — drawn first so brush reveal sits on top
      for (const inst of instRef.current) {
        const outline = instanceOutlinesRef.current.get(inst.id);
        if (!outline) continue;
        const coverage = instanceCoverageRef.current.get(inst.id) ?? 0;
        const oa = (1 - coverage) * 0.60;
        if (oa < 0.01) continue;
        pctx.save();
        pctx.globalAlpha = oa;
        pctx.drawImage(outline, 0, 0);
        pctx.restore();
      }
      // Layer 3: brush reveal — paint clipped to stencil, composited on top
      for (const inst of instRef.current) {
        const assets = instanceAssetsRef.current.get(inst.id);
        if (!assets) continue;
        const bc = getPaintClipBuf();
        bc.drawImage(assets.paintFull, 0, 0);
        bc.globalCompositeOperation = "destination-in";
        bc.drawImage(assets.stencilFull, 0, 0);
        bc.globalCompositeOperation = "source-over";
        pctx.save();
        pctx.globalCompositeOperation = (warpActive||photoSurfaceRef.current) ? "source-over" : blendModeRef.current;
        pctx.globalAlpha = 0.85;
        pctx.drawImage(_paintClipBuf!, 0, 0);
        pctx.restore();
      }
      if (warpActive) {
        ctx.save();
        ctx.globalCompositeOperation = photoSurfaceRef.current ? "source-over" : blendModeRef.current;
        ctx.globalAlpha = 0.85;
        drawPerspectiveWarped(ctx, _warpSrcBuf!, perspCornersRef.current);
        ctx.restore();
      }
    }
  }, []); // stable

  // ── Surface ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (surface === "foto") { redraw(); return; } // photo already in surfaceRef — just redraw with corrected photoSurfaceRef
    setTimeout(() => { surfaceRef.current = renderSurface(surface); redraw(); }, 0);
  }, [surface, redraw]);

  // ── Click-outside: close Advanced dropdown ────────────────────────────────
  useEffect(() => {
    if (!showAdvanced) return;
    const handler = (e: MouseEvent) => {
      if (advancedRef.current && !advancedRef.current.contains(e.target as Node)) {
        setShowAdvanced(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showAdvanced]);

  // ── Perspective warp corner drag ─────────────────────────────────────────────
  useEffect(() => {
    if (!showPerspWarp) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (dragCornerRef.current === null || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const cx = Math.max(0, Math.min(CANVAS_W, (clientX-rect.left)*(CANVAS_W/rect.width)));
      const cy = Math.max(0, Math.min(CANVAS_H, (clientY-rect.top)*(CANVAS_H/rect.height)));
      const idx = dragCornerRef.current;
      setPerspCorners(prev => {
        const next = prev.map((c,i) => i===idx ? [cx,cy] as PerspCorner : c) as PerspQuad;
        perspCornersRef.current = next;
        return next;
      });
      redraw();
    };
    const onUp = () => { dragCornerRef.current = null; };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup",   onUp);
    document.addEventListener("touchmove", onMove, {passive:true});
    document.addEventListener("touchend",  onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend",  onUp);
    };
  }, [showPerspWarp, redraw]);

  // ── Grid: rebuild full tiled canvases from cached tiles + per-motif offsets ─
  const rebuildGridFulls = useCallback((onlyMotifId?: string) => {
    const ids = onlyMotifId ? [onlyMotifId] : [...gridActiveIdsRef.current];
    for (const motifId of ids) {
      const sz = sizesRef.current[motifId] ?? 120;
      const color = gridColorsRef.current[motifId] ?? "#e8c56a";
      const tileKey = `${motifId}:${sz}:${color}`;
      const tile = gridColorTilesRef.current.get(tileKey);
      if (tile) {
        const off = gridOffsetsRef.current[motifId] ?? { x: 0, y: 0 };
        gridFullsRef.current.set(motifId, tileToFull(tile, off.x, off.y));
      }
    }
    redraw();
  }, [redraw]);

  // ── Grid: rebuild tiles when active motifs / colors / sizes change ─────────
  useEffect(() => {
    if (placementMode !== "grid") return;
    let cancelled = false;
    const promises: Promise<void>[] = [];

    for (const motifId of gridActiveIds) {
      const sz = motifSizes[motifId] ?? 120;
      const color = gridColors[motifId] ?? "#e8c56a";
      const tileKey = `${motifId}:${sz}:${color}`;
      const off = gridOffsetsRef.current[motifId] ?? { x: 0, y: 0 };
      if (gridColorTilesRef.current.has(tileKey)) {
        const tile = gridColorTilesRef.current.get(tileKey)!;
        gridFullsRef.current.set(motifId, tileToFull(tile, off.x, off.y));
      } else {
        const motif = allMotifs.find(m => m.id === motifId);
        if (!motif) continue;
        promises.push(
          renderColorTile(motif, color, sz).then(tile => {
            if (cancelled) return;
            gridColorTilesRef.current.set(tileKey, tile);
            const o = gridOffsetsRef.current[motifId] ?? { x: 0, y: 0 };
            gridFullsRef.current.set(motifId, tileToFull(tile, o.x, o.y));
          })
        );
      }
    }
    // Remove fulls for deactivated motifs
    for (const motifId of [...gridFullsRef.current.keys()])
      if (!gridActiveIds.has(motifId)) gridFullsRef.current.delete(motifId);

    Promise.all(promises).then(() => { if (!cancelled) redraw(); });
    if (promises.length === 0) redraw();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridActiveIds, gridColors, motifSizes, placementMode, customMotifs, redraw]);

  // Keep selected grid motif valid when active set changes
  useEffect(() => {
    if (!gridActiveIds.has(gridSelectedMotifId)) {
      const first = [...gridActiveIds][0];
      if (first) { setGridSelectedMotifId(first); gridSelMotifRef.current = first; }
    }
  }, [gridActiveIds, gridSelectedMotifId]);


  // ── Reconcile tekli instances when active motifs or counts change ─────────
  // Rule: for each active motif, keep up to `count` existing instances, create new ones if needed.
  // Transitions back to placing phase and clears all instance assets.
  useEffect(() => {
    if (placementMode !== "tekli") return;

    setInstances(prev => {
      const next: StencilInstance[] = [];
      const seenIds = new Set<string>();
      for (const motifId of tekliActiveIds) {
        const count = motifCounts[motifId] ?? 1;
        const existing = prev.filter(i => i.motifId===motifId);
        for (let k=0; k<count; k++) {
          if (k < existing.length) {
            next.push(existing[k]); seenIds.add(existing[k].id);
          } else {
            const id = `inst_${Date.now()}_${k}_${motifId.slice(0,6)}`;
            next.push({ id, motifId, x: CANVAS_W/2+(Math.random()-0.5)*200, y: CANVAS_H/2+(Math.random()-0.5)*150 });
            seenIds.add(id);
          }
        }
      }
      return next;
    });

    instanceAssetsRef.current.clear();
    instanceCoverageRef.current.clear();
    dragging.current = null;
    setTekliPhase("placing"); phaseRef.current="placing";
    setSelectedInstId(null); selIdRef.current=null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tekliActiveIds, motifCounts, placementMode]);

  // ── Build ghost tiles for tekli instances (lazy, keyed by motifId:px${size}) ──
  useEffect(() => {
    if (placementMode !== "tekli") return;
    let cancelled = false;
    const needed: Promise<void>[] = [];

    for (const inst of instances) {
      const ts = instanceSizes[inst.id] ?? 120;
      const key = `${inst.motifId}:px${ts}`;
      if (ghostTilesRef.current.has(key)) continue;
      const motif = allMotifs.find(m => m.id===inst.motifId);
      if (!motif) continue;
      needed.push(buildGhostTile(motif, ts).then(g => { ghostTilesRef.current.set(key, g); }));
    }

    Promise.all(needed).then(() => { if (!cancelled) redraw(); });
    return () => { cancelled=true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instances, instanceSizes, placementMode, customMotifs, redraw]);

  // ── Build ghost + outline tiles for grid mode ─────────────────────────────
  useEffect(() => {
    if (placementMode !== "grid") return;
    let cancelled = false;
    const needed: Promise<void>[] = [];
    for (const motifId of gridActiveIds) {
      const sz = motifSizes[motifId] ?? 120;
      const key = `${motifId}:${sz}`;
      const motif = allMotifs.find(m => m.id === motifId);
      if (!motif) continue;
      const needGhost   = !ghostTilesRef.current.has(key);
      const needOutline = !gridOutlineTilesRef.current.has(key);
      if (!needGhost && !needOutline) continue;
      // Single SVG render feeds both ghost and outline
      needed.push(
        renderColorTile(motif, "black", sz).then(colorTile => {
          if (cancelled) return;
          const maskTile = makeHardMaskTile(colorTile);
          if (needOutline) gridOutlineTilesRef.current.set(key, buildOutlineTile(maskTile));
          if (needGhost) {
            const ghost = document.createElement("canvas"); ghost.width = sz; ghost.height = sz;
            const gctx = ghost.getContext("2d")!;
            gctx.fillStyle = "rgba(230,220,195,0.88)"; gctx.fillRect(0, 0, sz, sz);
            const hasPixels = maskTile.getContext("2d")!.getImageData(0,0,maskTile.width,maskTile.height).data.some((v,i)=>i%4===3&&v>0);
            gctx.globalCompositeOperation = "destination-out";
            if (hasPixels) { gctx.drawImage(maskTile, 0, 0); }
            else { gctx.globalAlpha=0.85; gctx.beginPath(); gctx.arc(sz/2,sz/2,sz*0.38,0,Math.PI*2); gctx.fill(); }
            ghostTilesRef.current.set(key, ghost);
          }
        })
      );
    }
    Promise.all(needed).then(() => { if (!cancelled) redraw(); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridActiveIds, motifSizes, placementMode, customMotifs, redraw]);

  // ── Reset grid to placing when active motifs change ───────────────────────
  useEffect(() => {
    if (placementMode !== "grid") return;
    gridPaintAssetsRef.current.clear();
    setGridPhase("placing"); gridPhaseRef.current = "placing";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridActiveIds, placementMode]);

  // ── Redraw when instance colors change (new strokes pick up the color from refs) ──
  useEffect(() => { redraw(); }, [instanceColors, redraw]);

  // ── Redraw on rotation changes ────────────────────────────────────────────
  useEffect(() => { redraw(); }, [instanceRotations, instancePatRotations, redraw]);
  // When rotation changes in painting phase, rebuild stencilFull so brush clips to the new
  // rotation. paintFull (paint strokes) is preserved. Visual display already updates via
  // tileOnto reading refs directly.
  useEffect(() => {
    if (modeRef.current === "grid" && gridPhaseRef.current === "painting") {
      for (const motifId of [...gridActiveIdsRef.current]) {
        const sz = sizesRef.current[motifId] ?? 120;
        const color = gridColorsRef.current[motifId] ?? "#e8c56a";
        const colorTile = gridColorTilesRef.current.get(`${motifId}:${sz}:${color}`);
        if (!colorTile) continue;
        const off = gridOffsetsRef.current[motifId] ?? { x: 0, y: 0 };
        const tileRot = gridTileRotationRef.current[motifId] ?? 0;
        const patRot  = gridPatternRotationRef.current[motifId] ?? 0;
        const stencilTile = makeHardMaskTile(rotateTile(colorTile, tileRot));
        const stencilFull = document.createElement("canvas");
        stencilFull.width = CANVAS_W; stencilFull.height = CANVAS_H;
        tileOnto(stencilFull.getContext("2d")!, stencilTile, off.x, off.y, 0, patRot, 1);
        const existing = gridPaintAssetsRef.current.get(motifId);
        if (existing) existing.stencilFull = stencilFull;
      }
    }
    redraw();
  }, [gridTileRotations, gridPatternRotations, redraw]);

  // ── Uygula: confirm positions → build assets → enter painting ─────────────
  const confirmPlacement = useCallback(() => {
    if (dragging.current) {
      // Commit any in-progress drag before confirming
      const { id, x, y } = dragging.current;
      setInstances(prev => prev.map(i => i.id===id ? {...i,x,y} : i));
      // Update instRef immediately so we build assets from correct position
      instRef.current = instRef.current.map(i => i.id===id ? {...i,x,y} : i);
      dragging.current = null;
    }

    const curInstances = instRef.current;
    if (curInstances.length===0) return;

    // Lock phase immediately — prevents new drags starting during async asset build
    phaseRef.current = "painting";
    dragging.current = null;
    // Mark all instances as locked so drag handler can check the flag directly
    setInstances(prev => prev.map(i => ({ ...i, locked: true })));
    instRef.current = instRef.current.map(i => ({ ...i, locked: true }));
    console.log('[confirmed instances]', JSON.parse(JSON.stringify(instRef.current)));

    let cancelled = false;

    Promise.all(curInstances.map(async inst => {
      const motif = allMotifsRef.current.find(m => m.id===inst.motifId);
      if (!motif) return;
      const ts = instanceSizesRef.current[inst.id] ?? 120;
      const mc = instanceColorsRef.current[inst.id] ?? "#e8c56a";
      const tileRot = instanceRotationsRef.current[inst.id] ?? 0;
      const patRot  = instancePatRotationsRef.current[inst.id] ?? 0;
      const colorTileRaw = await renderColorTile(motif, mc, ts);
      const colorTile = rotateTile(colorTileRaw, tileRot);           // Motif Rot: around tile center
      const maskTile  = makeHardMaskTile(colorTile);
      const pf = document.createElement("canvas"); pf.width=CANVAS_W; pf.height=CANVAS_H;
      const stencilFull = rotateFullCanvas(placeTileOnFull(maskTile, inst.x, inst.y), patRot);
      instanceAssetsRef.current.set(inst.id, { stencilFull, paintFull: pf });
      instanceOutlinesRef.current.set(inst.id, buildOutlineFromFull(stencilFull));
      instanceCommittedTransformRef.current[inst.id] = { size: ts, tileRot, patRot };
    })).then(() => {
      if (cancelled) return;
      setTekliPhase("painting"); phaseRef.current="painting";
      const firstId = instRef.current[0]?.id ?? null;
      setSelectedInstId(firstId); selIdRef.current=firstId;
      redraw();
    });
    return () => { cancelled=true; };
  }, [redraw]);

  // ── Reset to placing (keep positions, clear paint) ─────────────────────────
  const resetToPlacing = useCallback(() => {
    instanceAssetsRef.current.clear();
    instanceCoverageRef.current.clear();
    instanceOutlinesRef.current.clear();
    instanceCommittedTransformRef.current = {};
    setTekliPhase("placing"); phaseRef.current="placing";
    setSelectedInstId(null); selIdRef.current=null;
    redraw();
  }, [redraw]);

  // ── Rebuild a single confirmed instance at a new size (clears paint) ────────
  // ── Transform a confirmed instance: scale/rotate stencil + paint together ────
  // Rebuilds stencilFull at the new config from scratch (clean vector quality).
  // Applies the exact delta transform to paintFull so painted pixels follow the motif.
  // Delta = undo old patRot → undo old tileRot → scale → apply new tileRot → apply new patRot
  const applyInstanceTransform = useCallback(async (
    instId: string,
    oldSize: number, newSize: number,
    oldTileRot: number, newTileRot: number,
    oldPatRot: number,  newPatRot: number,
  ) => {
    const version = (transformVersionRef.current[instId] ?? 0) + 1;
    transformVersionRef.current[instId] = version;

    const inst = instRef.current.find(i => i.id === instId);
    if (!inst) return;
    const motif = allMotifsRef.current.find(m => m.id === inst.motifId);
    if (!motif) return;

    const mc = instanceColorsRef.current[instId] ?? "#e8c56a";
    const colorTileRaw = await renderColorTile(motif, mc, newSize);
    if (transformVersionRef.current[instId] !== version) return; // superseded by newer call

    const colorTile    = rotateTile(colorTileRaw, newTileRot);
    const maskTile     = makeHardMaskTile(colorTile);
    const newStencilFull = rotateFullCanvas(placeTileOnFull(maskTile, inst.x, inst.y), newPatRot);

    const existingAssets = instanceAssetsRef.current.get(instId);
    const pf = document.createElement("canvas"); pf.width = CANVAS_W; pf.height = CANVAS_H;

    if (existingAssets) {
      const pfctx = pf.getContext("2d")!;
      const cx = CANVAS_W / 2, cy = CANVAS_H / 2;
      const ix = inst.x, iy = inst.y;
      const s   = newSize / oldSize;
      const T0  = oldTileRot * Math.PI / 180;
      const T1  = newTileRot * Math.PI / 180;
      const P0  = oldPatRot  * Math.PI / 180;
      const P1  = newPatRot  * Math.PI / 180;

      // Canvas ctx transforms are applied right-to-left to pixels.
      // We set them outermost-first so the net CTM = T5·T4·T3·T2·T1,
      // meaning pixels go through T1 first then T5 last.
      pfctx.save();
      pfctx.translate(cx, cy);  pfctx.rotate(P1);  pfctx.translate(-cx, -cy); // T5: new patRot
      pfctx.translate(ix, iy);  pfctx.rotate(T1);  pfctx.translate(-ix, -iy); // T4: new tileRot
      pfctx.translate(ix, iy);  pfctx.scale(s, s); pfctx.translate(-ix, -iy); // T3: scale
      pfctx.translate(ix, iy);  pfctx.rotate(-T0); pfctx.translate(-ix, -iy); // T2: undo tileRot
      pfctx.translate(cx, cy);  pfctx.rotate(-P0); pfctx.translate(-cx, -cy); // T1: undo patRot
      pfctx.drawImage(existingAssets.paintFull, 0, 0);
      pfctx.restore();

      // Clip transformed paint to the new stencil shape
      pfctx.globalCompositeOperation = "destination-in";
      pfctx.drawImage(newStencilFull, 0, 0);
    }

    instanceAssetsRef.current.set(instId, { stencilFull: newStencilFull, paintFull: pf });
    instanceOutlinesRef.current.set(instId, buildOutlineFromFull(newStencilFull));
    instanceCoverageRef.current.delete(instId);
    redraw();
  }, [redraw]);

  // ── Rebuild stencil only — paint pixels stay exactly as-is ───────────────
  // Called on every slider change in painting phase. Fast: no paint transform needed.
  const rebuildStencilOnly = useCallback(async (instId: string) => {
    const version = (transformVersionRef.current[instId] ?? 0) + 1;
    transformVersionRef.current[instId] = version;

    const inst = instRef.current.find(i => i.id === instId);
    if (!inst) return;
    const motif = allMotifsRef.current.find(m => m.id === inst.motifId);
    if (!motif) return;

    const mc      = instanceColorsRef.current[instId] ?? "#e8c56a";
    const newSize = instanceSizesRef.current[instId] ?? 120;
    const tileRot = instanceRotationsRef.current[instId] ?? 0;
    const patRot  = instancePatRotationsRef.current[instId] ?? 0;

    const colorTileRaw = await renderColorTile(motif, mc, newSize);
    if (transformVersionRef.current[instId] !== version) return;

    const colorTile      = rotateTile(colorTileRaw, tileRot);
    const maskTile       = makeHardMaskTile(colorTile);
    const newStencilFull = rotateFullCanvas(placeTileOnFull(maskTile, inst.x, inst.y), patRot);

    const existing = instanceAssetsRef.current.get(instId);
    if (existing) {
      instanceAssetsRef.current.set(instId, { stencilFull: newStencilFull, paintFull: existing.paintFull });
      instanceOutlinesRef.current.set(instId, buildOutlineFromFull(newStencilFull));
      redraw();
    }
  }, [redraw]);

  // ── Commit transform to paint — bakes delta from committed→current into paint ──
  const commitTransformToInstance = useCallback((instId: string) => {
    const committed = instanceCommittedTransformRef.current[instId];
    if (!committed) return;
    const newSize    = instanceSizesRef.current[instId] ?? 120;
    const newTileRot = instanceRotationsRef.current[instId] ?? 0;
    const newPatRot  = instancePatRotationsRef.current[instId] ?? 0;
    instanceCommittedTransformRef.current[instId] = { size: newSize, tileRot: newTileRot, patRot: newPatRot };
    applyInstanceTransform(instId, committed.size, newSize, committed.tileRot, newTileRot, committed.patRot, newPatRot);
  }, [applyInstanceTransform]);

  // ── Grid: confirm placement → build stencils → enter painting ─────────────
  const confirmGridPlacement = useCallback(() => {
    let cancelled = false;
    Promise.all([...gridActiveIdsRef.current].map(async motifId => {
      const motif = allMotifsRef.current.find(m => m.id === motifId);
      if (!motif) return;
      const sz    = sizesRef.current[motifId] ?? 120;
      const color = gridColorsRef.current[motifId] ?? "#e8c56a";
      const tileKey = `${motifId}:${sz}:${color}`;
      let colorTile = gridColorTilesRef.current.get(tileKey);
      if (!colorTile) {
        colorTile = await renderColorTile(motif, color, sz);
        if (cancelled) return;
        gridColorTilesRef.current.set(tileKey, colorTile);
      }
      const off = gridOffsetsRef.current[motifId] ?? { x: 0, y: 0 };
      const tileRot = gridTileRotationRef.current[motifId] ?? 0;
      const patRot  = gridPatternRotationRef.current[motifId] ?? 0;
      // Build stencil using tileOnto so it matches the ghost guide exactly (gap-free at any rotation)
      const rotatedColorTile = rotateTile(colorTile, tileRot);
      const stencilTile = makeHardMaskTile(rotatedColorTile);
      const stencilFull = document.createElement("canvas");
      stencilFull.width = CANVAS_W; stencilFull.height = CANVAS_H;
      tileOnto(stencilFull.getContext("2d")!, stencilTile, off.x, off.y, 0, patRot, 1);
      const paintFull = document.createElement("canvas");
      paintFull.width = CANVAS_W; paintFull.height = CANVAS_H;
      if (!cancelled) {
        gridPaintAssetsRef.current.set(motifId, { stencilFull, paintFull });
        gridOutlinesRef.current.set(motifId, buildOutlineFromFull(stencilFull));
      }
    })).then(() => {
      if (cancelled) return;
      setGridPhase("painting"); gridPhaseRef.current = "painting";
      redraw();
    });
    return () => { cancelled = true; };
  }, [redraw]);

  // ── Grid: reset to placing (keep offsets, clear paint) ────────────────────
  const resetGridToPlacing = useCallback(() => {
    gridPaintAssetsRef.current.clear();
    gridOutlinesRef.current.clear();
    gridCoverageRef.current.clear();
    setGridPhase("placing"); gridPhaseRef.current = "placing";
    redraw();
  }, [redraw]);

  // ── Surface photo upload ──────────────────────────────────────────────────
  const handleSurfaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas"); c.width = CANVAS_W; c.height = CANVAS_H;
      const fctx = c.getContext("2d")!;
      // Cover-fit: scale to fill canvas, centered
      const scale = Math.max(CANVAS_W / img.width, CANVAS_H / img.height);
      const sw = img.width * scale, sh = img.height * scale;
      fctx.drawImage(img, (CANVAS_W - sw) / 2, (CANVAS_H - sh) / 2, sw, sh);
      surfaceRef.current = c;
      photoSurfaceRef.current = true; // set immediately so the synchronous redraw uses source-over
      setSurface("foto");
      URL.revokeObjectURL(url);
      redraw();
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
    e.target.value = "";
  };

  // ── SVG upload ────────────────────────────────────────────────────────────
  const handleSvgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const raw = ev.target?.result as string;
      const id  = `custom_${Date.now()}`;
      const name = file.name.replace(/\.svg$/i,"").slice(0,18);
      const m: Motif = { id, name, description:"Yüklenen motif", svg:normalizeSvg(raw) };
      setCustomMotifs(prev => [...prev, m]);
      setMotifSizes(prev => ({...prev,[id]:120}));
      if (modeRef.current === "grid") {
        setGridActiveIds(new Set([id]));
      } else {
        setTekliActiveIds(new Set([id]));
        setMotifCounts(prev => ({...prev,[id]:1}));
      }
    };
    reader.readAsText(file); e.target.value="";
  };

  // ── PNG upload: detect + remove background, use shape as motif ───────────
  const handlePngUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const w = img.width, h = img.height;
        const tmp = document.createElement("canvas"); tmp.width=w; tmp.height=h;
        const ctx = tmp.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const id2 = ctx.getImageData(0, 0, w, h);
        const d = id2.data;

        // Sample all 4 edges to find the most common color (quantized to 16-step buckets)
        const freq = new Map<string, number>();
        const sample = (x: number, y: number) => {
          const i = (y * w + x) * 4;
          if (d[i+3] < 128) return;
          const r = Math.round(d[i]   / 16) * 16;
          const g = Math.round(d[i+1] / 16) * 16;
          const b = Math.round(d[i+2] / 16) * 16;
          const key = `${r},${g},${b}`;
          freq.set(key, (freq.get(key) ?? 0) + 1);
        };
        for (let x = 0; x < w; x++) { sample(x, 0); sample(x, h-1); }
        for (let y = 1; y < h-1; y++) { sample(0, y); sample(w-1, y); }

        let bgKey = "255,255,255", max = 0;
        for (const [key, cnt] of freq) { if (cnt > max) { max = cnt; bgKey = key; } }
        const [bgR, bgG, bgB] = bgKey.split(",").map(Number);

        // Remove background: hard threshold + soft anti-aliased edge band
        const hard = 40, soft = 60;
        for (let i = 0; i < d.length; i += 4) {
          const dr = d[i]-bgR, dg = d[i+1]-bgG, db = d[i+2]-bgB;
          const dist = Math.sqrt(dr*dr + dg*dg + db*db);
          if (dist < hard) {
            d[i+3] = 0;
          } else if (dist < soft) {
            d[i+3] = Math.round(d[i+3] * (dist - hard) / (soft - hard));
          }
        }
        ctx.putImageData(id2, 0, 0);

        const pngDataUrl = tmp.toDataURL("image/png");
        const id = `custom_${Date.now()}`;
        const name = file.name.replace(/\.png$/i,"").slice(0,18);
        const placeholder = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"></svg>`;
        const m: Motif = { id, name, description:"Yüklenen PNG motif", svg:placeholder, pngDataUrl };
        setCustomMotifs(prev => [...prev, m]);
        setMotifSizes(prev => ({...prev,[id]:120}));
        if (modeRef.current === "grid") {
          setGridActiveIds(new Set([id]));
        } else {
          setTekliActiveIds(new Set([id]));
          setMotifCounts(prev => ({...prev,[id]:1}));
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file); e.target.value="";
  };

  // ── Canvas position helper ────────────────────────────────────────────────

  // ── Bristle brush ─────────────────────────────────────────────────────────
  const applyBrush = useCallback((x:number, y:number, strokeAngle:number|null) => {
    if (modeRef.current === "grid") {
      for (const [motifId, assets] of gridPaintAssetsRef.current.entries()) {
        const color = gridColorsRef.current[motifId] ?? "#e8c56a";
        stampBristles(assets.paintFull.getContext("2d")!, assets.stencilFull, x, y, brushRef.current, strokeAngle, color, brushOpacityRef.current);
      }
      redraw(); return;
    }
    if (paintTargetRef.current==="all") {
      for (const [instId, assets] of instanceAssetsRef.current.entries()) {
        const color = instanceColorsRef.current[instId] ?? "#e8c56a";
        stampBristles(assets.paintFull.getContext("2d")!, assets.stencilFull, x, y, brushRef.current, strokeAngle, color, brushOpacityRef.current);
      }
    } else {
      const id=selIdRef.current; if (!id) return;
      const assets=instanceAssetsRef.current.get(id); if (!assets) return;
      const color = instanceColorsRef.current[id] ?? "#e8c56a";
      stampBristles(assets.paintFull.getContext("2d")!, assets.stencilFull, x, y, brushRef.current, strokeAngle, color, brushOpacityRef.current);
    }
    redraw();
  }, [redraw]);

  const strokeTo = useCallback((from:{x:number;y:number}, to:{x:number;y:number}) => {
    const dx=to.x-from.x, dy=to.y-from.y;
    const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/(brushRef.current*0.2)));
    const angle=Math.atan2(dy,dx);
    for (let i=0;i<=steps;i++) { const t=i/steps; applyBrush(from.x+dx*t, from.y+dy*t, angle); }
  }, [applyBrush]);

  // ── Pointer down ─────────────────────────────────────────────────────────
  const handleDown = (p: {x:number;y:number;altKey?:boolean}) => {
    if (modeRef.current==="grid") {
      if (gridPhaseRef.current === "placing") {
        const motifId = gridSelMotifRef.current;
        const off = gridOffsetsRef.current[motifId] ?? { x: 0, y: 0 };
        gridDrag.current = { motifId, sx: p.x, sy: p.y, sox: off.x, soy: off.y };
      } else {
        isPainting.current = true; lastPos.current = p;
        applyBrush(p.x, p.y, null);
      }
      return;
    }

    if (modeRef.current==="tekli" && phaseRef.current==="placing") {
      // Hit-test all ghost instances (back-to-front, pick topmost)
      // Inverse-rotate the click point per instance to work in base (pre-patRot) coords.
      const hit = [...instRef.current].reverse().find(inst => {
        const ts = instanceSizesRef.current[inst.id] ?? 120;
        const patRotDeg = instancePatRotationsRef.current[inst.id] ?? 0;
        const bp = applyPatRot(p, -patRotDeg);
        return bp.x>=inst.x-ts/2 && bp.x<=inst.x+ts/2 && bp.y>=inst.y-ts/2 && bp.y<=inst.y+ts/2;
      });
      if (hit) {
        if (hit.locked) {
          console.log(`[drag blocked] instance ${hit.id} is locked`);
        } else {
          const patRotDeg = instancePatRotationsRef.current[hit.id] ?? 0;
          const bp = applyPatRot(p, -patRotDeg);
          dragging.current = { id:hit.id, dx:bp.x-hit.x, dy:bp.y-hit.y, x:hit.x, y:hit.y };
        }
        setSelectedInstId(hit.id); selIdRef.current=hit.id;
      } else {
        // Click outside all ghosts: move the single selected ghost there (if only one active)
        if (instRef.current.length===1) {
          const inst=instRef.current[0];
          if (inst.locked) {
            console.log(`[drag blocked] instance ${inst.id} is locked (click-outside)`);
          } else {
            const patRotDeg = instancePatRotationsRef.current[inst.id] ?? 0;
            const bp = applyPatRot(p, -patRotDeg);
            dragging.current={ id:inst.id, dx:0, dy:0, x:bp.x, y:bp.y };
            redraw();
          }
        }
      }
      return;
    }

    if (modeRef.current==="tekli" && phaseRef.current==="painting") {
      dragging.current = null; // positions are locked — no dragging in painting phase
      if (paintTargetRef.current==="all") {
        // Hit-test to update selected instance even in "all" mode (for UI indicator)
        const hit = [...instRef.current].reverse().find(inst => {
          const ts = instanceSizesRef.current[inst.id] ?? 120;
          const bp = applyPatRot(p, -(instancePatRotationsRef.current[inst.id] ?? 0));
          return bp.x>=inst.x-ts/2 && bp.x<=inst.x+ts/2 && bp.y>=inst.y-ts/2 && bp.y<=inst.y+ts/2;
        });
        if (hit) { setSelectedInstId(hit.id); selIdRef.current=hit.id; }
        isPainting.current=true; lastPos.current=p;
        applyBrush(p.x, p.y, null);
      } else {
        // "Selected" mode: clicking within a different instance's bbox switches selection.
        // Painting always applies to the currently selected instance (from anywhere on canvas).
        const hit = [...instRef.current].reverse().find(inst => {
          const ts = instanceSizesRef.current[inst.id] ?? 120;
          const patRotDeg = instancePatRotationsRef.current[inst.id] ?? 0;
          const bp = applyPatRot(p, -patRotDeg);
          return bp.x>=inst.x-ts/2 && bp.x<=inst.x+ts/2 && bp.y>=inst.y-ts/2 && bp.y<=inst.y+ts/2;
        });
        if (hit && hit.id !== selIdRef.current) {
          setSelectedInstId(hit.id); selIdRef.current=hit.id;
        }
        if (selIdRef.current) {
          isPainting.current=true; lastPos.current=p;
          applyBrush(p.x, p.y, null);
        }
      }
      return;
    }

  };

  // ── Pointer move ──────────────────────────────────────────────────────────
  const handleMove = (p: {x:number;y:number;altKey?:boolean}) => {
    if (modeRef.current==="grid") {
      if (gridDrag.current) {
        const { motifId, sx, sy, sox, soy } = gridDrag.current;
        // Un-rotate the screen-space delta into the tile's local (pre-rotation) space
        // so drag always follows the mouse regardless of pattern rotation angle.
        const patDeg = gridPatternRotationRef.current[motifId] ?? 0;
        const a = patDeg * Math.PI / 180;
        const dx = p.x - sx, dy = p.y - sy;
        const cos = Math.cos(a), sin = Math.sin(a);
        gridOffsetsRef.current = {
          ...gridOffsetsRef.current,
          [motifId]: { x: sox + dx * cos + dy * sin, y: soy - dx * sin + dy * cos },
        };
        rebuildGridFulls(motifId);
      } else if (isPainting.current && lastPos.current) {
        strokeTo(lastPos.current, p); lastPos.current = p;
      }
      return;
    }

    if (dragging.current) {
      // Instances are locked after Uygula — discard any stale drag in painting phase
      if (phaseRef.current === "painting") { dragging.current = null; return; }
      const patRotDeg = instancePatRotationsRef.current[dragging.current.id] ?? 0;
      const bp = patRotDeg ? applyPatRot(p, -patRotDeg) : p;
      dragging.current.x = bp.x - dragging.current.dx;
      dragging.current.y = bp.y - dragging.current.dy;
      redraw(); return;
    }
    if (!isPainting.current||!lastPos.current) return;
    strokeTo(lastPos.current, p); lastPos.current=p;
  };

  // ── Pointer up ────────────────────────────────────────────────────────────
  const handleUp = () => {
    if (modeRef.current==="grid") {
      gridDrag.current = null;
      isPainting.current = false; lastPos.current = null;
      // Recompute grid coverage for outline fade
      if (gridPhaseRef.current === "painting") {
        const step = 4;
        for (const motifId of gridActiveIdsRef.current) {
          const assets = gridPaintAssetsRef.current.get(motifId);
          if (!assets) continue;
          const data = assets.paintFull.getContext("2d")!.getImageData(0, 0, CANVAS_W, CANVAS_H).data;
          let sum = 0, count = 0;
          for (let iy = 0; iy < CANVAS_H; iy += step)
            for (let ix = 0; ix < CANVAS_W; ix += step)
              { sum += data[(iy * CANVAS_W + ix) * 4 + 3]; count++; }
          // Amplify — grid stencil covers ~40-60% of canvas
          gridCoverageRef.current.set(motifId, count > 0 ? Math.min(1, (sum / count / 255) * 2.5) : 0);
        }
      }
      redraw();
      return;
    }

    if (dragging.current) {
      const {id,x,y}=dragging.current;
      setInstances(prev=>prev.map(i=>i.id===id?{...i,x,y}:i));
      dragging.current=null;
    }
    // After each stroke in tekli painting, recompute coverage for ghost fade
    if (modeRef.current==="tekli" && phaseRef.current==="painting") {
      for (const inst of instRef.current) {
        const assets = instanceAssetsRef.current.get(inst.id);
        if (!assets) continue;
        if (paintTargetRef.current==="selected" && inst.id!==selIdRef.current) continue;
        const ts = instanceSizesRef.current[inst.id] ?? 120;
        const pctx = assets.paintFull.getContext("2d")!;
        const x0 = Math.max(0, Math.floor(inst.x - ts/2));
        const y0 = Math.max(0, Math.floor(inst.y - ts/2));
        const w = Math.min(CANVAS_W, Math.ceil(inst.x + ts/2)) - x0;
        const h = Math.min(CANVAS_H, Math.ceil(inst.y + ts/2)) - y0;
        if (w > 0 && h > 0) {
          const step = 4;
          const imgData = pctx.getImageData(x0, y0, w, h);
          const data = imgData.data;
          let sum = 0, count = 0;
          for (let iy = 0; iy < h; iy += step) {
            for (let ix = 0; ix < w; ix += step) {
              sum += data[(iy * w + ix) * 4 + 3];
              count++;
            }
          }
          // Amplify: stencil covers ~30-50% of bbox, so multiply to estimate actual fill fraction
          const cov = count > 0 ? Math.min(1, (sum / count / 255) * 3.5) : 0;
          instanceCoverageRef.current.set(inst.id, cov);
        }
      }
    }
    isPainting.current=false; lastPos.current=null;
    redraw();
  };

  // ── Stable handler refs (updated every render, read by native listeners) ──
  const handleDownRef = useRef(handleDown);
  const handleMoveRef = useRef(handleMove);
  const handleUpRef   = useRef(handleUp);
  handleDownRef.current = handleDown;
  handleMoveRef.current = handleMove;
  handleUpRef.current   = handleUp;

  // ── Native canvas event listeners (bypass React synthetic events for altKey + passive) ─
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const mousePos = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX-r.left)*(CANVAS_W/r.width), y: (e.clientY-r.top)*(CANVAS_H/r.height) };
    };
    const touchPos = (e: TouchEvent) => {
      const r = canvas.getBoundingClientRect();
      const t = e.touches[0] ?? e.changedTouches[0];
      return { x: (t.clientX-r.left)*(CANVAS_W/r.width), y: (t.clientY-r.top)*(CANVAS_H/r.height) };
    };
    const onDown      = (e: MouseEvent) => { e.preventDefault(); handleDownRef.current({...mousePos(e), altKey: e.altKey}); };
    const onMove      = (e: MouseEvent) => { handleMoveRef.current({...mousePos(e), altKey: e.altKey}); };
    const onUp        = () => { handleUpRef.current(); };
    const onTouchStart = (e: TouchEvent) => { e.preventDefault(); handleDownRef.current(touchPos(e)); };
    const onTouchMove  = (e: TouchEvent) => { e.preventDefault(); handleMoveRef.current(touchPos(e)); };
    const onTouchEnd   = () => { handleUpRef.current(); };
    canvas.addEventListener("mousedown",   onDown);
    canvas.addEventListener("mousemove",   onMove);
    canvas.addEventListener("mouseup",     onUp);
    canvas.addEventListener("mouseleave",  onUp);
    canvas.addEventListener("touchstart",  onTouchStart, { passive: false });
    canvas.addEventListener("touchmove",   onTouchMove,  { passive: false });
    canvas.addEventListener("touchend",    onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);
    return () => {
      canvas.removeEventListener("mousedown",   onDown);
      canvas.removeEventListener("mousemove",   onMove);
      canvas.removeEventListener("mouseup",     onUp);
      canvas.removeEventListener("mouseleave",  onUp);
      canvas.removeEventListener("touchstart",  onTouchStart);
      canvas.removeEventListener("touchmove",   onTouchMove);
      canvas.removeEventListener("touchend",    onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []); // stable — handlers accessed via refs

  const clearCanvas = () => {
    if (modeRef.current === "grid") {
      for (const assets of gridPaintAssetsRef.current.values())
        assets.paintFull.getContext("2d")!.clearRect(0, 0, CANVAS_W, CANVAS_H);
    } else {
      for (const assets of instanceAssetsRef.current.values())
        assets.paintFull.getContext("2d")!.clearRect(0,0,CANVAS_W,CANVAS_H);
      instanceCoverageRef.current.clear();
    }
    redraw();
  };

  // ── Motif toggle helpers ──────────────────────────────────────────────────
  const toggleGridMotif = (id: string) => {
    setGridActiveIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) { if (n.size > 1) n.delete(id); }
      else { n.add(id); setGridSelectedMotifId(id); gridSelMotifRef.current = id; }
      return n;
    });
  };
  const toggleTekliMotif = (id: string) => {
    setTekliActiveIds(prev => {
      const n=new Set(prev);
      if (n.has(id)) { if (n.size>1) { n.delete(id); setMotifCounts(c=>({...c,[id]:1})); } }
      else { n.add(id); }
      return n;
    });
  };
  const removeCustom = (id: string) => {
    setCustomMotifs(prev=>prev.filter(m=>m.id!==id));
    setTekliActiveIds(prev=>{ const n=new Set(prev); n.delete(id); return n.size>0?n:new Set([PRESET_MOTIFS[0].id]); });
    setGridActiveIds(prev=>{ const n=new Set(prev); n.delete(id); return n.size>0?n:new Set([PRESET_MOTIFS[0].id]); });
  };
  const adjustCount = (motifId: string, delta: number) => {
    setMotifCounts(prev => ({ ...prev, [motifId]: Math.max(1, (prev[motifId]??1)+delta) }));
  };

  // Derive active motif lists for rendering
  const tekliActiveList = allMotifs.filter(m => tekliActiveIds.has(m.id));
  const gridActiveList  = allMotifs.filter(m => gridActiveIds.has(m.id));


  // ─── Render ───────────────────────────────────────────────────────────────
  const accent = "#e8c56a"; // used by canvas ghost/outline tiles

  // Site design tokens — HSL via CSS variables (theme + dark-mode aware)
  const C = {
    bg:           "hsl(var(--background))",
    card:         "hsl(var(--card))",
    border:       "hsl(var(--border))",
    text:         "hsl(var(--foreground))",
    muted:        "hsl(var(--muted-foreground))",
    primary:      "hsl(var(--primary))",
    primaryFg:    "hsl(var(--primary-foreground))",
    chipBg:       "hsl(var(--muted))",
    chipActive:   "hsl(var(--primary))",
    chipActiveBg: "hsl(var(--accent))",
    shadow:       "0 10px 30px -12px hsl(var(--foreground) / 0.18)",
    shadowSm:     "0 2px 8px -2px hsl(var(--foreground) / 0.10)",
  };
  const FF = {
    serif: "'Cormorant Garamond', Georgia, serif",
    sans:  "'DM Sans', system-ui, sans-serif",
  };

  const SIZES: { label: string; px: number }[] = [
    { label: "20cm", px: 100 },
    { label: "30cm", px: 150 },
    { label: "40cm", px: 200 },
    { label: "50cm", px: 250 },
  ];
  // curSz: grid → first active motif size; tekli → selected instance size (keyed by instanceId)
  const activeFirstMotifId = [...gridActiveIds][0] ?? PRESET_MOTIFS[0].id;
  const curSz = placementMode==="grid"
    ? (motifSizes[activeFirstMotifId] ?? 150)
    : (instanceSizes[selectedInstId ?? ""] ?? 150);
  const selSizePx = SIZES.find(s => s.px === curSz)?.px ?? null;

  const setAllSizes = (px: number) => {
    if (placementMode==="grid") {
      const upd: Record<string,number> = {};
      for (const id of gridActiveIds) upd[id] = px;
      setMotifSizes(prev => ({...prev, ...upd}));
    } else {
      // Apply to selected instance (or all instances if none selected)
      const targets = selectedInstId
        ? [selectedInstId]
        : instances.map(i => i.id);
      const upd: Record<string,number> = {};
      for (const id of targets) upd[id] = px;
      setInstanceSizes(prev => ({...prev, ...upd}));
      instanceSizesRef.current = {...instanceSizesRef.current, ...upd};
      // In painting phase, stencil mask must be rebuilt for selected instance
      if (tekliPhase==="painting" && selectedInstId) rebuildStencilOnly(selectedInstId);
    }
  };

  const PRESET_COLORS = ["#c0392b","#c47d5e","#e8b86d","#4a7c59","#2980b9","#7b5ea7","#3d3028","#d4c4b0"];
  const activeColor = placementMode==="grid"
    ? (gridColors[gridSelectedMotifId]??"#c0392b")
    : (selectedInstId ? (instanceColors[selectedInstId]??"#c0392b") : "#c0392b");
  const setActiveColor = (c: string) => {
    if (placementMode==="grid") setGridColors(prev=>({...prev,[gridSelectedMotifId]:c}));
    else if (selectedInstId) setInstanceColors(prev=>({...prev,[selectedInstId]:c}));
  };

  const isPlacing = placementMode==="grid" ? gridPhase==="placing" : tekliPhase==="placing";
  const isPaintingPhase = !isPlacing;
  const confirmFn = placementMode==="grid" ? confirmGridPlacement : confirmPlacement;
  const resetFn   = placementMode==="grid" ? resetGridToPlacing  : resetToPlacing;

  // Suppress unused-var warnings (advanced functions hidden, re-enabled via dropdown)
  const _adv = { ScrubNumber, setPaintTarget, rebuildStencilOnly, commitTransformToInstance, tekliActiveList, accent };
  void _adv;

  const labelSt: React.CSSProperties = {
    fontFamily:FF.sans, fontSize:10, fontWeight:500,
    textTransform:"uppercase", letterSpacing:"0.08em",
    color:C.muted, marginBottom:3, display:"block",
  };
  const chipBtnSt = (active: boolean, size: "sm"|"md" = "md"): React.CSSProperties => ({
    fontFamily:FF.sans,
    fontSize: size==="sm" ? 11 : 12,
    fontWeight: active ? 600 : 450,
    padding: size==="sm" ? "4px 11px" : "6px 15px",
    borderRadius: 999,
    cursor: "pointer",
    transition: "all 0.18s ease",
    border: `1px solid ${active ? "transparent" : C.border}`,
    background: active ? C.primary : C.chipBg,
    color: active ? C.primaryFg : C.text,
    boxShadow: active ? "0 2px 10px -2px hsl(var(--primary) / 0.35)" : "none",
    outline: "none",
    letterSpacing: "0.01em",
  });

  return (
    <div
      className={className}
      style={{
        display:"flex", flexDirection:"column", alignItems:"center", gap:0,
        background:C.bg, fontFamily:FF.sans,
        ...(embedded ? { width:"100%", height:"100%" } : { minHeight:"100vh" }),
        ...style,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        .sc-chip { transition: all 0.18s ease; }
        .sc-chip:hover { filter: brightness(0.96); transform: translateY(-1px); }
        .sc-chip:focus-visible { outline: 2px solid hsl(var(--ring)); outline-offset: 2px; }
        .sc-swatch { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .sc-swatch:hover { transform: scale(1.15); box-shadow: 0 3px 10px hsl(var(--foreground) / 0.18) !important; }
        .sc-swatch:focus-visible { outline: 2px solid hsl(var(--ring)); outline-offset: 2px; }
        .sc-action { transition: all 0.18s ease; }
        .sc-action:hover { filter: brightness(0.95); transform: translateY(-1px); }
        .sc-action:focus-visible { outline: 2px solid hsl(var(--ring)); outline-offset: 2px; }
        input[type=range].sc-slider { height: 4px; border-radius: 2px; cursor: pointer; }
        input[type=range].sc-slider::-webkit-slider-thumb { width:16px; height:16px; border-radius:50%; background:hsl(var(--primary)); border:2px solid hsl(var(--card)); box-shadow:0 1px 4px hsl(var(--foreground) / 0.18); cursor:pointer; }
        input[type=range].sc-slider::-moz-range-thumb { width:16px; height:16px; border-radius:50%; background:hsl(var(--primary)); border:2px solid hsl(var(--card)); box-shadow:0 1px 4px hsl(var(--foreground) / 0.18); cursor:pointer; }
      `}</style>

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div style={{
        width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"10px 20px",background:C.card,borderBottom:`1px solid ${C.border}`,
        boxShadow:C.shadowSm,
        position: embedded ? "relative" : "sticky", top:0, zIndex:30,
        boxSizing:"border-box",
      }}>
        {/* Logo + Mode toggle */}
        <div style={{display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
          <span style={{fontFamily:FF.serif,fontSize:18,fontWeight:600,color:C.text,letterSpacing:"0.04em",whiteSpace:"nowrap"}}>
            Stencil Canvas
          </span>
          <div style={{display:"flex",background:C.chipBg,borderRadius:24,padding:3,gap:1,border:`1px solid ${C.border}`}}>
            {(["grid","tekli"] as PlacementMode[]).map(m => {
              const a = placementMode===m;
              return (
                <button key={m} onClick={()=>{setPlacementMode(m);modeRef.current=m;}} style={{
                  fontFamily:FF.sans,fontSize:12,fontWeight:a?500:400,
                  padding:"3px 13px",borderRadius:20,cursor:"pointer",transition:"all 0.2s",
                  border:"none",background:a?C.card:"transparent",
                  color:a?C.primary:C.muted,
                  boxShadow:a?C.shadowSm:"none",
                }}>{m==="grid"?"Grid":"Tekli"}</button>
              );
            })}
          </div>
        </div>

        {/* Motif chips */}
        <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center",justifyContent:"center",flex:1,padding:"0 12px"}}>
          {allMotifs.map(m => {
            const isActive = placementMode==="grid" ? gridActiveIds.has(m.id) : tekliActiveIds.has(m.id);
            return (
              <div key={m.id} style={{position:"relative"}}>
                <button
                  className="sc-chip"
                  onClick={()=>placementMode==="grid" ? toggleGridMotif(m.id) : toggleTekliMotif(m.id)}
                  style={chipBtnSt(isActive,"sm")} title={m.description}>
                  {m.name}
                </button>
                {customMotifs.some(c=>c.id===m.id) && (
                  <button onClick={()=>removeCustom(m.id)} style={{
                    position:"absolute",top:-4,right:-4,width:13,height:13,borderRadius:"50%",
                    background:"hsl(var(--destructive))",border:"1.5px solid hsl(var(--card))",color:"hsl(var(--destructive-foreground))",
                    fontSize:8,cursor:"pointer",padding:0,
                    display:"flex",alignItems:"center",justifyContent:"center",
                  }}>×</button>
                )}
              </div>
            );
          })}
          <label style={{...chipBtnSt(false),display:"flex",alignItems:"center",gap:3,border:`1.5px dashed ${C.border}`,color:C.muted,userSelect:"none"}}>
            + SVG
            <input type="file" accept=".svg,image/svg+xml" onChange={handleSvgUpload} style={{display:"none"}}/>
          </label>
          <label style={{...chipBtnSt(false),display:"flex",alignItems:"center",gap:3,border:`1.5px dashed ${C.border}`,color:C.muted,userSelect:"none"}}>
            + PNG
            <input type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" onChange={handlePngUpload} style={{display:"none"}}/>
          </label>
        </div>

        {/* Advanced dropdown */}
        <div ref={advancedRef} style={{position:"relative",flexShrink:0}}>
          <button onClick={()=>setShowAdvanced(v=>!v)} style={{
            fontFamily:FF.sans,fontSize:12,fontWeight:500,
            padding:"5px 13px",borderRadius:8,cursor:"pointer",transition:"all 0.15s",
            border:`1.5px solid ${showAdvanced?C.primary:C.border}`,
            background:showAdvanced?C.chipActiveBg:C.card,
            color:showAdvanced?C.primary:C.text,
            display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap",
          }}>
            Gelişmiş
            <span style={{
              fontSize:8,display:"inline-block",marginTop:1,
              transform:showAdvanced?"rotate(180deg)":"none",transition:"transform 0.2s",
            }}>▼</span>
          </button>

          {/* Advanced dropdown panel */}
          {showAdvanced && (
            <div style={{
              position:"absolute",top:"calc(100% + 8px)",right:0,
              background:C.card,border:`1px solid ${C.border}`,
              borderRadius:12,boxShadow:C.shadow,
              padding:16,minWidth:290,zIndex:100,
              display:"flex",flexDirection:"column",gap:14,
            }}>
              {/* Header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:FF.serif,fontSize:15,color:C.text,fontWeight:500}}>Gelişmiş Ayarlar</span>
                <button onClick={()=>setShowAdvanced(false)} style={{
                  background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:16,padding:2,lineHeight:1,
                }}>×</button>
              </div>

              {/* Blend mode */}
              <div>
                <span style={labelSt}>Karışım Modu</span>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {([
                    {id:"multiply"  as GlobalCompositeOperation, label:"Çarp"},
                    {id:"overlay"   as GlobalCompositeOperation, label:"Katman"},
                    {id:"screen"    as GlobalCompositeOperation, label:"Ekran"},
                    {id:"source-over" as GlobalCompositeOperation, label:"Normal"},
                  ]).map(bm=>(
                    <button key={bm.id} onClick={()=>{setBlendMode(bm.id);blendModeRef.current=bm.id;redraw();}}
                      style={{...chipBtnSt(blendMode===bm.id),fontSize:11,padding:"3px 9px"}}>
                      {bm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Surface */}
              <div>
                <span style={labelSt}>Zemin</span>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {([...SURFACES,{id:"beyaz" as SurfaceId,name:"Beyaz"}]).map(s=>(
                    <button key={s.id} onClick={()=>setSurface(s.id)}
                      style={{...chipBtnSt(surface===s.id),fontSize:11,padding:"3px 9px"}}>
                      {s.name}
                    </button>
                  ))}
                  <label style={{
                    ...chipBtnSt(surface==="foto"),fontSize:11,padding:"3px 9px",
                    display:"flex",alignItems:"center",gap:3,userSelect:"none",
                  }}>
                    📷 Foto
                    <input type="file" accept="image/*" onChange={handleSurfaceUpload} style={{display:"none"}}/>
                    {surface==="foto" && (
                      <span onClick={e=>{e.preventDefault();e.stopPropagation();setSurface("beyaz");}}
                        style={{color:"hsl(var(--destructive))",fontWeight:"bold",cursor:"pointer",marginLeft:2}}>×</span>
                    )}
                  </label>
                </div>
              </div>

              {/* Brush size — painting only */}
              {isPaintingPhase && (
                <div>
                  <span style={labelSt}>Fırça Boyutu — <b style={{color:C.text,fontWeight:500}}>{brushSize}px</b></span>
                  <input type="range" min={8} max={120} step={1} value={brushSize}
                    onChange={e=>setBrushSize(Number(e.target.value))}
                    style={{width:"100%",accentColor:C.primary}}/>
                </div>
              )}

              {/* Rotation — grid mode */}
              {placementMode==="grid" && gridActiveList.length>0 && (
                <div>
                  <span style={labelSt}>Rotasyon</span>
                  {gridActiveList.map(m => {
                    const tRot = gridTileRotations[m.id] ?? 0;
                    const pRot = gridPatternRotations[m.id] ?? 0;
                    return (
                      <div key={m.id} style={{marginBottom:8}}>
                        <span style={{fontFamily:FF.sans,fontSize:10,color:C.muted,display:"block",marginBottom:3}}>
                          {m.name}
                        </span>
                        {([["Motif", tRot, (v:number)=>setGridTileRotations(p=>({...p,[m.id]:v}))],
                           ["Desen", pRot, (v:number)=>setGridPatternRotations(p=>({...p,[m.id]:v}))]] as [string,number,(v:number)=>void][])
                          .map(([lbl,val,fn])=>(
                          <div key={lbl} style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
                            <span style={{fontFamily:FF.sans,fontSize:10,color:C.muted,width:44}}>{lbl}</span>
                            <input type="range" min={0} max={360} step={1} value={val}
                              onChange={e=>fn(Number(e.target.value))}
                              style={{flex:1,accentColor:C.primary}}/>
                            <span style={{fontFamily:FF.sans,fontSize:10,color:C.muted,minWidth:26}}>{val}°</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Rotation — tekli selected instance */}
              {placementMode==="tekli" && selectedInstId && (()=>{
                const rot    = instanceRotations[selectedInstId] ?? 0;
                const patRot = instancePatRotations[selectedInstId] ?? 0;
                return (
                  <div>
                    <span style={labelSt}>Rotasyon (Seçili)</span>
                    {([["Motif", rot, (v:number)=>{
                        setInstanceRotations(p=>({...p,[selectedInstId]:v}));
                        instanceRotationsRef.current={...instanceRotationsRef.current,[selectedInstId]:v};
                        if (phaseRef.current==="painting") rebuildStencilOnly(selectedInstId);
                      }],
                      ["Desen", patRot, (v:number)=>{
                        setInstancePatRotations(p=>({...p,[selectedInstId]:v}));
                        instancePatRotationsRef.current={...instancePatRotationsRef.current,[selectedInstId]:v};
                        if (phaseRef.current==="painting") rebuildStencilOnly(selectedInstId);
                      }]] as [string,number,(v:number)=>void][])
                      .map(([lbl,val,fn])=>(
                      <div key={lbl} style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
                        <span style={{fontFamily:FF.sans,fontSize:10,color:C.muted,width:44}}>{lbl}</span>
                        <input type="range" min={0} max={360} step={1} value={val}
                          onChange={e=>fn(Number(e.target.value))}
                          style={{flex:1,accentColor:C.primary}}/>
                        <span style={{fontFamily:FF.sans,fontSize:10,color:C.muted,minWidth:26}}>{val}°</span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Perspektif warp */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{...labelSt,marginBottom:0}}>Perspektif Warp</span>
                <button onClick={()=>{
                  setShowPerspWarp(v=>!v);
                  if (!showPerspWarp) {
                    const d: PerspQuad = [[0,0],[CANVAS_W,0],[CANVAS_W,CANVAS_H],[0,CANVAS_H]];
                    setPerspCorners(d); perspCornersRef.current=d;
                  }
                }} style={{...chipBtnSt(showPerspWarp),fontSize:11,padding:"3px 12px"}}>
                  {showPerspWarp ? "Açık ✓" : "Kapalı"}
                </button>
              </div>

              {/* Tekli: commit transform */}
              {placementMode==="tekli" && tekliPhase==="painting" && selectedInstId && (
                <button onClick={()=>commitTransformToInstance(selectedInstId)} style={{
                  width:"100%",padding:"7px 0",borderRadius:8,
                  border:`1.5px solid ${C.primary}`,background:C.chipActiveBg,
                  color:C.primary,fontFamily:FF.sans,fontSize:12,fontWeight:500,cursor:"pointer",
                }}>Transformu Uygula</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── CANVAS + BOTTOM PANEL ──────────────────────────────────────────── */}
      <div style={{
        display:"flex", flexDirection:"column", alignItems:"center",
        padding: embedded ? "0" : "20px 20px 0",
        width:"100%", maxWidth: embedded ? "100%" : 920,
        boxSizing:"border-box",
      }}>

        {/* Tekli: instance navigator */}
        {placementMode==="tekli" && tekliPhase==="painting" && instances.length>1 && (()=>{
          const idx = instances.findIndex(i=>i.id===selectedInstId);
          const si  = idx>=0 ? instances[idx] : instances[0];
          const mName = allMotifs.find(m=>m.id===si?.motifId)?.name ?? "?";
          const nav = (lbl:string, ti:number) => (
            <button onClick={()=>{const t=instances[ti];setSelectedInstId(t.id);selIdRef.current=t.id;}}
              style={{fontFamily:FF.sans,padding:"3px 12px",borderRadius:6,
                border:`1px solid ${C.border}`,background:C.card,color:C.text,cursor:"pointer",fontSize:13}}>
              {lbl}
            </button>
          );
          return (
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
              {nav("←",(idx-1+instances.length)%instances.length)}
              <span style={{fontFamily:FF.serif,color:C.primary,fontSize:13,minWidth:80,textAlign:"center"}}>
                {mName} {idx+1}/{instances.length}
              </span>
              {nav("→",(idx+1)%instances.length)}
            </div>
          );
        })()}

        {/* Canvas wrapper */}
        <div style={{
          position:"relative",
          borderRadius: embedded ? 0 : "12px 12px 0 0",
          overflow:"hidden",
          boxShadow: embedded ? "none" : "0 8px 40px rgba(61,48,40,0.12)",
          border: embedded ? "none" : `1px solid ${C.border}`,
          borderBottom:"none", width:"100%",
        }}>
          <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
            style={{display:"block",width:"100%",maxHeight:"54vh",cursor:isPlacing?"grab":"crosshair"}}
          />
          {showPerspWarp && perspCorners.map((c,i)=>(
            <div key={i}
              onMouseDown={e=>{e.preventDefault();e.stopPropagation();dragCornerRef.current=i;}}
              onTouchStart={e=>{e.stopPropagation();dragCornerRef.current=i;}}
              style={{
                position:"absolute",
                left:`calc(${(c[0]/CANVAS_W)*100}% - 7px)`,
                top:`calc(${(c[1]/CANVAS_H)*100}% - 7px)`,
                width:14,height:14,borderRadius:"50%",
                background:"#e8c56a",border:"2px solid rgba(255,255,255,0.9)",
                cursor:"grab",zIndex:10,touchAction:"none",
                boxShadow:"0 1px 6px rgba(0,0,0,0.5)",
              }}
            />
          ))}
        </div>

        {/* ── Bottom panel ── */}
        <div style={{
          width:"100%", background:C.card,
          border: embedded ? "none" : `1px solid ${C.border}`,
          borderTop: `1px solid ${C.border}`,
          borderRadius: embedded ? 0 : "0 0 12px 12px",
          boxShadow: embedded ? "none" : "0 8px 20px rgba(61,48,40,0.09)",
          padding:"12px 16px",
          display:"flex", gap:0, alignItems:"center", flexWrap:"wrap", rowGap:10,
          boxSizing:"border-box",
        }}>

          {/* ── Size chips ── */}
          <div style={{display:"flex",flexDirection:"column",gap:5,paddingRight:16,marginRight:16,borderRight:`1px solid ${C.border}`}}>
            <span style={labelSt} id="size-label">Boyut</span>
            <div role="radiogroup" aria-labelledby="size-label" style={{display:"flex",gap:5}}>
              {SIZES.map(({label,px})=>{
                const active = selSizePx===px;
                return (
                  <button key={label}
                    role="radio" aria-checked={active}
                    className="sc-chip"
                    onClick={()=>setAllSizes(px)}
                    style={{
                      ...chipBtnSt(active),
                      minWidth:52, textAlign:"center",
                      position:"relative",
                    }}>
                    {label}
                    {active && (
                      <span style={{
                        position:"absolute",bottom:-7,left:"50%",transform:"translateX(-50%)",
                        width:4,height:4,borderRadius:"50%",background:C.primary,display:"block",
                      }}/>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Color swatches + custom ── */}
          <div style={{display:"flex",flexDirection:"column",gap:5,paddingRight:16,marginRight:16,borderRight:`1px solid ${C.border}`}}>
            <span style={labelSt} id="color-label">
              Renk
              <span style={{
                display:"inline-block",width:10,height:10,borderRadius:"50%",
                background:activeColor,marginLeft:5,verticalAlign:"middle",
                border:"1.5px solid rgba(0,0,0,0.15)",
              }}/>
            </span>
            <div role="radiogroup" aria-labelledby="color-label" style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
              {PRESET_COLORS.map(c=>{
                const active = activeColor===c;
                return (
                  <button key={c}
                    role="radio" aria-checked={active}
                    className="sc-swatch"
                    onClick={()=>setActiveColor(c)}
                    title={c}
                    aria-label={`Renk ${c}`}
                    style={{
                      width:26, height:26, borderRadius:"50%",
                      border: active ? `3px solid ${C.text}` : `2px solid hsl(var(--border))`,
                      background:c, cursor:"pointer", padding:0, flexShrink:0,
                      transition:"transform 0.1s, box-shadow 0.1s",
                      boxShadow: active ? `0 0 0 2px hsl(var(--card)), 0 0 0 4px ${c}` : "0 1px 3px hsl(var(--foreground) / 0.15)",
                    }}/>
                );
              })}
              {/* Custom color — show current color + picker on click */}
              <label
                title="Özel renk seç"
                aria-label="Özel renk seç"
                style={{
                  width:26,height:26,borderRadius:"50%",overflow:"hidden",
                  cursor:"pointer",flexShrink:0,position:"relative",display:"block",
                  border:`2px solid ${C.border}`,
                  background:`conic-gradient(from 0deg, #f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)`,
                  boxShadow:"0 1px 3px rgba(0,0,0,0.15)",
                }}>
                <input type="color" value={activeColor} onChange={e=>setActiveColor(e.target.value)}
                  style={{opacity:0,position:"absolute",inset:0,width:"100%",height:"100%",cursor:"pointer"}}/>
              </label>
            </div>
          </div>

          {/* ── Opacity ── */}
          <div style={{display:"flex",flexDirection:"column",gap:5,paddingRight:16,marginRight:16,borderRight:`1px solid ${C.border}`}}>
            <span style={labelSt}>
              Opaklık
              <b style={{
                color:C.primary, fontWeight:600, fontStyle:"normal",
                marginLeft:5, fontSize:11,
                background:C.chipActiveBg, padding:"1px 6px",
                borderRadius:8, border:`1px solid ${C.border}`,
              }}>{Math.round(brushOpacity*100)}%</b>
            </span>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <input type="range"
                className="sc-slider"
                min={10} max={100} step={5}
                value={Math.round(brushOpacity*100)}
                aria-label="Fırça opaklığı"
                aria-valuetext={`${Math.round(brushOpacity*100)}%`}
                onChange={e=>{const v=Number(e.target.value)/100;setBrushOpacity(v);brushOpacityRef.current=v;}}
                style={{
                  width:100, marginTop:2,
                  accentColor:C.primary,
                  background:`linear-gradient(to right, hsl(var(--primary)) ${Math.round(brushOpacity*100)}%, hsl(var(--muted)) ${Math.round(brushOpacity*100)}%)`,
                }}/>
            </div>
          </div>

          {/* ── Tekli: instance count ── */}
          {placementMode==="tekli" && tekliPhase==="placing" && (
            <div style={{display:"flex",flexDirection:"column",gap:5,paddingRight:16,marginRight:16,borderRight:`1px solid ${C.border}`}}>
              <span style={labelSt}>Adet</span>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {allMotifs.filter(m=>tekliActiveIds.has(m.id)).map(m=>{
                  const cnt = motifCounts[m.id]??1;
                  return (
                    <div key={m.id} style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontFamily:FF.sans,fontSize:10,color:C.muted}}>{m.name.slice(0,6)}</span>
                      <button onClick={()=>adjustCount(m.id,-1)} disabled={cnt<=1}
                        aria-label={`${m.name} azalt`}
                        className="sc-action"
                        style={{
                          width:24,height:24,borderRadius:6,border:`1px solid ${C.border}`,
                          background:C.chipBg,color:cnt<=1?C.muted:C.text,
                          cursor:cnt<=1?"not-allowed":"pointer",fontSize:15,padding:0,lineHeight:1,
                          fontFamily:FF.sans,
                        }}>−</button>
                      <span style={{
                        fontFamily:FF.sans,fontSize:13,fontWeight:600,color:C.text,
                        minWidth:18,textAlign:"center",
                        background:C.chipActiveBg,borderRadius:6,padding:"1px 4px",
                      }}>{cnt}</span>
                      <button onClick={()=>adjustCount(m.id,1)} disabled={cnt>=9}
                        aria-label={`${m.name} artır`}
                        className="sc-action"
                        style={{
                          width:24,height:24,borderRadius:6,border:`1px solid ${C.border}`,
                          background:C.chipBg,color:cnt>=9?C.muted:C.text,
                          cursor:cnt>=9?"not-allowed":"pointer",fontSize:15,padding:0,lineHeight:1,
                          fontFamily:FF.sans,
                        }}>+</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Photo surface shortcut ── */}
          <div style={{display:"flex",flexDirection:"column",gap:5,paddingRight:16,marginRight:16,borderRight:`1px solid ${C.border}`}}>
            <span style={labelSt}>Yüzey</span>
            <label
              className="sc-chip"
              title={surface==="foto" ? "Fotoğraf yüklü — kaldırmak için × tıkla" : "Yüzey fotoğrafı yükle"}
              style={{
                ...chipBtnSt(surface==="foto"),
                display:"flex",alignItems:"center",gap:5,cursor:"pointer",userSelect:"none",
              }}>
              <span style={{fontSize:15,lineHeight:1}}>📷</span>
              <span>{surface==="foto" ? "Aktif" : "Fotoğraf"}</span>
              <input type="file" accept="image/*" onChange={handleSurfaceUpload} style={{display:"none"}}/>
              {surface==="foto" && (
                <span
                  role="button" aria-label="Fotoğrafı kaldır"
                  onClick={e=>{e.preventDefault();e.stopPropagation();setSurface("beyaz");}}
                  style={{
                    width:16,height:16,borderRadius:"50%",background:"hsl(var(--destructive))",
                    color:"hsl(var(--destructive-foreground))",fontSize:10,fontWeight:"bold",cursor:"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    marginLeft:2,flexShrink:0,
                  }}>×</span>
              )}
            </label>
          </div>

          <div style={{flex:1,minWidth:8}}/>

          {/* ── Action buttons ── */}
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {isPlacing && (
              <button
                className="sc-action"
                onClick={confirmFn}
                aria-label="Stencil'i uygula ve boyama moduna geç"
                style={{
                  fontFamily:FF.sans,fontSize:13,fontWeight:600,
                  padding:"7px 22px",borderRadius:10,
                  border:"none",
                  background:C.primary,
                  color:C.primaryFg,cursor:"pointer",
                  boxShadow:"0 4px 14px -2px hsl(var(--primary) / 0.45)",
                  letterSpacing:"0.02em",
                }}>Uygula ✓</button>
            )}
            {isPaintingPhase && (
              <>
                <button
                  className="sc-action"
                  onClick={resetFn}
                  aria-label="Yeniden yerleştirme moduna dön"
                  style={{
                    fontFamily:FF.sans,fontSize:12,fontWeight:500,
                    padding:"6px 14px",borderRadius:8,
                    border:`1.5px solid ${C.border}`,background:C.card,color:C.muted,cursor:"pointer",
                  }}>↺ Yerleştir</button>
                <button
                  className="sc-action"
                  onClick={clearCanvas}
                  aria-label="Canvas'ı temizle"
                  style={{
                    fontFamily:FF.sans,fontSize:12,fontWeight:500,
                    padding:"6px 14px",borderRadius:8,
                    border:"1px solid hsl(var(--destructive) / 0.35)",background:"hsl(var(--destructive) / 0.08)",color:"hsl(var(--destructive))",cursor:"pointer",
                  }}>Temizle</button>
              </>
            )}
          </div>
        </div>

        <p style={{fontFamily:FF.sans,color:C.muted,fontSize:11,margin:"10px 0 20px",textAlign:"center"}}>
          {isPlacing
            ? (placementMode==="grid" ? "Motif sürükleyin → Uygula" : "Şablonları sürükleyin → Uygula")
            : "Fırça ile boyayın · Renk değişimi anlık uygulanır"}
        </p>
      </div>
    </div>
  );
}
