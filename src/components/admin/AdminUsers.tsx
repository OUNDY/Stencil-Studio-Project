import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Shield, Ban, Mail, MoreHorizontal, Eye, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "banned";
  orders: number;
  spent: string;
  joinDate: string;
  lastLogin: string;
}

const initialUsers: UserItem[] = [
  { id: "1", name: "Ahmet Yılmaz", email: "ahmet@mail.com", role: "user", status: "active", orders: 8, spent: "₺2,340", joinDate: "15 Ara 2023", lastLogin: "2 saat önce" },
  { id: "2", name: "Elif Kaya", email: "elif@mail.com", role: "user", status: "active", orders: 12, spent: "₺4,180", joinDate: "3 Kas 2023", lastLogin: "1 gün önce" },
  { id: "3", name: "Mehmet Aydın", email: "mehmet@mail.com", role: "user", status: "active", orders: 3, spent: "₺630", joinDate: "20 Oca 2024", lastLogin: "5 dk önce" },
  { id: "4", name: "Zeynep Baran", email: "zeynep@mail.com", role: "admin", status: "active", orders: 0, spent: "₺0", joinDate: "1 Oca 2023", lastLogin: "Şu an aktif" },
  { id: "5", name: "Can Demir", email: "can@mail.com", role: "user", status: "banned", orders: 1, spent: "₺190", joinDate: "10 Oca 2024", lastLogin: "2 hafta önce" },
  { id: "6", name: "Selin Öz", email: "selin@mail.com", role: "user", status: "active", orders: 6, spent: "₺1,650", joinDate: "8 Kas 2023", lastLogin: "3 saat önce" },
];

export const AdminUsers = () => {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [detailUser, setDetailUser] = useState<UserItem | null>(null);
  const [banTarget, setBanTarget] = useState<UserItem | null>(null);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBan = () => {
    if (!banTarget) return;
    const newStatus = banTarget.status === "active" ? "banned" : "active";
    setUsers((prev) => prev.map((u) => u.id === banTarget.id ? { ...u, status: newStatus } : u));
    toast.success(newStatus === "banned" ? "Kullanıcı engellendi" : "Kullanıcı engeli kaldırıldı");
    setBanTarget(null);
  };

  const toggleRole = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: u.role === "admin" ? "user" : "admin" } : u));
    toast.success("Kullanıcı rolü güncellendi");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl">Kullanıcılar</h1>
          <p className="text-sm text-muted-foreground">{users.length} kayıtlı kullanıcı</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Kullanıcı ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="font-serif text-2xl text-primary">{users.filter((u) => u.status === "active").length}</p>
          <p className="text-xs text-muted-foreground">Aktif</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="font-serif text-2xl text-primary">{users.filter((u) => u.role === "admin").length}</p>
          <p className="text-xs text-muted-foreground">Admin</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="font-serif text-2xl text-destructive">{users.filter((u) => u.status === "banned").length}</p>
          <p className="text-xs text-muted-foreground">Engelli</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="px-5 py-3 font-medium">Kullanıcı</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Rol</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Sipariş</th>
                <th className="px-5 py-3 font-medium hidden lg:table-cell">Harcama</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${user.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {user.role === "admin" ? "Admin" : "Kullanıcı"}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">{user.orders}</td>
                  <td className="px-5 py-3 hidden lg:table-cell">{user.spent}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${user.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {user.status === "active" ? "Aktif" : "Engelli"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailUser(user)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setBanTarget(user)}>
                        {user.status === "active" ? <UserX className="w-3.5 h-3.5 text-destructive" /> : <UserCheck className="w-3.5 h-3.5 text-green-600" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail */}
      <Dialog open={!!detailUser} onOpenChange={() => setDetailUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Kullanıcı Detayı</DialogTitle></DialogHeader>
          {detailUser && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-serif text-xl">{detailUser.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium">{detailUser.name}</p>
                  <p className="text-sm text-muted-foreground">{detailUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-xl p-3"><p className="text-xs text-muted-foreground">Sipariş</p><p className="font-medium">{detailUser.orders}</p></div>
                <div className="bg-muted/50 rounded-xl p-3"><p className="text-xs text-muted-foreground">Harcama</p><p className="font-medium">{detailUser.spent}</p></div>
                <div className="bg-muted/50 rounded-xl p-3"><p className="text-xs text-muted-foreground">Kayıt</p><p className="font-medium">{detailUser.joinDate}</p></div>
                <div className="bg-muted/50 rounded-xl p-3"><p className="text-xs text-muted-foreground">Son Giriş</p><p className="font-medium">{detailUser.lastLogin}</p></div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => { toast.success("E-posta gönderildi"); }}><Mail className="w-3.5 h-3.5" /> E-posta Gönder</Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => toggleRole(detailUser.id)}>
                  <Shield className="w-3.5 h-3.5" /> {detailUser.role === "admin" ? "Admin'i Kaldır" : "Admin Yap"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ban Confirm */}
      <AlertDialog open={!!banTarget} onOpenChange={() => setBanTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{banTarget?.status === "active" ? "Kullanıcıyı Engelle" : "Engeli Kaldır"}</AlertDialogTitle>
            <AlertDialogDescription>
              {banTarget?.name} adlı kullanıcıyı {banTarget?.status === "active" ? "engellemek" : "engelini kaldırmak"} istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={toggleBan} className={banTarget?.status === "active" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}>
              {banTarget?.status === "active" ? "Engelle" : "Engeli Kaldır"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
