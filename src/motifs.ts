export interface Motif {
  id: string;
  name: string;
  description: string;
  svg: string;
}

export const damask: Motif = {
  id: "damask",
  name: "Damask",
  description:
    "Classic symmetrical floral damask pattern inspired by traditional wall stencils.",
  svg: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <g fill="#4a3728" fill-rule="evenodd">
    <!-- Central medallion -->
    <path d="M100 20
      C108 35, 125 45, 130 60
      C135 75, 120 85, 100 90
      C80 85, 65 75, 70 60
      C75 45, 92 35, 100 20Z"/>
    <path d="M100 200
      C108 185, 125 175, 130 160
      C135 145, 120 135, 100 130
      C80 135, 65 145, 70 160
      C75 175, 92 185, 100 200Z"/>
    <!-- Side flourishes -->
    <path d="M100 90
      C110 95, 130 92, 140 100
      C130 108, 110 105, 100 110
      C90 105, 70 108, 60 100
      C70 92, 90 95, 100 90Z"/>
    <path d="M100 130
      C110 125, 130 128, 140 120
      C130 112, 110 115, 100 110
      C90 115, 70 112, 60 120
      C70 128, 90 125, 100 130Z"/>
    <!-- Top scroll -->
    <path d="M80 30 C75 25, 60 28, 55 40 C50 52, 60 55, 68 48 C72 44, 70 36, 80 30Z"/>
    <path d="M120 30 C125 25, 140 28, 145 40 C150 52, 140 55, 132 48 C128 44, 130 36, 120 30Z"/>
    <!-- Bottom scroll -->
    <path d="M80 170 C75 175, 60 172, 55 160 C50 148, 60 145, 68 152 C72 156, 70 164, 80 170Z"/>
    <path d="M120 170 C125 175, 140 172, 145 160 C150 148, 140 145, 132 152 C128 156, 130 164, 120 170Z"/>
    <!-- Diamond accents -->
    <path d="M100 55 L106 65 L100 75 L94 65Z"/>
    <path d="M100 145 L94 135 L100 125 L106 135Z"/>
    <!-- Vertical spine -->
    <path d="M98 60 L98 80 Q100 85 102 80 L102 60 Q100 55 98 60Z"/>
    <path d="M98 140 L98 120 Q100 115 102 120 L102 140 Q100 145 98 140Z"/>
    <!-- Leaf pairs -->
    <path d="M45 100
      C40 85, 25 80, 15 85
      C10 90, 18 100, 30 100
      C18 100, 10 110, 15 115
      C25 120, 40 115, 45 100Z"/>
    <path d="M155 100
      C160 85, 175 80, 185 85
      C190 90, 182 100, 170 100
      C182 100, 190 110, 185 115
      C175 120, 160 115, 155 100Z"/>
    <!-- Corner ornaments (quarter patterns for tiling) -->
    <path d="M0 0 C15 10, 20 25, 15 35 C10 30, 5 20, 0 0Z"/>
    <path d="M200 0 C185 10, 180 25, 185 35 C190 30, 195 20, 200 0Z"/>
    <path d="M0 200 C15 190, 20 175, 15 165 C10 170, 5 180, 0 200Z"/>
    <path d="M200 200 C185 190, 180 175, 185 165 C190 170, 195 180, 200 200Z"/>
    <!-- Small dot accents -->
    <circle cx="100" cy="100" r="3"/>
    <circle cx="40" cy="55" r="2"/>
    <circle cx="160" cy="55" r="2"/>
    <circle cx="40" cy="145" r="2"/>
    <circle cx="160" cy="145" r="2"/>
  </g>
</svg>`,
};

export const motifs: Motif[] = [damask];
