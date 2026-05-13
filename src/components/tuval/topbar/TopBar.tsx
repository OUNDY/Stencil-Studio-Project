import { useState } from "react";
import { Undo2, Redo2, Save, Trash2, Download, FolderOpen, RotateCcw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTuval } from "../store/TuvalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { loadProjects, saveProject, deleteProject, type SavedProject } from "../store/persistence";
import { toast } from "sonner";

export function TopBar() {
  const { state, dispatch, undo, redo, canUndo, canRedo, reset } = useTuval();
  const [name, setName] = useState("");
  const [projects, setProjects] = useState<SavedProject[]>(() => loadProjects());
  const [openLoad, setOpenLoad] = useState(false);

  const onSave = () => {
    const finalName = name.trim() || `Tuval ${new Date().toLocaleString("tr-TR")}`;
    saveProject(finalName, state);
    setProjects(loadProjects());
    setName("");
    toast.success("Proje kaydedildi", { description: finalName });
  };

  const onLoad = (p: SavedProject) => {
    dispatch({ type: "LOAD", state: p.state });
    setOpenLoad(false);
    toast.success("Proje yüklendi", { description: p.name });
  };

  const onDelete = (id: string) => {
    deleteProject(id);
    setProjects(loadProjects());
  };

  const onExportPng = async () => {
    // Find canvas stage in DOM and rasterize via html2canvas-like minimal approach using <canvas> draws.
    // Simplest path: snapshot the stage element using the browser's foreignObject-svg trick.
    const stage = document.querySelector<HTMLElement>("[data-tuval-stage]");
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString(stage)}</foreignObject></svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      c.toBlob((b) => {
        if (!b) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = `tuval-${Date.now()}.png`;
        a.click();
      });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      toast.error("PNG dışa aktarımı tarayıcıda desteklenmedi", { description: "Lütfen ekran görüntüsü alın." });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const onExportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tuval-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/60 backdrop-blur shrink-0">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" disabled={!canUndo} onClick={undo} title="Geri al (Ctrl+Z)">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" disabled={!canRedo} onClick={redo} title="İleri al (Ctrl+Shift+Z)">
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="h-5 w-px bg-border" />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Proje adı…"
        className="h-8 max-w-[220px]"
      />
      <Button size="sm" variant="secondary" onClick={onSave}>
        <Save className="h-3.5 w-3.5" /> Kaydet
      </Button>

      <Sheet open={openLoad} onOpenChange={setOpenLoad}>
        <SheetTrigger asChild>
          <Button size="sm" variant="outline">
            <FolderOpen className="h-3.5 w-3.5" /> Projeler
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader><SheetTitle>Kayıtlı projeler</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-2">
            {projects.length === 0 && (
              <p className="text-sm text-muted-foreground">Henüz kayıt yok.</p>
            )}
            {projects.map(p => (
              <div key={p.id} className="flex items-center gap-2 rounded-md border border-border p-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">{new Date(p.updatedAt).toLocaleString("tr-TR")} · {p.state.motifs.length} katman</div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => onLoad(p)}>Yükle</Button>
                <Button size="icon" variant="ghost" onClick={() => onDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <div className="ml-auto flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={onExportJson} title="JSON dışa aktar">
          <Download className="h-3.5 w-3.5" /> JSON
        </Button>
        <Button size="sm" variant="ghost" onClick={onExportPng} title="PNG dışa aktar">
          <Download className="h-3.5 w-3.5" /> PNG
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { if (confirm("Tuvali sıfırlamak istiyor musun?")) reset(); }} title="Sıfırla">
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>

        {/* Canlı Uygula CTA */}
        <motion.button
          onClick={() => {
            const stage = document.querySelector<HTMLElement>("[data-tuval-stage]");
            if (stage) {
              stage.animate(
                [
                  { filter: "brightness(1)" },
                  { filter: "brightness(1.25) saturate(1.2)" },
                  { filter: "brightness(1)" },
                ],
                { duration: 700, easing: "ease-out" }
              );
            }
            toast.success("Boyama uygulandı", { description: `${state.motifs.length} katman tuvale işlendi` });
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          animate={{ boxShadow: ["0 0 0 0 hsl(var(--primary)/0.45)", "0 0 0 10px hsl(var(--primary)/0)", "0 0 0 0 hsl(var(--primary)/0)"] }}
          transition={{ boxShadow: { duration: 1.8, repeat: Infinity, ease: "easeOut" } }}
          className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-primary/80 px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-md hover:shadow-lg transition-shadow"
        >
          <Sparkles className="h-4 w-4" />
          Uygula
        </motion.button>
      </div>
    </div>
  );
}
