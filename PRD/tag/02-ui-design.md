## 2. UI Design Requirements

> Ditujukan untuk: **Claude Design / UI Designer**
> Copy/string UI: **Bahasa Inggris**
> Konvensi platform: lihat `TAG-Samurai/_foundation/prd-conventions.md`

---

### 2.1 Pages & Components

| Page / Component | Type | Akses dari |
|-----------------|------|-----------|
| All TAGs | Full page | Global Settings > TAG > All TAGs |
| Combine & Separate TAG | Full page | Global Settings > TAG > Combine & Separate TAG |
| Activate TAG | Full page | Global Settings > TAG > `[+ Activate TAG]` → Popup Ready to Activate → `[Continue]` — bulk staging, reuse pola Combine & Separate |
| Popup: Ready to Activate a TAG | Modal | Klik `[+ Activate TAG]` — muncul kalau belum pernah dismiss ("Don't show this again" belum dicentang), skip langsung ke halaman kalau sudah |
| Popup: How to Activate a TAG | Modal | Link "How to activate" di halaman Activate TAG |
| Popup: Event Log — Activate TAG | Modal | Icon "Event Log" (clock/history) di Toolbar page-level halaman Activate TAG |
| Popup: Activate TAG Detail | Modal | Row action di Event Log — Activate TAG |
| Popup: Audit TAG | Modal | Button "Audit TAG" di toolbar Not Paired |
| Popup: Event Log — Audit TAG | Modal | Icon "Event Log" (clock/history) di toolbar Not Paired |
| Popup: Event Log — Combine & Separate | Modal | Icon "Event Log" (clock/history) di toolbar Combine & Separate |
| Popup: Audit Detail | Modal | Row action di Event Log Audit TAG |
| Popup: Combined TAG (+N More) | Modal kecil | Klik icon link 🔗 di kolom Code (registry, §2.2 Tab All/Paired/Not Paired) — reuse pola `"+N More"` (`prd-conventions.md` §9.13) |

---

### 2.2 Layout & Wireframe Spec

#### Halaman: All TAGs

> **Breadcrumb — pola Statis** (§27.1 `prd-conventions.md`): `[Breadcrumb: TAG > All TAGs]` tetap sama di ketiga tab (All/Paired/Not Paired) — semua tab adalah filtered view dari registry TAG yang sama, bukan domain independen.

```
[Breadcrumb: TAG > All TAGs]
├── Page Title: "All TAGs"
└── Tabs: "All" | "Paired" | "Not Paired"
```

> **`[+ Activate TAG]` hanya di Tab All** — bukan page-level, bukan diulang di Tab Paired/Not Paired (lihat wireframe Tab All di bawah). TAG yang baru diaktivasi tetap kelihatan di tab lain setelah pindah tab (baris baru muncul sebagai Available), cuma tombol aktivasinya sendiri satu tempat saja.
>
> **Counter Cards tab-specific, bukan page-level** — Tab All pakai **License Counter Cards** (rasio aktif/total, §2.2 Tab All di bawah); Tab Not Paired pakai **Health Counter Cards** (breakdown Normal/Damaged+Missing, §2.2 Tab Not Paired di bawah); **Tab Paired tidak punya counter card** (rasio License sama persis dengan Tab All secara global, tidak spesifik ke Paired — akan cuma duplikasi angka yang sama, jadi tidak ditampilkan ulang di sini).

---

#### Tab: All

```
├── License Counter Cards [row horizontal, di atas toolbar — klik = filter, §2.4]:
│   ├── Card "RFID – Object TAG" — "[aktif] / [total]" — pool kuota terpisah dari User TAG
│   │         (satu-satunya TAG Type dengan split, `01-overview.md` §3.2/§4)
│   ├── Card "RFID – User TAG" — "[aktif] / [total]"
│   ├── Card "NFC"  — "[aktif] / [total]"
│   ├── Card "QR"   — "[paired] / [total Asset License]" — beda formula, `01-overview.md` §7.1
│   ├── Card "BLE"  — "[aktif] / [total]"
│   └── Card "GPS"  — "[aktif] / [total]"
│         (card aktif/selected: border + background beda, lihat §2.3 Component States. Klik
│         card "RFID – Object TAG"/"RFID – User TAG" = compound filter TAG Type=RFID **dan**
│         Type Object/User TAG sekaligus — beda dari 4 card lain yang cuma filter TAG Type)
│
├── TableTools Toolbar [right-aligned]
│   ├── Icon: Search → "Search code, device name..." — cakupan §9.1a prd-conventions.md: SEMUA
│   │     kolom kecuali tanggal — Code (RFID/NFC/QR Code, BLE Address, GPS IMEI sesuai TAG Type
│   │     baris), Device Name, SKU, Brand, Model/Type, TAG Type (icon, by accessibility label —
│   │     ketik "RFID" match baris ber-icon RFID), Source, Type, TAG Status. Last Scanned
│   │     **tidak** tercakup (tanggal, eksklusif ke Filter)
│   │     — **Konfirmasi eksplisit untuk TAG combined**: search per kolom TAG Type beroperasi
│   │     **per baris independen**, sama seperti Filter (§2.4 "Klik Counter Card") — ketik
│   │     "RFID" pada TAG combined RFID+NFC cuma match baris identifier RFID-nya, **tidak**
│   │     ikut menarik sibling baris NFC dari `tag_code` yang sama (yang tidak match kata
│   │     kunci "RFID" secara langsung). Ini **intended**, bukan gap — konsisten prinsip
│   │     "baris independen penuh, tanpa logika jaga-grup-utuh" yang sama dipakai di Filter
│   │     Counter Card (§7.1 `01-overview.md`)
│   ├── Icon: Search by Scan (di sebelah icon Search text) → pilih metode: Scan by RFID |
│   │     Scan by NFC | Scan by QR (`scan-foundation.md` §4.9 — BLE/GPS tidak termasuk, lihat
│   │     `01-overview.md` §7.1). Hasil: TAG match & ada di dataset Tab All aktif → baris
│   │     di-highlight/filter; TAG dikenali tapi tidak match filter aktif → empty state
│   │     generik; TAG tak dikenali → toast error (§8 `01-overview.md`)
│   ├── Icon: Filter → Filter Panel
│   │   ├── Dropdown: "Device Name" [multi-select, searchable] — daftar dari Device
│   │   │     Catalog (Admin Console), sama sumber dengan dropdown Device Name di
│   │   │     halaman Activate TAG (placeholder: "All device names")
│   │   ├── Dropdown: "Source" [multi-select] — Official | Self-Purchased
│   │   │     (placeholder: "All sources")
│   │   ├── Dropdown: "TAG Status" [multi-select] — Available | Paired | Reserved | To be
│   │   │     Returned | Damaged/Missing | Waiting for Approval | Retired (placeholder:
│   │   │     "All statuses")
│   │   └── Date picker: "Last Scanned" — placeholder: "Select date" (§9.8
│   │         prd-conventions.md — 1 field, data pada tanggal itu saja, bukan range)
│   │         (TAG Type **dan** Type **tidak** diulang di sini — keduanya sudah jadi 6 Card
│   │         di atas, §9.14-style "1 dimensi 1 kontrol filter"; Type khususnya cuma pernah
│   │         bervariasi untuk RFID — NFC/BLE/GPS selalu Object TAG, §3.2 — jadi split
│   │         card RFID sudah menutup kebutuhan filter Type sepenuhnya)
│   ├── Icon: Download → CSV / XLSX
│   │   └── Filename: "All-TAGs"
│   └── Button: "+ Activate TAG" [primary] — 🔒 + tooltip "Available on Growth plan or
│         above" jika plan Starter (§3.5 03-functional.md); Hidden untuk Read Only —
│         **hanya tampil di Tab All**, tidak diulang di Tab Paired/Not Paired
│
└── Table (1 baris = 1 identifier, bukan 1 baris = 1 tag_code — lihat `01-overview.md` §7.1)
    ├── Columns: TAG Type | Code | Device Name | SKU | Brand | Model/Type | Source | Type | TAG Status | Last Scanned | Actions
    │   ├── "Actions" (header `⋯`) — kolom kosong, tidak berisi konten; satu-satunya fungsinya
    │   │     adalah trigger panel Column Visibility (§9.3 prd-conventions.md — Column Visibility
    │   │     bukan icon toolbar, tapi klik header kolom Actions ini; Setup Column §2.7)
    │   ├── "TAG Type" — **icon tunggal**, teknologi baris ini (RFID/NFC/QR/BLE/GPS); sortable
    │   │     by accessibility label (`prd-conventions.md` §9.7)
    │   ├── "Code" — text kode identifier baris ini + **icon link 🔗 inline** (muncul hanya kalau
    │   │     baris ini bagian dari TAG combined) → klik icon → Popup "+N More" (§9.13
    │   │     prd-conventions.md) menampilkan sibling baris: TAG Type + Code + Device Name
    │   │     tiap pasangan
    │   ├── "Device Name" — nama device dari Device Catalog, selalu terisi (wajib di Activate
    │   │     TAG kedua jalur). QR: inherit dari sibling RFID/NFC kalau bagian combo, `—` kalau
    │   │     QR standalone
    │   ├── "SKU" — SKU yang match. Terisi untuk Official (selalu) **dan** Self-Purchased/BYO
    │   │     yang opsional pilih SKU saat Activate TAG — Self-Purchased **boleh** juga punya
    │   │     SKU, bukan eksklusif Official. `—` kalau BYO tanpa SKU sama sekali
    │   ├── "Brand" — kalau SKU terisi (Official atau BYO-dengan-SKU) → ikut data SKU (Device
    │   │     Catalog), read-only. Kalau SKU kosong (BYO murni) → dari `byo_brand` manual saat
    │   │     Activate TAG. Praktis selalu terisi kecuali QR standalone
    │   ├── "Model/Type" — sama pola sumber dengan Brand (ikut SKU kalau ada, atau
    │   │     `byo_model_type` manual kalau BYO tanpa SKU) — tapi **genuinely opsional**: `—`
    │   │     valid juga untuk baris Official/BYO-dengan-SKU kalau Device Catalog tidak punya
    │   │     nilai model untuk SKU itu, atau `byo_model_type` tidak diisi (opsional di form)
    │   ├── Source badge (baru, 2026-07-15): "Official" [biru] jika Jalur A (match `tag_units`
    │   │     existing) — "Self-Purchased" [kuning] jika Jalur B/BYO. Derived, bukan input manual;
    │   │     `—` untuk QR (tidak melalui Activate TAG, §5 01-overview.md)
    │   ├── TAG Status badge:
    │   │   ├── "Available" [hijau]
    │   │   ├── "Paired" [biru]
    │   │   ├── "Reserved" [kuning]
    │   │   ├── "To be Returned" [kuning]
    │   │   ├── "Damaged/Missing" [merah]
    │   │   ├── "Waiting for Approval" [kuning] — Jalur B collision; read-only, tidak ada aksi
    │   │   │     klik — review dilakukan di Admin Console, tidak bisa diakses dari sini (§5.1
    │   │   │     01-overview.md)
    │   │   └── "Retired" [hitam]
    │   └── Kalau TAG combined (mis. RFID+NFC): tampil sebagai 2 baris independen penuh — Source/
    │         Type/TAG Status/Last Scanned diulang di kedua baris (sama persis nilainya, bukan
    │         rowspan/cell-merge)
    └── Tidak ada row action — kolom Actions cuma trigger Column Visibility, read-only selebihnya
```

**Example Data — Tab All (mencakup semua kombinasi kondisi):**

| TAG Type | Code | Device Name | SKU | Brand | Model/Type | Source | Type | TAG Status | Kondisi yang Didemokan |
|----------|------|-------------|-----|-------|------------|--------|------|-----------|------------------------|
| RFID | RF-001 🔗 | Zebra Tag | SKU-001 | Zebra | ZT-200 | Official [biru] | Object TAG | Paired [biru] | Baris 1/2 dari TAG combined RFID+NFC; Jalur A; sudah dipasangkan ke aset |
| NFC | NF-001 🔗 | Zebra Tag | SKU-001 | Zebra | ZT-200 | Official [biru] | Object TAG | Paired [biru] | Baris 2/2 — sibling baris di atas, klik 🔗 di baris manapun buka popup keduanya |
| RFID | RF-002 | Zebra Tag | SKU-001 | Zebra | ZT-200 | Official [biru] | Object TAG | Available [hijau] | RFID standalone; Jalur A; belum dipasangkan, siap pakai |
| NFC | NF-002 | Acme Tag | — | Acme Corp | — | Self-Purchased [kuning] | Object TAG | Reserved [kuning] | NFC standalone; Jalur B/BYO tanpa SKU sama sekali — SKU & Model/Type `—`, Brand dari `byo_brand` manual; NFC selalu Object TAG, tidak ada pilihan Type (§3.2) |
| RFID | RF-007 | Acme Card | — | Acme Corp | — | Self-Purchased [kuning] | User TAG | Reserved [kuning] | RFID standalone; Jalur B/BYO tanpa SKU; Type dipilih manual sebagai User TAG saat aktivasi (§3.2 — satu-satunya TAG Type dengan pilihan ini) |
| RFID | RF-003 | Zebra Tag | SKU-001 | Zebra | ZT-200 | Official [biru] | Object TAG | To be Returned [kuning] | Pending pengembalian dari user |
| RFID | RF-004 | Acme Tag | — | Acme Corp | — | Self-Purchased [kuning] | Object TAG | Damaged/Missing [merah] | TAG rusak; diaktivasi mandiri BYO |
| NFC | NF-003 | Zebra Tag | SKU-002 | Zebra | ZT-210 | Official [biru] | Object TAG | Damaged/Missing [merah] | TAG hilang; dipasangkan ke Group (Supply) — tetap ber-Type Object TAG (§3.2) |
| QR | QR-003 | Zebra Tag | SKU-001 | Zebra | ZT-200 | Official [biru] | Object TAG | Retired [hitam] | Baris ke-3 dari combo RFID+NFC+QR yang sama dengan RF-005/NF-004 (contoh 3-identifier); Device Name/SKU/Brand/Model/Type inherit dari sibling RFID (QR tidak punya kolom device sendiri) |
| RFID | RF-006 | Acme Tag | — | Acme Corp | — | Self-Purchased [kuning] | — | Waiting for Approval [kuning] | Jalur B collision — menunggu review Principal, belum bisa dipakai; read-only, tidak ada aksi klik (§5.1) |
| RFID | RF-008 | TrackPro Tag | SKU-005 | TrackPro | TP-Lite | Self-Purchased [kuning] | Object TAG | Available [hijau] | RFID standalone; Jalur B/BYO **dengan** SKU dipilih opsional saat Activate TAG — SKU/Brand/Model/Type ikut data SKU meski Source tetap Self-Purchased (bukan match `tag_units` resmi, §5.1) — buktinya SKU **boleh** terisi walau Source Self-Purchased |

**Example Data — BLE/GPS (selalu standalone, tidak pernah muncul icon link 🔗 — §3.1 `01-overview.md`):**

| TAG Type | Code | Device Name | SKU | Brand | Model/Type | Source | Type | TAG Status | Kondisi yang Didemokan |
|----------|------|-------------|-----|-------|------------|--------|------|-----------|------------------------|
| BLE | A1:B2:C3:D4:E5:F6 | Tracker One | SKU-BLE-01 | TrackTech | TT-B1 | Official [biru] | Object TAG | Available [hijau] | BLE tracker; Jalur A; belum dipasangkan |
| GPS | 356938035643809 | GeoTrack | — | Acme Corp | — | Self-Purchased [kuning] | Object TAG | Available [hijau] | GPS tracker; Jalur B/BYO tanpa SKU; belum dipasangkan; SKU & Model/Type `—`, Brand dari `byo_brand` manual |

> Baris `Waiting for Approval` tidak punya `Type` (kategori penggunaan belum ditentukan sampai approved). Icon link 🔗 di kolom Code **cuma** muncul untuk baris RFID/NFC/QR yang combined — BLE/GPS tidak pernah punya sibling karena tidak combinable (§3.1 `01-overview.md`).

---

#### Tab: Paired

```
├── TableTools Toolbar [right-aligned]
│   ├── Icon: Search → "Search code, device name..." — cakupan §9.1a prd-conventions.md: SEMUA
│   │     kolom kecuali tanggal — Code, Device Name, SKU, Brand, Model/Type, TAG Type (icon, by
│   │     accessibility label), Source, Type. Last Scanned **tidak** tercakup (tanggal,
│   │     eksklusif ke Filter)
│   ├── Icon: Search by Scan (di sebelah icon Search text, sama komponen §2.2 Tab All) →
│   │     pilih metode: Scan by RFID | Scan by NFC | Scan by QR (`scan-foundation.md` §4.9 —
│   │     BLE/GPS tidak termasuk). RFID/NFC 🔒 + tooltip "Available on Growth plan or above"
│   │     jika plan Starter; Scan by QR selalu aktif. Hasil di-scope ke dataset Tab Paired —
│   │     TAG match & Paired → baris di-highlight/filter; TAG dikenali tapi tidak Paired →
│   │     empty state generik; TAG tak dikenali → toast error (§8 `01-overview.md`)
│   ├── Icon: Filter → Filter Panel
│   │   ├── Dropdown: "TAG Type" [multi-select] — RFID | NFC | QR | BLE | GPS (placeholder:
│   │   │     "All types") — **tetap ada di sini**, beda dari Tab All/Not Paired (Tab Paired
│   │   │     tidak punya Counter Card, §2.2 "Halaman: All TAGs", jadi TAG Type filter tidak
│   │   │     ada penggantinya di tab ini)
│   │   ├── Dropdown: "Type" [multi-select] — Object TAG | User TAG (placeholder: "All types")
│   │   │     — **dropdown terpisah dari "TAG Type"** (koreksi 2026-08-04 — sebelumnya digabung
│   │   │     jadi opsi "RFID – Object TAG"/"RFID – User TAG" di dalam dropdown TAG Type,
│   │   │     mengikuti pola split Card di Tab All/Not Paired; sekarang 2 dropdown independen,
│   │   │     konsisten dengan kolom "Type" yang memang kolom tersendiri di tabel, §7.2). **Cuma
│   │   │     bermakna untuk baris RFID** — satu-satunya TAG Type dengan Type bervariasi (§3.2
│   │   │     `01-overview.md`); NFC/QR/BLE/GPS selalu Object TAG, jadi filter "Object TAG" tetap
│   │   │     menampilkan baris non-RFID apa adanya (semuanya match), sedangkan filter
│   │   │     "User TAG" cuma pernah menghasilkan baris RFID
│   │   ├── Dropdown: "Device Name" [multi-select, searchable] — sama sumber §2.2 Tab All
│   │   ├── Dropdown: "Source" [multi-select] — Official | Self-Purchased
│   │   └── Date picker: "Last Scanned" — placeholder: "Select date" (§9.8 prd-conventions.md)
│   └── Icon: Download → Filename: "Paired-TAGs"
│
└── Table (1 baris = 1 identifier, sama struktur §2.2 Tab All)
    ├── Columns: TAG Type | Code | Device Name | SKU | Brand | Model/Type | Source | Type | Last Scanned | Actions
    │   └── "Actions" (header `⋯`) — kolom kosong, trigger Column Visibility (§9.3
    │         prd-conventions.md), sama pola §2.2 Tab All; Setup Column §2.7
    └── Tidak ada row action — kolom Actions cuma trigger Column Visibility, read-only selebihnya
```

**Example Data — Tab Paired:**

| TAG Type | Code | Device Name | SKU | Brand | Model/Type | Source | Type | Kondisi yang Didemokan |
|----------|------|-------------|-----|-------|------------|--------|------|------------------------|
| RFID | RF-001 🔗 | Zebra Tag | SKU-001 | Zebra | ZT-200 | Official [biru] | Object TAG | Baris 1/2 combined RFID+NFC, sudah Paired |
| NFC | NF-001 🔗 | Zebra Tag | SKU-001 | Zebra | ZT-200 | Official [biru] | Object TAG | Baris 2/2 — sibling baris di atas |
| NFC | NF-002 | Acme Tag | — | Acme Corp | — | Self-Purchased [kuning] | Object TAG | Standalone, BYO tanpa SKU |
| BLE | A1:B2:C3:D4:E5:F6 | Tracker One | SKU-BLE-01 | TrackTech | TT-B1 | Official [biru] | Object TAG | Standalone, tidak pernah combined |

> Tab Paired tidak menampilkan kolom TAG Status (semua baris = Paired). Kolom Code tetap punya icon link 🔗 untuk baris combined, popup sibling sama seperti §2.2.

---

#### Tab: Not Paired

```
├── Health Counter Cards [row horizontal, di atas toolbar — klik = filter, level card, §2.4]:
│   ├── Card "RFID – Object TAG" — ✓ [normal]   ✕ [damaged+missing] — dipecah dari RFID,
│   │     konsisten Tab All (§2.2 di atas), satu-satunya TAG Type dengan split Object/User
│   ├── Card "RFID – User TAG"  — ✓ [normal]   ✕ [damaged+missing]
│   ├── Card "NFC"  — ✓ [normal]   ✕ [damaged+missing]
│   ├── Card "QR"   — ✓ [normal]   ✕ [damaged+missing]  (jarang terisi — QR cuma muncul di sini
│   │     kalau bagian dari TAG combined, `01-overview.md` §7.1)
│   ├── Card "BLE"  — ✓ [normal]   ✕ [damaged+missing]
│   └── Card "GPS"  — ✓ [normal]   ✕ [damaged+missing]
│         (✓ = Available+Reserved+To be Returned; ✕ = Damaged+Missing digabung; Retired
│         tidak dihitung di kartu manapun, `01-overview.md` §7.3; card aktif/selected: border +
│         background beda, §2.3; klik card = filter TAG Type itu (bukan per-angka) — untuk 2
│         card RFID, filter-nya compound TAG Type=RFID **dan** Type Object/User TAG sekaligus)
│
├── TableTools Toolbar [right-aligned]
│   ├── Icon: Search → "Search code, device name..." — cakupan §9.1a prd-conventions.md: SEMUA
│   │     kolom kecuali tanggal — Code, Device Name, SKU, Brand, Model/Type, TAG Type (icon, by
│   │     accessibility label), Source, Type, Status. Last Scanned **tidak** tercakup (tanggal,
│   │     eksklusif ke Filter)
│   ├── Icon: Search by Scan (di sebelah icon Search text, sama komponen §2.2 Tab All) →
│   │     pilih metode: Scan by RFID | Scan by NFC | Scan by QR (`scan-foundation.md` §4.9 —
│   │     BLE/GPS tidak termasuk). Read-only lookup — **beda** dari `[Audit TAG]` di bawah
│   │     (aksi tulis, mengubah status). RFID/NFC 🔒 + tooltip "Available on Growth plan or
│   │     above" jika plan Starter; Scan by QR selalu aktif. Hasil di-scope ke dataset Tab
│   │     Not Paired — TAG match & Not Paired → baris di-highlight/filter; TAG dikenali tapi
│   │     tidak Not Paired (mis. sudah Paired) → empty state generik; TAG tak dikenali →
│   │     toast error (§8 `01-overview.md`)
│   ├── Icon: Filter → Filter Panel
│   │   ├── Dropdown: "Device Name" [multi-select, searchable] — sama sumber §2.2 Tab All
│   │   ├── Dropdown: "Source" [multi-select] — Official | Self-Purchased
│   │   ├── Dropdown: "Status" [multi-select] — Available | Reserved | To be Returned |
│   │   │     Damaged/Missing | Waiting for Approval | Retired
│   │   └── Date picker: "Last Scanned" — placeholder: "Select date" (§9.8 prd-conventions.md)
│   │         (TAG Type **dan** Type tidak diulang — keduanya sudah jadi 6 Card di atas,
│   │         sama alasan §2.2 Tab All)
│   ├── Icon: Download → Filename: "Not-Paired-TAGs"
│   ├── Icon: Event Log (clock/history) → Popup Event Log Audit TAG
│   └── Button: [Audit TAG] — 🔒 + tooltip "Available on Growth plan or above" jika plan Starter (Audit TAG menawarkan Scan by RFID/NFC/BLE — tidak ada opsi QR maupun GPS, GPS tidak punya mekanisme re-scan, §3.5 03-functional.md — lihat popup di bawah)
│
└── Table (1 baris = 1 identifier, sama struktur §2.2 Tab All)
    ├── Columns: TAG Type | Code | Device Name | SKU | Brand | Model/Type | Source | Type | Status | Last Scanned | Actions
    │   ├── Status badge: Available [hijau] | Reserved [kuning] | To be Returned [kuning] | Damaged/Missing [merah] | Waiting for Approval [kuning] | Retired [hitam]
    │   └── "Actions" (header `⋯`) — kolom kosong, trigger Column Visibility (§9.3
    │         prd-conventions.md), sama pola §2.2 Tab All; Setup Column §2.7
    └── Tidak ada row action sama sekali, termasuk baris `Waiting for Approval` — kolom Actions cuma trigger Column Visibility; review approval dilakukan di Admin Console, tidak bisa diakses dari sini
```

**Example Data — Tab Not Paired:**

| TAG Type | Code | Device Name | SKU | Brand | Model/Type | Source | Type | Status | Kondisi yang Didemokan |
|----------|------|-------------|-----|-------|------------|--------|------|--------|------------------------|
| RFID | RF-002 | Zebra Tag | SKU-001 | Zebra | ZT-200 | Official [biru] | Object TAG | Available [hijau] | Belum dipasangkan, siap pakai |
| RFID | RF-003 | Zebra Tag | SKU-001 | Zebra | ZT-200 | Official [biru] | Object TAG | To be Returned [kuning] | Pending pengembalian dari user |
| NFC | NF-003 | Zebra Tag | SKU-002 | Zebra | ZT-210 | Official [biru] | Object TAG | Damaged/Missing [merah] | Dilaporkan hilang |
| RFID | RF-006 | Acme Tag | — | Acme Corp | — | Self-Purchased [kuning] | — | Waiting for Approval [kuning] | Jalur B collision, read-only |
| QR | QR-003 | Zebra Tag | SKU-001 | Zebra | ZT-200 | Official [biru] | Object TAG | Retired [hitam] | TAG sudah tidak dipakai lagi |

---

#### Popup: Combined TAG (+N More)

> Muncul di ketiga tab registry (All/Paired/Not Paired) — trigger: klik icon link 🔗 di kolom Code pada baris manapun yang merupakan bagian dari TAG combined (2-3 identifier, RFID/NFC/QR — §3.1 `01-overview.md`). Reuse pola popup `"+N More"` yang sudah ada di platform (`prd-conventions.md` §9.13, dipakai juga di Reader Group/Port Group/Connected Tablet modul Hardware) — bukan komponen baru.

```
├── Title: "Combined TAG" — icon [X] di pojok kanan atas header, klik = tutup popup
├── List — 1 baris per identifier dalam combo yang sama (termasuk baris yang barusan diklik):
│   ├── TAG Type icon + Code + Device Name (format sama seperti kolom tabel utama —
│   │     popup ini kompak, cuma tampilkan Device Name untuk identifikasi cepat, SKU/
│   │     Brand/Model/Type tidak diulang di sini, lihat detail lengkap di tabel utama)
│   └── Baris yang sedang aktif/diklik ditandai subtle highlight (bukan dihilangkan dari list)
└── (tidak ada footer — cuma [X] di header sebagai satu-satunya cara tutup)
```

- Read-only — tidak ada aksi apa pun di dalam popup ini (registry tetap read-only, §1.4)
- Data source: baris-baris yang sudah ter-load di tabel (sama `tag_code`, di-filter client-side dari response yang sudah ada) — **tidak perlu endpoint baru** (`04-data.md` §4.6)

---

#### Popup: Ready to Activate a TAG

```
├── Title: "Ready to Activate a TAG"
├── Content: ringkasan langkah aktivasi (pilih Device Name → SKU opsional → scan identifier)
├── Checkbox: "Don't show this again"
└── Footer: [Cancel] [Continue]
```

> "Don't show this again": jika dicentang, popup ini tidak muncul lagi untuk aktivasi berikutnya (preferensi per user, bukan per client — tersimpan di cache browser, sama pola Setup Column §2.7, bukan field di database). Klik `[+ Activate TAG]` selanjutnya langsung masuk ke halaman Activate TAG tanpa popup ini.

---

#### Halaman: Activate TAG

> **Bulk staging, deferred submit** — reuse pola persis Halaman: Combine & Separate TAG (di atas): pilih config sesi → scan berkali-kali ke tabel → resolve baris bermasalah → Submit sekali. Lihat §5.1 `01-overview.md` untuk alur & alasan lengkap.

```
[Breadcrumb: TAG > All TAGs > Activate TAG] — 3 segmen karena dijangkau via tombol
    `[+ Activate TAG]` dari halaman All TAGs (§2.2 di atas), bukan menu tersendiri
├── Page Title: "Activate TAG"
├── Toolbar [right-aligned]: Icon: Event Log (clock/history) → Popup Event Log — Activate TAG
│         (sama pola page-level Combine & Separate §7.6 — **bukan** bagian dari "Toolbar
│         tabel" di bawah, jadi berlaku sama untuk RFID/NFC/BLE maupun GPS meski GPS tidak
│         punya "Toolbar tabel" itu sendiri)
├── Link: "How to activate a TAG" → Popup How to Activate a TAG
├── Field: "TAG Type"* [Radio: RFID | NFC | BLE | GPS] — session-level
│   └── helper text (dinamis, ganti tiap radio dipilih):
│         ├── **NFC/BLE/GPS** — 1 pool quota per tipe, langsung tampil: "[remaining] of
│         │     [total] [Type] TAG licenses remaining." — angka dari sumber sama dgn License
│         │     Counter Card (`nfcActive`/`nfcLicense` dst., `04-data.md` §GET
│         │     /tags/license-counter — remaining = license − active). `[remaining] = 0` →
│         │     teks tetap tampil apa adanya (bukan disembunyikan), warna teks merah — **dan**
│         │     `[Scan TAG]` (RFID/NFC/BLE)/Upload File+Manual Entry `[+ Add]` (GPS) **disabled**,
│         │     tooltip 🔖 "No quota available for this TAG Type. Contact your administrator or
│         │     request more allocation." (koreksi 2026-08-04 — sebelumnya cuma informational,
│         │     tombol tetap enabled; §5.1 `01-overview.md`)
│         └── **RFID** — quota **belum bisa difiksasi di sini**, karena RFID satu-satunya
│               tipe dengan 2 pool terpisah (Object TAG/User TAG, mirror `hardware-allocation`
│               — §3.2 `01-overview.md`) dan baris Official (match) di tabel staging bisa
│               menarik dari pool mana pun tergantung SKU yang ke-match per baris — tidak ada
│               satu angka tunggal yang valid di level sesi. Tampil teks netral tanpa angka:
│               "RFID licenses are split by Object TAG and User TAG — remaining quota shown
│               per SKU match, or below once you select a Type for self-purchased TAGs." —
│               `[Scan TAG]` **disabled** (tooltip sama seperti di atas) **hanya kalau kedua**
│               pool (Object TAG **dan** User TAG) sudah 0 sekaligus — kalau salah satu masih
│               ada sisa, `[Scan TAG]` tetap enabled seperti biasa (§5.1 `01-overview.md`)
│
├── Collapsible: "+ Add self-purchased template" (collapsed default)
│   ├── **Disabled selama TAG Type belum dipilih** — tooltip 🔖 "Select a TAG Type first."
│   │         (Device Name di dalamnya butuh kategori TAG Type untuk filter Device Catalog)
│   ├── Description (tampil di bawah label, terlepas expanded/collapsed): "If some of your TAGs
│   │         aren't part of your distributor's registered stock, add their details here once —
│   │         it'll be applied automatically to every unmatched TAG you scan in this session,
│   │         so you don't have to fill it in per TAG."
│   └── [Expanded — link berubah jadi "− Remove template"]:
│       ├── Field: "Device Name"* [Dropdown searchable — Device Catalog, kategori sesuai TAG Type]
│       │   └── placeholder: "Search and select device name..."
│       ├── Field: "SKU" [Dropdown searchable, opsional]
│       │   └── placeholder: "Search and select SKU (optional)..."
│       │   └── helper text: "Leave empty if this is a self-purchased TAG with no matching SKU."
│       │   └── Icon `[✕]` (clear) muncul di dalam field, di sebelah panah dropdown, **hanya
│       │           saat SKU terisi** — klik → SKU kembali kosong (lihat efeknya di bawah)
│       ├── Field: "Brand"* [Text input — "Enter brand"] — **selalu tampil**, terlepas SKU
│       │           terisi atau tidak:
│       │       ├── SKU terisi → **auto-filled** dari data SKU (Device Catalog) + **disabled**
│       │       │         (read-only, bukan input manual)
│       │       └── SKU kosong → **editable**, wajib diisi
│       ├── Field: "Model" [Text input, opsional — "Enter model (optional)"] — **selalu
│       │           tampil**, perilaku sama seperti Brand (disabled + auto-filled saat SKU
│       │           terisi; editable & opsional saat SKU kosong)
│       ├── [Khusus TAG Type = RFID] Field: "Type" [Radio: Object TAG | User TAG] — **selalu
│       │           tampil** untuk RFID (satu-satunya TAG Type dengan 2 kategori penggunaan
│       │           bernilai bisnis beda, mirror `hardware-allocation` §3.2 `01-overview.md`;
│       │           NFC/BLE/GPS tidak punya field ini sama sekali):
│       │       ├── SKU terisi → **auto-filled** dari `sku.is_user_tag` + **disabled**
│       │       └── SKU kosong → **editable**, wajib dipilih
│       │     └── helper text kuota (muncul begitu Type diketahui — baik auto-filled dari
│       │           SKU maupun radio dipilih manual; sebelum itu kosong):
│       │           "[remaining] of [total] RFID – [Object TAG/User TAG] licenses remaining."
│       │           — inilah titik kuota RFID **baru fix**/bisa ditampilkan angkanya (beda pool
│       │           quota per pilihan, bukan angka sesi generik di field TAG Type atas).
│       │           `[remaining] = 0` → teks tetap tampil, warna merah
│       ├── **Clear SKU** — klik `[✕]` di field SKU → SKU kembali ke placeholder kosong;
│       │           Brand/Model/Type (RFID) yang tadinya auto-filled+disabled **balik jadi
│       │           editable & ter-reset kosong** (bukan restore nilai lama sebelum SKU
│       │           dipilih — mencegah data derived SKU lama nyangkut diam-diam tanpa
│       │           disadari user)
│       └── **Locked state** (`byo_activation_enabled=false` untuk Client ini): seluruh
│                 section disabled + tooltip 🔖 "Self-purchased activation is not enabled
│                 for your account. Contact your administrator." — collapsible tidak bisa
│                 di-expand sama sekali
│   └── **Template tidak retroaktif** — cuma berlaku sebagai default untuk baris yang
│             **dibuat setelah** Template terisi (scan/entry berikutnya), bukan live binding
│             yang otomatis menyorongkan perubahan ke baris yang sudah ada: baris "Needs
│             Info" yang sudah ada **tidak** otomatis ke-resolve begitu Template diisi
│             belakangan (tetap "Needs Info" sampai diresolve manual via `[Resolve]`, atau
│             di-Remove lalu discan ulang — scan ulang otomatis re-check ke Template
│             terbaru karena `template` dikirim tiap panggilan `/tags/activate/check`,
│             `04-data.md` §4.6); baris "Self-Purchased" yang sudah dibuat dari Template
│             juga **tidak** ikut berubah kalau Template diedit belakangan (nilai baris =
│             snapshot saat dibuat, update via `[Edit]` per baris). Konsisten prinsip
│             "perubahan setting tidak menulis ulang data yang sudah ada" di modul lain
│             (mis. General Settings — ganti format tidak mengonversi data lama)
│             **Pengecualian sempit — khusus field Type (RFID)**: guard kuota (bukan
│             identitas) memang retroaktif untuk baris yang tertunda murni karena Type
│             belum diketahui — pool RFID genuinely tidak bisa divalidasi tanpa Type,
│             beda dari kenyamanan UX Template pada umumnya di atas. Field identitas
│             lain (Device Name/SKU/Brand/Model) **tetap** tidak retroaktif seperti
│             biasa — cuma guard kuota RFID yang dikecualikan (§3.2 `01-overview.md`,
│             `03-functional.md` §3.2 [F-TAG-10])
│
├── Toolbar tabel — **[RFID/NFC/BLE] saja**, cuma 2 elemen [Remove]/[Scan TAG] (icon Event
│         Log ada di **Toolbar page-level** di atas, bukan di sini — lihat catatan di bawah
│         Page Title); **[GPS] tidak punya toolbar tabel ini sama sekali**, seluruh area ini
│         (termasuk [Scan TAG]/[Remove]/"Total Scanned") digantikan oleh section Upload
│         File/Manual Entry yang inline langsung di halaman — lihat "Halaman: Activate TAG —
│         GPS (Import/Manual Entry)" di bawah untuk layout lengkapnya, tidak ada tombol yang
│         perlu diklik dulu untuk memulai:
│   ├── [Remove] → **scan-based** (sama pola Combine & Separate §7.6 — **bukan** pilih baris
│   │       manual/checkbox): klik → langsung masuk sesi scan mode Remove (tanpa overlay
│   │       pilih metode — TAG Type sudah terkunci session-level) → identifier ter-scan
│   │       dicocokkan ke Code baris staging → baris yang match dihapus (kalau ada).
│   │       Memastikan baris yang terhapus akurat sesuai fisik TAG di tangan, bukan salah
│   │       pilih baris mirip di tabel panjang
│   └── [Scan TAG] → **langsung masuk scan** mode Add (tanpa overlay pilih metode — TAG
│         Type sudah terkunci session-level di field paling atas, jadi cuma ada 1 metode
│         yang valid). Metode capture mengikuti TAG Type terpilih, lihat detail di bawah
│         → Shared Scan Component, mode Multi/Batch (`scan-foundation.md` §4.3) → live
│         counter + toast "Scanning..." sampai [Stop]
│
├── "Total Scanned: [N]" — **[RFID/NFC/BLE] saja**. Plain text line (bukan card/badge),
│         posisi tetap **di antara Toolbar tabel dan Table** seperti tergambar di tree ini —
│         sama pola posisi dengan "Total Combined TAGs" di Combine & Separate (§7.6), cuma
│         urutan relatif toolbar/counter kebalik: di sana counter mendahului toolbar (§7.6),
│         di sini counter mengikuti toolbar — karena angkanya baru berarti setelah ada hasil
│         scan. **[GPS]** tidak punya baris ini di posisi yang sama (GPS tidak punya Toolbar
│         tabel di atas) — lihat "Total Entries: [N]" di wireframe GPS (di bawah, section
│         "Halaman: Activate TAG — GPS") untuk posisi layout GPS-nya sendiri, sumber dari
│         Upload/Manual Entry yang lolos Preview, bukan hasil scan
│
├── Table (tumbuh per scan, real-time match-check tiap baris):
│   ├── Columns: Checkbox | TAG Type (icon) | Code | Status (badge) | Device Name | SKU |
│   │     Brand | Model/Type | Actions — split 4 kolom Device (bukan 1 kolom "Device"
│   │     gabungan), konsisten tabel registry (§2.2 Tab All) — field-nya memang sudah
│   │     dikumpulkan terpisah di Self-Purchased Template/resolve per baris (Device
│   │     Name/SKU/Brand/Model/Type), jadi staging table menampilkannya apa adanya
│   │     tanpa perlu digabung jadi teks. **Kolom Checkbox** (ditambahkan 2026-08-04,
│   │     Bulk Resolve) — cuma terisi untuk baris berbadge "Needs Info", kosong/tidak
│   │     ada checkbox untuk badge lain (lihat "Bulk Resolve Mode" di bawah)
│   ├── Status badge:
│   │     ├── "Official" [biru] — match `tag_units`; Device Name/SKU/Brand/Model/Type
│   │     │     kolom auto-terisi
│   │     ├── "Self-Purchased" [kuning] — dari Template, atau hasil resolve per baris
│   │     ├── "Needs Info" [yellow] — tidak match, Template kosong; Device Name/SKU/Brand/
│   │     │     Model/Type kolom kosong
│   │     └── "Error" [merah] — tidak match & BYO disabled, ATAU license limit; tooltip 🔖
│   │           alasan spesifik
│   ├── **Identifier match TAG yang sudah aktif di client ini sendiri** — **tidak dapat
│   │       badge/baris sama sekali**, langsung toast error real-time `"Error, TAG is
│   │       already activated."`, sesi scan tidak berhenti (beda dari 4 badge di atas —
│   │       lihat §5.1 `01-overview.md`)
│   ├── Row action (dynamic per Status, ikon di kolom Actions — **bukan** klik area baris,
│   │       konsisten `prd-conventions.md` §9.2 "klik area baris di luar row action = tidak
│   │       melakukan apapun"):
│   │     ├── "Official" — tidak ada row action (data ikut match, tidak ada yang bisa diedit)
│   │     ├── "Self-Purchased" → **[Edit]** → baris ini masuk **mode edit di dalam tabel**
│   │     │     (bukan Dialog/popup) — lihat "Row Edit Mode" di bawah, mirror pola Import
│   │     │     (`Global-Settings/PRD/import/02-ui-design.md` State C4)
│   │     ├── "Needs Info" → **[Resolve]** → baris ini masuk mode edit yang sama (kosong,
│   │     │     bukan pre-filled) — sama mekanisme dengan `[Edit]`, cuma beda titik awal
│   │     └── "Error" — tidak ada row action selain Remove (§7.6/GPS di bawah); tidak bisa
│   │           diresolve, cuma bisa dihapus
│   └── **[GPS]** tambahan: **[Remove]** row action selalu ada di semua status (icon
│         terpisah di kolom Actions yang sama) — klik langsung hapus baris itu, satu-satunya
│         cara Remove untuk GPS (RFID/NFC/BLE tetap scan-based lewat toolbar, tidak berubah).
│         Baris GPS bisa punya 2 row action sekaligus (mis. Self-Purchased GPS → `[Edit]`
│         + `[Remove]`) — **kecuali** selama Row Edit Mode aktif, lihat di bawah
│
└── Footer: [Cancel] [Submit] — berubah jadi [Cancel] [Save] selama Row Edit Mode aktif
      (lihat di bawah)
      ├── [Submit] disabled selama ada baris "Needs Info" — tooltip 🔖:
      │     "Resolve or remove all incomplete rows before submitting."
      ├── Cancel → Dialog Cancel Activate TAG (kalau tabel ada data)
      └── Submit → **Langkah 0**: pre-check kuota agregat (fresh, per kategori) —
            kurang di ≥1 kategori → Dialog "Insufficient Quota" (lihat di bawah),
            Submit batal total, tidak ada baris commit. Cukup → lanjut proses per
            baris server-side, hasil ditampilkan inline (lihat "Setelah [Submit]"
            di bawah) — TIDAK ada Dialog konfirmasi terpisah untuk kasus sukses
            (beda dari Combine/Separate yang punya Dialog Submit) karena hasil per
            baris sudah cukup jadi konfirmasi visual
```

**Example Data — Staging Table (contoh sesi Activate TAG, TAG Type = RFID):**

| Code | Status | Device Name | SKU | Brand | Model/Type | Kondisi yang Didemokan |
|------|--------|-------------|-----|-------|------------|------------------------|
| RF-101 | Official [biru] | Zebra Tag | SKU-001 | Zebra | ZT-200 | Match `tag_units`, auto-terisi |
| RF-102 | Self-Purchased [kuning] | Acme Tag | — | Acme Corp | — | Dari Template BYO, Type=Object TAG |
| RF-103 | Needs Info [yellow] | — | — | — | — | Tidak match, Template kosong — `[Resolve]` |
| RF-104 | Error [merah] | — | — | — | — | License limit RFID – Object TAG tercapai |

**Row Actions — Staging Table Activate TAG (§23 `prd-conventions.md`; RFID/NFC/BLE/GPS):**

| Condition | Aksi | Icon | Severity |
|-----------|------|------|----------|
| Official | — (tidak ada row action) | — | — |
| Self-Purchased | Edit | `Edit2Line` | dark |
| Needs Info | Resolve | `Edit2Line` | dark |
| Error | Remove | `DeleteBin6Line` | danger |
| GPS (semua status) | Remove (tambahan, selalu ada) | `DeleteBin6Line` | danger |

**Row Edit Mode** (trigger: row action `[Resolve]` atau `[Edit]` — mirror persis pola Import "State C4: Edit — single row", `import/02-ui-design.md`)

```
├── Baris yang dipilih berubah jadi mode edit — sel Device Name/SKU/Brand/Model/Type
│     (dan Type khusus RFID) jadi input aktif langsung di baris itu (dropdown/text/radio
│     sesuai field, field-set & perilaku identik Self-Purchased Template): kosong untuk
│     `[Resolve]` (Needs Info), pre-filled untuk `[Edit]` (Self-Purchased) — baris lain
│     tetap read-only
├── Kolom Actions **hilang dari SELURUH tabel** selama sesi ini aktif (bukan cuma
│     baris yang diedit) — tidak ada baris lain yang bisa mulai sesi edit/Remove
│     bersamaan, sama pola Import
├── Toolbar tabel **disabled** selama sesi aktif: [Scan TAG]/[Remove] (RFID/NFC/BLE)
│     atau Upload File/Manual Entry (GPS) — tooltip 🔖 "Finish editing this row first."
│     (mencegah baris baru masuk staging/state berubah di tengah sesi edit)
├── Footer [Cancel] [Submit] berubah jadi **[Cancel] [Save]**
└── Klik [Save] → validasi baris ini (required-field, sama rule dengan Template):
      ├── Gagal → [Save] **blocked**, sesi tetap terbuka, field yang gagal dapat
      │     border merah + tooltip 🔖 alasan — user perbaiki lalu klik [Save] lagi
      └── Lolos → baris tersimpan, badge → "Self-Purchased", sesi tertutup, kolom
            Actions & toolbar kembali normal, footer balik [Cancel] [Submit]
```

**Bulk Resolve Mode** (ditambahkan 2026-08-04 — menutup gap UX "resolve satu-satu serial" untuk sesi dengan banyak baris "Needs Info" beridentitas sama, mis. banyak device BYO dari brand yang sama; trigger: centang ≥1 checkbox baris "Needs Info" → `[Resolve Selected]` di bulk action bar)

```
├── Checkbox column — **cuma muncul di baris berbadge "Needs Info"** (kosong/tidak ada
│     checkbox untuk Official/Self-Purchased/Error, badge lain tidak butuh bulk resolve)
├── ≥1 baris Needs Info dicentang → bulk action bar muncul di atas tabel:
│     "[N] selected" + tombol `[Resolve Selected]`
├── Klik `[Resolve Selected]` → panel inline (bukan Dialog/popup) muncul di atas tabel —
│     field-set identik Row Edit Mode/Self-Purchased Template: Device Name*/SKU/Brand*/
│     Model/Type (dan Type khusus RFID), **diisi sekali** untuk seluruh baris terpilih
├── Kolom Actions & checkbox **hilang dari SELURUH tabel** selama panel terbuka; toolbar
│     tabel **disabled** (`[Scan TAG]`/`[Remove]` RFID/NFC/BLE, Upload File/Manual Entry
│     GPS) — tooltip 🔖 "Finish editing these rows first." (sama prinsip Row Edit Mode,
│     mencegah baris baru/state berubah di tengah sesi resolve; juga mutually exclusive
│     dengan Row Edit Mode single-row — cuma 1 sesi edit aktif dalam satu waktu)
├── Panel footer: `[Cancel]` `[Apply to N rows]`
└── Klik `[Apply to N rows]` → validasi (required-field, sama rule Template):
      ├── Gagal → **blocked**, panel tetap terbuka, field gagal dapat border merah +
      │     tooltip 🔖 alasan
      └── Lolos → **semua N baris terpilih** ter-update sekaligus: badge → "Self-Purchased"
            [kuning], kolom Device Name/SKU/Brand/Model/Type terisi nilai yang sama
            (snapshot, bukan live binding — bisa dikoreksi individual lewat `[Edit]`
            sesudahnya seperti baris Self-Purchased lain) — panel tertutup, checkbox &
            bulk action bar hilang, kolom Actions & toolbar kembali normal
```

**Dialog: Cancel Bulk Resolve** (klik `[Cancel]` di panel Bulk Resolve — mirror persis Dialog Cancel Edit di bawah, cuma beda scope N baris bukan 1 baris)
```
├── Title: "Cancel Edit"
├── Body: "Changes will not be saved."
└── Footer: [Go Back] [Continue]
    ├── Go Back → tutup dialog, kembali ke panel Bulk Resolve (input tetap ada, belum di-Apply)
    └── Continue → input dibuang, checkbox seleksi tetap tercentang (baris masih Needs
          Info) — panel tertutup, kolom Actions & toolbar kembali normal
```
> Cuma muncul kalau ≥1 field sempat diisi di panel sebelum klik `[Cancel]` — kalau panel masih kosong, `[Cancel]` langsung menutup tanpa dialog (sama pola Dialog Cancel Edit single-row).

**Dialog: Cancel Edit** (klik `[Cancel]` selama Row Edit Mode aktif — mirror nama & pola persis Import)
```
├── Title: "Cancel Edit"
├── Body: "Changes will not be saved."
└── Footer: [Go Back] [Continue]
    ├── Go Back → tutup dialog, kembali ke Row Edit Mode (perubahan tetap ada, belum disimpan)
    └── Continue → perubahan dibuang, baris kembali ke value semula (kosong untuk baris
          yang tadinya Needs Info, atau value lama untuk baris Self-Purchased) — sesi
          tertutup, kolom Actions & toolbar kembali normal, footer balik [Cancel] [Submit]
```
> Cuma muncul kalau field sempat diisi/diubah dari value awal sebelum klik `[Cancel]` — kalau belum ada perubahan sama sekali, `[Cancel]` langsung menutup sesi tanpa dialog (baris Needs Info kembali kosong seperti semula, tidak ada yang hilang).
>
> **Definisi "value awal" & "perubahan" (koreksi 2026-08-04, menutup ambiguitas):** "value awal" = snapshot nilai field **persis saat Row Edit Mode dimulai** (klik `[Resolve]`/`[Edit]`) — kosong semua untuk baris Needs Info, atau nilai pre-filled saat itu (dari Template/resolve sebelumnya) untuk baris Self-Purchased. "Perubahan" = **field manapun** yang nilainya saat ini **berbeda** dari snapshot itu — termasuk mengosongkan field yang tadinya terisi. Jadi kalau `[Edit]` diklik pada baris Self-Purchased ber-Brand terisi (dari Template), lalu Brand dikosongkan, lalu `[Cancel]` diklik → dialog **tetap muncul** (state saat ini ≠ snapshot awal), walaupun tampilan field-nya sekarang menyerupai baris Needs Info kosong — perbandingannya selalu ke snapshot-awal-sesi-ini, bukan ke "apakah field kosong sekarang".

> **Field & perilaku di Row Edit Mode identik Self-Purchased Template** (§ di atas) — Device
> Name* (dropdown searchable Device Catalog), SKU (dropdown opsional, icon `[✕]` clear),
> Brand* (auto-filled+disabled kalau SKU terisi, editable+wajib kalau kosong), Model
> (opsional, perilaku sama Brand), dan khusus RFID field Type (Radio Object TAG/User TAG,
> auto-filled+disabled dari `sku.is_user_tag` kalau SKU terisi, editable+wajib kalau kosong,
> helper text kuota muncul begitu Type diketahui) — cuma di-scope ke baris ini, bukan
> session-level default seperti Template.

**Metode capture — mengikuti TAG Type terpilih, tanpa overlay picker (berlaku sama untuk
`[Scan TAG]` mode Add maupun `[Remove]` mode Remove, RFID/NFC/BLE — cuma beda tujuan
hasil scan: Add = masuk tabel, Remove = cari & hapus baris match):**
```
├── TAG Type = RFID → langsung Scan by RFID
├── TAG Type = NFC → langsung Scan by NFC
├── TAG Type = BLE → langsung Scan/Pair by BLE (radio Bluetooth native web via reader
│     tersambung/Synced, `scan-foundation.md` §2/§4.5) — **tidak ada fallback manual entry**,
│     MAC Address tidak dirancang untuk diketik manusia (`scan-foundation.md` §4.8). Reader
│     belum Synced → Sync Panel auto-open (§4.5.4 `scan-foundation.md`), bukan mulai sesi scan
│     └── Toast "Scanning..." → "Validating..."
│           └── [Stop Scan] di toast → sesi scan berhenti, baris yang sudah masuk tabel tetap ada
└── TAG Type = GPS → **bukan scan sama sekali** — lihat wireframe terpisah di bawah,
      "Halaman: Activate TAG — GPS (Import/Manual Entry)"
```

**Halaman: Activate TAG — GPS (Import/Manual Entry):**

> Registrasi TAG GPS **tidak pernah** lewat live scan (`scan-foundation.md` §4.8/§5.6 —
> identifier IMEI diregister murni via Import/Manual, di luar scope Shared Scan Component).
> Section Upload File/Manual Entry/Preview di bawah **menggantikan seluruh baris "Toolbar
> tabel" dan "Total Scanned: [N]"** pada layout umum di atas (bukan cuma tombol [Scan TAG]
> saja) — inline langsung tampil di halaman, tidak di balik tombol apa pun. Field
> session-level (TAG Type, Self-Purchased Template) tetap sama, begitu juga **Table
> staging utama** di bawahnya (Columns: TAG Type/Code/Status/Device Name/SKU/Brand/
> Model/Type/Actions, §7.8 atas) & Footer — hanya baris Preview yang sudah lolos yang
> diteruskan masuk ke Table staging itu (lihat alur di bawah).
> Pola identik `Admin-Console/PRD/tag-stock/02-ui-design.md` §4b, diadopsi di sini.

```
├── **Kuota GPS = 0 sejak awal sesi (koreksi 2026-08-04)** — Dropzone Upload File dan
│     field/`[+ Add]` Manual Entry **disabled**, tooltip 🔖 "No quota available for this
│     TAG Type. Contact your administrator or request more allocation." (§5.1
│     `01-overview.md`, sama pola dengan `[Scan TAG]` RFID/NFC/BLE) — dicek begitu
│     halaman GPS ini dimuat (TAG Type=GPS sudah terkunci dari radio session-level)
├── Input: Upload File
│     ├── Link: "Download template" — CSV dengan header `IMEI`
│     └── Dropzone: "Drag & drop file here, or [Browse]" — Accepted: .csv, .xlsx · Column: IMEI
│
│           — or —
│
├── Input: Manual Entry
│     └── Field: "IMEI" [Text input] [+ Add] — ketik satu per satu, enter/klik [+ Add]
│           menambah baris ke Preview
│
├── Preview (bukan murni client-side — lihat catatan di bawah):
│     ├── Columns: # | IMEI | Status
│     ├── Status: "OK" [hijau] · "Waiting for Approval" [kuning] · "Duplicate in File"
│     │     [kuning] · "Invalid Format" [merah]
│     ├── **2 pengecekan pertama murni client-side, instan, tanpa server call**: format
│     │     (15 digit numerik → lolos, selain itu "Invalid Format", tidak lanjut) dan
│     │     duplikat-dalam-batch (dicek dalam batch Preview ini saja, bukan match ke
│     │     database — kemunculan pertama lanjut ke pengecekan berikutnya; kemunculan
│     │     kedua dst. → "Duplicate in File", tidak lanjut)
│     ├── **Status "OK"/"Waiting for Approval" — hasil server call, bukan client-side**
│     │     (koreksi 2026-08-04, sebelumnya keliru dilabeli "client-side" di atas): begitu
│     │     1 entri lolos 2 pengecekan client-side di atas, entri itu **langsung** (per-IMEI,
│     │     bukan batch, bukan ditunda sampai `[Add to List]`) memanggil endpoint real-time
│     │     match-check yang **sama persis** dengan yang dipakai alur scan RFID/NFC/BLE
│     │     (`/tags/activate/check`, §5.1 `01-overview.md`) — match ke `tag_units` aktif
│     │     milik client/entitas lain (collision) → "Waiting for Approval"; tidak collision →
│     │     "OK". **Satu panggilan ini dipakai ulang, bukan dipanggil kedua kalinya** saat
│     │     entri diteruskan ke Table utama via `[Add to List]` (lihat catatan di bawah
│     │     Example Data) — respons yang sama yang menentukan badge OK/Waiting for Approval
│     │     di Preview **juga** membawa data match Official/Self-Purchased/Needs Info/Error
│     │     yang dipakai begitu entri masuk Table
│     └── Summary: "[A] valid, [B] waiting approval, [C] duplicate, [D] invalid of [N] entries"
│           — **scoped ke batch Preview saat ini saja**, reset tiap kali Upload File/Manual
│           Entry baru dijalankan (beda dari "Total Entries: [N]" di bawah yang akumulatif)
│
└── "Total Entries: [N]" — plain text line, posisi **setelah** blok Upload File/Manual
      Entry/Preview di atas dan **sebelum** Table utama (GPS tidak punya Toolbar tabel,
      jadi urutannya: Upload/Manual Entry/Preview → Total Entries → Table, beda dari
      RFID/NFC/BLE yang urutannya Toolbar tabel → Total Scanned → Table). **Beda dari
      Summary di Preview** (baris di atas) — Summary scoped ke batch saat ini saja
      (reset per-batch), "Total Entries" menghitung **akumulasi baris yang sudah masuk
      Table utama** dari sesi ini (bertambah terus lintas beberapa kali Upload/Manual
      Entry, tidak pernah reset sampai halaman ditinggalkan/Submit)
```

**Example Data — Preview (GPS Import/Manual Entry):**

| # | IMEI | Status | Kondisi yang Didemokan |
|---|------|--------|------------------------|
| 1 | 356938035643809 | OK [hijau] | Format valid, belum match `tag_units` lain di database |
| 2 | 356938035643810 | Waiting for Approval [kuning] | Match `tag_code` lain, collision Jalur B |
| 3 | 356938035643809 | Duplicate in File [kuning] | Kemunculan kedua IMEI baris #1 dalam batch ini |
| 4 | 12345 | Invalid Format [merah] | Bukan 15 digit numerik |

- Baris Preview berstatus **OK**/**Waiting for Approval** diteruskan ke Table utama (§ di atas) memakai **hasil real-time match-check yang sama** yang sudah dipanggil saat entri lolos Preview (bukan panggilan kedua) — badge di Table jadi "Official"/"Self-Purchased"/"Needs Info"/"Error" sesuai match `tag_units` dari respons itu, identik alur RFID/NFC/BLE (`01-overview.md` §5.1). Baris yang di Preview berstatus "Waiting for Approval" tetap membawa badge itu ke Table (bukan di-reclasifikasi jadi salah satu dari 4 badge lain) — collision tetap collision, konsisten alur RFID/NFC/BLE yang juga tidak pernah "downgrade" status Waiting for Approval jadi badge lain.
- Baris **"Duplicate in File"**/**"Invalid Format"** berhenti di Preview — tidak pernah masuk Table utama, tidak ikut `[Submit]`.
- `[+ Add]` (Manual Entry) dan file ter-upload bisa dipakai bergantian dalam sesi yang sama — semua entri terkumpul di satu Preview yang sama sebelum lanjut ke Table.

**Setelah [Submit] — hasil per baris (lihat §5.1, §8, §9 `01-overview.md` untuk copy & kondisi lengkap):**
```
├── Halaman TIDAK redirect/tutup — badge Status tiap baris update in-place:
│     ├── "Activated" [hijau] — Available; baris jadi read-only
│     ├── "Waiting for Approval" [kuning] — collision baru ketahuan saat commit (race);
│     │     read-only, tidak ada aksi klik — review dilakukan di Admin Console
│     └── "Failed" [merah] + tooltip alasan (mis. "This identifier has already been
│           activated." — race saat commit, closed list 2 kemungkinan §"Popup: Activate
│           TAG Detail") — baris tetap editable: [Remove] lalu scan ulang, atau ditinggal
└── Toast ringkasan, gabung sesuai kategori yang muncul: "Success, [N] TAGs have been activated."
      (+ ", [M] pending approval" dan/atau ", [K] failed" kalau ada)
```

**Dialog: Insufficient Quota** (klik `[Submit]`, pre-check agregat sebelum commit apa pun dimulai)
```
├── Title: "Insufficient Quota"
├── Body: "You don't have enough license quota to activate all the TAGs in this
│     session. Remove some rows, or wait for more quota to be allocated, then try
│     again."
│     └── Breakdown per kategori yang kurang (1 baris per kategori, cuma yang kurang
│           yang ditampilkan): "[Category]: need [N], only [M] available" — mis.
│           "RFID – Object TAG: need 12, only 8 available"
└── Footer: [OK]
    └── Klik → dialog tutup; angka kuota di halaman (License Counter Card, helper
          text TAG Type) refresh; tabel staging TIDAK berubah — user pilih sendiri
          baris mana yang di-`[Remove]` untuk muat kuota, lalu klik `[Submit]` lagi
```
> Dialog Blok (`prd-conventions.md` §7) — `[Submit]` tetap enabled (bukan disabled proaktif, karena kuota bisa berubah tepat sebelum klik), dialog ini muncul reaktif tiap kali pre-check mendeteksi kekurangan. Tidak ada baris yang commit maupun ter-Remove otomatis saat dialog ini muncul — murni informasi, aksi lanjutan (Remove) tetap manual oleh user.

**Dialog: Cancel Activate TAG**
```
├── Title: "Cancel Activate TAG"
├── Body: "Progress will not be saved."
└── Footer: [Go Back] [Continue]
    ├── Go Back → tutup dialog, kembali ke halaman (data tabel tetap)
    └── Continue → keluar dari halaman (baris yang sudah "Activated"/"Waiting for Approval"
          TETAP tersimpan permanen — cuma baris yang belum di-Submit yang hilang)
```

> Dialog yang sama juga muncul saat: ganti TAG Type saat tabel sudah berisi data, klik Breadcrumb, atau klik Back browser (sama pola Combine & Separate).

---

#### Popup: How to Activate a TAG

```
├── Title: "How to Activate a TAG"
├── Content:
│   ├── "Scan your TAGs — we'll automatically match them against your distributor's
│   │     registered stock. Matched TAGs are marked Official."
│   ├── "If a TAG doesn't match, you'll need to provide its details manually. Add a
│   │     self-purchased template beforehand if you're activating several such TAGs at
│   │     once — it'll be applied automatically. Otherwise, you can fill in the details
│   │     for each unmatched TAG individually."
│   └── "Either way, activation still counts against your license quota for that TAG
│         type (RFID, NFC, BLE, or GPS)."
└── [Close]
```

---

#### Popup: Event Log — Activate TAG

> Trigger: icon Event Log (clock/history) di Toolbar page-level halaman Activate TAG (§ di atas) — berlaku sama untuk sesi RFID/NFC/BLE maupun GPS. Satu baris = satu sesi `[Submit]` (mirror pola Event Log Audit TAG/Combine & Separate — satu baris per sesi, bukan per TAG individual).

```
├── Title: "Event Log: Activate TAG"
├── TableTools
│   ├── Icon: Search → "Search modified by..."
│   ├── Icon: Filter → Filter Panel
│   │   ├── Dropdown: "TAG Type" [multi-select] — RFID | NFC | BLE | GPS (placeholder:
│   │   │     "All types") — **keempat tipe muncul** (beda dari Event Log Audit TAG yang
│   │   │     cuma RFID/NFC/BLE) karena Activate TAG mencakup GPS juga, §5.1 `01-overview.md`
│   │   ├── Date picker: "Date" — placeholder: "Select date" (§9.8 prd-conventions.md)
│   │   └── Dropdown: "Modified By" [single-select] (placeholder: "All admins")
│   └── Icon: Download
├── Table: Date | TAG Type | Total TAG Submitted | Modified By | Actions
│   ├── "TAG Type" — **badge teks** (RFID/NFC/BLE/GPS), bukan icon — baris log ini tidak
│   │     didampingi kolom Code (beda dari tabel identifier utama yang icon-nya legible karena
│   │     ada Code di sebelahnya), jadi badge teks lebih terbaca sebagai satu-satunya penanda
│   │     tipe di baris; Activate TAG session-level tetap cuma 1 TAG Type per sesi (§5.1
│   │     `01-overview.md`), jadi selalu 1 badge
│   ├── "Total TAG Submitted" — jumlah baris yang di-submit dalam sesi ini (baris "Error"
│   │     yang auto-excluded sebelum Submit **tidak** dihitung — bukan bagian dari sesi
│   │     yang tercatat). Breakdown Activated/Waiting for Approval/Failed ada di Detail
│   └── Row Action: [Detail] → Popup Activate TAG Detail
└── [Close]
```

**Row Actions (§23 `prd-conventions.md`):**

| Aksi | Icon | Severity |
|------|------|----------|
| `Detail` | `FileInfoLine` | dark |

---

#### Popup: Activate TAG Detail

```
├── Title: "Activate TAG Detail"
├── Section: "Activated" — tabel TAG Type (icon) | Code | Device Name
├── Section: "Waiting for Approval" — tabel TAG Type (icon) | Code | Device Name
└── Section: "Failed" — tabel TAG Type (icon) | Code | Device Name | Reason
```

- Ketiga section selalu ditampilkan (konsisten pola Popup Audit Detail, §2.2 di atas) — section tanpa baris tampil kosong, bukan disembunyikan.
- "Reason" (khusus section Failed) — alasan kegagalan per baris, sama copy dengan tooltip badge "Failed" di halaman Activate TAG — **closed list, cuma 2 kemungkinan** (keduanya race di jendela sempit antara real-time-check dan commit final, genuinely per-baris — beda dari kuota yang all-or-nothing dan tidak pernah muncul di sini, §8 `01-overview.md`):
  - `"This identifier has already been activated."` — identifier keburu diaktivasi via sesi lain (tab/user berbeda)
  - `"Self-purchased device activation is not enabled for your account."` — `byo_activation_enabled` berubah `false` di antara real-time-check dan Submit (jarang)
- Read-only — tidak ada aksi apa pun di popup ini, sama pola Popup Audit Detail.

---

#### Popup: Audit TAG

```
├── Title: "Audit TAG"
│
├── Field: "TAG Type"* [Checkbox multi-select: RFID | NFC | BLE] — GPS & QR tidak ada opsi
│   │     (GPS tidak punya mekanisme re-scan, §3.5 03-functional.md; QR tidak pernah masuk
│   │     pool Not Paired Audit)
│   └── **Locked (semua checkbox disabled) begitu Found ≥ 1** (scan pertama sudah masuk) —
│         cuma bisa diganti selama Found masih 0. Toggle checkbox bebas selama itu; Not Found
│         reaktif ikut berubah tiap toggle (union dari tipe yang dicentang)
│
├── Counter section:
│   ├── "Found: [N]" [chip / badge hijau]
│   └── "Not Found: [N]" [chip / badge merah]
│       └── Default begitu ≥1 TAG Type dicentang: Not Found = total TAG di Not Paired
│             bertipe yang dicentang (union, bukan selalu RFID+NFC+BLE sekaligus). 0 TAG
│             Type dicentang → tabel kosong, Found/Not Found = 0/0
│
├── Table:
│   ├── Columns: TAG Type (icon) | Code | Actions
│   ├── "Actions" (header `⋯`) — kolom kosong, trigger Column Visibility (§9.3 prd-conventions.md,
│   │     Setup Column §2.7)
│   └── Baris bergerak dari Not Found → Found saat TAG terscan
│         **Tidak ada row action pada baris Found maupun Not Found** (koreksi 2026-08-04,
│         menutup ambiguitas) — sengaja **tanpa** mekanisme "undo" per baris. Satu-satunya
│         cara membatalkan scan yang salah masuk Found adalah `[Cancel]` (Dialog Cancel TAG
│         Audit) dan mulai sesi baru dari awal — bukan gap, keputusan disengaja supaya tidak
│         ada aksi manual granular di tabel Audit ini
│
├── Footer:
│   ├── [Cancel] → Dialog Cancel TAG Audit
│   ├── [Audit TAG] (belum ada scan) | [Continue Audit] (sudah ada scan) — disabled kalau
│   │     0 TAG Type dicentang
│   │   └── Klik →
│   │       ├── **1 TAG Type dicentang** → langsung masuk scan tipe itu, skip overlay
│   │       └── **>1 TAG Type dicentang** → Overlay pilih metode scan, opsi **cuma yang
│   │             dicentang** (mis. cuma RFID+NFC dicentang → overlay cuma tampil "Scan by
│   │             RFID"/"Scan by NFC", BLE tidak muncul meski secara umum didukung):
│   │             Scan by RFID | Scan by NFC | Scan/Pair by BLE
│   │   └── Toast: "Scanning..." → "Validating..."
│   │       └── [Stop Scan] → Dialog Scan Stopped
│   └── [Submit] → Dialog Submit Confirmation
```

**Example Data — Popup Audit TAG** (TAG Type dicentang: RFID + NFC, 1 TAG sudah terscan):

| TAG Type | Code | Kondisi yang Didemokan |
|----------|------|------------------------|
| RFID | RF-002 | Found — sudah terscan, pindah dari Not Found |
| RFID | RF-003 | Not Found — masih menunggu scan |
| NFC | NF-003 | Not Found — masih menunggu scan |

---

#### Dialog: Submit Confirmation — Audit TAG

```
Varian 1 — Semua ditemukan:
├── Title: "Submit Audit TAG"
├── Body: "All TAGs have been found."
└── Footer: [Cancel] [Submit]

Varian 2 — Ada Available yang tidak ditemukan:
├── Title: "Submit Audit TAG"
├── Body: "[F] TAG(s) confirmed Available.
│     [N] TAG(s) were not found and will be marked as Damaged/Missing."
│     — **[F] = Found** (counter "Found: [N]" §7.4) — di Varian 2 murni tidak ada
│       Damaged/Missing yang ikut ditemukan (itu Varian 3/4), jadi seluruh Found di
│       sini tetap Available/Reserved/To be Returned tanpa perubahan status, aman
│       ditampilkan apa adanya tanpa breakdown per tipe (bukan hasil aksi apa pun,
│       cuma konfirmasi — breakdown di bawah cuma untuk [N] yang berubah status)
│     — **1 TAG Type dicentang di sesi ini DAN tidak ada baris combined** → body [N]
│       cukup begini, tanpa breakdown (redundant — total = angka tipe itu sendiri)
│     — **Selain itu** (≥2 TAG Type dicentang, ATAU ada baris combined walau cuma 1
│       tipe dicentang) → breakdown tampil di bawah body, **1 baris per kelompok**:
│         RFID: [n1] tags                ← standalone (bukan bagian combined set)
│         NFC: [n2] tags                 ← standalone
│         RFID & QR: [n3] tags           ← combined set; sisi RFID yang di-scan
│                                            saat Audit, sisi QR (di luar scope Audit,
│                                            §1.4) ikut berubah status otomatis krn
│                                            berbagi `tag_code`/status yang sama
│         NFC & QR: [n4] tags            ← idem, sisi NFC yang di-scan
│         RFID & NFC & QR: [n5] tags     ← idem
│         RFID & NFC: [n6] tags          ← combined set tanpa QR; **kedua** sisi
│                                            auditable — cukup salah satu discan,
│                                            sisi lain ikut Found otomatis (§3.5
│                                            `03-functional.md`), digabung 1 baris
│                                            (bukan dipecah "RFID: n" + "NFC: n")
│       (baris standalone cuma tampil untuk tipe yang dicentang di sesi dan count > 0;
│       baris combined tampil kalau ada TAG combined yang match, terlepas kombinasi
│       itu semua sisinya dicentang atau cuma sebagian — QR selalu ikut walau tidak
│       pernah dicentang, karena bukan opsi Audit sama sekali)
├── Checkbox: "Mark not found [Type] TAGs as Damaged/Missing" [default: checked]
│     — [Type] = daftar TAG Type yang dicentang di popup Audit TAG (§7.4), digabung:
│       1 tipe → "RFID"; 2 tipe → "RFID and NFC"; 3 tipe → "RFID, NFC, and BLE"
└── Footer: [Cancel] [Submit]

Varian 3 — Ada Damaged/Missing yang ditemukan:
├── Title: "Submit Audit TAG"
├── Body: "[M] TAG(s) will be restored to Available."
│     — **[M] = subset Found yang sebelumnya berstatus Damaged/Missing**, BUKAN total
│       counter "Found" di popup §7.4 — TAG yang Found tapi sebelumnya sudah
│       Available/Reserved/To be Returned statusnya tidak berubah, jadi tidak masuk
│       hitungan restore ini
│     — Breakdown sama pola & sama pemisahan standalone/combined seperti Varian 2:
│         RFID: [n1] tags
│         BLE: [n2] tags
│         RFID & QR: [n3] tags
└── Footer: [Cancel] [Submit]

Varian 4 — Kedua kondisi:
├── Body: baris "[F] TAG(s) confirmed Available." tanpa breakdown (sama definisi
│     Varian 2) diikuti gabungan Varian 2 + Varian 3, breakdown masing-masing
│     independen (kondisi breakdown-nya sendiri-sendiri — bisa saja Not Found
│     breakdown muncul tapi restored tidak, atau sebaliknya, tergantung berapa TAG
│     Type/kombinasi yang punya count di masing-masing kelompok):
│       "[F] TAG(s) confirmed Available.
│       [N] TAG(s) were not found and will be marked as Damaged/Missing.
│         RFID: [n1] tags
│         RFID & QR: [n2] tags
│       [M] TAG(s) will be restored to Available.
│         NFC: [n3] tags
│         RFID & NFC: [n4] tags"
│     — **[F] = Found − [M]** (bukan Found mentah) — mengisolasi subset yang tetap
│       Available/Reserved/To be Returned tanpa perubahan status, supaya tidak
│       tumpang tindih dengan [M] yang sudah dikabarkan lewat baris "will be restored"
├── Checkbox: "Mark not found [Type] TAGs as Damaged/Missing" [default: checked] — [Type]
│     sama format Varian 2
└── Footer: [Cancel] [Submit]
```

---

#### Dialog: Scan Stopped

```
├── Title: "Scan Stopped"
├── Body: "Scanning has been paused. Your progress is saved."
└── Footer: [Close] [Continue Audit]
```

---

#### Dialog: Cancel TAG Audit

```
├── Title: "Cancel TAG Audit"
├── Body: "Progress will not be saved."
└── Footer: [Go Back] [Continue]
    ├── Go Back → tutup dialog, kembali ke popup Audit TAG
    └── Continue → tutup popup, kembali ke Not Paired, tidak ada perubahan
```

---

#### Popup: Event Log — Audit TAG

```
├── Title: "Event Log: Audit TAG"
├── TableTools
│   ├── Icon: Search → "Search modified by..."
│   ├── Icon: Filter → Filter Panel
│   │   ├── Dropdown: "TAG Type" [multi-select] — RFID | NFC | BLE (placeholder: "All types")
│   │   ├── Date picker: "Date" — placeholder: "Select date" (§9.8 prd-conventions.md)
│   │   └── Dropdown: "Modified By" [single-select] (placeholder: "All admins")
│   └── Icon: Download
├── Table: Date | TAG Type | Total TAG Scanned | Modified By | Actions
│   ├── "TAG Type" — **1-3 badge teks** (RFID/NFC/BLE), bukan icon — baris log ini tidak
│   │     didampingi kolom Code (sama alasan Event Log Activate TAG, §7.9 `01-overview.md`),
│   │     jadi badge teks selalu dipakai terlepas sesi audit itu 1 tipe atau lebih —
│   │     mis. cuma badge "RFID" kalau sesi cuma audit RFID, badge "RFID"+"NFC" kalau sesi
│   │     mencakup keduanya
│   ├── "Actions" (header `⋯`) — trigger Column Visibility (§9.3 prd-conventions.md, Setup
│   │     Column §2.7), row action `[Detail]` tetap tampil di kolom yang sama
│   └── Row Action: [Detail] → Popup Audit Detail
└── [Close]
```

**Row Actions (§23 `prd-conventions.md`):**

| Aksi | Icon | Severity |
|------|------|----------|
| `Detail` | `FileInfoLine` | dark |

#### Popup: Audit Detail

```
├── Title: "Audit Detail"
├── Section: "TAGs Found" — tabel TAG Type (icon) | Code | Status After | Actions
├── Section: "TAGs Not Found" — tabel TAG Type (icon) | Code | Status After | Actions
│     └── "Status After" kosong jika checkbox tidak dicentang saat submit
└── "Actions" (header `⋯`, kedua sub-tabel) — kolom kosong, trigger Column Visibility (§9.3
      prd-conventions.md, Setup Column §2.7)
```

---

#### Halaman: Combine & Separate TAG

```
[Breadcrumb: TAG > Combine & Separate TAG]
├── Page Title: "Combine & Separate TAG"
├── Toolbar [right-aligned]: Icon: Event Log (clock/history) → Popup Event Log
│
├── [Sebelum pilih action]
│   └── Field: Action [Dropdown placeholder: "Select action"]
│       ├── Semua 5 opsi (Combine RFID & NFC / NFC & QR / RFID & QR / RFID & NFC & QR / Separate TAG) —
│       │   🔒 + tooltip "Available on Growth plan or above" jika plan Starter (seluruh kombinasi
│       │   melibatkan RFID/NFC; tidak ada kombinasi QR-only — 03-functional.md §3.5)
│       └── Teks deskripsi di bawah: "Select an action to get started"
│
└── [Setelah pilih action]
    ├── Field: Action [Dropdown terisi]
    ├── Info icon + teks penjelasan action [kanan field]
    ├── "Total Combined TAGs: [N]"
    │
    ├── Toolbar tabel:
    │   ├── [Remove] — disabled jika tabel kosong
    │   │   └── Klik → Overlay pilih metode scan untuk remove
    │   ├── [Scan TAG]
    │   │   └── Klik → Overlay pilih metode scan
    │   │       └── Toast "Scanning..." → "Validating..."
    │   └── Icon: Event Log (clock/history) → Popup Event Log
    │
    ├── Table (kolom sesuai action, ditutup kolom Actions di semua varian):
    │   ├── Combine RFID & NFC: RFID Code | NFC Code | TAG Type | Actions
    │   ├── Combine NFC & QR: NFC Code | QR Code | TAG Type | Actions
    │   ├── Combine RFID & QR: RFID Code | QR Code | TAG Type | Actions
    │   ├── Combine RFID & NFC & QR: RFID Code | NFC Code | QR Code | TAG Type | Actions
    │   └── Separate TAG: RFID Code | NFC Code | QR Code | TAG Type | Actions
    │   ("Actions" header `⋯` — kolom kosong, trigger Column Visibility, §9.3 prd-conventions.md,
    │   Setup Column §2.7)
    │
    └── Footer: [Cancel] [Submit]
        ├── Cancel → Dialog Cancel Combine/Separate TAG
        └── Submit → Dialog Submit Combine/Separate TAG (jika ada data)
            └── Submit tanpa data → caption error di atas tombol
```

**Example Data — Staging Table per varian Action:**

Combine RFID & NFC:

| RFID Code | NFC Code | TAG Type | Kondisi yang Didemokan |
|-----------|----------|----------|------------------------|
| RF-201 | NF-201 | Object TAG | Pasangan siap di-combine |

Combine NFC & QR:

| NFC Code | QR Code | TAG Type | Kondisi yang Didemokan |
|----------|---------|----------|------------------------|
| NF-202 | QR-202 | Object TAG | Pasangan siap di-combine |

Combine RFID & QR:

| RFID Code | QR Code | TAG Type | Kondisi yang Didemokan |
|-----------|---------|----------|------------------------|
| RF-203 | QR-203 | Object TAG | Pasangan siap di-combine |

Combine RFID & NFC & QR:

| RFID Code | NFC Code | QR Code | TAG Type | Kondisi yang Didemokan |
|-----------|----------|---------|----------|------------------------|
| RF-204 | NF-204 | QR-204 | Object TAG | Triplet siap di-combine |

Separate TAG:

| RFID Code | NFC Code | QR Code | TAG Type | Kondisi yang Didemokan |
|-----------|----------|---------|----------|------------------------|
| RF-001 | NF-001 | — | Object TAG | Combined set existing (RFID+NFC), siap dipisah kembali |

---

#### Dialog: Submit Combine TAG

```
├── Title: "Submit Combine TAG"
├── Body: "Are you sure you want to combine these TAGs?"
└── Footer: [Cancel] [Submit]
    └── Submit: data tersimpan, toast sukses, tabel kosong, kembali ke state action terpilih
    └── Cancel: dialog tutup, kembali ke halaman (data tabel tetap)
```

#### Dialog: Submit Separate TAG

```
├── Title: "Submit Separate TAG"
├── Body: "TAGs will be separated. To re-combine, scan each TAG manually."
└── Footer: [Cancel] [Submit]
```

#### Dialog: Cancel Combine/Separate TAG

```
├── Title: "Cancel Combine TAG" | "Cancel Separate TAG"
├── Body: "Progress will not be saved."
└── Footer: [Go Back] [Continue]
    ├── Go Back → tutup dialog, kembali ke halaman (data tabel tetap)
    └── Continue → halaman kembali ke state awal (action belum dipilih), data tabel hilang
```

> Dialog yang sama juga muncul saat: ganti dropdown Action saat tabel sudah berisi data, klik Breadcrumb, atau klik Back browser.

---

#### Popup: Event Log — Combine & Separate TAG

```
├── Title: "Event Log: Combine & Separate TAG"
├── TableTools
│   ├── Icon: Search → "Search modified by..."
│   ├── Icon: Filter → Filter Panel
│   │   ├── Date picker: "Date" — placeholder: "Select date" (§9.8 prd-conventions.md)
│   │   ├── Dropdown: "Action" [multi-select] — Combine RFID & NFC | Combine NFC & QR |
│   │   │     Combine RFID & QR | Combine RFID & NFC & QR | Separate TAG (placeholder: "All actions")
│   │   ├── Dropdown: "From" [multi-select] — Global Settings | Fixed Asset | Supply Asset
│   │   │     (placeholder: "All modules")
│   │   └── Dropdown: "Modified By" [single-select] (placeholder: "All admins")
│   └── Icon: Download
├── Table: Date | Action | Total Combined TAG | From | Modified By | Actions
│     └── "Actions" (header `⋯`) — kolom kosong, trigger Column Visibility (§9.3
│           prd-conventions.md, Setup Column §2.7)
└── [Close]
```

---

### 2.3 Component States

| State | Kondisi | Display |
|-------|---------|---------|
| Loading | Fetch data | Skeleton rows |
| Empty | Tidak ada TAG | "No TAGs found" |
| Empty — filtered | Filter tidak ada hasil | "No results found" |
| Empty tabel Combine/Activate TAG | Belum ada scan | "No Data Found" |
| Scanning | Saat scan aktif | Toast: "Scanning..." → "Validating..." |
| Baris "Official" | Scan match `tag_units` (real-time-check) | Badge "Official" [biru]; kolom Device Name/SKU/Brand/Model/Type auto-terisi |
| Baris "Self-Purchased" | Scan tidak match, Template terisi (atau hasil `[Resolve]`/`[Edit]` per baris) | Badge "Self-Purchased" [kuning]; kolom Device Name/SKU/Brand/Model/Type dari Template atau Row Edit Mode |
| Baris "Needs Info" | Scan tidak match, Template kosong, `byo_activation_enabled=true` | Badge "Needs Info" [yellow]; row action `[Resolve]` → Row Edit Mode (Device Name*/SKU/Brand*/Model/Type jadi input aktif di baris) |
| Baris "Error" — BYO disabled | Scan tidak match, `byo_activation_enabled=false` | Badge "Error" [merah], tooltip 🔖 alasan; cuma bisa di-Remove |
| Baris "Error" — license limit | Kuota tipe ini habis saat scan (real-time-check) | Badge "Error" [merah], tooltip: "License limit reached."; sesi scan tidak berhenti |
| Scan TAG sudah aktif di client sendiri | Identifier match TAG registry milik client ini (real-time) | Toast error: "Error, TAG is already activated."; **tidak masuk tabel** sama sekali; sesi scan tidak berhenti |
| Self-Purchased Template locked | `byo_activation_enabled=false` untuk Client | Collapsible disabled, tidak bisa di-expand, tooltip 🔖 |
| Self-Purchased Template locked (TAG Type belum dipilih) | TAG Type radio belum ada yang dipilih | Collapsible disabled, tooltip 🔖 "Select a TAG Type first." — independen dari guard `byo_activation_enabled` di atas, keduanya bisa aktif barengan |
| `[Scan TAG]` disabled (TAG Type belum dipilih) | TAG Type radio belum ada yang dipilih | Tombol disabled, tidak ada tooltip (state awal halaman sebelum interaksi apa pun) |
| `[Scan TAG]`/Upload File/Manual Entry disabled (kuota 0 sejak awal, koreksi 2026-08-04) | TAG Type dipilih; NFC/BLE/GPS pool = 0, atau RFID kedua pool (Object **dan** User) = 0 | Tombol disabled, tooltip 🔖 "No quota available for this TAG Type. Contact your administrator or request more allocation." — dicek ulang tiap radio TAG Type dipilih; beda dari license limit real-time per baris (baris tetap "Error", sesi tidak berhenti) yang tetap berlaku untuk race di tengah sesi |
| Submit — tabel kosong (belum ada scan/input sama sekali) | 0 baris di tabel staging | Caption di atas tombol Submit: "Please scan the TAGs before submitting." (§8 `01-overview.md`) — `[Submit]` sendiri tetap **enabled** secara teknis, tapi tidak ada efek karena tidak ada baris untuk di-commit; caption ini mencegah user bingung kenapa klik Submit tidak terjadi apa-apa |
| Row Edit Mode aktif | Row action `[Resolve]`/`[Edit]` diklik | Kolom Actions hilang dari seluruh tabel; toolbar [Scan TAG]/[Remove]/Upload File/Manual Entry disabled tooltip 🔖 "Finish editing this row first."; footer [Cancel] [Submit] → [Cancel] [Save] |
| Row Edit Mode — `[Save]` gagal validasi | Field wajib kosong (mis. Device Name/Brand) | `[Save]` blocked, sesi tetap terbuka, field gagal dapat border merah + tooltip 🔖 alasan |
| Row Edit Mode — `[Cancel]` tanpa perubahan | Belum ada field diisi/diubah | Sesi langsung tertutup tanpa dialog, kembali normal |
| Row Edit Mode — `[Cancel]` dengan perubahan | ≥1 field sempat diisi/diubah | Dialog "Cancel Edit" ("Changes will not be saved.") — Continue: perubahan dibuang, sesi tertutup; Go Back: tetap di sesi |
| Checkbox bulk-select muncul (ditambahkan 2026-08-04) | Baris berbadge "Needs Info" | Checkbox tampil di kolom checkbox baris itu; Official/Self-Purchased/Error tidak punya checkbox (kosong) |
| Bulk action bar muncul | ≥1 checkbox baris Needs Info dicentang | "[N] selected" + tombol `[Resolve Selected]` tampil di atas tabel |
| Bulk Resolve Mode aktif | Klik `[Resolve Selected]` | Panel inline field Device Name/SKU/Brand/Model/Type muncul; kolom Actions & checkbox hilang dari seluruh tabel; toolbar disabled tooltip 🔖 "Finish editing these rows first."; mutually exclusive dgn Row Edit Mode single-row |
| Bulk Resolve — `[Apply to N rows]` gagal validasi | Field wajib kosong | Blocked, panel tetap terbuka, field gagal dapat border merah + tooltip 🔖 alasan |
| Bulk Resolve — `[Apply to N rows]` sukses | Validasi lolos | Semua N baris terpilih badge → "Self-Purchased", nilai sama persis (snapshot); panel tertutup, checkbox & bulk action bar hilang |
| Bulk Resolve — `[Cancel]` tanpa perubahan | Panel belum diisi | Panel langsung tertutup tanpa dialog, checkbox seleksi tetap tercentang |
| Bulk Resolve — `[Cancel]` dengan perubahan | ≥1 field sempat diisi di panel | Dialog "Cancel Edit" — Continue: input dibuang, checkbox tetap tercentang; Go Back: tetap di panel |
| Submit — kuota agregat kurang | Pre-check per kategori menemukan kekurangan | Dialog "Insufficient Quota" (breakdown per kategori); Submit batal total, tidak ada baris commit; klik [OK] → angka kuota refresh |
| Submit sukses (semua baris) | — | Toast: "Success, [N] TAGs have been activated."; badge tiap baris → "Activated" [hijau]; halaman tetap terbuka |
| Submit — hasil campuran | Sebagian Activated/Waiting for Approval/Failed | Toast ringkasan gabungan; badge tiap baris update sesuai hasil masing-masing |
| Submit gagal total (server error, sebelum baris manapun diproses) | Network/5xx | Toast: "Error, failed to submit activation." — tabel staging tetap utuh |
| Baris "Failed" (setelah Submit) | Race kuota/collision saat commit | Badge "Failed" [merah] + tooltip alasan; baris tetap editable ([Remove] lalu scan ulang) |
| Submit disabled | Ada baris "Needs Info" belum diresolve | Tombol disabled, tooltip 🔖: "Resolve or remove all incomplete rows before submitting." |
| Scan error | TAG invalid / dll | Toast error (scan terus berlanjut) |
| Remove disabled | Tabel kosong / tidak ada baris terpilih | Button [Remove] disabled |
| Combined TAG sibling | Klik icon link 🔗 di kolom Code (registry) | Popup "Combined TAG" (+N More, §2.2) menampilkan sibling baris/card |
| Counter Card — default | Belum diklik | Border/background normal |
| Counter Card — selected | Diklik (aktif sebagai filter) | Border/background beda (selected state); tabel ter-filter; klik lagi → kembali default |
| Counter Card — hover | Cursor di atas card | Cursor pointer, subtle highlight (menandakan clickable) |

---

### 2.4 Interaction Patterns

- **Semua tabel All TAGs: read-only** — tidak ada row action, klik baris tidak melakukan apapun sama sekali, termasuk baris `Waiting for Approval` — tidak ada link/navigasi ke Admin Console dari sini, terlepas dari akses Admin Console yang dimiliki user
- **Scan error di Combine**: toast error muncul, scan tetap lanjut (tidak stop)
- **Ganti action saat data ada**: konfirmasi Cancel terlebih dahulu
- **Klik Counter Card = filter TAG Type — OR sederhana per baris**, bukan lagi AND/"mengandung": karena registry sekarang 1 baris = 1 identifier (bukan 1 baris = 1 `tag_code` dengan banyak kolom), tiap baris cuma pernah punya 1 TAG Type. Card RFID + Card QR aktif bersamaan = tampilkan baris ber-TAG Type RFID **atau** QR (union), berlaku seragam untuk kelima teknologi — tidak ada lagi pembedaan logika combinable (RFID/NFC/QR) vs standalone (BLE/GPS) di level filter, karena struktur baris sudah menyerap perbedaan itu. Klik card yang sudah aktif = toggle nonaktif lagi (deselect). Klik berlaku **di level card penuh** (Tab Not Paired — klik card RFID memfilter baris RFID apa pun statusnya, bukan cuma yang match angka ✓/✕ tertentu; kedua angka itu murni informational breakdown, bukan 2 target klik terpisah)
- **Icon link 🔗 di kolom Code**: muncul cuma untuk baris RFID/NFC/QR yang combined (2-3 identifier dalam `tag_code` yang sama) — klik → Popup Combined TAG (+N More) menampilkan sibling baris. BLE/GPS tidak pernah punya icon ini (selalu standalone, §3.1 `01-overview.md`)
- **`[+ Activate TAG]` adalah satu-satunya cara TAG baru masuk registry** — entry point scan lain (Audit, Combine, Pair User, dst) tidak pernah membuat baris baru, hanya beroperasi pada TAG yang sudah Active/Available (§6 `01-overview.md`)
- **Halaman Activate TAG tidak pernah redirect/tutup saat ada baris gagal** — hasil (Activated/Waiting for Approval/Failed) ditampilkan in-place per baris, user retry baris Failed tanpa mengulang seluruh sesi dari awal
- **BLE/GPS tidak muncul di halaman Combine & Separate TAG** — dropdown Action tetap hanya 4 kombinasi + Separate (RFID/NFC/QR saja, §3.5 `03-functional.md`)

---

### 2.5 Responsive & Accessibility

- Tabel All TAGs: banyak kolom → horizontal scroll pada viewport sempit
- Counter license: tetap visible saat scroll tabel
- Toast scan: aria-live region
- Dialog confirm: fokus otomatis ke tombol primary saat dialog terbuka

---

### 2.6 Mobile Layout

#### Navigasi & Layout Umum

- Tab All / Paired / Not Paired tetap ada di mobile (same as web)
- Tabel digantikan **card list** — satu card per TAG
- License counter tetap tampil di atas card list

#### Card: TAG (All & Not Paired)

> **1 card = 1 identifier**, sama prinsip dengan tabel web (§2.2) — TAG combined (RFID/NFC/QR, 2-3 identifier) render sebagai beberapa card independen berurutan, bukan 1 card besar dengan banyak baris teknologi.

```
┌──────────────────────────────────────┐
│  (RFID) A1B2C3D4E5F6G7H8      🔗     │  ← TAG Type icon + Code + icon link (cuma
│                        [Available]   │      muncul kalau card ini bagian combined)
│                                      │      + Status badge
│  Device  Zebra Tag                    │
│  SKU     SKU-001                      │
│  Brand   Zebra                        │
│  Model   ZT-200                       │
│  Type    Object TAG                   │
│  Last    10 Jun 2026 · Global Settings│
└──────────────────────────────────────┘
```

**Card sibling (combo yang sama, muncul berurutan tepat di bawah card di atas):**
```
┌──────────────────────────────────────┐
│  (NFC) J9K0L1M2N3O4P5Q6        🔗     │
│                        [Available]   │
│  Device  Zebra Tag                    │
│  SKU     SKU-001                      │
│  Brand   Zebra                        │
│  Model   ZT-200                       │
│  Type    Object TAG                   │
│  Last    10 Jun 2026 · Global Settings│
└──────────────────────────────────────┘
```

**Card: TAG (BLE/GPS atau RFID/NFC/QR standalone — tidak pernah ada icon 🔗):**
```
┌──────────────────────────────────────┐
│  (GPS) 356938035643809               │  ← TAG Type icon + Code, tanpa icon 🔗
│                        [Available]   │      (standalone, tidak combined)
│  Device  GeoTrack                     │
│  Brand   Acme Corp                    │
│  Type    Object TAG                   │
│  Last    10 Jun 2026 · Global Settings│
└──────────────────────────────────────┘
```

- **TAG Type di card mobile icon**, sama seperti kolom web (§2.2) — notasi `(...)` di wireframe cuma placeholder ASCII utk posisi icon
- **Baris SKU/Brand/Model ditampilkan hanya kalau terisi** — kalau `—` (mis. baris GeoTrack di atas: BYO tanpa SKU sama sekali, jadi baris "SKU" dan "Model" disembunyikan, bukan ditampilkan kosong) — konsisten §2.2 web, cuma di mobile baris kosong dihilangkan total (bukan baris dengan value `—`) supaya card tidak boros ruang vertikal
- Tap icon 🔗 → sama seperti web, Popup Combined TAG (+N More) menampilkan sibling card dalam combo yang sama
- Source badge ("Official"/"Self-Purchased") tampil di baris pertama, sebelah Status badge
- Tap card: tidak ada aksi (read-only) — sama seperti web, termasuk card `Waiting for Approval` (tidak ada deep link ke Admin Console dari sini)
- Scroll vertikal untuk melihat lebih banyak card

#### Card: TAG (Paired tab)

Sama seperti card di atas tanpa Status badge (semua Paired).

#### Toolbar Mobile (Tab All)

```
┌──────────────────────────────────────┐
│  All TAGs                      [⋯]  │
├──────────────────────────────────────┤
│  All  │  Paired  │  Not Paired       │
├──────────────────────────────────────┤
│  [RFID-Obj] [RFID-Usr] [NFC     ]    │  ← License Counter Cards (6, RFID pecah
│  42/100     10/25      18/50         │    Object/User), horizontal scroll, klik
│  [QR      ] [BLE     ] [GPS     ]    │    = filter (sama isi §2.2 Tab All web)
│  120/150    5/20       3/10          │
│  [🔍 Search...]                      │
│  [+ Activate TAG]                    │  ← primary button, full width,
│                                       │    HANYA tampil di Tab All
└──────────────────────────────────────┘
```

- [⋯] → bottom sheet: Column visibility / Filter / Download
- Counter Card → tap = toggle filter aktif/nonaktif (sama logika web, §2.4)
- [+ Activate TAG] → bottom sheet Activate TAG (§7.8 `01-overview.md`) — **tidak** tampil di Tab Paired/Not Paired

#### Toolbar Mobile (Tab Not Paired)

```
┌──────────────────────────────────────┐
│  [RFID-Obj] [RFID-Usr] [NFC     ]    │  ← Health Counter Cards (6, RFID pecah
│  ✓12 ✕2     ✓5 ✕1      ✓8 ✕1         │    Object/User), horizontal scroll, klik
│  [QR      ] [BLE     ] [GPS     ]    │    = filter (sama isi §2.2 Tab Not Paired web)
│  ✓0 ✕0      ✓4 ✕0      ✓2 ✕1         │
│  [🔍 Search...]                      │
│  [Audit TAG]                    [⏱]  │  ← [⏱] = icon Event Log, bukan button berlabel
└──────────────────────────────────────┘
```
Tidak ada `[+ Activate TAG]` di tab ini (hanya Tab All).

---

#### Layar Scan (Audit TAG / Combine / Search by Scan)

**QR — Camera viewfinder:**
```
┌──────────────────────────────────────┐
│  [←]  Scanning QR            [Stop] │
├──────────────────────────────────────┤
│                                      │
│     ┌────────────────────┐           │
│     │                    │           │
│     │   [QR Frame]       │           │
│     │                    │           │
│     └────────────────────┘           │
│                                      │
│  Point camera at QR code             │
└──────────────────────────────────────┘
```

**NFC — Tap screen:**
```
┌──────────────────────────────────────┐
│  [←]  Scanning NFC           [Stop] │
├──────────────────────────────────────┤
│                                      │
│         ( animasi ripple )           │
│                                      │
│     Hold your phone near             │
│         the NFC TAG                  │
│                                      │
│  ← Vibrate + sound saat berhasil    │
└──────────────────────────────────────┘
```

**RFID via Handheld:**
```
┌──────────────────────────────────────┐
│  [←]  Scanning RFID          [Stop] │
│  ● Reader Connected                  │  ← badge status BT
├──────────────────────────────────────┤
│                                      │
│      ( animasi sinyal RFID )         │
│                                      │
│  Scanning with Handheld Reader...    │
│  TAG-001 ✓  (muncul saat terbaca)   │
└──────────────────────────────────────┘
```

Jika Handheld tidak terhubung:
```
│  ○ Reader Disconnected               │
│  Connect a Handheld Reader           │
│  to scan RFID                        │
│  [Scan RFID] disabled                │
```

**BLE — Bluetooth scan/pair:**
```
┌──────────────────────────────────────┐
│  [←]  Scanning BLE            [Stop] │
├──────────────────────────────────────┤
│                                      │
│     ( daftar device BLE terdeteksi ) │
│     • TAG-BLE-A1B2  [Pair]           │
│     • TAG-BLE-C3D4  [Pair]           │
│                                      │
│  Select a device to pair             │
└──────────────────────────────────────┘
```
> **Tidak ada fallback manual entry** — MAC Address tidak dirancang untuk diketik manusia (`scan-foundation.md` §4.8). Device tidak muncul di list → empty state generik `"No BLE TAG found nearby."` (`scan-foundation.md` §5.5), bukan opsi ketik manual.

> **GPS tidak punya layar scan** — GPS tidak pernah masuk daftar teknologi §"Layar Scan" ini (tidak dipakai Audit/Combine/Search by Scan, dan registrasinya di Activate TAG bukan live scan sama sekali — `scan-foundation.md` §4.8/§5.6). Lihat "Activate TAG — Mobile Flow" di bawah untuk UI registrasi GPS (Import/Manual Entry).

---

#### Audit TAG — Mobile Flow

```
Not Paired tab
    └── Tap [Audit TAG]
        └── Bottom sheet full-height:
            ├── "Audit TAG"
            ├── Found: 0 | Not Found: [N]
            ├── Card list TAG
            └── Footer: [Cancel] [Audit TAG / Continue Audit] [Submit]
                └── Tap [Audit TAG]:
                    └── Bottom sheet: pilih metode scan
                        ├── Scan by RFID
                        ├── Scan by NFC
                        ├── Scan by QR
                        └── Scan/Pair by BLE
                            └── → Layar Scan (full screen)
                                └── TAG terscan → kembali ke audit sheet, counter update
```

---

#### Activate TAG — Mobile Flow

> Halaman penuh (bukan bottom sheet) — sama pola Combine & Separate TAG Mobile di bawah: tabel digantikan card list, sisanya mengikuti flow web (§7.8 `01-overview.md`).

```
All TAGs (tab manapun)
    └── Tap [+ Activate TAG]
        └── Bottom sheet (kalau belum pernah dismiss, checkbox "Don't show this
              again" belum dicentang): "Ready to Activate a TAG"
            └── [Continue] → Halaman penuh "Activate TAG"
                ├── Radio: TAG Type (RFID | NFC | BLE | GPS)
                ├── Collapsible: "+ Add self-purchased template" (collapsed default)
                │       — expand → Device Name*/SKU/Brand*/Model/Type, sama field-set web.
                │       Locked + tooltip 🔖 kalau `byo_activation_enabled=false`
                ├── **[RFID/NFC/BLE]** [Scan TAG] → bottom sheet pilih metode (sesuai TAG
                │       Type — RFID/NFC scan; BLE Bluetooth scan/pair, tanpa fallback manual —
                │       `scan-foundation.md` §4.8)
                │       └── → Layar Scan (full screen, mode Multi/Batch — live counter,
                │             sama pola Audit/Combine) → [Stop] → kembali ke halaman
                ├── **[GPS]** Input Manual Entry menggantikan `[Scan TAG]` — bukan live scan
                │       (`scan-foundation.md` §4.8/§5.6), lihat "GPS — Import/Manual Entry
                │       (Mobile)" di bawah
                ├── **[RFID/NFC/BLE]** [Remove] → **scan-based**, sama seperti web (§7.8
                │       `01-overview.md`) — **bukan** swipe/tombol per-card: tap [Remove] →
                │       bottom sheet pilih metode (sama seperti [Scan TAG]) → Layar Scan →
                │       identifier ter-scan match Code card yang ada → card terhapus
                ├── **[GPS]** [Remove] tetap manual (swipe atau tombol Remove per card) —
                │       GPS tidak discan
                ├── Card list (tumbuh per scan/entry, real-time match-check tiap card):
                │       ├── Badge "Official" [biru] — match; Device auto-terisi
                │       ├── Badge "Self-Purchased" [kuning] — dari Template atau hasil
                │       │       Resolve/Edit per card; tap card → bottom sheet **Edit**
                │       │       (field sama, koreksi tanpa perlu Remove + scan ulang)
                │       ├── Badge "Needs Info" [yellow] — tap card → bottom sheet
                │       │       **Resolve** (Device Name*/SKU/Brand*/Model/Type) — bottom
                │       │       sheet tetap dipakai mobile (setara pola native), beda dari
                │       │       web yang pakai Row Edit Mode inline di tabel (§ di atas)
                │       └── Badge "Error" [merah] — tap card → tooltip alasan; **[RFID/NFC/BLE]**
                │             cuma bisa dihapus lewat [Remove] scan-based di atas — **[GPS]**
                │             tetap bisa di-Remove per-card (swipe/tombol)
                ├── **Bottom sheet Resolve/Edit — dimmed overlay** (koreksi 2026-08-04,
                │       menutup gap): begitu bottom sheet Resolve/Edit terbuka, card list di
                │       belakangnya **tertutup dimmed overlay** dan tidak bisa di-tap/di-scroll
                │       sampai bottom sheet ditutup (`[Save]` atau `[Cancel]`) — setara Row
                │       Edit Mode di web yang menonaktifkan kolom Actions + toolbar di
                │       **seluruh** tabel (§ di atas), bukan cuma baris yang diedit. Mencegah
                │       card lain mulai sesi Resolve/Edit/Remove bersamaan selagi 1 card
                │       masih dalam proses koreksi
                └── Footer: [Cancel] [Submit]
                      ├── [Submit] disabled selama ada card "Needs Info"
                      └── Submit → proses per card, badge update in-place:
                            ├── "Activated" [hijau]
                            ├── "Waiting for Approval" [kuning] — read-only, tidak ada aksi tap
                            └── "Failed" [merah] + alasan — tetap bisa di-Remove & scan ulang
                          Toast ringkasan: "Success, [N] TAGs have been activated." (+ pending/failed)
```

---

#### GPS — Import/Manual Entry (Mobile)

> Menggantikan tombol `[Scan TAG]` khusus TAG Type=GPS di "Activate TAG — Mobile Flow" di atas — bukan Layar Scan, pola identik web (lihat `#### Halaman: Activate TAG — GPS (Import/Manual Entry)` di atas), diadaptasi jadi bottom sheet full-height.

```
┌──────────────────────────────────────┐
│  [←]  Add GPS TAGs                   │
├──────────────────────────────────────┤
│                                      │
│  ┌─ Upload File ─────────────────┐  │
│  │ [⬇ Download template]          │  │
│  │ [Browse files]                 │  │
│  │ Accepted: .csv, .xlsx · IMEI   │  │
│  └────────────────────────────────┘  │
│                                      │
│           — or —                    │
│                                      │
│  ┌─ Manual Entry ─────────────────┐  │
│  │ IMEI [______________] [+ Add]  │  │
│  └────────────────────────────────┘  │
│                                      │
│  Preview                             │
│  #  IMEI              Status         │
│  1  356938035643809   [OK]           │
│  2  356938035643809   [Duplicate]    │
│                                      │
│  1 valid, 1 duplicate of 2 entries   │
│                                      │
│              [Cancel]  [Add to List] │
└──────────────────────────────────────┘
```
- Preview: sama aturan "Duplicate in File"/"Invalid Format" dengan web (`02-ui-design.md` §"Halaman: Activate TAG — GPS (Import/Manual Entry)").
- `[Add to List]` → baris Preview berstatus OK/Waiting for Approval masuk **Card list** di halaman Activate TAG (real-time match-check sama seperti hasil scan RFID/NFC/BLE) — bottom sheet tutup, kembali ke halaman.

---

#### Combine & Separate TAG — Mobile

- Halaman sama dengan web, dropdown Action tetap
- Tabel digantikan card list per set TAG
- [Scan TAG] dan [Remove] → bottom sheet pilih metode → layar Scan (full screen)
- [Submit] / [Cancel] → bottom sheet konfirmasi

---

### 2.7 Column Visibility & Setup Column

Trigger: klik header kolom Actions (⋯) → dropdown "Column Visibility". `[Setup Column]` membuka modal: hide/unhide, drag reorder, pin/unpin. Cache per tabel di browser (§9.3 `prd-conventions.md`). Kolom Actions (⋯) sendiri **tidak** dicantumkan sebagai row di tabel Setup Column manapun di bawah — bukan kolom berisi data, cuma kontrol UI.

**Tab All**

| Column | Default | Toggle | Catatan |
|--------|:-------:|--------|---------|
| TAG Type | Visible | 🔒 Locked | Menentukan teknologi & format Code baris |
| Code | Visible | 🔒 Locked | Identitas utama baris; max-width 240px, CSS ellipsis, 🔖 hover nilai penuh |
| Device Name | Visible | ☑ Hideable | — |
| SKU | Visible | ☑ Hideable | `—` untuk BYO tanpa SKU |
| Brand | Visible | ☑ Hideable | — |
| Model/Type | Visible | ☑ Hideable | `—` valid (genuinely opsional) |
| Source | Visible | ☑ Hideable | Official/Self-Purchased |
| Type | Visible | ☑ Hideable | Object TAG/User TAG |
| TAG Status | Visible | ☑ Hideable | — |
| Last Scanned | Visible | ☑ Hideable | — |
| Activated At | Hidden | ☐ Curated | Sumber: `tag.registered_at` — timestamp pertama kali masuk registry (beda dari Last Scanned yang selalu ter-update); berguna untuk audit/reporting umur TAG |

**Tab Paired**

| Column | Default | Toggle | Catatan |
|--------|:-------:|--------|---------|
| TAG Type | Visible | 🔒 Locked | — |
| Code | Visible | 🔒 Locked | Identitas utama baris; max-width 240px, CSS ellipsis, 🔖 hover nilai penuh |
| Device Name | Visible | ☑ Hideable | — |
| SKU | Visible | ☑ Hideable | `—` untuk BYO tanpa SKU |
| Brand | Visible | ☑ Hideable | — |
| Model/Type | Visible | ☑ Hideable | `—` valid |
| Source | Visible | ☑ Hideable | — |
| Type | Visible | ☑ Hideable | — |
| Last Scanned | Visible | ☑ Hideable | — |
| Activated At | Hidden | ☐ Curated | Sumber: `tag.registered_at` — sama seperti Tab All |

> Tab Paired tidak punya kolom TAG Status (semua baris = Paired, §2.2), jadi tidak ada row untuk itu di sini.

**Tab Not Paired**

| Column | Default | Toggle | Catatan |
|--------|:-------:|--------|---------|
| TAG Type | Visible | 🔒 Locked | — |
| Code | Visible | 🔒 Locked | Identitas utama baris; max-width 240px, CSS ellipsis, 🔖 hover nilai penuh |
| Device Name | Visible | ☑ Hideable | — |
| SKU | Visible | ☑ Hideable | `—` untuk BYO tanpa SKU |
| Brand | Visible | ☑ Hideable | — |
| Model/Type | Visible | ☑ Hideable | `—` valid |
| Source | Visible | ☑ Hideable | — |
| Type | Visible | ☑ Hideable | — |
| Status | Visible | ☑ Hideable | Termasuk Waiting for Approval |
| Last Scanned | Visible | ☑ Hideable | — |
| Activated At | Hidden | ☐ Curated | Sumber: `tag.registered_at` — sama seperti Tab All |

**Activate TAG — staging table**

| Column | Default | Toggle | Catatan |
|--------|:-------:|--------|---------|
| TAG Type | Visible | 🔒 Locked | Terkunci session-level, tapi tetap kolom identitas baris |
| Code | Visible | 🔒 Locked | Identitas utama baris hasil scan/entry; max-width 240px, CSS ellipsis, 🔖 hover nilai penuh |
| Status | Visible | ☑ Hideable | Official/Self-Purchased/Needs Info/Error |
| Device Name | Visible | ☑ Hideable | Kosong sampai match/resolve |
| SKU | Visible | ☑ Hideable | — |
| Brand | Visible | ☑ Hideable | — |
| Model/Type | Visible | ☑ Hideable | — |

**Combine & Separate TAG — table**

| Column | Default | Toggle | Catatan |
|--------|:-------:|--------|---------|
| TAG Type | Visible | 🔒 Locked | Satu-satunya kolom yang selalu ada di kelima varian Action |
| RFID Code | Visible* | ☑ Hideable | *Cuma ada kalau Action melibatkan RFID (4 dari 5 varian, §2.2) |
| NFC Code | Visible* | ☑ Hideable | *Cuma ada kalau Action melibatkan NFC (4 dari 5 varian) |
| QR Code | Visible* | ☑ Hideable | *Cuma ada kalau Action melibatkan QR (4 dari 5 varian) |

> Kolom yang benar-benar tampil di tabel & di Setup Column mengikuti Action yang dipilih (§2.2) — modal Setup Column cuma menampilkan kolom yang relevan untuk Action aktif saat itu, bukan gabungan kelima varian sekaligus.

**Popup: Event Log — Activate TAG**

| Column | Default | Toggle | Catatan |
|--------|:-------:|--------|---------|
| Date | Visible | 🔒 Locked | — |
| TAG Type | Visible | ☑ Hideable | — |
| Total TAG Submitted | Visible | ☑ Hideable | — |
| Modified By | Visible | ☑ Hideable | badge format (8 char first + 1 char last); 🔖 hover nama lengkap |

**Popup: Activate TAG Detail** (berlaku sama untuk section "Activated" dan "Waiting for Approval"; section "Failed" tambah kolom Reason)

| Column | Default | Toggle | Catatan |
|--------|:-------:|--------|---------|
| Code | Visible | 🔒 Locked | Identitas utama baris; max-width 240px, CSS ellipsis, 🔖 hover nilai penuh |
| TAG Type | Visible | ☑ Hideable | — |
| Device Name | Visible | ☑ Hideable | — |
| Reason | Visible | ☑ Hideable | Hanya ada di section "Failed" |

**Popup: Audit TAG**

| Column | Default | Toggle | Catatan |
|--------|:-------:|--------|---------|
| Code | Visible | 🔒 Locked | Identitas utama baris; max-width 240px, CSS ellipsis, 🔖 hover nilai penuh |
| TAG Type | Visible | ☑ Hideable | — |

**Popup: Event Log — Audit TAG**

| Column | Default | Toggle | Catatan |
|--------|:-------:|--------|---------|
| Date | Visible | 🔒 Locked | — |
| TAG Type | Visible | ☑ Hideable | — |
| Total TAG Scanned | Visible | ☑ Hideable | — |
| Modified By | Visible | ☑ Hideable | badge format (8 char first + 1 char last); 🔖 hover nama lengkap |

**Popup: Event Log — Combine & Separate TAG**

| Column | Default | Toggle | Catatan |
|--------|:-------:|--------|---------|
| Date | Visible | 🔒 Locked | — |
| Action | Visible | ☑ Hideable | — |
| Total Combined TAG | Visible | ☑ Hideable | — |
| From | Visible | ☑ Hideable | — |
| Modified By | Visible | ☑ Hideable | badge format (8 char first + 1 char last); 🔖 hover nama lengkap |

**Popup: Audit Detail** (berlaku sama untuk kedua section "TAGs Found" dan "TAGs Not Found" — struktur kolom identik)

| Column | Default | Toggle | Catatan |
|--------|:-------:|--------|---------|
| Code | Visible | 🔒 Locked | Identitas utama baris; max-width 240px, CSS ellipsis, 🔖 hover nilai penuh |
| TAG Type | Visible | ☑ Hideable | — |
| Status After | Visible | ☑ Hideable | Kosong kalau checkbox tidak dicentang saat submit |

> **Popup Combined TAG (+N More) tidak punya Setup Column** — konsisten preseden platform: popup ringkas "+N More" (§9.13 `prd-conventions.md`, dipakai juga di Connected Tablet/Port Group `Global-Settings/PRD/hardware/02-ui-design.md`) adalah reference list sederhana, bukan tabel data lengkap — tidak pernah diberi Column Visibility/Setup Column di modul manapun yang sudah pakai pola ini.

---

## Guided Tooltip Steps

> `page_key`: `gs-tag`

| Step | Target Element | Title | Description |
|:----:|----------------|-------|-------------|
| 1 | License Counter Cards (RFID – Object TAG / RFID – User TAG / NFC / QR / BLE / GPS) | "License Counter" | "Shows how many TAGs are in use vs. your total license quota, per type. RFID has separate quotas for Object TAG and User TAG. Click a card to filter the table by that type." |
| 2 | `[+ Activate TAG]` button | "Activate a TAG" | "This is the only way to bring a new physical TAG (RFID, NFC, BLE, or GPS) into the registry. Choose a device name, optionally match it to a SKU, then scan or pair the TAG." |
| 3 | Tab bar (All / Paired / Not Paired) | "TAG Tabs" | "All shows every TAG. Paired shows TAGs linked to assets/users. Not Paired shows available TAGs with audit and event log tools." |
| 4 | Tab Not Paired — `[Audit TAG]` button | "Audit TAG" | "Run an audit to verify physical TAGs against the system. Scan TAGs one by one — the system flags discrepancies." |
| 5 | Tab Not Paired — Icon: Event Log (clock/history) | "Event Log" | "View the history of TAG audits, including audit results and who performed them." |
| 6 | Halaman Combine & Separate TAG — Action dropdown | "Combine & Separate" | "Combine multiple TAGs into one set (e.g. RFID + NFC), or separate a combined set back into individual TAGs. BLE and GPS trackers are standalone and aren't combinable." |
| 7 | Icon: Filter di toolbar (Search/Filter Panel) | "Search & Filter" | "Search by code or device name, or open the Filter Panel to narrow down by device name, source, type, status, and last scanned date." |

---


---

## 3. UI Visibility per Role

Kolom = tier/role aktor. State: Show / Hidden / Disabled 🔖 (tooltip wajib; §18.5 prd-conventions.md). Modul ini **read-only registry** — tidak ada Create/Edit/Delete; aksi tulis satu-satunya adalah Audit, Combine, Separate (capability "Manage TAG" — Update). Tabel ini identik dengan `01-overview.md` §1.5, disalin ulang di sini untuk konsumsi AI design tool.

| Elemen UI | Total Control | Read Only | Manage TAG (individual capability) | Role lain |
|-----------|:-------------:|:---------:|:------------------------------------:|:---------:|
| Menu TAG (All TAGs + Combine & Separate) | Show | Show | Show jika Read; selain itu Hidden | Hidden |
| Tabel registry (All / Paired / Not Paired) | Show | Show | Show jika Read | Hidden |
| License counter RFID/NFC/BLE/GPS | Show | Show | Show jika Read | Hidden |
| `[Search by Scan]` (tab All / Paired / Not Paired) | Show | Show | Show jika Read | Hidden |
| Button `[+ Activate TAG]` | Show | Hidden | Show jika Update; selain itu Hidden | Hidden |
| Button `[Audit TAG]` | Show | Disabled 🔖 | Show jika Update; selain itu Disabled 🔖 | Hidden |
| Halaman/aksi Combine & Separate (`[Scan TAG]`, `[Submit]`, `[Remove]`) | Show | Disabled 🔖 | Show jika Update; selain itu Disabled 🔖 | Hidden |
| Event Log icon | Show | Show | Show jika Read | Hidden |

> Tooltip 🔖 Disabled: `"You don't have permission to edit"`. Plan gating (Starter = RFID/NFC/BLE/GPS 🔒) independen dari tabel ini — lihat §2.2 wireframe & `03-functional.md` §3.5.

Lihat §18.4 prd-conventions.md untuk state definitions dan §18.6 untuk defense in depth.
