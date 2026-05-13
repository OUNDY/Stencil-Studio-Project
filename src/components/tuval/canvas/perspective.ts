// 4-point perspective transform → CSS matrix3d.
// Maps the unit square (0,0)-(1,0)-(1,1)-(0,1) onto an arbitrary quad in pixel space.
// Returns a matrix3d(...) string for use in CSS transform.
//
// Math reference: solves an 8x8 linear system to find the 8 unknowns of
// the 3x3 projective homography (last entry fixed at 1), then re-arranges
// into the 4x4 column-major matrix CSS expects.

export type Pt = { x: number; y: number };
export type Quad = [Pt, Pt, Pt, Pt]; // TL, TR, BR, BL

function adjugate(m: number[]): number[] {
  return [
    m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
    m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
    m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3],
  ];
}

function multmm(a: number[], b: number[]): number[] {
  const c = Array(9).fill(0);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let cij = 0;
      for (let k = 0; k < 3; k++) cij += a[3 * i + k] * b[3 * k + j];
      c[3 * i + j] = cij;
    }
  }
  return c;
}

function multmv(m: number[], v: number[]): number[] {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

function basisToPoints(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): number[] {
  const m = [x1, x2, x3, y1, y2, y3, 1, 1, 1];
  const v = multmv(adjugate(m), [x4, y4, 1]);
  return multmm(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
}

function general2DProjection(
  x1s: number, y1s: number, x1d: number, y1d: number,
  x2s: number, y2s: number, x2d: number, y2d: number,
  x3s: number, y3s: number, x3d: number, y3d: number,
  x4s: number, y4s: number, x4d: number, y4d: number,
): number[] {
  const s = basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
  const d = basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
  return multmm(d, adjugate(s));
}

/**
 * Returns a CSS matrix3d(...) string that warps a w×h rectangle
 * (positioned at 0,0 with no transform) onto the given destination quad
 * (in pixel coordinates, TL/TR/BR/BL order).
 */
export function quadToMatrix3d(w: number, h: number, dst: Quad): string {
  const t = general2DProjection(
    0, 0, dst[0].x, dst[0].y,
    w, 0, dst[1].x, dst[1].y,
    w, h, dst[2].x, dst[2].y,
    0, h, dst[3].x, dst[3].y,
  );
  // Normalize so t[8] = 1
  for (let i = 0; i < 9; i++) t[i] = t[i] / t[8];
  // CSS matrix3d is column-major:
  // a b 0 c   d e 0 f   0 0 1 0   g h 0 1
  const m = [
    t[0], t[3], 0, t[6],
    t[1], t[4], 0, t[7],
    0,    0,    1, 0,
    t[2], t[5], 0, t[8],
  ];
  return `matrix3d(${m.join(",")})`;
}
