export const dataTypes = ["text", "text_area", "dropdown", "date", "numeric", "phone"] as const;
export type DataType = (typeof dataTypes)[number];

type BaseField = {
  id: string;
  fieldName: string;
  required: boolean;
  isActive: boolean;
  updatedAt: string;
  hasExistingValues?: boolean;
};

export type CustomField =
  | (BaseField & { dataType: "text" | "text_area" | "date" | "phone" })
  | (BaseField & { dataType: "dropdown"; values: string[] })
  | (BaseField & { dataType: "numeric"; decimalPlaces: 0 | 1 | 2 });

export type FieldDraft = {
  fieldName: string;
  dataType: DataType | "";
  values: string[];
  decimalPlaces: 0 | 1 | 2;
  required: boolean;
};

export type Permission = { read: boolean; create: boolean; update: boolean; delete: boolean };
export type ColumnKey = "dataType" | "valueSetting" | "required" | "updatedAt";
export type ConfirmAction =
  | { kind: "delete"; field: CustomField }
  | { kind: "deactivate"; ids: string[] }
  | { kind: "dataType"; draft: FieldDraft }
  | null;

export const blankDraft = (): FieldDraft => ({
  fieldName: "",
  dataType: "",
  values: [],
  decimalPlaces: 0,
  required: false,
});

export function toDraft(field: CustomField): FieldDraft {
  return {
    fieldName: field.fieldName,
    dataType: field.dataType,
    values: field.dataType === "dropdown" ? field.values : [],
    decimalPlaces: field.dataType === "numeric" ? field.decimalPlaces : 0,
    required: field.required,
  };
}
