import { X } from "lucide-react";
import { dataTypes, type DataType } from "../types/customField.types";
import { SelectFilter } from "../../../shared/components/SelectFilter";

type Props = {
  type: DataType | "all";
  setType: (value: DataType | "all") => void;
  status: "all" | "active" | "inactive";
  setStatus: (value: "all" | "active" | "inactive") => void;
  required: "all" | "yes" | "no";
  setRequired: (value: "all" | "yes" | "no") => void;
  onClear: () => void;
};

export function FilterPanel({
  type,
  setType,
  status,
  setStatus,
  required,
  setRequired,
  onClear,
}: Props) {
  return (
    <div className="filter-panel">
      <SelectFilter
        label="Data Type"
        value={type}
        onChange={setType}
        options={[
          { value: "all", label: "All types" },
          ...dataTypes.map((value) => ({ value, label: value.replace("_", " ") })),
        ]}
      />
      <SelectFilter
        label="Required"
        value={required}
        onChange={setRequired}
        options={[
          { value: "all", label: "All" },
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]}
      />
      <SelectFilter
        label="Active"
        value={status}
        onChange={setStatus}
        options={[
          { value: "all", label: "All statuses" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]}
      />
      <button className="clear-filter" onClick={onClear}>
        <X size={15} /> Clear filters
      </button>
    </div>
  );
}
