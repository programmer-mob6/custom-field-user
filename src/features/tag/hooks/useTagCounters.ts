import { useMemo } from "react";
import { QUOTA_CATEGORIES } from "../data/quotaCategories";
import type { QuotaAllocation, QuotaCategoryConfig, Tag } from "../types/tag.types";

const NORMAL_STATUSES = new Set(["Available", "Reserved", "To be Returned"]);

export function useTagCounters(tags: Tag[], quotas: QuotaAllocation) {
  return useMemo(() => {
    const license = QUOTA_CATEGORIES.map((category) => {
      const matching = tags.filter((tag) => category.matches(tag));
      // QR's quota formula is genuinely different from the other 5 (PRD
      // 01-overview.md §4/§7.1): it's not a hardware stock quota, it's Paired
      // count against total Asset License — a permanent, documented
      // exception, not a pattern that needs to generalize further.
      const active =
        category.id === "qr"
          ? matching.filter((tag) => tag.status === "Paired").length
          : matching.filter((tag) => tag.status !== "Retired").length;
      return { ...category, active, total: quotas[category.id] };
    });

    const health = QUOTA_CATEGORIES.map((category) => {
      const matching = tags.filter((tag) => category.matches(tag));
      return {
        ...category,
        normal: matching.filter((tag) => NORMAL_STATUSES.has(tag.status)).length,
        damagedMissing: matching.filter((tag) => tag.status === "Damaged/Missing").length,
      };
    });

    return { license, health } satisfies {
      license: (QuotaCategoryConfig & { active: number; total: number })[];
      health: (QuotaCategoryConfig & { normal: number; damagedMissing: number })[];
    };
  }, [tags, quotas]);
}
