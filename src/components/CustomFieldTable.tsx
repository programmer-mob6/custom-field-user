import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import type { ColumnKey, CustomField } from "../types/customField";

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
  const { permission } = useAppContext();
  const [menu, setMenu] = useState<string | null>(null);
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
                  {field.dataType === "dropdown" ? (
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
                  ) : field.dataType === "numeric" ? (
                    `${field.decimalPlaces} decimal places`
                  ) : (
                    "—"
                  )}
                </td>
              )}
              {!hiddenColumns.has("required") && <td>{field.required ? "Yes" : "No"}</td>}
              {!hiddenColumns.has("updatedAt") && (
                <td>
                  {new Intl.DateTimeFormat("en", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(field.updatedAt))}
                </td>
              )}
              <td className="row-menu">
                <button
                  className="icon-button"
                  onClick={() => setMenu(menu === field.id ? null : field.id)}
                  aria-label={`Actions for ${field.fieldName}`}
                >
                  <MoreHorizontal size={18} />
                </button>
                {menu === field.id && (
                  <div className="menu">
                    {permission.update && (
                      <button
                        onClick={() => {
                          setMenu(null);
                          onEdit(field);
                        }}
                      >
                        <Pencil size={15} /> Edit
                      </button>
                    )}
                    {permission.delete && (
                      <button
                        className="danger-text"
                        onClick={() => {
                          setMenu(null);
                          onDelete(field);
                        }}
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
