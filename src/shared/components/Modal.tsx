import type { PropsWithChildren } from "react";
import {
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogCloseTrigger,
} from "@chakra-ui/react";

type Props = PropsWithChildren<{
  title: string;
  onClose: () => void;
  className?: string;
  role?: "dialog" | "alertdialog";
}>;

export function Modal({ title, onClose, children, className = "", role = "dialog" }: Props) {
  return (
    <DialogRoot open role={role} onOpenChange={(details) => !details.open && onClose()}>
      <DialogBackdrop className="modal-backdrop" />
      <DialogPositioner>
        <DialogContent className={`modal ${className}`}>
          <DialogHeader>
            <DialogTitle asChild>
              <h2>{title}</h2>
            </DialogTitle>
            <DialogCloseTrigger asChild>
              <button className="icon-button" aria-label="Close dialog">
                ×
              </button>
            </DialogCloseTrigger>
          </DialogHeader>
          {children}
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
