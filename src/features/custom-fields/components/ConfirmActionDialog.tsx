import type { ReactNode } from "react";
import type { ConfirmAction } from "../types/customField.types";
import { ConfirmDialog } from "./ConfirmDialog";

type Props = {
  confirm: ConfirmAction;
  onConfirm: () => void;
  onClose: () => void;
};

type ConfirmContent = { title: string; confirmLabel: string; body: ReactNode };

function getConfirmContent(confirm: NonNullable<ConfirmAction>): ConfirmContent {
  switch (confirm.kind) {
    case "delete":
      return {
        title: "Delete Custom Field",
        confirmLabel: "Delete",
        body: (
          <>
            <p>
              - <b>{confirm.field.fieldName}</b>
            </p>
            <p>All user data for this field will be permanently lost.</p>
            <p>This action cannot be undone. Are you sure you want to delete it?</p>
          </>
        ),
      };
    case "deactivate":
      return {
        title: "Deactivate Custom Field",
        confirmLabel: "Deactivate",
        body: (
          <p>
            Deactivating this field will hide it and its data from all user forms. You can
            reactivate it later.
          </p>
        ),
      };
    case "dataType":
      return {
        title: "Change Data Type",
        confirmLabel: "Change Data Type",
        body: (
          <p>
            Changing the data type will reset all existing values for this field. This action cannot
            be undone.
          </p>
        ),
      };
  }
}

export function ConfirmActionDialog({ confirm, onConfirm, onClose }: Props) {
  if (!confirm) return null;
  const { title, confirmLabel, body } = getConfirmContent(confirm);
  return (
    <ConfirmDialog
      title={title}
      confirmLabel={confirmLabel}
      danger
      onClose={onClose}
      onConfirm={onConfirm}
    >
      {body}
    </ConfirmDialog>
  );
}
