## 4. Data Requirements

> Ditujukan untuk: **Programmer (Backend)**
> Sort alfabetis (kolom text/nama) mengikuti `prd-conventions.md` §9.7 — wajib ICU collation `en-US` (`COLLATE "en-US-x-icu"`), bukan default binary/`C`.

### 4.1 Tabel: `gs_user_custom_fields`

| Field          | Type                                               | Required | Deskripsi                                                             |
| -------------- | -------------------------------------------------- | :------: | --------------------------------------------------------------------- |
| id             | UUID                                               |    ✓     | Primary key                                                           |
| entity_id      | FK → Entity (Client/Principal/Distributor/Partner) |    ✓     | Scope per entitas (`user/01-overview.md` §1.4a)                       |
| field_name     | Text (≤120)                                        |    ✓     | **Unik case-insensitive** per entitas, setelah trim                   |
| data_type      | Enum                                               |    ✓     | `text` \| `text_area` \| `dropdown` \| `date` \| `numeric` \| `phone` |
| values         | List<Text (≤120)>                                  |   ✗\*    | Wajib untuk `dropdown`, minimal 1                                     |
| decimal_places | Int (0\|1\|2)                                      |   ✗\*    | Untuk `numeric` (default 0)                                           |
| required       | Boolean                                            |    ✓     | Default `false`                                                       |
| is_active      | Boolean                                            |    ✓     | Default `true`                                                        |
| created_at     | DateTime                                           |    ✓     | Audit                                                                 |
| updated_at     | DateTime                                           |    ✓     | Audit (= Last Update)                                                 |
| created_by     | FK → User                                          |    —     | —                                                                     |
| updated_by     | FK → User                                          |    —     | —                                                                     |

**Constraint:**

```sql
CREATE UNIQUE INDEX uq_gs_user_custom_fields_name_per_entity
  ON gs_user_custom_fields (entity_id, LOWER(TRIM(field_name)));
```

### 4.2 Relasi

- **Custom Field ← User (value)**: value tersimpan di `users.custom_fields` (JSON map `{custom_field_id: value}`, owner tabel = `user/04-data.md` §5.1) — bukan tabel terpisah per field.
- **Delete Custom Field**: hapus definisi di `gs_user_custom_fields` **dan** hapus key terkait dari `users.custom_fields` semua user di entitas yang sama, dalam satu transaksi.
- **Deactivate Custom Field**: `is_active = false` — value di `users.custom_fields` **tidak disentuh**, hanya disembunyikan saat render form/detail (filter di query/serialization layer).
- **Ganti Data Type**: set semua key terkait di `users.custom_fields` entitas ini jadi `null` dalam transaksi yang sama dengan UPDATE `data_type`.

### 4.3 Validasi

| Field                             | Rule                                                                                                                                                                               | Pesan Error                                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| field_name                        | Required                                                                                                                                                                           | `Field Name must not be empty`                                                                                    |
| field_name                        | Trim spasi awal/akhir                                                                                                                                                              | `TRIM(field_name)` di BE sebelum INSERT/UPDATE                                                                    |
| field_name                        | Max 120 karakter (setelah trim)                                                                                                                                                    | `Max. 120 characters`                                                                                             |
| field_name                        | Karakter valid                                                                                                                                                                     | Name Fields blocklist (`prd-conventions.md` §"Karakter yang Diizinkan (Name Fields)")                             |
| field_name                        | Unik per-entitas (case-insensitive, setelah trim)                                                                                                                                  | `Field Name already exists`                                                                                       |
| values                            | Minimal 1, wajib untuk `dropdown`                                                                                                                                                  | `At least one value is required`                                                                                  |
| values (tiap item)                | Max 120 karakter                                                                                                                                                                   | `Max. 120 characters`                                                                                             |
| Value user — Text                 | Max 120 karakter                                                                                                                                                                   | `Max. 120 characters`                                                                                             |
| Value user — Text Area            | Max 360 karakter                                                                                                                                                                   | `Max. 360 characters`                                                                                             |
| Value user — Numeric              | Max 15 karakter                                                                                                                                                                    | `Max. 15 characters`                                                                                              |
| Value user — Numeric              | Bukan angka                                                                                                                                                                        | `[Field Name] must be a number`                                                                                   |
| Value user — Numeric              | Melebihi `decimal_places` field ini                                                                                                                                                | `[Field Name] must have at most [N] decimal place(s)`                                                             |
| Value user — Date                 | Format tidak valid                                                                                                                                                                 | `[Field Name] must be a valid date`                                                                               |
| Value user — Phone (Number)       | Max 15 karakter, dihitung **setelah** Country Code (`01-overview.md` §4.3)                                                                                                         | `Max. 15 characters`                                                                                              |
| Value user — Phone (Number)       | Hanya numerik                                                                                                                                                                      | `[Field Name] must be numeric`                                                                                    |
| Value user — Phone (Country Code) | Belum dipilih padahal Number terisi (atau sebaliknya), field Required                                                                                                              | `[Field Name] must not be empty`                                                                                  |
| Value user — Dropdown             | Harus exact-match salah satu `values` terdaftar                                                                                                                                    | `[value] is not a valid option for [Field Name]`                                                                  |
| Create                            | Master Data Count Limit tercapai (reflected dari `settings_system_limits.master_data_count_limit`, default 10.000/entitas — `plans-licensing-lifecycle-settings/04-data.md` §4.6b) | Dialog: `You've reached the platform limit of {limit} custom fields. Contact support if you need a higher limit.` |

### 4.4 Logging Schema

Lihat §7 di `01-overview.md` untuk tabel lengkap beserta semua variasi nilai.

| Surface                        | Kolom kunci                                                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Changelog (`gs_changelog`)     | `module='custom_field_user'`, `entity_id`, `action`, `field`, `old_value`, `new_value`, `actor_id`, `created_at` |
| System Log (`user_system_log`) | `menu='Custom Field'`, `action`, `detail`, `actor_id`, `created_at`                                              |
| Activity Log (`activity_log`)  | `module='Custom Field'`, `action`, `detail`, `actor_id`, `created_at`                                            |

> Ketiga surface ditulis dalam satu transaksi DB.

---

### 4.5 API Response Contract (M-2)

> Memenuhi `error-handling-convention.md` §6 & `data-contract-validation.md` Bagian A. Field nullable → null rendering §8 (`—`). Cross-link Edge Case Matrix D5 (`03-functional.md` §3.5).

**`GET /user-custom-fields` — Custom Field list (`02-ui-design.md` table)**

| Field name     | Type          | Nullable? | Source                                  | UI mapping                                                                                                                                                                                                                                                                                                                 |
| -------------- | ------------- | :-------: | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | string(UUID)  |    ❌     | DB: `gs_user_custom_fields.id`          | row key                                                                                                                                                                                                                                                                                                                    |
| `fieldName`    | string        |    ❌     | DB: `field_name`                        | kolom "Field Name"                                                                                                                                                                                                                                                                                                         |
| `dataType`     | enum          |    ❌     | DB: `data_type`                         | kolom "Data Type"                                                                                                                                                                                                                                                                                                          |
| `values`       | array<string> |    ✅     | DB: `values`                            | kolom "Value Setting" untuk `dataType = dropdown` — FE render sebagai badge: 2 pertama tampil inline, sisanya jadi chip `"+N More"` (klik → popup semua badge, §2.2 `02-ui-design.md`); null untuk tipe lain (koreksi 2026-07-15 — sebelumnya cuma string `"N values"`, sekarang array mentah supaya FE bisa render badge) |
| `valueSetting` | string        |    ✅     | derived: `"N decimal places"` (numeric) | kolom "Value Setting" untuk `dataType = numeric`; null untuk `dropdown` (pakai `values` di atas) dan tipe lain (`—`)                                                                                                                                                                                                       |
| `required`     | boolean       |    ❌     | DB: `required`                          | kolom "Required" (Yes/No)                                                                                                                                                                                                                                                                                                  |
| `isActive`     | boolean       |    ❌     | DB: `is_active`                         | kolom "Active" (toggle) — sekarang kolom **pertama** di tabel (koreksi 2026-07-15)                                                                                                                                                                                                                                         |
| `updatedAt`    | date(ISO)     |    ✅     | DB: `updated_at`                        | kolom "Last Update" — null → `—`                                                                                                                                                                                                                                                                                           |

> `valueSetting` adalah nilai **derived** yang dikembalikan endpoint (error-handling §6); FE tidak merakit. `values` untuk Dropdown **bukan** derived — array mentah dari DB (§4.1), FE yang menentukan cutoff 2-badge + "+N More" (presentasi, bukan transformasi data).

### 4.6 Validation Rules Table (M-3)

> Mengonsolidasikan `prd-conventions.md` §4–5 (rujuk pasal). §4.3 di atas adalah sumber; tabel ini menstrukturkan per-field dengan scope unik + timing.

**Form: Custom Field (Create & Edit)**

| Field            |    Required?     | Type/Format     | Min/Max     | Unique? (+scope)                            | Allowed chars   | Error message (EN)                                                                                              | Timing                                               | Default (Create vs Edit)               |
| ---------------- | :--------------: | --------------- | ----------- | ------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------- |
| `field_name`     |        ✅        | text            | `≤120` (§4) | ✅ **per-entitas**, case-insensitive (§4.3) | Name chars (§4) | empty: `"Field Name must not be empty"`; over: `"Max. 120 characters"`; dup: `"Field Name already exists"` (§4) | empty: setelah Submit; over: langsung; dup: debounce | Create: Placeholder · Edit: Pre-filled |
| `data_type`      |        ✅        | enum            | —           | —                                           | —               | —                                                                                                               | setelah Submit                                       | Create: kosong · Edit: Pre-filled      |
| `values`         | ✅ jika Dropdown | list<text ≤120> | min 1       | —                                           | Name chars (§4) | `"At least one value is required"`                                                                              | setelah Submit                                       | Create: kosong · Edit: Pre-filled      |
| `decimal_places` | ✅ jika Numeric  | enum (0/1/2)    | —           | —                                           | —               | —                                                                                                               | —                                                    | Create: `0`                            |
| `required`       |        ✅        | boolean         | —           | —                                           | —               | —                                                                                                               | —                                                    | Create: `No`                           |

> `field_name` unik **per-entitas** (case-insensitive) — selaras unique constraint DB §4.1 (error-handling §5.3). Boundary/duplicate dicakup Edge Case Matrix D5 (§3.5 `03-functional.md`). Double-submit guard untuk semua aksi tulis (error-handling §5.1).

### 4.7 SSE Events (§5.6a `error-handling-convention.md`)

| Event Name             | Trigger                                            | Payload tambahan (di luar §4.5) | Konsumen                                                                                         |
| ---------------------- | -------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------ |
| `custom_field.created` | Create Custom Field sukses                         | —                               | Custom Field List                                                                                |
| `custom_field.updated` | Edit Custom Field (rename/data_type/values) sukses | —                               | Custom Field List; User Detail Section "Custom Fields" (re-render label/opsi)                    |
| `custom_field.deleted` | Delete Custom Field sukses                         | —                               | Custom Field List; Import Staging Table (badge "Field deleted" — `import/02-ui-design.md` §2.1a) |
