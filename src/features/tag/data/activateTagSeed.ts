import type { DeviceCatalogEntry, SkuOption, StockUnit } from "../types/activateTag.types";

// Units the distributor registered for this client but nobody has activated
// yet. Scanning one of these codes matches → badge "Official" (Jalur A).
export const officialStock: StockUnit[] = [
  {
    code: "RF-1101",
    tagType: "RFID",
    deviceName: "Alien Higgs-3 Inlay",
    sku: "SKU-RFID-H3",
    brand: "Alien Technology",
    modelType: "Higgs-3",
    isUserTag: false,
  },
  {
    code: "RF-1102",
    tagType: "RFID",
    deviceName: "Alien Higgs-3 Inlay",
    sku: "SKU-RFID-H3",
    brand: "Alien Technology",
    modelType: "Higgs-3",
    isUserTag: false,
  },
  {
    code: "RF-1103",
    tagType: "RFID",
    deviceName: "Impinj Monza R6",
    sku: "SKU-RFID-R6",
    brand: "Impinj",
    modelType: "Monza R6",
    isUserTag: false,
  },
  {
    code: "RF-1150",
    tagType: "RFID",
    deviceName: "Zebra Staff Card",
    sku: "SKU-RFID-CARD",
    brand: "Zebra",
    modelType: "UHF Staff Card",
    isUserTag: true,
  },
  {
    code: "RF-1151",
    tagType: "RFID",
    deviceName: "Zebra Staff Card",
    sku: "SKU-RFID-CARD",
    brand: "Zebra",
    modelType: "UHF Staff Card",
    isUserTag: true,
  },
  {
    code: "NF-2101",
    tagType: "NFC",
    deviceName: "NXP NTAG213",
    sku: "SKU-NFC-213",
    brand: "NXP",
    modelType: "NTAG213",
    isUserTag: false,
  },
  {
    code: "NF-2102",
    tagType: "NFC",
    deviceName: "NXP NTAG215",
    sku: "SKU-NFC-215",
    brand: "NXP",
    modelType: "NTAG215",
    isUserTag: false,
  },
  {
    code: "BLE-A1:B2:C3:D4:E5:11",
    tagType: "BLE",
    deviceName: "Estimote Beacon",
    sku: "SKU-BLE-EST",
    brand: "Estimote",
    modelType: "Proximity G1",
    isUserTag: false,
  },
  {
    code: "BLE-A1:B2:C3:D4:E5:12",
    tagType: "BLE",
    deviceName: "Estimote Beacon",
    sku: "SKU-BLE-EST",
    brand: "Estimote",
    modelType: "Proximity G1",
    isUserTag: false,
  },
];

// Codes the scan simulator can emit that are NOT in officialStock — they fall
// through to Self-Purchased / Needs Info / Error depending on the template.
export const unregisteredCodes: Record<string, string[]> = {
  RFID: ["RF-9001", "RF-9002", "RF-9003", "RF-9004"],
  NFC: ["NF-9001", "NF-9002", "NF-9003"],
  BLE: ["BLE-FF:EE:DD:CC:BB:01", "BLE-FF:EE:DD:CC:BB:02", "BLE-FF:EE:DD:CC:BB:03"],
  GPS: ["IMEI-356938035649001", "IMEI-356938035649002"],
};

// Identifiers another client already activated on the platform. Real-time
// check can't see this (it's cross-client); it only surfaces at commit, where
// the row becomes "Waiting for Approval" (F-TAG-12).
export const collisionCodes = new Set(["RF-9003", "NF-9003"]);

// Identifiers that a concurrent session commits just before this one — the
// race that produces a "Failed" row at commit (F-TAG-11).
export const raceActivatedCodes = new Set(["RF-9004"]);

export const deviceCatalog: DeviceCatalogEntry[] = [
  { name: "Alien Higgs-3 Inlay", tagType: "RFID" },
  { name: "Impinj Monza R6", tagType: "RFID" },
  { name: "Zebra Staff Card", tagType: "RFID" },
  { name: "Generic UHF Label", tagType: "RFID" },
  { name: "NXP NTAG213", tagType: "NFC" },
  { name: "NXP NTAG215", tagType: "NFC" },
  { name: "Generic NFC Sticker", tagType: "NFC" },
  { name: "Estimote Beacon", tagType: "BLE" },
  { name: "Generic BLE Beacon", tagType: "BLE" },
  { name: "Queclink GV55", tagType: "GPS" },
  { name: "Generic GPS Tracker", tagType: "GPS" },
];

export const skuCatalog: SkuOption[] = [
  {
    code: "SKU-RFID-H3",
    tagType: "RFID",
    brand: "Alien Technology",
    modelType: "Higgs-3",
    isUserTag: false,
  },
  {
    code: "SKU-RFID-R6",
    tagType: "RFID",
    brand: "Impinj",
    modelType: "Monza R6",
    isUserTag: false,
  },
  {
    code: "SKU-RFID-CARD",
    tagType: "RFID",
    brand: "Zebra",
    modelType: "UHF Staff Card",
    isUserTag: true,
  },
  { code: "SKU-NFC-213", tagType: "NFC", brand: "NXP", modelType: "NTAG213", isUserTag: false },
  { code: "SKU-NFC-215", tagType: "NFC", brand: "NXP", modelType: "NTAG215", isUserTag: false },
  {
    code: "SKU-BLE-EST",
    tagType: "BLE",
    brand: "Estimote",
    modelType: "Proximity G1",
    isUserTag: false,
  },
  {
    code: "SKU-GPS-GV55",
    tagType: "GPS",
    brand: "Queclink",
    modelType: "GV55",
    isUserTag: false,
  },
];
