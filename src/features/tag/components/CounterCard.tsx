import type { ReactNode } from "react";

type Props = {
  label: string;
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
};

// Dumb shell — no knowledge of license vs. health counting, just renders
// whatever number/breakdown its caller hands it.
export function CounterCard({ label, selected, onClick, children }: Props) {
  return (
    <button
      type="button"
      className={`counter-card ${selected ? "selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <div className="counter-label">{label}</div>
      {children}
    </button>
  );
}
