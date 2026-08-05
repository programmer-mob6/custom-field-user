# Product Specification: TAG

> Modul: **Global Settings** | Feature Prefix: **`TAG`**
> **Acuan:** [`scan-foundation.md`](../../../_foundation/scan-foundation.md) (Shared Scan Component, mode Single/Multi/Batch, skenario negatif per teknologi) · [`Admin-Console/PRD/_foundation/device-catalog-schema.md`](../../../Admin-Console/PRD/_foundation/device-catalog-schema.md) §9 (identifier_type per tipe TAG, collision & approval) · [`plans.md`](../../../_foundation/plans.md) §2.1 (gating RFID/NFC/BLE/GPS + QR cap) · [`approval-foundation.md`](../../../_foundation/approval-foundation.md) (reuse via device-catalog-schema §9.8) · [`error-handling-convention.md`](../../../_foundation/error-handling-convention.md) (C-2) · [`edge-case-matrix-convention.md`](../../../_foundation/edge-case-matrix-convention.md) (M-1) · [`state-sync-protocol.md`](../../../_foundation/state-sync-protocol.md) (C-4)

---

## 1. Overview

### 1.1 Problem Statement
Tidak ada registry terpusat untuk seluruh TAG fisik (RFID, NFC, QR) yang digunakan di platform TAG Samurai. Status, kombinasi, dan relasi TAG ke asset/user/grup tersebar di berbagai modul tanpa visibilitas global.

### 1.2 Goals
- Menyediakan registry global untuk semua TAG yang telah diaktivasi di platform
- Menyediakan **satu jalur aktivasi tunggal** (`[+ Activate TAG]`) untuk TAG fisik baru — bukan lagi tersebar implisit di banyak entry point (revisi 2026-07-15)
- Menampilkan status TAG secara realtime lintas semua modul
- Mendukung Combine & Separate TAG (RFID, NFC, QR dalam berbagai kombinasi) — **BLE/GPS tidak ikut** (standalone tracker, bukan chip yang bisa digabung fisik, §1.4)
- Enforce kuota **RFID/NFC/BLE/GPS** berdasarkan unit yang teralokasi ke client (derived dari Admin Console, bukan license key manual — §4), berlaku untuk kedua jalur aktivasi (A maupun B)
- Mendukung aktivasi mandiri (**Jalur B/BYO**) untuk TAG fisik RFID/NFC/BLE/GPS yang Client beli sendiri di luar rantai distribusi — konsisten model Hardware (`Global-Settings/PRD/hardware/01-overview.md` §4)
- Menyediakan Audit TAG untuk TAG yang belum dipasangkan (termasuk BLE — **GPS tidak**, lihat §1.4)
- **Revisi (BLE/GPS parity):** BLE & GPS sekarang mengikuti registry, License Counter, dan Activate TAG (Jalur A/B) persis seperti RFID/NFC — sebelumnya dianggap sepenuhnya di luar scope modul ini, sekarang hanya Combine & Separate yang tetap dikecualikan

### 1.3 Feature Summary
TAG Registry adalah modul Global Settings yang menjadi sumber kebenaran tunggal untuk semua TAG fisik di platform. Terdiri dari dua sub-menu: **All TAGs** (registry lengkap dengan tab All / Paired / Not Paired, plus tombol `[+ Activate TAG]`) dan **Combine & Separate TAG** (penggabungan dan pemisahan TAG RFID/NFC/QR — BLE/GPS tidak ikut, §1.4). TAG fisik (**RFID/NFC/BLE/GPS**) masuk ke registry **hanya lewat Activate TAG** (§5) — satu jalur tunggal, mendukung **Jalur A** (identifier match ke `tag_units` yang sudah diregister Principal/Distributor di Admin Console) maupun **Jalur B/BYO** (identifier tidak match, Client aktivasi mandiri). Entry point scan lain (Audit TAG, Combine & Separate, Pair User, Register Asset, Stock Placement, dst — §6) tetap berbasis scan, tapi **hanya beroperasi pada TAG yang sudah Active/Available** — bukan lagi titik masuk discovery. QR tidak melalui Activate TAG — QR digenerate langsung di client (FAMS/Supply), tidak dibatasi kuota (kecuali hard cap Starter).

> **BLE/GPS — pemasangan ke asset di luar modul ini.** Registry, License Counter, dan Activate TAG (Jalur A/B) untuk BLE/GPS di modul ini identik RFID/NFC. Tapi **pemasangan BLE/GPS ke asset** (dikonsumsi addon Tracking/Maps) **tidak** lewat entry point pairing scan-based di §6 (Register Asset > Scan Object TAG, Change TAG, Replace TAG tetap RFID/NFC/QR saja, sesuai `Fixed-Asset/PRD/asset/03-functional.md` §3.5: "untuk operasional FAMS (pairing & Search by Scan) yang relevan = RFID/NFC/QR") — mekanisme pairing BLE/GPS ke asset dimiliki penuh oleh addon Tracking/Maps di sisi FAMS, di luar scope PRD ini.

### 1.4 Scope

**In Scope:**
- **Activate TAG** — satu jalur aktivasi tunggal untuk TAG fisik baru (**RFID/NFC/BLE/GPS**), Jalur A + Jalur B/BYO (§5)
- Registry global semua TAG — read-only (tidak ada edit, tidak ada delete)
- Audit TAG untuk Not Paired TAGs (RFID/NFC/BLE — **GPS tidak punya Audit**, konsisten `tag-stock/01-overview.md` §5.4: tidak ada mekanisme re-scan untuk GPS, registrasi murni via IMEI import/manual. GPS Damaged/Missing recovery **RESOLVED** 2026-07-24 — otomatis lewat event pairing FAMS/Supply, bukan Audit, lihat `03-functional.md` F-TAG-09)
- Combine & Separate TAG (4 kombinasi combine + 1 separate) — **RFID/NFC/QR saja**, BLE/GPS tidak ikut (lihat Out of Scope)
- License counter **RFID/NFC/BLE/GPS**
- Pairing/Usage — scan TAG yang sudah Active/Available dari entry point manapun (§6) untuk dipasangkan ke asset/user/grup (bukan discovery); untuk RFID/NFC/QR
- Status machine TAG (berlaku sama untuk RFID/NFC/BLE/GPS)

**Out of Scope:**
- Pairing TAG ke asset/user/grup — dilakukan di masing-masing modul (GS TAG hanya menyediakan Activation, bukan pairing UI)
- Edit atau Delete TAG dari registry
- Hardware management — lihat modul Hardware
- TAG provisioning (Add Stock/Import di Admin Console) — tetap prasyarat untuk Jalur A; Jalur B tidak butuh ini
- **Combine & Separate untuk BLE/GPS** — BLE/GPS adalah standalone tracker (bukan chip yang bisa digabung fisik dengan RFID/NFC/QR maupun sesama BLE/GPS); Combine & Separate (§7.6) tetap RFID/NFC/QR saja
- **Pemasangan (pairing) BLE/GPS ke asset** — bukan lewat entry point scan-based §6 (itu tetap RFID/NFC/QR); dimiliki addon Tracking/Maps di sisi FAMS, lihat §1.3 catatan
- **Audit TAG untuk GPS** — GPS tidak punya mekanisme re-scan/re-verifikasi fisik (registrasi murni via IMEI import/manual saat Activate, tidak seperti RFID/NFC/BLE yang genuinely discan pakai reader/Bluetooth); konsisten `Admin-Console/PRD/tag-stock/01-overview.md` §5.4. **RESOLVED (2026-07-24):** GPS tetap bisa Damaged/Missing (via F-TAG-09), tapi recovery-nya otomatis lewat event pairing/pemakaian berikutnya dari FAMS/Supply — bukan lewat Audit. Detail: `03-functional.md` F-TAG-09

### 1.5 UI Visibility per Capability

> Lapis **UI** (Show / Hidden / Disabled per role GS) — `prd-conventions.md` §18.4–18.5. Akses dikontrol capability **"Manage TAG"** (key `manage_tag`): hanya **Read** (lihat registry) + **Update** (aksi tulis: Audit, Combine, Separate). Tidak ada Create/Delete (registry read-only). Berbeda dari Data visibility (`03-functional.md`). Disabled wajib tooltip 🔖.

| Elemen UI | Total Control | Read Only | Manage TAG (individual capability) |
|-----------|:-------------:|:---------:|:------------------------------------:|
| Menu **TAG** (All TAGs + Combine & Separate) | Show | Show | Show jika Read; selain itu Hidden |
| Tabel registry (All / Paired / Not Paired) | Show | Show | Show jika Read |
| License counter RFID/NFC/BLE/GPS | Show | Show | Show jika Read |
| `Search by Scan` (tab All / Paired / Not Paired) | Show | Show | Show jika Read |
| Button `[+ Activate TAG]` | Show | Hidden | Show jika Update; selain itu Hidden — 🔒 + tooltip plan minimum jika Starter (§3.5 `03-functional.md`) |
| Button `[Audit TAG]` | Show | Disabled 🔖 | Show jika Update; selain itu Disabled 🔖 |
| Halaman/aksi `Combine & Separate TAG` (`[Scan TAG]`, `[Submit]`, `[Remove]`) | Show | Disabled 🔖 | Show jika Update; selain itu Disabled 🔖 |
| Event Log icon | Show | Show | Show jika Read |

> Tidak ada `[+ Create]` maupun `Delete` bergaya form-CRUD di modul TAG (registry tetap read-only secara langsung — TAG baru hanya masuk lewat `[+ Activate TAG]`, bukan input manual field-per-field). Tooltip 🔖 elemen Disabled: `"You don't have permission to edit"`. Plan gating (Starter = RFID/NFC/BLE/GPS terkunci 🔒) **terpisah** dari permission — lihat `03-functional.md` §3.5.
> **Defense-in-depth:** UI hide bukan pengganti server gate — lihat `03-functional.md`.

---

## 2. Struktur Modul

```
Global Settings > TAG
│
├── All TAGs
│   ├── [+ Activate TAG] — satu jalur aktivasi tunggal (Jalur A/B, §5), toolbar tab All
│   ├── Tab: All        — semua TAG, semua status
│   ├── Tab: Paired     — hanya TAG berstatus Paired
│   └── Tab: Not Paired — Available + Reserved + To be Returned + Damaged/Missing + Retired
│
└── Combine & Separate TAG
    └── Halaman dengan Action dropdown
```

---

## 3. Tipe TAG

### 3.1 TAG Type — Derivasi dari Identifier Fisik

"TAG Type" **bukan field enum tersimpan** — dia label yang **diturunkan (derived)** dari kolom identifier mana yang terisi pada satu `tag_code` (RFID Code / NFC Code / QR Code / BLE Address / GPS IMEI, §7.1).

- **RFID, NFC, QR** — bisa saling dikombinasikan lewat **Combine & Separate** (§7.6): satu `tag_code` bisa membawa 1, 2, atau ketiga identifier ini sekaligus (fisik digabung jadi satu unit). Menghasilkan 7 kemungkinan non-kosong dari 3 elemen ini.
- **BLE, GPS** — masing-masing **selalu standalone**, tidak pernah tergabung dengan identifier lain (lihat catatan fisik di bawah).

Identifier dasar — cuma 5 kolom ini yang benar-benar "didefinisikan"; kombinasi (RFID & NFC, RFID & QR, NFC & QR, RFID & NFC & QR) **tidak perlu didefinisikan terpisah**, karena masing-masing identifier tetap dirinya sendiri (RFID Code tetap RFID Code, NFC Code tetap NFC Code) — label "TAG Type" gabungan cuma string hasil concat kolom mana yang terisi, bukan entitas baru:

| Identifier | Kolom |
|-----------|-------|
| RFID | RFID Code |
| NFC | NFC Code |
| QR | QR Code |
| BLE | BLE Address |
| GPS | GPS IMEI |

> **Kenapa combo tidak perlu didefinisikan:** karena RFID/NFC/QR yang di-Combine (§7.6) tetap berada di **satu `tag_code`/baris yang sama** (bukan entitas gabungan baru) — scan salah satu identifier pada baris itu **otomatis berlaku untuk semua identifier lain di baris yang sama** (`last_scanned_at` ter-update untuk baris tsb, bukan per-identifier), karena secara data cuma ada satu row dengan banyak kolom identifier terisi. Jadi "RFID & NFC ter-scan bersamaan" bukan mekanisme baru yang perlu dibangun — itu konsekuensi alami dari satu row dipakai bareng oleh beberapa identifier.
>
> **BLE dan GPS tidak combinable** — baik dengan RFID/NFC/QR maupun sesama BLE/GPS. Keduanya adalah tracker aktif bertenaga baterai, secara fisik tidak bisa difusikan jadi satu unit dengan chip pasif RFID/NFC atau stiker QR — tidak muncul di §7.6 Combine & Separate. Aturan ini murni soal **fisik 1 unit TAG**, berbeda dari kewajiban TAG per Asset Name di Fixed-Asset (`Fixed-Asset/PRD/settings-asset-name/`) yang memperbolehkan 1 aset dipasangi banyak TAG terpisah (termasuk kombinasi BLE/GPS dengan tipe lain) — itu soal berapa banyak TAG yang dipasang ke satu aset (relasi one-to-many di sisi Asset), bukan soal fusi fisik satu unit TAG di modul ini.

### 3.2 Type — Kategori Penggunaan

**Jalur A** (SKU dipilih, TAG Type apa pun): `is_user_tag` ikut dari SKU tsb (`sku.is_user_tag`, boolean — **hanya 2 nilai**, bukan enum 4-nilai), ditentukan Admin Console saat SKU di-provisioning. **Read-only di GS.**

**Jalur B, TAG Type = RFID** (SKU dikosongkan/BYO): tidak ada SKU untuk diturunkan — Client memilih sendiri lewat field "Type" di halaman Activate TAG (Radio: Object TAG | User TAG, wajib, §7.8 — bagian dari Self-Purchased Template atau inline resolve baris "Needs Info"), tersimpan langsung ke `tag_units.is_user_tag` baris baru. RFID **satu-satunya** TAG Type dengan pilihan ini — mirror `hardware-allocation/01-overview.md` §5.2b yang juga cuma split Object/User untuk Category RFID (2 `item_type` bernilai bisnis beda, `TAG_RFID_OBJECT`/`TAG_RFID_USER`).

**Jalur B, TAG Type = NFC/BLE/GPS** (SKU dikosongkan/BYO): tidak ada field Type di Template/inline resolve — `is_user_tag` **otomatis `false` (Object TAG)**, tidak ada pilihan. Ketiga TAG Type ini belum punya kebutuhan bisnis untuk dipakai sebagai User TAG (beda harga/quota terpisah); kalau kebutuhan itu muncul nanti, perlu keputusan arsitektur terpisah (perluasan split Object/User ke `hardware-allocation` juga, bukan cuma GS).

Sekali diaktivasi (jalur mana pun, TAG Type apa pun), `is_user_tag` tetap **read-only** — tidak bisa diedit setelahnya dari GS maupun Admin Console.

| Type | Deskripsi |
|------|-----------|
| Object TAG | Digunakan untuk asset (FAMS) maupun group/SKU (Supply) — pairing ke Group/SKU **tetap kategori Object TAG**, Admin Console tidak punya Type terpisah untuk Group/SKU |
| User TAG | Digunakan untuk identifikasi user |

> Admin Console cuma punya 2 kategori (`is_user_tag` true/false). "Pair Group TAG"/"Pair SKU TAG" (§6) adalah **nama aksi pairing** di Supply — bukan Type tersendiri; TAG yang dipasangkan tetap ber-Type `Object TAG`.

---

## 4. License System (derived dari alokasi Admin Console — bukan aktivasi/pembelian manual)

> **Bukan license key yang diaktifkan client.** "License"/kuota di sini **100% derived** dari `stock_ledger.balance` milik client ini per tipe RFID/NFC/BLE/GPS — hasil kumulatif Hardware Allocation yang sudah dikirim Distributor/Partner/Principal ke client ini (termasuk via Local Registration). Tidak ada tombol "activate license" atau input key di GS — begitu Distributor/Partner mengalokasikan unit baru di Admin Console, angka "total" di sini otomatis naik real-time (reflected read, bukan copy/cache).

| Teknologi | Kuota (derived) | Limit |
|-----------|------------------|-------|
| RFID | Ya — **2 pool terpisah**, `stock_ledger[client][rfid][object].balance` & `stock_ledger[client][rfid][user].balance` (RFID satu-satunya TAG Type dengan split Object/User, §3.2 — mirror `hardware-allocation`) | Aktivasi baru ditolak jika limit pool yang bersangkutan tercapai (pool ditentukan `is_user_tag` baris, §3.2) |
| NFC | Ya — `stock_ledger.balance` client ini, direfleksikan dari Admin Console (1 pool, selalu Object TAG) | Aktivasi baru ditolak jika limit tercapai |
| BLE | Ya — `stock_ledger.balance` client ini, direfleksikan dari Admin Console (1 pool, selalu Object TAG) | Aktivasi baru ditolak jika limit tercapai |
| GPS | Ya — `stock_ledger.balance` client ini, direfleksikan dari Admin Console (1 pool, selalu Object TAG) | Aktivasi baru ditolak jika limit tercapai |
| QR | Tidak — generate bebas (hard cap Starter = asset cap, beda mekanisme) | Tidak ada limit selain hard cap Starter — tetap dapat **card counter** (§7.1) untuk adopsi, bukan untuk gating |

Counter ditampilkan di halaman All TAGs sebagai **6 License Counter Cards** (§7.1, klik = filter — RFID split jadi 2 card supaya sejalan dengan 2 pool kuotanya):
- **RFID – Object TAG: [aktif] / [total unit teralokasi pool Object]**
- **RFID – User TAG: [aktif] / [total unit teralokasi pool User]**
- **NFC: [aktif] / [total unit teralokasi]**
- **BLE: [aktif] / [total unit teralokasi]**
- **GPS: [aktif] / [total unit teralokasi]**
- **QR: [paired] / [total Asset License]** — formula beda, lihat §7.1 (bukan kuota TAG, tapi adopsi QR terhadap kapasitas Asset License)

"Aktif" = semua TAG bertipe & pool bersangkutan yang sudah masuk registry, kecuali status Retired ("RFID – Object TAG" cuma hitung baris RFID dengan `is_user_tag=false`, dst.). "Total unit teralokasi" = `stock_ledger.balance` pool bersangkutan, real-time, bukan angka yang di-cache di GS. Klik card "RFID – Object TAG" = filter baris TAG Type RFID **dan** Type Object TAG sekaligus (compound, beda dari 4 card lain yang cuma filter 1 dimensi TAG Type) — multi-select antar card tetap OR (mis. card "RFID – Object TAG" + card "NFC" aktif bersamaan = tampilkan baris RFID-Object **atau** NFC).

> **Keputusan — Damaged/Missing tetap menghitung kuota.** TAG berstatus Damaged/Missing **tetap** masuk hitungan kuota (TAG fisik dianggap masih ter-provisioning). Satu-satunya jalan melepas slot: TAG **ditemukan → Available → Retire** (via Supply). TAG tidak bisa dihapus dari registry. Implikasi operasional: akumulasi TAG hilang/rusak permanen mengurangi kuota efektif — client perlu **meminta alokasi tambahan ke Distributor/Partner** (bukan "beli/aktivasi lisensi" sendiri) bila perlu.
>
> **GPS — jalur "ditemukan" di atas tidak berlaku dengan cara yang sama.** "Ditemukan" untuk RFID/NFC/BLE berarti lolos Audit TAG; GPS tidak punya Audit (§1.4, §5). GPS bisa jadi Damaged/Missing lewat transaksi FAMS/Supply (§9 F-TAG-09 `03-functional.md`) — **RESOLVED (2026-07-24):** jalan baliknya **otomatis**, bukan manual — begitu FAMS/Supply mengirim event pairing/pemakaian baru untuk unit GPS tsb, status lanjut apa adanya (bukan diblok oleh Damaged/Missing sebelumnya), setara perlakuan "ditemukan" tapi lewat sinyal pemakaian, bukan scan. Detail: `03-functional.md` F-TAG-09.

---

## 5. Aktivasi TAG (Jalur A/B)

> **Revisi 2026-07-15**: sebelumnya TAG fisik masuk registry secara implisit lewat scan di entry point manapun ("Discovery"). Sekarang **satu jalur tunggal**: tombol `[+ Activate TAG]` di toolbar All TAGs — mendukung **Jalur A** (device dari rantai distribusi, sudah diregister via Add Stock/Import Admin Console) maupun **Jalur B/BYO** (Client beli sendiri, aktivasi mandiri pakai kuota) — konsisten pola Hardware (`admin-console-foundation.md` Keputusan 7, `Global-Settings/PRD/hardware/01-overview.md` §4). Berlaku untuk **RFID/NFC/BLE/GPS** — QR digenerate langsung di client (tidak lewat Activate TAG, §1.4).
>
> **Revisi (BLE/GPS parity):** BLE/GPS mengikuti alur Jalur A/B yang identik RFID/NFC di bawah — pilihan `TAG Type` bertambah, Device Name diambil dari kategori Device Catalog yang sesuai, dan identifier yang di-scan/input beda mekanisme per teknologi (§5.1). Underlying `tag_units`/`identifier_type` di Admin Console sudah generik untuk **kelima tipe TAG** sejak `device-catalog-schema.md` (Status: Final) — tidak perlu perubahan skema di sisi Admin Console.

### 5.1 Alur Aktivasi

> **Bulk, staging, deferred submit** — Activate TAG adalah **halaman** (bukan popup single-item), reuse pola scan-ke-tabel yang sudah established di Combine & Separate (§7.6): pilih config sesi sekali → scan berkali-kali (Multi/Batch mode, `_foundation/scan-foundation.md` §4.3) → tiap identifier masuk sebagai baris dengan status ter-resolve real-time → resolve baris bermasalah → `[Submit]` sekali di akhir untuk commit semua baris sekaligus (re-validasi server per baris saat commit, partial commit — baris yang gagal tidak menggagalkan baris lain).
>
> **Source tetap dua konsep (Official/Self-Purchased), tapi sekarang per-baris otomatis, bukan pilihan radio di depan**: sistem coba match tiap identifier ke `tag_units` begitu discan (real-time) — match → baris "Official"; tidak match → pakai **Self-Purchased Template** (diisi sekali di atas, opsional) sebagai default, atau kalau Template kosong → baris ditandai "Needs Info" menunggu diisi manual. Ini menggantikan radio Source yang tadinya dipilih di depan (versi single-item) — di versi bulk, hasil per-baris bisa bermacam-macam dalam satu sesi (sebagian match resmi, sebagian tidak), jadi tidak masuk akal dikunci ke 1 pilihan Source per sesi.

```
Klik "+ Activate TAG"
    │
    ▼
Popup: "Ready to Activate a TAG" (info ringkas + checkbox "Don't show this again" —
    muncul kalau belum pernah dismiss, skip langsung ke halaman kalau sudah dicentang;
    preferensi per user, tersimpan di cache browser)
    └── [Continue] → Halaman "Activate TAG" (full page, breadcrumb — bukan modal,
          konsisten pola Combine & Separate §7.6)
    │
    ▼
Pilih TAG Type (wajib, Radio: RFID/NFC/BLE/GPS) — session-level, mengunci kategori
    Device Catalog untuk seluruh sesi (tidak bisa dicampur beda TAG Type dalam 1
    sesi scan, sama prinsip Combine & Separate yang kunci ke 1 Action per sesi).
    Helper text sisa kuota (`[remaining] of [total] [Type] TAG licenses remaining`,
    sumber sama License Counter Card, §4/§7.1)
    **Blocking state — kuota 0 diketahui di awal sesi (koreksi 2026-08-04):**
    beda dari race condition di tengah sesi (yang tetap ditangani guard existing
    di real-time-check per baris & Langkah 0 Submit, tidak berubah) — kalau
    kuota TAG Type ini **sudah** 0 tepat saat radio dipilih (sebelum scan
    pertama), `[Scan TAG]` (RFID/NFC/BLE) atau Upload File/Manual Entry (GPS)
    **disabled** dengan tooltip 🔖 `"No quota available for this TAG Type.
    Contact your administrator or request more allocation."` — mencegah sesi
    scan (bisa makan waktu lama, terutama BLE/Handheld fisik di lapangan)
    berjalan sia-sia sampai baru ketahuan gagal di titik Submit. **NFC/BLE/GPS**:
    dicek langsung dari 1 angka pool tunggal begitu radio dipilih. **RFID**:
    genuinely 2 pool (Object/User, §3.2) — diblok hanya kalau **keduanya** 0
    (Object **dan** User sama-sama exhausted); kalau salah satu masih ada sisa,
    scan tetap diizinkan berjalan seperti biasa (baris yang match ke pool
    kosong tetap kena badge "Error" per baris seperti sebelumnya, guard
    existing tidak berubah) — sistem tidak bisa tahu di muka pool mana yang
    bakal dipakai tiap scan sebelum SKU/Type baris itu diketahui. Cek dijalankan
    ulang tiap radio TAG Type di-pilih (termasuk pilih ulang), bukan polling
    realtime selama sesi berjalan.
    │
    ▼
[Opsional, collapsed default] "Self-Purchased Template" — **disabled/tidak bisa
    di-expand sampai TAG Type dipilih** (tooltip 🔖 "Select a TAG Type first.") —
    Device Name di dalamnya bergantung kategori TAG Type, tidak ada kategori untuk
    difilter kalau TAG Type masih kosong. Begitu TAG Type dipilih, expand kalau
    Client tahu sesi ini bakal ada TAG yang tidak match stok resmi:
    ├── Device Name* (wajib kalau di-expand) — dari Device Catalog kategori TAG Type
    ├── SKU (opsional) — dropdown searchable Device Catalog; ada icon [✕ clear] di
    │     field begitu terisi (lihat perilaku clear di bawah). Kosongkan untuk BYO
    │     generik; tag_units.sku_id tetap NULL selamanya (tidak ada auto-assign
    │     generic, §9.8 device-catalog-schema.md)
    ├── Brand* + Model — **selalu tampil**, terlepas SKU terisi atau tidak:
    │     ├── SKU terisi → auto-filled dari data SKU (Brand/Model) + **disabled**
    │     │     (read-only, bukan input manual — nilai ikut SKU yang dipilih)
    │     └── SKU kosong → editable, Brand wajib diisi manual, Model opsional
    ├── [Khusus TAG Type=RFID] Type (Radio: Object TAG | User TAG) — **selalu
    │     tampil** untuk RFID, mengikuti pola sama dengan Brand/Model:
    │     ├── SKU terisi → auto-filled dari `sku.is_user_tag` + **disabled**
    │     └── SKU kosong → editable, wajib dipilih (RFID satu-satunya TAG Type
    │           dengan 2 pool kuota terpisah, §3.2 — tanpa SKU, sistem butuh
    │           input manual buat tahu ini masuk pool mana)
    └── **Clear SKU** (klik `[✕]` di field SKU) → SKU kembali kosong; Brand/Model/
          Type (RFID) balik jadi **editable & ter-reset kosong** (bukan restore
          nilai lama sebelum SKU dipilih — mencegah data derived SKU lama
          nyangkut diam-diam), user isi ulang manual dari nol
    Diisi **sekali** di awal sesi, dipakai berulang sebagai default identitas untuk
    baris manapun yang nanti tidak match — bukan diisi ulang per-baris.
    **Tidak retroaktif** (untuk field identitas — Device Name/SKU/Brand/Model): baris
    "Needs Info" yang sudah ada di tabel **tidak** ikut ter-resolve otomatis kalau
    Template baru diisi belakangan (tetap "Needs Info" sampai diresolve manual, atau
    di-Remove lalu discan ulang — scan ulang otomatis re-check ke Template terbaru).
    Sebaliknya, baris "Self-Purchased" yang sudah terbentuk dari Template juga
    **tidak** ikut berubah kalau Template diedit belakangan — nilainya snapshot saat
    baris dibuat, bukan live binding. **Pengecualian sempit khusus field Type (RFID)**:
    guard kuota (bukan identitas) memang retroaktif untuk baris yang tertunda murni
    karena Type belum diketahui — pool RFID genuinely tidak bisa divalidasi tanpa
    Type, beda dari kenyamanan UX Template pada umumnya (§3.2 `03-functional.md`)
    **Stale reference saat Submit** (D6, §5.7 `error-handling-convention.md`): beda dari
    "tidak retroaktif" di atas (itu soal Template diedit **oleh user yang sama** di sesi
    yang sama) — ini soal Device Name/SKU yang dipilih di Template **dihapus/dinonaktifkan
    dari Device Catalog** (Admin Console) oleh pihak lain persis di antara Template diisi
    dan `[Submit]` diklik. Server re-validasi tiap referensi saat Submit — stale →
    `422` field-level per baris, tidak all-or-nothing (baris lain tetap commit); baris
    terdampak kembali ke "Needs Info", Template/dropdown terkait auto-clear + re-fetch
    opsi terbaru (§4.7 `04-data.md`).
    │
    ▼
**[RFID/NFC/BLE]** [Scan TAG] → **langsung masuk scan, tanpa overlay pilih
    metode** (TAG Type sudah terkunci session-level, jadi cuma ada 1 metode
    capture yang valid — beda dari Combine & Separate/Audit yang masih butuh
    overlay karena metodenya bisa lebih dari satu dalam 1 sesi) → Shared Scan
    Component, mode Multi/Batch (scan-foundation.md §4.3) — live counter, terus
    mendengarkan sampai [Stop]. Mekanisme capture beda per TAG Type
    (device-catalog-schema.md §identifier type): RFID=scan TID, NFC=scan UID,
    BLE=scan/pair Bluetooth (radio native mobile atau reader tersambung di web,
    scan-foundation.md §2/§5.5) — **tidak ada fallback input manual**, EPC/UID/
    MAC tidak dirancang untuk diketik manusia (scan-foundation.md §4.8).
**[GPS]** **bukan** Shared Scan Component — registrasi TAG GPS di luar scope
    live scan (scan-foundation.md §4.8/§5.6: "itu Import/Manual, di luar scope
    dokumen ini"). Input **Upload File** (.csv/.xlsx, kolom `IMEI` — download
    template tersedia) **atau Manual Entry** (ketik IMEI satu per satu,
    `[+ Add]`), identik pola `Admin-Console/PRD/tag-stock/02-ui-design.md` §4b.
    Sebelum masuk tabel staging utama, tiap entri lolos **Preview** — **2
    pengecekan pertama murni client-side** (format 15-digit numerik + duplikat
    dalam batch yang sama — kemunculan pertama diproses normal, kemunculan
    kedua dst. ditandai "Duplicate in File" dan tidak lanjut; format bukan 15
    digit → "Invalid Format", tidak lanjut), sama persis logic
    `tag-stock/02-ui-design.md` §4b.2. **Entri yang lolos kedua pengecekan itu
    langsung memanggil real-time match-check** (endpoint sama dengan yang
    dipakai scan RFID/NFC/BLE di bawah, per-IMEI langsung, bukan ditunda
    sampai baris masuk tabel staging) untuk menentukan badge Preview "OK"
    (tidak collision) vs "Waiting for Approval" (collision terdeteksi) — jadi
    Preview **bukan murni client-side** untuk kedua status ini, cuma 2
    pengecekan formatnya yang client-side (`02-ui-design.md` §"Halaman:
    Activate TAG — GPS"). Respons match-check yang sama ini yang dipakai ulang
    (bukan panggilan kedua) begitu entri diteruskan masuk tabel staging utama.
    │
    ▼
Tiap identifier masuk (scan untuk RFID/NFC/BLE; Upload/Manual Entry yang lolos
    Preview untuk GPS) → **real-time match-check** server (ringan — cek
    existence & kuota, BUKAN commit/write) → baris masuk tabel dengan status:
    │
    ├── Match ke tag_units terdaftar → badge **"Official"** [biru]; kolom
    │     "Device Name"/"SKU"/"Brand"/"Model/Type" auto-terisi dari unit yang match
    │
    ├── Tidak match, Self-Purchased Template terisi (`byo_activation_enabled=true`)
    │     → badge **"Self-Purchased"** [kuning]; kolom "Device Name"/"SKU"/"Brand"/
    │     "Model/Type" dari Template
    │
    ├── Tidak match, Template kosong, `byo_activation_enabled=true` → badge
    │     **"Needs Info"** [yellow]; kolom "Device Name"/"SKU"/"Brand"/"Model/Type"
    │     kosong — baris ini **memblok Submit** sampai diresolve
    │
    ├── Tidak match, `byo_activation_enabled=false` → badge **"Error"** [merah];
    │     tooltip "Not in your official stock; self-purchased activation is not
    │     enabled for your account." — baris ini **tidak memblok Submit**, otomatis
    │     di-exclude dari commit (lihat perilaku Submit di bawah). Badge
    │     **"Self-Purchased" tidak pernah muncul** kalau `byo_activation_enabled=false`
    │     — section Template locked (§7.8), jadi tidak ada default identitas yang
    │     bisa dipakai baris tidak match
    │
    └── Kuota tipe ini sudah exceeded saat scan ke-N (real-time check) → baris tetap
          masuk tabel dengan badge **"Error"** [merah]: "License limit reached" —
          sesi scan **tidak berhenti**, TAG berikutnya masih bisa discan (kuota
          exceeded bukan alasan stop total, cuma baris itu yang kena)

**Identifier match TAG yang sudah aktif di client ini sendiri** (bukan match `tag_units`
    yang belum diaktivasi, tapi match baris `TAG` registry milik client ini dari sesi
    Activate TAG sebelumnya) → **toast error real-time, TIDAK masuk tabel sama sekali**
    (beda dari 5 outcome di atas — mirror pola "TAG tidak dikenali", §8): `"Error, TAG
    is already activated."` — sesi scan **tidak berhenti**, TAG berikutnya masih bisa
    discan. **Khusus untuk client sendiri** (beda dari collision lintas-client, yang
    tetap lewat jalur Waiting for Approval di Submit, bukan toast — lihat §5.1 di
    bawah): risiko manufacturing-collision antara 2 chip fisik berbeda yang kebetulan
    identifier-nya sama jauh lebih kecil kalau keduanya kebetulan dipegang **client
    yang sama** dibanding lintas seluruh platform, jadi aman langsung ditolak tanpa
    approval — kemungkinan besar ini scan ulang TAG yang sama secara tidak sengaja
    (mis. double-scan device fisik yang sudah pernah diaktivasi)
    │
    ▼
[Stop] → sesi scan berhenti (atau otomatis berhenti sesuai aturan Scan Foundation),
    kembali ke halaman dengan tabel terisi
    │
    ▼
Baris **"Needs Info"** → row action `[Resolve]` → **Row Edit Mode** (bukan Dialog/popup,
    mirror Import `import/02-ui-design.md` State C4): sel Device Name*/SKU/Brand*/
    Model/Type di baris itu jadi input aktif (field-set identik Template) — isi khusus
    baris itu (tidak memengaruhi Template atau baris lain, Template tidak retroaktif —
    §7.8) → `[Save]` → badge berubah jadi "Self-Purchased" [kuning]
    │
    ▼
**Bulk Resolve — banyak baris "Needs Info" beridentitas sama** (ditambahkan 2026-08-04,
    menutup gap UX "harus resolve satu-satu secara serial" untuk sesi dengan banyak
    device BYO dari brand yang sama): checkbox muncul **cuma di baris berbadge "Needs
    Info"** (kolom checkbox kosong untuk Official/Self-Purchased/Error — badge lain
    tidak butuh bulk resolve). Centang ≥1 baris Needs Info → bulk action bar muncul di
    atas tabel dengan tombol `[Resolve Selected]`:
    ├── Klik `[Resolve Selected]` → **Bulk Resolve Mode** (bukan Dialog/popup — panel
    │     inline di atas tabel, field-set identik Template/Row Edit Mode: Device
    │     Name*/SKU/Brand*/Model/Type, diisi **sekali** untuk seluruh baris terpilih)
    ├── Kolom Actions **hilang dari seluruh tabel** & toolbar (`[Scan TAG]`/`[Remove]`/
    │     Upload/Manual Entry) **disabled** selama sesi aktif — **sama prinsip** dengan
    │     Row Edit Mode single-row (mencegah baris baru masuk staging/state berubah di
    │     tengah sesi resolve, D6 §5.1) — checkbox baris Needs Info lain (di luar yang
    │     sudah terpilih sebelum panel dibuka) ikut disabled, tidak bisa nambah/kurangi
    │     seleksi sambil panel terbuka
    ├── Footer panel: `[Cancel]` `[Apply to N rows]` (N = jumlah baris terpilih)
    └── Klik `[Apply to N rows]` → validasi field (sama rule Template) → lolos → **semua
          N baris** ter-update sekaligus: badge → "Self-Purchased" [kuning], kolom
          Device Name/SKU/Brand/Model/Type terisi nilai yang sama persis (snapshot saat
          Apply, **bukan** live binding — konsisten prinsip Template tidak retroaktif,
          baris ini tetap bisa dikoreksi individual lewat `[Edit]` sesudahnya) → panel
          tertutup, checkbox & bulk action bar hilang, kolom Actions & toolbar normal
          kembali
    **Tetap ada Row Edit Mode single-row** (di atas) untuk baris yang butuh identitas
    beda-beda satu per satu — Bulk Resolve murni **opsi tambahan** untuk kasus banyak
    baris dengan identitas sama, bukan pengganti. Kedua mode saling eksklusif dengan
    scan/Remove dan dengan Row Edit Mode single-row (cuma 1 sesi edit — single atau
    bulk — aktif dalam satu waktu, prinsip sama D6 di atas).
    │
    ▼
Baris **"Self-Purchased"** (dari Template maupun hasil `[Resolve]`/`[Edit]` sebelumnya)
    → row action `[Edit]` → Row Edit Mode yang sama: sel Device Name/SKU/Brand/Model/
    Type pre-filled, koreksi langsung di baris tanpa perlu Remove + scan ulang. **Tidak
    berlaku** untuk badge "Official" (data ikut match `tag_units`, bukan input manual —
    tidak ada yang bisa dikoreksi)
    │
    ▼
**[RFID/NFC/BLE]** [Remove] → **scan-based**, sama pola Combine & Separate
    (§7.6) — **bukan** pilih baris manual (checkbox/klik baris): klik [Remove]
    → sesi scan mode Remove (Shared Scan Component, langsung tanpa overlay
    pilih metode — TAG Type sudah terkunci session-level, sama seperti
    [Scan TAG]) → identifier yang di-scan ulang dicocokkan ke Code baris
    staging → baris yang match dihapus dari tabel (kalau ada, termasuk baris
    "Error" — cara satu-satunya menghilangkan baris Error, karena Error tidak
    bisa "diperbaiki" jadi Self-Purchased kalau `byo_activation_enabled=false`).
    Memastikan baris yang terhapus akurat sesuai fisik TAG di tangan, bukan
    salah pilih baris mirip di tabel yang sudah panjang
**[GPS]** [Remove] tetap **manual** (pilih baris di tabel, klik Remove) — GPS
    tidak pernah discan (§4.8/§5.6 `scan-foundation.md`), jadi Remove by Scan
    tidak applicable; baris GPS (termasuk "Error") dihapus lewat pilih baris
    langsung
    │
    ▼
[Submit] — **disabled selama masih ada baris "Needs Info"** yang belum diresolve
    atau di-Remove. Baris "Error" TIDAK memblok tombol Submit (otomatis di-exclude
    dari commit, tetap tampil di tabel sebagai catatan setelah Submit)
    │
    ▼
Klik [Submit] → **Langkah 0 — Guard Kuota Agregat (pre-check, sebelum commit apa pun
    dimulai)**: hitung total baris non-Error per kategori kuota (RFID–Object/
    RFID–User/NFC/BLE/GPS) yang akan di-submit, bandingkan terhadap sisa kuota
    **terbaru** (re-fetch, bukan angka real-time-check yang mungkin sudah basi) →
    │
    ├── **Ada ≥1 kategori kekurangan** (baris yang di-submit > sisa kuota kategori
    │     itu) → **Submit dibatalkan sepenuhnya, TIDAK ada baris yang commit** →
    │     **Dialog "Insufficient Quota"** menampilkan breakdown kategori mana yang
    │     kurang + selisihnya (§7.8/§8 `02-ui-design.md`) → User klik `[OK]` →
    │     dialog tutup, angka kuota di halaman (License Counter Card, helper text
    │     TAG Type) **refresh** ke nilai terbaru → User perlu `[Remove]` (scan-based
    │     RFID/NFC/BLE; manual GPS) beberapa baris sampai muat kuota, lalu klik
    │     `[Submit]` lagi
    │
    └── **Semua kategori cukup** → lanjut ke commit di bawah (atomik, tetap ada
          re-validasi kuota final — lihat guard pertama di bawah — sebelum benar-benar
          menulis, karena angka Langkah 0 di atas bisa sudah basi)
    │
    ▼
**Commit (atomik — satu transaksi mencakup semua baris non-Error yang lolos Langkah 0)**:
    │
    ├── Guard — Kuota Agregat, re-validasi FINAL tepat sebelum menulis (bukan pakai
    │     angka pre-check Langkah 0 yang mungkin sudah basi — bisa ada sesi lain yang
    │     keburu commit duluan di jendela sempit antara Langkah 0 dan commit ini):
    │     kategori manapun yang ternyata sudah tidak cukup lagi → **seluruh commit
    │     dibatalkan (rollback), TIDAK ada baris yang ter-commit** — hasilnya identik
    │     Langkah 0: Dialog "Insufficient Quota" breakdown kategori lagi, tabel staging
    │     tetap utuh, user `[Remove]` baris lalu `[Submit]` ulang. **Bukan** partial
    │     commit — kuota exceeded selalu all-or-nothing (baik di Langkah 0 maupun di
    │     titik commit ini), karena keduanya sama-sama cek agregat vs sisa kuota,
    │     bukan per baris
    │
    ├── Lolos re-validasi kuota final → **re-validasi per baris** untuk hal lain yang
    │     genuinely independen antar baris (bukan agregat) — masih bisa gagal
    │     individual, baris lain dalam sesi yang sama **tetap lanjut diproses**
    │     (partial commit, konsisten prinsip "sesi dapat dilanjutkan, TAG yang sudah
    │     valid tetap ada" — berlaku di sini, bukan di guard kuota di atas):
    │     ├── Identifier keburu diaktivasi via sesi lain (race) → baris ini "Failed":
    │     │     "This identifier has already been activated."
    │     └── `byo_activation_enabled` berubah `false` di antara scan dan Submit
    │           (race, jarang) → baris "Self-Purchased" ini "Failed": "Self-purchased
    │           device activation is not enabled for your account."
    │
    ├── Badge "Official" (match tag_units) → commit Jalur A: Available, write-back
    │     tag_units.status: active → in_use + INSERT tag_usage, atomik dengan
    │     INSERT baris registry GS
    │
    ├── Badge "Self-Purchased" (dari Template atau inline resolve) → commit Jalur B:
    │     tag_units baru dibuat di Admin Console (`public` schema) dengan
    │     device_name_id terisi, sku_id sesuai pilihan (NULL jika dikosongkan —
    │     byo_brand/byo_model_type terisi sebagai gantinya), is_user_tag dari Type
    │     (RFID) atau otomatis false/Object TAG (NFC/BLE/GPS)
    │
    ├── Baru ketahuan match tag_units saat commit (race — unit itu baru diregister
    │     resmi setelah scan awal tapi sebelum Submit) → auto-switch ke Jalur A,
    │     kolom Device Name/SKU/Brand/Model/Type di-override, ditandai di ringkasan
    │     hasil (lihat di bawah)
    │
    ├── Baru ketahuan collision identifier saat commit (race) → baris jadi
    │     "Waiting for Approval", masuk review **Admin Console > Approvals > TAG
    │     Stock** (reuse Approval Foundation, approver Total Control + Additional
    │     Approver Principal — sama pool §9.2 device-catalog-schema.md). Approval
    │     Subject 1 level, **rule OR** — approval selesai begitu **salah satu**
    │     dari mereka memutuskan (siapa yang mengambil keputusan lebih dulu yang
    │     menutup item ini, approver lain di pool → `Not Involved`), bukan butuh
    │     semuanya setuju (`approval-foundation.md` §1.2)
    │
    └── Baris "Error" (byo disabled atau license limit dari real-time-check) →
          di-exclude dari commit sama sekali, tidak diproses ulang
    │
    ▼
**Hasil per baris ditampilkan di tabel** (halaman TIDAK auto-redirect/tutup):
    ✓ Activated [hijau] (Available) | ⏳ Waiting for Approval [kuning] |
    ✗ Failed [merah] + alasan (mis. "This identifier has already been activated." dari race saat commit — closed list 2 kemungkinan, §7.10)
    — baris yang Activated/Waiting jadi read-only (bagian dari histori sesi ini);
    baris Failed bisa di-Remove lalu discan ulang, atau ditinggal
```

**Tidak ada Timeout Auto-Cancel / Resubmit** untuk status Waiting for Approval — alasan sama persis Hardware/TAG Stock existing (`tag-stock/03-functional.md` §3.2c, `hardware-stock/03-functional.md` §3.9): tidak ada dana/stok direservasi selama menunggu, TAG fisik yang sudah discan tidak "kadaluarsa".

### 5.2 Status Machine

```
[Activate TAG — Jalur A/B, §5.1] ─────────────────────────► [Available]

[Available] ──pair ke asset Draft / Waiting Approval──────► [Reserved]
[Reserved]  ──asset Approved──────────────────────────────► [Paired]
[Reserved]  ──asset Rejected / Deleted────────────────────► [Available]

[Available] ──pair ke user / group / SKU / stock──────────► [Paired]
[Paired]    ──kondisi lepas dari asset (per produk)────────► [To be Returned]
[To be Returned] ──returned via fitur To be Returned──────► [Available]

[Not Paired TAG] ──Audit: tidak ditemukan + checkbox──────► [Damaged/Missing]
[Damaged/Missing] ──Audit: ditemukan saat scan─────────────► [Available]  ← berlaku saat Submit
[Paired TAG] ──transaksi di FAMS / Supply─────────────────► [Damaged/Missing]

[Available] ──Supply settings Retire──────────────────────► [Retired]
[Retired]   ──Supply settings Un-retire───────────────────► [Available]
```

**Write-back ke Admin Console (Aktivasi, fisik RFID/NFC/BLE/GPS).** Saat `[+ Activate TAG]` sukses Jalur A (§5.1), GS menulis `tag_units.status: active → in_use` + INSERT `tag_usage` (`current_holder` loncat ke Client, `device-catalog-schema.md` §9.6) di Admin Console — field ini **dimiliki (owned)** oleh `Admin-Console/PRD/tag-stock/`, tapi transisinya **ditulis dari sini** (GS TAG = satu-satunya penulis event ini, menutup Open Item #1 `tag-stock/05-dependencies.md` untuk bagian fisik — lihat `03-functional.md` §3.2 & §3.7 untuk detail lengkap). Ditulis **atomik** dalam satu transaksi bersama INSERT baris registry GS (`TAG`). Untuk Jalur B, `tag_units` **baru dibuat** (bukan match unit existing) — lihat §5.1 & §9.8 `device-catalog-schema.md`. **QR tidak memicu write ini** — lifecycle QR (Generate/Print/Pair/Retire) tetap dimiliki penuh oleh client console (FAMS/Supply), belum ada mekanisme sync yang final (Open Item #2 `tag-stock/05-dependencies.md`, blocker: PRD FAMS untuk QR belum ada).

**Aturan:**
- Perubahan status via Audit baru berlaku saat Submit (bukan saat scan real-time)
- Audit TAG GS hanya memengaruhi TAG di tab Not Paired
- Paired TAG → Damaged/Missing: hanya via transaksi FAMS/Supply, bukan dari GS
- Reserved, To be Returned, Retired: tidak berubah status dari Audit walaupun tidak ditemukan
- Separate TAG: hanya bisa untuk TAG berstatus **Available**
- Combine TAG: hanya untuk TAG berstatus **Available**; User TAG tidak bisa di-combine

---

## 6. Entry Point Lain (Pairing/Usage — bukan Aktivasi)

> **Revisi 2026-07-15**: section ini sebelumnya bernama "Discovery Sources" — entry point di bawah dulu bisa memasukkan TAG baru ke registry secara implisit. **Sekarang tidak lagi.** Entry point ini murni untuk **pairing/usage** TAG yang **sudah** Available/Active (hasil Activate TAG, §5) — bukan titik masuk aktivasi. Scan identifier yang belum pernah diaktivasi di entry point manapun di bawah → **ditolak**, arahkan user untuk menghubungi Admin (§8) — bukan self-service ke `GS > TAG > Activate TAG`, karena user di entry point ini (User/FAMS/Supply) belum tentu punya capability "Manage TAG" Update yang dibutuhkan Activate TAG (§1.5).

**Precondition (berlaku untuk semua entry point di bawah):**
1. TAG yang di-scan **sudah** ada di registry client ini (hasil Activate TAG) — kalau belum, tolak: `"This TAG hasn't been activated yet. Please contact Admin."` — bukan diarahkan self-service ke Settings > TAG, karena entry point di §6 dipakai lintas modul (User/FAMS/Supply) oleh user yang belum tentu punya capability "Manage TAG" Update untuk Activate TAG sendiri (§1.5) (§8)
2. Jumlah TAG aktif < total unit teralokasi tidak lagi relevan di titik ini — guard kuota sudah dicek tuntas saat Activate TAG (§5.1); entry point ini tidak menyentuh kuota sama sekali

> **BLE/GPS di tabel bawah:** hanya **Audit TAG** mencakup BLE (verifikasi fisik registry via re-scan Bluetooth) — **GPS tidak punya Audit** (tidak ada mekanisme re-scan; IMEI cuma diregister sekali saat Activate, konsisten `tag-stock/01-overview.md` §5.4 Admin Console — Open Item, §12). Combine, Change, Replace, Register Asset > Scan Object TAG, dan Pair User/Group/SKU/Stock tetap **RFID/NFC/QR saja** — pemasangan BLE/GPS ke asset dimiliki addon Tracking/Maps di sisi FAMS, bukan entry point scan-based di sini (§1.3).

### Dari Global Settings:

| Entry Point | Teknologi | Fungsi |
|-------------|-----------|--------|
| TAG > Audit TAG | RFID / NFC / BLE | Verifikasi fisik TAG Not Paired |
| TAG > Combine & Separate TAG | RFID / NFC / QR | Gabung/pisah TAG yang sudah Available |
| User > Create User > Pair User | RFID | Pasangkan TAG Available ke user |
| User > Edit User > Pair User | RFID | Pasangkan TAG Available ke user |

### Dari Fixed Asset:

| Entry Point | Teknologi | Fungsi |
|-------------|-----------|--------|
| TAG > Audit TAG | RFID / NFC / BLE | Verifikasi fisik TAG Not Paired |
| TAG > Combine TAG | RFID / NFC / QR | Gabung TAG yang sudah Available |
| TAG > Change TAG | RFID / NFC / QR | Ganti TAG asset dengan TAG Available lain |
| TAG > Replace TAG | RFID / NFC / QR | Ganti TAG bermasalah dengan TAG Available lain |
| ALL > Register Asset > Scan Object TAG | RFID / NFC / QR | Pasangkan TAG Available ke asset baru |

### Dari Supply Asset:

| Entry Point | Teknologi | Fungsi |
|-------------|-----------|--------|
| Search by Scan | RFID / NFC / QR | Cari TAG Available di registry |
| TAG > Audit TAG | RFID / NFC / BLE | Verifikasi fisik TAG Not Paired |
| TAG > Combine TAG | RFID / NFC / QR | Gabung TAG yang sudah Available |
| TAG > Change TAG | RFID / NFC / QR | Ganti TAG stok dengan TAG Available lain |
| TAG > Replace TAG | RFID / NFC / QR | Ganti TAG bermasalah dengan TAG Available lain |
| Settings > Group > Pair Group TAG | RFID / NFC / QR | Pasangkan TAG Available ke group |
| Settings > Item > Item SKU > Pair SKU TAG | RFID / NFC / QR | Pasangkan TAG Available ke SKU |
| Stock Management > Stock Placement > Initial Stock | RFID / NFC / QR | Pasangkan TAG Available ke stok |
| Stock Management > Stock Placement > Unplaced Stock | RFID / NFC / QR | Pasangkan TAG Available ke stok |
| Reception > Create Receipt > Stock Placement | RFID / NFC / QR | Pasangkan TAG Available ke stok |
| Supplier Return > In Transit > Place Now | RFID / NFC / QR | Pasangkan TAG Available ke stok |
| Internal Return > Handover Step 1 > Place Now | RFID / NFC / QR | Pasangkan TAG Available ke stok |

> Semua entry point di atas (GS/FAMS/Supply) **tidak lagi** menjalankan discovery — kalau identifier yang discan belum pernah diaktivasi, tolak dengan pesan di atas, arahkan ke `Activate TAG` (§5).

---

## 7. Halaman & Komponen UI

### 7.1 All TAGs — Tab All

**License Counter Cards (di atas tabel, menggantikan counter teks + filter toggle terpisah):** 6 card — **RFID – Object TAG**, **RFID – User TAG**, NFC, QR, BLE, GPS (RFID pecah jadi 2 card supaya sejalan dengan 2 pool kuota terpisahnya, §3.2/§4 — satu-satunya TAG Type yang begini). Tiap card **sekaligus filter** — klik card → toggle aktif/nonaktif (multi-select OR): tampilkan baris yang match card yang aktif. Untuk card "RFID – Object TAG"/"RFID – User TAG" spesifik, match-nya **compound** (TAG Type=RFID **dan** Type=Object/User TAG sekaligus), beda dari 4 card lain yang cuma match 1 dimensi (TAG Type saja). Default: semua card nonaktif (semua baris tampil). Card aktif ditandai visual selected (border/background beda).

| Card | Angka | Formula |
|------|-------|---------|
| RFID – Object TAG | `[aktif] / [total unit teralokasi pool Object]` | `stock_ledger[client][rfid][object].balance`; aktif = COUNT baris RFID dengan `is_user_tag=false` — §4 License System |
| RFID – User TAG | `[aktif] / [total unit teralokasi pool User]` | `stock_ledger[client][rfid][user].balance`; aktif = COUNT baris RFID dengan `is_user_tag=true` — §4 |
| NFC | `[aktif] / [total unit teralokasi]` | Sama seperti sebelumnya — §4 |
| BLE | `[aktif] / [total unit teralokasi]` | Sama seperti sebelumnya — §4 |
| GPS | `[aktif] / [total unit teralokasi]` | Sama seperti sebelumnya — §4 |
| **QR** | `[paired] / [total Asset License]` | **Beda formula** — QR tidak dibatasi kuota hardware (§4), jadi bukan rasio "aktif/total unit teralokasi" seperti yang lain. Numerator = jumlah baris QR berstatus Paired; denominator = `asset_license_ledger.total_quantity` (Admin Console `license-allocation/04-data.md` §1.3) — total kuota Asset License FAMS milik client. Ini metrik **adopsi** (berapa banyak aset yang sudah ber-QR dari kapasitas aset yang dilisensikan), bukan metrik kuota TAG |

> Filter beroperasi per baris independen — kalau TAG combined match filter di salah satu identifier-nya, cuma baris identifier itu yang tampil, sibling baris lain (identifier lain dalam combo yang sama) **tidak** ikut ditarik kalau tidak match filter sendiri (konsisten prinsip "baris independen penuh", tidak ada logika jaga-grup-utuh).

> **Registry: 1 baris per identifier** (bukan 1 baris per `tag_code` dengan banyak kolom identifier). TAG combined (RFID/NFC/QR, 2-3 identifier — §3.1) tampil sebagai **beberapa baris independen penuh**, satu baris per identifier — bukan 1 baris lebar dengan banyak kolom kosong, dan bukan pula di-collapse ke 1 baris dengan info tersembunyi di balik klik: kolom sebelumnya (RFID Code/NFC Code/QR Code/BLE Address/GPS IMEI sebagai kolom terpisah-terpisah per teknologi) diringkas jadi `TAG Type` (icon) + `Code` (text) generik lintas teknologi, plus `Device Name` / `SKU` / `Brand` / `Model/Type` sebagai 4 kolom terpisah (bukan digabung jadi 1 kolom teks — SKU dan Brand tidak eksklusif per baris, Self-Purchased pun boleh punya SKU, §7.1), plus icon link 🔗 di kolom Code untuk cross-reference sibling pada baris combined (Popup Combined TAG, `02-ui-design.md`). BLE/GPS tidak pernah combined (§3.1) → selalu tepat 1 baris. Data source tetap **1 row per `tag_code`** di database (`04-data.md` §4.1) — flattening ke banyak baris murni terjadi di response API (§4.6 `04-data.md`), bukan perubahan skema. Popup Audit TAG dan Combine & Separate tidak ikut restrukturisasi ini — lihat catatan di §7.3.

> **Baris QR di registry — muncul hanya dalam 2 kondisi**, konsisten "QR digenerate langsung saat pairing, bukan lewat Activate TAG" (§1.4, §5): (1) statusnya **Paired** (kasus normal — QR digenerate saat pairing ke asset), tampil di Tab All & Tab Paired; atau (2) bagian dari TAG **combined** (RFID/NFC+QR digabung via Combine & Separate, §7.6) yang **overall status combo-nya Not Paired** — kasus tepi: QR ikut ter-generate saat Combine meski combo-nya belum dipasangkan ke apa pun, tampil di Tab All & Tab Not Paired sebagai sibling baris RFID/NFC-nya. Di luar 2 kondisi ini, baris QR **tidak pernah ada** — tidak ada QR berdiri sendiri berstatus Available/Reserved/dst.

**Tabel:**
| Kolom | Bentuk | Keterangan |
|-------|--------|------------|
| TAG Type | **Icon** | 1 icon, teknologi identifier baris ini (RFID/NFC/QR/BLE/GPS) — **bukan lagi kombinasi dalam 1 cell**, karena combined TAG sekarang dipecah jadi banyak baris (lihat catatan di atas). Sortable berdasarkan accessibility label icon (`prd-conventions.md` §9.7) |
| Code | Text + icon inline | Kode/identifier baris ini (RFID Code/NFC Code/QR Code/BLE Address/GPS IMEI, sesuai TAG Type). **Icon link kecil** muncul di sebelah kode **hanya kalau** baris ini bagian dari TAG combined — klik icon → popup kecil menampilkan sibling baris (TAG Type + Code + Device masing-masing pasangan), reuse pola popup `"+N More"` (§9.13 `prd-conventions.md`) |
| Device Name | Text | Nama device dari Device Catalog. **Selalu terisi** (wajib di Activate TAG, kedua jalur) — field paling reliable buat identitas produk. QR: inherit dari sibling RFID/NFC kalau bagian combo (§7.1 di atas), `—` kalau QR standalone |
| SKU | Text | SKU fisik yang match. Terisi untuk **Official** (selalu) **dan** **Self-Purchased/BYO** yang opsional memilih SKU saat Activate TAG (Template/inline resolve, §5.1) — Self-Purchased **boleh** juga punya SKU, bukan eksklusif Official. `—` kalau BYO tanpa SKU sama sekali |
| Brand | Text | Kalau SKU terisi (Official atau BYO-dengan-SKU) → ikut data SKU (Device Catalog), read-only. Kalau SKU kosong (BYO murni) → dari `byo_brand` yang diisi manual saat Activate TAG. Praktis selalu terisi kecuali QR standalone |
| Model/Type | Text | Sama pola sumber dengan Brand (ikut SKU kalau ada, atau `byo_model_type` manual kalau BYO tanpa SKU) — tapi **genuinely opsional**: boleh `—` walau SKU/Brand terisi, kalau Device Catalog memang tidak punya nilai model untuk SKU itu atau `byo_model_type` tidak diisi (opsional di form, §5.1) |
| Source | Badge | "Official" [biru] jika Jalur A — "Self-Purchased" [kuning] jika Jalur B/BYO. `—` untuk QR (tidak melalui Activate TAG, §5) |
| Type | Text | Kategori penggunaan (lihat §3.2) — Object TAG/User TAG, plain text (bukan badge berwarna — beda dari TAG Status) |
| TAG Status | Badge | Lihat palet warna di bawah |
| Last Scanned | Text | Timestamp + nama modul terakhir |

**Status badge:**
Available [hijau] | Paired [biru] | Reserved [kuning] | To be Returned [kuning] | Damaged/Missing [merah] | Retired [hitam]

**Search by Scan (toolbar, icon di sebelah icon Search text existing) — berlaku di ketiga tab (All/Paired/Not Paired, sama komponen §7.2/§7.3):**
```
[Search by Scan] → pilih metode → Scan by RFID | Scan by NFC | Scan by QR
    └── TAG ditemukan **dan** ada di dataset tab yang sedang aktif → baris identifier
          yang match di-highlight/filter (bukan seluruh sibling combo-nya — highlight
          tetap per baris, konsisten filter di atas)
    └── TAG dikenali sistem tapi tidak ada di dataset tab yang aktif → empty state
          generik (sama seperti search-by-text tanpa hasil), bukan toast error
    └── TAG tidak dikenali sama sekali → toast error, lihat §8
```

> **BLE/GPS tidak termasuk** — konsisten `scan-foundation.md` §4.9 (Search by Scan default scope = RFID/NFC/QR, TAG identity yang dipasang ke asset unit) dan tabel entry point §6 di file ini ("Search by Scan | RFID / NFC / QR"). GPS khususnya tidak punya mekanisme scan sama sekali untuk dicari (live tracking only, §5.6 `scan-foundation.md`) — pencarian TAG GPS di registry pakai search-by-text (IMEI), bukan scan.

---

### 7.2 All TAGs — Tab Paired

Kolom sama dengan All, **tanpa kolom TAG Status** (semua = Paired). Search by Scan — lihat §7.1 (komponen & behavior sama, di-scope ke dataset tab Paired).

---

### 7.3 All TAGs — Tab Not Paired

> Search by Scan — lihat §7.1 (komponen & behavior sama, di-scope ke dataset tab Not Paired).

Kolom sama dengan All (dengan kolom TAG Status).

**Health Counter Cards (di atas tabel, pola sama §7.1 tapi angka beda):** 6 card — **RFID – Object TAG**, **RFID – User TAG**, NFC, QR, BLE, GPS (RFID pecah jadi 2 card, konsisten §7.1 — meski di tab ini kegunaannya bukan kuota, tetap dipecah supaya card RFID di kedua tab konsisten mewakili dimensi yang sama). Klik card = filter (level card, sama seperti §7.1 — bukan per-angka; klik card "RFID – Object TAG"/"RFID – User TAG" = compound filter TAG Type=RFID **dan** Type Object/User TAG), multi-select OR, default semua nonaktif.

Tiap card tampilkan **2 angka** (bukan 1 rasio seperti §7.1, karena di tab ini yang relevan adalah kesehatan TAG yang belum dipasangkan, bukan kuota):

| Icon | Angka | Cakupan status |
|------|-------|-----------------|
| ✓ (checkline) | Normal | `Available` + `Reserved` + `To be Returned` — belum jadi masalah, cuma beda tahap alur |
| ✕ (closeline) | Damaged/Missing | Status `Damaged/Missing` — dihitung langsung |

> **`Retired` tidak dihitung di kartu manapun** — status terminal (decommission permanen), bukan "siap pakai" (Normal) maupun "lagi bermasalah" (Damaged/Missing). Tetap terlihat di kolom Status tabel seperti biasa, cuma tidak masuk breakdown card.

**Toolbar tambahan:** Icon: Event Log (clock/history) | Button: [Audit TAG]

Status yang muncul: Available | Reserved | To be Returned | Damaged/Missing | Retired

> **Popup Audit TAG (§7.4)** tabelnya sudah ikut disederhanakan jadi `TAG Type (icon) | Code` (2 kolom, sama pola registry) — sesi Audit sekarang di-scope per TAG Type lewat picker checkbox di depan (RFID/NFC/BLE), jadi tidak perlu lagi banyak kolom kode per teknologi sekaligus. Combine & Separate (§7.6) tetap **tidak** ikut pola ini — tabelnya legitimately butuh beberapa kolom kode sekaligus per baris (1 baris = 1 SET yang sedang di-combine, berisi 2-3 identifier berbeda teknologi dalam waktu bersamaan), beda konteks dari Audit yang 1 baris = 1 identifier tunggal.

---

### 7.4 Popup: Audit TAG

```
├── Title: "Audit TAG"
├── Field: TAG Type* [Checkbox multi-select: RFID | NFC | BLE] — GPS & QR tidak ada opsi
│         (GPS tidak punya mekanisme re-scan; QR tidak pernah masuk pool Not Paired Audit).
│         **Locked begitu Found ≥ 1** (scan pertama sudah masuk) — cuma bisa diganti selama
│         Found masih 0, toggle bebas, Not Found reaktif (union tipe yang dicentang)
├── Counter: "Found: [N]" | "Not Found: [N]"
│   └── Default begitu ≥1 TAG Type dicentang: Not Found = total TAG di Not Paired bertipe
│         yang dicentang (union). 0 dicentang → 0/0
├── Tabel TAG: TAG Type (icon) | Code — baris bagian dari TAG combined tampil dengan
│         icon link 🔗 kecil di sebelah Code (sama pola registry §7.1) untuk penanda
│         visual; klik → popup sibling (termasuk sisi QR yang tidak auditable, biar
│         Client tahu identitas lengkap combo-nya walau QR tidak discan di sini)
│         **Tidak ada row action apa pun** (koreksi 2026-08-04, menutup ambiguitas) —
│         sengaja tanpa mekanisme "undo" per baris Found. Satu-satunya cara membatalkan
│         scan yang salah masuk Found adalah `[Cancel]` (Dialog Cancel TAG Audit) dan
│         mulai sesi baru dari awal
├── Button: [Audit TAG] (belum ada scan) | [Continue Audit] (sudah ada scan) — disabled
│         kalau 0 TAG Type dicentang
│   └── Klik → 1 tipe dicentang: langsung scan tipe itu (skip overlay). >1 tipe dicentang:
│         overlay pilih metode, opsi cuma yang dicentang → toast "Scanning..."
│       └── TAG terscan → pindah ke Found, counter update real-time. Kalau TAG combined
│             RFID+NFC (kedua sisi dicentang) → sibling sisi lain **ikut otomatis**
│             pindah ke Found di tabel yang sama (§3.2 `03-functional.md` F-TAG-08)
├── [Submit] → Dialog Submit Confirmation
└── [Cancel] → Dialog Cancel TAG Audit
```

**Dialog Submit Confirmation — 4 varian (detail wireframe & breakdown per TAG Type: `02-ui-design.md` §"Dialog: Submit Confirmation — Audit TAG"):**

| Kondisi | Isi Dialog |
|---------|------------|
| Semua TAG ditemukan | Konfirmasi biasa: "All TAGs have been found." |
| Ada Available yang tidak ditemukan | Body **diawali** "[F] TAG(s) confirmed Available." (**[F] = Found** — di kondisi ini murni tidak ada Damaged/Missing yang ikut ditemukan, jadi seluruh Found tetap Available/Reserved/To be Returned tanpa perubahan status, ditampilkan apa adanya tanpa breakdown), lalu "[N] TAG(s) were not found and will be marked as Damaged/Missing." + breakdown **khusus [N]** (kalau sesi centang ≥2 TAG Type, atau ada baris combined) — baris **standalone** per TAG Type tunggal ("RFID: n") **dan** baris **combined** per kombinasi ("RFID & QR: n") terpisah, **tidak** dicampur jadi satu baris gabungan generik. Sisi QR combined selalu ikut walau tidak pernah dicentang (§3.5 `03-functional.md`) + Checkbox "Mark not found [Type] TAGs as Damaged/Missing" (default: checked) — [Type] = daftar TAG Type dicentang di popup Audit TAG, digabung ("RFID" / "RFID and NFC" / "RFID, NFC, and BLE") |
| Ada Damaged/Missing yang ditemukan | Body "[M] TAG(s) will be restored to Available." (**[M] = subset Found yang sebelumnya Damaged/Missing**, bukan total Found) + breakdown standalone/combined sama pola |
| Kedua kondisi di atas | Body **diawali** "[F] TAG(s) confirmed Available." (**[F] = Found − [M]**, mengisolasi subset yang tidak berubah status supaya tidak tumpang tindih dengan [M]), lalu kedua elemen "Not Found"/"Restored" tampil, breakdown masing-masing independen |

> **TAG combined dalam Audit** (§7.4 di atas) — 1 `tag_code` combined share Status yang sama di semua sibling baris (§7.1). Scan salah satu sisi auditable (RFID/NFC/BLE) → seluruh `tag_code` Found, termasuk sibling QR yang tidak pernah tampil/discan di Audit (di luar scope, §1.4). Kalau combo-nya RFID+NFC (kedua sisi auditable & sama-sama dicentang), sibling sisi lain otomatis ikut Found di tabel Audit begitu salah satunya discan — detail `03-functional.md` §3.2 F-TAG-08.

**Dialog Cancel TAG Audit:**
- [Go Back] → kembali ke popup Audit TAG, data scan tetap
- [Continue] → popup tutup, kembali ke Not Paired, tidak ada perubahan

**Dialog Scan Stopped** (muncul saat Stop Scan / Close / Back saat sedang scan):
- [Continue Audit] → scan lanjut
- [Close] → kembali ke popup Audit TAG, data scan tetap

---

### 7.5 Popup: Event Log — Audit TAG

```
├── Title: "Event Log: Audit TAG"
├── Columns: Date | TAG Type | Total TAG Scanned | Modified By | Actions
│   └── "TAG Type" — 1-3 **badge teks** (RFID/NFC/BLE), bukan icon — baris log ini
│         session-level, tidak didampingi kolom Code (beda dari tabel identifier
│         yang icon-nya legible karena ada Code di sebelahnya, §7.1), sesuai tipe
│         yang dicentang di sesi audit itu
└── Row Action: Detail →
    ├── Jika ada Damaged/Missing → tabel perubahan status
    └── Jika semua found → info ringkasan saja
```

---

### 7.6 Halaman: Combine & Separate TAG

```
[Breadcrumb: TAG > Combine & Separate TAG]
├── Toolbar: Icon: Event Log (clock/history)
├── Field: Action [Dropdown]
│   ├── Combine RFID & NFC
│   ├── Combine NFC & QR
│   ├── Combine RFID & QR
│   ├── Combine RFID & NFC & QR
│   └── Separate TAG
│
├── (Sebelum pilih action): teks deskripsi "Select action first"
│
└── (Setelah pilih action):
    ├── Info icon + penjelasan action
    ├── "Total Combined TAGs: [N]"
    ├── Toolbar tabel: [Remove] (disabled jika kosong) | [Scan TAG] | Icon: Event Log (clock/history)
    ├── Tabel (kolom sesuai action — RFID Code / NFC Code / QR Code / TAG Type)
    └── Footer: [Cancel] [Submit]
```

**Urutan scan per action:**

| Action | Urutan Scan |
|--------|-------------|
| Combine RFID & NFC | RFID → NFC |
| Combine NFC & QR | NFC → QR |
| Combine RFID & QR | RFID → QR |
| Combine RFID & NFC & QR | RFID → NFC → QR |
| Separate TAG | Scan salah satu TAG dari set → semua TAG set terisi otomatis |

**Remove:** scan TAG yang ingin dihapus. Seluruh baris (semua TAG dalam satu set) ikut terhapus.

**Ganti Action saat tabel sudah ada data:** muncul Dialog Cancel Combine TAG.

---

### 7.7 Popup: Event Log — Combine & Separate TAG

```
├── Title: "Event Log: Combine & Separate TAG"
├── Columns: Date | Action | Total Combined TAG | From | Modified By
└── [Close]
```

---

### 7.8 Halaman: Activate TAG

> Trigger: tombol `[+ Activate TAG]` di toolbar All TAGs (§7.1) → Popup "Ready to Activate a TAG" → `[Continue]` → halaman ini. Alur lengkap §5.1 — **bulk, staging, deferred submit**, reuse pola Combine & Separate (§7.6).

```
[Breadcrumb: TAG > All TAGs > Activate TAG]
├── Toolbar [right-aligned]: Icon: Event Log (clock/history) → Popup Event Log — Activate TAG
│         (page-level, sama pola Combine & Separate §7.6 — bukan bagian dari "Toolbar tabel"
│         di bawah, jadi berlaku sama untuk sesi RFID/NFC/BLE maupun GPS; satu baris di popup
│         = satu sesi `[Submit]`, lihat §10.4)
├── Link: "How to activate a TAG" → Popup How to Activate a TAG
├── Field: TAG Type* [Radio: RFID | NFC | BLE | GPS] — session-level, helper text sisa
│           kuota tipe ini, update tiap radio diganti (sumber sama License Counter
│           Card, §4/§7.1)
│
├── [Collapsible, collapsed default] "Self-Purchased Template"
│   ├── Toggle/link: "+ Add self-purchased template" (collapsed) ↔ "− Remove template"
│   │         (expanded, kembali collapsed & clear field kalau di-klik lagi)
│   ├── Description (selalu tampil, terlepas expanded/collapsed): "If some of your TAGs
│   │         aren't part of your distributor's registered stock, add their details here
│   │         once — it'll be applied automatically to every unmatched TAG you scan in
│   │         this session, so you don't have to fill it in per TAG."
│   ├── Field: Device Name* [Dropdown searchable — Device Catalog kategori sesuai TAG Type]
│   ├── Field: SKU [Dropdown searchable, opsional — "Leave empty if this is a
│   │           self-purchased TAG with no matching SKU."] — icon `[✕]` clear
│   │           muncul di field begitu terisi
│   ├── Field: Brand* [Text input — "Enter brand"] — **selalu tampil**:
│   │           SKU terisi → auto-filled dari data SKU + disabled (read-only);
│   │           SKU kosong → editable, wajib diisi
│   ├── Field: Model [Text input, opsional — "Enter model (optional)"] — **selalu
│   │           tampil**, perilaku sama seperti Brand (disabled jika SKU terisi)
│   ├── [Khusus TAG Type = RFID] Field: Type [Radio: Object TAG | User TAG] —
│   │           **selalu tampil** untuk RFID: SKU terisi → auto-filled dari
│   │           `sku.is_user_tag` + disabled; SKU kosong → editable, wajib dipilih
│   ├── Klik `[✕]` di field SKU → SKU kembali kosong; Brand/Model/Type (RFID)
│   │           balik jadi editable & ter-reset kosong (bukan restore nilai lama)
│   └── **Locked state** (kalau `byo_activation_enabled=false` untuk Client ini):
│             seluruh section disabled + tooltip 🔖 "Self-purchased activation is not
│             enabled for your account. Contact your administrator."
│
├── Toolbar tabel — **[RFID/NFC/BLE] saja**, cuma 2 elemen [Remove]/[Scan TAG] (icon Event
│         Log ada di Toolbar page-level di atas, bukan di sini); **[GPS] tidak punya toolbar
│         tabel ini sama sekali** — digantikan section Upload File/Manual Entry yang inline
│         langsung di halaman, tanpa tombol yang perlu diklik dulu (lihat wireframe detail
│         `02-ui-design.md` §"Halaman: Activate TAG — GPS"):
│   ├── [Remove] — **scan-based** (sama pola Combine & Separate §7.6, bukan pilih
│   │         baris manual): klik → sesi scan mode Remove, langsung tanpa overlay
│   │         pilih metode (TAG Type terkunci session-level) → identifier ter-scan
│   │         match Code baris staging → baris terhapus
│   └── [Scan TAG] — di sebelahnya untuk mode Add
│
├── "Total Scanned: [N]" (opsional, mirror "Total Combined TAGs" pola §7.6) — **[RFID/
│           NFC/BLE] saja**. **[GPS]** terbaca "Total Entries: [N]", posisinya di dalam
│           section Upload File/Manual Entry sendiri, sumber dari Upload/Manual Entry
│           yang lolos Preview, bukan hasil scan
│
├── Tabel (tumbuh per scan):
│   ├── Columns: TAG Type (icon) | Code | Status (badge) | Device Name | SKU | Brand |
│   │     Model/Type | Actions — split 4 kolom, konsisten tabel registry (§7.1)
│   ├── Status badge:
│   │     ├── "Official" [biru] — match tag_units, Device Name/SKU/Brand/Model/Type
│   │     │     auto-terisi
│   │     ├── "Self-Purchased" [kuning] — dari Template atau hasil `[Resolve]`/`[Edit]`
│   │     ├── "Needs Info" [yellow] — tidak match, Template kosong, perlu diisi manual
│   │     └── "Error" [merah] — tidak match & byo disabled, ATAU license limit —
│   │           tooltip 🔖 alasan spesifik
│   ├── Row action (dynamic per Status — bukan klik area baris, konsisten
│   │     `prd-conventions.md` §9.2):
│   │     ├── "Official" — tidak ada row action
│   │     ├── "Self-Purchased" → **[Edit]** → **Row Edit Mode** (pre-filled) — sel jadi
│   │     │     input aktif langsung di baris, bukan Dialog/popup, mirror pola Import
│   │     │     "State C4: Edit — single row" (`import/02-ui-design.md`)
│   │     ├── "Needs Info" → **[Resolve]** → Row Edit Mode yang sama (kosong) — isi Device
│   │     │     Name*/SKU/Brand*/Model/Type di sel → `[Save]` → badge → "Self-Purchased"
│   │     └── "Error" — tidak ada row action selain Remove, tidak bisa diresolve
│   └── **[GPS]** tambahan: **[Remove]** row action selalu ada di semua status (RFID/
│         NFC/BLE tetap scan-based via toolbar, tidak berubah); GPS bisa punya 2 row
│         action sekaligus (mis. Self-Purchased GPS → `[Edit]` + `[Remove]`) — kecuali
│         selama Row Edit Mode aktif
│
├── **Row Edit Mode** (§7.8 `02-ui-design.md` untuk wireframe lengkap): kolom Actions
│     hilang dari seluruh tabel selama sesi aktif; toolbar [Scan TAG]/[Remove]/Upload
│     File/Manual Entry disabled; footer berubah [Cancel] [Save]. `[Save]` gagal validasi
│     → sesi tetap terbuka, field error dapat border merah. `[Save]` lolos → badge →
│     "Self-Purchased", sesi tertutup, semua kembali normal. `[Cancel]` dengan
│     perubahan belum disimpan → Dialog "Cancel Edit" ("Changes will not be saved.")
│
└── Footer: [Cancel] [Submit] — [Cancel] [Save] selama Row Edit Mode aktif
      [Submit] disabled selama ada baris "Needs Info" belum diresolve/dihapus.
      Baris "Error" TIDAK memblok Submit (auto-exclude dari commit)
```

**Setelah [Submit]** (re-validasi per baris server-side, partial commit — lihat §5.1):
```
├── Halaman TIDAK auto-redirect/tutup — hasil ditampilkan per baris di tabel yang sama:
│     ├── "Activated" [hijau] — badge Status berubah, baris jadi read-only (histori sesi)
│     ├── "Waiting for Approval" [kuning] — collision baru ketahuan saat commit (race)
│     └── "Failed" [merah] + alasan (mis. "This identifier has already been
│           activated." — race saat commit, closed list 2 kemungkinan §7.10) —
│           baris tetap editable: [Remove] lalu scan ulang, atau ditinggal
├── Toast ringkasan: "Success, [N] TAGs have been activated." (+ ", [M] pending approval"
│     dan/atau ", [K] failed" kalau relevan — gabung jadi satu kalimat sesuai jumlah
│     kategori yang muncul)
└── Baris `Waiting for Approval` — read-only, tidak ada aksi klik; review dilakukan di
      Admin Console, tidak bisa diakses dari GS
```

**Dialog: Insufficient Quota** (klik `[Submit]`, pre-check agregat sebelum commit apa pun — §5.1)
```
├── Title: "Insufficient Quota"
├── Body: "You don't have enough license quota to activate all the TAGs in this
│     session. Remove some rows, or wait for more quota to be allocated, then try
│     again."
│     └── Breakdown per kategori yang kurang (1 baris per kategori, cuma yang
│           kurang — kategori cukup tidak ditampilkan): "[Category]: need [N],
│           only [M] available" — mis. "RFID – Object TAG: need 12, only 8
│           available"
└── Footer: [OK]
    └── Klik → dialog tutup, angka kuota di halaman refresh ke nilai terbaru
          (License Counter Card, helper text TAG Type); tabel staging TIDAK
          berubah (tidak ada baris yang commit atau terhapus otomatis) — user
          pilih sendiri baris mana yang di-`[Remove]` untuk muat kuota, lalu
          klik `[Submit]` lagi
```

> Tombol `[Submit]` **tidak** di-disable proaktif berdasarkan angka kuota yang tampil di halaman (angka itu sendiri reflected real-time, tapi bisa berubah lagi tepat sebelum klik) — dialog ini muncul reaktif setiap kali `[Submit]` diklik dan pre-check agregat mendeteksi kekurangan, konsisten pola "Dialog Blok" (`prd-conventions.md` §7): tombol tetap enabled, klik memunculkan info kenapa tidak bisa lanjut.

**Ganti TAG Type saat tabel sudah ada data:** muncul Dialog Cancel (sama pola Combine & Separate §7.6 — "Progress will not be saved").

**Popup: How to Activate a TAG** (link di halaman Activate TAG, sama pola Hardware):
```
├── Title: "How to Activate a TAG"
├── Content: penjelasan Official vs Self-Purchased (otomatis per-baris dari hasil
│           scan, bukan pilihan manual), kapan isi Self-Purchased Template, kapan
│           isi SKU vs kosongkan, apa itu status "Needs Info"
└── [Close]
```

### 7.9 Popup: Event Log — Activate TAG

> Trigger: Toolbar page-level halaman Activate TAG (§7.8) — berlaku sama untuk sesi RFID/NFC/BLE maupun GPS. Satu baris = satu sesi `[Submit]`, mirror pola Event Log Audit TAG (§7.5)/Combine & Separate (§7.7).

```
├── Title: "Event Log: Activate TAG"
├── TableTools
│   ├── Icon: Search → "Search modified by..."
│   ├── Icon: Filter → Filter Panel
│   │   ├── Dropdown: "TAG Type" [multi-select] — RFID | NFC | BLE | GPS — keempat tipe
│   │   │     (beda dari Event Log Audit TAG yang cuma RFID/NFC/BLE, karena Activate TAG
│   │   │     mencakup GPS juga, §5.1)
│   │   ├── Date picker: "Date" — placeholder: "Select date" (§9.8 prd-conventions.md)
│   │   └── Dropdown: "Modified By" [single-select] (placeholder: "All admins")
│   └── Icon: Download
├── Table: Date | TAG Type | Total TAG Submitted | Modified By | Actions
│   ├── "TAG Type" — **badge teks** (RFID/NFC/BLE/GPS), bukan icon — baris log ini
│   │     session-level, tidak didampingi kolom Code (sama alasan Event Log Audit TAG
│   │     di atas); Activate TAG tetap cuma 1 TAG Type per sesi (§5.1), jadi selalu 1 badge
│   ├── "Total TAG Submitted" — jumlah baris yang di-submit dalam sesi (baris "Error" yang
│   │     auto-excluded sebelum Submit tidak dihitung); breakdown Activated/Waiting for
│   │     Approval/Failed ada di Detail
│   └── Row Action: [Detail] → Popup Activate TAG Detail
└── [Close]
```

### 7.10 Popup: Activate TAG Detail

```
├── Title: "Activate TAG Detail"
├── Section: "Activated" — tabel TAG Type (icon) | Code | Device Name
├── Section: "Waiting for Approval" — tabel TAG Type (icon) | Code | Device Name
└── Section: "Failed" — tabel TAG Type (icon) | Code | Device Name | Reason
```

Ketiga section selalu ditampilkan (kosong kalau tidak ada baris, bukan disembunyikan) — sama pola Popup Audit Detail (§7.5). "Reason" (section Failed) sama copy dengan tooltip badge "Failed" di halaman Activate TAG — **closed list, cuma 2 kemungkinan** (keduanya race di jendela sempit antara real-time-check dan commit final, genuinely per-baris — beda dari kuota yang all-or-nothing, lihat §5.1 "Commit (atomik)" & §8 di bawah):
1. `"This identifier has already been activated."` — identifier ini keburu diaktivasi via sesi lain (tab/user berbeda) di antara real-time-check saat scan dan Submit
2. `"Self-purchased device activation is not enabled for your account."` — `byo_activation_enabled` berubah jadi `false` di antara real-time-check dan Submit (jarang — biasanya sudah ke-detect sebagai badge "Error" duluan)

Read-only, tidak ada aksi di popup ini.

---

## 8. Validasi & Error Messages

### Activate TAG (§5.1, §7.8)

| Kondisi | Pesan Error |
|---------|-------------|
| TAG Type belum dipilih | `[Scan TAG]` disabled (tidak ada pesan). **[GPS]** section Upload File/Manual Entry tidak render sama sekali sampai radio TAG Type = GPS dipilih (bukan disabled, tapi belum ada — layout GPS baru muncul menggantikan toolbar RFID/NFC/BLE begitu dipilih, §5.1) |
| TAG Type belum dipilih, user coba expand "Self-Purchased Template" | Collapsible **disabled**, tidak bisa di-expand — tooltip 🔖 `"Select a TAG Type first."` (Device Name di Template bergantung kategori TAG Type, §5.1 — tidak ada kategori untuk difilter kalau TAG Type belum dipilih) |
| Self-Purchased Template di-expand, Device Name belum dipilih | Field disabled/tidak bisa expand lebih jauh sampai Device Name terisi (tidak ada pesan) |
| Self-Purchased Template di-expand, Brand belum diisi (padahal SKU dikosongkan) | Tidak ada pesan blocking di Template — Brand cuma jadi wajib saat dipakai di baris "Needs Info" (lihat baris berikutnya) |
| Baris "Needs Info" — Row Edit Mode, Device Name/Brand belum diisi | `[Save]` blocked (field error border merah); `[Submit]` tetap disabled selama baris ini belum lengkap; tidak ada pesan per-keystroke |
| Baris tidak match `tag_units`, Template kosong, `byo_activation_enabled=true` | **Bukan error** — badge "Needs Info" [yellow], baris menunggu `[Resolve]` (§7.8) |
| Baris tidak match `tag_units`, `byo_activation_enabled=false` | Badge "Error" [merah], tooltip: `"Not in your official stock; self-purchased activation is not enabled for your account. Contact your administrator."` — baris tidak bisa diresolve, cuma bisa di-Remove |
| License limit tercapai di TAG Type yang dipilih (saat scan, real-time-check) | Badge "Error" [merah] pada baris itu, tooltip: `"License limit reached."` — sesi scan **tidak berhenti**, TAG berikutnya masih bisa discan |
| Kuota kategori ternyata sudah tidak cukup lagi tepat saat commit (race sisa — lolos Langkah 0 tapi habis duluan oleh sesi lain sebelum commit ini benar-benar menulis) | **Seluruh commit dibatalkan (rollback), 0 baris ter-commit** — sama seperti Langkah 0: Dialog "Insufficient Quota" lagi, tabel staging tetap utuh, user `[Remove]` baris lalu `[Submit]` ulang. **Bukan** partial commit — kuota selalu all-or-nothing |
| Identifier collision (match tak terduga saat commit, maupun collision Jalur B — unit sudah aktif di client lain) | **Tidak ada hard-reject untuk TAG** (beda dari Hardware) — match tak terduga: auto-switch Jalur A, baris jadi "Activated" dengan Device di-override; collision: baris jadi `Waiting for Approval` (konsisten §9.2 `device-catalog-schema.md`) — **beda dari collision di client sendiri, lihat baris berikutnya** |
| Identifier sudah ada di tabel sesi ini (duplikat scan) | Diabaikan, sama pola Combine — tidak ada baris duplikat |
| Identifier sudah aktif di **client ini sendiri** (real-time, saat scan) | **Toast error, baris tidak masuk tabel**: `"Error, TAG is already activated."` — sesi scan tidak berhenti (§5.1) |
| Identifier sudah aktif di client ini sendiri, baru ketahuan saat Submit (race sempit — mis. TAG diaktivasi via sesi lain di antara scan dan Submit) | Baris jadi "Failed" saat Submit: `"This identifier has already been activated."` — fallback untuk race yang lolos dari real-time-check |
| `byo_activation_enabled` berubah jadi `false` di antara real-time-check dan Submit (race, jarang) | Baris "Self-Purchased" jadi "Failed" saat Submit: `"Self-purchased device activation is not enabled for your account."` |
| Kuota agregat kurang saat klik `[Submit]` (pre-check, sebelum commit dimulai) | Submit dibatalkan sepenuhnya — Dialog "Insufficient Quota" (§7.8), breakdown per kategori yang kurang; tidak ada baris yang commit |

### Scan Global — Pairing/Usage (entry point §6, bukan Activate TAG)

| Kondisi | Pesan | Tipe |
|---------|-------|------|
| TAG belum pernah diaktivasi (tidak ada di registry client ini) | `This TAG hasn't been activated yet. Please contact Admin.` | Toast error |
| TAG ada tapi tidak diotorisasi untuk client | `Error, TAG isn't authorized. Please contact Admin.` | Toast error |
| Scan TAG yang sudah ada di registry (dalam sesi Pairing yang sama) | Tidak ada duplikat — diabaikan | — |

### Combine TAG — Error Scan

| Kondisi | Pesan |
|---------|-------|
| TAG bukan dari TAG Samurai | `Error, can't recognize TAG.` |
| TAG sudah Paired ke asset | `Error, TAG is already paired.` |
| TAG adalah User TAG | `Error, can't combine user TAG.` |
| TAG sudah ada di tabel (duplikat session) | `Error, TAG is already on the list.` |
| TAG sudah Combined sebelumnya | `Error, TAG is already combined.` |
| TAG berstatus Retired | `Error, TAG is already retired.` |
| TAG tidak diotorisasi | `Error, TAG isn't authorized. Please contact Admin.` |
| Remove: TAG tidak ada di tabel | `Error, the TAG isn't on the list.` |

### Submit

| Kondisi | Pesan |
|---------|-------|
| Submit tanpa data di tabel (Combine/Separate maupun Activate TAG) | Caption di atas tombol Submit: `Please scan the TAGs before submitting` |
| Submit Activate TAG, masih ada baris "Needs Info" | `[Submit]` disabled; tooltip 🔖: `"Resolve or remove all incomplete rows before submitting."` |

---

## 9. States & Feedback

| State | Kondisi | Tampilan |
|-------|---------|---------|
| Loading | Fetch data | Skeleton rows |
| Empty | Tidak ada TAG | "No TAGs found" |
| Empty — filtered | Filter tidak ada hasil | "No results found" |
| Scanning | Saat scan aktif | Toast: "Scanning..." → "Validating..." |
| Scan stopped | Stop Scan / Close / Back saat scan | Dialog Scan Stopped |
| Submit Combine sukses | — | Toast: "Success, [N] TAGs have been combined." + tabel kosong + Remove disabled |
| Submit Separate sukses | — | Toast: "Success, [N] TAGs have been separated." + tabel kosong + Remove disabled |
| Submit Combine/Separate gagal | Server error saat commit | Toast: "Error, failed to submit Combine/Separate." — tabel staging tetap utuh, user retry `[Submit]` |
| Submit Audit sukses | — | Toast: "Success, Audit has been submitted." + popup tutup + Not Paired terupdate |
| Submit Audit gagal | Server error saat commit | Toast: "Error, failed to submit audit." — popup tetap terbuka, hasil scan tidak hilang |
| License limit (real-time, saat scan) | Kuota tipe ini habis saat baris ke-N discan | Badge "Error" [merah] pada baris itu; sesi scan tidak berhenti |
| Baris "Official" | Scan match `tag_units` (real-time-check) | Badge "Official" [biru]; kolom Device Name/SKU/Brand/Model/Type auto-terisi |
| Baris "Self-Purchased" (dari Template) | Scan tidak match, Self-Purchased Template terisi | Badge "Self-Purchased" [kuning]; kolom Device Name/SKU/Brand/Model/Type dari Template |
| Baris "Needs Info" | Scan tidak match, Template kosong, `byo_activation_enabled=true` | Badge "Needs Info" [yellow]; row action `[Resolve]` → Row Edit Mode (Device Name*/SKU/Brand*/Model/Type jadi input aktif di baris) |
| Baris "Needs Info" → resolved | Field di Row Edit Mode diisi lengkap, klik `[Save]` | Badge berubah jadi "Self-Purchased" [kuning]; sesi tertutup |
| Baris "Self-Purchased" → di-Edit | Row action `[Edit]` (dari Template maupun hasil `[Resolve]` sebelumnya) | Row Edit Mode — field Device Name/SKU/Brand/Model/Type pre-filled untuk dikoreksi langsung di baris — badge tetap "Self-Purchased" |
| Baris "Error" (BYO disabled) | Scan tidak match, `byo_activation_enabled=false` | Badge "Error" [merah], tooltip alasan; cuma bisa dihapus lewat Remove (by Scan untuk RFID/NFC/BLE; manual untuk GPS) |
| Self-Purchased Template locked | `byo_activation_enabled=false` untuk Client | Section Template disabled + tooltip 🔖 |
| Remove (RFID/NFC/BLE) | Klik `[Remove]` | Sesi scan mode Remove dimulai; identifier ter-scan yang match Code baris staging → baris terhapus |
| Remove (GPS) | Klik `[Remove]` | Pilih baris manual di tabel, klik Remove — tidak ada sesi scan (GPS tidak discan) |
| Submit sukses (semua baris berhasil) | — | Toast: "Success, [N] TAGs have been activated."; badge tiap baris → "Activated" [hijau]; halaman tetap terbuka (bukan redirect) |
| Submit — hasil campuran | Sebagian Activated, sebagian Waiting for Approval, dan/atau Failed | Toast ringkasan gabungan (mis. "Success, [N] TAGs have been activated, [M] pending approval, [K] failed."); tiap baris badge sesuai hasil masing-masing |
| Submit gagal total (server error, sebelum commit apa pun) | Network/5xx sebelum baris manapun diproses | Toast: "Error, failed to submit activation." — tabel staging tetap utuh, user retry `[Submit]` |
| Baris "Activated" | Setelah Submit, baris ini Available | Badge "Activated" [hijau], baris jadi read-only |
| Baris "Waiting for Approval" (saat Submit) | Collision baru ketahuan saat commit (race) | Badge `Waiting for Approval` [kuning], read-only — tidak ada aksi klik; review dilakukan di Admin Console |
| Baris "Failed" (saat Submit) | Race kuota/collision/dsb saat commit | Badge "Failed" [merah] + alasan; baris tetap editable — `[Remove]` lalu scan ulang, atau ditinggal |
| Activation — Approved (async, setelah Submit) | Principal approve collision | Baris terkait di All TAGs: badge berubah jadi Available; toast (kalau Client masih di halaman terkait): `"Your TAG has been activated."` |
| Activation — Rejected (async, setelah Submit) | Principal reject collision | Baris TAG hilang dari All TAGs (tidak pernah jadi Active); toast (kalau Client masih di halaman terkait): `"This TAG couldn't be activated. Please contact support."` |

---

## 10. Logging

### 10.1 Activity Log (Global Settings > Activity Log)

> **Kesetaraan dengan format kanonik `approval-foundation.md` §6:** baris `Approve Activation` / `Reject Activation` di bawah — kolom `Action` + `Modified By` bersama-sama merepresentasikan semantik yang sama dengan literal `"Approved by [nama]"` / `"Rejected by [nama]"` (mis. `Action = Approve Activation`, `Modified By = [nama approver]` ≡ `"Approved by [nama approver]"`). Struktur tabel Action/Modified By dipertahankan (bukan digabung jadi satu string) supaya konsisten dengan format Activity Log seluruh modul lain — bukan penyimpangan dari foundation, hanya representasi kolom terpisah dari isi yang sama.

| Date | Action | Object | Name | Field | Old Value | New Value | Modified By |
|------|--------|--------|------|-------|-----------|-----------|-------------|
| [date] | Activate | TAG | `[RFID/NFC/BLE/GPS Code]` | Status | — | `Available` | `[User]` |
| [date] | Submit for Approval | TAG | `[RFID/NFC/BLE/GPS Code]` | Status | — | `Waiting for Approval` | `[User]` |
| [date] | Approve Activation | TAG | `[RFID/NFC/BLE/GPS Code]` | Status | `Waiting for Approval` | `Available` | `Principal` |
| [date] | Reject Activation | TAG | `[RFID/NFC/BLE/GPS Code]` | Status | `Waiting for Approval` | `Rejected` | `Principal` |
| [date] | Combine | TAG | `[RFID/NFC/QR Code]` | TAG Type | `[tipe lama]` | `[tipe baru]` | `[User]` |
| [date] | Separate | TAG | `[RFID/NFC/QR Code]` | TAG Type | `[tipe lama]` | `Separated` | `[User]` |
| [date] | Audit | TAG | `[RFID/NFC/QR/BLE Code]` | Status | `Available` | `Damaged/Missing` | `[User]` |
| [date] | Audit | TAG | `[RFID/NFC/QR/BLE Code]` | Status | `Damaged/Missing` | `Available` | `[User]` |

### 10.2 Event Log: Audit TAG

Popup di halaman Not Paired. Mencatat setiap sesi audit TAG.

Struktur: Date | TAG Type | Total TAG Scanned | Modified By | Actions

| Date | TAG Type | Total TAG Scanned | Modified By | Actions |
|------|----------|-------------------|-------------|---------|
| [date] | RFID | [N] | `[User]` | [Detail] |
| [date] | RFID, NFC | [N] | `[User]` | [Detail] |

### 10.3 Event Log: Combine & Separate TAG

Popup di halaman Combine & Separate. Dicatat di GS, FAMS, dan Supply secara bersamaan.

Struktur: Date | Action | Total Combined TAG | From | Modified By

| Date | Action | Total Combined TAG | From | Modified By |
|------|--------|--------------------|------|-------------|
| [date] | Combine | [N] | `[Source TAG Code]` | `[User]` |
| [date] | Separate | [N] | `[Combined TAG Code]` | `[User]` |

### 10.4 Event Log: Activate TAG

Popup page-level di halaman Activate TAG (§7.9). Satu baris = satu sesi `[Submit]`, mencakup RFID/NFC/BLE **dan** GPS (beda dari Event Log Audit TAG yang GPS-nya dikecualikan, §1.4).

Struktur: Date | TAG Type | Total TAG Submitted | Modified By | Actions

| Date | TAG Type | Total TAG Submitted | Modified By | Actions |
|------|----------|----------------------|-------------|---------|
| [date] | RFID | [N] | `[User]` | [Detail] |
| [date] | GPS | [N] | `[User]` | [Detail] |

> "Total TAG Submitted" tidak sama dengan total sukses "Activated" — bisa mencakup baris yang hasilnya Waiting for Approval atau Failed juga (breakdown lengkap ada di Popup Activate TAG Detail, §7.10, row action `[Detail]`).

### 10.5 Cross-Module Log

| Surface | Kapan dicatat |
|---------|--------------|
| User > Detail > Transaction Admin Log > TAG | Setiap operasi TAG yang melibatkan akun user |
| Hardware > Handheld > Detail > Tagging | Setiap kali TAG di-scan melalui Handheld |

### 10.6 Sinkronisasi

Activity Log, Event Log, dan Cross-Module Log ditulis dalam satu transaksi DB untuk setiap aksi TAG — termasuk Activate TAG (§10.1 + §10.4 ditulis atomik dalam satu transaksi Submit, F-TAG-11).

---

## 11. Feature List

| ID | Fitur | Prioritas |
|----|-------|:---------:|
| TAG-01 | All TAGs — registry global (read-only) | P0 |
| TAG-02 | License counter RFID/NFC/BLE/GPS | P0 |
| TAG-03 | Filter RFID/NFC/BLE/GPS toggle di All TAGs | P0 |
| TAG-04 | Search by Scan di tab All/Paired/Not Paired (RFID/NFC/QR — konsisten `scan-foundation.md` §4.9) | P0 |
| TAG-05 | Audit TAG (Not Paired, RFID/NFC/BLE — GPS tidak, §1.4) + Event Log | P0 |
| TAG-06 | Combine TAG — 4 kombinasi (RFID/NFC/QR saja) | P0 |
| TAG-07 | Separate TAG (RFID/NFC/QR saja) | P0 |
| TAG-08 | Event Log Combine & Separate TAG | P0 |
| TAG-09 | Entry Point Pairing/Usage (GS, FAMS, Supply) — hanya TAG yang sudah Active/Available | P0 |
| TAG-10 | Activate TAG — Bulk staging, scan multi-item ke tabel, per-baris resolve Official/Self-Purchased Template/Needs Info | P0 |
| TAG-11 | Activate TAG — Submit deferred; guard kuota final di commit all-or-nothing (sama Langkah 0); partial commit hanya untuk race per-baris (`byo_activation_enabled`, identifier sudah aktif) | P0 |
| TAG-12 | Activate TAG — Collision Approval (baris hasil BYO yang collision) | P1 |
| TAG-13 | Event Log Activate TAG | P0 |

---

## 12. Dependencies & Constraints

### Dependencies

| Modul / Fitur | Hubungan |
|---------------|----------|
| Admin Console > TAG Stock | Sumber TAG registry (Jalur A); **kuota RFID/NFC/BLE/GPS (`stock_ledger.balance`, read real-time — bukan license key manual, lihat §4)** dari `hardware-allocation`/`tag-stock`; Type per TAG, RFID/NFC/BLE/GPS SKU. **Outbound (Activation, §5):** saat Activate TAG sukses (Jalur A/B, keempat teknologi), GS menulis `tag_units.status: active→in_use` + INSERT `tag_usage` (Jalur A) atau INSERT `tag_units` baru (Jalur B) — atomik, GS satu-satunya penulis. **Outbound (status change):** saat status TAG berubah ke/dari Damaged/Missing (via Audit di sini, atau transaksi FAMS/Supply), GS mengirim event ke Admin Console TAG Stock untuk update `tag_units.client_reported_condition` (satu arah). Transisi status lain (Paired/Reserved/To be Returned/Retired) **tidak** dikirim. Lihat `Admin-Console/PRD/tag-stock/04-data.md` §1.1c |
| Admin Console > Client Detail | Sumber `clients.byo_activation_enabled` (gate Jalur B, §5.1) — setting yang sama dipakai Hardware, capability "Manage active client" |
| Admin Console > Approvals > TAG Stock | Review collision pure Jalur B (§5.1) — reuse Approval Foundation, approver Total Control + Additional Approver Principal |
| GS > User | Entry point Pairing (§6) via Create/Edit User + Pair User |
| FAMS | Entry point Pairing (§6); trigger perubahan status Paired / To be Returned / Damaged/Missing |
| Supply Asset | Entry point Pairing (§6); trigger status changes; setting Retired/Un-retire |
| Activity Log (GS) | Menerima log Activate, Combine, Separate, Audit |
| Hardware > Handheld > Detail > Tagging | Dicatat setiap scan via Handheld |

### Constraints
- TAG tidak bisa dihapus dari registry
- TAG tidak bisa di-edit dari GS
- Type (kategori: Object TAG/User TAG saja, §3.2) read-only dari Admin Console
- Separate hanya untuk TAG berstatus Available
- Combine hanya untuk TAG berstatus Available; User TAG tidak bisa di-combine
- QR tidak memerlukan license, tidak lewat Activate TAG (digenerate langsung di client)
- **Satu jalur aktivasi**: TAG fisik baru (RFID/NFC/BLE/GPS) hanya bisa masuk registry lewat `[+ Activate TAG]` (§5) — entry point lain (§6) menolak identifier yang belum pernah diaktivasi
- Jalur B (BYO): Client **tidak bisa** membuat SKU baru — hanya pilih dari katalog existing atau kosongkan (§5.1)
- **BLE/GPS tidak combinable**: tidak muncul di Combine & Separate (§7.6) — standalone tracker, bukan chip yang bisa digabung fisik (§1.4, §3.1)
- **Pemasangan BLE/GPS ke asset** tidak lewat entry point scan-based §6 (Register Asset, Change TAG, Replace TAG tetap RFID/NFC/QR) — dimiliki addon Tracking/Maps di sisi FAMS (§1.3)
