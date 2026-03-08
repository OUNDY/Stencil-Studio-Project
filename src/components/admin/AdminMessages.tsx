import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Check, Clock, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: string;
  email: string;
  subject: string;
  preview: string;
  fullMessage: string;
  date: string;
  read: boolean;
  replied: boolean;
}

const initialMessages: Message[] = [
  { id: "1", sender: "Ahmet Yılmaz", email: "ahmet@mail.com", subject: "Sipariş hakkında", preview: "Siparişim ne zaman kargoya verilecek?", fullMessage: "Merhaba, ORD-2024-003 numaralı siparişim ne zaman kargoya verilecek? Tahmini tarih alabilir miyim? Teşekkürler.", date: "2 saat önce", read: false, replied: false },
  { id: "2", sender: "Elif Kaya", email: "elif@mail.com", subject: "Özel tasarım talebi", preview: "Kendi logomun şablonunu yaptırabilir miyim?", fullMessage: "Merhaba, firmamızın logosunu duvar şablonu olarak yaptırmak istiyoruz. Özel tasarım yapıyor musunuz? Boyut ve fiyat bilgisi alabilir miyim?", date: "5 saat önce", read: false, replied: false },
  { id: "3", sender: "Selin Öz", email: "selin@mail.com", subject: "İade talebi", preview: "Ürün beklediğim gibi değildi...", fullMessage: "Merhaba, aldığım Geometrik Desen şablonu beklediğim kalınlıkta değil. İade sürecini başlatmak istiyorum. Yardımcı olur musunuz?", date: "1 gün önce", read: true, replied: true },
];

export const AdminMessages = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");

  const selected = messages.find((m) => m.id === selectedId);
  const filtered = messages.filter((m) => m.sender.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase()));
  const unreadCount = messages.filter((m) => !m.read).length;

  const openMessage = (id: string) => {
    setSelectedId(id);
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m));
    setReplyText("");
  };

  const sendReply = () => {
    if (!replyText.trim()) { toast.error("Yanıt yazın"); return; }
    setMessages((prev) => prev.map((m) => m.id === selectedId ? { ...m, replied: true } : m));
    setReplyText("");
    toast.success("Yanıt gönderildi");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl">Mesajlar</h1>
        <p className="text-sm text-muted-foreground">{unreadCount} okunmamış mesaj</p>
      </div>

      <div className="grid lg:grid-cols-[350px,1fr] gap-4 min-h-[500px]">
        {/* List */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Mesaj ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((msg) => (
              <button
                key={msg.id}
                onClick={() => openMessage(msg.id)}
                className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors ${selectedId === msg.id ? "bg-primary/5" : "hover:bg-accent/30"} ${!msg.read ? "bg-primary/5" : ""}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {!msg.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                  <span className={`text-sm ${!msg.read ? "font-semibold" : "font-medium"} truncate`}>{msg.sender}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto flex-shrink-0">{msg.date}</span>
                </div>
                <p className="text-xs font-medium truncate">{msg.subject}</p>
                <p className="text-xs text-muted-foreground truncate">{msg.preview}</p>
                {msg.replied && <span className="inline-flex items-center gap-0.5 text-[10px] text-primary mt-1"><Check className="w-3 h-3" />Yanıtlandı</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
          {selected ? (
            <>
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-medium">{selected.subject}</h2>
                <p className="text-xs text-muted-foreground">{selected.sender} · {selected.email} · {selected.date}</p>
              </div>
              <div className="flex-1 p-5">
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
                    <span className="text-sm font-medium">{selected.sender}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selected.fullMessage}</p>
                </div>
              </div>
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input placeholder="Yanıt yazın..." value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendReply()} />
                  <Button onClick={sendReply} className="gap-2"><Send className="w-4 h-4" />Gönder</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Bir mesaj seçin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
