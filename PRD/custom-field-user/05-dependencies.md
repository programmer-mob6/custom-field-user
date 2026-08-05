## 5. Dependencies

### 5.1 Internal Dependencies

| Modul / Fitur                                                          | Hubungan                                                                                                                                                                                                                                                                                                                                      | Catatan                                                                                   |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| User (GS)                                                              | Custom Field dirender dinamis di form Create/Edit User & User Detail; value tersimpan di `users.custom_fields`                                                                                                                                                                                                                                | `user/01-overview.md` §4.2-4.4, `user/04-data.md` §5.1                                    |
| Position (GS)                                                          | Modul saudara — dulu 1 sub-bagian bersama di modul "User"                                                                                                                                                                                                                                                                                     | Tidak ada relasi data langsung; sekadar berbagi capability "Manage user and role"         |
| Division (GS)                                                          | Modul saudara — sama pola pemisahan                                                                                                                                                                                                                                                                                                           | Tidak ada relasi data langsung                                                            |
| Role & Permission (GS)                                                 | Kontrol akses: Total Control = full CRUD; Read Only = view only; Capability "Manage user and role" = CRUD individual                                                                                                                                                                                                                          | `role/01-overview.md` §2.1                                                                |
| Activity Log (GS)                                                      | Menerima log Create/Update/Delete/Activate/Deactivate Custom Field                                                                                                                                                                                                                                                                            | —                                                                                         |
| Plans & Licensing > Lifecycle Settings > System Limits (Admin Console) | Modul Custom Field **membaca** (reflected) `master_data_count_limit` sebagai safety ceiling — tidak menyimpan salinan nilai                                                                                                                                                                                                                   | `plans-licensing-lifecycle-settings/01-overview.md` §6.8                                  |
| Import (GS)                                                            | Import Type "User" — kolom Custom Field Active ikut jadi field target Column Mapping & Staging Table. Edit (rename/Data Type)/Delete field selagi ada draft Import aktif yang mapping ke field itu → efek reflected read-time di Staging Table (rename aman, Data Type re-validasi ulang, Delete → kolom read-only + dikeluarkan dari commit) | `import/01-overview.md` §2.1a, `04-data.md` §4.2, §4.1 (`custom_field_id` sbg key stabil) |

### 5.2 External Dependencies

| Library / Service | Versi | Fungsi                                 |
| ----------------- | ----- | -------------------------------------- |
| —                 | —     | Tidak ada external dependency spesifik |

### 5.3 Data Flow

```
Global Settings > Custom Field (modul ini)
  ├── CRUD definisi ──────────────────────────────► gs_user_custom_fields (scope entity_id)
  ├── Render dinamis ◄─────────────────────────────  form Create/Edit User, User Detail
  ├── Value tersimpan di ──────────────────────────► users.custom_fields (JSON, owner = User)
  └── write actions ──────────────────────────► gs_changelog (module=custom_field_user)
                                               ► user_system_log (actor)
                                               ► activity_log (platform)

User (konsumen)
  └── Create/Edit User ─── isi value per Custom Field Active ──► users.custom_fields[field_id]
```

### 5.4 Breaking Changes / Catatan Lintas-Modul

- **Dipisah dari "User"** (2026-07-15): sebelumnya §4.7 di `user/01-overview.md` ("Custom Field", 1 sub-bagian dari 3 di modul User gabungan). Sekarang modul independen `custom-field-user/` (prefix `UCF`). Capability akses `manage_user_and_role` **tetap dibagi bersama** oleh `user/`, `position/`, `division/`, dan `custom-field-user/` — satu toggle men-gate semua empat modul.
- **Delete field → hapus data user permanen** — beda dari Deactivate yang reversible. Backend wajib jalankan sebagai satu transaksi (definisi + semua value user).
- **Ganti Data Type → reset semua value user untuk field itu** — wajib dialog peringatan di FE sebelum request dikirim.
- **Edit/Delete field TIDAK cascade ke `import_staging_row`** (Import, tabel berbeda) — draft Import yang masih aktif dan mapping ke field ini tetap menyimpan value lama apa adanya sampai Staging Table-nya dibuka lagi, baru re-check reflected (`import/01-overview.md` §2.1a). Ini disengaja (Import staging bersifat sementara/draft, bukan data final) — bukan gap yang perlu di-cascade proaktif.

### 5.5 Open Items

Tidak ada.
