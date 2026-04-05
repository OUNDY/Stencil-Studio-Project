import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { motifs as ALL_MOTIFS } from "./motifs";

// ── Public API ────────────────────────────────────────────────────────────────
export type { CompositionId, SurfaceId, BlendMode, ControlState, CanvasLayoutMode };
export type { HeroPaintingCanvasProps };

export interface HeroPaintingCanvasProps {
  storagePrefix?:     string;
  embedded?:          boolean;
  className?:         string;
  style?:             React.CSSProperties;
  onFirstInteraction?: () => void;
}

// ── Canvas buffer dimensions (virtual; CSS handles display size) ──────────────
const W = 1440;
const H = 810;

// ── Bristle constants ─────────────────────────────────────────────────────────
const BRISTLES_PER_PX = 2.0;
const B_ALPHA_MIN     = 0.078;
const B_ALPHA_MAX     = 0.39;
const B_W_MIN         = 1.1;
const B_W_MAX         = 3.6;
const B_ELONGATION    = 9.5;
const B_DIR_JITTER    = 0.28;
const B_EDGE_FADE     = 0.34;
const STENCIL_THRESH  = 12;

// ── Types ─────────────────────────────────────────────────────────────────────
type SurfaceId      = "duvar" | "ahsap" | "beton" | "tugla" | "foto";
type CompositionId  = "geometrik" | "botanik" | "mimari";
type BlendMode      = "source-over" | "multiply" | "screen" | "overlay"
                    | "color-burn" | "color-dodge" | "darken" | "lighten";
type CanvasLayoutMode = "grid" | "tekli";
type TekliPhase       = "placing" | "painting";
type SizePresetId     = "mini" | "20cm" | "30cm" | "40cm" | "50cm";

interface ControlState {
  color:       string;
  color2:      string;
  opacity:     number;   // 0–100
  brushSize:   number;   // 10–120
  strokeWidth: number;   // 0.5–3.0
  rotation:    number;   // -45–45 degrees
  blendMode:   BlendMode;
  saturation:  number;   // 0–200
  contrast:    number;   // 50–200
  gridOffsetX: number;   // 0–100 (percent of tile)
  gridOffsetY: number;   // 0–100
}

// ── Size presets ──────────────────────────────────────────────────────────────
const SIZE_PRESETS: Record<SizePresetId, { label: string; gridPx: number; tekliPx: number }> = {
  "mini": { label: "Mini",  gridPx: 75,  tekliPx: 140 },
  "20cm": { label: "20cm",  gridPx: 110, tekliPx: 200 },
  "30cm": { label: "30cm",  gridPx: 150, tekliPx: 300 },
  "40cm": { label: "40cm",  gridPx: 200, tekliPx: 400 },
  "50cm": { label: "50cm",  gridPx: 260, tekliPx: 520 },
};

// ── Composition presets ───────────────────────────────────────────────────────
const COMPOSITIONS: Record<CompositionId, {
  label:        string;
  motifId:      string;
  surface:      SurfaceId;
  defaultColor: string;
  hint:         string;
}> = {
  geometrik: {
    label: "Geometrik", motifId: "geometrik", surface: "beton",
    defaultColor: "#2d4a7a", hint: "Modern geometrik şekiller — beton yüzey",
  },
  botanik: {
    label: "Botanik", motifId: "botanika", surface: "ahsap",
    defaultColor: "#7a9e7e", hint: "Botanik dal deseni — ahşap yüzey",
  },
  mimari: {
    label: "Mimari", motifId: "kapi", surface: "tugla",
    defaultColor: "#c8714e", hint: "Neo-klasik kemer — tuğla yüzey",
  },
};

// ── Color palette ─────────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  "#2d4a7a", // slate blue
  "#c8714e", // terracotta
  "#7a9e7e", // sage
  "#e8c56a", // ochre
  "#b5432a", // rust
  "#3d3530", // charcoal
  "#d4847a", // dusty rose
  "#e8dcc8", // warm stone
] as const;

// ── Defaults ──────────────────────────────────────────────────────────────────
const DEFAULTS: ControlState = {
  color: "#2d4a7a", color2: "#c8714e",
  opacity: 85, brushSize: 48, strokeWidth: 1.0,
  rotation: 0, blendMode: "source-over",
  saturation: 100, contrast: 100,
  gridOffsetX: 0, gridOffsetY: 0,
};

// ── localStorage helpers ──────────────────────────────────────────────────────
function loadCtrl(p: string): ControlState {
  try { const r = localStorage.getItem(`${p}-ctrl`); return r ? { ...DEFAULTS, ...JSON.parse(r) } : DEFAULTS; }
  catch { return DEFAULTS; }
}
function loadComp(p: string): CompositionId {
  try { const v = localStorage.getItem(`${p}-comp`); return (v === "geometrik" || v === "botanik" || v === "mimari") ? v : "geometrik"; }
  catch { return "geometrik"; }
}
function loadSurf(p: string): SurfaceId {
  try { const v = localStorage.getItem(`${p}-surf`); return (v === "duvar" || v === "ahsap" || v === "beton" || v === "tugla") ? v : "beton"; }
  catch { return "beton"; }
}
function loadMode(p: string): "simple" | "advanced" {
  try { return localStorage.getItem(`${p}-mode`) === "advanced" ? "advanced" : "simple"; }
  catch { return "simple"; }
}
function loadLayoutMode(p: string): CanvasLayoutMode {
  try { return localStorage.getItem(`${p}-layout`) === "tekli" ? "tekli" : "grid"; }
  catch { return "grid"; }
}
function loadSizePreset(p: string): SizePresetId {
  try {
    const v = localStorage.getItem(`${p}-size`);
    return (v === "mini" || v === "20cm" || v === "30cm" || v === "40cm" || v === "50cm") ? v : "30cm";
  } catch { return "30cm"; }
}

// ══════════════════════════════════════════════════════════════════════════════
// Noise utilities
// ══════════════════════════════════════════════════════════════════════════════
function smoothstep(t: number) { return t * t * (3 - 2 * t); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function ihash(ix: number, iy: number): number {
  let h = Math.imul(ix ^ Math.imul(iy, 2654435761), 2246822519)
        ^ Math.imul(iy ^ Math.imul(ix, 2654435761), 3266489917);
  h ^= h >>> 17; h = Math.imul(h, 0xbf324c81 | 0); h ^= h >>> 11;
  return (h >>> 0) / 0x100000000;
}
function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = smoothstep(x - ix), fy = smoothstep(y - iy);
  return lerp(lerp(ihash(ix,iy), ihash(ix+1,iy), fx), lerp(ihash(ix,iy+1), ihash(ix+1,iy+1), fx), fy);
}
function fbm(x: number, y: number, oct: number): number {
  let v = 0, a = 0.5, f = 1, mx = 0;
  for (let i = 0; i < oct; i++) { v += a * valueNoise(x*f, y*f); mx += a; a *= 0.5; f *= 2.1; }
  return v / mx;
}

// ══════════════════════════════════════════════════════════════════════════════
// Surface renderers (photorealistic procedural)
// ══════════════════════════════════════════════════════════════════════════════
function renderWall(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const id = ctx.createImageData(W, H); const d = id.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const nx=x/380, ny=y/380;
    const macro=fbm(nx*0.85,ny*0.85,4);
    const wx=(fbm(nx*2.2+3.4,ny*2.2+1.1,2)-0.5)*0.55, wy=(fbm(nx*2.2+1.9,ny*2.2+4.6,2)-0.5)*0.55;
    const bumps=fbm(nx*4.8+wx,ny*4.8+wy,3);
    const grain=fbm(nx*22+macro*1.4+7.4,ny*11+macro*0.3+2.2,3);
    const grit=fbm(nx*68+11.3,ny*68+6.9,3);
    const micro=fbm(nx*140+4.7,ny*140+9.1,2);
    const temp=fbm(nx*0.52+2.5,ny*0.52+1.8,3);
    const val=macro*0.28+bumps*0.24+grain*0.22+grit*0.16+micro*0.10;
    const lum=172+val*78, groove=Math.max(0,0.5-macro)*2;
    const ws=(temp-0.5)*28, bump=(macro-0.5)*14-groove*12;
    const i=(y*W+x)*4;
    d[i]  =Math.min(255,Math.max(140,lum+bump+ws*0.82+3));
    d[i+1]=Math.min(255,Math.max(134,lum+bump+ws*0.26-1));
    d[i+2]=Math.min(255,Math.max(118,lum+bump-ws*0.52-8));
    d[i+3]=255;
  }
  ctx.putImageData(id,0,0);
  const tl=ctx.createLinearGradient(0,0,0,H);
  tl.addColorStop(0,"rgba(255,252,244,0.10)"); tl.addColorStop(0.45,"rgba(0,0,0,0)"); tl.addColorStop(1,"rgba(18,10,2,0.13)");
  ctx.fillStyle=tl; ctx.fillRect(0,0,W,H);
  const vig=ctx.createRadialGradient(W*0.5,H*0.46,H*0.21,W*0.5,H*0.5,H*0.91);
  vig.addColorStop(0,"rgba(0,0,0,0)"); vig.addColorStop(0.65,"rgba(0,0,0,0)"); vig.addColorStop(1,"rgba(28,16,4,0.28)");
  ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
}

function renderWood(canvas: HTMLCanvasElement) {
  const ctx=canvas.getContext("2d")!;
  const knots=[{x:W*0.22,y:H*0.42,r:52},{x:W*0.74,y:H*0.58,r:42},{x:W*0.48,y:H*0.17,r:30}];
  const id=ctx.createImageData(W,H); const d=id.data;
  for (let y=0;y<H;y++) for (let x=0;x<W;x++) {
    const nx=x/350,ny=y/350;
    const warpX=(fbm(nx*0.8+0.4,ny*0.8+0.2,3)-0.5), warpY=(fbm(nx*0.8+2.9,ny*0.8+1.9,3)-0.5);
    let sx=x+warpX*62,sy=y+warpY*26;
    for (const k of knots) {
      const kdx=x-k.x,kdy=y-k.y,dist=Math.hypot(kdx,kdy),reach=k.r*3.6;
      if (dist<reach) { const inf=Math.pow(Math.max(0,1-dist/reach),1.8),ang=Math.atan2(kdy,kdx); sx+=Math.cos(ang+Math.PI*0.5)*inf*k.r*1.15; sy+=Math.sin(ang+Math.PI*0.5)*inf*k.r*0.52; }
    }
    const ringRaw=(Math.sin((sy/24.0)*Math.PI*2)+1)*0.5;
    const ring1=smoothstep(smoothstep(smoothstep(ringRaw)));
    const ringVar=fbm(sx/310+0.6,sy/310+3.3,2);
    const ringFinal=Math.pow(ring1,0.55+ringVar*0.8);
    const fiber=fbm(sx/140+13.6,sy/22+7.3,4), crossFiber=fbm(sx/18+5.2,sy/140+3.0,2), sand=fbm(sx/6+2.1,sy/220+4.7,2);
    let knotInf=0,nearestKnotDist=Infinity;
    for (const k of knots) { const kd=Math.hypot(x-k.x,y-k.y); if (kd<nearestKnotDist) nearestKnotDist=kd; knotInf=Math.max(knotInf,Math.pow(Math.max(0,1-kd/(k.r*1.7)),2.3)); }
    const knotHalo=nearestKnotDist<110?Math.pow(Math.max(0,(Math.sin(nearestKnotDist/5.2*Math.PI*2)+1)*0.5),2)*Math.pow(Math.max(0,1-nearestKnotDist/110),1.6)*0.44:0;
    const n=Math.max(0,Math.min(1,ringFinal*0.54+fiber*0.26+crossFiber*0.08+sand*0.06-knotInf*0.46-knotHalo));
    const cols=[[28,10,2],[105,46,10],[188,112,32],[228,180,82],[248,218,145]];
    const seg=n*4,si=Math.min(3,Math.floor(seg)),t2=seg-si;
    const r=lerp(cols[si][0],cols[si+1][0],t2),g=lerp(cols[si][1],cols[si+1][1],t2),b=lerp(cols[si][2],cols[si+1][2],t2);
    const i=(y*W+x)*4; d[i]=Math.min(255,Math.round(r)); d[i+1]=Math.min(255,Math.round(g)); d[i+2]=Math.min(255,Math.round(b)); d[i+3]=255;
  }
  ctx.putImageData(id,0,0);
  const sheen=ctx.createLinearGradient(0,0,W,0);
  sheen.addColorStop(0,"rgba(120,65,10,0.09)"); sheen.addColorStop(0.40,"rgba(255,200,90,0.14)"); sheen.addColorStop(0.60,"rgba(255,200,90,0.14)"); sheen.addColorStop(1,"rgba(120,65,10,0.09)");
  ctx.fillStyle=sheen; ctx.fillRect(0,0,W,H);
}

function renderConcrete(canvas: HTMLCanvasElement) {
  const ctx=canvas.getContext("2d")!;
  const id=ctx.createImageData(W,H); const d=id.data;
  for (let y=0;y<H;y++) for (let x=0;x<W;x++) {
    const nx=x/280,ny=y/280;
    const macro=fbm(nx*0.72,ny*0.72,4);
    const awx=(fbm(nx*2.5+1.2,ny*2.5+0.7,2)-0.5)*0.48, awy=(fbm(nx*2.5+3.8,ny*2.5+2.4,2)-0.5)*0.48;
    const agg=fbm(nx*4.4+awx,ny*4.4+awy,3), laitance=fbm(nx*9.5+5.9,ny*9.5+3.3,3);
    const med=fbm(nx*22+7.1,ny*22+2.8,3), micro=fbm(nx*55+9.6,ny*55+5.0,2);
    const poreSmall=fbm(nx*38+2.4,ny*38+8.1,2), pore=poreSmall<0.26?Math.pow((0.26-poreSmall)/0.26,2.2):0;
    const poreBig=fbm(nx*14+6.3,ny*14+1.5,2), bigPore=poreBig<0.22?Math.pow((0.22-poreBig)/0.22,2.8)*0.65:0;
    const bandShift=(fbm(nx*2.8+0.6,ny*0.22+1.2,2)-0.5)*16;
    const formBand=Math.pow(Math.max(0,Math.sin(((y+bandShift)/72)*Math.PI*2)*0.5+0.5),6)*0.12;
    const mineral=fbm(nx*0.88+4.3,ny*0.88+2.2,4), efflN=fbm(nx*5.8+8.4,ny*5.8+3.8,2);
    const efflor=efflN>0.74?Math.pow((efflN-0.74)/0.26,1.5)*0.50:0;
    const val=macro*0.30+agg*0.28+laitance*0.18+med*0.14+micro*0.10+formBand;
    const base=118+val*74, warmShift=(mineral-0.5)*32, poreDeep=(pore+bigPore)*72, eff=efflor*95;
    const i=(y*W+x)*4;
    d[i]  =Math.min(255,Math.max(30,base-poreDeep+warmShift*0.54+eff+2));
    d[i+1]=Math.min(255,Math.max(28,base-poreDeep+warmShift*0.18+eff));
    d[i+2]=Math.min(255,Math.max(26,base-poreDeep-warmShift*0.38+eff+14));
    d[i+3]=255;
  }
  ctx.putImageData(id,0,0);
  const tl=ctx.createLinearGradient(0,0,0,H);
  tl.addColorStop(0,"rgba(210,218,235,0.09)"); tl.addColorStop(0.38,"rgba(0,0,0,0)"); tl.addColorStop(1,"rgba(0,0,0,0.09)");
  ctx.fillStyle=tl; ctx.fillRect(0,0,W,H);
  const vig=ctx.createRadialGradient(W*0.5,H*0.44,H*0.19,W*0.5,H*0.5,H*0.91);
  vig.addColorStop(0,"rgba(0,0,0,0)"); vig.addColorStop(0.58,"rgba(0,0,0,0)"); vig.addColorStop(1,"rgba(0,0,0,0.34)");
  ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
}

function renderBrick(canvas: HTMLCanvasElement) {
  const ctx=canvas.getContext("2d")!;
  const bw=140,bh=46,gap=6;
  const id=ctx.createImageData(W,H); const d=id.data;
  for (let i=0;i<d.length;i+=4) {
    const n=fbm((i/4%W)/60,Math.floor(i/4/W)/60,3), v=Math.round(162+n*28);
    d[i]=v-6; d[i+1]=v-10; d[i+2]=v-14; d[i+3]=255;
  }
  ctx.putImageData(id,0,0);
  const rows=Math.ceil(H/(bh+gap))+1;
  for (let row=0;row<rows;row++) {
    const offset=(row%2)*((bw+gap)/2), y0=row*(bh+gap), cols2=Math.ceil((W+bw+gap)/(bw+gap))+1;
    for (let col=0;col<cols2;col++) {
      const x0=col*(bw+gap)-offset-bw;
      const nx=(x0+col*7.3)/80, ny=(y0+row*4.1)/80;
      const hue=fbm(nx,ny,2), sat=fbm(nx+3.4,ny+1.2,2), lum=fbm(nx*3.1+1.8,ny*3.1+0.7,3);
      const r=Math.round(180+hue*40-lum*30), g=Math.round(80+hue*18-lum*20+sat*8), b=Math.round(50+hue*10-lum*16);
      const gr=ctx.createLinearGradient(x0,y0,x0,y0+bh);
      gr.addColorStop(0,`rgba(${Math.min(255,r+22)},${Math.min(255,g+14)},${Math.min(255,b+10)},1)`);
      gr.addColorStop(0.35,`rgba(${r},${g},${b},1)`);
      gr.addColorStop(1,`rgba(${Math.max(0,r-28)},${Math.max(0,g-18)},${Math.max(0,b-14)},1)`);
      ctx.fillStyle=gr; ctx.fillRect(x0+1,y0+1,bw-2,bh-2);
      ctx.fillStyle="rgba(255,255,255,0.12)"; ctx.fillRect(x0+1,y0+1,bw-2,2);
      const n2=fbm(nx*8,ny*8,2); ctx.fillStyle=`rgba(0,0,0,${n2*0.15})`; ctx.fillRect(x0+1,y0+1,bw-2,bh-2);
    }
  }
  const vig=ctx.createRadialGradient(W*0.5,H*0.47,H*0.18,W*0.5,H*0.5,H*0.88);
  vig.addColorStop(0,"rgba(0,0,0,0)"); vig.addColorStop(0.6,"rgba(0,0,0,0)"); vig.addColorStop(1,"rgba(0,0,0,0.36)");
  ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
}

// ── Photo surface URLs (Pexels) ───────────────────────────────────────────────
const TEXTURE_URLS: Partial<Record<Exclude<SurfaceId,"foto">, string>> = {
  beton: "https://images.pexels.com/photos/7031603/pexels-photo-7031603.jpeg?auto=compress&cs=tinysrgb&w=1440",
  ahsap: "https://images.pexels.com/photos/5825380/pexels-photo-5825380.jpeg?auto=compress&cs=tinysrgb&w=1440",
  duvar: "https://images.pexels.com/photos/7209222/pexels-photo-7209222.jpeg?auto=compress&cs=tinysrgb&w=1440",
  tugla: "https://images.pexels.com/photos/6447392/pexels-photo-6447392.jpeg?auto=compress&cs=tinysrgb&w=1440",
};

type ProceduralSurfaceId = Exclude<SurfaceId, "foto">;

function buildProceduralSurface(canvas: HTMLCanvasElement, s: ProceduralSurfaceId) {
  if (s === "duvar") renderWall(canvas);
  else if (s === "ahsap") renderWood(canvas);
  else if (s === "tugla") renderBrick(canvas);
  else renderConcrete(canvas);
}

function loadPhotoSurface(s: ProceduralSurfaceId): Promise<HTMLCanvasElement> {
  return new Promise(resolve => {
    const c=document.createElement("canvas"); c.width=W; c.height=H;
    const url=TEXTURE_URLS[s];
    if (!url) { buildProceduralSurface(c,s); resolve(c); return; }
    const img=new Image(); img.crossOrigin="anonymous";
    img.onload=()=>{
      const ctx=c.getContext("2d")!;
      const scale=Math.max(W/img.width,H/img.height);
      const sw=img.width*scale,sh=img.height*scale;
      ctx.drawImage(img,(W-sw)/2,(H-sh)/2,sw,sh);
      const vig=ctx.createRadialGradient(W*0.5,H*0.5,H*0.15,W*0.5,H*0.5,H*0.92);
      vig.addColorStop(0,"rgba(0,0,0,0)"); vig.addColorStop(0.62,"rgba(0,0,0,0)"); vig.addColorStop(1,"rgba(0,0,0,0.42)");
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H); resolve(c);
    };
    img.onerror=()=>{ buildProceduralSurface(c,s); resolve(c); };
    img.src=url;
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// Stencil building
// ══════════════════════════════════════════════════════════════════════════════
function normalizeSvg(raw: string): string {
  let s=raw.trim();
  if (!s.includes("xmlns=")) s=s.replace("<svg",`<svg xmlns="http://www.w3.org/2000/svg"`);
  return s.replace(/\s+width="[^"]*"/g,"").replace(/\s+height="[^"]*"/g,"");
}

function renderMotifToMask(motifSvg: string, size: number): Promise<HTMLCanvasElement> {
  const canvas=document.createElement("canvas"); canvas.width=canvas.height=size;
  const ctx=canvas.getContext("2d")!;
  const pad=Math.round(size*0.05), renderSize=size-pad*2;
  return new Promise(resolve=>{
    const img=new Image();
    let src=normalizeSvg(motifSvg).replace(/currentColor/g,"white");
    src=src.replace(/<svg(\s[^>]*)?>/, (_: string, attrs="")=>{
      const a=attrs.replace(/\s*(width|height)\s*=\s*["'][^"']*["']/gi,"");
      return `<svg${a} width="${renderSize}" height="${renderSize}">`;
    });
    const blob=new Blob([src],{type:"image/svg+xml"}), url=URL.createObjectURL(blob);
    img.onload=()=>{
      ctx.drawImage(img,pad,pad,renderSize,renderSize); URL.revokeObjectURL(url);
      const id=ctx.getImageData(0,0,size,size); const d=id.data;
      for (let i=0;i<d.length;i+=4) { const a=d[i+3]; d[i]=255;d[i+1]=255;d[i+2]=255; d[i+3]=a>STENCIL_THRESH?255:0; }
      ctx.putImageData(id,0,0); resolve(canvas);
    };
    img.onerror=()=>{ URL.revokeObjectURL(url); resolve(canvas); };
    img.src=url;
  });
}

// Grid stencil: tile motif across full W×H with optional offset
async function buildGridStencil(
  motifSvg: string, tileSize: number,
  offsetX=0, offsetY=0, // 0–1 normalized fractions
): Promise<HTMLCanvasElement> {
  const maskTile=await renderMotifToMask(motifSvg,tileSize);
  const full=document.createElement("canvas"); full.width=W; full.height=H;
  const ctx=full.getContext("2d")!;
  const ox=Math.round(offsetX*tileSize), oy=Math.round(offsetY*tileSize);
  const startX=-tileSize+((ox%tileSize)+tileSize)%tileSize;
  const startY=-tileSize+((oy%tileSize)+tileSize)%tileSize;
  for (let y=startY;y<H+tileSize;y+=tileSize)
    for (let x=startX;x<W+tileSize;x+=tileSize)
      ctx.drawImage(maskTile,x,y);
  return full;
}

// Single (Tekli) stencil: one motif centered at (cx, cy)
async function buildTekliStencil(
  motifSvg: string, size: number, cx: number, cy: number,
): Promise<HTMLCanvasElement> {
  const tile=await renderMotifToMask(motifSvg,size);
  const full=document.createElement("canvas"); full.width=W; full.height=H;
  full.getContext("2d")!.drawImage(tile,Math.round(cx-size/2),Math.round(cy-size/2));
  return full;
}

// Ghost outline (golden border around stencil shape)
function buildGhostOutline(stencil: HTMLCanvasElement): HTMLCanvasElement {
  const out=document.createElement("canvas"); out.width=W; out.height=H;
  const ctx=out.getContext("2d")!;
  for (const [dx,dy] of [[-2,0],[2,0],[0,-2],[0,2],[-1,-2],[1,-2],[-1,2],[1,2]])
    ctx.drawImage(stencil,dx,dy);
  ctx.globalCompositeOperation="destination-out"; ctx.drawImage(stencil,0,0);
  ctx.globalCompositeOperation="source-in"; ctx.fillStyle="rgba(210,160,55,0.9)"; ctx.fillRect(0,0,W,H);
  return out;
}

// ══════════════════════════════════════════════════════════════════════════════
// Bristle stamp (acrylic-through-stencil)
// ══════════════════════════════════════════════════════════════════════════════
let _scratch: HTMLCanvasElement | null=null;

function stampBristles(
  paintCtx: CanvasRenderingContext2D, stencil: HTMLCanvasElement,
  x: number, y: number, radius: number, strokeAngle: number|null,
  color: string, opacityScale: number, strokeWidthScale: number,
) {
  const pad=Math.ceil(radius*1.22)+4, size=pad*2;
  if (!_scratch) _scratch=document.createElement("canvas");
  _scratch.width=size; _scratch.height=size;
  const sctx=_scratch.getContext("2d")!; sctx.fillStyle=color;
  const count=Math.max(12,Math.floor(radius*BRISTLES_PER_PX));
  for (let i=0;i<count;i++) {
    const a=Math.random()*Math.PI*2, isStray=Math.random()<0.15;
    const maxR=isStray?radius*(1.05+Math.random()*0.14):radius;
    const r=Math.sqrt(Math.random())*maxR, bx=pad+Math.cos(a)*r, by=pad+Math.sin(a)*r;
    const t=r/radius, ef=isStray?0.08+Math.random()*0.10:t<(1-B_EDGE_FADE)?1.0:(1-t)/B_EDGE_FADE;
    const rawRnd=Math.pow(Math.random(),1.6);
    const alpha=ef*(B_ALPHA_MIN+rawRnd*(B_ALPHA_MAX-B_ALPHA_MIN))*opacityScale;
    if (alpha<=0.01) continue;
    const bw=(B_W_MIN+Math.pow(Math.random(),1.2)*(B_W_MAX-B_W_MIN))*strokeWidthScale;
    const ang=strokeAngle!==null?strokeAngle+(Math.random()-0.5)*B_DIR_JITTER*2:a;
    const elong=strokeAngle!==null?3.5+Math.random()*B_ELONGATION:1.5+Math.random()*B_ELONGATION*0.4;
    const isSplit=!isStray&&Math.random()<0.28;
    if (isSplit) {
      const splay=0.12+Math.random()*0.10, tineW=bw*0.42, tineElong=elong*0.72, perp=ang+Math.PI/2, offset2=bw*0.38;
      for (const side of [-1,1] as const) {
        const ox2=Math.cos(perp)*offset2*side, oy2=Math.sin(perp)*offset2*side;
        sctx.globalAlpha=alpha*(0.72+Math.random()*0.28); sctx.beginPath(); sctx.save();
        sctx.translate(bx+ox2,by+oy2); sctx.rotate(ang+splay*side);
        sctx.ellipse(0,0,(tineW*tineElong)/2,tineW/2,0,0,Math.PI*2); sctx.restore(); sctx.fill();
      }
    } else {
      sctx.globalAlpha=alpha; sctx.beginPath(); sctx.save(); sctx.translate(bx,by); sctx.rotate(ang);
      sctx.ellipse(0,0,(bw*elong)/2,bw/2,0,0,Math.PI*2); sctx.restore(); sctx.fill();
    }
  }
  sctx.globalAlpha=1; sctx.globalCompositeOperation="destination-in"; sctx.drawImage(stencil,-(x-pad),-(y-pad));
  paintCtx.globalCompositeOperation="source-over"; paintCtx.drawImage(_scratch,x-pad,y-pad);
}

// ── Responsive hook ───────────────────────────────────────────────────────────
function useWindowWidth(): number {
  const [w,setW]=useState(()=>typeof window!=="undefined"?window.innerWidth:1200);
  useEffect(()=>{
    const h=()=>setW(window.innerWidth);
    window.addEventListener("resize",h,{passive:true});
    return ()=>window.removeEventListener("resize",h);
  },[]);
  return w;
}

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════
export function HeroPaintingCanvas({
  storagePrefix="hero", embedded=false, className, style, onFirstInteraction,
}: HeroPaintingCanvasProps={}) {
  const pfx=useMemo(()=>storagePrefix,[]); // eslint-disable-line react-hooks/exhaustive-deps
  const windowWidth=useWindowWidth();
  const isMobile=windowWidth<640;

  // DOM
  const canvasRef=useRef<HTMLCanvasElement>(null);

  // Off-screen canvases
  const surfaceRef    =useRef<HTMLCanvasElement|null>(null);
  const stencilRef    =useRef<HTMLCanvasElement|null>(null);
  const outlineRef    =useRef<HTMLCanvasElement|null>(null);
  const paintRef      =useRef<HTMLCanvasElement|null>(null);
  // Ghost canvas for tekli placing phase (tile at cursor, low alpha)
  const tekliGhostRef =useRef<HTMLCanvasElement|null>(null);

  // Interaction
  const isMouseDownRef   =useRef(false);
  const lastPosRef       =useRef({x:W/2,y:H/2});
  const hasInteractedRef =useRef(false);
  const cursorCanvasRef  =useRef({x:W/2,y:H/2}); // current cursor in canvas coords

  // Animation
  const rafRef         =useRef<number>(0);
  const autoRafRef     =useRef<number>(0);
  const autoStartRef   =useRef(Date.now());
  const autoLastPosRef =useRef({x:W/2,y:H/2});

  // Save debounce
  const savePaintDebRef=useRef<ReturnType<typeof setTimeout>|null>(null);

  // ── State ─────────────────────────────────────────────────────────────────
  const [composition,    setCompositionState]  =useState<CompositionId>(()=>loadComp(pfx));
  const [surface,        setSurfaceState]       =useState<SurfaceId>(()=>loadSurf(pfx));
  const [controls,       setControlsState]      =useState<ControlState>(()=>loadCtrl(pfx));
  const [panelMode,      setPanelModeState]     =useState<"simple"|"advanced">(()=>loadMode(pfx));
  const [layoutMode,     setLayoutModeState]    =useState<CanvasLayoutMode>(()=>loadLayoutMode(pfx));
  const [sizePreset,     setSizePresetState]    =useState<SizePresetId>(()=>loadSizePreset(pfx));
  const [tekliPhase,     setTekliPhase]         =useState<TekliPhase>("placing");
  const [tekliPos,       setTekliPos]           =useState({x:W/2,y:H/2});
  const [photoDataUrl,   setPhotoDataUrl]       =useState<string|null>(null);
  const [stencilReady,   setStencilReady]       =useState(false);
  const [hintVisible,    setHintVisible]        =useState(true);

  // Mirror refs for RAF callbacks
  const compositionRef =useRef(composition);
  const controlsRef    =useRef(controls);
  const layoutModeRef  =useRef(layoutMode);
  const sizePresetRef  =useRef(sizePreset);
  const tekliPhaseRef  =useRef(tekliPhase);
  const tekliPosRef    =useRef(tekliPos);
  const photoRef       =useRef(photoDataUrl);
  const surfaceRf      =useRef(surface);
  compositionRef.current =composition;
  controlsRef.current    =controls;
  layoutModeRef.current  =layoutMode;
  sizePresetRef.current  =sizePreset;
  tekliPhaseRef.current  =tekliPhase;
  tekliPosRef.current    =tekliPos;
  photoRef.current       =photoDataUrl;
  surfaceRf.current      =surface;

  // ── Setters with persistence ──────────────────────────────────────────────
  const setComposition=useCallback((id: CompositionId)=>{
    const comp=COMPOSITIONS[id];
    setCompositionState(id); compositionRef.current=id; localStorage.setItem(`${pfx}-comp`,id);
    if (surfaceRf.current!=="foto") { setSurfaceState(comp.surface); surfaceRf.current=comp.surface; localStorage.setItem(`${pfx}-surf`,comp.surface); }
    setControlsState(prev=>{ const next={...prev,color:comp.defaultColor}; controlsRef.current=next; localStorage.setItem(`${pfx}-ctrl`,JSON.stringify(next)); return next; });
    hasInteractedRef.current=false; autoStartRef.current=Date.now(); setHintVisible(true);
  },[pfx]);

  const updateControl=useCallback(<K extends keyof ControlState>(key: K, val: ControlState[K])=>{
    setControlsState(prev=>{ const next={...prev,[key]:val}; controlsRef.current=next; localStorage.setItem(`${pfx}-ctrl`,JSON.stringify(next)); return next; });
    hasInteractedRef.current=true; setHintVisible(false);
  },[pfx]);

  const setPanelMode=useCallback((m: "simple"|"advanced")=>{ setPanelModeState(m); localStorage.setItem(`${pfx}-mode`,m); },[pfx]);

  const setSurface=useCallback((s: SurfaceId)=>{ setSurfaceState(s); surfaceRf.current=s; localStorage.setItem(`${pfx}-surf`,s); },[pfx]);

  const setLayoutMode=useCallback((m: CanvasLayoutMode)=>{
    setLayoutModeState(m); layoutModeRef.current=m; localStorage.setItem(`${pfx}-layout`,m);
    if (m==="tekli") { setTekliPhase("placing"); tekliPhaseRef.current="placing"; }
    // Rebuild stencil for new mode
    setStencilReady(false);
  },[pfx]);

  const setSizePreset=useCallback((s: SizePresetId)=>{
    setSizePresetState(s); sizePresetRef.current=s; localStorage.setItem(`${pfx}-size`,s);
    setStencilReady(false); // triggers stencil rebuild
  },[pfx]);

  // ── Schedule save paint ───────────────────────────────────────────────────
  const scheduleSave=useCallback(()=>{
    if (savePaintDebRef.current!==null) clearTimeout(savePaintDebRef.current);
    savePaintDebRef.current=setTimeout(()=>{
      savePaintDebRef.current=null;
      const pc=paintRef.current; if (!pc) return;
      try { localStorage.setItem(`${pfx}-paint-${compositionRef.current}`,pc.toDataURL("image/webp",0.85)); }
      catch { try { localStorage.setItem(`${pfx}-paint-${compositionRef.current}`,pc.toDataURL("image/png")); } catch { /* quota */ } }
    },900);
  },[pfx]);

  // ── Build surface on change ───────────────────────────────────────────────
  useEffect(()=>{
    let cancelled=false;
    if (surface==="foto") {
      const url=photoRef.current; if (!url) return;
      const img=new Image();
      img.onload=()=>{
        if (cancelled) return;
        const c=document.createElement("canvas"); c.width=W; c.height=H;
        const ctx=c.getContext("2d")!;
        const scale=Math.max(W/img.width,H/img.height), sw=img.width*scale, sh=img.height*scale;
        ctx.drawImage(img,(W-sw)/2,(H-sh)/2,sw,sh); surfaceRef.current=c;
      };
      img.src=url;
    } else {
      loadPhotoSurface(surface).then(c=>{ if (!cancelled) surfaceRef.current=c; });
    }
    return ()=>{ cancelled=true; };
  },[surface,photoDataUrl]);

  // ── Build stencil on composition/layout/size change ───────────────────────
  useEffect(()=>{
    setStencilReady(false);
    const comp=COMPOSITIONS[composition];
    const motif=ALL_MOTIFS.find(m=>m.id===comp.motifId); if (!motif) return;
    const preset=SIZE_PRESETS[sizePreset];
    let cancelled=false;

    const build=async()=>{
      let stencil: HTMLCanvasElement;
      if (layoutMode==="grid") {
        const c=controlsRef.current;
        stencil=await buildGridStencil(motif.svg,preset.gridPx,c.gridOffsetX/100,c.gridOffsetY/100);
      } else {
        // Tekli mode: build at current tekliPos
        const pos=tekliPosRef.current;
        stencil=await buildTekliStencil(motif.svg,preset.tekliPx,pos.x,pos.y);
        // Also build ghost tile for placing phase
        const ghostTile=await renderMotifToMask(motif.svg,preset.tekliPx);
        tekliGhostRef.current=ghostTile;
      }
      if (cancelled) return;
      stencilRef.current=stencil;
      outlineRef.current=buildGhostOutline(stencil);
      if (!paintRef.current) {
        const pc=document.createElement("canvas"); pc.width=W; pc.height=H; paintRef.current=pc;
      } else {
        paintRef.current.getContext("2d")!.clearRect(0,0,W,H);
      }
      autoStartRef.current=Date.now();
      setStencilReady(true);
    };

    build();
    return ()=>{ cancelled=true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[composition,layoutMode,sizePreset]);

  // Rebuild grid stencil when offset changes (grid mode only)
  const rebuildGridStencil=useCallback(async()=>{
    if (layoutModeRef.current!=="grid") return;
    const comp=COMPOSITIONS[compositionRef.current];
    const motif=ALL_MOTIFS.find(m=>m.id===comp.motifId); if (!motif) return;
    const preset=SIZE_PRESETS[sizePresetRef.current];
    const c=controlsRef.current;
    const stencil=await buildGridStencil(motif.svg,preset.gridPx,c.gridOffsetX/100,c.gridOffsetY/100);
    stencilRef.current=stencil;
    outlineRef.current=buildGhostOutline(stencil);
  },[]);

  // ── Initialize paint canvas once ─────────────────────────────────────────
  useEffect(()=>{
    const pc=document.createElement("canvas"); pc.width=W; pc.height=H; paintRef.current=pc;
  },[]);

  // ── Restore saved paint when stencil becomes ready ────────────────────────
  useEffect(()=>{
    if (!stencilReady) return;
    const key=`${pfx}-paint-${compositionRef.current}`;
    const saved=localStorage.getItem(key); if (!saved) return;
    const img=new Image();
    img.onload=()=>{
      const pc=paintRef.current; if (!pc) return;
      pc.getContext("2d")!.drawImage(img,0,0);
      hasInteractedRef.current=true; cancelAnimationFrame(autoRafRef.current); setHintVisible(false);
    };
    img.onerror=()=>localStorage.removeItem(key);
    img.src=saved;
  },[stencilReady,pfx]);

  // ── Composite redraw ──────────────────────────────────────────────────────
  const redraw=useCallback(()=>{
    const canvas=canvasRef.current; if (!canvas) return;
    const ctx=canvas.getContext("2d")!;
    const c=controlsRef.current;
    ctx.clearRect(0,0,W,H);

    // Layer 1: surface
    if (surfaceRef.current) ctx.drawImage(surfaceRef.current,0,0);
    else { ctx.fillStyle="#e8e0d0"; ctx.fillRect(0,0,W,H); }

    // Layer 2: paint (with blend mode + filters + rotation)
    if (paintRef.current) {
      ctx.save();
      ctx.globalCompositeOperation=c.blendMode as GlobalCompositeOperation;
      if (c.saturation!==100||c.contrast!==100) ctx.filter=`saturate(${c.saturation}%) contrast(${c.contrast}%)`;
      if (c.rotation!==0) { ctx.translate(W/2,H/2); ctx.rotate((c.rotation*Math.PI)/180); ctx.translate(-W/2,-H/2); }
      ctx.drawImage(paintRef.current,0,0); ctx.filter="none"; ctx.restore();
    }

    // Layer 3: ghost outline (fades once user starts painting)
    if (outlineRef.current&&!hasInteractedRef.current) {
      ctx.save(); ctx.globalAlpha=0.45; ctx.drawImage(outlineRef.current,0,0); ctx.restore();
    }

    // Layer 4: Tekli placing ghost (follows cursor)
    if (layoutModeRef.current==="tekli"&&tekliPhaseRef.current==="placing"&&tekliGhostRef.current) {
      const ghost=tekliGhostRef.current, preset=SIZE_PRESETS[sizePresetRef.current];
      const {x,y}=cursorCanvasRef.current;
      ctx.save(); ctx.globalAlpha=0.35;
      ctx.drawImage(ghost,x-preset.tekliPx/2,y-preset.tekliPx/2,preset.tekliPx,preset.tekliPx);
      // Golden border around ghost
      ctx.globalAlpha=0.6; ctx.strokeStyle="#e8c56a"; ctx.lineWidth=2; ctx.setLineDash([6,4]);
      ctx.strokeRect(x-preset.tekliPx/2,y-preset.tekliPx/2,preset.tekliPx,preset.tekliPx);
      ctx.setLineDash([]); ctx.restore();
    }
  },[]);

  // ── Main RAF loop ─────────────────────────────────────────────────────────
  useEffect(()=>{
    let running=true;
    const loop=()=>{ if (!running) return; redraw(); rafRef.current=requestAnimationFrame(loop); };
    rafRef.current=requestAnimationFrame(loop);
    return ()=>{ running=false; cancelAnimationFrame(rafRef.current); };
  },[redraw]);

  // ── Auto-animation demo ───────────────────────────────────────────────────
  useEffect(()=>{
    if (!stencilReady) return;
    let frame=0, running=true;
    const tick=()=>{
      if (!running||hasInteractedRef.current) return;
      const stencil=stencilRef.current, paintCtx=paintRef.current?.getContext("2d");
      if (stencil&&paintCtx) {
        const elapsed=(Date.now()-autoStartRef.current)/1000;
        const x=W/2+Math.sin(elapsed*0.7)*W*0.38, y=H/2+Math.sin(elapsed*1.1+0.8)*H*0.36;
        const dx=x-autoLastPosRef.current.x, dy=y-autoLastPosRef.current.y;
        const angle=(dx!==0||dy!==0)?Math.atan2(dy,dx):null;
        if (frame%2===0) {
          const c=controlsRef.current;
          stampBristles(paintCtx,stencil,x,y,c.brushSize,angle,c.color,(c.opacity/100/0.85)*0.65,c.strokeWidth);
        }
        autoLastPosRef.current={x,y}; frame++;
      }
      autoRafRef.current=requestAnimationFrame(tick);
    };
    autoRafRef.current=requestAnimationFrame(tick);
    return ()=>{ running=false; cancelAnimationFrame(autoRafRef.current); };
  },[stencilReady]);

  // ── Canvas coordinate conversion ──────────────────────────────────────────
  const toCanvas=useCallback((clientX: number,clientY: number)=>{
    const canvas=canvasRef.current; if (!canvas) return {x:0,y:0};
    const rect=canvas.getBoundingClientRect();
    return { x:(clientX-rect.left)*(W/rect.width), y:(clientY-rect.top)*(H/rect.height) };
  },[]);

  // ── Paint at point ────────────────────────────────────────────────────────
  const paintAt=useCallback((clientX: number,clientY: number)=>{
    const stencil=stencilRef.current, paintCtx=paintRef.current?.getContext("2d");
    if (!stencil||!paintCtx) return;
    if (!hasInteractedRef.current) { hasInteractedRef.current=true; cancelAnimationFrame(autoRafRef.current); setHintVisible(false); onFirstInteraction?.(); }
    const {x,y}=toCanvas(clientX,clientY);
    const dx=x-lastPosRef.current.x, dy=y-lastPosRef.current.y;
    const angle=(dx!==0||dy!==0)?Math.atan2(dy,dx):null;
    const c=controlsRef.current;
    stampBristles(paintCtx,stencil,x,y,c.brushSize,angle,c.color,c.opacity/100/0.85,c.strokeWidth);
    lastPosRef.current={x,y}; scheduleSave();
  },[toCanvas,scheduleSave,onFirstInteraction]);

  // ── Confirm tekli placement ───────────────────────────────────────────────
  const confirmTekliPlacement=useCallback(async(cx: number,cy: number)=>{
    const comp=COMPOSITIONS[compositionRef.current];
    const motif=ALL_MOTIFS.find(m=>m.id===comp.motifId); if (!motif) return;
    const preset=SIZE_PRESETS[sizePresetRef.current];
    const stencil=await buildTekliStencil(motif.svg,preset.tekliPx,cx,cy);
    stencilRef.current=stencil; outlineRef.current=buildGhostOutline(stencil);
    setTekliPos({x:cx,y:cy}); tekliPosRef.current={x:cx,y:cy};
    setTekliPhase("painting"); tekliPhaseRef.current="painting";
  },[]);

  // ── Event listeners ───────────────────────────────────────────────────────
  useEffect(()=>{
    const canvas=canvasRef.current; if (!canvas) return;

    const onDown=(e: MouseEvent)=>{
      // Tekli placing: click to confirm position
      if (layoutModeRef.current==="tekli"&&tekliPhaseRef.current==="placing") {
        const pos=toCanvas(e.clientX,e.clientY);
        confirmTekliPlacement(pos.x,pos.y); return;
      }
      isMouseDownRef.current=true;
      lastPosRef.current=toCanvas(e.clientX,e.clientY);
      paintAt(e.clientX,e.clientY);
    };
    const onMove=(e: MouseEvent)=>{
      const pos=toCanvas(e.clientX,e.clientY); cursorCanvasRef.current=pos;
      if (isMouseDownRef.current) paintAt(e.clientX,e.clientY);
    };
    const onUp=()=>{ isMouseDownRef.current=false; };

    const onTouchStart=(e: TouchEvent)=>{
      e.preventDefault();
      const t=e.touches[0];
      if (layoutModeRef.current==="tekli"&&tekliPhaseRef.current==="placing") {
        const pos=toCanvas(t.clientX,t.clientY);
        confirmTekliPlacement(pos.x,pos.y); return;
      }
      isMouseDownRef.current=true;
      lastPosRef.current=toCanvas(t.clientX,t.clientY);
      paintAt(t.clientX,t.clientY);
    };
    const onTouchMove=(e: TouchEvent)=>{
      e.preventDefault();
      if (e.touches.length>0) {
        const t=e.touches[0]; cursorCanvasRef.current=toCanvas(t.clientX,t.clientY);
        if (isMouseDownRef.current) paintAt(t.clientX,t.clientY);
      }
    };
    const onTouchEnd=()=>{ isMouseDownRef.current=false; };

    canvas.addEventListener("mousedown",onDown);
    document.addEventListener("mousemove",onMove);
    document.addEventListener("mouseup",onUp);
    canvas.addEventListener("touchstart",onTouchStart,{passive:false});
    canvas.addEventListener("touchmove",onTouchMove,{passive:false});
    canvas.addEventListener("touchend",onTouchEnd);
    return ()=>{
      canvas.removeEventListener("mousedown",onDown);
      document.removeEventListener("mousemove",onMove);
      document.removeEventListener("mouseup",onUp);
      canvas.removeEventListener("touchstart",onTouchStart);
      canvas.removeEventListener("touchmove",onTouchMove);
      canvas.removeEventListener("touchend",onTouchEnd);
    };
  },[paintAt,toCanvas,confirmTekliPlacement]);

  // ── Photo upload ──────────────────────────────────────────────────────────
  const handlePhotoUpload=useCallback((e: React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]; if (!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{ const url=ev.target?.result as string; setPhotoDataUrl(url); photoRef.current=url; setSurface("foto"); };
    reader.readAsDataURL(file); e.target.value="";
  },[setSurface]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset=useCallback(()=>{
    if (savePaintDebRef.current!==null) { clearTimeout(savePaintDebRef.current); savePaintDebRef.current=null; }
    paintRef.current?.getContext("2d")!.clearRect(0,0,W,H);
    localStorage.removeItem(`${pfx}-paint-${compositionRef.current}`);
    const comp=COMPOSITIONS[compositionRef.current];
    const next={...DEFAULTS,color:comp.defaultColor};
    setControlsState(next); controlsRef.current=next; localStorage.setItem(`${pfx}-ctrl`,JSON.stringify(next));
    hasInteractedRef.current=false; autoStartRef.current=Date.now(); setHintVisible(true);
    if (layoutModeRef.current==="tekli") { setTekliPhase("placing"); tekliPhaseRef.current="placing"; }
  },[pfx]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const isAdvanced=panelMode==="advanced";
  const comp=COMPOSITIONS[composition];
  const px=isMobile?"10px 12px":"12px 20px";
  const fsSm=isMobile?10:11;
  const fsMd=isMobile?11:13;
  const swSize=isMobile?22:26;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={className}
      style={{
        position:"relative",
        width: embedded?"100%":"100vw",
        height:embedded?"100%":"100dvh",
        overflow:"hidden",
        background:"#0d0d1a",
        ...style,
      }}
    >
      {/* ── Canvas ───────────────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        width={W} height={H}
        style={{
          position:"absolute",top:0,left:0,
          width:"100%",height:"100%",
          display:"block",
          cursor: layoutMode==="tekli"&&tekliPhase==="placing" ? "crosshair" : "crosshair",
          touchAction:"none",
        }}
      />

      {/* ── Loading overlay ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {!stencilReady&&(
          <motion.div key="loading" initial={{opacity:1}} exit={{opacity:0}} transition={{duration:0.5,ease:"easeOut"}}
            style={{position:"absolute",inset:0,background:"rgba(13,13,26,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:20}}>
            <motion.span animate={{opacity:[0.5,1,0.5]}} transition={{repeat:Infinity,duration:1.4,ease:"easeInOut"}}
              style={{color:"#e8c56a",fontFamily:"serif",fontSize:16,letterSpacing:2}}>
              Yükleniyor…
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top bar: composition tabs ──────────────────────────────────────── */}
      <motion.div
        initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}} transition={{delay:0.2,duration:0.45,ease:"easeOut"}}
        style={{
          position:"absolute",top:0,left:0,right:0,zIndex:10,
          display:"flex",alignItems:"center",justifyContent:"space-between",
          flexWrap:isMobile?"wrap":"nowrap",gap:isMobile?6:0,
          padding:isMobile?"10px 12px":"14px 20px",
          background:"linear-gradient(to bottom, rgba(13,13,26,0.82) 0%, rgba(13,13,26,0) 100%)",
        }}
      >
        {/* Layout mode toggle */}
        <div style={{display:"flex",alignItems:"center",gap:isMobile?4:8}}>
          {(["grid","tekli"] as CanvasLayoutMode[]).map(m=>(
            <button key={m} onClick={()=>setLayoutMode(m)} style={{
              padding:isMobile?"3px 10px":"4px 14px", borderRadius:20, fontSize:fsSm,
              cursor:"pointer", fontFamily:"serif",
              border:`1.5px solid ${layoutMode===m?"#e8c56a":"rgba(255,255,255,0.18)"}`,
              background:layoutMode===m?"rgba(30,20,50,0.85)":"rgba(0,0,0,0.38)",
              color:layoutMode===m?"#e8c56a":"rgba(255,255,255,0.5)",
              backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)",
              transition:"all 0.18s",
            }}>
              {m==="grid"?"Grid":"Tekli"}
            </button>
          ))}
        </div>

        {/* Composition tabs */}
        <div style={{display:"flex",gap:isMobile?4:8,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
          {(["geometrik","botanik","mimari"] as CompositionId[]).map(id=>(
            <motion.button key={id} onClick={()=>setComposition(id)}
              whileTap={{scale:0.94}} whileHover={{scale:1.04}}
              transition={{type:"spring",stiffness:400,damping:25}}
              style={{
                padding:isMobile?"4px 10px":"5px 16px", borderRadius:20, fontSize:fsMd, fontFamily:"serif", cursor:"pointer",
                border:`1.5px solid ${composition===id?"#e8c56a":"rgba(255,255,255,0.18)"}`,
                background:composition===id?"rgba(30,20,50,0.85)":"rgba(0,0,0,0.38)",
                color:composition===id?"#e8c56a":"rgba(255,255,255,0.6)",
                backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)",
                transition:"border-color 0.18s,background 0.18s,color 0.18s",
              }}>
              {isMobile?COMPOSITIONS[id].label.slice(0,3):COMPOSITIONS[id].label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Hint overlay ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {stencilReady&&hintVisible&&(
          <motion.div key="hint"
            initial={{opacity:0,y:12,x:"-50%"}} animate={{opacity:1,y:0,x:"-50%"}} exit={{opacity:0,y:-10,x:"-50%"}}
            transition={{duration:0.35,ease:"easeOut"}}
            style={{position:"absolute",top:"50%",left:"50%",pointerEvents:"none",zIndex:5,textAlign:"center"}}>
            <div style={{background:"rgba(13,13,26,0.6)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",borderRadius:24,padding:isMobile?"8px 16px":"10px 22px",border:"1px solid rgba(232,197,106,0.22)"}}>
              <span style={{color:"rgba(232,197,106,0.88)",fontSize:isMobile?12:14,fontFamily:"serif",whiteSpace:"nowrap"}}>
                {comp.hint}
              </span>
              <br/>
              <span style={{color:"rgba(255,255,255,0.4)",fontSize:isMobile?10:11}}>
                {layoutMode==="tekli"&&tekliPhase==="placing"?"Stansili konumlandırmak için tıklayın":isMobile?"dokunarak boyayın":"boyamak için tıklayın"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tekli placement confirm hint ──────────────────────────────────── */}
      <AnimatePresence>
        {stencilReady&&layoutMode==="tekli"&&tekliPhase==="placing"&&(
          <motion.div key="tekli-hint"
            initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}}
            transition={{duration:0.3}}
            style={{position:"absolute",bottom:isMobile?"52%":"50%",left:"50%",transform:"translateX(-50%)",zIndex:12,pointerEvents:"none",textAlign:"center"}}>
            <div style={{background:"rgba(232,197,106,0.15)",backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",borderRadius:12,padding:"6px 16px",border:"1px solid rgba(232,197,106,0.4)"}}>
              <span style={{color:"#e8c56a",fontSize:12,fontFamily:"sans-serif",whiteSpace:"nowrap"}}>
                Tıklayarak stansili yerleştir
              </span>
            </div>
          </motion.div>
        )}
        {stencilReady&&layoutMode==="tekli"&&tekliPhase==="painting"&&(
          <motion.button key="tekli-reposition"
            initial={{opacity:0,x:"-50%"}} animate={{opacity:1,x:"-50%"}} exit={{opacity:0,x:"-50%"}}
            transition={{duration:0.25}} onClick={()=>{ setTekliPhase("placing"); tekliPhaseRef.current="placing"; }}
            style={{
              position:"absolute",bottom:"calc(100% - 94%)",left:"50%",zIndex:12,
              background:"rgba(13,13,26,0.8)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",
              border:"1px solid rgba(232,197,106,0.4)",borderRadius:8,padding:"4px 14px",
              color:"rgba(232,197,106,0.9)",fontSize:11,fontFamily:"sans-serif",cursor:"pointer",whiteSpace:"nowrap",
            }}>
            ↩ Yeniden Konumlandır
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Control panel ────────────────────────────────────────────────── */}
      <motion.div
        initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.35,duration:0.5,ease:[0.22,1,0.36,1]}}
        style={{
          position:"absolute",bottom:0,left:0,right:0,zIndex:10,
          background:"rgba(10,10,20,0.88)",
          backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",
          borderTop:"1px solid rgba(255,255,255,0.08)",
          padding:px,
          maxHeight:isMobile?"62vh":"48vh",overflowY:"auto",
          display:"flex",flexDirection:"column",gap:isMobile?8:10,
        }}
      >
        {/* ── Header row: mode toggle | surface | reset ─────────────────── */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>

          {/* Simple/Advanced toggle */}
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:"#555",fontSize:fsSm,textTransform:"uppercase",letterSpacing:1}}>
              {isAdvanced?"Gelişmiş":"Basit"}
            </span>
            <button role="switch" aria-checked={isAdvanced} aria-label={`${isAdvanced?"Basit":"Gelişmiş"} moda geç`}
              onClick={()=>setPanelMode(isAdvanced?"simple":"advanced")}
              style={{position:"relative",width:36,height:20,borderRadius:10,background:isAdvanced?"#e8c56a":"#333",border:"none",cursor:"pointer",transition:"background 0.22s",padding:0,flexShrink:0}}>
              <motion.span animate={{left:isAdvanced?16:2}} transition={{type:"spring",stiffness:600,damping:32}}
                style={{position:"absolute",top:2,width:16,height:16,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.4)"}}/>
            </button>
          </div>

          {/* Surface selector + photo upload */}
          <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{color:"#555",fontSize:10,textTransform:"uppercase",letterSpacing:0.5}}>Zemin</span>
            {(["duvar","ahsap","beton","tugla"] as const).map(s=>(
              <button key={s} onClick={()=>setSurface(s)} style={{padding:"3px 9px",borderRadius:5,fontSize:11,cursor:"pointer",border:`1.5px solid ${surface===s?"#e8c56a":"#333"}`,background:surface===s?"#1e1432":"#111",color:surface===s?"#e8c56a":"#666",transition:"all 0.15s"}}>
                {s==="duvar"?"Duvar":s==="ahsap"?"Ahşap":s==="beton"?"Beton":"Tuğla"}
              </button>
            ))}
            <label title={surface==="foto"?"Fotoğraf yüklendi — değiştirmek için tıklayın":"Fotoğraf yükle"} style={{padding:"3px 9px",borderRadius:5,fontSize:11,cursor:"pointer",border:`1.5px solid ${surface==="foto"?"#e8c56a":"#333"}`,background:surface==="foto"?"#1e1432":"#111",color:surface==="foto"?"#e8c56a":"#666",transition:"all 0.15s",display:"inline-flex",alignItems:"center",gap:4,userSelect:"none"}}>
              {surface==="foto"?"✓ Foto":"📷 Foto"}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{display:"none"}}/>
            </label>
            {surface==="foto"&&(
              <button title="Fotoğrafı kaldır" onClick={()=>{setSurface(comp.surface);setPhotoDataUrl(null);}}
                style={{background:"none",border:"none",color:"#c86464",cursor:"pointer",fontSize:16,padding:"0 2px",lineHeight:1}}>×</button>
            )}
          </div>

          {/* Reset */}
          <button onClick={handleReset} style={{padding:"4px 12px",borderRadius:6,fontSize:11,cursor:"pointer",border:"1px solid #3a3a3a",background:"#1a1a2a",color:"#c86464",transition:"border-color 0.15s"}}>
            Temizle
          </button>
        </div>

        {/* ── Size presets ──────────────────────────────────────────────── */}
        <div>
          <div style={{color:"#555",fontSize:10,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>
            Boyut
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {(["mini","20cm","30cm","40cm","50cm"] as SizePresetId[]).map(s=>(
              <button key={s} onClick={()=>setSizePreset(s)} style={{
                padding:"3px 10px",borderRadius:5,fontSize:11,cursor:"pointer",
                border:`1.5px solid ${sizePreset===s?"#e8c56a":"#333"}`,
                background:sizePreset===s?"#1e1432":"#111",
                color:sizePreset===s?"#e8c56a":"#666",
                transition:"all 0.15s",
              }}>
                {SIZE_PRESETS[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Color presets ─────────────────────────────────────────────── */}
        <div>
          <div style={{color:"#555",fontSize:10,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Renk</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            {COLOR_PRESETS.map(preset=>(
              <motion.button key={preset} onClick={()=>updateControl("color",preset)} title={preset}
                aria-label={`Renk: ${preset}`} aria-pressed={controls.color===preset}
                whileTap={{scale:0.9}} animate={{scale:controls.color===preset?1.15:1}}
                transition={{type:"spring",stiffness:400,damping:22}}
                style={{width:swSize,height:swSize,borderRadius:"50%",cursor:"pointer",border:"none",padding:0,background:preset,outline:controls.color===preset?"2.5px solid #e8c56a":"2px solid transparent",outlineOffset:2,flexShrink:0}}/>
            ))}
            <input type="color" value={controls.color} onChange={e=>updateControl("color",e.target.value)}
              title="Renk seçici" style={{width:28,height:26,border:"1px solid #333",borderRadius:4,cursor:"pointer",padding:0,background:"none"}}/>
            {isAdvanced&&(
              <input type="text" value={controls.color} aria-label="Hex renk kodu"
                onChange={e=>{ if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) updateControl("color",e.target.value); }}
                style={{width:76,background:"#0d0d1a",border:"1px solid #333",borderRadius:4,color:"#ccc",fontSize:11,padding:"3px 6px",fontFamily:"monospace"}}/>
            )}
          </div>
        </div>

        {/* ── Brush + Opacity sliders ────────────────────────────────────── */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <label htmlFor="h-brush" style={{color:"#aaa",fontSize:fsSm,width:isMobile?60:80,textTransform:"uppercase",letterSpacing:0.5}}>Fırça</label>
            <input id="h-brush" type="range" min={10} max={120} value={controls.brushSize}
              onChange={e=>updateControl("brushSize",Number(e.target.value))}
              style={{flex:"1 1 100px",minWidth:80,accentColor:"#e8c56a"}}/>
            <span style={{color:"#ccc",fontSize:11,minWidth:28,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{controls.brushSize}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <label htmlFor="h-opacity" style={{color:"#aaa",fontSize:fsSm,width:isMobile?60:80,textTransform:"uppercase",letterSpacing:0.5}}>Opaklık</label>
            <input id="h-opacity" type="range" min={0} max={100} value={controls.opacity}
              onChange={e=>updateControl("opacity",Number(e.target.value))}
              style={{flex:"1 1 100px",minWidth:80,accentColor:"#e8c56a"}}/>
            <span style={{color:"#ccc",fontSize:11,minWidth:36,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{controls.opacity}%</span>
          </div>
        </div>

        {/* ── Advanced controls ─────────────────────────────────────────── */}
        {isAdvanced&&(
          <div style={{display:"flex",flexDirection:"column",gap:10,borderTop:"1px solid #1e1e1e",paddingTop:10}}>

            {/* Secondary color + swap */}
            <div>
              <div style={{color:"#555",fontSize:10,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>İkincil Renk</div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <div title="Aktif renk" style={{width:26,height:26,borderRadius:"50%",background:controls.color,outline:"2.5px solid #e8c56a",outlineOffset:2,flexShrink:0}}/>
                  <button title="Renkleri değiştir" aria-label="Birincil ve ikincil rengi değiştir"
                    onClick={()=>{ const c1=controls.color,c2=controls.color2; updateControl("color2",c1); updateControl("color",c2); }}
                    style={{background:"none",border:"1px solid #333",borderRadius:4,color:"#888",cursor:"pointer",fontSize:13,padding:"1px 5px",lineHeight:1}}>⇄</button>
                  <div title="İkincil renk" style={{width:26,height:26,borderRadius:"50%",background:controls.color2,outline:"2px solid #444",outlineOffset:2,flexShrink:0}}/>
                </div>
                {COLOR_PRESETS.map(preset=>(
                  <button key={preset} onClick={()=>updateControl("color2",preset)} title={`İkincil: ${preset}`}
                    style={{width:20,height:20,borderRadius:"50%",cursor:"pointer",border:"none",padding:0,background:preset,outline:controls.color2===preset?"2px solid #aaa":"2px solid transparent",outlineOffset:2,opacity:0.75}}/>
                ))}
                <input type="color" value={controls.color2} onChange={e=>updateControl("color2",e.target.value)}
                  title="İkincil renk seçici" style={{width:26,height:22,border:"1px solid #333",borderRadius:4,cursor:"pointer",padding:0,background:"none"}}/>
              </div>
            </div>

            {/* Rotation */}
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <label htmlFor="h-rot" style={{color:"#aaa",fontSize:11,width:80,textTransform:"uppercase",letterSpacing:0.5}}>Rotasyon</label>
              <input id="h-rot" type="range" min={-45} max={45} value={controls.rotation}
                onChange={e=>updateControl("rotation",Number(e.target.value))}
                style={{flex:"1 1 100px",minWidth:80,accentColor:"#e8c56a"}}/>
              <span style={{color:"#ccc",fontSize:11,minWidth:36,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>
                {controls.rotation>0?"+":""}{controls.rotation}°
              </span>
            </div>

            {/* Stroke width */}
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <label htmlFor="h-sw" style={{color:"#aaa",fontSize:11,width:80,textTransform:"uppercase",letterSpacing:0.5}}>Kıl Genişliği</label>
              <input id="h-sw" type="range" min={5} max={30} value={Math.round(controls.strokeWidth*10)}
                onChange={e=>updateControl("strokeWidth",Number(e.target.value)/10)}
                style={{flex:"1 1 100px",minWidth:80,accentColor:"#e8c56a"}}/>
              <span style={{color:"#ccc",fontSize:11,minWidth:36,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{controls.strokeWidth.toFixed(1)}×</span>
            </div>

            {/* Blend mode */}
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <label htmlFor="h-blend" style={{color:"#aaa",fontSize:11,width:80,textTransform:"uppercase",letterSpacing:0.5}}>Karışım</label>
              <select id="h-blend" value={controls.blendMode}
                onChange={e=>updateControl("blendMode",e.target.value as BlendMode)}
                style={{background:"#0d0d1a",border:"1px solid #333",borderRadius:4,color:"#ccc",fontSize:11,padding:"3px 6px",cursor:"pointer"}}>
                {(["source-over","multiply","screen","overlay","color-burn","color-dodge","darken","lighten"] as BlendMode[])
                  .map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Saturation */}
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <label htmlFor="h-sat" style={{color:"#aaa",fontSize:11,width:80,textTransform:"uppercase",letterSpacing:0.5}}>Doygunluk</label>
              <input id="h-sat" type="range" min={0} max={200} value={controls.saturation}
                onChange={e=>updateControl("saturation",Number(e.target.value))}
                style={{flex:"1 1 100px",minWidth:80,accentColor:"#e8c56a"}}/>
              <span style={{color:"#ccc",fontSize:11,minWidth:36,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{controls.saturation}%</span>
            </div>

            {/* Contrast */}
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <label htmlFor="h-con" style={{color:"#aaa",fontSize:11,width:80,textTransform:"uppercase",letterSpacing:0.5}}>Kontrast</label>
              <input id="h-con" type="range" min={50} max={200} value={controls.contrast}
                onChange={e=>updateControl("contrast",Number(e.target.value))}
                style={{flex:"1 1 100px",minWidth:80,accentColor:"#e8c56a"}}/>
              <span style={{color:"#ccc",fontSize:11,minWidth:36,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{controls.contrast}%</span>
            </div>

            {/* Grid offset (grid mode only) */}
            {layoutMode==="grid"&&(
              <>
                <div style={{borderTop:"1px solid #1a1a2e",paddingTop:8,color:"#555",fontSize:10,textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>
                  Grid Offset
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <label htmlFor="h-ox" style={{color:"#aaa",fontSize:11,width:80,textTransform:"uppercase",letterSpacing:0.5}}>Yatay</label>
                  <input id="h-ox" type="range" min={0} max={100} value={controls.gridOffsetX}
                    onChange={async e=>{ updateControl("gridOffsetX",Number(e.target.value)); await rebuildGridStencil(); }}
                    style={{flex:"1 1 100px",minWidth:80,accentColor:"#e8c56a"}}/>
                  <span style={{color:"#ccc",fontSize:11,minWidth:36,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{controls.gridOffsetX}%</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <label htmlFor="h-oy" style={{color:"#aaa",fontSize:11,width:80,textTransform:"uppercase",letterSpacing:0.5}}>Dikey</label>
                  <input id="h-oy" type="range" min={0} max={100} value={controls.gridOffsetY}
                    onChange={async e=>{ updateControl("gridOffsetY",Number(e.target.value)); await rebuildGridStencil(); }}
                    style={{flex:"1 1 100px",minWidth:80,accentColor:"#e8c56a"}}/>
                  <span style={{color:"#ccc",fontSize:11,minWidth:36,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{controls.gridOffsetY}%</span>
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
