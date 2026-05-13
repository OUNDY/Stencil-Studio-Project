import { useTuval } from "../store/TuvalContext";
import { SurfaceId } from "../store/types";
import wallImg from "@/assets/surfaces/wall.jpg";
import brickImg from "@/assets/surfaces/brick.jpg";
import woodImg from "@/assets/surfaces/wood.jpg";
import concreteImg from "@/assets/surfaces/concrete.jpg";
import roomImg from "@/assets/surfaces/room.jpg";

interface Surface {
  id: SurfaceId;
  label: string;
  description: string;
  preview: string;          // CSS background fallback / thumb
  image?: string;           // photo asset
}

const SURFACES: Surface[] = [
  { id: "duvar",  label: "Duvar",     description: "Kremsi sıvalı duvar",       preview: `url(${wallImg}) center/cover`,     image: wallImg },
  { id: "tugla",  label: "Tuğla",     description: "Beyaz badana tuğla",        preview: `url(${brickImg}) center/cover`,    image: brickImg },
  { id: "ahsap",  label: "Ahşap",     description: "Açık meşe lambri",          preview: `url(${woodImg}) center/cover`,     image: woodImg },
  { id: "beton",  label: "Beton",     description: "Mikro-çimento yüzey",       preview: `url(${concreteImg}) center/cover`, image: concreteImg },
  { id: "oda",    label: "Oda",       description: "Boş oda mockup'ı",          preview: `url(${roomImg}) center/cover`,     image: roomImg },
  { id: "beyaz",  label: "Beyaz",     description: "Düz beyaz tuval",           preview: "#ffffff" },
];

export const SURFACE_REGISTRY: Record<SurfaceId, Surface> =
  SURFACES.reduce((acc, s) => { acc[s.id] = s; return acc; }, {} as Record<SurfaceId, Surface>);

export function SurfacePanel() {
  const { state, dispatch } = useTuval();
  return (
    <div className="flex flex-col gap-3 p-4 h-full overflow-y-auto">
      <div>
        <h3 className="font-serif text-lg text-foreground">Zemin</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Tuvalin yüzeyini seç. Oda mockup'ında perspektif alan çizmeyi dene.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SURFACES.map(s => {
          const active = state.surface === s.id;
          return (
            <button
              key={s.id}
              onClick={() => dispatch({ type: "SET_SURFACE", surface: s.id })}
              className={`group rounded-lg overflow-hidden border-2 transition-all text-left ${active ? "border-primary shadow-md" : "border-border hover:border-primary/40"}`}
            >
              <div className="aspect-video bg-muted transition-transform group-hover:scale-[1.03]" style={{ background: s.preview }} />
              <div className="px-2 py-1.5 bg-card">
                <div className="text-xs font-medium text-foreground">{s.label}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">{s.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
