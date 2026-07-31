import { useEffect, useRef, type PropsWithChildren } from "react";

type Props = PropsWithChildren<{ title: string; onClose: () => void; className?: string }>;
export function Modal({ title, onClose, children, className = "" }: Props) {
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeButton.current?.focus();
  }, []);
  return (
    <div className="modal-backdrop" role="presentation">
      <section className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <h2>{title}</h2>
          <button
            ref={closeButton}
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
