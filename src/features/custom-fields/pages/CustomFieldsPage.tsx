import { AppSidebar } from "../../../shared/components/AppSidebar";
import { useDisclosure } from "../../../shared/hooks/useDisclosure";
import { useToastStore } from "../../../shared/store/toastStore";
import { ConfirmActionDialog } from "../components/ConfirmActionDialog";
import { FieldFormModal } from "../components/FieldFormModal";
import { FilterPanel } from "../components/FilterPanel";
import { useCustomFieldsFilter } from "../hooks/useCustomFieldsFilter";
import { useCustomFieldStore } from "../store/customFieldStore";
import { FieldValuesModal } from "../components/FieldValuesModal";
import { ChangelogModal } from "../components/ChangelogModal";
import { useCustomFieldsPageState } from "../hooks/useCustomFieldsPageState";
import { useCustomFieldsActions } from "../hooks/useCustomFieldsActions";
import { PageHeader } from "../components/PageHeader";
import { BulkActionBar } from "../components/BulkActionBar";
import { Toolbar } from "../components/Toolbar";
import { FieldsTable } from "../components/FieldsTable";

export default function CustomFieldsPage() {
  const fields = useCustomFieldStore((state) => state.fields);
  const notify = useToastStore((state) => state.notify);
  const {
    search,
    setSearch,
    type,
    setType,
    status,
    setStatus,
    required,
    setRequired,
    filtered,
    clearFilters,
  } = useCustomFieldsFilter(fields);

  const {
    selected,
    setSelected,
    hiddenColumns,
    editing,
    setEditing,
    confirm,
    setConfirm,
    valueField,
    setValueField,
    showFilters,
    setShowFilters,
    showLog,
    setShowLog,
    page,
    setPage,
    pageInputRef,
    toggleColumn,
  } = useCustomFieldsPageState();
  const form = useDisclosure();
  const setActive = useCustomFieldStore((state) => state.setActive);
  const deleteField = useCustomFieldStore((state) => state.deleteField);
  const createField = useCustomFieldStore((state) => state.createField);
  const updateField = useCustomFieldStore((state) => state.updateField);
  const { openCreate, toggleActive, confirmAction, formDataTypeWarning, onEdit, onDelete } =
    useCustomFieldsActions({
      setEditing,
      form,
      setConfirm,
      setActive,
      notify,
      confirm,
      deleteField,
      setSelected,
      editing,
      updateField,
    });
  const selectedFields = fields.filter((field) => selected.includes(field.id));
  const activeCount = selectedFields.filter((field) => field.isActive).length;
  return (
    <main className="app-shell">
      <AppSidebar />
      <section className="content">
        <PageHeader />
        <Toolbar
          search={search}
          setSearch={setSearch}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          setShowLog={setShowLog}
          hiddenColumns={hiddenColumns}
          toggleColumn={toggleColumn}
          openCreate={openCreate}
        />
        {showFilters && (
          <FilterPanel
            type={type}
            setType={setType}
            status={status}
            setStatus={setStatus}
            required={required}
            setRequired={setRequired}
            onClear={clearFilters}
          />
        )}
        {selected.length > 0 && (
          <BulkActionBar
            activeCount={activeCount}
            setSelected={setSelected}
            setConfirm={setConfirm}
            selected={selected}
          />
        )}
        <FieldsTable
          filtered={filtered}
          selected={selected}
          setSelected={setSelected}
          hiddenColumns={hiddenColumns}
          onEdit={onEdit}
          onDelete={onDelete}
          toggleActive={toggleActive}
          setValueField={setValueField}
          fieldsLength={fields.length}
          page={page}
          pageInputRef={pageInputRef}
          setPage={setPage}
        />
      </section>
      {form.isOpen && (
        <FieldFormModal
          field={editing}
          existingFields={fields}
          onCreate={createField}
          onUpdate={updateField}
          onNotify={notify}
          onClose={form.close}
          onDataTypeWarning={formDataTypeWarning}
        />
      )}
      {valueField && (
        <FieldValuesModal onCloseClick={() => setValueField(null)} valueField={valueField} />
      )}
      {showLog && <ChangelogModal onCloseClick={() => setShowLog(false)} />}
      <ConfirmActionDialog
        confirm={confirm}
        onConfirm={confirmAction}
        onClose={() => setConfirm(null)}
      />
    </main>
  );
}
