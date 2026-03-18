import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
  emoji: string;
  description: string;
}

const initialCategories: Category[] = [
  { id: "1", name: "Tropik Yapraklar", slug: "tropik-yapraklar", count: 3, emoji: "🌿", description: "Monstera, palmiye ve egzotik yapraklar" },
  { id: "2", name: "Çiçek & Gül", slug: "cicek-gul", count: 3, emoji: "🌹", description: "Vintage güller, sakura ve yaban çiçekleri" },
  { id: "3", name: "Art Deco & Gatsby", slug: "art-deco", count: 2, emoji: "✦", description: "1920'lerin ihtişamlı geometrik motifleri" },
  { id: "4", name: "Boho & Makrame", slug: "boho-makrame", count: 2, emoji: "🪢", description: "Makrame düğümleri ve bohem detaylar" },
  { id: "5", name: "Mandala", slug: "mandala", count: 2, emoji: "❀", description: "Lotus ve tavan mandalaları" },
  { id: "6", name: "Japon & Zen", slug: "japon-zen", count: 2, emoji: "🌊", description: "Enso dairesi ve Kanagawa dalgası" },
  { id: "7", name: "İslami Geometri", slug: "islami-geometri", count: 2, emoji: "✸", description: "Selçuklu yıldızları ve arabesk desenler" },
  { id: "8", name: "Hayvan Silüetleri", slug: "hayvan-siluet", count: 2, emoji: "🦋", description: "Kuşlar, kelebekler ve doğa" },
  { id: "9", name: "Çocuk: Uzay", slug: "cocuk-uzay", count: 2, emoji: "🚀", description: "Roketler, gezegenler ve yıldızlar" },
  { id: "10", name: "Çocuk: Hayvanlar", slug: "cocuk-hayvan", count: 2, emoji: "🦁", description: "Safari ve deniz altı hayvanları" },
  { id: "11", name: "Bordür & Çerçeve", slug: "bordur-cerceve", count: 2, emoji: "🖼", description: "Defne dalı bordürleri ve çerçeveler" },
  { id: "12", name: "Modern Soyut", slug: "modern-soyut", count: 2, emoji: "🎨", description: "Matisse kesikleri ve akışkan formlar" },
  { id: "13", name: "Kaligrafi & Yazı", slug: "kaligrafi", count: 2, emoji: "✍", description: "Hat sanatı ve modern tipografi" },
];

export const AdminCategories = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", emoji: "", description: "" });

  const openNew = () => { setEditingId(null); setForm({ name: "", emoji: "✦", description: "" }); setDialogOpen(true); };
  const openEdit = (c: Category) => { setEditingId(c.id); setForm({ name: c.name, emoji: c.emoji, description: c.description }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name) { toast.error("Kategori adı zorunlu"); return; }
    if (editingId) {
      setCategories((prev) => prev.map((c) => c.id === editingId ? { ...c, ...form, slug: form.name.toLowerCase().replace(/\s+/g, "-") } : c));
      toast.success("Kategori güncellendi");
    } else {
      setCategories((prev) => [...prev, { ...form, id: Date.now().toString(), slug: form.name.toLowerCase().replace(/\s+/g, "-"), count: 0 }]);
      toast.success("Kategori eklendi");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setCategories((prev) => prev.filter((c) => c.id !== deleteId));
    setDeleteId(null);
    toast.success("Kategori silindi");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl">Kategoriler</h1>
          <p className="text-sm text-muted-foreground">{categories.length} kategori</p>
        </div>
        <Button className="gap-2" onClick={openNew}><Plus className="w-4 h-4" />Kategori Ekle</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <div>
                    <h3 className="font-medium">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">{cat.count} ürün</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(cat)}><Edit2 className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(cat.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{cat.description}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{editingId ? "Kategoriyi Düzenle" : "Yeni Kategori"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-[60px,1fr] gap-3">
              <div><label className="text-xs text-muted-foreground mb-1.5 block">Emoji</label><Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} className="text-center text-lg" /></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">Ad *</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            </div>
            <div><label className="text-xs text-muted-foreground mb-1.5 block">Açıklama</label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button><Button onClick={handleSave}>{editingId ? "Güncelle" : "Ekle"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle><AlertDialogDescription>Bu kategoriyi silmek istediğinize emin misiniz?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>İptal</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Sil</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
