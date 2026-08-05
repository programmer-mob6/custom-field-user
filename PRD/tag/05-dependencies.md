## 5. Dependencies

### 5.1 Internal Dependencies

| Modul / Fitur | Hubungan |
|---------------|----------|
| Admin Console > TAG Stock *(baru)* | Sumber kebenaran TAG registry Jalur A (rfid_code, nfc_code, qr_code, ble_address, gps_imei, type, rfid_sku, nfc_sku, ble_sku, gps_sku); sumber license RFID/NFC/BLE/GPS per client (`stock_ledger`).<br>**Outbound (Activate TAG, fisik — RFID/NFC/BLE/GPS):** saat aktivasi sukses (Jalur A atau B), GS menulis `tag_units.status: active → in_use` + INSERT `tag_usage` (Jalur A) atau INSERT `tag_units` baru (Jalur B) secara atomik dengan INSERT baris `TAG` GS — GS adalah **satu-satunya penulis** event ini (menutup Open Item #1 `tag-stock/05-dependencies.md`, bagian fisik — lihat `03-functional.md` §3.2/§3.7). QR tidak memicu write ini (Open Item #2, tetap open).<br>**Outbound (status change):** saat status TAG berubah ke/dari Damaged/Missing (Audit GS atau transaksi FAMS/Supply), GS mengirim event untuk update `tag_units.client_reported_condition` (satu arah). Lihat `Admin-Console/PRD/tag-stock/04-data.md` §1.1c |
| Admin Console > Client Detail | Sumber `clients.byo_activation_enabled` (gate Jalur B, §5.1 `01-overview.md`) — setting yang sama dipakai Hardware |
| Admin Console > Approvals > TAG Stock | Review collision pure Jalur B (§5.1) — reuse Approval Foundation, approver Total Control + Additional Approver Principal |
| GS > User > Create/Edit User | Entry point Pairing/Usage TAG RFID via Pair User (§6 `01-overview.md`, hanya TAG sudah Active) |
| GS > Activity Log > User Action | Menerima log Activate, Combine, Separate, Audit |
| FAMS > TAG | Entry point Pairing/Usage (Audit, Combine, Change, Replace TAG) |
| FAMS > Register Asset | Entry point Pairing/Usage via Scan Object TAG |
| FAMS > Transaksi | Trigger perubahan status TAG: Paired / To be Returned / Damaged/Missing |
| Supply Asset > TAG | Entry point Pairing/Usage (Audit, Combine, Change, Replace TAG) |
| Supply Asset > Settings | Entry point Pairing/Usage (Group TAG, Item SKU TAG); trigger Retired / Un-retire |
| Supply Asset > Stock Management | Entry point Pairing/Usage (Stock Placement) |
| Supply Asset > Reception | Entry point Pairing/Usage |
| Supply Asset > Supplier Return / Internal Return | Entry point Pairing/Usage |
| Hardware > Handheld > Detail > Tagging | Dicatat setiap kali TAG di-scan melalui Handheld |
| User > Detail > Transaction Admin Log > TAG | Log lintas modul per user |
| Role (GS) | Kontrol akses via capability "Manage TAG" (Read = lihat; Update = Activate/Audit/Combine/Separate) |
| `_foundation/plans.md` §2.1 | SSOT plan gating — Starter = QR only, RFID/NFC/BLE/GPS 🔒 (menu tampil, aksi terkunci — bukan disembunyikan); QR hard cap = asset cap Starter. Nilai gating **tidak diduplikasi** di sini, hanya direferensikan (`03-functional.md` §3.5) |
| `Fixed-Asset/PRD/asset/03-functional.md` §3.5 | Referensi scope pairing BLE/GPS ke asset — dimiliki addon Tracking/Maps FAMS, **bukan** entry point scan-based §6 modul ini (`01-overview.md` §1.3) |

### 5.2 External Dependencies

| Library / Service | Platform | Fungsi |
|-------------------|----------|--------|
| RFID Scanner API | iOS & Android | Scan TAG RFID via BT Handheld Reader |
| NFC — CoreNFC | iOS (iPhone 7+) | Scan TAG NFC via built-in NFC chip |
| NFC — NfcAdapter | Android | Scan TAG NFC via built-in NFC chip |
| QR — AVFoundation / CameraX + MLKit | iOS / Android | Scan QR via kamera belakang. **Tidak dipakai untuk GPS** — registrasi TAG GPS bukan live scan sama sekali (`scan-foundation.md` §4.8/§5.6), lihat File Parser di bawah |
| CoreBluetooth / Bluetooth API | iOS / Android | Koneksi ke Handheld Reader via Bluetooth; dipakai juga untuk scan/pair TAG BLE (tracker), termasuk BLE LE scanning untuk daftar device discoverable — **tidak ada fallback manual entry** (§4.8 `scan-foundation.md`) |
| File Parser (CSV/XLSX) | Web & Mobile | Parsing file Upload untuk GPS Import (Activate TAG, §5.1 `01-overview.md`) — header `IMEI`; validasi format 15-digit & duplikat-dalam-batch (Preview) sebelum masuk match-check. Sama pola `Admin-Console/PRD/tag-stock/05-dependencies.md` |

**Izin yang dibutuhkan (mobile):**
- iOS: `NSCameraUsageDescription`, `NSBluetoothAlwaysUsageDescription`, NFC Entitlement
- Android: `CAMERA`, `BLUETOOTH_CONNECT` (API 31+), `NFC`

### 5.3 Breaking Changes / Catatan Lintas-Modul

- **Global uniqueness RFID/NFC/BLE/GPS**: `rfid_code`, `nfc_code`, `ble_address`, `gps_imei` unik lintas semua client. Validasi ini harus dilakukan di level database (unique constraint global), bukan hanya di application layer.
- **BLE/GPS parity (sesi ini)**: BLE dan GPS sebelumnya sepenuhnya di luar scope modul ini; sekarang mengikuti registry, License Counter, dan Activate TAG (Jalur A/B) identik RFID/NFC. Tiga pengecualian tetap: Combine & Separate (RFID/NFC/QR saja); pairing BLE/GPS ke asset (dimiliki addon Tracking/Maps FAMS, bukan entry point §6); dan Audit TAG — **BLE ikut, GPS tidak** (GPS tidak punya mekanisme re-scan, konsisten `tag-stock/01-overview.md` §5.4). Lihat `01-overview.md` §1.4, §3.1, §4, §5; `03-functional.md` §3.5.
- **Satu jalur aktivasi (revisi 2026-07-15)**: TAG baru **hanya** masuk registry lewat endpoint Activate TAG (Jalur A/B). Entry point scan lain (Audit, Combine, Pair User, Register Asset, Stock Placement, dst) **tidak lagi** memanggil endpoint discovery — mereka memanggil endpoint Pairing/Usage yang menolak identifier belum-aktivasi. Modul yang menambah entry point scan baru di masa depan mendaftar ke endpoint Pairing/Usage, bukan endpoint Activate.
- **Status sync bersifat event-driven**: FAMS dan Supply mengirim event ke GS saat status TAG berubah (Paired, To be Returned, Damaged, dll). GS tidak pull — ia menerima push dari produk.
- **Retired dikelola Supply**: GS menerima status Retired/Un-retire dari Supply via event — tidak bisa di-trigger dari GS sendiri.
- **Combine & Separate log ke semua produk**: saat submit Combine/Separate, Event Log harus dicatat di GS, FAMS, dan Supply sekaligus.
- **QR unik per client, bukan global**: berbeda dengan RFID/NFC/BLE/GPS yang global unique. QR bisa sama di client berbeda.

### 5.4 Open Items
- `[TODO]` Mekanisme event push dari FAMS/Supply ke GS — apakah via message queue, webhook, atau direct DB call?
- ✅ ~~Format `last_scanned_module` — nama modul menggunakan string bebas atau enum terdefinisi?~~ — **Resolved 2026-07-24**: free string (Text), bukan DB enum — nilai path menu kanonik dari daftar Entry Point §6 `01-overview.md`, konsisten aturan kolom `Object` di System Log/Activity Log (`prd-conventions.md` §8.2). Enum DB ditolak karena entry point lintas 3 produk (GS/FAMS/Supply) yang tumbuh independen (Supply PRD belum ditulis) — tiap entry point baru butuh migration kalau pakai enum. Detail di `04-data.md` §4.1. Berlaku sama untuk `registered_by_module`.
- ✅ ~~Apakah Search by Scan (tab All/Paired/Not Paired, §7.1 `01-overview.md`) menampilkan semua TAG yang match, atau hanya satu TAG pertama?~~ — **Resolved 2026-07-24: satu TAG.** Kode TAG (RFID/NFC/QR — teknologi yang didukung Search by Scan, §3 `03-functional.md`) bersifat unik secara global (§5.3 di atas), jadi hasil scan seharusnya selalu tepat 1 match — bukan skenario multi-hasil. Behavior tetap sesuai deskripsi existing (`03-functional.md` F-TAG-01/02/03): satu kode → satu baris ter-highlight/filter.
