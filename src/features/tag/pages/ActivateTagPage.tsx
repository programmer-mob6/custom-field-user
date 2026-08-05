import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { History, ScanLine, Trash2 } from "lucide-react";
import { AppSidebar } from "../../../shared/components/AppSidebar";
import { Modal } from "../../../shared/components/Modal";
import { useToastStore } from "../../../shared/store/toastStore";
import { InsufficientQuotaDialog } from "../components/InsufficientQuotaDialog";
import { ScanPanel } from "../components/ScanPanel";
import { SelfPurchasedTemplate } from "../components/SelfPurchasedTemplate";
import { StagingTable } from "../components/StagingTable";
import { TagTypeField } from "../components/TagTypeField";
import { officialStock, unregisteredCodes } from "../data/activateTagSeed";
import {
  emptyIdentity,
  useActivateTagSession,
  type QuotaShortfall,
} from "../hooks/useActivateTagSession";
import { useIdentityDraft } from "../hooks/useIdentityDraft";
import { useTagStore } from "../store/tagStore";
import type { ActivatableTagType, StagingRow } from "../types/activateTag.types";

const NO_QUOTA_REASON =
  "No quota available for this TAG Type. Contact your administrator or request more allocation.";
const NEEDS_INFO_REASON = "Resolve or remove all incomplete rows before submitting.";

export default function ActivateTagPage() {
  const navigate = useNavigate();
  const tags = useTagStore((state) => state.tags);
  const quotas = useTagStore((state) => state.quotas);
  const notify = useToastStore((state) => state.notify);
  const session = useActivateTagSession();

  const [scanMode, setScanMode] = useState<"add" | "remove" | null>(null);
  const [shortfalls, setShortfalls] = useState<QuotaShortfall[] | null>(null);
  const [pendingTagType, setPendingTagType] = useState<ActivatableTagType | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmCancelEdit, setConfirmCancelEdit] = useState(false);

  const editDraft = useIdentityDraft(session.tagType ?? "RFID", emptyIdentity);
  const editingRow = session.rows.find((row) => row.id === session.editingRowId);
  const editDirty =
    editingRow && JSON.stringify(editDraft.draft) !== JSON.stringify(editingRow.identity);

  // Both RFID pools have to be empty before scanning is pointless; a single
  // exhausted pool still leaves the other one usable (PRD §5.1).
  const outOfQuota = (() => {
    if (!session.tagType) return false;
    if (session.tagType === "RFID") {
      return session.remainingFor("rfid-object") <= 0 && session.remainingFor("rfid-user") <= 0;
    }
    return session.remainingFor(session.tagType.toLowerCase() as "nfc") <= 0;
  })();

  const stagedCodes = new Set(session.rows.map((row) => row.code));
  const scanSuggestions =
    scanMode === "remove"
      ? session.rows.filter((row) => !row.outcome).map((row) => row.code)
      : [
          ...officialStock
            .filter((unit) => unit.tagType === session.tagType)
            .map((unit) => unit.code),
          ...(unregisteredCodes[session.tagType ?? ""] ?? []),
        ].filter((code) => !stagedCodes.has(code) && !tags.some((tag) => tag.code === code));

  const selectTagType = (next: ActivatableTagType) => {
    // Switching type wipes the session, so confirm once the table has rows.
    if (session.rows.length > 0) {
      setPendingTagType(next);
      return;
    }
    session.setTagType(next);
  };

  const startEdit = (row: StagingRow) => {
    editDraft.reset(row.identity);
    session.setEditingRowId(row.id);
  };

  const saveEdit = () => {
    if (!session.editingRowId || !editDraft.isValid) return;
    session.saveRowIdentity(session.editingRowId, editDraft.resolved);
  };

  const cancelEdit = () => {
    if (editDirty) {
      setConfirmCancelEdit(true);
      return;
    }
    session.setEditingRowId(null);
  };

  const submit = () => {
    const result = session.submit();
    if (result.kind === "insufficient-quota") {
      setShortfalls(result.shortfalls);
      return;
    }
    const parts = [`Success, ${result.activated} TAGs have been activated`];
    if (result.waiting > 0) parts.push(`${result.waiting} pending approval`);
    if (result.failed > 0) parts.push(`${result.failed} failed`);
    notify(`${parts.join(", ")}.`, result.failed > 0 ? "error" : "success");
  };

  const leave = () => navigate("/global-settings/tag");
  const editing = Boolean(session.editingRowId);

  return (
    <main className="app-shell">
      <AppSidebar />
      <section className="content">
        <div className="breadcrumb">
          <Link to="/global-settings/tag">TAG</Link> <span>/</span>
          <Link to="/global-settings/tag">All TAGs</Link> <span>/</span> Activate TAG
        </div>
        <div className="page-title">
          <div>
            <h1>Activate TAG</h1>
            <p>Scan the physical TAGs you want to add to this client's registry.</p>
          </div>
          <div className="toolbar-tools">
            <button
              className="tool-button"
              onClick={() => notify("Event Log is not part of this build.")}
            >
              <History size={18} /> Event Log
            </button>
          </div>
        </div>

        <TagTypeField
          tagType={session.tagType}
          onSelect={selectTagType}
          remainingFor={session.remainingFor}
          quotas={quotas}
        />

        <SelfPurchasedTemplate
          tagType={session.tagType}
          byoEnabled={session.byoEnabled}
          onApply={session.setTemplate}
          remainingFor={session.remainingFor}
          quotas={quotas}
        />

        {session.tagType && (
          <>
            <div className="toolbar">
              <div className="toolbar-tools">
                <span className="total-scanned">Total Scanned: {session.rows.length}</span>
              </div>
              <div className="toolbar-tools">
                <button
                  className="tool-button"
                  disabled={editing || session.rows.length === 0}
                  onClick={() => setScanMode("remove")}
                >
                  <Trash2 size={18} /> Remove
                </button>
                <button
                  className="button primary create-button"
                  disabled={editing || outOfQuota}
                  title={outOfQuota ? NO_QUOTA_REASON : undefined}
                  onClick={() => setScanMode("add")}
                >
                  <ScanLine size={18} /> Scan TAG
                </button>
              </div>
            </div>

            <StagingTable
              rows={session.rows}
              tagType={session.tagType}
              editingRowId={session.editingRowId}
              editDraft={editDraft}
              onStartEdit={startEdit}
            />

            <footer className="activate-footer">
              {editing ? (
                <>
                  <button className="button secondary" onClick={cancelEdit}>
                    Cancel
                  </button>
                  <button
                    className="button primary"
                    disabled={!editDraft.isValid}
                    onClick={saveEdit}
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="button secondary"
                    onClick={() => (session.rows.length > 0 ? setConfirmLeave(true) : leave())}
                  >
                    Cancel
                  </button>
                  <button
                    className="button primary"
                    disabled={!session.canSubmit}
                    title={session.hasNeedsInfo ? NEEDS_INFO_REASON : undefined}
                    onClick={submit}
                  >
                    Submit
                  </button>
                </>
              )}
            </footer>
          </>
        )}
      </section>

      {scanMode && session.tagType && (
        <ScanPanel
          tagType={session.tagType}
          mode={scanMode}
          suggestions={scanSuggestions}
          onCapture={(code) =>
            scanMode === "add" ? session.addScannedCode(code) : session.removeByCode(code)
          }
          onClose={() => setScanMode(null)}
        />
      )}

      {shortfalls && (
        <InsufficientQuotaDialog shortfalls={shortfalls} onClose={() => setShortfalls(null)} />
      )}

      {pendingTagType && (
        <ConfirmDialog
          title="Change TAG Type"
          body="Progress will not be saved. Every row scanned in this session will be cleared."
          confirmLabel="Change"
          onConfirm={() => {
            session.setTagType(pendingTagType);
            setPendingTagType(null);
          }}
          onClose={() => setPendingTagType(null)}
        />
      )}

      {confirmLeave && (
        <ConfirmDialog
          title="Cancel Activate TAG"
          body="Progress will not be saved. Every row scanned in this session will be discarded."
          confirmLabel="Discard"
          onConfirm={leave}
          onClose={() => setConfirmLeave(false)}
        />
      )}

      {confirmCancelEdit && (
        <ConfirmDialog
          title="Cancel Edit"
          body="Changes will not be saved."
          confirmLabel="Discard"
          onConfirm={() => {
            session.setEditingRowId(null);
            setConfirmCancelEdit(false);
          }}
          onClose={() => setConfirmCancelEdit(false)}
        />
      )}
    </main>
  );
}

type ConfirmProps = {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
};

function ConfirmDialog({ title, body, confirmLabel, onConfirm, onClose }: ConfirmProps) {
  return (
    <Modal title={title} onClose={onClose} role="alertdialog">
      <p>{body}</p>
      <footer className="modal-footer">
        <button className="button secondary" onClick={onClose}>
          Keep editing
        </button>
        <button className="button danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </footer>
    </Modal>
  );
}
