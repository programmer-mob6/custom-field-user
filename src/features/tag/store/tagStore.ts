import { create } from "zustand";
import { seedTags, seedQuotas } from "../data/seed";
import type { Tag, QuotaAllocation, TagCategory, TagSource } from "../types/tag.types";
import type { ActivatableTagType } from "../types/activateTag.types";

export type ActivatedTag = {
  code: string;
  tagType: ActivatableTagType;
  deviceName: string;
  sku: string | null;
  brand: string;
  modelType: string;
  source: TagSource;
  category: TagCategory;
};

type Store = {
  tags: Tag[];
  quotas: QuotaAllocation;
  // Whether this client may activate TAGs bought outside the distribution
  // chain (Jalur B). Server-owned in production; seeded here so the locked
  // Self-Purchased Template state stays reachable.
  byoActivationEnabled: boolean;
  activateTags: (entries: ActivatedTag[]) => void;
};

// Activate TAG is the registry's only writer — there is no edit and no delete,
// by design (PRD 01-overview.md §1.4).
export const useTagStore = create<Store>((set) => ({
  tags: seedTags,
  quotas: seedQuotas,
  byoActivationEnabled: true,
  activateTags: (entries) =>
    set((state) => ({
      tags: [
        ...state.tags,
        ...entries.map((entry, index) => ({
          id: `tag-act-${Date.now()}-${index}`,
          // Activation always produces a standalone unit; fusing identifiers
          // into one tagCode happens later, in Combine & Separate.
          tagCode: `unit-${Date.now()}-${index}`,
          tagType: entry.tagType,
          code: entry.code,
          deviceName: entry.deviceName,
          sku: entry.sku,
          brand: entry.brand,
          modelType: entry.modelType || null,
          source: entry.source,
          category: entry.category,
          status: "Available" as const,
          lastScannedAt: new Date().toISOString(),
          lastScannedModule: "Global Settings > TAG > Activate TAG",
        })),
      ],
    })),
}));
