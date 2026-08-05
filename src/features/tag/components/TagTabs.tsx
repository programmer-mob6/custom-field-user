import type { TagTab } from "../types/tag.types";

const TAB_LABELS: Record<TagTab, string> = {
  all: "All",
  paired: "Paired",
  "not-paired": "Not Paired",
};

type Props = {
  tab: TagTab;
  setTab: (tab: TagTab) => void;
};

export function TagTabs({ tab, setTab }: Props) {
  return (
    <div className="tabs">
      {(Object.keys(TAB_LABELS) as TagTab[]).map((key) => (
        <button key={key} className={tab === key ? "selected" : ""} onClick={() => setTab(key)}>
          {TAB_LABELS[key]}
        </button>
      ))}
    </div>
  );
}
