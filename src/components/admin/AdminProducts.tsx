import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Edit2, Trash2, Search, Eye, EyeOff, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { products as allProducts, Product } from "@/data/products";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminProduct extends Product {
  stock: number;
  active: boolean;
}

const initialProducts: AdminProduct[] = allProducts.map((p, i) => ({
  ...p,
  stock: [45, 23, 18, 60, 35, 12, 28, 40, 55, 15, 33, 20][i] || 30,
  active: true,
}));

const emptyForm = { name: "", price: 0, category: "", description: "", emoji: "✦", stock: 0 };

export const AdminProducts = () => {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (p: AdminProduct) => {
    setEditingId(p.id);
    setForm({ name: p.name, price: p.price, category: p.category, description: p.description, emoji: p.emoji, stock: p.stock });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price || !form.category) { toast.error("Zorunlu alanları doldurun"); return; }
    if (editingId) {
      setProducts((prev) => prev.map((p) => p.id === editingId ? { ...p, ...form } : p));
      toast.success("Ürün güncellendi");
    } else {
      const newP: AdminProduct = {
        ...form, id: Date.now().toString(), details: [], sizes: ["50x50 cm"], active: true,
      };
      setProducts((prev) => [newP, ...prev]);
      toast.success("Ürün eklendi");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);
    toast.success("Ürün silindi");
  };

  const toggleActive = (id: string) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, active: !p.active } : p));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl">Ürünler</h1>
          <p className="text-sm text-muted-foreground">{products.length} ürün</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Ürün ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-56" />
          </div>
          <Button className="gap-2" onClick={openNew}><Plus className="w-4 h-4" />Ürün Ekle</Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="px-5 py-3 font-medium">Ürün</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Kategori</th>
                <th className="px-5 py-3 font-medium">Fiyat</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Stok</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((product) => (
                  <motion.tr
                    key={product.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{product.emoji}</span>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-muted-foreground capitalize">{product.category}</td>
                    <td className="px-5 py-3">{product.price} ₺</td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className={product.stock < 20 ? "text-destructive font-medium" : ""}>{product.stock}</span>
                    </td>
                    <td className="px-5 py-3">
                      <Switch checked={product.active} onCheckedChange={() => toggleActive(product.id)} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(product.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-[60px,1fr] gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Emoji</label>
                <Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} className="text-center text-lg" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Ürün Adı *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Fiyat (₺) *</label>
                <Input type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Kategori *</label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Stok</label>
                <Input type="number" value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Açıklama</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
              <Button onClick={handleSave}>{editingId ? "Güncelle" : "Ekle"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ürünü Sil</AlertDialogTitle>
            <AlertDialogDescription>Bu ürünü silmek istediğinize emin misiniz?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
