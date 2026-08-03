import { create } from "zustand";
import { seedFields } from "../data/seed";
import type { CustomField, FieldDraft } from "../types/customField.types";

type Store = {
  fields: CustomField[];
  createField: (draft: FieldDraft) => void;
  updateField: (id: string, draft: FieldDraft) => void;
  deleteField: (id: string) => void;
  setActive: (ids: string[], active: boolean) => void;
};

const makeField = (id: string, draft: FieldDraft, current?: CustomField): CustomField => {
  const base = {
    id,
    fieldName: draft.fieldName.trim(),
    required: draft.required,
    isActive: current?.isActive ?? true,
    updatedAt: new Date().toISOString(),
    hasExistingValues: current?.hasExistingValues,
  };
  if (draft.dataType === "dropdown")
    return { ...base, dataType: "dropdown", values: [...draft.values] };
  if (draft.dataType === "numeric")
    return { ...base, dataType: "numeric", decimalPlaces: draft.decimalPlaces };
  return { ...base, dataType: draft.dataType || "text" };
};

export const useCustomFieldStore = create<Store>((set) => ({
  fields: seedFields,
  createField: (draft) =>
    set((state) => ({ fields: [...state.fields, makeField(crypto.randomUUID(), draft)] })),
  updateField: (id, draft) =>
    set((state) => ({
      fields: state.fields.map((field) => (field.id === id ? makeField(id, draft, field) : field)),
    })),
  deleteField: (id) =>
    set((state) => ({ fields: state.fields.filter((field) => field.id !== id) })),
  setActive: (ids, active) =>
    set((state) => ({
      fields: state.fields.map((field) =>
        ids.includes(field.id)
          ? { ...field, isActive: active, updatedAt: new Date().toISOString() }
          : field,
      ),
    })),
}));
