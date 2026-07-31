## 2. UI Design Requirements

> Ditujukan untuk: **Claude Design / UI Designer**
> Copy/string UI: **Bahasa Inggris**
> Konvensi platform: lihat `TAG-Samurai/_foundation/prd-conventions.md`

---

### 2.1 Pages & Components

| Page / Component               | Type                     | Akses dari                                  |
| ------------------------------ | ------------------------ | ------------------------------------------- |
| Custom Field — List            | Tab (dalam halaman User) | Global Settings > User > tab "Custom Field" |
| Popup Create/Edit Custom Field | Modal                    | Button "+ Custom Field" / Row action "Edit" |

---

### 2.2 Layout & Wireframe Spec

**Tab: Custom Field** (di halaman `Global Settings > User`, sejajar tab User List/Position/Division — `user/02-ui-design.md` §2.1a)

```
[Breadcrumb: User]
[Tabs: User List | Position | Division | Custom Field]  ← tab "Custom Field" aktif
├── TableTools Toolbar [right-aligned]
│   ├── Icon: Search → reveal: search input "Search field name..." — cakupan §9.1a
│   │     prd-conventions.md: SEMUA kolom kecuali tanggal — Field Name, Data Type, Value Setting,
│   │     Required. Active (toggle, §9.4) dan Last Update tidak tercakup (toggle & tanggal,
│   │     eksklusif ke Filter)
│   ├── Icon: Filter → reveal: Filter Panel
│   │   ├── Dropdown: "Data Type"  [multi-select]  (placeholder: "All types")
│   │   ├── Dropdown: "Required"   [Yes / No]  (placeholder: "All")
│   │   ├── Dropdown: "Active"     [Active / Inactive]  (placeholder: "All statuses")
│   │   └── Date picker: "Last Updated"  [single date]
│   ├── Icon: Download → overlay: "Download as CSV" / "Download as XLSX"
│   │   └── Filename: "Custom-Fields"
│   ├── Icon: Changelog → modal: Changelog
│   └── Button: "+ Custom Field"  [primary]
├── Table (sorted alphabetically by Field Name)
│   ├── Columns: Active (toggle) | Field Name | Data Type | Value Setting | Required | Last Update | Actions
│   │   (Active adalah kolom PERTAMA, mirror pola User List `user/02-ui-design.md`)
│   │   ├── "Actions" header (⋯) — klik = trigger Column Visibility (§9.3 prd-conventions.md); body cell tetap berisi row action menu
│   │   ├── Column "Value Setting" display:
│   │   │   ├── Dropdown → badge tiap value (maks **2** badge tampil inline); >2 value → 2 badge pertama + chip `"+N More"`
│   │   │   │     └── Klik chip `"+N More"` → popup kecil menampilkan **semua** badge value field itu (read-only, tanpa edit)
│   │   │   ├── Numeric → "N decimal places"
│   │   │   └── Others → "—"
│   │   └── Row Actions: Edit, Delete
│   └── Bulk Action: checkbox select-row → bulk action bar `Activate` | `Deactivate` (kondisi tampil sama seperti `user/02-ui-design.md`: mixed → keduanya, homogen → yang berlawanan saja. Bulk Delete tetap TIDAK ada).
└── Empty state: Illustration + "No custom field yet" — tanpa button/CTA (tombol "+ Custom Field" tetap di toolbar)
```

**Example Data (mencakup semua kombinasi kondisi):**

| Active | Field Name       | Data Type | Value Setting                     | Required | Kondisi yang Didemokan                                                       |
| :----: | ---------------- | --------- | --------------------------------- | :------: | ---------------------------------------------------------------------------- |
|   ON   | Cost Center      | Dropdown  | `[Sales]` `[Marketing]` `+3 More` |   Yes    | Dropdown dengan >2 Values → 2 badge + "+N More", klik buka popup semua badge |
|   ON   | Grade            | Text      | —                                 |    No    | Text sederhana, opsional                                                     |
|  OFF   | Bonus Multiplier | Numeric   | 2 decimal places                  |    No    | Numeric nonaktif — disembunyikan dari form User                              |
|   ON   | Shift Type       | Dropdown  | `[Day]` `[Night]`                 |   Yes    | Dropdown dengan ≤2 Values → semua badge tampil langsung, tanpa "+N More"     |

**Row Actions (§23 `prd-conventions.md`):**

| Aksi     | Icon             | Severity |
| -------- | ---------------- | -------- |
| `Edit`   | `Edit2Line`      | dark     |
| `Delete` | `DeleteBin6Line` | danger   |

**Bulk Action Bar** (§8 `prd-conventions.md` — Activate/Deactivate via toggle statusnya juga tersedia sebagai bulk action; kondisi tampil lihat §2.2 di atas):

| Aksi         | Icon        | Severity |
| ------------ | ----------- | -------- |
| `Activate`   | `CloseLine` | dark     |
| `Deactivate` | `CheckLine` | danger   |

**Popup: All Values (klik chip "+N More" pada Value Setting)**

```
├── Title: "Values — [Field Name]"
├── Body: semua badge value field ini (read-only, tanpa aksi edit/hapus — edit Values tetap lewat popup Edit Custom Field)
└── Footer: [Close]
```

---

**Popup: Create / Edit Custom Field**

```
├── Header: "Create Custom Field" / "Edit Custom Field"
├── Field: Field Name*  [Text, max 120, unique case-insensitive]
├── Dropdown: Data Type*  🔖 [tooltip ℹ — lihat "Tooltip: Data Type" di bawah]
│   ├── Text
│   ├── Text Area
│   ├── Dropdown       → reveal: Values input [chip/badge, Enter to add, max 120 chars/value]  🔖
│   │                      Helper text (selalu tampil di bawah field): "Press enter to add new value or click the badge to edit"
│   ├── Date
│   ├── Numeric        → reveal: Decimal Places [radio: 0 / 1 / 2, default 0]
│   └── Phone
├── Toggle: Required  [default: No]
├── Footer:
│   ├── (Create only) Checkbox: "Stay on this form after submitting"
│   ├── Button: "Cancel"
│   └── Button: "Submit" / "Save"
└── On close with unsaved changes → Dialog: "You have unsaved changes. Are you sure you want to leave?" [Leave / Cancel]
```

> **Form Create/Edit tidak memiliki toggle Active** — field baru **otomatis Active = On** saat Create (tidak ada pilihan di form). Status Active/Inactive sepenuhnya dikelola lewat **toggle di kolom tabel** (§2.2 kolom pertama).

**Tooltip: Data Type** (ikon ℹ di sebelah label Data Type, hover/tap untuk detail tiap tipe; angka karakter mengikuti batas baku platform di §4.2/§5):

```
Text: A field that is suitable for short entries, such as brief descriptions or any information filled in free-form, with a maximum limit of 120 characters.

Text Area: A larger text field that is ideal for more extensive descriptions, notes, or detailed information, with a maximum limit of 360 characters.

Dropdown: Creates a list of predefined options, allowing users to select one option from the list. Useful for fields with a limited set of choices.

Date: Allows users to select a specific date from a calendar interface. Suitable for date-related information such as purchase dates, warranty expirations, and more.

Numeric: A field used for storing numerical values, ideal for quantities, measurements, or any numeric data. It supports a leading '-' for negative numbers and a decimal point for precision.

Phone: Used specifically for storing phone numbers. Users pick a country code and enter up to 15 digits — helps maintain consistency and ensures a standardized format for phone entries.
```

**Special behavior — Edit Data Type:**

- Changing Data Type with existing user data → dialog warning before save:
  `"Changing the data type will reset all existing values for this field. This action cannot be undone."` [Cancel / Change Data Type]

**Special behavior — Remove Dropdown value in use:**

- Deleting a value from the Values chip list that's currently selected by ≥1 user → warning dialog; value removed from field definition **and** from all users who selected it.

---

**Value Input — Phone (dynamic form Create/Edit User, User Detail edit; `01-overview.md` §4.3):**

```
├── [Field Name]*  (label field, sesuai definisi)
│   └── Input group (1 kontrol visual gabungan, pola "input with left addon"):
│       ├── Addon kiri (menempel, bagian dari border input yang sama): Dropdown searchable
│       │     "Country Code" — mis. "🇮🇩 +62" (placeholder: "+00"), collapsed jadi kode saja
│       │     (bukan nama negara) begitu terpilih supaya hemat ruang
│       └── Input text (menyatu ke kanan addon, 1 border bersama): "Phone number"
│             [numeric only, ≤15 digit] (placeholder: "812345678901234")
```

- **1 kontrol visual** — addon Country Code dan input Number menyatu di 1 border/field yang sama (bukan 2 field terpisah dengan jarak/label sendiri-sendiri), pola umum "phone input with country code addon".
- Input Number **disabled** sampai Country Code dipilih (mencegah input angka tanpa konteks kode).
- Tampilan read-only (User Detail, sebelum edit): `"+[code] [number]"` mis. `"+62 812345678901234"`.

---

### 2.2b Column Visibility & Setup Column

Trigger: klik header kolom Actions (⋯) di tabel → dropdown "Column Visibility". Setup Column mendukung hide/unhide (kolom Locked di-grey-out), drag reorder, pin/unpin. Setting di-cache di browser per user (§9.3 `prd-conventions.md`).

| Column        | Default | Toggle     | Catatan                                                                    |
| ------------- | :-----: | ---------- | -------------------------------------------------------------------------- |
| Active        | Visible | 🔒 Locked  | Kontrol UI (toggle), selalu tampil sebagai kolom pertama                   |
| Field Name    | Visible | 🔒 Locked  | Identitas utama baris; max-width 240px, CSS ellipsis, 🔖 hover nilai penuh |
| Data Type     | Visible | ☑ Hideable | —                                                                          |
| Value Setting | Visible | ☑ Hideable | Badge Dropdown / "N decimal places" Numeric / `—` tipe lain                |
| Required      | Visible | ☑ Hideable | Yes/No                                                                     |
| Last Update   | Visible | ☑ Hideable | `—` jika belum pernah diubah                                               |

> Kolom Actions (⋯, trigger Column Visibility + row action Edit/Delete) tidak dicantumkan sebagai row di sini — bukan kolom berisi data, cuma kontrol UI (§9.3 `prd-conventions.md`).

---

### 2.3 Component States

| State            | Kondisi                   | Tampilan                                           |
| ---------------- | ------------------------- | -------------------------------------------------- |
| Loading          | Fetch data                | Skeleton rows                                      |
| Empty            | Belum ada custom field    | Illustration + `"No custom field yet"` — tanpa CTA |
| Empty — filtered | Filter/search tanpa hasil | `"No results found"`                               |
| Error            | Fetch gagal               | `"Failed to load data"` + `[Retry]`                |
| Populated        | Data tersedia             | Tabel normal + pagination                          |

**Toggle Active (inline di tabel)**

| State    | Tampilan                                                         |
| -------- | ---------------------------------------------------------------- |
| ON       | Toggle hijau/aktif                                               |
| OFF      | Toggle abu-abu/nonaktif                                          |
| Disabled | Toggle abu-abu, tidak bisa diinteraksi (tanpa capability Update) |

**Pagination**

- Default: 10 baris per halaman; pilihan: 10 / 25 / 50 / 100
- Input nomor halaman → tekan Enter → langsung navigasi ke halaman tersebut

---

### 2.4 Interaction Patterns

- Klik `[+ Custom Field]` → popup "Create Custom Field"
- Pilih Data Type → reveal field tambahan sesuai tipe (Values untuk Dropdown, Decimal Places untuk Numeric)
- Toggle Active (row) → jika deactivating: Dialog `"Deactivating this field will hide it and its data from all user forms. You can reactivate it later."` [Cancel / Deactivate]
- Klik "Delete" (row) → Dialog title `"Delete Custom Field"`, body: `"- [Field Name]\nAll user data for this field will be permanently lost.\nThis action cannot be undone. Are you sure you want to delete it?"` [Cancel / Delete]
- Hapus value dropdown yang sedang dipakai → Dialog warning: value dihapus dari semua user yang memilihnya
- Submit (valid) + "Stay on this form" checked → modal tetap, form reset, toast `"Success, Custom Field has been created."` (§6 `01-overview.md`)
- Submit (valid) + "Stay on this form" unchecked → modal tertutup, toast `"Success, Custom Field has been created."`

---

### 2.5 Responsive & Accessibility

- Field Field Name: `aria-required="true"`, `aria-describedby` ke elemen error
- Dropdown Data Type: keyboard-navigable; reveal field tambahan tetap dalam tab order
- Chip input (Values): tambah via Enter, hapus via keyboard (Backspace saat fokus di chip terakhir atau tombol × per chip)
- Modal: focus trapped; Esc = tutup (kecuali dialog destruktif)
- Toggle Active accessible via keyboard focus (bukan hover-only)

---

### 2.6 Mobile Layout

**Card: Custom Field**

```
┌──────────────────────────────────────┐
│  [●] Cost Center  [Dropdown]    [⋯] │
│  Required: Yes                       │
└──────────────────────────────────────┘
```

Field di card:

- Baris 1: Active toggle + Field Name + Data Type badge + [⋯] icon (Active di depan, mirror urutan kolom desktop)
- Baris 2: Required: Yes/No

Row actions via [⋯]: Edit | Delete

**Toolbar Mobile:**

- [⋯] → bottom sheet: Column Visibility / Filter / Download
- [🔍] → expand inline search bar
- "+ Custom Field" → primary button tetap visible di bawah toolbar

**Modal Create/Edit (Mobile):** full-screen bottom sheet slide-up; form scrollable, footer sticky.

---

## Guided Tooltip Steps

> `page_key`: `gs-custom-field-user`

| Step | Target Element                      | Title                 | Description                                                                                                           |
| :--: | ----------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------- |
|  1   | Toolbar — `[+ Custom Field]` button | "Create Custom Field" | "Define additional fields for user profiles. These appear dynamically in the Create and Edit User forms."             |
|  2   | Table — Dropdown Data Type          | "Data Types"          | "Choose from 6 data types — Text, Text Area, Dropdown, Date, Numeric, or Phone — each with its own validation rules." |
|  3   | Table — toggle Active               | "Active Toggle"       | "Deactivating a field hides it and its data from all user forms. You can reactivate it later without losing data."    |

---

## 3. UI Visibility per Role

Kolom = tier/role aktor. State: Show / Hidden / Disabled 🔖 (wajib tooltip berisi alasan; lihat §18.5 prd-conventions.md).

| Elemen UI                              | Total Control |  Read Only  | Manage User (scoped) | Role lain |
| -------------------------------------- | :-----------: | :---------: | :------------------: | :-------: |
| `[+ Custom Field]` button              |     Show      |   Hidden    |         Show         |  Hidden   |
| Row action `Edit`                      |     Show      |   Hidden    |  Show (dalam scope)  |  Hidden   |
| Row action `Delete`                    |     Show      |   Hidden    |  Show (dalam scope)  |  Hidden   |
| Toggle Active                          |     Show      | Disabled 🔖 |  Show (dalam scope)  |  Hidden   |
| Search / Filter / Download / Changelog |     Show      |    Show     |         Show         |  Hidden   |

Lihat §18.4 prd-conventions.md untuk state definitions dan §18.6 untuk defense in depth.
