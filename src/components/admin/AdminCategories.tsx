import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Plus, Edit2, Trash2, GripVertical } from "lucide-react";
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
  { id: "1", name: "Botanik", slug: "botanik", count: 2, emoji: "🌿", description: "Doğa ve bitki motifleri" },
  { id: "2", name: "Geometrik", slug: "geometrik", count: 2, emoji: "◇", description: "Modern geometrik desenler" },
  { id: "3", name: "Mandala", slug: "mandala", count: 2, emoji: "✿", description: "Mandala ve meditasyon desenleri" },
  { id: "4", name: "Minimal", slug: "minimal", count: 3, emoji: "〰", description: "Sade ve minimalist desenler" },
  { id: "5", name: "Etnik", slug: "etnik", count: 1, emoji: "◬", description: "Geleneksel ve etnik motifler" },
  { id: "6", name: "Çocuk", slug: "cocuk", count: 2, emoji: "🦋", description: "Çocuk odası desenleri" },
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
