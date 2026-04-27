import { Link } from "react-router-dom";
import { LegalLayout } from "@/components/legal/LegalLayout";

const Shipping = () => (
  <LegalLayout
    title="Kargo Bilgisi"
    subtitle="Siparişinin sana ne zaman ve nasıl ulaşacağına dair her şey."
    updatedAt="1 Ocak 2026"
  >
    <h2>Hazırlık Süresi</h2>
    <ul>
      <li><strong>Stoktaki ürünler:</strong> 1-2 iş günü içinde kargoya verilir.</li>
      <li><strong>Özel tasarım:</strong> 5-7 iş günü hazırlık + kargo süresi.</li>
      <li><strong>Dijital indirilebilir ürünler:</strong> Ödeme onaylandıktan sonra anında e-posta ile gönderilir.</li>
    </ul>

    <h2>Kargo Ücretleri</h2>
    <ul>
      <li>Yurt içi sabit ücret: <strong>39 TL</strong></li>
      <li>300 TL ve üzeri siparişlerde <strong>kargo ücretsiz</strong></li>
      <li>AB ülkeleri: 19 EUR'dan başlayan ücretler (sipariş tutarına göre değişir)</li>
      <li>Diğer ülkeler: çıkışta hesaplanır</li>
    </ul>

    <h2>Anlaşmalı Kargo Firmaları</h2>
    <ul>
      <li>Yurtiçi Kargo</li>
      <li>Aras Kargo</li>
      <li>Uluslararası: DHL Express, UPS</li>
    </ul>

    <h2>Teslim Süreleri</h2>
    <ul>
      <li>İstanbul: 1 iş günü</li>
      <li>Diğer büyükşehirler: 1-2 iş günü</li>
      <li>Anadolu geneli: 2-4 iş günü</li>
      <li>AB: 4-7 iş günü</li>
    </ul>

    <h2>Takip</h2>
    <p>
      Sipariş kargoya verildiğinde size bir kargo takip numarası ile e-posta gönderilir.
      <strong> Hesabım &gt; Siparişlerim</strong> sayfasından da güncel kargo durumunu izleyebilirsin.
    </p>

    <h2>Hasarlı Teslimat</h2>
    <p>
      Kargo paketi hasarlıysa <strong>kargoyu kabul etmeyin</strong>.
      Eğer hasarı paketi açtıktan sonra fark ettiyseniz, 24 saat içinde fotoğrafla birlikte{" "}
      <Link to="/iletisim">iletişim</Link> sayfamızdan bize ulaşın; ücretsiz değişim yaparız.
    </p>
  </LegalLayout>
);

export default Shipping;
