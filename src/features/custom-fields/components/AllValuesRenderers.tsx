import type { ComponentType } from "react";
import type { CustomField, DataType } from "../types/customField.types";

function DropdownAllValues({ field }: { field: CustomField }) {
  if (field.dataType !== "dropdown") return null;
  return (
    <>
      {field.values.map((value) => (
        <span className="badge" key={value}>
          {value}
        </span>
      ))}
    </>
  );
}

// New data type? Register its "all values" viewer here — nothing else in
// this file, or in FieldValuesModal, needs to change.
export const AllValuesRenderers: Record<DataType, ComponentType<{ field: CustomField }> | null> = {
  dropdown: DropdownAllValues,
  numeric: null,
  text: null,
  text_area: null,
  date: null,
  phone: null,
};
