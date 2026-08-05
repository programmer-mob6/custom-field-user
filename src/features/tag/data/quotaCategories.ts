import type { QuotaCategoryConfig } from "../types/tag.types";

// Single source of truth for the 6 quota categories — reused by the counter
// cards, the card-click filter, and the license/health count computation.
// New category? Add one entry here; nothing else needs to change.
export const QUOTA_CATEGORIES: QuotaCategoryConfig[] = [
  {
    id: "rfid-object",
    label: "RFID – Object TAG",
    matches: (tag) => tag.tagType === "RFID" && tag.category === "Object TAG",
  },
  {
    id: "rfid-user",
    label: "RFID – User TAG",
    matches: (tag) => tag.tagType === "RFID" && tag.category === "User TAG",
  },
  { id: "nfc", label: "NFC", matches: (tag) => tag.tagType === "NFC" },
  { id: "qr", label: "QR", matches: (tag) => tag.tagType === "QR" },
  { id: "ble", label: "BLE", matches: (tag) => tag.tagType === "BLE" },
  { id: "gps", label: "GPS", matches: (tag) => tag.tagType === "GPS" },
];
