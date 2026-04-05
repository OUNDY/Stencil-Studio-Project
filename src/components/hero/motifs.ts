export interface Motif {
  id: string;
  name: string;
  description: string;
  svg: string;
  pngDataUrl?: string;
}

export const motifs: Motif[] = [
  {
    id: "damask",
    name: "Damask",
    description: "Klasik Osmanlı damask deseni, simetrik çiçek ve yaprak motifleriyle",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g fill="currentColor">
        <ellipse cx="50" cy="50" rx="8" ry="18"/>
        <ellipse cx="50" cy="50" rx="18" ry="8"/>
        <ellipse cx="50" cy="50" rx="5" ry="12" transform="rotate(45 50 50)"/>
        <ellipse cx="50" cy="50" rx="5" ry="12" transform="rotate(-45 50 50)"/>
        <circle cx="50" cy="50" r="4"/>
        <ellipse cx="50" cy="22" rx="4" ry="8"/>
        <ellipse cx="50" cy="78" rx="4" ry="8"/>
        <ellipse cx="22" cy="50" rx="8" ry="4"/>
        <ellipse cx="78" cy="50" rx="8" ry="4"/>
        <circle cx="50" cy="14" r="3"/>
        <circle cx="50" cy="86" r="3"/>
        <circle cx="14" cy="50" r="3"/>
        <circle cx="86" cy="50" r="3"/>
        <circle cx="28" cy="28" r="3"/>
        <circle cx="72" cy="28" r="3"/>
        <circle cx="28" cy="72" r="3"/>
        <circle cx="72" cy="72" r="3"/>
      </g>
    </svg>`,
  },
  {
    id: "tropikal",
    name: "Tropikal Yaprak",
    description: "Büyük tropikal yapraklar ve egzotik çiçeklerle dolu yaz deseni",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g fill="currentColor">
        <path d="M50 10 Q65 30 60 55 Q55 70 50 75 Q45 70 40 55 Q35 30 50 10Z"/>
        <path d="M50 75 Q35 60 20 65 Q10 68 8 75 Q15 70 30 72 Q42 74 50 85Z" opacity="0.8"/>
        <path d="M50 75 Q65 60 80 65 Q90 68 92 75 Q85 70 70 72 Q58 74 50 85Z" opacity="0.8"/>
        <line x1="50" y1="10" x2="50" y2="75" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <line x1="50" y1="30" x2="40" y2="22" stroke="currentColor" stroke-width="0.8" fill="none"/>
        <line x1="50" y1="40" x2="60" y2="32" stroke="currentColor" stroke-width="0.8" fill="none"/>
        <line x1="50" y1="50" x2="38" y2="44" stroke="currentColor" stroke-width="0.8" fill="none"/>
        <line x1="50" y1="60" x2="62" y2="54" stroke="currentColor" stroke-width="0.8" fill="none"/>
        <circle cx="50" cy="85" r="5"/>
        <circle cx="50" cy="85" r="2" fill="white"/>
      </g>
    </svg>`,
  },
  {
    id: "geometrik",
    name: "Geometrik",
    description: "Modern geometrik şekiller ve tekrarlayan desenlerle minimal kompozisyon",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="50,10 90,32 90,68 50,90 10,68 10,32" fill="currentColor" opacity="0.15"/>
        <polygon points="50,20 80,37 80,63 50,80 20,63 20,37" fill="none"/>
        <polygon points="50,30 70,41 70,59 50,70 30,59 30,41" fill="currentColor" opacity="0.2"/>
        <line x1="50" y1="10" x2="50" y2="90"/>
        <line x1="10" y1="32" x2="90" y2="68"/>
        <line x1="10" y1="68" x2="90" y2="32"/>
        <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.5"/>
        <circle cx="50" cy="50" r="3" fill="currentColor"/>
      </g>
    </svg>`,
  },
  {
    id: "iznik",
    name: "İznik",
    description: "16. yüzyıl İznik çini sanatından ilham alan lale ve karanfil motifleri",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g fill="currentColor">
        <path d="M50 15 C45 20 42 28 44 35 C46 42 50 45 50 45 C50 45 54 42 56 35 C58 28 55 20 50 15Z"/>
        <path d="M50 45 L50 80" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M44 55 C38 52 32 54 28 58 C24 62 24 68 28 70 C32 72 38 70 42 66 C46 62 46 58 44 55Z"/>
        <path d="M56 55 C62 52 68 54 72 58 C76 62 76 68 72 70 C68 72 62 70 58 66 C54 62 54 58 56 55Z"/>
        <ellipse cx="50" cy="80" rx="6" ry="10"/>
        <circle cx="50" cy="35" r="3"/>
      </g>
    </svg>`,
  },
  {
    id: "karo",
    name: "Karo",
    description: "Modern geometrik elmas—iç içe romblar, çapraz eksenler, mimari hassasiyet",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g>
        <polygon points="50,5 95,50 50,95 5,50" fill="none" stroke="currentColor" stroke-width="3"/>
        <polygon points="50,22 78,50 50,78 22,50" fill="none" stroke="currentColor" stroke-width="2"/>
        <polygon points="50,37 63,50 50,63 37,50" fill="currentColor"/>
        <rect x="47" y="5" width="6" height="90" fill="currentColor"/>
        <rect x="5" y="47" width="90" height="6" fill="currentColor"/>
        <circle cx="50" cy="5" r="6" fill="currentColor"/>
        <circle cx="95" cy="50" r="6" fill="currentColor"/>
        <circle cx="50" cy="95" r="6" fill="currentColor"/>
        <circle cx="5" cy="50" r="6" fill="currentColor"/>
      </g>
    </svg>`,
  },
  {
    id: "botanika",
    name: "Botanika",
    description: "Art Nouveau botanik dal—alternatif yaprak dizisi, kıvrımlı gövde, organik akış",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g fill="currentColor">
        <path d="M50 95 C46 72 54 52 50 35 C46 18 50 8 50 8"
              fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M50 76 C65 68 80 54 74 40 C66 54 58 66 50 76 Z"/>
        <path d="M50 62 C35 54 20 40 26 24 C35 36 43 50 50 62 Z"/>
        <path d="M50 46 C63 38 72 22 64 12 C58 22 54 36 50 46 Z"/>
        <path d="M50 30 C40 23 34 12 38 5 C44 13 47 23 50 30 Z"/>
        <ellipse cx="50" cy="6" rx="4" ry="7"/>
      </g>
    </svg>`,
  },
  {
    id: "kapi",
    name: "Kapı",
    description: "Neo-klasik kemer—yuvarlak kemer halkası, trefoil rozet, pilaster sütunlar",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g fill="currentColor">
        <rect x="7" y="50" width="13" height="46"/>
        <rect x="80" y="50" width="13" height="46"/>
        <path d="M7 50 A43 43 0 0 1 93 50 L80 50 A30 30 0 0 0 20 50 Z"/>
        <polygon points="50,4 43,17 57,17"/>
        <circle cx="50" cy="36" r="11"/>
        <circle cx="39" cy="48" r="11"/>
        <circle cx="61" cy="48" r="11"/>
        <rect x="5" y="92" width="90" height="5"/>
      </g>
    </svg>`,
  },
  {
    id: "mandala",
    name: "Mandala",
    description: "Merkezi simetrik mandala deseni, daireler ve taç yapraklarıyla huzur verici",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g fill="currentColor" transform="translate(50,50)">
        <circle r="5"/>
        <circle r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <circle r="20" fill="none" stroke="currentColor" stroke-width="1"/>
        <circle r="32" fill="none" stroke="currentColor" stroke-width="1"/>
        <ellipse cx="0" cy="-15" rx="3" ry="6" transform="rotate(0 0 -15)"/>
        <ellipse cx="10.6" cy="-10.6" rx="3" ry="6" transform="rotate(45 10.6 -10.6)"/>
        <ellipse cx="15" cy="0" rx="3" ry="6" transform="rotate(90 15 0)"/>
        <ellipse cx="10.6" cy="10.6" rx="3" ry="6" transform="rotate(135 10.6 10.6)"/>
        <ellipse cx="0" cy="15" rx="3" ry="6" transform="rotate(180 0 15)"/>
        <ellipse cx="-10.6" cy="10.6" rx="3" ry="6" transform="rotate(225 -10.6 10.6)"/>
        <ellipse cx="-15" cy="0" rx="3" ry="6" transform="rotate(270 -15 0)"/>
        <ellipse cx="-10.6" cy="-10.6" rx="3" ry="6" transform="rotate(315 -10.6 -10.6)"/>
        <ellipse cx="0" cy="-26" rx="2.5" ry="5" transform="rotate(0 0 -26)"/>
        <ellipse cx="18.4" cy="-18.4" rx="2.5" ry="5" transform="rotate(45 18.4 -18.4)"/>
        <ellipse cx="26" cy="0" rx="2.5" ry="5" transform="rotate(90 26 0)"/>
        <ellipse cx="18.4" cy="18.4" rx="2.5" ry="5" transform="rotate(135 18.4 18.4)"/>
        <ellipse cx="0" cy="26" rx="2.5" ry="5" transform="rotate(180 0 26)"/>
        <ellipse cx="-18.4" cy="18.4" rx="2.5" ry="5" transform="rotate(225 -18.4 18.4)"/>
        <ellipse cx="-26" cy="0" rx="2.5" ry="5" transform="rotate(270 -26 0)"/>
        <ellipse cx="-18.4" cy="-18.4" rx="2.5" ry="5" transform="rotate(315 -18.4 -18.4)"/>
        <circle cx="0" cy="-20" r="2"/>
        <circle cx="14.1" cy="-14.1" r="2"/>
        <circle cx="20" cy="0" r="2"/>
        <circle cx="14.1" cy="14.1" r="2"/>
        <circle cx="0" cy="20" r="2"/>
        <circle cx="-14.1" cy="14.1" r="2"/>
        <circle cx="-20" cy="0" r="2"/>
        <circle cx="-14.1" cy="-14.1" r="2"/>
      </g>
    </svg>`,
  },
];
