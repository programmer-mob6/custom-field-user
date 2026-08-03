import type { CustomField } from "../types/customField.types";

export const seedFields: CustomField[] = [
  {
    id: "cost-center",
    fieldName: "Cost Center",
    dataType: "dropdown",
    values: ["Sales", "Marketing", "Operations", "Finance", "People"],
    required: true,
    isActive: true,
    updatedAt: "2026-07-29T09:30:00Z",
    hasExistingValues: true,
  },
  {
    id: "grade",
    fieldName: "Grade",
    dataType: "text",
    required: false,
    isActive: true,
    updatedAt: "2026-07-28T04:00:00Z",
  },
  {
    id: "bonus-multiplier",
    fieldName: "Bonus Multiplier",
    dataType: "numeric",
    decimalPlaces: 2,
    required: false,
    isActive: false,
    updatedAt: "2026-07-20T11:15:00Z",
    hasExistingValues: true,
  },
  {
    id: "shift-type",
    fieldName: "Shift Type",
    dataType: "dropdown",
    values: ["Day", "Night"],
    required: true,
    isActive: true,
    updatedAt: "2026-07-18T08:10:00Z",
  },
  {
    id: "work-phone",
    fieldName: "Work Phone",
    dataType: "phone",
    required: false,
    isActive: true,
    updatedAt: "2026-07-11T05:45:00Z",
  },
];
