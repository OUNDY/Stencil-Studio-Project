import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Address {
  id: string;
  title: string;
  type: "home" | "work";
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  isDefault: boolean;
}

const emptyAddress: Omit<Address, "id" | "isDefault"> = {
  title: "",
  type: "home",
  fullName: "",
  phone: "",
  address: "",
  city: "",
  district: "",
};

const initialAddresses: Address[] = [
  {
    id: "1",
    title: "Ev Adresim",
    type: "home",
    fullName: "Kullanıcı Adı",
    phone: "0532 123 45 67",
    address: "Atatürk Mah. Cumhuriyet Cad. No:42/5",
    city: "İstanbul",
    district: "Kadıköy",
    isDefault: true,
  },
  {
    id: "2",
    title: "İş Adresim",
    type: "work",
    fullName: "Kullanıcı Adı",
    phone: "0532 123 45 67",
    address: "Bahçelievler Mah. 1234 Sk. No:8",
    city: "Ankara",
    district: "Çankaya",
    isDefault: false,
  },
];

const Addresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAddress);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyAddress, fullName: user?.name || "" });
    setDialogOpen(true);
  };

  const openEdit = (address: Address) => {
    setEditingId(address.id);
    setForm({
      title: address.title,
      type: address.type,
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      district: address.district,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.fullName || !form.address || !form.city || !form.district || !form.phone) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }

    if (editingId) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, ...form } : a))
      );
      toast.success("Adres güncellendi");
    } else {
      const newAddr: Address = {
        ...form,
        id: Date.now().toString(),
        isDefault: addresses.length === 0,
      };
      setAddresses((prev) => [...prev, newAddr]);
      toast.success("Yeni adres eklendi");
    }
    setDialogOpen(false);
  };

  const setDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
    toast.success("Varsayılan adres güncellendi");
  };

  const confirmDelete = (id: string) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const deleteAddress = () => {
    if (!deleteTargetId) return;
    const wasDefault = addresses.find((a) => a.id === deleteTargetId)?.isDefault;
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== deleteTargetId);
      if (wasDefault && filtered.length > 0) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
    toast.success("Adres silindi");
  };

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AccountLayout title="Adreslerim" subtitle="Teslimat adreslerinizi yönetin">
      <Button className="mb-6 gap-2" onClick={openNew}>
        <Plus className="w-4 h-4" />
        Yeni Adres Ekle
      </Button>

      {addresses.length === 0 ? (
        <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="font-serif text-xl mb-2">Kayıtlı adresiniz yok</h2>
          <p className="text-muted-foreground">Hızlı alışveriş için adreslerinizi kaydedin.</p>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {addresses.map((address, index) => (
              <motion.div
                key={address.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className={`relative bg-card border rounded-2xl p-5 ${
                  address.isDefault ? "border-primary" : "border-border"
                }`}
              >
                {address.isDefault && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    <Check className="w-3 h-3" />
                    Varsayılan
                  </span>
                )}

                <div className="flex items-center gap-2 mb-3">
                  {address.type === "home" ? (
                    <Home className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                  )}
                  <h3 className="font-medium text-sm">{address.title}</h3>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground mb-4">
                  <p className="font-medium text-foreground">{address.fullName}</p>
                  <p>{address.address}</p>
                  <p>{address.district}, {address.city}</p>
                  <p>{address.phone}</p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDefault(address.id)}
                      className="text-xs"
                    >
                      Varsayılan Yap
                    </Button>
                  )}
                  <div className="flex-1" />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(address)}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => confirmDelete(address.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Adresi Düzenle" : "Yeni Adres Ekle"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Adres Başlığı</label>
                <Input placeholder="Ev Adresim" value={form.title} onChange={(e) => updateForm("title", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Adres Tipi</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={form.type === "home" ? "default" : "outline"}
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => updateForm("type", "home")}
                  >
                    <Home className="w-3.5 h-3.5" /> Ev
                  </Button>
                  <Button
                    type="button"
                    variant={form.type === "work" ? "default" : "outline"}
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => updateForm("type", "work")}
                  >
                    <Briefcase className="w-3.5 h-3.5" /> İş
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Ad Soyad</label>
                <Input value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Telefon</label>
                <Input value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="05XX XXX XX XX" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Adres</label>
              <Input value={form.address} onChange={(e) => updateForm("address", e.target.value)} placeholder="Mahalle, Cadde/Sokak, No" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">İlçe</label>
                <Input value={form.district} onChange={(e) => updateForm("district", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Şehir</label>
                <Input value={form.city} onChange={(e) => updateForm("city", e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
              <Button onClick={handleSave}>{editingId ? "Güncelle" : "Kaydet"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Adresi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu adresi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAddress} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AccountLayout>
  );
};

export default Addresses;
