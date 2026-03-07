import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountLayout } from "@/components/account/AccountLayout";

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
  const [addresses, setAddresses] = useState(initialAddresses);

  const setDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AccountLayout title="Adreslerim" subtitle="Teslimat adreslerinizi yönetin">
      <Button className="mb-6 gap-2">
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
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteAddress(address.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </AccountLayout>
  );
};

export default Addresses;
