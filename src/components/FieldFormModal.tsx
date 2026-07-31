import { useEffect, useRef, useState } from "react";
import { Info, Plus, X } from "lucide-react";
import { useCustomFieldStore } from "../store/customFieldStore";
import {
  blankDraft,
  dataTypes,
  toDraft,
  type CustomField,
  type FieldDraft,
} from "../types/customField";
import { useAppContext } from "../context/AppContext";
import { Modal } from "./Modal";

type Props = {
  field?: CustomField;
  onClose: () => void;
  onDataTypeWarning: (draft: FieldDraft) => void;
};
const labels: Record<(typeof dataTypes)[number], string> = {
  text: "Text",
  text_area: "Text Area",
  dropdown: "Dropdown",
  date: "Date",
  numeric: "Numeric",
  phone: "Phone",
};

export function FieldFormModal({ field, onClose, onDataTypeWarning }: Props) {
  const isEdit = Boolean(field);
  const [draft, setDraft] = useState<FieldDraft>(() => (field ? toDraft(field) : blankDraft()));
  const [stay, setStay] = useState(false);
  const [valueInput, setValueInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { fields, createField, updateField } = useCustomFieldStore();
  const { notify } = useAppContext();
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const update = <K extends keyof FieldDraft>(key: K, value: FieldDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const duplicate = fields.some(
    (item) =>
      item.id !== field?.id &&
      item.fieldName.trim().toLowerCase() === draft.fieldName.trim().toLowerCase(),
  );
  const invalid =
    !draft.fieldName.trim() ||
    draft.fieldName.trim().length > 120 ||
    !draft.dataType ||
    duplicate ||
    (draft.dataType === "dropdown" && !draft.values.length);
  const addValue = () => {
    const value = valueInput.trim();
    if (!value || value.length > 120 || draft.values.includes(value)) return;
    update("values", [...draft.values, value]);
    setValueInput("");
  };
  const submit = () => {
    setSubmitted(true);
    if (invalid) return;
    if (field && field.dataType !== draft.dataType && field.hasExistingValues) {
      onDataTypeWarning(draft);
      return;
    }
    save();
  };
  const save = () => {
    if (field) {
      updateField(field.id, draft);
      notify("Success, Custom Field has been updated.");
    } else {
      createField(draft);
      notify("Success, Custom Field has been created.");
    }
    if (!field && stay) {
      setDraft(blankDraft());
      setSubmitted(false);
      inputRef.current?.focus();
    } else onClose();
  };
  return (
    <Modal
      title={isEdit ? "Edit Custom Field" : "Create Custom Field"}
      onClose={onClose}
      className="field-modal"
    >
      <div className="modal-body form-grid">
        <label>
          Field Name <b>*</b>
          <input
            ref={inputRef}
            value={draft.fieldName}
            maxLength={121}
            onChange={(event) => update("fieldName", event.target.value)}
            aria-required="true"
            placeholder="e.g. Cost Center"
          />
          {submitted && !draft.fieldName.trim() && (
            <small className="error">Field Name must not be empty</small>
          )}
          {draft.fieldName.length > 120 && <small className="error">Max. 120 characters</small>}
          {draft.fieldName.trim() && duplicate && (
            <small className="error">Field Name already exists</small>
          )}
        </label>
        <label>
          Data Type <b>*</b>
          <span className="tip" title="Choose the format used for the field value.">
            <Info size={15} />
          </span>
          <select
            value={draft.dataType}
            onChange={(event) => update("dataType", event.target.value as FieldDraft["dataType"])}
          >
            <option value="">Select data type</option>
            {dataTypes.map((type) => (
              <option key={type} value={type}>
                {labels[type]}
              </option>
            ))}
          </select>
        </label>

        {draft.dataType === "dropdown" && (
          <div className="values-editor">
            <label>
              Values <b>*</b>
              <div className="chip-input">
                {draft.values.map((value) => (
                  <span className="chip" key={value}>
                    {value}
                    <button
                      onClick={() =>
                        update(
                          "values",
                          draft.values.filter((item) => item !== value),
                        )
                      }
                      aria-label={`Remove ${value}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  value={valueInput}
                  onChange={(event) => setValueInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addValue();
                    }
                  }}
                  placeholder="Type a value and press Enter"
                />
              </div>
            </label>
            <button className="text-button" onClick={addValue}>
              <Plus size={15} /> Add value
            </button>
            <p>Press enter to add new value or click the badge to edit</p>
            {submitted && !draft.values.length && (
              <small className="error">At least one value is required</small>
            )}
          </div>
        )}
        {draft.dataType === "numeric" && (
          <fieldset>
            <legend>Decimal Places</legend>
            {([0, 1, 2] as const).map((places) => (
              <label className="radio" key={places}>
                <input
                  type="radio"
                  checked={draft.decimalPlaces === places}
                  onChange={() => update("decimalPlaces", places)}
                />{" "}
                {places}
              </label>
            ))}
          </fieldset>
        )}
        <label className="switch-label">
          Required{" "}
          <button
            className={`switch ${draft.required ? "on" : ""}`}
            role="switch"
            aria-checked={draft.required}
            onClick={() => update("required", !draft.required)}
          >
            <span />
          </button>
          <span>{draft.required ? "Yes" : "No"}</span>
        </label>
      </div>
      <footer>
        {!isEdit && (
          <label className="checkbox">
            <input
              type="checkbox"
              checked={stay}
              onChange={(event) => setStay(event.target.checked)}
            />{" "}
            Stay on this form after submitting
          </label>
        )}
        <span className="footer-actions">
          <button className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" onClick={submit}>
            {isEdit ? "Save" : "Submit"}
          </button>
        </span>
      </footer>
    </Modal>
  );
}
