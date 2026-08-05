# Global Settings > User > Custom Field (tab)

> Modul: **Global Settings** | Feature Prefix: **`UCF`**
> **File PRD sendiri** demi kemudahan baca/maintain, tapi secara **UI tetap tab** di halaman yang sama dengan User: `Global Settings > User`, tab **"Custom Field"** (sejajar tab "User List", "Position", "Division" — lihat `user/01-overview.md` §1.3a Struktur Tab). **Bukan** menu sidebar terpisah. Lihat `position/01-overview.md` dan `division/01-overview.md` untuk modul saudara, dan `user/01-overview.md` untuk tab induk yang mengonsumsi Custom Field sebagai field dinamis pada form User.

---

## 1. Overview

### 1.1 Problem Statement

Tiap perusahaan (client) punya atribut user yang berbeda-beda di luar field standar (First Name, Email, Position, dll) — mis. "Grade", "Cost Center", "Contract Type". Tanpa mekanisme field dinamis, kebutuhan ini akan memaksa perubahan skema database per client, tidak scalable.

### 1.2 Goals

- Menyediakan **field tambahan dinamis** pada profil user, didefinisikan bebas oleh tiap client
- Mendukung berbagai tipe data (Text, Dropdown, Numeric, dll) sesuai kebutuhan atribut
- Membatasi CRUD sesuai `access_level` (Total Control/Read Only) dan capability **"Manage user and role"**

### 1.3 Feature Summary

Custom Field (User) memungkinkan admin mendefinisikan field tambahan yang dirender secara dinamis di form Create/Edit User dan User Detail (`user/01-overview.md` §4.2-4.4). Enam tipe data didukung: Text, Text Area, Dropdown, Date, Numeric, Phone (Phone = Country Code selector + angka, §4.6 di bawah). Field bisa ditandai Required dan bisa di-nonaktifkan (Active toggle) tanpa menghapus data historisnya. Tidak ada plan gating — tunduk **Master Data Count Limit** platform-wide (default 10.000/entitas, `plans-licensing-lifecycle-settings/01-overview.md` §6.8), sama seperti `position/` dan `division/`.

### 1.4 Scope

**In Scope:**

- Custom Field: list, Create, Edit, Delete, Activate/Deactivate (toggle)
- 6 tipe data + validasi per tipe
- Changelog, Download, System Log, Activity Log

**Out of Scope:**

- Position/Division — PRD terpisah, lihat `position/` dan `division/`
- User (List/CRUD) — dikelola di `user/`, hanya merender & menyimpan value Custom Field di form-nya
- Custom Field untuk entitas lain (Asset, dll) — modul ini khusus User; FAMS Asset punya Custom Field sendiri (`Fixed-Asset/PRD/settings-custom-fields/`), skema terpisah

### 1.5 Personas & Role Matrix

**Akses ke modul ini dikontrol oleh `access_level` dan capability "Manage user and role" milik aktor** (mirror pola `user/01-overview.md` §1.5, GS hanya Global Role — tidak ada Group Role/Entity Gate berjenjang). Tidak ada Entity Gate terpisah untuk modul ini — akses entitas (Client/Principal/Distributor/Partner) sudah identik dengan `user/01-overview.md` §1.4a/§1.5a (Custom Field selalu diakses dalam konteks entitas yang sama dengan User), jadi tabel entity gate tersendiri di sini redundan (konsisten dengan `position/01-overview.md` §1.5 dan `division/01-overview.md` §1.5).

#### 1.5a Global Role

| Role                 | Deskripsi                                                                                                                                         | Aksi yang Diizinkan                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Manage user and role | Capability individual (`role/01-overview.md` §2.1) — dibagi bersama dengan `user/`, `position/`, `division/`, **satu toggle** men-gate keempatnya | CRUD penuh sesuai kolom yang di-assign |

#### 1.5b Group Role

N/A — Global Settings tidak memiliki Group Role (`role/01-overview.md` §2.2). Custom Field berlaku ke seluruh data entitas aktif, tanpa pembatasan per group.

#### 1.5c Special Access Levels

| Access Level                               | Behavior di Modul Ini                                                       |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| Total Control (`access_level`)             | Akses penuh: CRUD + Activate/Deactivate Custom Field                        |
| Read Only (`access_level`)                 | Lihat semua Custom Field; tidak bisa Create/Edit/Delete/Activate/Deactivate |
| Capability holder ("Manage user and role") | Tergantung CRUD individual (§1.5a)                                          |
| Tanpa capability & bukan TC/RO             | ❌ Tidak ada akses ke menu ini (menu hidden)                                |

### 1.6 UI Visibility per Capability

> Lapis **UI** (Show / Hidden / Disabled) — `prd-conventions.md` §18.4–18.5. Disabled wajib tooltip 🔖.

| Elemen UI                                                  | Total Control |  Read Only  | Manage user and role (individual capability) |
| ---------------------------------------------------------- | :-----------: | :---------: | :------------------------------------------: |
| Tab **Custom Field** (di halaman User)                     |     Show      |    Show     |      Show jika Read; selain itu Hidden       |
| `[+ Custom Field]` button                                  |     Show      |   Hidden    |     Show jika Create; selain itu Hidden      |
| Row action `Edit`                                          |     Show      |   Hidden    |     Show jika Update; selain itu Hidden      |
| Row action `Delete`                                        |     Show      |   Hidden    |     Show jika Delete; selain itu Hidden      |
| Toggle Active                                              |     Show      | Disabled 🔖 |   Show jika Update; selain itu Disabled 🔖   |
| Search / Filter / Download / Changelog / Column Visibility |     Show      |    Show     |                Show jika Read                |

> Tooltip 🔖 elemen Disabled: `"You don't have permission to edit"`.
> **Defense-in-depth:** UI hide bukan pengganti server gate — lihat `03-functional.md` §3.3b.

---

## 2. User Flow

**Alur — Create Custom Field:**

```
Toolbar [+ Custom Field]
└── Popup Create Custom Field
      ├── Isi Field Name (required, ≤120 char, unik case-insensitive per entitas)
      ├── Pilih Data Type* 🔖 (Text/Text Area/Dropdown/Date/Numeric/Phone) — tooltip ℹ berisi deskripsi tiap tipe (`02-ui-design.md` §2.2)
      │     └── reveal field tambahan sesuai tipe (Values untuk Dropdown — helper text "Press enter to add new value or click the badge to edit"; Decimal Places untuk Numeric)
      ├── Toggle Required (default: No)
      ├── [opsional] centang "Stay on this form after submitting"
      └── Submit
            ├── Sukses → data masuk tabel dengan **Active = On otomatis** (tidak ada pilihan Active di form; status diatur lewat toggle tabel setelah field dibuat), urutan abjad by Field Name + toast "Success, Custom Field has been created."
            │     ├── "Stay" aktif → popup tetap, field reset
            │     └── "Stay" nonaktif → popup tertutup
            │     └── log: Changelog (Create) + System Log (Create) + Activity Log
            │     └── Field langsung muncul di form Create/Edit User (`user/`)
            └── Gagal → inline error per field, popup tetap, toast "Error, failed to create custom field."
```

**Alur — Edit Custom Field:**

```
Row action [Edit]
└── Popup Edit Custom Field (field pre-filled nilai tersimpan)
      └── Submit
            ├── Data Type TIDAK diubah → update biasa + toast "Success, Custom Field has been updated." + log (Edit)
            └── Data Type DIUBAH + ada data user existing → dialog peringatan
                  "Changing the data type will reset all existing values for this field. This action cannot be undone."
                  [Cancel] [Change Data Type]
                  └── Confirm → data lama semua user untuk field ini di-reset + update + log (Edit)
            └── Gagal (server error) → popup tetap, toast "Error, failed to update custom field."
```

**Alur — Delete Custom Field:**

```
Row action [Delete]
└── Dialog konfirmasi "Delete Custom Field"
      "- [Field Name]
      All user data for this field will be permanently lost.
      This action cannot be undone. Are you sure you want to delete it?" [Cancel] [Delete]
      └── Confirm → field + seluruh data user untuk field ini terhapus permanen
            + toast "Success, Custom Field has been deleted." + log (Delete)
      Gagal (server error) → dialog tertutup, data tidak berubah, toast "Error, failed to delete custom field."
```

**Alur — Activate/Deactivate:**

```
Toggle Active (row)
├── Deactivate → dialog "Deactivating this field will hide it and its data from all user forms. You can reactivate it later." [Cancel] [Deactivate]
│     └── Confirm → field & datanya disembunyikan dari form/detail User (data TIDAK dihapus)
│           + toast "Success, Custom Field has been deactivated." + log (Deactivate)
│     Gagal (server error) → toggle kembali ke posisi semula, toast "Error, failed to deactivate custom field."
└── Activate → field & datanya kembali muncul di form/detail User
      + toast "Success, Custom Field has been activated." + log (Activate)
      Gagal (server error) → toggle kembali ke posisi semula, toast "Error, failed to activate custom field."
```

**Alur — Hapus value Dropdown yang sedang dipakai:**

```
Edit Custom Field → hapus 1 value dari list Values
└── Dialog peringatan → Confirm
      └── Value terhapus dari definisi field DAN dari semua user yang memilihnya (user harus pilih ulang)
```

---

## 3. Global Table Rules

Mengacu `_foundation/prd-conventions.md` §9.

| Rule       | Detail                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| Toolbar    | Column Visibility (⋯) \| Search \| Filter \| Download \| Changelog \| `[+ Custom Field]`                                |
| Pagination | Default 10; pilihan 10/25/50/100                                                                                        |
| Search     | Tidak case-sensitive; cari by Field Name                                                                                |
| Sort       | Default Field Name A-Z (abjad); case-insensitive; **tidak** ada opsi sort lain                                          |
| Bulk       | Tidak ada bulk action — Delete/Activate/Deactivate hanya row-level (beda dari Position/Division yang punya Bulk Delete) |
| Download   | CSV/XLSX; tidak ada toast sukses; filename `Custom-Fields`                                                              |
| Changelog  | Modal "Changelog: Custom Field"; filename `Changelog-Custom-Field`                                                      |

---

## 4. Halaman & Komponen UI

### 4.1 Custom Field — List

**Filter Panel:**

| Field       | Tipe                  |
| ----------- | --------------------- |
| Data Type   | Dropdown multi-select |
| Required    | Dropdown (Yes / No)   |
| Active      | Active / Inactive     |
| Last Update | Date picker (single)  |

**Tabel:**

| Kolom         | Keterangan                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Checkbox      | Bulk action                                                                                                                           |
| Active        | Toggle — mirror pola User List (`user/01-overview.md` §4.1)                                                                           |
| Field Name    | Identitas utama; tidak bisa di-hide                                                                                                   |
| Data Type     | —                                                                                                                                     |
| Value Setting | Dropdown → badge tiap value (maks 2 tampil, sisanya `+N More`, klik → popup semua badge); Numeric → "N decimal places"; lainnya → `—` |
| Required      | Yes/No                                                                                                                                |
| Last Update   | —                                                                                                                                     |

**Row Actions (elipsis):** `Edit` \| `Delete` — visibilitas per capability CRUD (§1.6). Tidak ada Detail.

**Bulk Action:** checkbox select-row → bulk action bar `Activate` \| `Deactivate` (tampil sesuai kondisi terpilih — mixed active/inactive menampilkan keduanya, homogen menampilkan yang berlawanan saja, mirror pola `user/01-overview.md` §4.1). **Bulk Delete tetap tidak ada** — Delete hanya row-level (data user hilang permanen per field, terlalu destruktif untuk bulk).

### 4.2 Popup: Create/Edit Custom Field

| Field                                         | Tipe                                                                                               | Validasi                                                  |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Field Name                                    | Text input                                                                                         | Required, max 120 char, unik case-insensitive per entitas |
| Data Type                                     | Dropdown 🔖 + tooltip ℹ (deskripsi tiap tipe, isi: `02-ui-design.md` §2.2 "Tooltip: Data Type")    | Required — reveal field tambahan sesuai tipe              |
| Values (Dropdown)                             | Chip input, Enter to add + helper text `"Press enter to add new value or click the badge to edit"` | Required minimal 1 value, max 120 char/value              |
| Decimal Places (Numeric)                      | Radio 0/1/2                                                                                        | Default 0                                                 |
| Required                                      | Toggle                                                                                             | Default No                                                |
| Checkbox "Stay on this form after submitting" | Checkbox                                                                                           | Default unchecked (Create only)                           |

> **Tidak ada toggle Active di form** — field baru selalu dibuat dengan Active = On otomatis. Active/Inactive dikelola khusus lewat toggle di kolom tabel (§4.1), bukan field form.

**Tipe Data:**

| Tipe      | Batas                                                                    | Keterangan                                                                                                                                          |
| --------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text      | ≤120 karakter                                                            | —                                                                                                                                                   |
| Text Area | ≤360 karakter                                                            | —                                                                                                                                                   |
| Dropdown  | ≤120 char/value                                                          | reveal: Values input (chip, Enter to add) 🔖                                                                                                        |
| Date      | —                                                                        | —                                                                                                                                                   |
| Numeric   | ≤15 karakter                                                             | reveal: Decimal Places radio (0/1/2, default 0)                                                                                                     |
| Phone     | Country Code (wajib dipilih) + ≤15 digit numerik **setelah** kode negara | Tidak ada reveal di form ini — daftar Country Code adalah katalog tetap platform-wide (§4.3), bukan dikonfigurasi per field seperti Values Dropdown |

Tutup popup dengan unsaved changes → dialog `"You have unsaved changes. Are you sure you want to leave?"` [Leave] [Cancel].

---

### 4.3 Phone — Country Code & Value Input (dynamic form User)

> Berlaku di mana pun value Phone custom field diinput/diedit: Form Create/Edit User (`user/02-ui-design.md`), User Detail edit, dan cell edit Staging Table Import (`import/02-ui-design.md` — value disimpan/di-parse dalam format yang sama).

- **Input**: 1 kontrol visual gabungan, pola **"input with left addon"** — addon kiri **Country Code** [Dropdown searchable, mis. `"🇮🇩 +62"`, menyatu ke border input yang sama] + **Number** [Text input, numeric only, menyatu ke kanan addon]. Bukan 1 field bebas tanpa struktur, dan bukan 2 field terpisah dengan label/jarak sendiri — Country Code wajib dipilih dulu sebelum Number aktif diisi.
- **Katalog Country Code**: daftar tetap kode panggilan negara (ISO 3166 country calling codes), **platform-wide, tidak dikustomisasi per client** — sama prinsip dengan katalog `preferred_language` (`user/04-data.md` §5.1, ISO 639-1 via Google API). Principal tidak mengelola daftar ini dari UI manapun; sumbernya reference table statis.
- **Batas 15 digit dihitung SETELAH Country Code** — Country Code (mis. `+62`) tidak ikut dihitung ke batas 15 karakter Number. Jadi `+62` + `812345678901234` (15 digit) adalah value valid, bukan `+62812345678901234` yang dianggap melebihi.
- **Storage**: value tersimpan **gabungan** sebagai 1 string `[+CountryCode][Number]` tanpa separator (mis. `"+62812345678901234"`) di `users.custom_fields` (`user/04-data.md` §5.1) — bukan 2 sub-field terpisah. Parsing balik (memisahkan Country Code dari Number saat render form) memakai panjang kode dari katalog (§ di atas), bukan posisi karakter tetap (kode negara panjangnya bervariasi 1-3 digit).
- **Required** (toggle field ini) berlaku ke **keduanya sekaligus** — Country Code dan Number harus sama-sama terisi kalau field ini Required; mengisi salah satu saja dianggap belum lengkap (§5 Validasi).

---

## 5. Validasi & Error Messages

| Field / Aksi                              | Rule                                                                             | Pesan Error                                                                                                                                                                                                            | Timing                                                                                                |
| ----------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Field Name                                | Required                                                                         | `"Field Name must not be empty"`                                                                                                                                                                                       | Setelah Submit                                                                                        |
| Field Name                                | Max 120 karakter                                                                 | `"Max. 120 characters"`                                                                                                                                                                                                | Langsung saat melebihi                                                                                |
| Field Name                                | Unik case-insensitive per entitas                                                | `"Field Name already exists"`                                                                                                                                                                                          | Saat kursor pindah dari field (debounce)                                                              |
| Text value (user, sesuai Data Type)       | Max sesuai tipe (120/360/15)                                                     | `"Max. [n] characters"`                                                                                                                                                                                                | Langsung saat melebihi                                                                                |
| Phone value — Number                      | Hanya numerik                                                                    | `"[Field Name] must be numeric"`                                                                                                                                                                                       | Langsung saat karakter non-numerik                                                                    |
| Phone value — Number                      | > 15 digit (dihitung setelah Country Code, §4.3)                                 | `"Max. 15 characters"`                                                                                                                                                                                                 | Langsung saat melebihi                                                                                |
| Phone value — Country Code                | Belum dipilih padahal Number sudah diisi (atau sebaliknya), field ini Required   | `"[Field Name] must not be empty"`                                                                                                                                                                                     | Setelah Submit                                                                                        |
| Numeric value                             | Bukan angka                                                                      | `"[Field Name] must be a number"`                                                                                                                                                                                      | Langsung saat karakter non-numerik (form); saat parsing/edit sel (Import)                             |
| Numeric value                             | Melebihi Decimal Places yang di-setting field ini                                | `"[Field Name] must have at most [N] decimal place(s)"`                                                                                                                                                                | Langsung saat melebihi (form); saat parsing/edit sel (Import)                                         |
| Date value                                | Format tidak valid                                                               | `"[Field Name] must be a valid date"`                                                                                                                                                                                  | Setelah submit (form); saat parsing/edit sel (Import)                                                 |
| Dropdown value                            | Tidak exact-match (case-insensitive) salah satu Values terdaftar untuk field ini | `"[value] is not a valid option for [Field Name]"`                                                                                                                                                                     | Saat parsing/edit sel (Import) — form native tidak butuh ini karena input via select, bukan free-text |
| Data Type diubah + ada data user          | —                                                                                | Dialog: `"Changing the data type will reset all existing values for this field. This action cannot be undone."` [Cancel] [Change Data Type]                                                                            | Saat Save                                                                                             |
| Deactivate                                | —                                                                                | Dialog: `"Deactivating this field will hide it and its data from all user forms. You can reactivate it later."` [Cancel] [Deactivate]                                                                                  | Saat toggle OFF                                                                                       |
| Delete                                    | —                                                                                | Title `"Delete Custom Field"` · body: bullet `[Field Name]` + `"All user data for this field will be permanently lost."` + `"This action cannot be undone. Are you sure you want to delete it?"` · `[Cancel] [Delete]` | Klik Delete                                                                                           |
| Hapus value Dropdown yang dipakai         | —                                                                                | Dialog peringatan; value terhapus dari semua user yang memilihnya                                                                                                                                                      | Saat hapus value di form Edit                                                                         |
| Create — Master Data Count Limit tercapai | Batas platform-wide (default 10.000/entitas)                                     | Dialog: `"You've reached the platform limit of {limit} custom fields. Contact support if you need a higher limit."` [OK]                                                                                               | Saat klik `[+ Custom Field]`                                                                          |
| Download                                  | Gagal                                                                            | `"Error, failed to download Custom Field."`                                                                                                                                                                            | Saat download gagal                                                                                   |

---

## 6. States & Feedback

| State                                             | Kondisi                                                | Tampilan                                                                                               |
| ------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Loading                                           | Fetch data                                             | Skeleton rows                                                                                          |
| Empty                                             | Belum ada custom field                                 | Illustration + `"No custom field yet"` — tanpa button/CTA (tombol `[+ Custom Field]` tetap di toolbar) |
| Empty — filtered                                  | Search/filter tidak ada hasil                          | `"No results found"`                                                                                   |
| Error load                                        | Fetch gagal                                            | `"Unable to load this data."` + `[Try Again]`                                                          |
| Create sukses                                     | —                                                      | Toast: `"Success, Custom Field has been created."`                                                     |
| Create gagal                                      | Server error                                           | Toast: `"Error, failed to create custom field."`                                                       |
| Edit sukses                                       | —                                                      | Toast: `"Success, Custom Field has been updated."`                                                     |
| Edit gagal                                        | Server error                                           | Toast: `"Error, failed to update custom field."`                                                       |
| Delete sukses                                     | —                                                      | Toast: `"Success, Custom Field has been deleted."`                                                     |
| Delete gagal                                      | Server error                                           | Toast: `"Error, failed to delete custom field."`                                                       |
| Activate sukses                                   | —                                                      | Toast: `"Success, Custom Field has been activated."`                                                   |
| Activate gagal                                    | Server error                                           | Toast: `"Error, failed to activate custom field."`                                                     |
| Deactivate sukses                                 | —                                                      | Toast: `"Success, Custom Field has been deactivated."`                                                 |
| Deactivate gagal                                  | Server error                                           | Toast: `"Error, failed to deactivate custom field."`                                                   |
| Required field kosong pada user lama (retroaktif) | Required diubah `No`→`Yes` setelah user lama sudah ada | Flag visual (caption error) di form/detail User — tidak memblokir apapun                               |

---

## 7. Logging

### 7.1 Changelog (Custom Field object)

**Struktur kolom:** Date | Action | Name | Field | Old Value | New Value | Modified By

| Action     | Field                                                         | Old Value  | New Value  | Modified By    |
| ---------- | ------------------------------------------------------------- | ---------- | ---------- | -------------- |
| Create     | —                                                             | —          | —          | `[admin name]` |
| Edit       | [Field Name / Data Type / Values / Decimal Places / Required] | `[old]`    | `[new]`    | `[admin name]` |
| Delete     | —                                                             | —          | —          | `[admin name]` |
| Activate   | Status                                                        | `Inactive` | `Active`   | `[admin name]` |
| Deactivate | Status                                                        | `Active`   | `Inactive` | `[admin name]` |

### 7.2 System Log (referensi — dicatat di `User Detail > Tab System Log` milik aktor)

| Date   | Action | Object       | Name           | Field   | Old Value | New Value |
| ------ | ------ | ------------ | -------------- | ------- | --------- | --------- |
| [date] | Create | Custom Field | `[Field Name]` | —       | —         | —         |
| [date] | Edit   | Custom Field | `[Field Name]` | [Field] | `[old]`   | `[new]`   |
| [date] | Delete | Custom Field | `[Field Name]` | —       | —         | —         |

### 7.3 Activity Log (Global Settings > Activity Log)

| Date   | Action     | Object       | Name           | Field   | Old Value  | New Value  | Modified By |
| ------ | ---------- | ------------ | -------------- | ------- | ---------- | ---------- | ----------- |
| [date] | Create     | Custom Field | `[Field Name]` | —       | —          | —          | `[User]`    |
| [date] | Edit       | Custom Field | `[Field Name]` | [Field] | `[old]`    | `[new]`    | `[User]`    |
| [date] | Delete     | Custom Field | `[Field Name]` | —       | —          | —          | `[User]`    |
| [date] | Deactivate | Custom Field | `[Field Name]` | Status  | `Active`   | `Inactive` | `[User]`    |
| [date] | Activate   | Custom Field | `[Field Name]` | Status  | `Inactive` | `Active`   | `[User]`    |

### 7.4 Sinkronisasi

Tiga surface (Changelog, System Log, Activity Log) ditulis dalam satu transaksi DB untuk setiap aksi write.

---

## 8. Feature List

| ID     | Fitur                          | Deskripsi                                                                       | Prioritas |
| ------ | ------------------------------ | ------------------------------------------------------------------------------- | :-------: |
| UCF-01 | List Custom Field              | Tabel + filter + search, urut abjad                                             |    P0     |
| UCF-02 | Create Custom Field            | Popup 6 tipe data, stay-on-form, log                                            |    P0     |
| UCF-03 | Edit Custom Field              | Popup pre-filled, dialog reset data type, log                                   |    P0     |
| UCF-04 | Delete Custom Field            | Dialog konfirmasi (data user hilang permanen); log                              |    P0     |
| UCF-05 | Activate/Deactivate            | Toggle (row) + Bulk Activate/Deactivate; dialog konfirmasi deactivate; log      |    P1     |
| UCF-06 | Changelog + Activity Log       | Modal history; sinkron 3 surface                                                |    P1     |
| UCF-07 | Download                       | Export CSV/XLSX, toast error only                                               |    P1     |
| UCF-08 | Value Setting badge (Dropdown) | Badge tiap value di kolom Value Setting, maks 2 + "+N More" → popup semua badge |    P2     |

---

## 9. Constraints

- **6 tipe data**: Text (≤120), Text Area (≤360), Dropdown (single), Date, Numeric (≤15, decimal 0/1/2), Phone (Country Code + ≤15 digit numerik dihitung setelah kode, §4.3 — katalog Country Code platform-wide, tidak per-client)
- **Keunikan Field Name per-entitas** (case-insensitive, setelah trim)
- **Bulk action = Activate/Deactivate saja** (mirror pola Position/Division/User untuk toggle massal); **Bulk Delete tetap tidak ada** — Delete cuma row-level (data user hilang permanen per field, terlalu destruktif untuk bulk)
- **Deactivate menyembunyikan, tidak menghapus** — data user untuk field itu tetap tersimpan, kembali muncul saat di-reactivate (berlaku sama untuk row-level maupun Bulk Deactivate)
- **Delete menghapus permanen** — field + seluruh data user untuk field ini hilang, tidak bisa di-undo
- **Ganti Data Type mereset data** — semua value user untuk field ini di-reset ke kosong, wajib dialog peringatan
- **Required retroaktif = flag visual saja** — mengubah Required ke `Yes` tidak memblokir user lama yang datanya kosong, hanya menandai
- **Tidak ada plan gating** — tunduk **Master Data Count Limit** platform-wide (default 10.000/entitas), bukan cap per-plan
- **Capability dibagi dengan User, Position & Division** — "Manage user and role" men-gate keempat modul sekaligus
- **Urut tampil selalu abjad** (by Field Name) — tidak ada opsi sort lain
- **Tidak ada toggle Active di form Create/Edit** — field baru selalu Active = On otomatis; status diatur eksklusif lewat toggle kolom tabel (kolom pertama, mirror `user/`)

---

## 10. Open Items

- Tidak ada. Isi Tooltip Data Type memakai batas baku Text ≤120, Text Area ≤360 (§4.2/§5) — lihat `02-ui-design.md` §2.2 "Tooltip: Data Type".
