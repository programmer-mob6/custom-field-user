import type { ComponentType } from "react";
import type { CustomField, DataType } from "../types/customField.types";

type ValueRendererProps = {
  field: CustomField;
  onShowValues: (field: CustomField) => void;
};

function DropdownBadgeViewer({ field, onShowValues }: ValueRendererProps) {
  if (field.dataType !== "dropdown") return null;
  return (
    <div className="badges">
      {field.values.slice(0, 2).map((value) => (
        <span className="badge" key={value}>
          {value}
        </span>
      ))}
      {field.values.length > 2 && (
        <button className="more-badge" onClick={() => onShowValues(field)}>
          +{field.values.length - 2} More
        </button>
      )}
    </div>
  );
}

function NumericDecimalViewer({ field }: ValueRendererProps) {
  if (field.dataType !== "numeric") return null;
  return <>{field.decimalPlaces} decimal places</>;
}

function DefaultViewer() {
  return <>—</>;
}

// New data type? Register its viewer here — nothing else in this file, or in
// CustomFieldTable, needs to change.
export const FieldValueRenderers: Record<DataType, ComponentType<ValueRendererProps>> = {
  dropdown: DropdownBadgeViewer,
  numeric: NumericDecimalViewer,
  text: DefaultViewer,
  text_area: DefaultViewer,
  date: DefaultViewer,
  phone: DefaultViewer,
};

export function FieldValueCell({ field, onShowValues }: ValueRendererProps) {
  const ValueRenderer = FieldValueRenderers[field.dataType];
  return <ValueRenderer field={field} onShowValues={onShowValues} />;
}
