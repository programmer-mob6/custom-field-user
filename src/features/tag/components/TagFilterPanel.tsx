import { X } from "lucide-react";
import { SelectFilter } from "../../../shared/components/SelectFilter";
import { tagSources, tagStatuses, type TagSource, type TagStatus } from "../types/tag.types";

type Props = {
  source: TagSource | "all";
  setSource: (value: TagSource | "all") => void;
  status: TagStatus | "all";
  setStatus: (value: TagStatus | "all") => void;
  onClear: () => void;
};

// PRD's Filter Panel also has Device Name (needs a Device Catalog this demo
// doesn't have) and a Last Scanned date picker (no date-picker component in
// this codebase) — both explicit scope cuts. TAG Type/Type are intentionally
// NOT here: the counter cards already cover that dimension (02-ui-design.md).
export function TagFilterPanel({ source, setSource, status, setStatus, onClear }: Props) {
  return (
    <div className="filter-panel">
      <SelectFilter
        label="Source"
        value={source}
        onChange={setSource}
        options={[
          { value: "all", label: "All sources" },
          ...tagSources.map((value) => ({ value, label: value })),
        ]}
      />
      <SelectFilter
        label="TAG Status"
        value={status}
        onChange={setStatus}
        options={[
          { value: "all", label: "All statuses" },
          ...tagStatuses.map((value) => ({ value, label: value })),
        ]}
      />
      <button className="clear-filter" onClick={onClear}>
        <X size={15} /> Clear filters
      </button>
    </div>
  );
}
