import { useRef, useState } from "react";
import type { ColumnKey, CustomField, ConfirmAction } from "../types/customField.types";

export function useCustomFieldsPageState() {
  const [selected, setSelected] = useState<string[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<Set<ColumnKey>>(new Set());
  const [editing, setEditing] = useState<CustomField | undefined>();
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const [valueField, setValueField] = useState<CustomField | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [page, setPage] = useState(1);
  // Uncontrolled until Enter: this mirrors the PRD's page-jump behavior.
  const pageInputRef = useRef<HTMLInputElement>(null);

  const toggleColumn = (key: ColumnKey) =>
    setHiddenColumns((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return {
    selected,
    setSelected,
    hiddenColumns,
    editing,
    setEditing,
    confirm,
    setConfirm,
    valueField,
    setValueField,
    showFilters,
    setShowFilters,
    showLog,
    setShowLog,
    page,
    setPage,
    pageInputRef,
    toggleColumn,
  };
}
