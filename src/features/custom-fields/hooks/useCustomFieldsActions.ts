import { useDisclosure } from "../../../shared/hooks/useDisclosure";
import type { ConfirmAction, CustomField, FieldDraft } from "../types/customField.types";
import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";

type Props = {
  setEditing: Dispatch<SetStateAction<CustomField | undefined>>;
  form: ReturnType<typeof useDisclosure>;
  setConfirm: Dispatch<SetStateAction<ConfirmAction>>;
  setActive: (ids: string[], active: boolean) => void;
  notify: (message: string, tone?: "error" | "success") => void;
  confirm: ConfirmAction;
  deleteField: (id: string) => void;
  setSelected: Dispatch<SetStateAction<string[]>>;
  editing: CustomField | undefined;
  updateField: (id: string, draft: FieldDraft) => void;
};

export function useCustomFieldsActions({
  setEditing,
  form,
  setConfirm,
  setActive,
  notify,
  confirm,
  deleteField,
  setSelected,
  editing,
  updateField,
}: Props) {
  const openCreate = useCallback(() => {
    setEditing(undefined);
    form.open();
  }, [form, setEditing]);

  const onEdit = useCallback(
    (field: CustomField) => {
      setEditing(field);
      form.open();
    },
    [form, setEditing],
  );

  const toggleActive = useCallback(
    (field: CustomField) => {
      if (field.isActive) setConfirm({ kind: "deactivate", ids: [field.id] });
      else {
        setActive([field.id], true);
        notify("Success, Custom Field has been activated.");
      }
    },
    [notify, setActive, setConfirm],
  );

  const confirmAction = () => {
    if (!confirm) return;
    switch (confirm.kind) {
      case "delete":
        deleteField(confirm.field.id);
        setSelected((ids) => ids.filter((id) => id !== confirm.field.id));
        notify("Success, Custom Field has been deleted.");
        break;
      case "deactivate":
        setActive(confirm.ids, false);
        notify(
          `Success, ${confirm.ids.length > 1 ? "Custom Fields have" : "Custom Field has"} been deactivated.`,
        );
        break;
      case "dataType":
        if (editing) {
          updateField(editing.id, confirm.draft);
          notify("Success, Custom Field has been updated.");
          form.close();
        }
        break;
    }
    setConfirm(null);
  };

  const formDataTypeWarning = (draft: FieldDraft) => setConfirm({ kind: "dataType", draft });

  const onDelete = (field: CustomField) => setConfirm({ kind: "delete", field });
  return {
    openCreate,
    toggleActive,
    confirmAction,
    formDataTypeWarning,
    onEdit,
    onDelete,
  };
}
