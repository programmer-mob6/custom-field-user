import { Modal } from "../../../shared/components/Modal";
import type { QuotaShortfall } from "../hooks/useActivateTagSession";

type Props = { shortfalls: QuotaShortfall[]; onClose: () => void };

// Reactive block dialog — Submit stays enabled and explains itself on click,
// rather than being pre-disabled from a number that can go stale (PRD §7.8).
export function InsufficientQuotaDialog({ shortfalls, onClose }: Props) {
  return (
    <Modal title="Insufficient Quota" onClose={onClose} role="alertdialog">
      <p>
        You don't have enough license quota to activate all the TAGs in this session. Remove some
        rows, or wait for more quota to be allocated, then try again.
      </p>
      <ul className="quota-breakdown">
        {shortfalls.map((shortfall) => (
          <li key={shortfall.category}>
            <b>{shortfall.label}</b>: need {shortfall.need}, only {shortfall.available} available
          </li>
        ))}
      </ul>
      <footer className="modal-footer">
        <button className="button primary" onClick={onClose}>
          OK
        </button>
      </footer>
    </Modal>
  );
}
