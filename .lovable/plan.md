# Tuval Studio v2 — Yeni Mimari Önerisi

Mevcut `TuvalCanvas.tsx` tek dosyada ~hepsi bir arada büyüdü; motif seçimi, perspektif, fırça, ürün entegrasyonu, modlar tek state ağacında. Hedef: **modüler, geri alınabilir, sezgisel** bir stüdyo deneyimi — özellik kaybı olmadan.

---

## 1. Yeni UX Çerçevesi

```text
┌────────────────────────────────────────────────────────────────┐
│ TopBar:  [◀ Geri] [▶ İleri] · Proje Adı · [💾 Kaydet] [⤓ Dışa] │
├──────────┬──────────────────────────────────────────┬──────────┤
│          │                                          │          │
│  SOL     │            TUVAL (zoom/pan)              │   SAĞ    │
│  RAY     │                                          │  PANEL   │
│ (icons)  │     • boş alana tıkla → motif yerleşir   │ (bağlam) │
│          │     • motifi seç → handles görünür       │          │
│ Motif    │     • sürükle/döndür/ölçekle             │ Seçili   │
│ Ürün     │                                          │ öğenin   │
│ Renk     │                                          │ ayarları │
│ Zemin    │                                          │          │
│ Katman   │                                          │          │
│          │                                          │          │
├──────────┴──────────────────────────────────────────┴──────────┤
│ Alt çubuk: Mod [Tekli|Grid|Serbest] · Zoom · Yardım · Kısayol  │
└────────────────────────────────────────────────────────────────┘
```

**UX prensipleri**
- **Tek bağlam paneli**: Sağ panel her zaman *seçili öğenin* ayarlarını gösterir (motif yoksa zemin ayarları). Mod değiştirme ile UI değişmez.
- **Doğrudan manipülasyon**: Motifler tuvalde tıklanabilir/sürüklenebilir; gizli "perspektif modu" yerine handle ile döndürme/ölçek.
- **Sol ray ikon menüsü**: Discord/Figma tarzı — Motif, Ürün, Renk, Zemin, Katman. Açılır panel olarak çalışır.
- **Ürünler motif kütüphanesiyle birleşik**: "Üründen Ekle" ayrı buton değil; Ürün sekmesinden direkt sürükle-bırak.
- **Boş durum rehberi**: İlk açılışta tuvalde "Bir motif seç veya tıkla" hayalet yazısı.

---

## 2. Geri Al / İleri Al / Save (Yeni)

**Komut tabanlı history stack** (`useHistory` hook):

```text
state = { motifs[], surface, brush, viewport }
history = { past: State[], present: State, future: State[] }
```

- Her mutasyon → `dispatch({type, payload})` → yeni snapshot push
- `Cmd/Ctrl+Z` geri, `Cmd/Ctrl+Shift+Z` ileri
- Top bar'da görsel butonlar
- 50 adımlık limit (memory için)

**Save sistemi**
- **Otomatik taslak**: localStorage'a 2 sn debounce ile yazılır (`tuval:autosave`)
- **Manuel kaydet**: İsimli proje → `tuval:projects` listesi
- **Açılışta**: "Devam et?" toast → autosave varsa restore
- **Dışa aktar**: PNG (mevcut), JSON proje dosyası (yeni)

---

## 3. Dosya Yapısı (Refactor)

```text
src/components/tuval/
├── TuvalStudio.tsx           # ana shell (layout + provider)
├── store/
│   ├── TuvalContext.tsx      # state + dispatch + history
│   ├── reducer.ts            # tüm aksiyonlar (ADD_MOTIF, MOVE, ...)
│   ├── persistence.ts        # autosave + projects
│   └── types.ts
├── canvas/
│   ├── CanvasStage.tsx       # tuval render + interaksiyon
│   ├── MotifLayer.tsx        # tek motif (drag/rotate/scale handles)
│   ├── SurfaceLayer.tsx      # zemin (duvar/ahşap/beton)
│   └── useCanvasRender.ts    # mevcut alfa-mask render mantığı (taşınır)
├── panels/
│   ├── LeftRail.tsx          # ikon menüsü
│   ├── MotifPanel.tsx        # arama + thumbnails + upload
│   ├── ProductPanel.tsx      # ProductPicker mantığı (entegre)
│   ├── ColorPanel.tsx        # palet + hex
│   ├── SurfacePanel.tsx      # zemin seçimi
│   ├── LayersPanel.tsx       # z-order, görünürlük, kilit
│   └── InspectorPanel.tsx    # sağ panel, seçili öğe
├── topbar/
│   ├── TopBar.tsx            # undo/redo/save/export
│   └── ProjectMenu.tsx
└── bottombar/
    └── ModeSwitcher.tsx
```

**Korunan/taşınan**: Mevcut alfa-mask render mantığı (`renderColorTile`), motif kataloğu (`motifs.ts`), ProductPicker mantığı, perspektif transform, Grid/Tekli modları — hepsi modüllere bölünür ama davranış aynı.

---

## 4. Etkileşim Modları (sadeleştirme)

| Eski | Yeni |
|---|---|
| Tekli mod (manuel yerleştir) | **Serbest** — tıkla, ekle, sürükle |
| Grid mod (otomatik dolu) | **Grid** — desen olarak tüm yüzeyi kapla, ayar paneli grid yoğunluğu |
| Perspektif modu (gizli) | Seçili motifin Inspector panelinde "Perspektif" sekmesi |

---

## 5. Klavye Kısayolları (yeni)

- `V` seçim · `M` motif · `B` fırça · `G` grid mod
- `Cmd/Ctrl+Z/⇧Z` geri/ileri · `Cmd/Ctrl+S` kaydet
- `Delete` seçili motifi sil · `Cmd/Ctrl+D` çoğalt
- `Space+drag` tuvali kaydır · `Cmd+0` sığdır

---

## 6. Uygulama Aşamaları

1. **store/** kur (context + reducer + history) — saf state, UI yok
2. **TuvalStudio.tsx** shell + LeftRail + TopBar iskeleti
3. **CanvasStage**: mevcut render mantığını taşı, tıkla-ekle-seç davranışı ekle
4. **Panels**: Motif, Product, Color, Surface, Layers, Inspector — birer birer
5. **History + autosave + projects** entegrasyonu
6. **Klavye kısayolları + boş durum + onboarding tooltip**
7. `/tuval` route'u yeni `TuvalStudio`'ya bağla; eski `TuvalCanvas` korunur (`legacy=true` query ile fallback) — geri dönülebilir
8. Test: motif ekle/taşı/sil, undo/redo, kaydet/yükle, ürün → tuval, tema değişimi

---

## 7. Geri Dönülebilirlik Garantisi

- Eski `TuvalCanvas.tsx` **silinmez**, dosya kalır
- Yeni dosyalar `components/tuval/` altında — eski `components/hero/Tuval*` dokunulmaz
- `Tuval.tsx` route'u flag ile iki sürüm arası geçiş yapabilir (`?v=legacy`)
- Lovable history üzerinden tek tıkla bu mesaj öncesine dönülebilir

---

## 8. Riskler

- Render mantığını taşırken motif boyama bozulabilir → birim test yerine canlı QA gerekli
- History stack büyük canvas state'i tutar → snapshot'ta sadece motif metadata + viewport, render yeniden çalışır
- Autosave çakışması → versiyon damgası ile çözülür

---

Onaylarsan adım adım uygularım; istersen sadece belirli adımı (ör. yalnız undo/save) seçebilirsin.