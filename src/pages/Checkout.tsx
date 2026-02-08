import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Truck, ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Navbar } from "@/components/navigation";
import { Footer } from "@/components/sections";
import { useCart } from "@/context/CartContext";

const paymentMethods = [
  { id: "credit", label: "Kredi/Banka Kartı", icon: CreditCard },
  { id: "transfer", label: "Havale/EFT", icon: Truck },
  { id: "door", label: "Kapıda Ödeme", icon: ShieldCheck },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsComplete(true);
    clearCart();
  };

  if (items.length === 0 && !isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isHeroComplete={true} />
        <div className="pt-32 pb-20 container mx-auto px-6 text-center">
          <h1 className="font-serif text-3xl mb-4">Sepetiniz Boş</h1>
          <p className="text-muted-foreground mb-8">
            Ödeme yapmak için önce sepetinize ürün ekleyin.
          </p>
          <Link to="/koleksiyon">
            <Button>Koleksiyonu Keşfet</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isHeroComplete={true} />
        <div className="pt-32 pb-20 container mx-auto px-6">
          <motion.div
            className="max-w-lg mx-auto text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Check className="w-10 h-10 text-primary" />
            </motion.div>
            <h1 className="font-serif text-3xl mb-4">Siparişiniz Alındı!</h1>
            <p className="text-muted-foreground mb-8">
              Sipariş onayı e-posta adresinize gönderildi. Siparişinizi "Siparişlerim" sayfasından takip edebilirsiniz.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/">
                <Button variant="outline">Ana Sayfa</Button>
              </Link>
              <Link to="/siparislerim">
                <Button>Siparişlerimi Gör</Button>
              </Link>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isHeroComplete={true} />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri
            </Button>
          </motion.div>

          {/* Progress steps */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                <span
                  className={`text-sm hidden sm:block ${
                    step >= s ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s === 1 ? "Teslimat" : s === 2 ? "Ödeme" : "Onay"}
                </span>
                {s < 3 && (
                  <div className="w-8 h-px bg-border hidden sm:block" />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form section */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="font-serif text-2xl">Teslimat Bilgileri</h2>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Ad Soyad</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Adınız Soyadınız"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-posta</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="ornek@email.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="0555 555 55 55"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Adres</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Mahalle, sokak, bina no, daire no"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Şehir</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="İstanbul"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Posta Kodu</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="34000"
                        />
                      </div>
                    </div>

                    <Button onClick={() => setStep(2)} className="w-full">
                      Devam Et
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="font-serif text-2xl">Ödeme Yöntemi</h2>

                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="space-y-3"
                    >
                      {paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
                            paymentMethod === method.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value={method.id} />
                          <method.icon className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{method.label}</span>
                        </label>
                      ))}
                    </RadioGroup>

                    {paymentMethod === "credit" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-4 pt-4 border-t border-border"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Kart Numarası</Label>
                          <Input
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardName">Kart Üzerindeki İsim</Label>
                          <Input
                            id="cardName"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleInputChange}
                            placeholder="AD SOYAD"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Son Kullanma</Label>
                            <Input
                              id="expiry"
                              name="expiry"
                              value={formData.expiry}
                              onChange={handleInputChange}
                              placeholder="MM/YY"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleInputChange}
                              placeholder="123"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1"
                      >
                        Geri
                      </Button>
                      <Button onClick={() => setStep(3)} className="flex-1">
                        Devam Et
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="font-serif text-2xl">Sipariş Özeti</h2>

                    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Teslimat Adresi</h3>
                        <p className="text-sm text-muted-foreground">
                          {formData.fullName}<br />
                          {formData.address}<br />
                          {formData.city} {formData.postalCode}<br />
                          {formData.phone}
                        </p>
                      </div>
                      <div className="border-t border-border pt-4">
                        <h3 className="font-medium mb-2">Ödeme Yöntemi</h3>
                        <p className="text-sm text-muted-foreground">
                          {paymentMethods.find((m) => m.id === paymentMethod)?.label}
                          {paymentMethod === "credit" &&
                            formData.cardNumber &&
                            ` - **** ${formData.cardNumber.slice(-4)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="flex-1"
                        disabled={isProcessing}
                      >
                        Geri
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        className="flex-1"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <motion.div
                            className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        ) : (
                          "Siparişi Onayla"
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order summary sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
                <h3 className="font-serif text-xl mb-4">Sepet</h3>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Adet: {item.quantity}
                        </p>
                        <p className="text-sm font-medium mt-1">
                          {(item.price * item.quantity).toFixed(2)} ₺
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ara Toplam</span>
                    <span>{totalPrice.toFixed(2)} ₺</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kargo</span>
                    <span className="text-primary">Ücretsiz</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg pt-2 border-t border-border">
                    <span>Toplam</span>
                    <span>{totalPrice.toFixed(2)} ₺</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
