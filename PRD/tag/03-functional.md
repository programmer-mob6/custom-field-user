## 3. Functional Requirements

> Ditujukan untuk: **Programmer (Backend & Frontend)**

### 3.1 Core Functions

| ID | Fungsi | Deskripsi | Prioritas |
|----|--------|-----------|:--------:|
| F-TAG-01 | Registry — All TAGs | Tampilkan semua TAG lintas status + Search by Scan; read-only | P0 |
| F-TAG-02 | Registry — Paired | Tampilkan TAG berstatus Paired + Search by Scan | P0 |
| F-TAG-03 | Registry — Not Paired | Tampilkan TAG non-Paired + Search by Scan + Audit TAG + Event Log | P0 |
| F-TAG-04 | License Counter Cards (Tab All) | 6 card — RFID Object TAG/RFID User TAG (2 pool terpisah)/NFC/BLE/GPS: aktif vs total unit teralokasi (`stock_ledger`); Card QR: paired vs total Asset License (`asset_license_ledger`) — beda formula. Tiap card sekaligus filter, menggantikan filter toggle terpisah | P0 |
| F-TAG-04a | Health Counter Cards (Tab Not Paired) | 6 card — RFID Object TAG/RFID User TAG/NFC/QR/BLE/GPS: breakdown Normal (Available+Reserved+To be Returned) vs Damaged/Missing; Retired tidak dihitung. Klik card = filter, level card | P0 |
| F-TAG-05 | Entry Point Lain — Pairing/Usage | Scan TAG dari entry point manapun (§6 `01-overview.md`) — hanya berlaku untuk TAG yang sudah Active/Available; menolak identifier yang belum diaktivasi | P0 |
| F-TAG-06 | Combine TAG | Gabungkan 2–3 TAG (RFID/NFC/QR saja — BLE/GPS tidak combinable, §3.5) menjadi satu entitas | P0 |
| F-TAG-07 | Separate TAG | Pisahkan TAG Combined (hanya Available) menjadi single TAG | P0 |
| F-TAG-08 | Audit TAG | Pilih TAG Type (checkbox multi-select RFID/NFC/BLE — **GPS tidak**, §3.5), scan TAG Not Paired bertipe terpilih, update status Found/Not Found — tanpa mekanisme undo per baris, batalkan lewat Cancel seluruh sesi | P0 |
| F-TAG-09 | Status Sync | Terima trigger perubahan status dari FAMS/Supply | P0 |
| F-TAG-10 | Activate TAG — Bulk Scan & Real-time Resolve | Scan berkali-kali (Multi/Batch) ke tabel staging; tiap identifier real-time match-check ke `tag_units` → badge Official/Self-Purchased (dari Template)/Needs Info/Error per baris; `[Resolve]` per baris via Row Edit Mode (inline di tabel, mirror Import) untuk baris Needs Info, **atau** Bulk Resolve (checkbox multi-select baris Needs Info + apply 1 set nilai ke semua terpilih, ditambahkan 2026-08-04) untuk sesi dengan banyak baris beridentitas sama; identifier yang sudah aktif di client ini sendiri **tidak masuk tabel** — lihat F-TAG-15 | P0 |
| F-TAG-11 | Activate TAG — Submit & Commit (deferred) | `[Submit]` → Langkah 0 pre-check kuota agregat dulu (F-TAG-14), baru re-validasi + commit semua baris server-side sekaligus (partial commit per baris) — match → Jalur A (write-back `in_use`); tidak match → Jalur B (`tag_units` baru, gate `byo_activation_enabled` + kuota) | P0 |
| F-TAG-12 | Activate TAG — Collision Approval | Baris Self-Purchased collision dengan `tag_units` lain yang sudah aktif (baru ketahuan saat Submit) → Waiting for Approval, approver Total Control + Additional Approver entitas Principal, 1 level **rule OR** (approval selesai begitu salah satu dari mereka memutuskan — `approval-foundation.md` §1.2) | P1 |
| F-TAG-13 | Event Log Activate TAG | Popup page-level halaman Activate TAG — 1 baris = 1 sesi Submit, breakdown Activated/Waiting for Approval/Failed via row action Detail (§7.9/§7.10 `01-overview.md`) | P0 |
| F-TAG-14 | Activate TAG — Insufficient Quota Pre-check | Pre-check agregat kuota per kategori saat klik `[Submit]`, sebelum commit dimulai — kurang di ≥1 kategori → Submit batal total + Dialog breakdown; cukup → lanjut ke commit per baris seperti biasa | P1 |
| F-TAG-15 | Activate TAG — Same-Client Duplicate Detection | Real-time-check deteksi identifier yang sudah aktif di registry client ini sendiri → toast error, baris tidak masuk tabel (beda dari collision lintas-client yang tetap Waiting for Approval) | P1 |

---

### 3.2 Business Logic

**[F-TAG-05] Entry Point Lain — Pairing/Usage (§6 `01-overview.md`), validasi saat scan:**
1. TAG **sudah** ada di registry client ini (hasil Activate TAG, F-TAG-10/11) → lanjut; tidak ditemukan → `"This TAG hasn't been activated yet. Please contact Admin."` (bukan lagi discovery implisit — revisi 2026-07-15; copy diarahkan ke Admin bukan self-service karena entry point ini dipakai lintas modul oleh user yang belum tentu punya capability Activate TAG)
2. TAG diotorisasi untuk client ini → lanjut
3. TAG sudah ada di tabel/sesi yang sama → abaikan (tidak duplikat, tidak error)

> **Tidak ada guard kuota di titik ini** — kuota sudah dicek tuntas saat Activate TAG (F-TAG-10/11). Entry point Pairing/Usage murni operasi pada TAG yang statusnya sudah pasti (Available/Active), tidak pernah membuat baris `tag_units`/`TAG` baru.

**[F-TAG-10] Activate TAG — Bulk Scan & Real-time Resolve (§5.1 `01-overview.md`):**

> **Bulk, staging, deferred submit**: Client scan berkali-kali ke tabel staging (Multi/Batch mode, `scan-foundation.md` §4.3), tiap baris resolve status secara **real-time** (ringan, cek existence & kuota — **bukan** commit/write ke database), baru commit sesungguhnya terjadi sekali di `[Submit]` (F-TAG-11). Ini menggantikan model single-item lama (per-scan langsung commit) — bulk butuh staging supaya Client bisa scan banyak TAG cepat tanpa nunggu round-trip commit tiap item, dan bisa resolve baris bermasalah sebelum semuanya final.
>
> **Khusus TAG Type = GPS**: bukan scan (`scan-foundation.md` §4.8/§5.6 — GPS tidak punya mekanisme live scan sama sekali). Identifier masuk via **Upload File** (.csv/.xlsx, kolom `IMEI`) atau **Manual Entry** (ketik IMEI, `[+ Add]`), lolos **Preview** client-side dulu (format 15-digit numerik + duplikat-dalam-batch — kemunculan kedua dst. dari IMEI yang sama ditandai "Duplicate in File") sebelum baris yang valid diteruskan ke real-time match-check yang sama di bawah. Pola identik `Admin-Console/PRD/tag-stock/02-ui-design.md` §4b.

1. Pilih **TAG Type** (wajib, session-level — mengunci kategori Device Catalog untuk seluruh sesi scan, tidak bisa dicampur).
2. **[Opsional] Self-Purchased Template** — Device Name (wajib jika expand) → SKU (opsional, dropdown searchable Device Catalog, ada icon `[✕]` clear begitu terisi) → **Brand + Model selalu tampil** (tidak pernah hilang dari form): SKU terisi → auto-filled dari data SKU + **disabled**; SKU kosong → editable, Brand wajib diisi. **Khusus TAG Type = RFID**, Type (Radio Object TAG/User TAG) juga **selalu tampil**: SKU terisi → auto-filled dari `sku.is_user_tag` + disabled; SKU kosong → editable, wajib dipilih (§3.2 `01-overview.md`) — NFC/BLE/GPS tidak punya field Type sama sekali, BYO-nya otomatis `is_user_tag=false`/Object TAG (mirror `hardware-allocation` yang juga cuma split Object/User untuk Category RFID). **Clear SKU** (klik `[✕]`) → SKU kosong lagi, Brand/Model/Type balik editable & ter-reset kosong (bukan restore nilai lama). Template diisi **sekali**, jadi default identitas untuk baris manapun yang nanti tidak match. Locked (disabled total) kalau `clients.byo_activation_enabled=false` untuk Client ini.
3. **[RFID/NFC/BLE]** `[Scan TAG]` → tiap identifier ter-scan; **[GPS]** Upload File/Manual Entry → tiap identifier lolos Preview — keduanya trigger **real-time match-check** yang sama (endpoint ringan, lihat `04-data.md` §4.6) ke `tag_units`:
   - **Guard — Kuota (real-time, informational)**: `active_count` (TAG di tipe yang dipilih milik Client, kecuali Retired) `>= stock_ledger[client][tag][category].balance` (plafon) → baris masuk tabel dengan badge **Error**, tooltip `"License limit reached."` — **sesi scan tidak berhenti**, TAG berikutnya masih bisa discan (beda dari model lama yang jeda dialog blocking tiap kali kuota habis). **Khusus RFID**: `category` di atas bukan 1 pool tunggal — pool-nya ditentukan `is_user_tag` **per baris**, bukan per sesi (§3.2 `01-overview.md`): baris badge Official pakai `is_user_tag` dari SKU yang match (bisa beda-beda antar baris dalam sesi RFID yang sama); baris Self-Purchased (Template/inline resolve) pakai `is_user_tag` dari Type yang dipilih di Template. Guard kuota mengecek pool yang sesuai per baris, bukan 1 angka gabungan
   - **Baris Self-Purchased sebelum Template Type terisi (RFID)**: real-time-check kuota **ditunda** — baris masuk badge **Needs Info** meski Device Name/SKU sudah cocok Template, karena pool RFID tidak bisa ditentukan tanpa Type. Begitu Type diisi (di Template atau via `[Resolve]` per baris), guard kuota jalan mundur untuk baris-baris yang tadinya tertunda karena alasan ini — **pengecualian sempit** terhadap aturan umum "Template tidak retroaktif" (§5.1 `01-overview.md`): ini murni soal *kapan kuota bisa divalidasi* (RFID genuinely tidak bisa ditentukan pool-nya tanpa Type, bukan soal kenyamanan UX), bukan soal identitas field (Device Name/SKU/Brand/Model) yang tetap snapshot-per-baris seperti biasa dan tidak pernah ditulis ulang otomatis oleh Template
   - **Match `tag_units`** → baris masuk badge **Official**; kolom "Device Name"/"SKU"/"Brand"/"Model/Type"/`is_user_tag` auto-terisi dari unit yang match (preview, belum di-commit)
   - **Tidak match, Template terisi** → baris masuk badge **Self-Purchased**; kolom "Device Name"/"SKU"/"Brand"/"Model/Type" dari Template
   - **Tidak match, Template kosong, `byo_activation_enabled=true`** → baris masuk badge **Needs Info**; kolom "Device Name"/"SKU"/"Brand"/"Model/Type" kosong, menunggu inline resolve
   - **Tidak match, `byo_activation_enabled=false`** → baris masuk badge **Error**, tooltip `"Not in your official stock; self-purchased activation is not enabled for your account. Contact your administrator."`
   - **Identifier sudah ada di tabel sesi ini** (duplikat scan) → diabaikan, sama pola Combine (`"Error, TAG is already on the list."` kalau perlu feedback eksplisit)
   - **Identifier match baris `TAG` registry yang sudah aktif di client ini sendiri** (bukan `tag_units` yang belum diaktivasi — ini match ke registry GS milik client ini dari sesi Activate TAG sebelumnya) → **toast error real-time, baris TIDAK masuk tabel**: `"Error, TAG is already activated."` — sesi scan tidak berhenti. **Beda dari collision lintas-client** (yang tetap lewat Waiting for Approval di Submit, bukan toast, lihat F-TAG-12) — risiko manufacturing-collision antara 2 chip fisik berbeda yang kebetulan sama-sama dipegang **client yang sama** jauh lebih kecil dibanding lintas platform, jadi aman langsung ditolak tanpa approval
4. Baris **Needs Info** → row action `[Resolve]` → **Row Edit Mode** (bukan Dialog/popup — sel jadi input aktif langsung di baris itu, field identik Template: Device Name*/SKU/Brand*/Model/Type, mirror Import `import/02-ui-design.md` State C4), khusus baris itu → `[Save]` → badge berubah jadi **Self-Purchased** begitu lengkap. Kolom Actions hilang dari seluruh tabel & toolbar disabled selama sesi aktif (§7.8 `01-overview.md`).
4a. **Bulk Resolve** (ditambahkan 2026-08-04, §7.8 `01-overview.md`/`02-ui-design.md`) — alternatif untuk sesi dengan banyak baris Needs Info beridentitas sama (mis. banyak device BYO dari brand yang sama): checkbox cuma tampil di baris badge Needs Info → centang ≥1 → bulk action bar `[Resolve Selected]` → panel inline field-set sama (diisi sekali) → `[Apply to N rows]` → semua baris terpilih ter-update sekaligus (badge → Self-Purchased, nilai identik, snapshot bukan live-binding). Sama guard dengan Row Edit Mode: kolom Actions & checkbox hilang dari seluruh tabel, toolbar disabled, mutually exclusive dengan sesi Row Edit Mode single-row (cuma 1 sesi edit aktif — single atau bulk). Baris hasil Bulk Resolve tetap bisa dikoreksi individual lewat `[Edit]` biasa sesudahnya.
5. Baris **Self-Purchased** (dari Template maupun hasil `[Resolve]` sebelumnya) → row action `[Edit]` → Row Edit Mode yang sama — field yang sama pre-filled untuk dikoreksi langsung di baris, tanpa perlu Remove + scan/input ulang. Tidak berlaku untuk badge **Official** (data ikut match `tag_units`, bukan input manual).
6. `[Remove]` — beda mekanisme per TAG Type, **bukan** aksi per-baris manual lagi untuk RFID/NFC/BLE:
   - **RFID/NFC/BLE**: `[Remove]` **scan-based** — klik memulai sesi scan mode Remove (Shared Scan Component, sama seperti `[Scan TAG]`, tanpa overlay pilih metode); identifier yang di-scan dicocokkan ke Code baris staging yang sudah ada → baris yang match dihapus (kalau ada, termasuk baris Error — satu-satunya cara menghilangkan baris Error dari tabel). Mencegah salah hapus baris akibat pilih manual di tabel yang sudah panjang — akurasi dijamin karena harus scan fisik TAG yang sama.
   - **GPS**: `[Remove]` tetap **manual** (pilih baris di tabel, klik Remove) — GPS tidak pernah discan (`scan-foundation.md` §4.8/§5.6), jadi Remove by Scan tidak applicable untuk tipe ini.

> QR tidak melalui Activate TAG sama sekali — QR digenerate langsung di client (FAMS/Supply), pakai hard cap terpisah (asset cap Starter, §3.5), bukan guard kuota RFID/NFC/BLE/GPS di atas.

**[F-TAG-11] Activate TAG — Submit & Commit (deferred, partial commit):**

> `[Submit]` **disabled** selama masih ada baris badge "Needs Info". Baris "Error" **tidak** memblok Submit — otomatis di-exclude dari commit.

1. Klik `[Submit]` → **Langkah 0 — Guard Kuota Agregat (pre-check, sebelum commit apa pun dimulai)**: server hitung total baris non-Error per kategori kuota (RFID–Object/RFID–User/NFC/BLE/GPS) yang akan di-submit, bandingkan terhadap sisa kuota **ter-fetch ulang** (bukan angka real-time-check yang mungkin sudah basi):
   - **Ada ≥1 kategori kekurangan** → **Submit dibatalkan sepenuhnya, tidak ada baris yang commit** — response mengembalikan breakdown kategori yang kurang + selisihnya → FE tampilkan Dialog "Insufficient Quota" (§7.8 `01-overview.md`, wireframe `02-ui-design.md`). Tabel staging tidak berubah; user perlu `[Remove]` beberapa baris manual lalu klik `[Submit]` lagi.
   - **Semua kategori cukup** → lanjut ke commit (atomik) di bawah.
2. **Commit** (satu transaksi atomik mencakup semua baris non-Error yang lolos Langkah 0):
   - **Guard — Kuota Agregat, re-validasi FINAL** (re-cek `stock_ledger` vs `active_count` tepat sebelum menulis, bukan pakai angka pre-check Langkah 0 yang mungkin sudah basi — bisa ada sesi lain yang keburu commit duluan di jendela sempit ini): kategori manapun yang ternyata sudah tidak cukup lagi → **seluruh commit dibatalkan (rollback), 0 baris ter-commit** — response identik Langkah 0 (`quotaCheckFailed=true` + `shortfalls`), Dialog "Insufficient Quota" lagi, tabel staging tetap utuh. **Bukan** partial commit — kuota exceeded selalu all-or-nothing (baik di Langkah 0 maupun di sini), beda dari 2 guard per-baris di bawah yang genuinely independen antar baris.
   - **Guard — per baris** (lolos guard kuota final di atas; ini yang genuinely partial commit — baris gagal tidak menghentikan baris lain di Submit yang sama, konsisten prinsip lama "sesi dapat dilanjutkan, TAG yang sudah valid tetap ada"):
     - Identifier keburu diaktivasi via sesi lain (race, lolos real-time-check tapi ketahuan saat commit) → baris "Failed": `"This identifier has already been activated."`
     - `byo_activation_enabled` berubah `false` di antara real-time-check dan Submit (race, jarang) → baris "Self-Purchased" ini "Failed": `"Self-purchased device activation is not enabled for your account."`
   - **Badge "Official"** (match tag_units, hasil real-time-check) → commit **Jalur A**: Available. **Write-back cross-schema (wajib, atomik per baris):** dalam transaksi yang sama dengan INSERT baris `TAG` (GS), tulis `tag_units.status: active → in_use` + INSERT `tag_usage` (`current_holder` = Client, `device-catalog-schema.md` §9.6) di Admin Console (`public` schema) — GS satu-satunya penulis event ini. Lihat §3.7 Sync Matrix.
   - **Badge "Self-Purchased"** (dari Template atau inline resolve) → cek ulang match — kalau **ternyata ADA** match (race — unit itu baru diregister resmi setelah scan awal) → **auto-switch ke Jalur A**: toast/indikator `"Matched to your official stock — details updated automatically."` pada baris itu, kolom Device Name/SKU/Brand/Model/Type di-override. Kalau **tetap tidak match, tidak ada collision** → commit **Jalur B**: `tag_units` baru dibuat di Admin Console (`public` schema) dengan `device_name_id` terisi, `sku_id` sesuai pilihan (**NULL selamanya jika dikosongkan** — tidak ada auto-assign SKU generic; `byo_brand`/`byo_model_type` diisi dari input Brand/Model sebagai gantinya, lihat §9.8 `device-catalog-schema.md`), `is_user_tag` dari Type pilihan (RFID) atau otomatis `false`/Object TAG (NFC/BLE/GPS), `status='active'` lalu langsung `'in_use'` + INSERT `tag_usage` dalam transaksi yang sama, `tag_code` baru diterbitkan (§9.3 `device-catalog-schema.md`)
   - **Tidak match, TAPI identifier collision** dengan `tag_units` lain yang sudah `active`/`in_use` (F-TAG-12) → baris jadi `Waiting for Approval`, masuk review **Admin Console > Approvals > TAG Stock** (`tag-stock/01-overview.md` §5.5, reuse Approval Foundation §9.8 `device-catalog-schema.md`); Client melihat `"Your activation is pending review."` — **belum masuk hitungan `active_count`** sampai approved
   - Baris **Error** (BYO disabled atau license limit dari real-time-check) → di-exclude sepenuhnya dari commit, tidak diproses ulang
3. Hasil per baris ditampilkan **in-place** di tabel yang sama (halaman tidak redirect/tutup): "Activated" [hijau] / "Waiting for Approval" [kuning] / "Failed" [merah] + alasan. Baris Failed tetap editable — dihapus lewat `[Remove]` (RFID/NFC/BLE: scan-based; GPS: manual) lalu scan/input ulang, atau ditinggal.
4. Toast ringkasan gabungan sesuai kategori hasil yang muncul (§8/§9 `01-overview.md`).

**[F-TAG-04] License Counter Cards (Tab All, derived dari alokasi Admin Console, bukan license key manual):**
- 6 card: **RFID – Object TAG**, **RFID – User TAG**, NFC, QR, BLE, GPS — RFID pecah jadi 2 card karena satu-satunya TAG Type dengan 2 pool kuota terpisah (Object/User, mirror `hardware-allocation`, §3.2 `01-overview.md`). Tiap card **sekaligus filter** — klik = toggle aktif/nonaktif (multi-select OR terhadap tabel di bawahnya); untuk 2 card RFID, filter-nya compound (TAG Type=RFID **dan** Type Object/User TAG sekaligus) — 4 card lain cuma filter TAG Type saja.
- **RFID – Object TAG / RFID – User TAG**: jumlah aktif = COUNT TAG RFID per pool (`is_user_tag=false`/`true`) di registry dengan status ≠ Retired. **Total unit teralokasi** = `stock_ledger[client][rfid][object\|user].balance` — 2 baris ledger terpisah, bukan 1 balance dibagi dua.
- **NFC/BLE/GPS**: jumlah aktif = COUNT TAG per tipe (masing-masing dihitung terpisah) di registry dengan status ≠ Retired — selalu 1 pool (Object TAG saja). **Total unit teralokasi** = `stock_ledger.balance` milik client ini per tipe (dibaca real-time dari Admin Console, hasil kumulatif `hardware-allocation`/`tag-stock` — termasuk yang berasal dari Local Registration Distributor) — **bukan** angka license yang diaktifkan manual client.
- **QR** (beda formula — tidak dibatasi kuota TAG, §3.2): numerator = COUNT baris QR berstatus Paired di registry. Denominator = `asset_license_ledger.total_quantity` (Admin Console, `license-allocation/04-data.md` §1.3) — total kuota Asset License FAMS milik client. Metrik ini murni informational (adopsi QR terhadap kapasitas aset), **tidak** menggate aktivasi apa pun (QR tetap generate bebas, §3.2).
- Counter diupdate realtime setiap ada aktivasi/pairing baru, perubahan ke/dari Retired, **atau** setiap ada Allocation baru ke client ini dari Admin Console (lihat Sync Matrix §3.7). Card QR ikut update realtime setiap ada perubahan `asset_license_ledger.total_quantity` (Allocate Asset License, Admin Console) atau perubahan status Paired QR.

**[F-TAG-04a] Health Counter Cards (Tab Not Paired):**
- 6 card: **RFID – Object TAG**, **RFID – User TAG**, NFC, QR, BLE, GPS — RFID pecah sama seperti F-TAG-04, konsisten lintas tab. Tiap card tampil **2 angka**: ✓ Normal (COUNT status ∈ {Available, Reserved, To be Returned}) dan ✕ Damaged/Missing (COUNT status = `Damaged/Missing`) — di-scope per pool untuk 2 card RFID (`is_user_tag=false`/`true`). `Retired` **tidak dihitung** di angka manapun (status terminal, bukan Normal maupun problem aktif).
- Klik card = filter, **level card penuh** (bukan per-angka) — filter ke semua baris TAG Type (dan pool, untuk RFID) itu di Tab Not Paired, apa pun statusnya (termasuk Retired, meski tidak ikut dihitung di breakdown). Multi-select OR sama seperti F-TAG-04.
- Card QR di tab ini nilainya biasanya 0/kecil — QR cuma tampil di Tab Not Paired kalau bagian dari TAG combined (`01-overview.md` §7.1), bukan kasus umum.

**[F-TAG-06] Combine TAG:**
- Validasi per TAG yang di-scan:
  - Status harus Available
  - Bukan User TAG
  - Belum pernah Combined
  - Belum Paired
  - Belum ada di tabel session ini
  - Belum Retired
  - Diotorisasi untuk client
- Scan dilakukan berurutan sesuai action (RFID dulu, lalu NFC, lalu QR)
- Satu baris = satu set TAG combined
- Jika scan terhenti di tengah proses (sebelum set lengkap): data baris yang belum complete tidak tersimpan ke tabel; baris yang sudah complete tetap ada
- Remove: scan salah satu TAG dari baris → seluruh baris terhapus dari tabel
- Submit: semua baris di tabel digabung menjadi satu entitas TAG combined; TAG asli tidak dihapus dari registry, hanya TAG Type-nya diupdate

**[F-TAG-07] Separate TAG:**
- Validasi: TAG harus Combined dan berstatus Available
- Scan salah satu TAG dari set → sistem auto-load semua TAG dalam set tersebut ke tabel
- Submit: TAG combined dipecah, masing-masing kembali menjadi single TAG (TAG Type diupdate ke teknologi tunggalnya)
- Setelah separate: status tetap Available

**[F-TAG-08] Audit TAG:**
- Scope: hanya TAG di tab Not Paired
- **TAG Type picker (checkbox multi-select RFID/NFC/BLE)**: wajib pilih ≥1 sebelum bisa mulai scan. Bebas toggle (tambah/kurangi tipe) selama `Found = 0` — tabel Not Found reaktif ikut berubah tiap toggle (union dari tipe yang dicentang saat itu). **Locked (semua checkbox disabled) begitu `Found ≥ 1`** — mencegah komposisi tipe berubah di tengah sesi scan yang sudah punya progress, supaya bookkeeping Found/Not Found tidak desync.
- **Tidak ada row action/mekanisme "undo" per baris Found** (koreksi 2026-08-04, menutup ambiguitas — sengaja, bukan gap). Satu-satunya cara membatalkan scan yang salah masuk Found adalah `[Cancel]` (Dialog Cancel TAG Audit), yang membuang seluruh progress sesi dan mengembalikan TAG Type picker ke unlocked untuk sesi baru.
- Default: semua TAG Not Paired **bertipe yang dicentang** masuk bucket "Not Found" (bukan otomatis RFID+NFC+BLE sekaligus — tergantung pilihan TAG Type picker)
- Saat TAG terscan: pindah ke "Found"; counter update realtime. Metode scan: kalau cuma 1 TAG Type dicentang, langsung scan tipe itu (skip overlay pilih metode); kalau >1, overlay pilih metode cuma menampilkan opsi yang dicentang
- Damaged/Missing terscan → masuk Found, akan diubah ke Available saat Submit
- **TAG combined** (RFID+NFC+QR kombinasi manapun, §7.6/`01-overview.md` §7.1) — 1
  `tag_code` combined tampil sebagai beberapa baris identifier terpisah di registry,
  tapi **Status-nya sama persis** di semua sibling (bukan independen per identifier).
  Audit picker cuma RFID/NFC/BLE — sibling **QR tidak pernah tampil** sebagai baris/
  masuk counter Found-Not Found di tabel Audit (di luar scope, §1.4), meski tetap
  bagian dari `tag_code` yang sama:
  - Scan **salah satu** sisi auditable dari combined `tag_code` → **seluruh** `tag_code`
    itu langsung Found, termasuk sibling QR yang tidak pernah discan langsung — status
    keduanya berubah bersamaan saat Submit (shared status, bukan efek terpisah).
  - Kalau combo-nya **RFID+NFC** (kedua sisi sama-sama auditable, dan sesi Audit
    mencentang keduanya): begitu salah satu sisi discan Found, sibling sisi lain di
    tabel Audit **ikut otomatis pindah ke Found** — tidak perlu discan dua kali untuk
    `tag_code` yang sama.
  - Kalau combo-nya melibatkan **QR** (RFID+QR, NFC+QR, RFID+NFC+QR): sisi QR berubah
    status sebagai efek samping silent saat Submit — tidak ada baris/counter terpisah
    untuknya di Audit, tapi **wajib** disebutkan di breakdown Dialog Submit Confirmation
    (§7.4 di bawah) supaya Client tahu QR ikut berubah walau tidak pernah discan.
- Submit:
  - Available yang Found: Last Scanned terupdate
  - Damaged/Missing yang Found: status → Available
  - Available yang Not Found + checkbox checked: status → Damaged/Missing
  - Available yang Not Found + checkbox unchecked: status tidak berubah
  - Reserved / To be Returned / Retired yang Not Found: tidak ada perubahan status
  - **Retired yang Found** (ter-scan saat audit): tetap **Retired** — tidak un-retire. Un-retire hanya via Supply settings, bukan dari Audit. (Last Scanned tetap terupdate.)
- Log dicatat ke Event Log Audit TAG, Activity Log, cross-module log

**[F-TAG-09] Status Sync dari Produk:**
Trigger yang diterima GS dari FAMS/Supply:

| Trigger | Status Baru |
|---------|-------------|
| Asset di-pair dengan TAG | Paired |
| Asset di-approve (dari Reserved) | Paired |
| Asset di-reject/delete (dari Reserved) | Available |
| Asset disposed / kondisi lepas dari TAG | To be Returned |
| TAG dikembalikan via fitur To be Returned | Available |
| TAG di-mark Damaged/Missing via transaksi | Damaged/Missing |
| Supply settings Retire TAG | Retired |
| Supply settings Un-retire TAG | Available |

> **GPS Damaged/Missing — RESOLVED (2026-07-24, menutup Open Item GPS Audit di `Admin-Console/PRD/tag-stock/01-overview.md` §11 #6 & modul ini):** untuk GPS, `Damaged/Missing` bersifat **informational/indikatif**, bukan hard-lock seperti RFID/NFC/BLE. RFID/NFC/BLE **wajib** lolos Audit (re-scan fisik) sebelum bisa dipasangkan lagi. **GPS tidak punya Audit sama sekali** (§1.4) — jadi begitu FAMS/Supply mengirim trigger `Asset di-pair dengan TAG` (baris pertama tabel di atas) untuk unit GPS yang statusnya sedang `Damaged/Missing`, trigger itu **tetap diproses apa adanya** (→ `Paired`), tidak diblok oleh status Damaged/Missing sebelumnya — pairing/pemakaian ulang itu sendiri dianggap bukti unit sudah bisa dipakai lagi, setara dengan bukti yang dipakai saat registrasi awal GPS (IMEI import/manual, juga tanpa verifikasi fisik). Tidak ada mekanisme recovery/Audit terpisah yang perlu dibangun untuk GPS.

**[F-TAG-01/02/03] Search by Scan — All / Paired / Not Paired:**

> **Pola Universal** (`scan-foundation.md` §4.9) — trigger icon scan di sebelah icon Search text existing, di **ketiga tab** (bukan cuma tab Paired). Teknologi: RFID/NFC/QR saja (BLE/GPS di luar scope default §4.9 — BLE tidak punya kebutuhan bisnis dicari di registry ini, GPS tidak punya mekanisme scan sama sekali, §1.4). Mode Single (§4.3 `scan-foundation.md`) — satu kode discan, sesi tutup begitu valid.

- Scan TAG → cari di tabel **tab yang sedang aktif** (All/Paired/Not Paired) berdasarkan kode yang di-scan — hasil scope ke dataset/filter tab itu saja, bukan lintas tab
- TAG dikenali sistem **dan** ada di dataset tab yang aktif: baris di-highlight/tabel di-filter ke baris tersebut, sama seperti search-by-text sukses (search bar terisi kode hasil scan)
- TAG dikenali sistem, tapi **tidak** ada di dataset tab yang aktif (mis. scan TAG Paired sewaktu berada di tab Not Paired): **empty state generik** yang sama dengan search-by-text tanpa hasil di tab itu — **bukan** toast error, tidak ada copy scan-spesifik yang membedakan "ditemukan tapi salah tab" (§4.9 `scan-foundation.md`)
- TAG **tidak dikenali** sama sekali (bukan format TAG Samurai valid): toast `"Error, can't recognize TAG."` (CC-5, §5.1 `scan-foundation.md`) — sesi scan tidak berhenti

---

### 3.3 Permissions & Access Control

Dikontrol capability **"Manage TAG"** di matriks Role GS: **Read** = lihat registry (All TAGs); **Update** = semua aksi tulis (Activate, Audit, Combine, Separate). Tidak ada Create/Delete bergaya form-CRUD (registry tetap dijaga integritasnya lewat satu jalur Activate TAG, bukan input bebas).

| Akses | Capability "Manage TAG" |
|-------|-------------------------|
| Lihat All TAGs / Paired / Not Paired | Read |
| Activate TAG (Jalur A/B) | Update |
| Combine & Separate TAG | Update |
| Audit TAG | Update |

| Role | All TAGs (Read) | Activate TAG (Update) | Combine & Separate (Update) | Audit TAG (Update) |
|------|-----------------|------------------------|-----------------------------|--------------------|
| Total Control | View | Full | Full | Full |
| Read Only | View | Hidden | View only | View only |
| Capability holder ("Manage TAG", Update) | View | Full | Full | Full |
| Capability holder ("Manage TAG") tanpa Update | View (jika Read) | — | — | — |

> Status **To be Returned → Available** **tidak** dilakukan dari GS. Fitur "To be Returned" ada di tiap produk (FAMS/Supply), diatur role produk tersebut — lihat §3.4.

> UI gate per role didefinisikan di `01-overview.md` §1.5 (UI Visibility per Capability).

#### 3.3a Data Visibility per Role

> Lapis **Data** (row scope + field-level) — `prd-conventions.md` §18.3. Diterapkan di server/query (`04-data.md`).

| Role | Row scope (record mana) | Field-level (kolom disembunyikan / di-mask) | Catatan |
|------|-------------------------|---------------------------------------------|---------|
| **Total Control** | Semua TAG dalam registry client | — (semua field) | RFID/NFC/QR/BLE/GPS Code, SKU, Type, Status semua terlihat |
| **Read Only** | Semua TAG registry client (read-only) | — | Bisa lihat, tidak bisa Audit/Combine/Separate |
| **Capability holder ("Manage TAG", Read)** | Semua TAG registry client | — | Sama scope read dengan TC |
| **Tanpa capability "Manage TAG" & bukan TC/RO** | Tidak ada akses (endpoint 403) | — | Menu TAG hidden |

> Registry selalu ter-scope ke client aktif: TAG hanya tampil bila telah di-discover **dan** diotorisasi untuk client ini (lihat §3.2 validasi discovery). Tidak ada role GS yang melihat TAG milik client lain. Tidak ada field di-mask antar role GS.

#### 3.3b Defense in Depth

> Penyembunyian/penonaktifan elemen di UI (§1.5 `01-overview.md`) hanyalah lapis pertama. Endpoint write (Audit, Combine, Separate) **tetap mengembalikan `403 Forbidden`** bila aktor tidak punya Update pada "Manage TAG", dan query read **tetap menerapkan scope filter client + otorisasi TAG** di server walaupun elemen UI disembunyikan. UI dan server divalidasi independen.

### 3.4 Fitur "To be Returned" — Lokasi & Tanggung Jawab

- TAG masuk status **To be Returned** saat lepas dari asset di produk (mis. asset disposed di FAMS) — dikirim via event ke GS TAG Registry.
- GS TAG Registry **hanya menampilkan** status ini di tab Not Paired (read-only). Tidak ada aksi pengembalian dari GS.
- Pengembalian **To be Returned → Available** dilakukan lewat **fitur "To be Returned" di masing-masing produk** (FAMS, Supply), bukan dari Global Settings.
- Otorisasi: role produk terkait (mis. capability "Manage TAG" di sisi produk) — **bukan** matriks Role GS.
- **[Forward dependency]** Spec halaman/aksi "To be Returned" didefinisikan di PRD TAG produk (FAMS/Supply) yang belum dibuat. `[TODO: FAMS > TAG > To be Returned PRD]` `[TODO: Supply > TAG > To be Returned PRD]`

### 3.5 Plan Gating

Lihat: `TAG-Samurai/_foundation/plans.md` §2.1.

| Plan | Level |
|------|-------|
| Starter | **QR only** — fitur RFID/NFC/BLE/GPS tidak tersedia |
| Growth | Full |
| Professional | Full |
| Enterprise | Full |

**Detail Starter (QR only):**
- Tombol `[+ Activate TAG]` (RFID/NFC/BLE/GPS, Jalur A maupun B) **tetap ditampilkan tapi terkunci (🔒)** dengan tooltip `"Available on Growth plan or above"` (plans.md §2.1 catatan TAG) — bukan disembunyikan.
- Tombol/aksi **scan RFID/NFC/BLE/GPS lain tetap ditampilkan tapi terkunci (🔒)** dengan tooltip `"Available on Growth plan or above"` (plans.md §2.1 catatan TAG) — bukan disembunyikan.
- **Card License Counter RFID/NFC/BLE/GPS** tidak relevan (tidak ada provisioning tipe non-QR) — tetap tampil tapi non-interaktif/klik tidak menghasilkan filter berarti (tabel tidak akan pernah ada baris tipe itu). **Card QR tetap aktif & fungsional** (klik = filter tetap jalan) — QR tersedia penuh di Starter.
- **Combine TAG**: seluruh kombinasi melibatkan RFID/NFC → terkunci (🔒). Tidak ada kombinasi QR-only. (BLE/GPS tidak pernah ikut Combine, terlepas dari plan — §3.5 di bawah.)
- **Audit TAG** (RFID/NFC/BLE — GPS tidak punya Audit, §1.4 `01-overview.md`) → terkunci.
- **Registry**: TAG QR tetap tampil & dapat di-discover. Data RFID/NFC/BLE/GPS dari plan sebelumnya **tidak dihapus** tapi tidak dapat diakses/dipakai selama Starter.
- **QR tag hard cap (Starter)** = asset cap Starter (default 25, editable Principal) — plans.md §2.1. Discovery QR di atas cap diblokir dengan dialog (selaras perilaku license-limit §3.2).
- Perilaku UI: menu TAG tetap tampil; aksi RFID/NFC/BLE/GPS = **lock icon (🔒)** + tooltip plan minimum (Growth).

**Hardware TAG license (semua plan Growth+) — derived, bukan aktivasi manual:**
Penggunaan aktual RFID/NFC/BLE/GPS **tidak** butuh aktivasi/pembelian license key terpisah oleh client — statusnya otomatis diturunkan dari `stock_ledger.balance` (unit per tipe yang sudah dialokasikan ke client ini via `hardware-allocation/`, scope per client lintas produk; `plans.md` §2.1 catatan TAG — Hardware license). UI RFID/NFC/BLE/GPS tersedia di Growth+, tetapi Aktivasi aktual bergantung pada apakah client sudah pernah menerima alokasi unit tipe itu. Saat kuota alokasi habis di tengah sesi multi-scan → Dialog "`[Type]` TAG License Limit Reached" (§3.2), bukan toast — resolusinya minta Distributor/Partner mengalokasikan unit tambahan, bukan client membeli/mengaktifkan key sendiri.

**Scope tipe TAG modul ini (BLE/GPS parity dengan RFID/NFC — Combine & pairing-ke-asset dikecualikan):**
Modul GS TAG ini mengelola registry, License Counter, dan Activate TAG (Jalur A/B) untuk **kelima tipe TAG**: RFID, NFC, QR, BLE, GPS. BLE dan GPS **bukan** lagi di luar scope untuk aktivasi — keduanya masuk registry lewat `[+ Activate TAG]` dan dihitung di License Counter, identik RFID/NFC (`01-overview.md` §4, §5). Tiga pengecualian tetap berlaku:
1. **Combine & Separate** (§3.6 F-TAG-06/07) tetap **RFID/NFC/QR saja** — BLE/GPS adalah standalone tracker (bukan chip yang bisa digabung fisik dengan RFID/NFC/QR maupun sesama BLE/GPS).
2. **Pemasangan (pairing) BLE/GPS ke asset** tidak lewat entry point scan-based §6 `01-overview.md` (Register Asset > Scan Object TAG, Change TAG, Replace TAG tetap RFID/NFC/QR saja, konsisten `Fixed-Asset/PRD/asset/03-functional.md` §3.5: "untuk operasional FAMS (pairing & Search by Scan) yang relevan = RFID/NFC/QR") — mekanisme pairing BLE/GPS ke asset dimiliki addon Tracking/Maps di sisi FAMS, di luar scope PRD ini.
3. **Audit TAG** (F-TAG-08) mencakup **RFID/NFC/BLE saja — GPS tidak ikut**: GPS tidak punya mekanisme re-scan/re-verifikasi fisik (registrasi murni via IMEI import/manual saat Activate), konsisten `Admin-Console/PRD/tag-stock/01-overview.md` §5.4. **RESOLVED (2026-07-24):** GPS Damaged/Missing tetap bisa terjadi (F-TAG-09), recovery-nya otomatis lewat event pairing berikutnya, bukan lewat Audit — lihat catatan F-TAG-09 di atas.

---

### 3.6 Edge Case Matrix (M-1)

> Mengikuti `_foundation/edge-case-matrix-convention.md`. Failure (D10) → `error-handling-convention.md` §2; concurrency (D6) → §5; sync (D8) → §3.7 Sync Matrix.

**Condition Dimension Checklist (per aksi: Activate TAG Jalur A/B, Pairing/Usage, Combine, Separate, Audit, Status Sync, Search by Scan, Approve/Reject Collision):**

| # | Dimensi | Relevan? | Catatan |
|---|---------|:--------:|---------|
| D1 | Entity/Account state | ✅ | Client suspended/expired → registry read-only; Discovery & aksi tulis diblokir |
| D2 | Plan/License state | ✅ | Starter QR only; RFID/NFC/BLE/GPS hardware TAG license at cap (per tipe); QR hard cap Starter |
| D3 | Record/TAG state | ✅ | Available/Paired/Reserved/To be Returned/Damaged/Missing/Retired/Combined |
| D4 | Permission/Role/Scope | ✅ | Manage TAG Read vs Update; scope client (§3.3a) |
| D5 | Data state | ✅ | TAG tak dikenal, bukan TAG Samurai, object TAG, duplicate scan; hasil real-time match-check (Official/Self-Purchased/Needs Info/Error) vs hasil re-validasi saat Submit — bisa berubah karena race condition (§5.1 `01-overview.md`). Khusus GPS: validasi Preview (format 15-digit, "Duplicate in File") sebelum entri sempat masuk match-check |
| D6 | Concurrency | ✅ | TAG status diubah produk lain saat audit/combine berlangsung; `[Submit]` Activate TAG diblokir selama ada baris "Needs Info"; Device Name/SKU Template dihapus dari Device Catalog tepat sebelum Submit (§5.7 `error-handling-convention.md`) |
| D7 | Sequence/Timing | ✅ | Combine set tak lengkap; submit ganda; audit submit idempotent |
| D8 | Cross-module sync | ✅ | Status dari FAMS/Supply (§3.2 F-TAG-09); §3.7 |
| D9 | Quantity/Relation | ✅ | Combine 2–3 TAG; Separate set; audit bulk Not Found |
| D10 | Failure | ✅ | Delegasi error-handling §2 & §7 |

**Matrix:**

| Aksi | Kondisi | Expected Behavior | Jenis |
|------|---------|-------------------|:-----:|
| Activate TAG | Happy path — baris match `tag_units` (real-time-check) | Badge "Official"; kolom Device Name/SKU/Brand/Model/Type auto-terisi (preview) | ✔ |
| Activate TAG | Happy path — baris tidak match, Template/`[Resolve]` terisi, Submit sukses (Jalur B/BYO) | `tag_units` baru dibuat (Admin Console) saat commit — **bukan error** | ✔ |
| Activate TAG | D5: baris tidak match `tag_units`, Template kosong, `byo_activation_enabled=true` | **Bukan error** — badge "Needs Info", menunggu `[Resolve]` (§7.8/§7.9 `01-overview.md`) | ✔ |
| Activate TAG | Happy path — Bulk Resolve: ≥2 baris "Needs Info" dicentang, `[Resolve Selected]` → isi field sekali → `[Apply to N rows]` (ditambahkan 2026-08-04) | Semua baris terpilih badge → "Self-Purchased" sekaligus, nilai identik (snapshot); baris lain (tidak dicentang) tidak terpengaruh | ✔ |
| Activate TAG | D7: Bulk Resolve, `[Apply to N rows]` dgn field wajib kosong | `[Apply to N rows]` blocked, panel tetap terbuka, field gagal border merah + tooltip alasan — sama rule required-field dengan Row Edit Mode/Template | ✘ |
| Activate TAG | D6: mulai Bulk Resolve (checkbox+`[Resolve Selected]`) saat 1 baris lain sedang dalam Row Edit Mode single-row, atau sebaliknya | Diblok — cuma 1 sesi edit (single **atau** bulk) aktif dalam satu waktu; checkbox & row action baris lain disabled selama salah satu sesi aktif | ✘ |
| Activate TAG | D2: baris tidak match `tag_units`, `byo_activation_enabled=false` | Badge "Error" — `"Not in your official stock; self-purchased activation is not enabled for your account. Contact your administrator."` — baris cuma bisa dihapus lewat `[Remove]` (RFID/NFC/BLE: scan-based; GPS: manual), tidak bisa diresolve | ✘ |
| Activate TAG | D6: RFID/NFC/BLE — klik `[Remove]` lalu scan identifier yang **tidak ada** di tabel staging | Tidak ada yang terhapus (tidak match baris manapun) — sesi Remove tetap terbuka, TAG lain masih bisa discan | ✘ |
| Activate TAG | Happy path — row action `[Edit]` baris "Self-Purchased" (dari Template atau hasil `[Resolve]`) | Row Edit Mode — field Device Name/SKU/Brand/Model/Type pre-filled untuk dikoreksi langsung di baris, badge tetap "Self-Purchased"; tidak berlaku untuk badge "Official" | ✔ |
| Activate TAG | D5: baris badge "Self-Purchased", ternyata match `tag_units` saat Submit (race) | **Bukan error** — auto-switch ke Jalur A, field di-override, indikator `"Matched to your official stock — details updated automatically."` | ✔ |
| Activate TAG | D2: kuota alokasi habis saat scan (real-time-check) | Badge "Error" pada baris itu — `"License limit reached."`; sesi scan **tidak berhenti** | ✘ |
| Activate TAG | D2: kuota sudah 0 **sejak awal sesi** (koreksi 2026-08-04) — diketahui begitu TAG Type dipilih, sebelum scan pertama; NFC/BLE/GPS 1 pool = 0, atau RFID **kedua** pool (Object dan User) = 0 | `[Scan TAG]`/Upload File/Manual Entry **disabled** — tooltip `"No quota available for this TAG Type. Contact your administrator or request more allocation."`; mencegah sesi scan (bisa lama, terutama BLE/Handheld fisik) berjalan sia-sia sampai ketahuan gagal di Submit. **Beda dari row di atas** (real-time-check per baris di tengah sesi, race condition, tetap berlaku apa adanya — guard ini murni tambahan pre-flight, bukan pengganti) | ✘ |
| Activate TAG | D2: kuota agregat per kategori (RFID-Object/RFID-User/NFC/BLE/GPS) kurang dari jumlah baris non-Error di tabel, terdeteksi saat klik `[Submit]` (Langkah 0, sebelum commit dimulai) | Submit **dibatalkan total** (0 baris commit) — Dialog "Insufficient Quota" breakdown per kategori `"[Category]: need [N], only [M] available."`; user harus `[Remove]` sebagian baris via scan lalu klik `[Submit]` lagi | ✘ |
| Activate TAG | D2: kuota kategori ternyata habis lagi tepat sebelum commit menulis (race sisa — lolos Langkah 0 tapi keburu dihabiskan sesi lain sebelum commit ini) | **Seluruh commit dibatalkan (rollback), 0 baris commit** — Dialog "Insufficient Quota" lagi, sama seperti Langkah 0; **bukan** partial commit (kuota selalu all-or-nothing, beda dari race identifier/BYO di baris berikutnya yang genuinely per-baris) | ✘ |
| Activate TAG | D2: `byo_activation_enabled=false` untuk baris Self-Purchased yang di-Submit | Baris "Failed" — `"Self-purchased device activation is not enabled for your account."` (jarang terjadi — biasanya sudah ke-detect sebagai "Error" saat real-time-check, cuma race kalau setting berubah di antara scan dan Submit) | ✘ |
| Activate TAG | D6: `[Submit]` diklik saat masih ada baris "Needs Info" | `[Submit]` disabled, tidak bisa diklik (§8 `01-overview.md`) | ✘ |
| Activate TAG | D6: `[Submit]` diklik saat tabel staging masih 0 baris (belum ada scan/input sama sekali) | `[Submit]` tetap enabled tapi tidak ada efek — caption `"Please scan the TAGs before submitting."` muncul di atas tombol (§8 `01-overview.md`), sama pola Combine/Separate | ✘ |
| Activate TAG | D6: TAG Type belum dipilih, user coba `[Scan TAG]` atau expand "Self-Purchased Template" | Keduanya disabled — `[Scan TAG]` tanpa tooltip (state awal halaman), Template dengan tooltip `"Select a TAG Type first."` (Device Name di Template butuh kategori TAG Type utk filter Device Catalog, §5.1) | ✘ |
| Activate TAG | D6: Device Name/SKU yang dipilih di Template dihapus/dinonaktifkan dari Device Catalog tepat sebelum `[Submit]` | Server tolak `422` field-level per baris terdampak — `"This device name no longer exists. Please select another."` / `"This SKU no longer exists. Please select another."`; baris kembali ke "Needs Info", Template/dropdown auto-clear + re-fetch opsi terbaru; baris lain yang valid tetap commit (partial, §5.7 `error-handling-convention.md`) | ✘ |
| Activate TAG | D7: identifier collision dengan `tag_units` lain yang sudah aktif (baru ketahuan saat Submit) | **Bukan reject** — baris jadi `Waiting for Approval`, masuk Admin Console > Approvals > TAG Stock. **Tidak ada hard-reject untuk TAG** (beda dari Hardware — konsisten §9.2 `device-catalog-schema.md`) | ✔ |
| Activate TAG | D7: identifier match TAG yang sudah aktif di registry **client ini sendiri**, terdeteksi saat scan (real-time-check) | Toast `"Error, TAG is already activated."` — baris **tidak masuk** tabel staging sama sekali; beda dari collision lintas-client (tetap Waiting for Approval, baris di atas) | ✘ |
| Activate TAG | D7: identifier sudah aktif di client ini, race — lolos real-time-check tapi ketahuan baru saat Submit (mis. diaktivasi user lain di tab berbeda saat sesi ini masih terbuka) | Baris "Failed" saat Submit — `"This identifier has already been activated."` | ✘ |
| Activate TAG | D5: identifier tidak valid (bukan TAG Samurai) saat scan (RFID/NFC/BLE) | Toast `"Error, can't recognize TAG."` — tidak masuk tabel | ✘ |
| Activate TAG | D5: identifier sudah ada di tabel sesi ini (duplikat scan RFID/NFC/BLE, atau duplikat entry GPS yang sudah lolos Preview) | Diabaikan, tidak ada baris duplikat | ✘ |
| Activate TAG | D5: GPS — IMEI bukan 15 digit numerik (Preview, sebelum masuk tabel) | Baris Preview "Invalid Format" — tidak lanjut ke real-time match-check, tidak masuk tabel staging utama | ✘ |
| Activate TAG | D5: GPS — IMEI sama muncul >1× dalam satu batch Upload/Manual Entry (Preview) | Kemunculan pertama diproses normal (lanjut ke match-check); kemunculan kedua dst. → baris Preview "Duplicate in File", tidak lanjut | ✘ |
| Activate TAG | D1: client suspended/expired | Halaman Activate TAG diblokir; registry read-only | ✘ |
| Pairing/Usage (§6) | Happy path — TAG sudah Active/Available | Scan berhasil, dipakai untuk pairing di entry point terkait | ✔ |
| Pairing/Usage (§6) | D3: TAG belum pernah diaktivasi | Toast `"This TAG hasn't been activated yet. Please contact Admin."` — tidak membuat baris baru | ✘ |
| Pairing/Usage (§6) | D5: TAG tak diotorisasi client | Toast `"Error, TAG isn't authorized. Please contact Admin."` | ✘ |
| Approve Collision (Activate TAG) | Happy path (subject `pending`) | `tag_units` (baris yang sama) → `status='active'` lalu `'in_use'`; `tag_code` baru diterbitkan; notifikasi Client | ✔ |
| Reject Collision (Activate TAG) | Happy path | `tag_units` → `status='rejected'`; Client tidak bisa lanjut pakai TAG ini via jalur ini | ✔ |
| Combine | Happy path (set RFID+NFC[+QR] valid, semua Available) | Set digabung jadi satu entitas; TAG asli tetap, Type diupdate | ✔ |
| Combine | D3: salah satu TAG bukan Available / sudah Combined / Paired / Retired | TAG ditolak dari set + pesan per §8 Overview | ✘ |
| Combine | D2: Starter (QR only) | Aksi Combine terkunci (🔒) — semua kombinasi butuh RFID/NFC | ✘ |
| Combine | D7: set tak lengkap saat sesi berhenti | Baris incomplete tidak tersimpan; baris complete tetap | ✘ |
| Combine | D5: TAG sudah ada di tabel sesi | Ditolak (duplikat dalam sesi) | ✘ |
| Separate | Happy path (TAG Combined & Available) | Auto-load semua TAG set → submit pecah ke single; status tetap Available | ✔ |
| Separate | D3: TAG bukan Combined / bukan Available | Diblokir + pesan | ✘ |
| Audit | TAG Not Paired terscan (Found) | Pindah ke Found; Last Scanned terupdate saat Submit | ✔ |
| Audit | Damaged/Missing terscan (Found) | Submit → status Available | ✔ |
| Audit | Available Not Found + checkbox checked | Submit → Damaged/Missing | ✔ |
| Audit | Reserved/To be Returned/Retired Not Found | Tidak ada perubahan status | ✘ |
| Audit | D3: Retired terscan (Found) | Tetap Retired (tidak un-retire); Last Scanned terupdate | ✘ |
| Audit | D9: TAG combined RFID+NFC discan (salah satu sisi) | Sibling sisi lain di tabel Audit **ikut otomatis** pindah ke Found — tidak perlu discan dua kali | ✔ |
| Audit | D9: TAG combined RFID+QR (atau NFC+QR/RFID+NFC+QR) — sisi auditable discan | Sisi QR (di luar scope Audit) ikut berubah status saat Submit sebagai efek samping silent — breakdown Dialog Submit Confirmation wajib label gabungan (mis. "RFID & QR") supaya Client tahu | ✔ |
| Audit | D2: Starter | Aksi Audit RFID/NFC/BLE terkunci (🔒) — GPS tidak pernah masuk pool Audit terlepas dari plan | ✘ |
| Status Sync | Trigger dari FAMS/Supply (§3.2 tabel) | Status registry diupdate sesuai map; surface refresh | ✔ |
| Status Sync | D6: trigger pada TAG yang sedang di-audit user | Atomic di server; surface audit refresh; 409 bila bentrok | ✘ |
| Search by Scan (All/Paired/Not Paired) | Happy path — TAG dikenali & ada di dataset tab aktif | Baris di-highlight/filter, sama pola search-by-text sukses | ✔ |
| Search by Scan (All/Paired/Not Paired) | D5: TAG dikenali tapi tidak ada di dataset tab aktif (mis. TAG Paired di-scan sewaktu di tab Not Paired) | Empty state generik (bukan toast error, `scan-foundation.md` §4.9) | ✘ |
| Search by Scan (All/Paired/Not Paired) | D5: TAG tidak dikenali sama sekali (bukan format TAG Samurai) | Toast `"Error, can't recognize TAG."` (CC-5) | ✘ |
| Semua aksi tulis | D4: aktor tanpa Update "Manage TAG" | `403 Forbidden`; elemen UI tersembunyi (§3.3b) | ✘ |
| Semua aksi tulis | D6: klik Submit ganda | Double-submit guard; tidak ada efek ganda (error-handling §5.1) | ✘ |

**Must NOT:**
- Mengizinkan TAG baru masuk registry lewat entry point manapun selain `[+ Activate TAG]` (D5, revisi 2026-07-15) — Audit/Combine/Pair User/Register Asset/dst hanya beroperasi pada TAG yang sudah Active/Available.
- Menambah TAG ke registry (Jalur A/B) saat license tipe tsb (RFID/NFC/BLE/GPS) habis atau QR di atas hard cap Starter (D2).
- Mengizinkan Jalur B saat `byo_activation_enabled=false` untuk Client (D2).
- Menjalankan (mengeksekusi) aksi non-QR (Activate RFID/NFC/BLE/GPS; Combine/Separate RFID/NFC/QR; Audit RFID/NFC/BLE) di Starter (D2) — tombolnya tetap ditampilkan (🔒 locked), yang dilarang adalah eksekusinya, bukan tampilannya.
- Menjalankan Combine/Separate untuk BLE/GPS (D5/scope) — standalone tracker, bukan chip yang combinable; Combine & Separate tetap RFID/NFC/QR saja walau BLE/GPS sudah masuk registry.
- Memasangkan (pairing) BLE/GPS ke asset lewat entry point scan-based §6 `01-overview.md` (Register Asset/Change TAG/Replace TAG) — mekanisme itu dimiliki addon Tracking/Maps di sisi FAMS, bukan modul ini.
- Un-retire TAG dari Audit (D3) — hanya via Supply settings.
- Memproses Activate/Combine/Audit saat client suspended/expired (D1).
- Menghapus data pairing RFID/NFC/BLE/GPS saat downgrade ke Starter (data warm/read-only, plans.md §5.4).
- Menampilkan TAG milik client lain (D4) — registry selalu ter-scope client.
- Memproses submit kedua dari klik ganda (D6/D7).
- Mengizinkan Approve/Reject Collision oleh siapapun selain Total Control/Additional Approver entitas Principal — Client (requester) **tidak pernah** eligible (D4).
- Memberi baris "Needs Info" badge "Self-Purchased" saat `byo_activation_enabled=false` (D5 §5.1) — kalau BYO dimatikan untuk Client, baris tidak match selalu jadi "Error", tidak pernah bisa jadi Self-Purchased lewat `[Resolve]`.
- Mengganti kolom Device Name/SKU/Brand/Model/Type baris yang di-override auto-switch (badge Self-Purchased ternyata match `tag_units` saat Submit) secara diam-diam tanpa indikator "Matched to your official stock" (D5 §5.1) — Client harus tahu kenapa field yang mereka isi berubah.
- Mengizinkan klik `[Submit]` selama masih ada baris "Needs Info" belum diresolve/di-Remove (D6 §5.1) — tombol harus disabled, bukan sekadar warning setelah diklik.
- Menggagalkan seluruh Submit hanya karena 1 baris gagal saat commit (D6/D7 §5.1) — partial commit wajib: baris lain yang valid tetap diproses, bukan all-or-nothing.
- Meng-auto-resolve baris "Needs Info" yang sudah ada di tabel begitu Self-Purchased Template baru diisi belakangan (D5 §5.1) — **kecuali** guard kuota RFID (Type), lihat pengecualian sempit di F-TAG-10 di atas; identitas field (Device Name/SKU/Brand/Model) tetap wajib diresolve manual per baris.
- Menulis ulang field identitas (Device Name/SKU/Brand/Model) baris "Self-Purchased" yang sudah dibuat, hanya karena Self-Purchased Template diedit belakangan (D5 §5.1) — nilai baris adalah snapshot, bukan live binding ke Template.
- Menampilkan toast generik "failed" saat Device Name/SKU Template ternyata sudah dihapus dari Device Catalog saat Submit — wajib field-level 422 + inline error + auto-clear + partial commit (D6, §5.7 `error-handling-convention.md`).
- Mengizinkan mulai Row Edit Mode di baris lain, atau `[Scan TAG]`/`[Remove]`/Upload File/Manual Entry, selama ada 1 baris sedang dalam Row Edit Mode (D6 §5.1) — kolom Actions & toolbar wajib disabled selama sesi aktif, mencegah 2 sesi edit/scan bertabrakan.
- Menampilkan checkbox bulk-select di baris berbadge selain "Needs Info" (ditambahkan 2026-08-04, D5 §5.1/§7.8) — Official/Self-Purchased/Error tidak butuh Bulk Resolve, checkbox-nya wajib kosong/tidak ada.
- Mengizinkan Bulk Resolve Mode berjalan bersamaan dengan Row Edit Mode single-row, atau sebaliknya (D6 §5.1) — cuma 1 sesi edit (single atau bulk) yang boleh aktif dalam satu waktu, sama prinsip dengan larangan 2 sesi edit di atas.
- Menulis nilai berbeda ke masing-masing baris hasil `[Apply to N rows]` (D5 §5.1) — Bulk Resolve wajib menulis nilai **identik** ke semua baris terpilih dalam satu Apply; kalau butuh nilai berbeda per baris, itu kasus untuk Row Edit Mode single-row, bukan Bulk Resolve.
- Membuang perubahan Row Edit Mode tanpa konfirmasi kalau field sempat diisi/diubah (D7 §5.1) — Dialog "Cancel Edit" wajib muncul dulu; cuma boleh langsung tutup tanpa dialog kalau belum ada perubahan sama sekali.
- Meloloskan Submit lanjut commit sebagian kalau kuota agregat kurang, baik terdeteksi di Langkah 0 (pre-check) **maupun** di re-validasi final tepat sebelum commit menulis (D2 §5.1) — kedua titik ini sama-sama all-or-nothing: begitu Dialog "Insufficient Quota" muncul (di titik manapun), Submit batal **total** (0 baris commit), **bukan** partial. Partial commit cuma berlaku untuk 2 race yang genuinely per-baris (identifier sudah aktif, `byo_activation_enabled` berubah) — **bukan** untuk kuota di titik manapun.
- Memasukkan baris ke tabel staging untuk identifier yang sudah aktif di registry client ini sendiri (D7 §5.1) — begitu real-time-check match, wajib berhenti di toast `"Error, TAG is already activated."`, tidak boleh sempat tampil sebagai baris apapun (termasuk badge "Error") sebelum dihapus.
- Membiarkan `[Scan TAG]`/Upload File/Manual Entry tetap enabled ketika kuota TAG Type ini sudah diketahui 0 sejak sebelum scan pertama (koreksi 2026-08-04, D2 §5.1) — NFC/BLE/GPS: 1 pool = 0; RFID: kedua pool (Object dan User) = 0. Kondisi ini wajib diblok di muka (tombol disabled + tooltip), bukan dibiarkan sampai user menghabiskan waktu scan lalu baru kena Dialog "Insufficient Quota" di Submit.

**Defaults & Ordering:**

| Aspek | Spec |
|-------|------|
| Default sort — All TAGs / Paired / Not Paired | Last Scanned, desc |
| Default filter | Tidak ada (All TAGs = semua status); tab Paired/Not Paired = filter status implisit |
| Default selection — Audit | TAG Type picker: 0 tipe dicentang (tabel kosong sampai user pilih ≥1); begitu dicentang, semua TAG Not Paired bertipe itu masuk bucket "Not Found" |
| Default value — checkbox "mark Damaged/Missing" | Checked |
| Opsi yang ADA (TAG Type) | RFID, NFC, QR (+ Combined), BLE, GPS |
| Opsi yang TIDAK ADA | BLE/GPS di Combine & Separate (standalone tracker, tidak combinable, §3.5); opsi Create/Delete TAG (registry read-only) |
| Empty/null display | `—` (error-handling §8); Last Scanned null → `—` |

---

### 3.7 Action Resilience & Sync Matrix

**Action Resilience Spec (error-handling §7):**

| Aksi | Idempotent? | Update mode | On success | On failure (5xx/timeout) | On conflict (409) |
|------|-------------|-------------|------------|--------------------------|-------------------|
| Combine (Submit) | Idempotency key | Pessimistic | Set jadi 1 entitas; toast `"Success, [N] TAGs have been combined."`; refresh | Tabel sesi dipertahankan; toast `"Error, failed to submit Combine/Separate."`; retry manual; status tidak berubah | Dialog konflik + refresh state TAG |
| Separate (Submit) | Idempotency key | Pessimistic | Set dipecah; toast `"Success, [N] TAGs have been separated."`; refresh | Dipertahankan; toast `"Error, failed to submit Combine/Separate."`; retry | Dialog + refresh |
| Audit (Submit) | Idempotent (re-submit hasil sama) | Pessimistic | Status batch diupdate; toast `"Success, Audit has been submitted."`; refresh | Dipertahankan; toast `"Error, failed to submit audit."`; retry | Dialog + refresh |
| Activate TAG (Submit — Langkah 0, pre-check agregat) | Read-only check, tidak ada mutasi | Sync, blocking | Kuota cukup semua kategori → lanjut ke commit per baris (baris berikutnya di tabel ini) | Kategori manapun kurang → Submit batal total (0 baris commit); Dialog "Insufficient Quota"; retry manual setelah `[Remove]` | n/a (read-only) |
| Activate TAG (Submit, per baris — setelah Langkah 0 lolos) | Idempotency key per baris (cegah double register) | Pessimistic, **partial commit** — tiap baris diproses independen, 1 baris gagal tidak menggagalkan baris lain dalam Submit yang sama | Baris sukses → Available; counter realtime; badge "Activated"; log per baris | Baris itu jadi "Failed" + alasan; halaman tetap terbuka, baris lain tetap diproses; retry via Remove+scan ulang. Kalau seluruh request gagal (5xx/timeout sebelum baris manapun diproses) → toast `"Error, failed to submit activation."`, tabel staging tetap utuh | Baris jadi "Failed" (identifier sudah aktif) + refresh badge |
| Approve/Reject Collision | Ya — `subject.status != 'pending'` di-guard, `409` kalau sudah resolved | Atomik (`tag_units` UPDATE + `tag_code` generate (Approve) + log, satu transaksi) | Toast `"Approved. TAG is now Active."` / `"Rejected."` + notifikasi requester (Client) | Rollback penuh, toast error generik | Dialog `409` + refresh — subject sudah diputuskan approver lain |
| Pairing/Usage (per scan, §6) | Ya (TAG sudah ada → diabaikan) | Pessimistic | TAG dipakai untuk pairing; tidak ada baris baru | Toast/dialog sesuai §3.2; scan lanjut | n/a (atomic per TAG) |

> Aksi multi-step (Combine/Separate/Audit) **atomik**: status + log (Event Log Audit/Combine/Separate, Activity Log, cross-module) dalam satu transaksi DB (error-handling §7).

**Sync Matrix (state-sync-protocol §4):**

| Aksi | State owner berubah | Surface terdampak (derived/reflected) | Timing | Efek turunan |
|------|---------------------|----------------------------------------|--------|--------------|
| Activate TAG — Jalur A (match `tag_units`) | `tag_units.status`: `active` → `in_use`; INSERT `tag_usage` (owner = Admin Console `tag-stock/`, **ditulis dari sini** — cross-schema write, bukan duplikasi owner) | Admin Console > TAG > Stock Detail (Tab Registered: badge → In Use, Client + Condition terisi); Stock List (kolom aggregate `in_use_or_paired`) | Sync (atomik, satu transaksi dengan INSERT baris `TAG` GS) | Event Log Activate TAG (§10.4 `01-overview.md`), Activity Log GS "Activate"; tidak ada Activity Log terpisah di Admin Console untuk event ini (dicatat GS) |
| Activate TAG — Jalur B (BYO, tanpa match) | INSERT `tag_units` baru (owner = Admin Console `tag-stock/`, **ditulis dari sini**) + `tag_code` diterbitkan + INSERT `tag_usage` | Admin Console > TAG > Stock List/Detail (baris baru muncul, badge In Use) | Sync (atomik, satu transaksi dengan INSERT baris `TAG` GS) | Event Log Activate TAG, Activity Log GS "Activate" |
| Activate TAG — Collision (pure Jalur B) | INSERT `tag_units` (status=`waiting_for_approval`) + INSERT `approval_subjects` (status=`pending`) | Sidebar Approvals badge Admin Console bertambah (derived); Client melihat status "Waiting for Approval" di GS TAG | Sync (satu transaksi) | Event Log Activate TAG (baris "Waiting for Approval" di section terkait), Activity Log GS "Submit for Approval"; Approve/Reject di bawah menulis log milik Admin Console |
| Discovery (QR) | Tidak ada — QR tidak memicu write-back (Open Item #2 `tag-stock/05-dependencies.md`, blocker: PRD FAMS QR belum ada) | — | — | — |
| Combine | TAG Type: single → Combined | All TAGs, Paired/Not Paired view, Counter Card RFID/NFC (angka tetap — cuma perpindahan grouping tampilan) | Sync + Realtime | Event Log Combine, Activity Log |
| Separate | TAG Type: Combined → single | view registry, Counter Card terkait | Sync + Realtime | Event Log Separate, Activity Log |
| Audit (Damaged/Missing→Available) | Status TAG | All TAGs, Not Paired, Health Counter Card (F-TAG-04a — angka ✓/✕ bergeser) | Sync + Realtime | Event Log Audit, Activity Log, cross-module log |
| Status Sync (dari FAMS/Supply) | Status TAG (owner = registry GS) | view registry, **FAMS/Supply asset surface (reflected)**; Counter Card QR (Tab All) bertambah kalau status → Paired | Sync + Realtime | Activity Log, cross-module log |
| Hardware Allocation baru ke client ini (dari Admin Console — RFID/NFC/BLE/GPS) | `stock_ledger.balance` (owner = `hardware-allocation`/`tag-stock`, Admin Console) | **License Counter Card GS (reflected)** — total unit teralokasi per tipe bertambah, guard Activate TAG §3.2 langsung memakai nilai terbaru | Reflected, real-time read (bukan push/copy) | Tidak ada log tambahan di GS — log alokasi sudah tercatat di Activity Log Admin Console (`hardware-allocation/01-overview.md` §8) |
| Allocate Asset License baru ke client ini (dari Admin Console) | `asset_license_ledger.total_quantity` (owner = `license-allocation`, Admin Console) | **Counter Card QR (Tab All, reflected)** — denominator bertambah, rasio paired/total berubah | Reflected, real-time read | Tidak ada log tambahan di GS — log alokasi tercatat di Admin Console (`license-allocation/01-overview.md`) |

> **Single source of truth:** status TAG di-**stored** di registry GS; tab All/Paired/Not Paired = **derived view** (filter status); tampilan TAG di asset FAMS/Supply = **reflected**. Reverse action (mis. Mark as Found, Un-pair) membalik status owner + semua surface (state-sync §5). To be Returned → Available di-**owned oleh produk** (FAMS/Supply), GS hanya reflected (§3.4). **Total unit teralokasi (Counter Card RFID/NFC/BLE/GPS)** di-**stored** di `stock_ledger` (Admin Console, dimiliki `hardware-allocation`); **total Asset License (Counter Card QR)** di-**stored** di `asset_license_ledger` (Admin Console, dimiliki `license-allocation`) — GS TAG untuk keduanya hanya **reflected** (read real-time), tidak pernah menyalin/cache nilainya secara independen.

