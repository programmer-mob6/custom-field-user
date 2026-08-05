## 4. Data Requirements

> Ditujukan untuk: **Programmer (Backend)**
> Sort alfabetis (kolom Code/Device Name/Brand) mengikuti `prd-conventions.md` §9.7 — wajib ICU collation `en-US` (`COLLATE "en-US-x-icu"`), bukan default binary/`C`.

### 4.1 Entitas & Field

**Entitas: TAG**

| Field | Type | Required | Deskripsi |
|-------|------|:--------:|-----------|
| id | ID | ✓ | — |
| client_id | FK → Client | ✓ | Scope per tenant |
| rfid_code | Text | ✗ | Kode unik RFID; NULL jika tidak ada |
| nfc_code | Text | ✗ | Kode unik NFC; NULL jika tidak ada |
| qr_code | Text | ✗ | Kode QR; NULL jika tidak ada |
| ble_address | Text | ✗ | MAC Address BLE; NULL jika tidak ada |
| gps_imei | Text | ✗ | IMEI device GPS; NULL jika tidak ada |
| type | Enum | ✓ | Kategori penggunaan dari Admin Console |
| rfid_device_name | Text | ✗ | Device Name chip RFID; dari Admin Console (`tag_units.device_name_id`, selalu terisi di kedua jalur — §5.1 `01-overview.md`). NULL kalau TAG ini tidak punya identifier RFID |
| rfid_sku | Text | ✗ | SKU fisik chip RFID; dari Admin Console. Terisi untuk **Official** (Jalur A, selalu) **dan** untuk **Self-Purchased/BYO** yang opsional memilih SKU di Template/inline resolve (Jalur B dengan SKU) — Self-Purchased **boleh** juga punya SKU, bukan eksklusif Official. NULL hanya kalau BYO tanpa SKU sama sekali — kolom "SKU" tabel registry tampil `—` untuk baris itu |
| rfid_brand | Text (≤100) | ✗ | Brand chip RFID manual (`tag_units.byo_brand`) — **hanya terisi untuk BYO tanpa SKU**; NULL kalau `rfid_sku` terisi (Official maupun BYO-dengan-SKU) karena brand kasus itu **tidak disimpan duplikat di sini** — di-derive real-time di response layer (`GET /tags`, §4.6) lewat join SKU → Device Catalog (`sku.brand`), bukan dibaca dari kolom ini |
| rfid_model_type | Text (≤120) | ✗ | Model/Type chip RFID manual (`tag_units.byo_model_type`) — **hanya terisi untuk BYO tanpa SKU**, dan **opsional** di form (boleh tetap NULL walau BYO tanpa SKU — beda dari `rfid_brand` yang wajib). NULL kalau `rfid_sku` terisi — Model/Type kasus itu di-derive di response layer lewat join SKU → Device Catalog (`sku.model_type`), sama pola `rfid_brand`. Kolom "Model/Type" tabel registry tampil `—` kalau tidak ada nilai di kedua sumber (bukan dipaksa terisi) |
| nfc_device_name | Text | ✗ | Device Name chip NFC; sama pola `rfid_device_name` |
| nfc_sku | Text | ✗ | SKU fisik chip NFC; dari Admin Console. Fallback BYO sama seperti `rfid_sku` |
| nfc_brand | Text (≤100) | ✗ | Brand chip NFC; sama pola `rfid_brand` |
| nfc_model_type | Text (≤120) | ✗ | Model/Type chip NFC; sama pola `rfid_model_type` |
| ble_device_name | Text | ✗ | Device Name device BLE; sama pola `rfid_device_name` |
| ble_sku | Text | ✗ | SKU fisik device BLE; dari Admin Console. Fallback BYO sama seperti `rfid_sku` |
| ble_brand | Text (≤100) | ✗ | Brand device BLE; sama pola `rfid_brand` |
| ble_model_type | Text (≤120) | ✗ | Model/Type device BLE; sama pola `rfid_model_type` |
| gps_device_name | Text | ✗ | Device Name device GPS; sama pola `rfid_device_name` |
| gps_sku | Text | ✗ | SKU fisik device GPS; dari Admin Console. Fallback BYO sama seperti `rfid_sku` |
| gps_brand | Text (≤100) | ✗ | Brand device GPS; sama pola `rfid_brand` |
| gps_model_type | Text (≤120) | ✗ | Model/Type device GPS; sama pola `rfid_model_type` |
| status | Enum | ✓ | Status TAG saat ini — lihat §4.3 |
| last_scanned_at | DateTime | ✗ | Timestamp scan terakhir |
| last_scanned_module | Text | ✗ | Path menu entry point yang melakukan scan terakhir — **free string, bukan DB enum** (lihat catatan di bawah) |
| registered_at | DateTime | ✓ | Waktu pertama kali TAG masuk registry |
| registered_by_module | Text | ✓ | Path menu entry point saat discovery pertama — selalu `"Global Settings > TAG > Activate TAG"` (satu-satunya jalur discovery, §1.3/§5 `01-overview.md`); sama aturan free-string dengan `last_scanned_module` |

> **`last_scanned_module` / `registered_by_module` — free string, bukan enum (Resolved 2026-07-24):** nilai diisi dari **path menu kanonik** entry point (mis. `"Global Settings > TAG > Audit TAG"`, `"Fixed Asset > TAG > Combine TAG"`, `"Supply Asset > Stock Management > Stock Placement > Initial Stock"`) — daftar lengkap di §6 `01-overview.md`. Ini **konsisten dengan konvensi kolom `Object` di System Log/Activity Log** (`prd-conventions.md` §8.2: "Object = path menu tempat aksi terjadi"), yang juga Text bebas, bukan enum. Alasan menolak DB enum: entry point berasal dari **3 produk independen** (GS/FAMS/Supply) yang tumbuh terpisah — Supply Asset PRD saja belum ditulis (§6 `01-overview.md` sudah mendaftar entry point Supply secara speculative/forward-looking) — enum DB berarti migration setiap kali produk manapun menambah entry point scan baru, sementara app layer cukup menambah satu string konstan ke daftar kanonik §6. Validasi kebenaran nilai dilakukan di **application layer** (whitelist terhadap daftar §6), bukan DB CHECK constraint.

> **`tag_type` tidak disimpan** — dihitung on-the-fly (query time) dari kombinasi kolom identifier mana yang `NOT NULL` (`rfid_code`/`nfc_code`/`qr_code`/`ble_address`/`gps_imei`), lihat §4.2. Menghindari kolom turunan yang berisiko out-of-sync dengan identifier aslinya.
> Minimal satu dari `rfid_code`, `nfc_code`, `qr_code`, `ble_address`, `gps_imei` harus terisi.
> `rfid_code`, `nfc_code`, `ble_address`, `gps_imei` unik global (lintas client) — konsisten `device-catalog-schema.md` §identifier type (Status: Final, berlaku 5 tipe TAG); `qr_code` unik per client.
> **`TAG` adalah mirror per-client** dari `tag_units` (Admin Console, `tag-stock/04-data.md` §1.1) — enforcement uniqueness identifier & precondition existence (§6 `01-overview.md`) terjadi **di `tag_units`**, bukan diduplikasi di tabel GS ini. Status field GS (`status` — Available/Paired/Reserved/dst, §4.2) adalah **status machine lokal GS**, terpisah dari `tag_units.status` (Admin Console: active/in_use/damaged/dst) — keduanya disinkronkan satu arah sesuai `03-functional.md` §3.7 Sync Matrix, bukan field yang sama.

---

**Entitas: TAGAuditLog** *(event log per sesi audit)*

| Field | Type | Required | Deskripsi |
|-------|------|:--------:|-----------|
| id | ID | ✓ | — |
| client_id | FK → Client | ✓ | — |
| audited_by | FK → User | ✓ | User yang melakukan audit |
| audited_at | DateTime | ✓ | Waktu submit |
| tag_types_audited | JSON (array) | ✓ | Subset dari `RFID`/`NFC`/`BLE` yang dicentang di TAG Type picker (§7.4 `01-overview.md`) — terkunci begitu `Found ≥ 1`, jadi nilai final tersimpan di sini tidak berubah lagi sampai Submit. Sumber kolom "TAG Type" di Event Log (§7.5) |
| total_scanned | Int | ✓ | Jumlah TAG yang ditemukan |
| total_not_found | Int | ✓ | Jumlah TAG yang tidak ditemukan |
| mark_as_damaged_missing | Boolean | ✓ | Apakah checkbox "mark not found" dicentang |

---

**Entitas: TAGAuditDetail** *(detail per TAG per sesi audit)*

| Field | Type | Required | Deskripsi |
|-------|------|:--------:|-----------|
| id | ID | ✓ | — |
| audit_log_id | FK → TAGAuditLog | ✓ | — |
| tag_id | FK → TAG | ✓ | — |
| result | Enum | ✓ | `Found \| Not Found` |
| status_before | Enum | ✓ | Status TAG sebelum audit |
| status_after | Enum | ✓ | Status TAG setelah audit (sama jika tidak berubah) |

> **TAG combined (RFID+NFC+QR kombinasi manapun) — 1 baris `TAGAuditDetail` saja per `tag_code`.** Karena `TAG` (§4.1) disimpan **1 row per `tag_code`** (bukan per identifier — flattening ke banyak baris cuma terjadi di response layer `GET /tags`, §4.6 di bawah), `status` adalah **1 field tunggal** yang otomatis berlaku untuk semua identifier dalam combo itu. Scan sisi manapun yang auditable (RFID/NFC/BLE) sudah cukup untuk membuat 1 baris `TAGAuditDetail` dengan `result='Found'` untuk `tag_id` itu — sibling QR (kalau ada) ikut ter-update `status_after` yang sama tanpa baris `TAGAuditDetail` terpisah, karena memang cuma ada 1 `tag_id` untuk seluruh combo. Breakdown "standalone vs combined" di Dialog Submit Confirmation (`02-ui-design.md`) dihitung client-side dari field `isCombined`/`identifierType` (respons `GET /tags`, §4.6) — **tidak perlu endpoint/field baru**.

---

**Entitas: TAGCombineLog** *(event log per sesi combine/separate)*

| Field | Type | Required | Deskripsi |
|-------|------|:--------:|-----------|
| id | ID | ✓ | — |
| client_id | FK → Client | ✓ | — |
| action | Enum | ✓ | `Combine RFID & NFC \| Combine NFC & QR \| Combine RFID & QR \| Combine RFID & NFC & QR \| Separate` |
| total_combined | Int | ✓ | Jumlah set TAG yang di-combine/separate |
| from_module | Text | ✓ | Nama modul sumber (`Global Settings \| Fixed Asset \| Supply Asset`) |
| performed_by | FK → User | ✓ | — |
| performed_at | DateTime | ✓ | — |

---

**Entitas: TAGActivateLog** *(event log per sesi Activate TAG — §10.4 `01-overview.md`)*

| Field | Type | Required | Deskripsi |
|-------|------|:--------:|-----------|
| id | ID | ✓ | — |
| client_id | FK → Client | ✓ | — |
| tag_type | Enum | ✓ | `RFID` \| `NFC` \| `BLE` \| `GPS` — session-level, 1 sesi = 1 tipe (§5.1 `01-overview.md`, beda dari `TAGAuditLog.tag_types_audited` yang array karena Audit boleh multi-tipe per sesi) |
| total_submitted | Int | ✓ | Jumlah baris yang di-submit (baris "Error" auto-excluded sebelum Submit **tidak** dihitung) |
| total_activated | Int | ✓ | Subset `total_submitted` dengan hasil `activated` |
| total_waiting_approval | Int | ✓ | Subset `total_submitted` dengan hasil `waiting_approval` |
| total_failed | Int | ✓ | Subset `total_submitted` dengan hasil `failed` |
| submitted_by | FK → User | ✓ | — |
| submitted_at | DateTime | ✓ | Waktu klik `[Submit]` |

> `total_submitted = total_activated + total_waiting_approval + total_failed` — invariant, dijaga di level commit (§4.6 `POST /tags/activate/submit`).

---

**Entitas: TAGActivateDetail** *(detail per baris per sesi Activate TAG)*

| Field | Type | Required | Deskripsi |
|-------|------|:--------:|-----------|
| id | ID | ✓ | — |
| activate_log_id | FK → TAGActivateLog | ✓ | — |
| tag_id | FK → TAG | ✗ | ID baris `TAG` yang dibuat/di-update — **NULL kalau `result='failed'`** (guard gagal sebelum ada write apa pun ke `TAG`); terisi untuk `activated` maupun `waiting_approval` (keduanya tetap membuat baris `TAG`, §9 Sync Matrix `03-functional.md`) |
| identifier_type | Enum | ✓ | `rfid` \| `nfc` \| `ble` \| `gps` — sama dengan `TAGActivateLog.tag_type` induknya |
| code | Text | ✓ | Kode/MAC/IMEI yang di-submit — disimpan apa adanya (snapshot), tetap ada walau `tag_id` NULL |
| device_name | Text | ✓ | Snapshot Device Name saat commit |
| result | Enum | ✓ | `activated` \| `waiting_approval` \| `failed` |
| failure_reason | Text | ✗ | NULL kecuali `result='failed'` — sama copy dengan `POST /tags/activate/submit` response `failureReason` (§4.6) |

---

### 4.2 Enum Values

**tag_type (derived, bukan kolom tersimpan — lihat §4.1):**
`RFID` | `NFC` | `QR` | `RFID & NFC` | `RFID & QR` | `NFC & QR` | `RFID & NFC & QR` | `BLE` | `GPS`

Nilai di atas adalah **hasil realistis** dari derivasi (bukan enum tertutup yang di-hardcode): RFID/NFC/QR bisa saling dikombinasikan (7 kemungkinan non-kosong dari 3 elemen), sementara `BLE` dan `GPS` selalu berdiri sendiri — tidak ada kombinasi `BLE & *` atau `GPS & *` (standalone tracker, tidak combinable secara fisik, `01-overview.md` §3.1).

**type (kategori):**
`Object TAG` | `User TAG`

> Hanya 2 nilai — mirror `sku.is_user_tag` (boolean) di Admin Console (`tag-stock/04-data.md` §8.1). Pairing ke Group/SKU (Supply) tetap ber-Type `Object TAG`, bukan kategori terpisah (`01-overview.md` §3.2).

**status:**
`Available` | `Paired` | `Reserved` | `To be Returned` | `Damaged/Missing` | `Retired`

---

### 4.3 Relasi

- `TAG.client_id → Client.id`
- `TAGAuditDetail.audit_log_id → TAGAuditLog.id`
- `TAGAuditDetail.tag_id → TAG.id`
- `TAGActivateDetail.activate_log_id → TAGActivateLog.id`
- `TAGActivateDetail.tag_id → TAG.id` (nullable — kosong kalau `result='failed'`)
- `TAG ← (FAMS Asset / Supply Stock / User / Group / SKU)` — cross-product FK ke pairing masing-masing
- `rfid_code` dan `nfc_code`: unique constraint global (bukan per client)
- `qr_code`: unique constraint per client

---

### 4.3a Indexes

```sql
CREATE UNIQUE INDEX ON tag (rfid_code) WHERE rfid_code IS NOT NULL;      -- unik global
CREATE UNIQUE INDEX ON tag (nfc_code) WHERE nfc_code IS NOT NULL;        -- unik global
CREATE UNIQUE INDEX ON tag (ble_address) WHERE ble_address IS NOT NULL; -- unik global
CREATE UNIQUE INDEX ON tag (gps_imei) WHERE gps_imei IS NOT NULL;       -- unik global
CREATE UNIQUE INDEX ON tag (client_id, qr_code) WHERE qr_code IS NOT NULL; -- unik per client
CREATE INDEX ON tag (client_id, status);          -- filter tab All/Paired/Not Paired per client
-- Counter Card filter (klik card RFID-Object/RFID-User/NFC/QR/BLE/GPS): tag_type derived, bukan kolom — filter langsung ke kolom identifier; RFID-Object/RFID-User tambah filter is_user_tag
CREATE INDEX ON tag (client_id, rfid_code) WHERE rfid_code IS NOT NULL;
CREATE INDEX ON tag (client_id, nfc_code) WHERE nfc_code IS NOT NULL;
CREATE INDEX ON tag (client_id, qr_code) WHERE qr_code IS NOT NULL;
CREATE INDEX ON tag (client_id, ble_address) WHERE ble_address IS NOT NULL;
CREATE INDEX ON tag (client_id, gps_imei) WHERE gps_imei IS NOT NULL;
CREATE INDEX ON tag (last_scanned_at DESC);        -- default sort (§3.6 Defaults & Ordering)
CREATE INDEX ON tag_audit_detail (audit_log_id);
CREATE INDEX ON tag_audit_detail (tag_id);
CREATE INDEX ON tag_combine_log (client_id, performed_at DESC);
CREATE INDEX ON tag_activate_log (client_id, submitted_at DESC);
CREATE INDEX ON tag_activate_detail (activate_log_id);
CREATE INDEX ON tag_activate_detail (tag_id) WHERE tag_id IS NOT NULL;
```

---

### 4.4 Validasi

| Field | Rule | Pesan Error |
|-------|------|-------------|
| TAG scan | Ada di Admin Console | `Error, can't recognize TAG.` |
| TAG scan | Diotorisasi untuk client | `Error, TAG isn't authorized. Please contact Admin.` |
| RFID activate | Jumlah aktif < license | Dialog: "RFID TAG License Limit Reached" |
| NFC activate | Jumlah aktif < license | Dialog: "NFC TAG License Limit Reached" |
| BLE activate | Jumlah aktif < license | Dialog: "BLE TAG License Limit Reached" |
| GPS activate | Jumlah aktif < license | Dialog: "GPS TAG License Limit Reached" |
| Combine — TAG status | Harus Available | `Error, TAG is already paired.` |
| Combine — TAG type | Bukan User TAG | `Error, can't combine user TAG.` |
| Combine — TAG combined | Belum pernah combined | `Error, TAG is already combined.` |
| Combine — TAG retired | Bukan Retired | `Error, TAG is already retired.` |
| Combine — duplikat session | Belum ada di tabel | `Error, TAG is already on the list.` |
| Separate — TAG status | Harus Available | (validasi backend, blocked di UI) |
| Submit tanpa data | Tabel harus berisi ≥ 1 set | `Please scan the TAGs before submitting` |

---

### 4.5 Logging

Lihat §10 di `01-overview.md` untuk tabel lengkap beserta semua variasi nilai.

---

### 4.6 API Response Contract (M-2)

> Memenuhi `error-handling-convention.md` §6 & `data-contract-validation.md` Bagian A. Field nullable → null rendering §8 (`—`). Cross-link Edge Case Matrix D5 (`03-functional.md` §3.6).

**`GET /tags` — Registry list (All TAGs / Paired / Not Paired) (`02-ui-design.md` registry table)**

> **Response bentuknya flattened — 1 elemen array per identifier, bukan per baris `tag.id`.** Server melakukan flattening: untuk tiap baris `tag` yang punya N identifier non-NULL (N=1 untuk standalone, N=2-3 untuk combined RFID/NFC/QR — §3.1 `01-overview.md`), kembalikan N elemen array, masing-masing dengan `tagId` yang sama (dipakai FE untuk grouping sibling di Popup Combined TAG, `02-ui-design.md`) tapi `identifierType`/`code`/`deviceName`/`sku`/`brand`/`modelType` berbeda sesuai teknologi identifier itu. Kolom Source/Type/Status/LastScanned **diduplikasi apa adanya** di tiap elemen sibling (bukan di-null-kan) — konsisten desain "baris independen penuh" (`01-overview.md` §7.1). Ini flattening di response layer saja — skema `tag` tabel (§4.1) tetap 1 row per `tag_code` fisik, tidak berubah.

| Field name | Type | Nullable? | Source | UI mapping |
|------------|------|:---------:|--------|------------|
| `tagId` | string(UUID) | ❌ | DB: `tag.id` — **sama di semua sibling row** milik 1 `tag_code` combined | dipakai FE grouping (Popup Combined TAG), tidak ditampilkan langsung sebagai kolom |
| `rowId` | string | ❌ | derived: `{tagId}:{identifierType}` — unik per elemen array (row key React/table) | row key (tidak ditampilkan) |
| `identifierType` | enum(`rfid`,`nfc`,`qr`,`ble`,`gps`) | ❌ | derived: identifier non-NULL yang direpresentasikan elemen ini | menentukan icon kolom "TAG Type" |
| `code` | string | ❌ | DB: `tag.rfid_code`/`nfc_code`/`qr_code`/`ble_address`/`gps_imei` sesuai `identifierType` | kolom "Code" |
| `isCombined` | boolean | ❌ | derived: `true` kalau `tag_code` ini punya >1 identifier non-NULL | menentukan tampil/tidaknya icon link 🔗 di kolom Code |
| `siblingCount` | number | ❌ | derived: jumlah total identifier non-NULL di `tag_code` ini (termasuk elemen ini sendiri) — `1` kalau standalone | dipakai FE, mis. badge count di icon 🔗 kalau desain butuh (opsional) |
| `deviceName` | string | ✅ | DB: `tag.rfid_device_name`/`nfc_device_name`/`ble_device_name`/`gps_device_name` sesuai `identifierType` (§4.1). QR (tidak punya kolom device name sendiri — tidak melalui Activate TAG, §5 `01-overview.md`): kalau bagian combo (`isCombined=true`) → **inherit** dari sibling RFID/NFC pada `tagId` yang sama (prioritas RFID lalu NFC); QR standalone (Paired, tidak combined) → `null` | kolom "Device Name" — null → `—` |
| `sku` | string | ✅ | DB: `tag.rfid_sku`/`nfc_sku`/`ble_sku`/`gps_sku` sesuai `identifierType` — terisi untuk Official (selalu) **dan** BYO-dengan-SKU (opsional dipilih di Template/inline resolve); `NULL` untuk BYO tanpa SKU sama sekali (§4.1). QR: inherit dari sibling sama seperti `deviceName`, atau `null` kalau standalone | kolom "SKU" — null → `—` |
| `brand` | string | ✅ | **Derived, bukan selalu baca DB langsung**: kalau `sku` terisi (Official atau BYO-dengan-SKU) → join real-time SKU → Device Catalog (`sku.brand`, Admin Console — reflected read, bukan cache); kalau `sku` NULL (BYO tanpa SKU) → DB `tag.rfid_brand`/`nfc_brand`/`ble_brand`/`gps_brand` (`byo_brand` tersimpan, §4.1). QR: inherit dari sibling sama seperti `deviceName`, atau `null` kalau standalone. Praktis selalu terisi kecuali QR standalone | kolom "Brand" — null → `—` |
| `modelType` | string | ✅ | **Derived, pola sama seperti `brand`**: kalau `sku` terisi → join SKU → Device Catalog (`sku.model_type`); kalau `sku` NULL → DB `tag.rfid_model_type`/`nfc_model_type`/`ble_model_type`/`gps_model_type` (`byo_model_type` tersimpan). QR: inherit dari sibling, atau `null` kalau standalone. **Beda dari `brand`** — field ini genuinely opsional di data entry (Model Device Catalog bisa kosong; `byo_model_type` opsional saat Activate TAG), jadi `null` **legitimately** muncul juga untuk baris Official/BYO-dengan-SKU kalau Device Catalog memang tidak punya nilai model untuk SKU itu — bukan berarti data hilang | kolom "Model/Type" — null → `—` (memang boleh kosong, bukan error) |
| `type` | enum | ❌ | DB: `tag.type` — sama di semua sibling | kolom "Type" (Object TAG/User TAG — §4.2) |
| `source` | enum | ❌ | derived: `hardware_unit_id`/match Jalur A/B — sama di semua sibling | badge "Official"/"Self-Purchased" — `—` untuk `identifierType='qr'` |
| `status` | enum | ❌ | DB: `tag.status` — sama di semua sibling | kolom "Status" (badge — palette §6) |
| `lastScannedAt` | date(ISO) | ✅ | DB: `tag.last_scanned_at` — sama di semua sibling | kolom "Last Scanned" — null → `—`; format General Settings |
| `lastScannedModule` | string | ✅ | DB: `tag.last_scanned_module` — sama di semua sibling | kolom "Last Scanned Module" — null → `—` |
| `registeredAt` | date(ISO) | ❌ | DB: `tag.registered_at` — sama di semua sibling | kolom "Activated At" (curated field, Hidden by default — `02-ui-design.md` §2.7); format General Settings |

**Popup Combined TAG (+N More, `02-ui-design.md`)** — **tidak ada endpoint terpisah**. FE filter array `GET /tags` yang sudah di-load, ambil semua elemen dengan `tagId` sama dengan baris yang diklik, render sebagai list di popup. Berlaku baik untuk tabel web maupun card list mobile.

**`GET /tags/license-counter` — License Counter Cards, Tab All (F-TAG-04)**

| Field name | Type | Nullable? | Source | UI mapping |
|------------|------|:---------:|--------|------------|
| `rfidObjectActive` | number | ❌ | derived: `COUNT(tag WHERE rfid & is_user_tag=false & status≠Retired)` | Card "RFID – Object TAG" "active / total"; `0` valid. Juga dipakai halaman Activate TAG — helper text field "Type" begitu Object TAG dipilih (§7.8) |
| `rfidObjectLicense` | number | ❌ | derived: `stock_ledger[client][rfid][object].balance` | idem |
| `rfidUserActive` | number | ❌ | derived: `COUNT(tag WHERE rfid & is_user_tag=true & status≠Retired)` | Card "RFID – User TAG" "active / total"; `0` valid. Juga dipakai halaman Activate TAG — helper text field "Type" begitu User TAG dipilih (§7.8) |
| `rfidUserLicense` | number | ❌ | derived: `stock_ledger[client][rfid][user].balance` | idem |
| `nfcActive` | number | ❌ | derived: `COUNT(tag WHERE nfc & status≠Retired)` | Card NFC "active / total"; `0` valid |
| `nfcLicense` | number | ❌ | derived: hardware TAG license (per-client) | Card NFC total |
| `bleActive` | number | ❌ | derived: `COUNT(tag WHERE ble & status≠Retired)` | Card BLE "active / total"; `0` valid |
| `bleLicense` | number | ❌ | derived: hardware TAG license (per-client) | Card BLE total |
| `gpsActive` | number | ❌ | derived: `COUNT(tag WHERE gps & status≠Retired)` | Card GPS "active / total"; `0` valid |
| `gpsLicense` | number | ❌ | derived: hardware TAG license (per-client) | Card GPS total |
| `qrPaired` | number | ❌ | derived: `COUNT(tag WHERE qr & status=Paired)` | Card QR "paired / total"; `0` valid |
| `qrAssetLicenseTotal` | number | ❌ | derived: `asset_license_ledger.total_quantity` (Admin Console, per-client FAMS subscription, `license-allocation/04-data.md` §1.3) | Card QR total — **beda source** dari 5 card lain (bukan `stock_ledger`) |

> Counter dihitung dari state owner (registry), bukan disimpan terpisah (state-sync §5). BLE/GPS **termasuk** di counter ini, identik NFC (1 pool). RFID **beda dari 3 tipe itu** — 2 pool terpisah (`rfidObject*`/`rfidUser*`), tidak ada field gabungan `rfidActive`/`rfidLicense` (UI-nya 2 card terpisah, bukan 1 card dengan angka gabungan). Card QR formulanya beda total (paired vs Asset License, bukan aktif vs stock TAG) — lihat `01-overview.md` §7.1.

**`GET /tags/health-counter` — Health Counter Cards, Tab Not Paired (F-TAG-04a)**

| Field name | Type | Nullable? | Source | UI mapping |
|------------|------|:---------:|--------|------------|
| `rfidObjectNormal` | number | ❌ | derived: `COUNT(tag WHERE rfid & is_user_tag=false & status IN (Available,Reserved,'To be Returned'))` | Card "RFID – Object TAG" ✓ |
| `rfidObjectDamagedMissing` | number | ❌ | derived: `COUNT(tag WHERE rfid & is_user_tag=false & status='Damaged/Missing')` | Card "RFID – Object TAG" ✕ |
| `rfidUserNormal` | number | ❌ | derived: `COUNT(tag WHERE rfid & is_user_tag=true & status IN (Available,Reserved,'To be Returned'))` | Card "RFID – User TAG" ✓ |
| `rfidUserDamagedMissing` | number | ❌ | derived: `COUNT(tag WHERE rfid & is_user_tag=true & status='Damaged/Missing')` | Card "RFID – User TAG" ✕ |
| `nfcNormal` | number | ❌ | idem, filter `nfc` | Card NFC ✓ |
| `nfcDamagedMissing` | number | ❌ | idem, filter `nfc` | Card NFC ✕ |
| `qrNormal` | number | ❌ | idem, filter `qr` (jarang >0 — hanya baris QR combined, §7.1 `01-overview.md`) | Card QR ✓ |
| `qrDamagedMissing` | number | ❌ | idem, filter `qr` | Card QR ✕ |
| `bleNormal` | number | ❌ | idem, filter `ble` | Card BLE ✓ |
| `bleDamagedMissing` | number | ❌ | idem, filter `ble` | Card BLE ✕ |
| `gpsNormal` | number | ❌ | idem, filter `gps` | Card GPS ✓ |
| `gpsDamagedMissing` | number | ❌ | idem, filter `gps` | Card GPS ✕ |

> `Retired` **tidak masuk** kolom manapun di kontrak ini (bukan Normal, bukan Damaged/Missing) — konsisten `01-overview.md` §7.3. Tidak ada kolom yatim; semua field derived langsung dari `tag` (registry), bukan disimpan terpisah.

---

**`POST /tags/activate/check` — Real-time match-check per scan (F-TAG-10, §5.1 `01-overview.md`)**

> Dipanggil **tiap kali** identifier ter-scan/input di halaman Activate TAG — endpoint **ringan** (cek existence & kuota, **bukan** commit/write). Response jadi 1 baris staging di tabel FE (client-side, belum tersimpan ke server sampai `/submit`). Untuk `tagType=gps`, dipanggil per baris yang **sudah lolos Preview** client-side (format 15-digit + duplikat-dalam-batch, §4.7) — bukan langsung per baris Upload/Manual Entry mentah.

| Field name (request) | Type | Nullable? | Deskripsi |
|------------|------|:---------:|-----------|
| `tagType` | enum(`rfid`,`nfc`,`ble`,`gps`) | ❌ | Session-level, sama untuk semua baris dalam 1 sesi |
| `identifierValue` | string | ❌ | Kode/MAC/IMEI hasil scan/input |
| `template` | object | ✅ | `{deviceNameId, skuId?, byoBrand?, byoModelType?, isUserTag?}` — null kalau Self-Purchased Template tidak di-expand |

| Field name (response) | Type | Nullable? | Source | UI mapping |
|------------|------|:---------:|--------|------------|
| `status` | enum(`official`,`self_purchased`,`needs_info`,`error`,`already_active_own_client`) | ❌ | derived: match `tag_units` → `official`; tidak match + `template` terisi → `self_purchased`; tidak match + `template` kosong + `byo_activation_enabled=true` → `needs_info`; tidak match + `byo_activation_enabled=false` **atau** kuota exceeded → `error`; identifier match TAG **sudah aktif di registry client ini sendiri** → `already_active_own_client` (beda dari collision lintas-client, yang tetap masuk sebagai `official`/`self_purchased` biasa — soft-reject-nya baru kejadian nanti saat `/submit`, §9.2 `device-catalog-schema.md`) | Badge Status baris — **kecuali** `already_active_own_client`, yang **tidak pernah jadi baris** (lihat catatan di bawah) |
| `deviceName`/`sku`/`brand`/`model` | string | ✅ | Dari `tag_units` yang match (kalau `status='official'` — `brand`/`model` di-join dari SKU → Device Catalog kalau SKU match punya nilai), atau dari `template` (kalau `self_purchased` — `brand`/`model` dari `byoBrand`/`byoModelType`, atau dari SKU Template kalau `skuId` terisi), null kalau `needs_info`/`error`/`already_active_own_client` | Kolom "Device Name"/"SKU"/"Brand"/"Model/Type" (preview, staging table §7.8 `01-overview.md`) — `model` null → `—` |
| `errorReason` | string | ✅ | `"License limit reached."` atau `"Not in your official stock; self-purchased activation is not enabled for your account. Contact your administrator."` — null kecuali `status='error'` | Tooltip 🔖 badge Error |

> **`status='already_active_own_client'` — tidak masuk tabel staging.** FE **tidak** menambah baris untuk response ini — begitu diterima, langsung tampilkan toast `"Error, TAG is already activated."` (real-time, sama pola dengan toast recognize-gagal) dan buang response-nya. Ini beda dari collision lintas-client (yang tetap jadi baris normal `official`/`self_purchased`, baru resolve jadi `Waiting for Approval` saat `/submit` — §9.2 `device-catalog-schema.md`, TAG tidak pernah hard-reject collision lintas-client karena risiko manufacturing-collision; tapi collision dengan TAG **client sendiri** bukan kasus itu — inventaris sendiri terbatas & diketahui, jadi aman langsung ditolak real-time).

> **Idempotent per identifier dalam 1 sesi** — scan identifier yang sudah ada di tabel staging FE diabaikan (dicegah client-side, tidak perlu round-trip server).

> **`[Remove]` (RFID/NFC/BLE, scan-based) — tidak ada endpoint terpisah.** Identifier yang di-scan saat sesi Remove dicocokkan **client-side** ke `identifierValue` baris staging FE yang sudah ada (array yang sama, belum di-`submit`) — match → baris difilter/dihapus dari array lokal; tidak match → tidak ada efek (tidak trigger `/tags/activate/check`, karena Remove bukan menambah baris baru). GPS: Remove manual (pilih baris di tabel) juga cuma memanipulasi array staging FE, tanpa endpoint.

> **Row Edit Mode** (baris "Self-Purchased"/"Needs Info", row action `[Edit]`/`[Resolve]` — inline di tabel, mirror Import `import/02-ui-design.md` State C4, bukan Dialog/popup) — tidak ada endpoint terpisah. Field Device Name/SKU/Brand/Model/Type baris staging FE di-update in-place setelah `[Save]`; `status` baris jadi/tetap `self_purchased`, tidak perlu panggil ulang `/tags/activate/check` (guard kuota per baris re-dievaluasi client-side sama seperti saat `[Resolve]` pertama kali, §3.2 `03-functional.md`).
>
> **Bulk Resolve** (ditambahkan 2026-08-04, checkbox multi-select baris "Needs Info" + `[Apply to N rows]`, §5.1 `01-overview.md`) — **juga tidak ada endpoint terpisah**, sama prinsip Row Edit Mode: FE menerapkan 1 set nilai (Device Name/SKU/Brand/Model/Type) ke N elemen array staging sekaligus, in-place, client-side. Tiap baris tetap dievaluasi guard kuota per baris masing-masing (RFID: pool ditentukan Type yang sama-sama di-apply). Server baru melihat hasilnya saat `/tags/activate/submit` — tidak ada bedanya bagi backend antara baris yang diresolve satu-satu vs bulk, keduanya masuk sebagai baris `status=self_purchased` biasa di `rows[]`.

**`POST /tags/activate/submit` — Commit batch (F-TAG-11, §5.1 `01-overview.md`)**

> Dipanggil **sekali** saat klik `[Submit]` — membawa seluruh baris staging (kecuali badge "Error", auto-exclude). Server jalankan **Langkah 0 (pre-check kuota agregat)** dulu sebelum commit dimulai; kalau lolos, baru **re-validasi tiap baris** (tidak percaya hasil `/check` tadi — race condition, lihat `03-functional.md` §3.2) dan commit **per baris independen** (partial commit, bukan all-or-nothing transaction) — partial commit ini cuma berlaku untuk race residual di level commit, **bukan** untuk hasil Langkah 0 (Langkah 0 gagal → 0 baris commit, lihat response di bawah).

| Field name (request) | Type | Nullable? | Deskripsi |
|------------|------|:---------:|-----------|
| `tagType` | enum | ❌ | Session-level |
| `rows` | array | ❌ | `[{identifierValue, status (dari /check), deviceNameId?, skuId?, byoBrand?, byoModelType?, isUserTag?}]` — tiap elemen 1 baris staging (badge Official pakai data dari match preview; Self-Purchased pakai Template atau hasil inline resolve) |

**Langkah 0 — Pre-check kuota agregat (jalan pertama, sebelum commit dimulai)**

> Server hitung jumlah baris per kategori kuota (`RFID-Object`/`RFID-User`/`NFC`/`BLE`/`GPS`, dari `rows` yang dikirim, badge "Error" sudah di-exclude di FE) dan bandingkan dengan kuota tersedia **real-time** (bukan angka dari `/check` awal). Kalau **ada ≥1 kategori kurang**, response top-level langsung berhenti di sini — field di bawah **tidak** dieksekusi (0 baris commit, tidak ada side effect, tidak ada `TAGActivateLog`).
>
> **Guard ini re-dijalankan lagi tepat sebelum transaksi commit benar-benar menulis** (bukan cuma sekali di awal) — kalau lolos di sini tapi ternyata sudah tidak cukup lagi pas mau commit (race, sesi lain keburu commit duluan), response yang dikembalikan **identik**: `quotaCheckFailed=true` + `shortfalls` yang sama, transaksi rollback, 0 baris commit. Dua checkpoint (awal & tepat-sebelum-commit), satu response contract — bukan `result='failed'` per baris.

| Field name (response, top-level, hanya ada jika Langkah 0 gagal) | Type | Nullable? | Source | UI mapping |
|------------|------|:---------:|--------|------------|
| `quotaCheckFailed` | boolean | ❌ | `true` kalau Langkah 0 gagal (≥1 kategori kurang); field ini **tidak ada** (undefined) kalau Langkah 0 lolos — FE lanjut baca response per baris seperti biasa | Trigger Dialog "Insufficient Quota" vs lanjut proses response normal |
| `shortfalls` | array | ✅ | `[{category, needed, available}]` — `category` ∈ {`rfid_object`,`rfid_user`,`nfc`,`ble`,`gps`}; hanya kategori yang kurang, bukan semua kategori; null kalau `quotaCheckFailed=false`/tidak ada | Body Dialog "Insufficient Quota" — baris breakdown `"[Category]: need [N], only [M] available."` per elemen |

> Kalau `quotaCheckFailed=true`: FE tampilkan Dialog "Insufficient Quota" (§2.3 `02-ui-design.md`), tutup dialog → refresh angka kuota di halaman, tabel staging **tetap utuh** (tidak ada baris hilang/berubah status) — user manual `[Remove]` via scan beberapa baris lalu klik `[Submit]` lagi untuk retry. Tidak ada `TAGActivateLog`/`TAGActivateDetail` ditulis untuk percobaan Submit yang gagal di Langkah 0 (nihil komit = nihil log).

**Per baris (jalan hanya kalau Langkah 0 lolos)**

| Field name (response, per elemen `rows`) | Type | Nullable? | Source | UI mapping |
|------------|------|:---------:|--------|------------|
| `identifierValue` | string | ❌ | Echo dari request — FE match balik ke baris staging | — |
| `result` | enum(`activated`,`waiting_approval`,`failed`) | ❌ | derived: commit sukses (Jalur A/B) → `activated`; collision baru ketahuan saat commit → `waiting_approval`; guard per-baris gagal (identifier sudah aktif, atau `byo_activation_enabled` race) → `failed` | Badge hasil baris — "Activated"/"Waiting for Approval"/"Failed" |
| `failureReason` | string enum(2 nilai) | ✅ | Null kecuali `result='failed'` — closed list: `"This identifier has already been activated."` (identifier keburu aktif via sesi lain, race) / `"Self-purchased device activation is not enabled for your account."` (`byo_activation_enabled` berubah `false` saat commit, race jarang). Kuota **tidak pernah** muncul di sini — kuota exceeded saat commit membatalkan seluruh transaksi (lihat baris "Kuota kategori" di Matrix bawah), bukan menghasilkan `result='failed'` per baris | Tooltip 🔖 badge Failed |
| `wasAutoSwitched` | boolean | ❌ | `true` kalau baris awalnya badge "Self-Purchased" tapi ternyata match `tag_units` saat commit (§3.2 `03-functional.md`) | Menentukan indikator "Matched to your official stock — details updated automatically." vs toast biasa |
| `tagId` | string(UUID) | ✅ | ID baris `TAG` (GS) yang baru dibuat/di-update — null kalau `result='failed'` | Dipakai FE untuk link balik ke baris registry setelah Submit |

> Response array **selalu sepanjang jumlah baris yang dikirim** (dikurangi baris "Error" yang di-exclude sebelum request) — tidak ada elemen hilang, supaya FE bisa update badge tiap baris staging satu-satu tanpa ambiguitas.

> **Event Log ditulis atomik dalam transaksi commit yang sama** — 1 `TAGActivateLog` (§4.1) per panggilan `/submit`, `total_submitted`/`total_activated`/`total_waiting_approval`/`total_failed` dihitung dari agregat `result` di seluruh `rows`; 1 `TAGActivateDetail` per elemen `rows` (`tag_id` null kalau `result='failed'`). Populate Popup Event Log — Activate TAG & Popup Activate TAG Detail (§7.9/§7.10 `01-overview.md`).

---

### 4.7 Validation Rules Table (M-3)

> Mengonsolidasikan `prd-conventions.md` §4–5 (rujuk pasal, bukan restate). Modul ini **read-only registry + scan** — tidak ada form Create/Edit field bebas; validasi berlaku pada input scan & aksi.

**Form: Activate TAG (Bulk staging, deferred submit, §5.1 `01-overview.md`)**

> `tag_type` dan Self-Purchased Template diisi **sekali per sesi** (session-level, di atas tabel). Field per baris (`rfid_code`/`nfc_code`/`ble_address`/`gps_imei`) diisi berulang lewat scan. Baris "Needs Info" resolve field yang sama dengan Template tapi **khusus baris itu** (tidak menimpa Template session-level).

| Field | Required? | Type/Format | Min/Max | Unique? (+scope) | Error message (EN) | Timing | Default (Create) |
|-------|:---------:|-------------|---------|------------------|--------------------|--------|--------------------|
| `tag_type` (RFID/NFC/BLE/GPS) | ✅ | radio, session-level | — | — | `[Scan TAG]` disabled kalau kosong (§8 `01-overview.md`) | langsung | kosong |
| `device_name_id` (Self-Purchased Template) | ✅ **hanya kalau Template di-expand** | select (Device Catalog, kategori sesuai `tag_type`), session-level | — | — | Template tidak bisa di-expand lebih jauh kalau kosong | langsung | kosong |
| `sku_id` (Template) | ❌ | select (Device Catalog, searchable), session-level | — | — | — (opsional; kosong = BYO tanpa SKU, tetap NULL selamanya — tidak ada auto-assign generic, §9.8 `device-catalog-schema.md`) | — | kosong |
| `byo_brand` (Template) | ✅ **hanya jika `sku_id` Template kosong** | text, session-level — **field selalu tampil** (tidak pernah hilang dari form); kalau `sku_id` terisi jadi **auto-filled dari data SKU + disabled** (read-only, bukan input) | ≤100 | — (bukan master data, tidak divalidasi terhadap katalog Brand) | Template belum lengkap kalau kosong (hanya relevan saat `sku_id` kosong — saat disabled, tidak ada validasi karena bukan input user) | langsung | kosong; auto-terisi dari SKU begitu `sku_id` dipilih |
| `byo_model_type` (Template) | ❌ | text, session-level — **field selalu tampil**, perilaku sama seperti `byo_brand` (disabled+auto-filled saat `sku_id` terisi; editable & opsional saat kosong) | ≤120 | — | — (opsional, null → `—` bukan teks "No Model") | — | kosong; auto-terisi dari SKU begitu `sku_id` dipilih |
| `is_user_tag` (Template) | ✅ **hanya jika `sku_id` Template kosong DAN `tag_type`=RFID** | radio (Object TAG / User TAG), session-level — **field selalu tampil untuk RFID** (tidak pernah hilang); NFC/BLE/GPS tetap tidak punya field ini sama sekali | — | — | Template belum lengkap kalau kosong (padahal `sku_id` kosong & `tag_type`=RFID) | langsung | kalau `sku_id` terisi: **auto-filled dari `sku.is_user_tag` + disabled** (§3.2 `01-overview.md`). Kalau `sku_id` kosong & `tag_type`∈{NFC,BLE,GPS}: hardcode `false`/Object TAG, field tidak tampil sama sekali — cuma RFID yang punya split Object/User (mirror `hardware-allocation`, §5.2b `01-overview.md`) |
| **Clear SKU** (`sku_id` Template) | — | Klik `[✕]` di field SKU → `sku_id` kembali `NULL`/kosong | — | — | — | user klik `[✕]` | `byo_brand`/`byo_model_type`/`is_user_tag` **ter-reset kosong** (bukan restore nilai lama sebelum SKU dipilih) dan balik jadi editable |
| Stale reference — `device_name_id`/`sku_id` Template (D6, §5.7 `error-handling-convention.md`) | — | — | — | — | Server re-validasi referensi Device Catalog **saat `[Submit]`** (bukan cuma saat dipilih di Template) — kalau Device Name/SKU sudah dihapus/dinonaktifkan sejak dipilih: `422` field-level per baris terdampak, `"This device name no longer exists. Please select another."` / `"This SKU no longer exists. Please select another."`; baris tsb kembali ke status "Needs Info" (bukan gagal total), Template/dropdown terkait auto-clear + re-fetch opsi terbaru; baris lain yang valid tetap commit (partial, bukan all-or-nothing, konsisten §5.1) | saat klik `[Submit]`, sebelum commit | — |
| `device_name_id`/`sku_id`/`byo_brand`/`byo_model_type`/`is_user_tag` (Row Edit Mode, baris "Needs Info") | Sama aturan required seperti Template di atas, tapi **per baris** | Sama Type/Format seperti Template, per baris | — | — | `[Save]` blocked selama baris ini belum lengkap | saat sel diisi di Row Edit Mode & `[Save]` diklik | kosong; hilang dari tabel begitu badge berubah jadi "Self-Purchased" |
| `rfid_code`/`nfc_code` | ✅ (kalau `tag_type`=RFID/NFC) | scan, per baris | — | ✅ global (§9.8a `device-catalog-schema.md` — **beda dari Hardware**: TAG tidak di-scope per-SKU, identifier mentah sudah unik global sejak §9.2) | recognize gagal: `"Error, can't recognize TAG."` (toast, tidak masuk tabel); collision lintas-client → **selalu** masuk `Waiting for Approval` saat Submit (soft-reject, tidak ada hard-reject untuk TAG — beda dari Hardware, konsisten §9.2); sudah aktif di client ini sendiri → toast real-time `"Error, TAG is already activated."` saat scan (tidak masuk tabel, §4.6 `status='already_active_own_client'`), atau baris "Failed" saat Submit `"This identifier has already been activated."` kalau race (lolos real-time-check) | saat scan (real-time-check) & saat Submit (re-validasi) | auto-filled dari scan |
| `ble_address` | ✅ (kalau `tag_type`=BLE) | scan/pair Bluetooth, per baris — **tidak ada input manual**, MAC Address tidak dirancang untuk diketik manusia (`scan-foundation.md` §4.8) | — | ✅ global (sama pola dengan `rfid_code`/`nfc_code`, `device-catalog-schema.md` §identifier type) | sama pola error dengan `rfid_code`/`nfc_code` di atas | sama timing di atas | auto-filled dari scan/pair |
| `gps_imei` | ✅ (kalau `tag_type`=GPS) | **bukan scan** — Upload File (.csv/.xlsx, kolom IMEI) atau Manual Entry (ketik IMEI, `[+ Add]`), per baris; identik `Admin-Console/PRD/tag-stock/02-ui-design.md` §4b (`scan-foundation.md` §4.8/§5.6: registrasi GPS di luar scope live scan) | 15 digit numerik | ✅ global (sama pola dengan `rfid_code`/`nfc_code`, `device-catalog-schema.md` §identifier type) | format bukan 15 digit → "Invalid Format" (Preview, tidak lanjut ke match-check); duplikat dalam batch Upload/Manual Entry yang sama → "Duplicate in File" (Preview, tidak lanjut); selain itu sama pola error dengan `rfid_code`/`nfc_code` di atas | validasi format & duplikat saat Preview (client-side, sebelum match-check); sisanya sama timing di atas | dari Upload file atau Manual Entry, lolos Preview |
| Self-Purchased enablement | — | — | — | Template locked total: tooltip 🔖 `"Self-purchased activation is not enabled for your account. Contact your administrator."` — Baris tidak match tanpa Template: badge "Error", tooltip `"Not in your official stock; self-purchased activation is not enabled for your account. Contact your administrator."` | saat scan (real-time-check), `byo_activation_enabled=false` | — |
| Baris "Needs Info" (D5) | — | — | — | Bukan error — badge "Needs Info", menunggu `[Resolve]` | saat scan, tidak match & Template kosong & `byo_activation_enabled=true` | — |
| Auto-switch ke Jalur A (D5) | — | — | — | Bukan error — indikator: `"Matched to your official stock — details updated automatically."` | saat Submit, baris badge "Self-Purchased" ternyata match `tag_units` (race) | — |
| License per tipe (real-time-check) | — | — | — | Badge "Error" pada baris, tooltip: `"License limit reached."` — sesi scan tidak berhenti | saat scan, kuota tipe tsb habis | — |
| License agregat per kategori (Submit, Langkah 0) | — | — | — | Submit batal total (0 baris commit); Dialog "Insufficient Quota" breakdown per kategori (§4.6 `quotaCheckFailed`/`shortfalls`) | saat klik `[Submit]`, sebelum commit dimulai — kuota real-time dibandingkan jumlah baris non-Error di tabel | — |
| License per tipe (Submit, race residual — lolos Langkah 0) | — | — | — | Seluruh commit dibatalkan (rollback), `quotaCheckFailed=true` lagi — sama seperti Langkah 0, **bukan** partial commit | saat Submit, kuota kategori ternyata sudah tidak cukup lagi tepat sebelum commit menulis (sesudah Langkah 0 sempat lolos) | — |

**Aksi: Scan / Pairing-Usage / Combine / Separate / Audit (server-validated)**

| Field/Aksi | Required? | Type/Format | Unique? (+scope) | Error message (EN) | Timing |
|------------|:---------:|-------------|------------------|--------------------|--------|
| `rfid_code` | ❌ (≥1 kode wajib) | text | ✅ global (§5.3) | — (lihat Activate TAG di atas untuk error aktivasi; Pairing/Usage: TAG belum diaktivasi → error tersendiri di bawah) | saat scan |
| `nfc_code` | ❌ (≥1 kode wajib) | text | ✅ global (§5.3) | idem | saat scan |
| `qr_code` | ❌ (≥1 kode wajib) | text | ✅ per-client (§5.3) | idem | saat scan |
| `ble_address` (Audit saja — **bukan** Combine, **bukan** Search by Scan; BLE di luar scope default Search by Scan, `scan-foundation.md` §4.9) | ❌ (≥1 kode wajib) | text | ✅ global (§5.3) | idem | saat scan |
| `gps_imei` — **tidak pernah muncul di tabel ini**: GPS tidak ikut Audit/Combine/Separate (§3.5 `03-functional.md`), dan di luar scope default Search by Scan (`scan-foundation.md` §4.9); satu-satunya titik GPS masuk sistem adalah Activate TAG via Upload/Manual Entry (§4.7 di atas), bukan live scan | — | — | — | — | — |
| TAG scan (Pairing/Usage) — belum diaktivasi | — | — | — | `"This TAG hasn't been activated yet. Please contact Admin."` (§8) | saat scan |
| TAG scan — authorize | — | — | — | `"Error, TAG isn't authorized. Please contact Admin."` (§8) | saat scan |
| Combine — status Available | — | — | — | `"Error, TAG is already paired."` | saat scan |
| Combine — bukan User TAG | — | — | — | `"Error, can't combine user TAG."` | saat scan |
| Combine — belum combined | — | — | — | `"Error, TAG is already combined."` | saat scan |
| Combine — bukan Retired | — | — | — | `"Error, TAG is already retired."` | saat scan |
| Combine — duplikat sesi | — | — | — | `"Error, TAG is already on the list."` | saat scan |
| Submit — tabel berisi ≥1 set | ✅ | — | — | `"Please scan the TAGs before submitting"` | setelah Submit |

> `rfid_code`/`nfc_code`/`ble_address`/`gps_imei` unik **global**, `qr_code` unik **per-client** — selaras unique constraint DB §4.3 (error-handling §5.3). Boundary/duplicate dicakup Edge Case Matrix D5 (§3.6). Double-submit guard + idempotency key untuk Activate/Combine/Separate/Audit (error-handling §5; resilience §3.7). Combine/Separate tetap RFID/NFC/QR saja — `ble_address`/`gps_imei` tidak pernah dipakai di aksi tsb (§3.5 `03-functional.md`).

### 4.8 SSE Events (§5.6a `error-handling-convention.md`)

| Event Name | Trigger | Payload tambahan (di luar §4.6) | Konsumen |
|------------|---------|----------------------------------|----------|
| `tag.activated` | Submit Activate TAG — per identifier hasil Activated | `tagType` | Tab All (baris baru) |
| `tag.status_changed` | Pairing/Usage, Mark as Missing/Damaged (Audit), To be Returned, Retired, Approve/Reject Jalur B collision | `status` | Tab All/Paired/Not Paired (badge Status) |
| `tag.combined` / `tag.separated` | Submit Combine & Separate TAG | `tagCodes` (set identifier terdampak) | Tab All (icon link 🔗); Combine & Separate staging |
| `tag.audited` | Submit Audit TAG (Found/Not Found) | `status` | Tab Not Paired |
