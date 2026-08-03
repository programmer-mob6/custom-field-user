import type { ConfirmAction } from "../types/customField.types";
import { ConfirmDialog } from "./ConfirmDialog";

type Props = {
  confirm: ConfirmAction;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmActionDialog({ confirm, onConfirm, onClose }: Props) {
  if (!confirm) return null;

  if (confirm.kind === "delete") {
    return (
      <ConfirmDialog
        title="Delete Custom Field"
        confirmLabel="Delete"
        danger
        onClose={onClose}
        onConfirm={onConfirm}
      >
        <p>
          - <b>{confirm.field.fieldName}</b>
        </p>
        <p>All user data for this field will be permanently lost.</p>
        <p>This action cannot be undone. Are you sure you want to delete it?</p>
      </ConfirmDialog>
    );
  }

  if (confirm.kind === "deactivate") {
    return (
      <ConfirmDialog
        title="Deactivate Custom Field"
        confirmLabel="Deactivate"
        danger
        onClose={onClose}
        onConfirm={onConfirm}
      >
        <p>
          Deactivating this field will hide it and its data from all user forms. You can
          reactivate it later.
        </p>
      </ConfirmDialog>
    );
  }

  return (
    <ConfirmDialog
      title="Change Data Type"
      confirmLabel="Change Data Type"
      danger
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <p>
        Changing the data type will reset all existing values for this field. This action cannot
        be undone.
      </p>
    </ConfirmDialog>
  );
}
