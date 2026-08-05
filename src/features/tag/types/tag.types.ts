export const tagTypes = ["RFID", "NFC", "QR", "BLE", "GPS"] as const;
export type TagType = (typeof tagTypes)[number];

export const tagCategories = ["Object TAG", "User TAG"] as const;
export type TagCategory = (typeof tagCategories)[number];

export const tagSources = ["Official", "Self-Purchased"] as const;
export type TagSource = (typeof tagSources)[number];

export const tagStatuses = [
  "Available",
  "Paired",
  "Reserved",
  "To be Returned",
  "Damaged/Missing",
  "Retired",
] as const;
export type TagStatus = (typeof tagStatuses)[number];

export type Tag = {
  id: string;
  // Shared by every sibling row of one physically-combined TAG unit (e.g. an
  // RFID+NFC pair fused into one chip); unique for standalone TAGs.
  tagCode: string;
  tagType: TagType;
  code: string;
  deviceName: string | null;
  sku: string | null;
  brand: string | null;
  modelType: string | null;
  // null only for tagType === "QR" — QR never goes through Activate TAG, so
  // it never gets an Official/Self-Purchased source.
  source: TagSource | null;
  category: TagCategory;
  status: TagStatus;
  lastScannedAt: string | null;
  lastScannedModule: string | null;
};

// Derived at read time from tagCode grouping, never stored — see useTagRegistry.
export type TagRow = Tag & { isCombined: boolean };

export type TagTab = "all" | "paired" | "not-paired";

export const quotaCategories = ["rfid-object", "rfid-user", "nfc", "qr", "ble", "gps"] as const;
export type QuotaCategory = (typeof quotaCategories)[number];

export type QuotaAllocation = Record<QuotaCategory, number>;

export type QuotaCategoryConfig = {
  id: QuotaCategory;
  label: string;
  matches: (tag: Tag) => boolean;
};
