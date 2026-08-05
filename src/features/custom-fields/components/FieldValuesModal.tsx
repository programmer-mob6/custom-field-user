import type { CustomField } from "../types/customField.types";
import { Modal } from "../../../shared/components/Modal";
import { AllValuesRenderers } from "./AllValuesRenderers";

type Props = {
  valueField: CustomField | null;
  onCloseClick: () => void;
};

export function FieldValuesModal({ valueField, onCloseClick }: Props) {
  const ValuesRenderer = valueField ? AllValuesRenderers[valueField.dataType] : null;
  return (
    <Modal title={`Values — ${valueField?.fieldName}`} onClose={onCloseClick}>
      <div className="modal-body all-values">
        {ValuesRenderer && valueField && <ValuesRenderer field={valueField} />}
      </div>
      <footer>
        <button className="button secondary" onClick={onCloseClick}>
          Close
        </button>
      </footer>
    </Modal>
  );
}
