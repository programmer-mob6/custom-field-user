import type { Dispatch, RefObject, SetStateAction } from "react";
import type { ColumnKey, CustomField } from "../types/customField.types";
import { Pagination } from "../../../shared/components/Pagination";
import { CustomFieldTable } from "./CustomFieldTable";

type Props = {
  filtered: CustomField[];
  selected: string[];
  setSelected: Dispatch<SetStateAction<string[]>>;
  hiddenColumns: Set<ColumnKey>;
  onEdit: (field: CustomField) => void;
  onDelete: (field: CustomField) => void;
  toggleActive: (field: CustomField) => void;
  setValueField: Dispatch<SetStateAction<CustomField | null>>;
  fieldsLength: number;
  page: number;
  pageInputRef: RefObject<HTMLInputElement | null>;
  setPage: Dispatch<SetStateAction<number>>;
};

export function FieldsTable({
  filtered,
  selected,
  setSelected,
  hiddenColumns,
  onEdit,
  onDelete,
  toggleActive,
  setValueField,
  fieldsLength,
  page,
  pageInputRef,
  setPage,
}: Props) {
  return (
    <div className="table-card">
      {filtered.length ? (
        <CustomFieldTable
          fields={filtered}
          selected={selected}
          setSelected={setSelected}
          hiddenColumns={hiddenColumns}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={toggleActive}
          onShowValues={setValueField}
        />
      ) : (
        <div className="empty">
          <span>◫</span>
          <h3>{fieldsLength ? "No results found" : "No custom field yet"}</h3>
          <p>Try adjusting your filters or create a new field.</p>
        </div>
      )}
      <Pagination
        filteredLength={filtered.length}
        totalLength={fieldsLength}
        itemLabel="custom fields"
        page={page}
        pageInputRef={pageInputRef}
        setPage={setPage}
      />
    </div>
  );
}
