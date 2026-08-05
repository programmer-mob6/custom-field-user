# Wireframe — Halaman "Activate TAG" (visualisasi, bukan file resmi PRD)

> Referensi: `Global-Settings/PRD/tag/02-ui-design.md` § "Halaman: Activate TAG".
> Contoh di bawah pakai TAG Type = RFID (kasus paling kompleks — field Type cuma muncul untuk RFID).

---

## State 1 — Idle, Collapsible collapsed (default)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Global Settings > TAG > Activate TAG                                       │
│                                                                             │
│ Activate TAG                                        [How to activate a TAG]│
│                                                                             │
│ TAG Type*                                                                  │
│  (•) RFID    ( ) NFC    ( ) BLE    ( ) GPS                                 │
│  RFID licenses are split by Object TAG and User TAG — remaining quota     │
│  shown per SKU match, or below once you select a Type for self-purchased  │
│  TAGs.                                                                     │
│                                                                             │
│  [+ Add self-purchased template]        ← COLLAPSIBLE INI, masih tertutup  │
│                                                                             │
│ ─────────────────────────────────────────────────────────────────────────│
│                                                [Remove]      [Scan TAG]    │
│ Total Scanned: 0                                              [🕐 Event Log]│
│ ┌─────────────────────────────────────────────────────────────────────┐  │
│ │ TAG Type │ Code    │ Status │ Device Name │ SKU │ Brand │ Model/Type │ Actions │  │
│ ├─────────────────────────────────────────────────────────────────────┤  │
│ │                     (belum ada baris — tabel kosong)                │  │
│ └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│                                                    [Cancel]      [Submit]  │
└───────────────────────────────────────────────────────────────────────────┘
```

Di state ini: kalau langsung `[Scan TAG]` dan ada identifier yang **tidak match** stok resmi → baris jadi badge **"Needs Info"** (karena tidak ada Template yang bisa dipakai sebagai default).

---

## State 2 — Collapsible di-expand (`[− Remove template]`), SKU dikosongkan

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Activate TAG                                        [How to activate a TAG]│
│                                                                             │
│ TAG Type*                                                                  │
│  (•) RFID    ( ) NFC    ( ) BLE    ( ) GPS                                 │
│  RFID licenses are split by Object TAG and User TAG — ...                 │
│                                                                             │
│  [− Remove template]                     ← klik lagi = collapse & clear   │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │ Device Name*     [ Search and select device name...           ▼ ]│   │
│  │                                                                     │   │
│  │ SKU              [ Search and select SKU (optional)...        ▼ ]│   │
│  │                  Leave empty if this is a self-purchased TAG      │   │
│  │                  with no matching SKU.                             │   │
│  │                                                                     │   │
│  │  ── SKU dikosongkan → 2 field ini muncul ──                       │   │
│  │ Brand*           [ Enter brand                                  ]│   │
│  │ Model            [ Enter model (optional)                       ]│   │
│  │                                                                     │   │
│  │  ── SKU kosong DAN TAG Type = RFID → field ini juga muncul ──     │   │
│  │ Type*                                                              │   │
│  │  ( ) Object TAG    ( ) User TAG                                   │   │
│  │  (begitu salah satu dipilih →)                                    │   │
│  │  "[remaining] of [total] RFID – Object TAG licenses remaining."   │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ ─────────────────────────────────────────────────────────────────────────│
│                                                [Remove]      [Scan TAG]    │
│  ...(toolbar, tabel, footer — sama seperti State 1)                       │
└───────────────────────────────────────────────────────────────────────────┘
```

Di state ini: field terisi **sekali**, dipakai berulang. Kalau `[Scan TAG]` dan ada identifier **tidak match** → baris otomatis jadi badge **"Self-Purchased"**, kolom Device Name/SKU/Brand/Model/Type terisi dari Template ini (bukan tanya ulang per baris).

> Kalau SKU **diisi** (bukan dikosongkan): field Brand/Model/Type di atas **tidak muncul sama sekali** — Device Name+SKU saja sudah cukup, Type ikut derived dari data SKU.

---

## State 3 — Locked (`byo_activation_enabled=false` untuk Client ini)

```
│  [+ Add self-purchased template]  🔒        ← disabled, tidak bisa diklik │
│  (hover/tap → tooltip:)                                                   │
│  "Self-purchased activation is not enabled for your account.              │
│   Contact your administrator."                                            │
```

Di state ini: collapsible **tidak bisa** di-expand sama sekali. Kalau `[Scan TAG]` dan ada identifier tidak match → baris **langsung** jadi badge **"Error"** (karena tidak ada Template yang bisa dipakai, dan tidak ada jalan lain menyelamatkan baris itu selain di-Remove).

---

## Ringkasan alur pengambilan keputusan sistem (per baris hasil scan)

```
Identifier discan
    │
    ▼
Match tag_units (stok resmi)? ──Ya──► badge "Official" [biru]
    │ Tidak
    ▼
Template terisi (State 2)? ──Ya──► badge "Self-Purchased" [kuning] (pakai data Template)
    │ Tidak
    ▼
byo_activation_enabled = true? ──Ya──► badge "Needs Info" [yellow] (isi manual per-baris)
    │ Tidak (State 3, locked)
    ▼
badge "Error" [merah] (tidak bisa diselamatkan, cuma bisa di-Remove)
```
