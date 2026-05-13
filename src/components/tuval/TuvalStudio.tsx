import { useEffect, useState } from "react";
import { TuvalProvider, loadAutosave, useTuval } from "./store/TuvalContext";
import { CanvasStage } from "./canvas/CanvasStage";
import { LeftRail, type RailTab } from "./panels/LeftRail";
import { MotifPanel } from "./panels/MotifPanel";
import { ProductPanel } from "./panels/ProductPanel";
import { SurfacePanel } from "./panels/SurfacePanel";
import { LayersPanel } from "./panels/LayersPanel";
import { ZonesPanel } from "./panels/ZonesPanel";
import { InspectorPanel } from "./panels/InspectorPanel";
import { TopBar } from "./topbar/TopBar";
import { resolveMotifImage } from "./store/motifResolver";
import type { TuvalState } from "./store/types";
import { toast } from "sonner";

interface Props {
  initialMotifId?: string;
}

function StageContainer() {
  // wraps stage with data attribute so TopBar export can target it
  return (
    <div className="flex-1 min-h-0" data-tuval-stage-wrapper>
      <div className="h-full" data-tuval-stage>
        <CanvasStage />
      </div>
    </div>
  );
}

function StudioInner({ initialMotifId }: Props) {
  const { dispatch, state } = useTuval();
  const [tab, setTab] = useState<RailTab>("motif");
  const [autosaveOffered, setAutosaveOffered] = useState(false);

  // Apply ?motif=… on first mount
  useEffect(() => {
    if (!initialMotifId) return;
    if (state.motifs.some(m => m.sourceId === initialMotifId)) return;
    const r = resolveMotifImage(initialMotifId);
    if (!r) return;
    dispatch({
      type: "ADD_MOTIF",
      motif: {
        id: `m-init-${Date.now()}`,
        sourceId: initialMotifId,
        name: r.name,
        imageUrl: r.url,
        x: 0.5, y: 0.5, scale: 0.35, rotation: 0,
        color: "#3d3530", opacity: 0.9,
        visible: true, locked: false,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMotifId]);

  // Offer to restore autosave on first mount (unless we have an explicit initial motif)
  useEffect(() => {
    if (autosaveOffered || initialMotifId) return;
    const saved = loadAutosave();
    if (saved && saved.motifs.length > 0) {
      toast("Önceki çalışman bulundu", {
        description: `${saved.motifs.length} katman geri yüklensin mi?`,
        action: { label: "Geri yükle", onClick: () => dispatch({ type: "LOAD", state: saved as TuvalState }) },
      });
    }
    setAutosaveOffered(true);
  }, [autosaveOffered, initialMotifId, dispatch]);

  return (
    <div className="flex flex-col h-full bg-background">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <LeftRail active={tab} onChange={setTab} />
        <aside className="w-64 border-r border-border bg-background hidden md:block">
          {tab === "motif" && <MotifPanel />}
          {tab === "urun" && <ProductPanel />}
          {tab === "zemin" && <SurfacePanel />}
          {tab === "alan" && <ZonesPanel />}
          {tab === "katman" && <LayersPanel />}
        </aside>
        <StageContainer />
        <aside className="w-64 border-l border-border bg-background hidden lg:block">
          <InspectorPanel />
        </aside>
      </div>
    </div>
  );
}

export default function TuvalStudio({ initialMotifId }: Props) {
  return (
    <TuvalProvider>
      <StudioInner initialMotifId={initialMotifId} />
    </TuvalProvider>
  );
}
