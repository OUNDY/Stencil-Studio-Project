import { LegalLayout } from "@/components/legal/LegalLayout";

const Returns = () => (
  <LegalLayout
    title="İade Politikası"
    subtitle="Memnun kalmadığın ürünleri 14 gün içinde iade edebilirsin."
    updatedAt="1 Ocak 2026"
  >
    <h2>İade Süresi</h2>
    <p>
      Ürünü teslim aldığın tarihten itibaren <strong>14 gün</strong> içinde iade talebi oluşturabilirsin.
      Bu süre, 6502 Sayılı Tüketicinin Korunması Hakkında Kanun kapsamındadır.
    </p>

    <h2>İade Edilebilen Ürünler</h2>
    <ul>
      <li>Kullanılmamış, orijinal ambalajında ve hasarsız fiziksel şablonlar</li>
      <li>Set ve paket ürünler (eksiksiz olarak)</li>
    </ul>

    <h2>İade Edilemeyen Ürünler</h2>
    <ul>
      <li><strong>Dijital indirilebilir ürünler</strong> — indirme gerçekleştikten sonra iade kabul edilmez</li>
      <li><strong>Özel tasarım siparişler</strong> — kişiye özel üretildiği için iade alınmaz (üretim hatası hariç)</li>
      <li>Kullanılmış veya boya bulaşmış şablonlar</li>
    </ul>

    <h2>İade Süreci</h2>
    <ol>
      <li><strong>Hesabım &gt; Siparişlerim</strong> sayfasından "İade Talebi Oluştur" butonuna tıklayın.</li>
      <li>İade nedenini seçin ve varsa fotoğraf ekleyin.</li>
      <li>Onay e-postası ile size kargo kodu gönderilir.</li>
      <li>Ürünü orijinal paketinde kargo şubesine teslim edin (kargo ücretsiz).</li>
      <li>Ürün depomuza ulaştıktan sonra kontrol edilir; uygun bulunursa <strong>3-5 iş günü</strong> içinde ödemeniz iade edilir.</li>
    </ol>

    <h2>İade Ödemesi</h2>
    <ul>
      <li>Kredi kartı ile ödenen siparişlerde iade aynı karta yapılır (banka süreçleri 7-14 gün sürebilir).</li>
      <li>Havale/EFT ile ödenen siparişlerde IBAN ile iade yapılır.</li>
      <li>Kargo ücreti, iade üründen kaynaklı olduğunda tarafımızca karşılanır.</li>
    </ul>

    <h2>Hasarlı veya Yanlış Ürün</h2>
    <p>
      Yanlış veya hasarlı ürün ulaştıysa fotoğraflarla birlikte 24 saat içinde
      <a href="/iletisim"> bize ulaşın</a>; size ücretsiz olarak doğru ürünü göndeririz.
    </p>
  </LegalLayout>
);

export default Returns;
