import type { TagCategory } from "./tag.types";

// QR is excluded on purpose — it never goes through Activate TAG, it's
// generated client-side under a separate asset cap (PRD 01-overview.md §1.4).
export const activatableTagTypes = ["RFID", "NFC", "BLE", "GPS"] as const;
export type ActivatableTagType = (typeof activatableTagTypes)[number];

export const stagingBadges = ["Official", "Self-Purchased", "Needs Info", "Error"] as const;
export type StagingBadge = (typeof stagingBadges)[number];

export const commitOutcomes = ["Activated", "Waiting for Approval", "Failed"] as const;
export type CommitOutcome = (typeof commitOutcomes)[number];

// The identity field-set collected once in the Self-Purchased Template, again
// per row in Row Edit Mode, and carried on every staging row.
export type TagIdentity = {
  deviceName: string;
  sku: string | null;
  brand: string;
  modelType: string;
  // Only RFID offers a choice; NFC/BLE/GPS are always Object TAG (PRD §3.2).
  category: TagCategory | null;
};

export type StagingRow = {
  id: string;
  code: string;
  tagType: ActivatableTagType;
  badge: StagingBadge;
  identity: TagIdentity;
  // Set only for badge "Error" — drives the row tooltip.
  errorReason: string | null;
  // Set once the session is submitted; the row is read-only from then on.
  outcome: CommitOutcome | null;
  failureReason: string | null;
};

// A unit the distributor already registered for this client. A scanned
// identifier matching one of these commits down Jalur A ("Official").
export type StockUnit = {
  code: string;
  tagType: ActivatableTagType;
  deviceName: string;
  sku: string | null;
  brand: string;
  modelType: string;
  isUserTag: boolean;
};

export type DeviceCatalogEntry = { name: string; tagType: ActivatableTagType };

export type SkuOption = {
  code: string;
  tagType: ActivatableTagType;
  brand: string;
  modelType: string;
  isUserTag: boolean;
};
