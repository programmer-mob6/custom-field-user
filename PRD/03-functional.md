## 3. Functional Requirements

> Ditujukan untuk: **Programmer (Backend & Frontend)**

### 3.1 Core Functions

| ID       | Fungsi              | Deskripsi                                          | Prioritas |
| -------- | ------------------- | -------------------------------------------------- | :-------: |
| F-UCF-01 | Custom Field CRUD   | Create, Edit, Delete Field Name + Data Type        |    P0     |
| F-UCF-02 | Activate/Deactivate | Toggle visibilitas field & data di form User       |    P1     |
| F-UCF-03 | Value management    | Kelola Values (Dropdown), Decimal Places (Numeric) |    P1     |

### 3.2 Business Logic

**[F-UCF-01] Custom Field CRUD:**

- Tipe data: Text (≤120), Text Area (≤360), Dropdown (single), Date, Numeric (≤15, decimal 0/1/2), Phone (Country Code + ≤15 digit numerik dihitung setelah kode, `01-overview.md` §4.3).
- Field Name unik case-insensitive per entitas.
- **Mengubah Data Type → reset data user** — semua value user untuk field ini di-null-kan, wajib dialog peringatan sebelum save.
- **Delete → hapus permanen** field + seluruh data user untuk field ini (tidak bisa di-undo, beda dari Deactivate).
- Urut tampil selalu **abjad** (by Field Name).

**[F-UCF-02] Activate/Deactivate:**

- Deactivate **menyembunyikan** field & datanya dari form Create/Edit User dan User Detail — **tidak menghapus** data.
- Reactivate **mengembalikan** field & data lama tanpa perubahan.
- Toggle Deactivate memicu dialog konfirmasi (§2 `01-overview.md`); Activate tidak perlu konfirmasi.

**[F-UCF-03] Value management:**

- Required default `No`; mengubah ke `Yes` **retroaktif** = flag visual pada user lama yang datanya kosong untuk field ini (tidak memblokir apapun, tidak memaksa user lama diisi).
- Hapus value dropdown yang sudah dipakai ≥1 user → dialog konfirmasi; value terhapus dari definisi field **dan** dari semua user yang memilihnya — user tersebut harus memilih ulang saat berikutnya edit profilnya.

### 3.3 Permissions & Access Control

| Role                                       | Custom Field                    |
| ------------------------------------------ | ------------------------------- |
| Total Control                              | Full CRUD + Activate/Deactivate |
| Read Only                                  | View only                       |
| Capability holder ("Manage user and role") | Tergantung CRUD individual      |

> UI gate per role didefinisikan di `01-overview.md` §1.6 (UI Visibility per Capability), kombinasi capability→elemen di §1.5a.

#### 3.3a Data Visibility per Role

> Lapis **Data** (row scope + field-level) — `prd-conventions.md` §18.3. Diterapkan di server/query (`04-data.md`).

| Role                                                 | Row scope (record mana)                            | Field-level     | Catatan                                 |
| ---------------------------------------------------- | -------------------------------------------------- | --------------- | --------------------------------------- |
| **Total Control**                                    | Semua Custom Field milik entitas aktif             | — (semua field) | —                                       |
| **Read Only**                                        | Semua Custom Field milik entitas aktif (read-only) | —               | Bisa lihat list, termasuk yang Inactive |
| **Capability holder ("Manage user and role", Read)** | Semua Custom Field milik entitas aktif             | —               | C/U/D mengikuti capability individual   |
| **Tanpa capability & bukan TC/RO**                   | Tidak ada akses (endpoint 403)                     | —               | Menu Custom Field hidden                |

> Custom Field selalu ter-scope ke **entitas aktif** (Client atau Principal/Distributor/Partner, `user/01-overview.md` §1.4a) — tidak ada role GS yang melihat data master entitas lain.

#### 3.3b Defense in Depth

> Penyembunyian/penonaktifan elemen di UI (§1.6 `01-overview.md`) hanyalah lapis pertama. Endpoint write (Create/Edit/Delete/Activate/Deactivate Custom Field) **tetap mengembalikan `403 Forbidden`** bila capability "Manage user and role" (C/U/D) tidak dimiliki, dan query read **tetap menerapkan scope filter entitas** di server walaupun elemen UI disembunyikan. UI dan server divalidasi independen — jangan pernah mengandalkan UI sebagai satu-satunya gate.

### 3.4 Plan Gating

Tidak ada plan gating — Custom Field **unlimited di semua plan**, tunduk **Master Data Count Limit** platform-wide (default 10.000/entitas) sebagai ceiling teknis, bukan cap operasional plan.

> Nilai Master Data Count Limit **dibaca reflected** dari `plans-licensing-lifecycle-settings/01-overview.md` §6.8 (Admin Console) — tidak di-hardcode/dikonfigurasi di modul ini.

### 3.5 Edge Case Matrix (M-1)

> Mengikuti `_foundation/edge-case-matrix-convention.md`. Failure (D10) → `error-handling-convention.md` §2; concurrency (D6) → §5; sync (D8) → §3.6.

**Condition Dimension Checklist (aksi: Create/Edit/Delete/Activate/Deactivate Custom Field):**

| #   | Dimensi               | Relevan? | Catatan                                                               |
| --- | --------------------- | :------: | --------------------------------------------------------------------- |
| D1  | Entity/Account state  |    ✅    | Entitas suspended/expired → aksi tulis diblokir                       |
| D2  | Plan/License state    |    ✅    | Master Data Count Limit (default 10.000/entitas) — bukan cap per-plan |
| D3  | Record state          |    ✅    | Active/Inactive; punya data user existing vs belum                    |
| D4  | Permission/Role/Scope |    ✅    | Manage user and role CRUD; scope entitas                              |
| D5  | Data state            |    ✅    | Field Name duplicate; boundary char per tipe; Data Type change        |
| D6  | Concurrency           |    ✅    | Field diedit/dihapus admin lain; double-submit                        |
| D7  | Sequence/Timing       |    ✅    | Create/Edit idempotent; delete already-done                           |
| D8  | Cross-module sync     |    ✅    | Create/Edit/Delete/Activate/Deactivate → form & detail User (§3.6)    |
| D9  | Quantity/Relation     |    ✅    | Delete value dropdown yang dipakai user                               |
| D10 | Failure               |    ✅    | Delegasi error-handling §2 & §7                                       |

**Matrix:**

| Aksi                     | Kondisi                                                  | Expected Behavior                                                                                                                                       | Jenis |
| ------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | :---: |
| Create                   | Happy path (nama valid, di bawah limit)                  | Field dibuat; muncul di form User; toast `"Success, Custom Field has been created."`                                                                    |   ✔   |
| Create                   | D2: Master Data Count Limit tercapai                     | Tombol `+ Custom Field` tetap Show/enabled; klik → dialog blok `[OK]`, `reason = system_limit`                                                          |   ✘   |
| Create                   | D5: Field Name duplicate (case-insensitive, per entitas) | `"Field Name already exists"` (debounce)                                                                                                                |   ✘   |
| Edit                     | D5: Data Type diubah, **tidak** ada data user            | Update langsung tanpa dialog (tidak ada yang direset)                                                                                                   |   ✔   |
| Edit                     | D5: Data Type diubah, **ada** data user                  | Dialog peringatan reset data → Confirm: data user field ini di-null-kan                                                                                 |   ✔   |
| Edit                     | D5: Field Name diubah                                    | Update langsung tanpa dialog; **value user tidak berubah** (key JSON = `custom_field_id`, bukan nama)                                                   |   ✔   |
| Edit                     | D5: Required diubah                                      | Update langsung tanpa dialog; **value user tidak berubah** (retroaktif = flag visual saja, §9)                                                          |   ✔   |
| Edit                     | D5: Decimal Places diubah, tipe Numeric                  | Update langsung tanpa dialog; **value user tidak berubah** — angka existing tidak di-reformat retroaktif, setting baru cuma berlaku ke input berikutnya |   ✔   |
| Edit                     | D9: hapus value Dropdown yang dipakai user               | Dialog peringatan → Confirm: value hilang dari definisi + dari user yang memilihnya                                                                     |   ✔   |
| Deactivate               | Happy path (row atau Bulk)                               | Dialog konfirmasi → Confirm: field & data disembunyikan dari form/detail User (data tetap tersimpan) — perilaku sama persis row-level maupun Bulk       |   ✔   |
| Activate                 | Happy path (row atau Bulk, sebelumnya Inactive)          | Field & data lama kembali muncul, tanpa dialog konfirmasi                                                                                               |   ✔   |
| Bulk Activate/Deactivate | D9: bulk mixed (sebagian Active, sebagian Inactive)      | Bulk action bar tampilkan kedua aksi (Activate & Deactivate); tiap field diproses sesuai aksi yang diklik, 1 log per field                              |   ✔   |
| Delete                   | Happy path (row-level only — tidak ada Bulk Delete)      | Dialog konfirmasi (sebut data user hilang permanen) → Confirm: field + data user terhapus                                                               |   ✔   |
| Semua aksi tulis         | D4: tanpa "Manage user and role" C/U/D                   | `403 Forbidden` (§3.3b)                                                                                                                                 |   ✘   |
| Semua aksi tulis         | D1: entitas suspended/expired                            | Aksi tulis diblokir                                                                                                                                     |   ✘   |
| Semua aksi tulis         | D6: diedit/dihapus admin lain saat ini                   | `409` dialog + refresh                                                                                                                                  |   ✘   |
| Semua aksi tulis         | D6: klik Submit ganda                                    | Double-submit guard; tidak ada duplikat                                                                                                                 |   ✘   |

**Must NOT:**

- Membuat Custom Field di atas Master Data Count Limit (D2).
- Membuat Custom Field dengan Field Name duplicate case-insensitive per entitas (D5).
- Mengubah Data Type tanpa dialog peringatan saat ada data user existing (D5/D9).
- Menghapus Custom Field tanpa dialog peringatan (D9 — data hilang permanen, bukan reversible seperti Deactivate).
- Menghapus data user secara diam-diam saat Deactivate (D3 — data harus tetap tersimpan, cuma disembunyikan).
- Menampilkan data master milik entitas lain (D4).
- Memproses submit kedua dari klik ganda (D6/D7).

**Defaults & Ordering:**

| Aspek                                    | Spec                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Default sort — Custom Field              | Field Name, asc (abjad, case-insensitive) — **tidak ada opsi sort lain**                                      |
| Default filter                           | Tidak ada                                                                                                     |
| Default value — Required (Create)        | `No`                                                                                                          |
| Default value — Active (Create)          | `On`, otomatis — **tidak ada toggle di form** (koreksi 2026-07-15)                                            |
| Default value — Decimal Places (Numeric) | `0`                                                                                                           |
| Master Data Count Limit                  | Default `10.000`/entitas; reflected dari `plans-licensing-lifecycle-settings`, tidak di-hardcode di modul ini |
| Bulk action                              | **Activate/Deactivate saja** (koreksi 2026-07-15) — tersedia; Bulk **Delete** tetap tidak ada                 |
| Opsi yang TIDAK ADA                      | Bulk Delete (row-level only); sort selain abjad; toggle Active di form Create/Edit                            |
| Empty/null display                       | `—` (error-handling §8)                                                                                       |

### 3.6 Action Resilience & Sync (C-2 / C-4)

**Action Resilience Spec (error-handling §7):**

| Aksi                | Idempotent?     | Update mode | On success                                  | On failure (5xx/timeout)                 | On conflict (409)                           |
| ------------------- | --------------- | ----------- | ------------------------------------------- | ---------------------------------------- | ------------------------------------------- |
| Create Custom Field | Idempotency key | Pessimistic | Dibuat; muncul di form User; toast; log     | Form terbuka, input dipertahankan, retry | Dialog (nama sudah dipakai) + refresh       |
| Edit Custom Field   | Idempotent      | Pessimistic | Diubah; sync ke form User; toast            | Form terbuka; retry                      | Dialog + refresh nilai terbaru              |
| Delete Custom Field | Idempotency key | Pessimistic | Field + data user dihapus; toast            | Tidak terhapus; retry                    | Dialog (sudah dihapus admin lain) + refresh |
| Activate/Deactivate | Idempotent      | Pessimistic | Toggle; sync visibility di form/detail User | Toggle dikembalikan; retry               | Dialog + refresh                            |

> State + log (Changelog, System Log, Activity Log) dalam satu transaksi DB (error-handling §7).

**Sync Matrix (state-sync-protocol §4):**

| Aksi                                                | State owner berubah                                                                            | Surface terdampak (reflected)                                                                                                                     | Timing          | Efek turunan                                                   |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------- |
| Create Custom Field                                 | Custom Field definition (owner = GS Custom Field)                                              | Form Create/Edit User, User Detail (`user/`) — field baru langsung dirender                                                                       | Sync + Realtime | Changelog, Activity Log                                        |
| Edit — Field Name berubah (2026-07-15)              | Label definition berubah; **value user TIDAK disentuh**                                        | Form/Detail User — label baru tampil, value existing tetap sama (key JSON = `custom_field_id`, bukan nama, `04-data.md` §4.2)                     | Sync + Realtime | Changelog (Field=Field Name)                                   |
| Edit — Required berubah (2026-07-15)                | Flag `required` berubah; **value user TIDAK disentuh**                                         | Form/Detail User — indikator wajib berubah, value existing tetap sama; retroaktif = flag visual saja utk data lama kosong (§9)                    | Sync + Realtime | Changelog (Field=Required)                                     |
| Edit — Data Type berubah                            | Definition + **semua value user di-reset kosong** (dialog peringatan wajib sebelum save)       | Form/Detail User — field tampil kosong utk semua user, harus diisi ulang                                                                          | Sync            | Changelog (Field=Data Type), tercatat sebagai reset massal     |
| Edit — Decimal Places berubah (Numeric, 2026-07-15) | Setting `decimal_places` berubah; **value user TIDAK berubah**                                 | Form/Detail User — value existing tetap sama (angka mentah tidak di-reformat retroaktif); validasi decimal baru berlaku utk input berikutnya saja | Sync + Realtime | Changelog (Field=Decimal Places)                               |
| Edit — hapus 1 value Dropdown yang dipakai user     | Value dihapus dari `values` definition **dan** dari `users.custom_fields` user yang memilihnya | Form/Detail User yang terdampak — value hilang, user harus pilih ulang                                                                            | Sync            | Changelog (Field=Values), dialog peringatan sebelum konfirmasi |
| Delete Custom Field                                 | Definition + semua value user dihapus                                                          | Form/Detail User — field hilang total                                                                                                             | Sync            | Changelog, Activity Log                                        |
| Deactivate/Activate                                 | Visibility flag berubah                                                                        | Form/Detail User — field disembunyikan/muncul (data tetap ada di DB)                                                                              | Sync + Realtime | Changelog, Activity Log                                        |

> **Single source of truth:** definisi Custom Field = **stored** di GS Custom Field; value per user = **stored** di `users.custom_fields` (owner = GS User, `user/04-data.md` §5.1), tapi rendering & validasi-nya **mengikuti definisi** modul ini secara reflected real-time.
> **Prinsip pembeda (2026-07-15):** perubahan **metadata display/rule** (Field Name, Required, Decimal Places) — value user **tidak pernah** disentuh, cuma cara tampil/validasinya yang berubah. Perubahan **Data Type** — satu-satunya yang **mereset value** (karena tipe data lama & baru mungkin tidak kompatibel, mis. Text→Numeric), makanya wajib dialog peringatan eksplisit sebelum save (beda dari 3 field lain yang silent).
