import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Calendar, Edit2, Save, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const AccountProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "0532 123 45 67",
    birthDate: "1990-01-15",
  });

  useEffect(() => {
    if (user) {
      const parts = user.name.split(" ");
      setProfile((p) => ({
        ...p,
        firstName: parts[0] || user.name,
        lastName: parts.slice(1).join(" ") || "",
        email: user.email,
      }));
    }
  }, [user]);

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profil bilgileri güncellendi");
  };

  return (
    <AccountLayout title="Profil Bilgileri" subtitle="Kişisel bilgilerinizi düzenleyin">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
          <div className="relative">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-serif text-2xl">
                {profile.firstName?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            {isEditing && (
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          <div>
            <h2 className="font-serif text-xl">{profile.firstName} {profile.lastName}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
          <div className="flex-1" />
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className="gap-2"
          >
            {isEditing ? <><Save className="w-4 h-4" />Kaydet</> : <><Edit2 className="w-4 h-4" />Düzenle</>}
          </Button>
        </div>

        {/* Fields */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
              <User className="w-3.5 h-3.5" /> Ad
            </label>
            {isEditing ? (
              <Input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
            ) : (
              <p className="text-sm font-medium py-2">{profile.firstName}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
              <User className="w-3.5 h-3.5" /> Soyad
            </label>
            {isEditing ? (
              <Input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
            ) : (
              <p className="text-sm font-medium py-2">{profile.lastName}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
              <Mail className="w-3.5 h-3.5" /> E-posta
            </label>
            {isEditing ? (
              <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            ) : (
              <p className="text-sm font-medium py-2">{profile.email}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
              <Phone className="w-3.5 h-3.5" /> Telefon
            </label>
            {isEditing ? (
              <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            ) : (
              <p className="text-sm font-medium py-2">{profile.phone}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
              <Calendar className="w-3.5 h-3.5" /> Doğum Tarihi
            </label>
            {isEditing ? (
              <Input type="date" value={profile.birthDate} onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })} />
            ) : (
              <p className="text-sm font-medium py-2">
                {new Date(profile.birthDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Account Activity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-6 mt-6"
      >
        <h2 className="font-serif text-lg mb-4">Hesap Etkinliği</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="font-serif text-2xl text-primary">12</p>
            <p className="text-xs text-muted-foreground mt-1">Toplam Sipariş</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="font-serif text-2xl text-primary">5</p>
            <p className="text-xs text-muted-foreground mt-1">Favori Ürün</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="font-serif text-2xl text-primary">2</p>
            <p className="text-xs text-muted-foreground mt-1">Kayıtlı Adres</p>
          </div>
        </div>
      </motion.div>
    </AccountLayout>
  );
};

export default AccountProfile;
