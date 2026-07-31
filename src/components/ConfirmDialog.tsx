import type { ReactNode } from "react";
import { Modal } from "./Modal";

type Props = {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};
export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  danger = false,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal title={title} onClose={onClose} className="confirm-modal">
      <div className="modal-body">{children}</div>
      <footer>
        <button className="button secondary" onClick={onClose}>
          Cancel
        </button>
        <button className={`button ${danger ? "danger" : "primary"}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </footer>
    </Modal>
  );
}
