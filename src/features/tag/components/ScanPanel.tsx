import { useState } from "react";
import { Radio } from "lucide-react";
import { Modal } from "../../../shared/components/Modal";
import type { ActivatableTagType } from "../types/activateTag.types";

// What the reader is physically listening for, per technology (PRD §5.1).
const CAPTURE_LABEL: Record<ActivatableTagType, string> = {
  RFID: "Listening for RFID TIDs",
  NFC: "Listening for NFC UIDs",
  BLE: "Listening for BLE addresses",
  GPS: "Listening for GPS IMEIs",
};

type Props = {
  tagType: ActivatableTagType;
  mode: "add" | "remove";
  // Codes the simulated reader can still pick up, in order. Real hardware
  // would supply these; here the page derives them from the mock stock.
  suggestions: string[];
  onCapture: (code: string) => boolean;
  onClose: () => void;
};

export function ScanPanel({ tagType, mode, suggestions, onCapture, onClose }: Props) {
  const [count, setCount] = useState(0);
  const [manual, setManual] = useState("");

  const capture = (code: string) => {
    if (!code.trim()) return;
    if (onCapture(code.trim())) setCount((current) => current + 1);
  };

  const next = suggestions[0];
  const title = mode === "add" ? "Scanning TAGs" : "Scanning TAGs to remove";

  return (
    <Modal title={title} onClose={onClose} className="scan-panel">
      <div className="scan-status">
        <Radio size={18} className="scan-pulse" />
        <div>
          <b>{CAPTURE_LABEL[tagType]}</b>
          <p className="activate-helper">
            {mode === "add"
              ? "Each captured identifier is checked against your registered stock in real time."
              : "Re-scan a TAG you're holding to drop its row from the table."}
          </p>
        </div>
      </div>
      <p className="scan-counter">
        {mode === "add" ? "Scanned" : "Removed"} this session: <b>{count}</b>
      </p>
      <button className="button primary" disabled={!next} onClick={() => capture(next)}>
        {next ? `Simulate next scan (${next})` : "Nothing left to scan"}
      </button>
      <label className="activate-field">
        <span className="activate-label">Or enter an identifier manually</span>
        <div className="scan-manual">
          <input
            value={manual}
            placeholder={`Enter ${tagType} identifier`}
            onChange={(event) => setManual(event.target.value)}
          />
          <button
            className="button secondary"
            onClick={() => {
              capture(manual);
              setManual("");
            }}
          >
            Add
          </button>
        </div>
      </label>
      <footer className="modal-footer">
        <button className="button secondary" onClick={onClose}>
          Stop
        </button>
      </footer>
    </Modal>
  );
}
