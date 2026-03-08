import { useState } from "react";
import { motion } from "framer-motion";
import { Image, Upload, Trash2, Copy, Search, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface MediaItem {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  emoji: string;
}

const initialMedia: MediaItem[] = [
  { id: "1", name: "botanik-yaprak.jpg", type: "image/jpeg", size: "1.2 MB", date: "25 Oca 2024", emoji: "🌿" },
  { id: "2", name: "art-deco-pattern.png", type: "image/png", size: "2.4 MB", date: "24 Oca 2024", emoji: "✦" },
  { id: "3", name: "mandala-template.jpg", type: "image/jpeg", size: "1.8 MB", date: "23 Oca 2024", emoji: "✿" },
  { id: "4", name: "minimal-wave.png", type: "image/png", size: "980 KB", date: "22 Oca 2024", emoji: "〰" },
  { id: "5", name: "geometric-pattern.jpg", type: "image/jpeg", size: "1.5 MB", date: "21 Oca 2024", emoji: "◇" },
  { id: "6", name: "vintage-flower.png", type: "image/png", size: "2.1 MB", date: "20 Oca 2024", emoji: "🌸" },
  { id: "7", name: "etnik-motif.jpg", type: "image/jpeg", size: "1.3 MB", date: "19 Oca 2024", emoji: "◬" },
  { id: "8", name: "banner-hero.jpg", type: "image/jpeg", size: "3.2 MB", date: "18 Oca 2024", emoji: "🖼" },
];

export const AdminMedia = () => {
  const [media, setMedia] = useState(initialMedia);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = media.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const handleUpload = () => {
    const newItem: MediaItem = {
      id: Date.now().toString(),
      name: `upload-${Date.now()}.jpg`,
      type: "image/jpeg",
      size: "1.1 MB",
      date: "Şimdi",
      emoji: "📷",
    };
    setMedia((prev) => [newItem, ...prev]);
    toast.success("Dosya yüklendi");
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setMedia((prev) => prev.filter((m) => m.id !== deleteId));
    setDeleteId(null);
    toast.success("Dosya silindi");
  };

  const copyUrl = (name: string) => {
    navigator.clipboard.writeText(`/uploads/${name}`);
    toast.success("URL kopyalandı");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl">Medya</h1>
          <p className="text-sm text-muted-foreground">{media.length} dosya</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Dosya ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-48" />
          </div>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode("list")} className={`p-2 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}><List className="w-4 h-4" /></button>
          </div>
          <Button className="gap-2" onClick={handleUpload}><Upload className="w-4 h-4" />Yükle</Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-card border border-border rounded-2xl overflow-hidden group"
            >
              <div className="aspect-square bg-muted flex items-center justify-center text-4xl relative">
                {item.emoji}
                <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => copyUrl(item.name)}><Copy className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => setDeleteId(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium truncate">{item.name}</p>
                <p className="text-[10px] text-muted-foreground">{item.size} · {item.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {filtered.map((item, i) => (
            <div key={item.id} className={`flex items-center gap-4 px-5 py-3 ${i > 0 ? "border-t border-border/50" : ""} hover:bg-accent/30 transition-colors`}>
              <span className="text-xl">{item.emoji}</span>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.name}</p><p className="text-xs text-muted-foreground">{item.type}</p></div>
              <span className="text-xs text-muted-foreground hidden sm:block">{item.size}</span>
              <span className="text-xs text-muted-foreground hidden md:block">{item.date}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyUrl(item.name)}><Copy className="w-3 h-3" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(item.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Dosyayı Sil</AlertDialogTitle><AlertDialogDescription>Bu dosyayı silmek istediğinize emin misiniz?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>İptal</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Sil</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
