import { useTuval } from "../store/TuvalContext";
import { SurfaceId } from "../store/types";

const SURFACES: { id: SurfaceId; label: string; preview: string }[] = [
  { id: "duvar", label: "Duvar", preview: "linear-gradient(135deg, #ede4d3, #d8c9b1)" },
  { id: "ahsap", label: "Ahşap", preview: "linear-gradient(180deg, #b88c5a, #8a6238)" },
  { id: "beton", label: "Beton", preview: "radial-gradient(circle at 30% 30%, #c8c5be, #8e8a82)" },
  { id: "beyaz", label: "Beyaz", preview: "#ffffff" },
];

export function SurfacePanel() {
  const { state, dispatch } = useTuval();
  return (
    <div className="flex flex-col gap-3 p-4 h-full">
      <div>
        <h3 className="font-serif text-lg text-foreground">Zemin</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Tuvalin yüzeyini seç</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SURFACES.map(s => {
          const active = state.surface === s.id;
          return (
            <button
              key={s.id}
              onClick={() => dispatch({ type: "SET_SURFACE", surface: s.id })}
              className={`rounded-lg overflow-hidden border-2 transition-all text-left ${active ? "border-primary shadow-md" : "border-border hover:border-primary/40"}`}
            >
              <div className="aspect-video" style={{ background: s.preview }} />
              <div className="px-2 py-1.5 text-xs text-foreground bg-card">{s.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
