import { LegalLayout } from "@/components/legal/LegalLayout";

const TermsOfUse = () => (
  <LegalLayout
    title="Kullanım Koşulları"
    subtitle="Stencil Studio'yu kullanırken geçerli olan koşullar ve sorumluluklar."
    updatedAt="1 Ocak 2026"
  >
    <h2>1. Kabul</h2>
    <p>
      Stencil Studio'ya erişerek veya hizmetlerimizi kullanarak bu kullanım koşullarını kabul etmiş sayılırsınız.
      Koşulları kabul etmiyorsanız, lütfen siteyi kullanmayınız.
    </p>

    <h2>2. Hesap Sorumluluğu</h2>
    <ul>
      <li>Hesap bilgilerinizin gizliliğinden siz sorumlusunuz.</li>
      <li>Hesabınızda gerçekleştirilen tüm işlemlerden siz sorumlusunuz.</li>
      <li>Yetkisiz erişim fark ederseniz derhal bize bildirin.</li>
    </ul>

    <h2>3. Ürün ve Sipariş</h2>
    <ul>
      <li>Ürün görselleri temsilîdir; renkler ekran kalibrasyonuna göre farklı görünebilir.</li>
      <li>Sipariş onayı, ödemenin tamamlanmasıyla geçerlilik kazanır.</li>
      <li>Stok durumu anlık olarak güncellenir; nadiren stoksuz çıkan ürünlerde sipariş iade edilir.</li>
    </ul>

    <h2>4. Fikrî Mülkiyet</h2>
    <p>
      Sitedeki tüm motif, logo, görsel ve metinler Stencil Studio'ya aittir.
      Satın aldığınız fiziksel ve dijital şablonları <strong>kişisel kullanım için</strong> kullanabilirsiniz;
      yeniden satış veya ticarî dağıtım yasaktır.
    </p>

    <h2>5. Özel Tasarım</h2>
    <p>
      Özel tasarım siparişlerinde gönderdiğiniz görseller üzerinde size ait haklara sahip olmanız gerekir.
      Üçüncü taraf telif hakkı ihlali doğuracak içerikler kabul edilmez.
    </p>

    <h2>6. İade ve İptal</h2>
    <p>
      İade koşulları için <a href="/iade-politikasi">İade Politikası</a> sayfamızı inceleyiniz.
      Dijital indirilebilir ürünlerde, indirme gerçekleştikten sonra iade kabul edilmez.
    </p>

    <h2>7. Sorumluluk Sınırı</h2>
    <p>
      Stencil Studio, ürünlerin uygulanması sırasında oluşabilecek yüzey hasarlarından,
      yanlış uygulamadan veya boya seçiminden sorumlu tutulamaz.
      Uygulama videolarımızı izlemenizi öneririz.
    </p>

    <h2>8. Değişiklikler</h2>
    <p>
      Bu koşulları zaman zaman güncelleyebiliriz. Önemli değişiklikleri kayıtlı e-posta adresinize bildiririz.
    </p>

    <h2>9. Uygulanacak Hukuk</h2>
    <p>
      Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir.
      Uyuşmazlıklarda İstanbul Mahkemeleri yetkilidir.
    </p>
  </LegalLayout>
);

export default TermsOfUse;
