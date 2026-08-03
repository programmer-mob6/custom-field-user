import type { ReactNode } from "react";
import { DialogBody, DialogFooter } from "@chakra-ui/react";
import { Modal } from "../../../shared/components/Modal";

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
    <Modal title={title} onClose={onClose} className="confirm-modal" role="alertdialog">
      <DialogBody className="modal-body">{children}</DialogBody>
      <DialogFooter>
        <button className="button secondary" onClick={onClose}>
          Cancel
        </button>
        <button className={`button ${danger ? "danger" : "primary"}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </DialogFooter>
    </Modal>
  );
}
