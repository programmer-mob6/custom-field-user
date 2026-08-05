import { useState } from "react";
import { deviceCatalog, skuCatalog } from "../data/activateTagSeed";
import type { ActivatableTagType, TagIdentity } from "../types/activateTag.types";

// NFC/BLE/GPS have no Type choice at all — they are always Object TAG (§3.2).
function resolveIdentity(tagType: ActivatableTagType, draft: TagIdentity): TagIdentity {
  return { ...draft, category: tagType === "RFID" ? draft.category : "Object TAG" };
}

function missingFields(tagType: ActivatableTagType, draft: TagIdentity) {
  const skuLocked = draft.sku !== null;
  return {
    deviceName: !draft.deviceName,
    brand: !skuLocked && !draft.brand,
    category: !skuLocked && tagType === "RFID" && !draft.category,
  };
}

// Shared by the Self-Purchased Template and Row Edit Mode — both collect the
// same field-set under the same SKU-derivation rules (PRD §7.8).
export function useIdentityDraft(
  tagType: ActivatableTagType,
  initial: TagIdentity,
  onChange?: (identity: TagIdentity, isValid: boolean) => void,
) {
  const [draft, setDraft] = useState<TagIdentity>(initial);

  const commit = (next: TagIdentity) => {
    setDraft(next);
    const missing = missingFields(tagType, next);
    const isValid = !missing.deviceName && !missing.brand && !missing.category;
    onChange?.(resolveIdentity(tagType, next), isValid);
  };

  const update = (patch: Partial<TagIdentity>) => commit({ ...draft, ...patch });

  const skuOptions = skuCatalog.filter((entry) => entry.tagType === tagType);
  const missing = missingFields(tagType, draft);

  return {
    draft,
    resolved: resolveIdentity(tagType, draft),
    update,
    // Used when Row Edit Mode opens on a different row — the field-set is
    // reloaded from that row rather than remounted.
    reset: (next: TagIdentity) => setDraft(next),
    deviceOptions: deviceCatalog.filter((entry) => entry.tagType === tagType),
    skuOptions,
    skuLocked: draft.sku !== null,
    selectSku: (code: string) => {
      const option = skuOptions.find((entry) => entry.code === code);
      if (!option) {
        update({ sku: null });
        return;
      }
      update({
        sku: option.code,
        brand: option.brand,
        modelType: option.modelType,
        category: option.isUserTag ? "User TAG" : "Object TAG",
      });
    },
    // Clearing SKU resets the derived fields rather than restoring whatever was
    // typed before it — stale SKU data must not linger unnoticed (PRD §7.8).
    clearSku: () => update({ sku: null, brand: "", modelType: "", category: null }),
    missing,
    isValid: !missing.deviceName && !missing.brand && !missing.category,
  };
}

export type IdentityDraft = ReturnType<typeof useIdentityDraft>;
