import { Download, Filter, Search } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useToastStore } from "../../../shared/store/toastStore";

type Props = {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
};

export function TagToolbar({ search, setSearch, showFilters, setShowFilters }: Props) {
  const notify = useToastStore((state) => state.notify);
  return (
    <div className="toolbar">
      <div className="toolbar-tools">
        <div className="search">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search code, device name..."
          />
        </div>
        <button
          className={`tool-button ${showFilters ? "selected" : ""}`}
          onClick={() => setShowFilters((current) => !current)}
        >
          <Filter size={18} /> Filter
        </button>
        <button className="tool-button" onClick={() => notify("Download prepared as CSV.")}>
          <Download size={18} /> Download
        </button>
      </div>
    </div>
  );
}
