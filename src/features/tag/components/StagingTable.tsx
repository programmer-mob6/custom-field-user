import { Pencil, Wrench } from "lucide-react";
import type { IdentityDraft } from "../hooks/useIdentityDraft";
import type { ActivatableTagType, StagingRow } from "../types/activateTag.types";
import {
  BrandControl,
  CategoryControl,
  DeviceNameControl,
  ModelControl,
  SkuControl,
} from "./IdentityControls";
import { StagingBadge } from "./StagingBadge";
import { TagTypeIcon } from "./TagTypeIcon";

type Props = {
  rows: StagingRow[];
  tagType: ActivatableTagType;
  editingRowId: string | null;
  editDraft: IdentityDraft;
  onStartEdit: (row: StagingRow) => void;
};

export function StagingTable({ rows, tagType, editingRowId, editDraft, onStartEdit }: Props) {
  // The whole Actions column disappears while a row is being edited, so no
  // other row can be started mid-session (PRD §7.8).
  const showActions = !editingRowId;

  return (
    <div className="table-card">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>TAG Type</th>
              <th>Code</th>
              <th>Status</th>
              <th>Device Name</th>
              <th>SKU</th>
              <th>Brand</th>
              <th>Model/Type</th>
              {showActions && <th className="actions-header">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="empty-row">
                  No TAGs scanned yet.
                </td>
              </tr>
            )}
            {rows.map((row) =>
              row.id === editingRowId ? (
                <EditingRow key={row.id} row={row} tagType={tagType} draft={editDraft} />
              ) : (
                <ReadRow
                  key={row.id}
                  row={row}
                  showActions={showActions}
                  onStartEdit={onStartEdit}
                />
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReadRow({
  row,
  showActions,
  onStartEdit,
}: {
  row: StagingRow;
  showActions: boolean;
  onStartEdit: Props["onStartEdit"];
}) {
  // Official rows mirror the matched stock unit, so there is nothing to
  // correct; Error rows can only be removed by re-scanning them.
  const editable = !row.outcome && (row.badge === "Self-Purchased" || row.badge === "Needs Info");

  return (
    <tr>
      <td>
        <TagTypeIcon tagType={row.tagType} />
      </td>
      <td className="field-name">{row.code}</td>
      <td>
        <StagingBadge
          badge={row.badge}
          outcome={row.outcome}
          reason={row.failureReason ?? row.errorReason}
        />
      </td>
      <td>{row.identity.deviceName || "—"}</td>
      <td>{row.identity.sku || "—"}</td>
      <td>{row.identity.brand || "—"}</td>
      <td>{row.identity.modelType || row.identity.category || "—"}</td>
      {showActions && (
        <td className="row-menu">
          {editable && (
            <button
              className="icon-button"
              aria-label={row.badge === "Needs Info" ? "Resolve row" : "Edit row"}
              title={row.badge === "Needs Info" ? "Resolve" : "Edit"}
              onClick={() => onStartEdit(row)}
            >
              {row.badge === "Needs Info" ? <Wrench size={16} /> : <Pencil size={16} />}
            </button>
          )}
        </td>
      )}
    </tr>
  );
}

function EditingRow({
  row,
  tagType,
  draft,
}: {
  row: StagingRow;
  tagType: ActivatableTagType;
  draft: IdentityDraft;
}) {
  return (
    <tr className="editing-row">
      <td>
        <TagTypeIcon tagType={row.tagType} />
      </td>
      <td className="field-name">{row.code}</td>
      <td>
        <StagingBadge badge={row.badge} outcome={null} reason={row.errorReason} />
      </td>
      <td>
        <DeviceNameControl draft={draft} />
      </td>
      <td>
        <SkuControl draft={draft} />
      </td>
      <td>
        <BrandControl draft={draft} />
      </td>
      <td>
        <ModelControl draft={draft} />
        {tagType === "RFID" && <CategoryControl draft={draft} name="row-category" />}
      </td>
    </tr>
  );
}
