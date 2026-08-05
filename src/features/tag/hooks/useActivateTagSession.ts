import { useMemo, useState } from "react";
import { useToastStore } from "../../../shared/store/toastStore";
import { collisionCodes, officialStock, raceActivatedCodes } from "../data/activateTagSeed";
import { useTagStore, type ActivatedTag } from "../store/tagStore";
import type {
  ActivatableTagType,
  CommitOutcome,
  StagingRow,
  TagIdentity,
} from "../types/activateTag.types";
import type { QuotaCategory, TagCategory } from "../types/tag.types";

export const BYO_DISABLED_REASON =
  "Not in your official stock; self-purchased activation is not enabled for your account. Contact your administrator.";
export const QUOTA_REASON = "License limit reached.";

export type QuotaShortfall = {
  category: QuotaCategory;
  label: string;
  need: number;
  available: number;
};

export type SubmitResult =
  | { kind: "insufficient-quota"; shortfalls: QuotaShortfall[] }
  | { kind: "committed"; activated: number; waiting: number; failed: number };

const QUOTA_LABELS: Record<QuotaCategory, string> = {
  "rfid-object": "RFID – Object TAG",
  "rfid-user": "RFID – User TAG",
  nfc: "NFC",
  qr: "QR",
  ble: "BLE",
  gps: "GPS",
};

// Which license pool a row draws from. RFID is the only type with two pools,
// so it stays unresolved until the row's Type is known (PRD §3.2).
export function quotaCategoryFor(
  tagType: ActivatableTagType,
  category: TagCategory | null,
): QuotaCategory | null {
  if (tagType === "RFID") {
    if (category === "User TAG") return "rfid-user";
    if (category === "Object TAG") return "rfid-object";
    return null;
  }
  return tagType.toLowerCase() as QuotaCategory;
}

export const emptyIdentity: TagIdentity = {
  deviceName: "",
  sku: null,
  brand: "",
  modelType: "",
  category: null,
};

export function useActivateTagSession() {
  const tags = useTagStore((state) => state.tags);
  const quotas = useTagStore((state) => state.quotas);
  const byoEnabled = useTagStore((state) => state.byoActivationEnabled);
  const activateTags = useTagStore((state) => state.activateTags);
  const notify = useToastStore((state) => state.notify);

  const [tagType, setTagTypeState] = useState<ActivatableTagType | null>(null);
  const [template, setTemplate] = useState<TagIdentity | null>(null);
  const [rows, setRows] = useState<StagingRow[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // Quota already consumed by the registry, per pool. Retired TAGs release
  // their slot; everything else (including Damaged/Missing) still counts.
  const registryUsage = useMemo(() => {
    const usage = {} as Record<QuotaCategory, number>;
    for (const tag of tags) {
      if (tag.status === "Retired" || tag.tagType === "QR") continue;
      const category = quotaCategoryFor(tag.tagType as ActivatableTagType, tag.category);
      if (category) usage[category] = (usage[category] ?? 0) + 1;
    }
    return usage;
  }, [tags]);

  const remainingFor = (category: QuotaCategory) =>
    quotas[category] - (registryUsage[category] ?? 0);

  // Rows already staged also hold a slot, so the Nth scan of a session sees
  // the quota the first N-1 rows left behind.
  const stagedCountFor = (category: QuotaCategory, source: StagingRow[]) =>
    source.filter(
      (row) =>
        row.badge !== "Error" && quotaCategoryFor(row.tagType, row.identity.category) === category,
    ).length;

  // Re-runs the quota guard for one row against everything else on the table.
  const applyQuotaGuard = (row: StagingRow, others: StagingRow[]): StagingRow => {
    const category = quotaCategoryFor(row.tagType, row.identity.category);
    if (!category) return row;
    if (stagedCountFor(category, others) >= remainingFor(category)) {
      return { ...row, badge: "Error", errorReason: QUOTA_REASON };
    }
    return row;
  };

  const setTagType = (next: ActivatableTagType) => {
    setTagTypeState(next);
    setTemplate(null);
    setRows([]);
    setEditingRowId(null);
  };

  // The real-time match-check that runs per scanned identifier. Returns false
  // when the identifier is rejected outright and never reaches the table.
  const addScannedCode = (code: string): boolean => {
    if (!tagType) return false;

    if (tags.some((tag) => tag.code === code)) {
      notify("Error, TAG is already activated.", "error");
      return false;
    }
    if (rows.some((row) => row.code === code)) {
      notify("This TAG is already in the list.", "error");
      return false;
    }

    const unit = officialStock.find((item) => item.code === code && item.tagType === tagType);
    let row: StagingRow;

    if (unit) {
      row = {
        id: `row-${code}`,
        code,
        tagType,
        badge: "Official",
        identity: {
          deviceName: unit.deviceName,
          sku: unit.sku,
          brand: unit.brand,
          modelType: unit.modelType,
          category: unit.isUserTag ? "User TAG" : "Object TAG",
        },
        errorReason: null,
        outcome: null,
        failureReason: null,
      };
    } else if (!byoEnabled) {
      row = {
        id: `row-${code}`,
        code,
        tagType,
        badge: "Error",
        identity: emptyIdentity,
        errorReason: BYO_DISABLED_REASON,
        outcome: null,
        failureReason: null,
      };
    } else if (template) {
      // Snapshot, not a live binding — editing the template later must not
      // rewrite rows that already exist (PRD §7.8, "tidak retroaktif").
      row = {
        id: `row-${code}`,
        code,
        tagType,
        badge: "Self-Purchased",
        identity: { ...template },
        errorReason: null,
        outcome: null,
        failureReason: null,
      };
    } else {
      row = {
        id: `row-${code}`,
        code,
        tagType,
        badge: "Needs Info",
        identity: { ...emptyIdentity },
        errorReason: null,
        outcome: null,
        failureReason: null,
      };
    }

    setRows((current) => [...current, applyQuotaGuard(row, current)]);
    return true;
  };

  // Remove is scan-based for RFID/NFC/BLE: the identifier is re-scanned and
  // the matching staging row disappears (PRD §7.8).
  const removeByCode = (code: string): boolean => {
    const matches = (row: StagingRow) => row.code === code && !row.outcome;
    // Decided against the current rows rather than inside the updater, so the
    // caller gets the answer now instead of after the next render.
    if (!rows.some(matches)) return false;
    setRows((current) => current.filter((row) => !matches(row)));
    return true;
  };

  // Saving a resolved identity turns the row Self-Purchased, then re-checks
  // quota — for RFID the pool was genuinely unknowable until Type was picked.
  const saveRowIdentity = (rowId: string, identity: TagIdentity) => {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;
        const updated: StagingRow = {
          ...row,
          badge: "Self-Purchased",
          identity,
          errorReason: null,
        };
        return applyQuotaGuard(
          updated,
          current.filter((other) => other.id !== rowId),
        );
      }),
    );
    setEditingRowId(null);
  };

  const pendingRows = rows.filter((row) => !row.outcome);
  const hasNeedsInfo = pendingRows.some((row) => row.badge === "Needs Info");
  const committableRows = pendingRows.filter((row) => row.badge !== "Error");
  const canSubmit = committableRows.length > 0 && !hasNeedsInfo && !editingRowId;

  const submit = (): SubmitResult => {
    // Langkah 0 — aggregate quota pre-check. Short in any pool and the whole
    // submit is cancelled; this is never a partial commit.
    const needed = {} as Record<QuotaCategory, number>;
    for (const row of committableRows) {
      const category = quotaCategoryFor(row.tagType, row.identity.category);
      if (category) needed[category] = (needed[category] ?? 0) + 1;
    }
    const shortfalls: QuotaShortfall[] = [];
    for (const [category, need] of Object.entries(needed) as [QuotaCategory, number][]) {
      const available = remainingFor(category);
      if (need > available) {
        shortfalls.push({ category, label: QUOTA_LABELS[category], need, available });
      }
    }
    if (shortfalls.length > 0) return { kind: "insufficient-quota", shortfalls };

    // Per-row commit — these failures are genuinely independent, so one bad
    // row does not stop the others (partial commit).
    const outcomes = new Map<string, { outcome: CommitOutcome; reason: string | null }>();
    const activated: ActivatedTag[] = [];

    for (const row of committableRows) {
      if (raceActivatedCodes.has(row.code)) {
        outcomes.set(row.id, {
          outcome: "Failed",
          reason: "This identifier has already been activated.",
        });
        continue;
      }
      if (row.badge === "Self-Purchased" && collisionCodes.has(row.code)) {
        outcomes.set(row.id, { outcome: "Waiting for Approval", reason: null });
        continue;
      }
      outcomes.set(row.id, { outcome: "Activated", reason: null });
      activated.push({
        code: row.code,
        tagType: row.tagType,
        deviceName: row.identity.deviceName,
        sku: row.identity.sku,
        brand: row.identity.brand,
        modelType: row.identity.modelType,
        source: row.badge === "Official" ? "Official" : "Self-Purchased",
        category: row.identity.category ?? "Object TAG",
      });
    }

    if (activated.length > 0) activateTags(activated);

    setRows((current) =>
      current.map((row) => {
        const result = outcomes.get(row.id);
        if (!result) return row;
        return { ...row, outcome: result.outcome, failureReason: result.reason };
      }),
    );

    const counts = [...outcomes.values()];
    return {
      kind: "committed",
      activated: counts.filter((item) => item.outcome === "Activated").length,
      waiting: counts.filter((item) => item.outcome === "Waiting for Approval").length,
      failed: counts.filter((item) => item.outcome === "Failed").length,
    };
  };

  return {
    tagType,
    setTagType,
    template,
    setTemplate,
    rows,
    editingRowId,
    setEditingRowId,
    byoEnabled,
    addScannedCode,
    removeByCode,
    saveRowIdentity,
    hasNeedsInfo,
    canSubmit,
    submit,
    remainingFor,
  };
}
