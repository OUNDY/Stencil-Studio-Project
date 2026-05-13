# Tuval — Zenginleştirilmiş Zeminler + Perspektif Boyama Alanları

## Hedef

Şu anki Tuval'de zeminler düz gradient/SVG noise. Motifler tüm tuvale serbest yerleşiyor; gerçek bir duvarın eğik yüzeyine "uyguluyormuş" hissi yok. İki şey ekliyoruz:

1. **Zengin zemin görselleri** — gerçek duvar, ahşap, tuğla, beton fotoğrafları
2. **Perspektif Boyama Alanları (Zones)** — kullanıcı tuval üzerinde 4 köşeli dörtgenler çizer; her dörtgen bir "boyanacak yüzey"dir. Köşeler sürüklenebilir, böylece dörtgen perspektifte yamulur ve içine atılan motif/grid doğal olarak yüzeye uyar.

## Kullanıcı Akışı

1. Zemin sekmesinde gerçek görsel seçenekleri (duvar, tuğla, ahşap, beton, çıplak oda)
2. Sağ panelde **"+ Alan Ekle"** butonu → tuval ortasına yeni bir dikdörtgen düşer (4 köşe)
3. Köşeler sürüklenebilir → dörtgen istenen perspektife getirilir
4. Alan seçili iken: silme, kopyalama, opaklık, içine "Bu alana motif/grid uygula" toggle
5. Motifler hangi alana atanmışsa o alanın matrix3d perspektifinde render olur
6. Atama yapılmamış motifler eskisi gibi serbest

## Teknik Yaklaşım

### Yeni state alanları

```ts
interface PaintZone {
  id: string;
  name: string;
  // 4 köşe, sırasıyla: TL, TR, BR, BL — normalize (0..1) tuval koordinatı
  corners: [Pt, Pt, Pt, Pt];
  fillColor: string | null;   // alanı düz boya (opsiyonel)
  fillOpacity: number;
  useGrid: boolean;            // grid bu alanın içine clip-lenir mi
  visible: boolean;
}
type Pt = { x: number; y: number };

interface MotifInstance {
  ...
  zoneId?: string | null;     // null = serbest, "z-xxx" = belirli alana bağlı
}
```

### Perspektif matematiği

`matrix3d` ile 4-nokta homografisi:

- Kaynak: birim kare köşeleri `(0,0) (1,0) (1,1) (0,1)`
- Hedef: kullanıcının dörtgen köşeleri (tuval px cinsinden)
- 8 bilinmeyen → 8 lineer denklem → çözülen H matrisi → CSS `matrix3d(a,b,0,c, d,e,0,f, 0,0,1,0, g,h,0,1)` formuna dönüştürülür

`src/components/tuval/canvas/perspective.ts` küçük bir util:
```
getPerspectiveMatrix(srcQuad, dstQuad) → string ("matrix3d(...)")
```

### Render mantığı (CanvasStage)

Her zone için:
- `<div>` mutlak konumlu, üstten 0,0 — boyut = stage boyutu
- `transform: matrix3d(...)` zone'un perspektifini uygular
- `transform-origin: 0 0`
- İçinde:
  - opsiyonel düz fill katmanı
  - `useGrid` ise grid mask render (tile)
  - `motifs.filter(m => m.zoneId === zone.id)` — bu motifler zone'un kendi 0..1 uzayında konumlanır
- Üstüne SVG katman: 4 köşe handle (8x8 daireler), kenarlar (dashed), seçili ise primary renk

Köşe drag → corners[i] güncelle → matrix yeniden hesaplanır → tüm içerik canlı eğilir.

### UI değişiklikleri

- **Yeni panel**: `ZonesPanel.tsx` (LeftRail'e yeni "Alan" sekmesi). Liste: tüm alanlar; aksiyonlar: ekle, sil, kopyala, görünürlük.
- **InspectorPanel**: zone seçili iken → fill rengi, opaklık, gridi bu alana clipleme, "Perspektifi sıfırla" (dörtgeni dikdörtgene döndür)
- **Motif drag**: motif bir zone'un üzerine bırakılırsa otomatik `zoneId` atanır (faz 2 — şimdilik Inspector'dan dropdown ile manuel atama)

### Zenginleştirilmiş zeminler

`imagegen` ile 5 yüksek kaliteli görsel:
- `surface-wall.jpg` — kremsi ince dokulu duvar
- `surface-brick.jpg` — beyaz badana tuğla
- `surface-wood.jpg` — yıkanmış meşe lambri
- `surface-concrete.jpg` — mikro çimento
- `surface-room.jpg` — boş bir oda fotoğrafı (köşe + zemin görünür) — kullanıcı bu odanın üzerine perspektif alan çizip duvarı boyayabilir

`SurfacePanel`: 5 büyük thumbnail kart, hover'da yakınlaştırma.

## Geri dönülebilirlik

- Yeni dosyalar: `perspective.ts`, `ZonesPanel.tsx`, `ZoneOverlay.tsx`
- Mevcut dosyalar güvenle genişletilir; reducer'a `ADD_ZONE / UPDATE_ZONE / REMOVE_ZONE / SELECT_ZONE` action'ları
- History stack alan değişikliklerini de içerir → Cmd+Z geri alır
- `zoneId` opsiyonel → eski projeler bozulmaz (autosave migration güvenli)

## Dosya Listesi

**Yeni:**
- `src/components/tuval/canvas/perspective.ts` (matris util)
- `src/components/tuval/canvas/ZoneOverlay.tsx` (köşe handle UI)
- `src/components/tuval/panels/ZonesPanel.tsx`
- `src/assets/surfaces/wall.jpg`, `brick.jpg`, `wood.jpg`, `concrete.jpg`, `room.jpg`

**Düzenlenir:**
- `store/types.ts`, `store/reducer.ts`, `store/persistence.ts` (zone tipleri + actions)
- `canvas/CanvasStage.tsx` (zone render + matrix transform)
- `panels/SurfacePanel.tsx` (gerçek görseller)
- `panels/InspectorPanel.tsx` (zone seçili iken kontroller, motif için "Alan" dropdown)
- `panels/LeftRail.tsx` ("Alan" sekmesi)

## Kapsam Dışı (Faz 2)

- Motifin sürükle-bırak ile alana otomatik atanması
- Eğri/non-quad alanlar (yalnız 4 köşe)
- Görsel maskelerden otomatik alan algılama (AI segmentation)

## Onay

Onaylarsan tüm değişiklikleri tek seferde uygulayacağım. Sadece zenginleştirilmiş zeminleri istiyorsan ya da önce sadece zone sistemini istiyorsan, küçük parçalara bölerim.