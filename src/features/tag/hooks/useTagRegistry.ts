import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { QUOTA_CATEGORIES } from "../data/quotaCategories";
import {
  quotaCategories,
  tagSources,
  tagStatuses,
  type QuotaCategory,
  type Tag,
  type TagRow,
  type TagSource,
  type TagStatus,
  type TagTab,
} from "../types/tag.types";

const TAB_STATUS_MATCH: Record<TagTab, (status: TagStatus) => boolean> = {
  all: () => true,
  paired: (status) => status === "Paired",
  "not-paired": (status) => status !== "Paired",
};

const readTab = (value: string | null): TagTab =>
  value === "paired" || value === "not-paired" ? value : "all";
const readSource = (value: string | null): TagSource | "all" =>
  value && tagSources.includes(value as TagSource) ? (value as TagSource) : "all";
const readStatus = (value: string | null): TagStatus | "all" =>
  value && tagStatuses.includes(value as TagStatus) ? (value as TagStatus) : "all";
const readCategories = (value: string | null): Set<QuotaCategory> =>
  new Set(
    (value ?? "")
      .split(",")
      .filter((entry): entry is QuotaCategory => quotaCategories.includes(entry as QuotaCategory)),
  );

const withCombinedFlag = (tags: Tag[]): TagRow[] => {
  const siblingCount = new Map<string, number>();
  for (const tag of tags) siblingCount.set(tag.tagCode, (siblingCount.get(tag.tagCode) ?? 0) + 1);
  return tags.map((tag) => ({ ...tag, isCombined: (siblingCount.get(tag.tagCode) ?? 0) > 1 }));
};

const searchableText = (tag: TagRow) =>
  [
    tag.code,
    tag.deviceName,
    tag.sku,
    tag.brand,
    tag.modelType,
    tag.tagType,
    tag.source,
    tag.category,
    tag.status,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

export function useTagRegistry(tags: Tag[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const debouncedSearch = useDebouncedValue(search);

  const tab = readTab(searchParams.get("tab"));
  const source = readSource(searchParams.get("source"));
  const status = readStatus(searchParams.get("status"));
  const activeCategories = readCategories(searchParams.get("categories"));

  const setParam = useCallback(
    (key: string, value: string) =>
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (!value || value === "all") next.delete(key);
          else next.set(key, value);
          return next;
        },
        { replace: true },
      ),
    [setSearchParams],
  );

  const setTab = (value: TagTab) => setParam("tab", value);
  const setSource = (value: TagSource | "all") => setParam("source", value);
  const setStatus = (value: TagStatus | "all") => setParam("status", value);

  const toggleCategory = (id: QuotaCategory) => {
    const next = new Set(activeCategories);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setParam("categories", [...next].join(","));
  };

  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return withCombinedFlag(tags).filter((tag) => {
      const matchesTab = TAB_STATUS_MATCH[tab](tag.status);
      const matchesCategories =
        activeCategories.size === 0 ||
        QUOTA_CATEGORIES.some(
          (category) => activeCategories.has(category.id) && category.matches(tag),
        );
      const matchesSource = source === "all" || tag.source === source;
      const matchesStatus = status === "all" || tag.status === status;
      const matchesQuery = !query || searchableText(tag).includes(query);
      return matchesTab && matchesCategories && matchesSource && matchesStatus && matchesQuery;
    });
  }, [tags, tab, activeCategories, source, status, debouncedSearch]);

  const clearFilters = () => {
    setSearch("");
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("q");
        next.delete("source");
        next.delete("status");
        next.delete("categories");
        return next;
      },
      { replace: true },
    );
  };

  return {
    tab,
    setTab,
    search,
    setSearch,
    activeCategories,
    toggleCategory,
    source,
    setSource,
    status,
    setStatus,
    filtered,
    clearFilters,
  };
}
