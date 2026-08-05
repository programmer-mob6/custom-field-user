import type { Dispatch, SetStateAction } from "react";
import type { ConfirmAction } from "../types/customField.types";
import { useCustomFieldStore } from "../store/customFieldStore";
import { useToastStore } from "../../../shared/store/toastStore";

type Props = {
  activeCount: number;
  setSelected: Dispatch<SetStateAction<string[]>>;
  setConfirm: Dispatch<SetStateAction<ConfirmAction>>;
  selected: string[];
};
export function BulkActionBar({ activeCount, setSelected, setConfirm, selected }: Props) {
  const setActive = useCustomFieldStore((state) => state.setActive);
  const notify = useToastStore((state) => state.notify);

  return (
    <div className="bulk-bar">
      <b>{selected.length} selected</b>
      {activeCount < selected.length && (
        <button
          onClick={() => {
            setActive(selected, true);
            notify("Success, Custom Fields have been activated.");
            setSelected([]);
          }}
        >
          Activate
        </button>
      )}
      {activeCount > 0 && (
        <button
          className="danger-text"
          onClick={() => setConfirm({ kind: "deactivate", ids: selected })}
        >
          Deactivate
        </button>
      )}
      <button className="close-bulk" onClick={() => setSelected([])}>
        ×
      </button>
    </div>
  );
}
