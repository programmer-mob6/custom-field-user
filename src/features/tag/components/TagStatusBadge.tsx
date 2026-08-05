import type { TagStatus } from "../types/tag.types";

type Tone = "green" | "blue" | "yellow" | "red" | "black";

// New status? Register its label/tone here — nothing else needs to change.
const TAG_STATUS_CONFIG: Record<TagStatus, { label: string; tone: Tone }> = {
  Available: { label: "Available", tone: "green" },
  Paired: { label: "Paired", tone: "blue" },
  Reserved: { label: "Reserved", tone: "yellow" },
  "To be Returned": { label: "To be Returned", tone: "yellow" },
  "Damaged/Missing": { label: "Damaged/Missing", tone: "red" },
  Retired: { label: "Retired", tone: "black" },
};

export function TagStatusBadge({ status }: { status: TagStatus }) {
  const { label, tone } = TAG_STATUS_CONFIG[status];
  return <span className={`badge-colored badge-${tone}`}>{label}</span>;
}
