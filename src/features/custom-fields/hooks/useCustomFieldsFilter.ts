import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { dataTypes, type CustomField, type DataType } from "../types/customField.types";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";

type TypeFilter = DataType | "all";
type StatusFilter = "all" | "active" | "inactive";
type RequiredFilter = "all" | "yes" | "no";

const statusValues = ["all", "active", "inactive"] as const;
const requiredValues = ["all", "yes", "no"] as const;

const readType = (value: string | null): TypeFilter =>
  value && dataTypes.includes(value as DataType) ? (value as DataType) : "all";
const readStatus = (value: string | null): StatusFilter =>
  statusValues.includes(value as StatusFilter) ? (value as StatusFilter) : "all";
const readRequired = (value: string | null): RequiredFilter =>
  requiredValues.includes(value as RequiredFilter) ? (value as RequiredFilter) : "all";

// Filters live in the URL (not Zustand, not plain useState) so the current
// view is shareable/bookmarkable and survives a refresh — 4 low-cardinality
// fields here, nowhere near the ~2000-char URL limit browsers/proxies
// enforce. If this ever grows into many free-form fields (a full query
// builder, saved views, etc.), that's the point to switch to a "Filter ID"
// pattern instead: persist the filter config server-side and put only a
// short id in the URL (?filter=abc123), or a hybrid where Zustand holds the
// live config and the URL holds just the id needed to rehydrate it.
export function useCustomFieldsFilter(fields: CustomField[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  // Raw keystrokes stay local (instant, no URL/history churn); only the
  // settled, debounced value gets synced to the URL.
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const debouncedSearch = useDebouncedValue(search);

  const type = readType(searchParams.get("type"));
  const status = readStatus(searchParams.get("status"));
  const required = readRequired(searchParams.get("required"));

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

  useEffect(() => {
    setParam("q", debouncedSearch);
  }, [debouncedSearch, setParam]);

  const setType = (value: TypeFilter) => setParam("type", value);
  const setStatus = (value: StatusFilter) => setParam("status", value);
  const setRequired = (value: RequiredFilter) => setParam("required", value);

  const filtered = useMemo(
    () =>
      fields
        .filter((field) => {
          const query = debouncedSearch.toLowerCase();
          return (
            (!query ||
              [field.fieldName, field.dataType, field.required ? "yes" : "no"].some((value) =>
                value.toLowerCase().includes(query),
              )) &&
            (type === "all" || field.dataType === type) &&
            (status === "all" || (status === "active") === field.isActive) &&
            (required === "all" || (required === "yes") === field.required)
          );
        })
        .sort((a, b) => a.fieldName.localeCompare(b.fieldName, "en", { sensitivity: "base" })),
    [fields, debouncedSearch, type, status, required],
  );

  const clearFilters = () => {
    setSearch("");
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("q");
        next.delete("type");
        next.delete("status");
        next.delete("required");
        return next;
      },
      { replace: true },
    );
  };

  return {
    search,
    setSearch,
    type,
    setType,
    status,
    setStatus,
    required,
    setRequired,
    filtered,
    clearFilters,
  };
}
