// SVG path data for decorative motifs that appear on the wall surface
// These are stencil-style patterns matching the brand's product categories

export interface Motif {
  id: string;
  paths: string[];
  viewBox: string;
  label: string;
}

export const motifs: Motif[] = [
  {
    id: "leaf",
    label: "Yaprak",
    viewBox: "0 0 120 120",
    paths: [
      "M60 10 C30 30 20 60 25 90 C30 70 40 50 60 40 C80 50 90 70 95 90 C100 60 90 30 60 10Z",
      "M60 40 L60 95",
      "M45 55 Q60 50 75 55",
      "M40 70 Q60 62 80 70",
    ],
  },
  {
    id: "geometric-diamond",
    label: "Geometrik",
    viewBox: "0 0 120 120",
    paths: [
      "M60 10 L100 60 L60 110 L20 60 Z",
      "M60 25 L88 60 L60 95 L32 60 Z",
      "M60 40 L76 60 L60 80 L44 60 Z",
    ],
  },
  {
    id: "mandala-simple",
    label: "Mandala",
    viewBox: "0 0 120 120",
    paths: [
      "M60 20 A40 40 0 1 1 59.99 20 Z",
      "M60 30 A30 30 0 1 1 59.99 30 Z",
      "M60 10 L60 20 M60 100 L60 110 M10 60 L20 60 M100 60 L110 60",
      "M25 25 L33 33 M95 25 L87 33 M25 95 L33 87 M95 95 L87 87",
      "M60 30 L65 45 L80 45 L68 55 L72 70 L60 60 L48 70 L52 55 L40 45 L55 45 Z",
    ],
  },
  {
    id: "wave",
    label: "Dalga",
    viewBox: "0 0 120 120",
    paths: [
      "M10 50 Q30 30 50 50 Q70 70 90 50 Q100 40 110 50",
      "M10 60 Q30 40 50 60 Q70 80 90 60 Q100 50 110 60",
      "M10 70 Q30 50 50 70 Q70 90 90 70 Q100 60 110 70",
    ],
  },
  {
    id: "flower",
    label: "Çiçek",
    viewBox: "0 0 120 120",
    paths: [
      "M60 20 Q70 40 60 50 Q50 40 60 20",
      "M100 60 Q80 70 70 60 Q80 50 100 60",
      "M60 100 Q50 80 60 70 Q70 80 60 100",
      "M20 60 Q40 50 50 60 Q40 70 20 60",
      "M85 25 Q75 45 65 45 Q75 35 85 25",
      "M95 95 Q75 85 75 75 Q85 85 95 95",
      "M25 95 Q45 85 45 75 Q35 85 25 95",
      "M35 25 Q45 45 55 45 Q45 35 35 25",
      "M60 45 A15 15 0 1 1 59.99 45 Z",
    ],
  },
  {
    id: "ethnic-tile",
    label: "Etnik",
    viewBox: "0 0 120 120",
    paths: [
      "M20 20 L100 20 L100 100 L20 100 Z",
      "M30 30 L90 30 L90 90 L30 90 Z",
      "M60 20 L60 30 M60 90 L60 100 M20 60 L30 60 M90 60 L100 60",
      "M30 30 L60 50 L90 30 M30 90 L60 70 L90 90",
      "M55 55 A5 5 0 1 1 54.99 55 Z",
    ],
  },
  {
    id: "star",
    label: "Yıldız",
    viewBox: "0 0 120 120",
    paths: [
      "M60 10 L70 45 L105 45 L78 65 L88 100 L60 80 L32 100 L42 65 L15 45 L50 45 Z",
    ],
  },
  {
    id: "arch",
    label: "Kemer",
    viewBox: "0 0 120 120",
    paths: [
      "M25 100 L25 50 A35 35 0 0 1 95 50 L95 100",
      "M35 100 L35 55 A25 25 0 0 1 85 55 L85 100",
      "M45 100 L45 58 A15 15 0 0 1 75 58 L75 100",
    ],
  },
];
