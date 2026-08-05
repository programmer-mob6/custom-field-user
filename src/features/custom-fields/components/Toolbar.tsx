import type { Dispatch, SetStateAction } from "react";
import { useToastStore } from "../../../shared/store/toastStore";
import type { ColumnKey } from "../types/customField.types";
import { withPermission } from "../../../shared/components/withPermission";
import { Filter, Plus, Search, Download, History } from "lucide-react";
import { ColumnVisibilityPopover } from "../components/ColumnVisibilityPopover";
type Props = {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
  setShowLog: Dispatch<SetStateAction<boolean>>;
  hiddenColumns: Set<ColumnKey>;
  toggleColumn: (key: ColumnKey) => void;
  openCreate: () => void;
};

const CreateButton = withPermission(
  ({ onClick }: { onClick: () => void }) => (
    <button className="button primary create-button" onClick={onClick}>
      <Plus size={18} /> Custom Field
    </button>
  ),
  "create",
);

export function Toolbar({
  search,
  setSearch,
  showFilters,
  setShowFilters,
  setShowLog,
  hiddenColumns,
  toggleColumn,
  openCreate,
}: Props) {
  const notify = useToastStore((state) => state.notify);
  return (
    <div className="toolbar">
      <div className="toolbar-tools">
        <div className="search">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search field name..."
          />
        </div>
        <button
          className={`tool-button ${showFilters ? "selected" : ""}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} /> Filter
        </button>
        <button className="tool-button" onClick={() => notify("Download prepared as CSV.")}>
          <Download size={18} /> Download
        </button>
        <button className="tool-button" onClick={() => setShowLog(true)}>
          <History size={18} /> Changelog
        </button>
        <ColumnVisibilityPopover hiddenColumns={hiddenColumns} onToggle={toggleColumn} />
      </div>
      <CreateButton onClick={openCreate} />
    </div>
  );
}
