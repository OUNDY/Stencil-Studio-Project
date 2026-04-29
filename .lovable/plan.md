## Hedef

Yüklenen Stencil Sepeti görselindeki **tavus kuşu amblemi**ni — yazı olmadan, sadece kuş figürü — siteye özgü "Soft Organic" estetiğine uyarlayıp mevcut "S" rozetinin yerine koymak.

## Yaklaşım

Görseldeki tavus kuşu sarı zemin üzerinde siyah silüet halinde, dekoratif kuyruk tüyleriyle stencil estetiğine birebir uygun. Bunu **PNG olarak değil, yeniden çizilmiş bir SVG** olarak ekleyeceğim — böylece:

- Tema rengiyle otomatik uyumlu olur (`currentColor` / `fill="hsl(var(--primary))"`)
- Karanlık/aydınlık modda doğru renklenir
- Ölçeklendirme kayıpsız (navbar 36px, footer 40px)
- Dosya boyutu küçük (~2-4 KB)

Görseldeki sarı/siyah blok ve "Stencil Sepeti" yazısı **kullanılmayacak** — sadece amblem (kuş silüeti). Site kimliği "Stencil Studio" olarak kalır.

## Yapılacaklar

### 1. Yeni bileşen: `src/components/brand/PeacockLogo.tsx`
- Tavus kuşu SVG'si: dik duruşlu gövde + taçlı baş + aşağı dökülen dekoratif kuyruk tüyleri (görseldeki kompozisyonun stilize hali)
- Props: `className`, `size` — `currentColor` kullanır, böylece parent `text-primary` veriyorsa primary olur
- Tek dosya, harici bağımlılık yok

### 2. Navbar güncellemesi (`src/components/navigation/Navbar.tsx`, satır 65-67)
Mevcut yuvarlak "S" rozeti yerine:
```
<div className="w-9 h-9 flex items-center justify-center text-primary">
  <PeacockLogo className="w-9 h-9" />
</div>
```
Arka plan dolgusu kaldırılır — amblem direkt görünür (görseldeki gibi sade silüet).

### 3. Footer güncellemesi (`src/components/sections/Footer.tsx`, satır 42-44)
Aynı şekilde "S" rozeti `<PeacockLogo />` ile değiştirilir, "Stencil Studio" yazısı kalır.

### 4. (Opsiyonel) Favicon
`index.html` favicon'u da yeni amblem PNG'siyle değiştirilebilir — onaylarsan yaparım, yoksa atlarım.

## Tasarım notları

- Renk: `hsl(var(--primary))` — Soft Organic temasında zaten markaya yakın bir ton
- Stil: ince konturlar yerine dolu silüet (görseldeki gibi), ama aşırı detay olmadan stencil mantığında sade
- Kuyruk tüyleri: 5-7 adet dekoratif "göz" motifi (tavus kuşu klasiği), simetrik

## Onay sonrası
İmplementasyonu yapacağım, ardından preview'da navbar + footer ekran görüntüsü alıp ambleminin tema renginde net göründüğünü doğrulayacağım.
