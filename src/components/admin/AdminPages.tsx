import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Edit2, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Page {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft";
  lastEdited: string;
  content: string;
}

const initialPages: Page[] = [
  { id: "1", title: "Hakkımızda", slug: "/hakkimizda", status: "published", lastEdited: "25 Oca 2024", content: "Stencil olarak, duvar sanatını herkes için erişilebilir kılmak amacıyla yola çıktık..." },
  { id: "2", title: "Nasıl Çalışır", slug: "/nasil-calisir", status: "published", lastEdited: "24 Oca 2024", content: "Şablon seçin, boyayı uygulayın ve duvarınızı sanata dönüştürün..." },
  { id: "3", title: "Sıkça Sorulan Sorular", slug: "/sss", status: "draft", lastEdited: "20 Oca 2024", content: "En çok merak edilen sorular ve cevapları..." },
  { id: "4", title: "İade Politikası", slug: "/iade-politikasi", status: "published", lastEdited: "15 Oca 2024", content: "14 gün içinde iade hakkınız bulunmaktadır..." },
  { id: "5", title: "Gizlilik Politikası", slug: "/gizlilik", status: "published", lastEdited: "10 Oca 2024", content: "Kişisel verilerinizin korunması bizim için önemlidir..." },
];

export const AdminPages = () => {
  const [pages, setPages] = useState(initialPages);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", content: "", status: "draft" as "published" | "draft" });

  const openNew = () => { setEditingId(null); setForm({ title: "", slug: "", content: "", status: "draft" }); setDialogOpen(true); };
  const openEdit = (p: Page) => { setEditingId(p.id); setForm({ title: p.title, slug: p.slug, content: p.content, status: p.status }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.title) { toast.error("Sayfa başlığı zorunlu"); return; }
    const slug = form.slug || `/${form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
    if (editingId) {
      setPages((prev) => prev.map((p) => p.id === editingId ? { ...p, ...form, slug, lastEdited: "Şimdi" } : p));
      toast.success("Sayfa güncellendi");
    } else {
      setPages((prev) => [...prev, { ...form, slug, id: Date.now().toString(), lastEdited: "Şimdi" }]);
      toast.success("Sayfa oluşturuldu");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => { if (!deleteId) return; setPages((prev) => prev.filter((p) => p.id !== deleteId)); setDeleteId(null); toast.success("Sayfa silindi"); };

  const toggleStatus = (id: string) => {
    setPages((prev) => prev.map((p) => p.id === id ? { ...p, status: p.status === "published" ? "draft" : "published" } : p));
    toast.success("Durum güncellendi");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-serif text-2xl">Sayfalar</h1><p className="text-sm text-muted-foreground">{pages.length} sayfa</p></div>
        <Button className="gap-2" onClick={openNew}><Plus className="w-4 h-4" />Yeni Sayfa</Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {pages.map((page, i) => (
          <div key={page.id} className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? "border-t border-border/50" : ""} hover:bg-accent/30 transition-colors`}>
            <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{page.title}</p>
              <p className="text-xs text-muted-foreground font-mono">{page.slug}</p>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">{page.lastEdited}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${page.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {page.status === "published" ? "Yayında" : "Taslak"}
            </span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleStatus(page.id)}>
                {page.status === "published" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(page)}><Edit2 className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(page.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Sayfayı Düzenle" : "Yeni Sayfa"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><label className="text-xs text-muted-foreground mb-1.5 block">Başlık *</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground mb-1.5 block">URL Slug</label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Otomatik oluşturulur" /></div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">İçerik</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[120px]" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="text-sm">Yayınla</span><Switch checked={form.status === "published"} onCheckedChange={(v) => setForm({ ...form, status: v ? "published" : "draft" })} /></div>
              <div className="flex gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button><Button onClick={handleSave}>{editingId ? "Güncelle" : "Oluştur"}</Button></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Sayfayı Sil</AlertDialogTitle><AlertDialogDescription>Bu sayfayı silmek istediğinize emin misiniz?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>İptal</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Sil</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
