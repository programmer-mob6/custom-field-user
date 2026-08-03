import { MenuContent, MenuItem, MenuPositioner, MenuRoot, MenuTrigger } from "@chakra-ui/react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { usePermissionStore } from "../../../shared/store/permissionStore";
import type { ColumnKey, CustomField } from "../types/customField.types";
import { FieldValueCell } from "./FieldValueRenderers";

type Props = {
  fields: CustomField[];
  selected: string[];
  setSelected: (ids: string[]) => void;
  hiddenColumns: Set<ColumnKey>;
  onEdit: (field: CustomField) => void;
  onDelete: (field: CustomField) => void;
  onToggle: (field: CustomField) => void;
  onShowValues: (field: CustomField) => void;
};
const displayType = (type: CustomField["dataType"]) =>
  type.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function CustomFieldTable({
  fields,
  selected,
  setSelected,
  hiddenColumns,
  onEdit,
  onDelete,
  onToggle,
  onShowValues,
}: Props) {
  const permission = usePermissionStore((state) => state.permission);
  const allSelected = fields.length > 0 && fields.every((field) => selected.includes(field.id));
  const visibleIds = useMemo(() => fields.map((field) => field.id), [fields]);
  const toggleAll = () =>
    setSelected(
      allSelected
        ? selected.filter((id) => !visibleIds.includes(id))
        : [...new Set([...selected, ...visibleIds])],
    );
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                aria-label="Select all rows"
              />
            </th>
            <th>Active</th>
            <th>Field Name</th>
            {!hiddenColumns.has("dataType") && <th>Data Type</th>}
            {!hiddenColumns.has("valueSetting") && <th>Value Setting</th>}
            {!hiddenColumns.has("required") && <th>Required</th>}
            {!hiddenColumns.has("updatedAt") && <th>Last Update</th>}
            <th className="actions-header">
              <MoreHorizontal size={18} />
            </th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(field.id)}
                  onChange={() =>
                    setSelected(
                      selected.includes(field.id)
                        ? selected.filter((id) => id !== field.id)
                        : [...selected, field.id],
                    )
                  }
                  aria-label={`Select ${field.fieldName}`}
                />
              </td>
              <td>
                <button
                  className={`switch ${field.isActive ? "on" : ""} ${!permission.update ? "disabled" : ""}`}
                  disabled={!permission.update}
                  title={!permission.update ? "You don't have permission to edit" : ""}
                  role="switch"
                  aria-checked={field.isActive}
                  onClick={() => onToggle(field)}
                >
                  <span />
                </button>
              </td>
              <td className="field-name" title={field.fieldName}>
                {field.fieldName}
              </td>
              {!hiddenColumns.has("dataType") && (
                <td>
                  <span className="type-badge">{displayType(field.dataType)}</span>
                </td>
              )}
              {!hiddenColumns.has("valueSetting") && (
                <td>
                  <FieldValueCell field={field} onShowValues={onShowValues} />
                </td>
              )}
              {!hiddenColumns.has("required") && <td>{field.required ? "Yes" : "No"}</td>}
              {!hiddenColumns.has("updatedAt") && (
                <td>{dateFormatter.format(new Date(field.updatedAt))}</td>
              )}
              <td className="row-menu">
                <MenuRoot positioning={{ placement: "bottom-end" }}>
                  <MenuTrigger asChild>
                    <button className="icon-button" aria-label={`Actions for ${field.fieldName}`}>
                      <MoreHorizontal size={18} />
                    </button>
                  </MenuTrigger>
                  <MenuPositioner>
                    <MenuContent className="menu">
                      {permission.update && (
                        <MenuItem value="edit" onSelect={() => onEdit(field)}>
                          <Pencil size={15} /> Edit
                        </MenuItem>
                      )}
                      {permission.delete && (
                        <MenuItem
                          value="delete"
                          className="danger-text"
                          onSelect={() => onDelete(field)}
                        >
                          <Trash2 size={15} /> Delete
                        </MenuItem>
                      )}
                    </MenuContent>
                  </MenuPositioner>
                </MenuRoot>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
