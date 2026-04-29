## Sorun
Önceki turda tavus kuşunu sıfırdan SVG olarak çizdim — bu yüzden orijinal görseldeki amblemden farklı çıktı. Sen birebir aynı silüetin sadece tema rengine boyanmış halini istiyorsun.

## Çözüm

Orijinal görselden tavus kuşunu **piksel piksel ayıklayıp** (sarı zemin ve "Stencil Sepeti" yazısı kaldırıldı, kuyruk hem sarı banttaki hem siyah banttaki parçalardan birleştirildi) şeffaf arkaplanlı PNG'ye çevirdim. Sonuç: orijinalin **birebir aynısı** olan tek renkli silüet.

Önizleme yukarıda görüldüğü gibi orijinaldeki tavus kuşunun aynısı.

Bu PNG'yi **CSS mask** olarak kullanacağım — şekil orijinalin aynısı kalır, renk ise `bg-current` üzerinden parent'tan gelir (ör. `text-primary`). Avantajları:
- Şekil **birebir** orijinal görseldekiyle aynı
- Renk tema ile değişir (light/dark mode + Soft Organic teması)
- Tek varlık dosyası, küçük (~5KB)

## Yapılacaklar

### 1. `src/assets/peacock-emblem.png` (zaten oluşturuldu)
Orijinal görselden ayıklanmış, 4x ölçeklendirilmiş şeffaf silüet PNG.

### 2. `src/components/brand/PeacockLogo.tsx` — yeniden yaz
Önceki SVG çizimini sil, yerine mask-image yaklaşımı:
```tsx
<span
  className="inline-block bg-current"
  style={{
    WebkitMaskImage: `url(${emblemUrl})`,
    maskImage: `url(${emblemUrl})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  }}
/>
```
`bg-current` sayesinde parent'taki `text-primary` rengini alır.

### 3. Navbar & Footer — boyut ayarı
Tavus kuşu silüeti dik dikdörtgen (oran ~100×143) olduğu için `w-9 h-9` (kare) yerine yüksekliği baz alan ölçü kullanılmalı. Navbar'da `h-10 w-7`, Footer'da `h-12 w-9` gibi dikey-dengeli boyutlar veririm ki silüet sıkışmadan otursun.

## Sonrası
Uygulayacağım, ardından preview'da ekran görüntüsü alıp navbar/footer'da silüetin orijinaliyle aynı olduğunu ve tema rengini aldığını doğrulayacağım.
