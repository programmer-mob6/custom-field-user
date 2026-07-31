import { Download, Filter, History, Plus, Search, Settings2, X } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { CustomFieldTable } from "../components/CustomFieldTable";
import { FieldFormModal } from "../components/FieldFormModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Modal } from "../components/Modal";
import { SelectFilter } from "../components/SelectFilter";
import { withPermission } from "../components/withPermission";
import { useAppContext } from "../context/AppContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useDisclosure } from "../hooks/useDisclosure";
import { useCustomFieldStore } from "../store/customFieldStore";
import type {
  ColumnKey,
  ConfirmAction,
  CustomField,
  DataType,
  FieldDraft,
} from "../types/customField";

const columnLabels: Record<ColumnKey, string> = {
  dataType: "Data Type",
  valueSetting: "Value Setting",
  required: "Required",
  updatedAt: "Last Update",
};
const CreateButton = withPermission(
  ({ onClick }: { onClick: () => void }) => (
    <button className="button primary create-button" onClick={onClick}>
      <Plus size={18} /> Custom Field
    </button>
  ),
  "create",
);

export default function CustomFieldsPage() {
  const fields = useCustomFieldStore((state) => state.fields);
  const { permission, notify, setPermission } = useAppContext();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<DataType | "all">("all");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [required, setRequired] = useState<"all" | "yes" | "no">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<Set<ColumnKey>>(new Set());
  const [editing, setEditing] = useState<CustomField | undefined>();
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const [valueField, setValueField] = useState<CustomField | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [page, setPage] = useState(1);
  // Uncontrolled until Enter: this mirrors the PRD's page-jump behavior.
  const pageInputRef = useRef<HTMLInputElement>(null);
  const form = useDisclosure();
  const debouncedSearch = useDebouncedValue(search);
  const setActive = useCustomFieldStore((state) => state.setActive);
  const deleteField = useCustomFieldStore((state) => state.deleteField);
  const filtered = useMemo(
    () =>
      fields
        .filter((field) => {
          const query = debouncedSearch.toLowerCase();
          return (
            (!query ||
              [field.fieldName, field.dataType, field.required ? "yes" : "no"].some((value) =>
                value.toLowerCase().includes(query),
              )) &&
            (type === "all" || field.dataType === type) &&
            (status === "all" || (status === "active") === field.isActive) &&
            (required === "all" || (required === "yes") === field.required)
          );
        })
        .sort((a, b) => a.fieldName.localeCompare(b.fieldName, "en", { sensitivity: "base" })),
    [fields, debouncedSearch, type, status, required],
  );
  const openCreate = useCallback(() => {
    setEditing(undefined);
    form.open();
  }, [form]);
  const toggleActive = useCallback(
    (field: CustomField) => {
      if (field.isActive) setConfirm({ kind: "deactivate", ids: [field.id] });
      else {
        setActive([field.id], true);
        notify("Success, Custom Field has been activated.");
      }
    },
    [notify, setActive],
  );
  const toggleColumn = (key: ColumnKey) =>
    setHiddenColumns((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const confirmAction = () => {
    if (!confirm) return;
    if (confirm.kind === "delete") {
      deleteField(confirm.field.id);
      setSelected((ids) => ids.filter((id) => id !== confirm.field.id));
      notify("Success, Custom Field has been deleted.");
    }
    if (confirm.kind === "deactivate") {
      setActive(confirm.ids, false);
      notify(
        `Success, ${confirm.ids.length > 1 ? "Custom Fields have" : "Custom Field has"} been deactivated.`,
      );
    }
    if (confirm.kind === "dataType" && editing) {
      useCustomFieldStore.getState().updateField(editing.id, confirm.draft);
      notify("Success, Custom Field has been updated.");
      form.close();
    }
    setConfirm(null);
  };
  const formDataTypeWarning = (draft: FieldDraft) => setConfirm({ kind: "dataType", draft });
  const selectedFields = fields.filter((field) => selected.includes(field.id));
  const activeCount = selectedFields.filter((field) => field.isActive).length;
  return (
    <main className="app-shell">
      <aside>
        <div className="brand">
          <span>■</span> samurai
        </div>
        <nav>
          <p>GLOBAL SETTINGS</p>
          <a>Organization</a>
          <a className="active">User</a>
          <a>Role & Permission</a>
        </nav>
        <div className="profile">
          AW
          <br />
          <small>Admin Workspace</small>
        </div>
      </aside>
      <section className="content">
        <div className="breadcrumb">
          Global Settings <span>/</span> User
        </div>
        <div className="page-title">
          <div>
            <h1>User</h1>
            <p>Manage users, organizational structure, and profile settings.</p>
          </div>
          <select
            className="role-select"
            value={permission.create ? "admin" : "readonly"}
            onChange={(event) =>
              setPermission(
                event.target.value === "admin"
                  ? { read: true, create: true, update: true, delete: true }
                  : { read: true, create: false, update: false, delete: false },
              )
            }
          >
            <option value="admin">Total Control</option>
            <option value="readonly">Read Only</option>
          </select>
        </div>
        <div className="tabs">
          <button>User List</button>
          <button>Position</button>
          <button>Division</button>
          <button className="selected">Custom Field</button>
        </div>
        <div className="toolbar">
          <div className="toolbar-tools">
            <div className="search">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search field name..."
              />
            </div>
            <button
              className={`tool-button ${showFilters ? "selected" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} /> Filter
            </button>
            <button className="tool-button" onClick={() => notify("Download prepared as CSV.")}>
              <Download size={18} /> Download
            </button>
            <button className="tool-button" onClick={() => setShowLog(true)}>
              <History size={18} /> Changelog
            </button>
            <button className="tool-button" onClick={() => setShowColumns(!showColumns)}>
              <Settings2 size={18} /> Columns
            </button>
          </div>
          <CreateButton onClick={openCreate} />
        </div>
        {showFilters && (
          <div className="filter-panel">
            <SelectFilter
              label="Data Type"
              value={type}
              onChange={setType}
              options={[
                { value: "all", label: "All types" },
                ...(
                  ["text", "text_area", "dropdown", "date", "numeric", "phone"] as DataType[]
                ).map((value) => ({ value, label: value.replace("_", " ") })),
              ]}
            />
            <SelectFilter
              label="Required"
              value={required}
              onChange={setRequired}
              options={[
                { value: "all", label: "All" },
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
            <SelectFilter
              label="Active"
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "All statuses" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
            <button
              className="clear-filter"
              onClick={() => {
                setType("all");
                setStatus("all");
                setRequired("all");
                setSearch("");
              }}
            >
              <X size={15} /> Clear filters
            </button>
          </div>
        )}
        {showColumns && (
          <div className="columns-popover">
            <b>Column Visibility</b>
            {(Object.keys(columnLabels) as ColumnKey[]).map((key) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={!hiddenColumns.has(key)}
                  onChange={() => toggleColumn(key)}
                />{" "}
                {columnLabels[key]}
              </label>
            ))}
          </div>
        )}
        {selected.length > 0 && (
          <div className="bulk-bar">
            <b>{selected.length} selected</b>
            {activeCount < selected.length && (
              <button
                onClick={() => {
                  setActive(selected, true);
                  notify("Success, Custom Fields have been activated.");
                  setSelected([]);
                }}
              >
                Activate
              </button>
            )}
            {activeCount > 0 && (
              <button
                className="danger-text"
                onClick={() => setConfirm({ kind: "deactivate", ids: selected })}
              >
                Deactivate
              </button>
            )}
            <button className="close-bulk" onClick={() => setSelected([])}>
              ×
            </button>
          </div>
        )}
        <div className="table-card">
          {filtered.length ? (
            <CustomFieldTable
              fields={filtered}
              selected={selected}
              setSelected={setSelected}
              hiddenColumns={hiddenColumns}
              onEdit={(field) => {
                setEditing(field);
                form.open();
              }}
              onDelete={(field) => setConfirm({ kind: "delete", field })}
              onToggle={toggleActive}
              onShowValues={setValueField}
            />
          ) : (
            <div className="empty">
              <span>◫</span>
              <h3>{fields.length ? "No results found" : "No custom field yet"}</h3>
              <p>Try adjusting your filters or create a new field.</p>
            </div>
          )}
          <div className="pagination">
            Showing {filtered.length} of {fields.length} custom fields{" "}
            <span className="pagination-controls">
              Rows per page: <b>10</b> · Page {page} / 1 · Go to{" "}
              <input
                ref={pageInputRef}
                defaultValue="1"
                aria-label="Go to page"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    const nextPage = Number(pageInputRef.current?.value);
                    if (nextPage === 1) setPage(nextPage);
                  }
                }}
              />
            </span>
          </div>
        </div>
      </section>
      {form.isOpen && (
        <FieldFormModal
          field={editing}
          onClose={form.close}
          onDataTypeWarning={formDataTypeWarning}
        />
      )}
      {valueField && (
        <Modal title={`Values — ${valueField.fieldName}`} onClose={() => setValueField(null)}>
          <div className="modal-body all-values">
            {valueField.dataType === "dropdown" &&
              valueField.values.map((value) => (
                <span className="badge" key={value}>
                  {value}
                </span>
              ))}
          </div>
          <footer>
            <button className="button secondary" onClick={() => setValueField(null)}>
              Close
            </button>
          </footer>
        </Modal>
      )}
      {showLog && (
        <Modal title="Changelog: Custom Field" onClose={() => setShowLog(false)}>
          <div className="modal-body changelog">
            <p>
              <b>Today</b>
            </p>
            <p>Custom field definitions are tracked here when connected to the API.</p>
            <p className="muted">
              Created, updated, activated, and deleted actions appear in this audit trail.
            </p>
          </div>
          <footer>
            <button className="button secondary" onClick={() => setShowLog(false)}>
              Close
            </button>
          </footer>
        </Modal>
      )}
      {confirm?.kind === "delete" && (
        <ConfirmDialog
          title="Delete Custom Field"
          confirmLabel="Delete"
          danger
          onClose={() => setConfirm(null)}
          onConfirm={confirmAction}
        >
          <p>
            - <b>{confirm.field.fieldName}</b>
          </p>
          <p>All user data for this field will be permanently lost.</p>
          <p>This action cannot be undone. Are you sure you want to delete it?</p>
        </ConfirmDialog>
      )}
      {confirm?.kind === "deactivate" && (
        <ConfirmDialog
          title="Deactivate Custom Field"
          confirmLabel="Deactivate"
          danger
          onClose={() => setConfirm(null)}
          onConfirm={confirmAction}
        >
          <p>
            Deactivating this field will hide it and its data from all user forms. You can
            reactivate it later.
          </p>
        </ConfirmDialog>
      )}
      {confirm?.kind === "dataType" && (
        <ConfirmDialog
          title="Change Data Type"
          confirmLabel="Change Data Type"
          danger
          onClose={() => setConfirm(null)}
          onConfirm={confirmAction}
        >
          <p>
            Changing the data type will reset all existing values for this field. This action cannot
            be undone.
          </p>
        </ConfirmDialog>
      )}
    </main>
  );
}
