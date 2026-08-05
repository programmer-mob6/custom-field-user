import { Download, Filter, Plus, Search } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { withPermission } from "../../../shared/components/withPermission";
import { useToastStore } from "../../../shared/store/toastStore";

type Props = {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
};

// Activating a TAG is a write to the registry, so the button is hidden
// outright without Update — not merely disabled (PRD §1.5).
const ActivateTagButton = withPermission(function ActivateTagButton() {
  const navigate = useNavigate();
  return (
    <button
      className="button primary create-button"
      onClick={() => navigate("/global-settings/tag/activate")}
    >
      <Plus size={17} /> Activate TAG
    </button>
  );
}, "update");

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
      <ActivateTagButton />
    </div>
  );
}
