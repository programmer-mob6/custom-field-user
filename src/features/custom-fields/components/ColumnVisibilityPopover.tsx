import { Settings2 } from "lucide-react";
import { PopoverRoot, PopoverTrigger, PopoverPositioner, PopoverContent } from "@chakra-ui/react";
import type { ColumnKey } from "../types/customField.types";

const columnLabels: Record<ColumnKey, string> = {
  dataType: "Data Type",
  valueSetting: "Value Setting",
  required: "Required",
  updatedAt: "Last Update",
};

type Props = {
  hiddenColumns: Set<ColumnKey>;
  onToggle: (key: ColumnKey) => void;
};

export function ColumnVisibilityPopover({ hiddenColumns, onToggle }: Props) {
  return (
    <PopoverRoot positioning={{ placement: "bottom-end" }}>
      <PopoverTrigger asChild>
        <button className="tool-button">
          <Settings2 size={18} /> Columns
        </button>
      </PopoverTrigger>
      <PopoverPositioner>
        <PopoverContent className="columns-popover">
          <b>Column Visibility</b>
          {(Object.keys(columnLabels) as ColumnKey[]).map((key) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={!hiddenColumns.has(key)}
                onChange={() => onToggle(key)}
              />{" "}
              {columnLabels[key]}
            </label>
          ))}
        </PopoverContent>
      </PopoverPositioner>
    </PopoverRoot>
  );
}
