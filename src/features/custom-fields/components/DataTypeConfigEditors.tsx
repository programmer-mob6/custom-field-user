import { Plus, X } from "lucide-react";
import type { ComponentType } from "react";
import type { DataType, FieldDraft } from "../types/customField.types";

type DataTypeConfigProps = {
  draft: FieldDraft;
  update: <K extends keyof FieldDraft>(key: K, value: FieldDraft[K]) => void;
  valueInput: string;
  setValueInput: (value: string) => void;
  addValue: () => void;
  submitted: boolean;
};

function DropdownValuesEditor({
  draft,
  update,
  valueInput,
  setValueInput,
  addValue,
  submitted,
}: DataTypeConfigProps) {
  return (
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
  );
}

function NumericDecimalPlacesEditor({ draft, update }: DataTypeConfigProps) {
  return (
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
  );
}

// New data type with its own config UI? Register it here — `null` means "no
// extra config fields." CustomFieldsModal's structure never needs to change.
const DataTypeConfigEditors: Record<DataType, ComponentType<DataTypeConfigProps> | null> = {
  dropdown: DropdownValuesEditor,
  numeric: NumericDecimalPlacesEditor,
  text: null,
  text_area: null,
  date: null,
  phone: null,
};

export function DataTypeConfigSection(props: DataTypeConfigProps) {
  if (!props.draft.dataType) return null;
  const ConfigEditor = DataTypeConfigEditors[props.draft.dataType];
  if (!ConfigEditor) return null;
  return <ConfigEditor {...props} />;
}
