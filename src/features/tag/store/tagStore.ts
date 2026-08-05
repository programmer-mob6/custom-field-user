import { create } from "zustand";
import { seedTags, seedQuotas } from "../data/seed";
import type { Tag, QuotaAllocation } from "../types/tag.types";

type Store = {
  tags: Tag[];
  quotas: QuotaAllocation;
};

// Read-only registry — no mutators. TAG entries only ever enter the registry
// through Activate TAG (out of scope for this demo), and the PRD itself
// forbids edit/delete on this registry entirely.
export const useTagStore = create<Store>(() => ({
  tags: seedTags,
  quotas: seedQuotas,
}));
