import { Modal } from "../../../shared/components/Modal";
type Props = {
  onCloseClick: () => void;
};

export function ChangelogModal({ onCloseClick }: Props) {
  return (
    <Modal title="Changelog: Custom Field" onClose={onCloseClick}>
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
        <button className="button secondary" onClick={onCloseClick}>
          Close
        </button>
      </footer>
    </Modal>
  );
}
