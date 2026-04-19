import { LegalLayout } from "@/components/legal/LegalLayout";

const PrivacyPolicy = () => (
  <LegalLayout
    title="Gizlilik Politikası"
    subtitle="Kişisel verilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklıyoruz."
    updatedAt="1 Ocak 2026"
  >
    <h2>1. Topladığımız Bilgiler</h2>
    <p>
      Stencil Studio olarak, hizmetlerimizi sağlamak için aşağıdaki bilgileri toplayabiliriz:
    </p>
    <ul>
      <li><strong>Hesap bilgileri:</strong> ad, e-posta, şifre (şifrelenmiş olarak saklanır).</li>
      <li><strong>Sipariş bilgileri:</strong> teslimat adresi, fatura adresi, telefon.</li>
      <li><strong>Ödeme bilgileri:</strong> ödeme yalnızca lisanslı ödeme sağlayıcısı üzerinden yapılır; kart bilgilerinizi bizim sunucularımızda saklamayız.</li>
      <li><strong>Kullanım verileri:</strong> sayfa ziyaretleri, tıklama davranışı, cihaz ve tarayıcı bilgisi (anonimleştirilmiş analitik için).</li>
    </ul>

    <h2>2. Bilgileri Nasıl Kullanırız</h2>
    <ul>
      <li>Siparişlerinizi işlemek ve teslim etmek</li>
      <li>Hesap güvenliğinizi sağlamak ve hesabınıza erişiminizi kolaylaştırmak</li>
      <li>Talep ettiğiniz bildirim ve duyuruları göndermek</li>
      <li>Hizmet kalitemizi iyileştirmek ve yeni özellikler geliştirmek</li>
      <li>Yasal yükümlülüklerimizi yerine getirmek</li>
    </ul>

    <h2>3. Bilgi Paylaşımı</h2>
    <p>
      Verilerinizi <strong>üçüncü taraflara satmayız</strong>. Aşağıdaki hizmet sağlayıcılarla yalnızca hizmeti yürütmek için gerekli olan bilgileri paylaşabiliriz:
    </p>
    <ul>
      <li>Ödeme sağlayıcısı (örn. Iyzico/Stripe)</li>
      <li>Kargo şirketi (yalnızca teslimat adresi)</li>
      <li>E-posta gönderim sağlayıcısı</li>
    </ul>

    <h2>4. Çerezler</h2>
    <p>
      Sitemiz; oturum yönetimi, sepet hatırlama ve anonim analitik için çerez kullanır.
      Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz, ancak bazı özellikler düzgün çalışmayabilir.
    </p>

    <h2>5. Veri Saklama</h2>
    <p>
      Hesap verilerinizi, hesap aktif olduğu sürece saklarız.
      Hesabınızı silmek isterseniz <a href="mailto:gizlilik@stencilstudio.com">gizlilik@stencilstudio.com</a> adresine e-posta gönderebilirsiniz; verileriniz 30 gün içinde silinir.
    </p>

    <h2>6. Haklarınız (KVKK)</h2>
    <p>6698 Sayılı Kanun kapsamında aşağıdaki haklara sahipsiniz:</p>
    <ul>
      <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
      <li>İşlenmişse buna ilişkin bilgi talep etme</li>
      <li>Eksik / yanlış işlenmişse düzeltilmesini isteme</li>
      <li>Silinmesini veya yok edilmesini isteme</li>
      <li>İşlemeye itiraz etme</li>
    </ul>

    <h2>7. İletişim</h2>
    <p>
      Gizlilik ile ilgili sorularınız için: <a href="mailto:gizlilik@stencilstudio.com">gizlilik@stencilstudio.com</a>
    </p>
  </LegalLayout>
);

export default PrivacyPolicy;
