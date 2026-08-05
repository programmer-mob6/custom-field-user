import type { TagSource } from "../types/tag.types";

// New source? Register its tone here — nothing else needs to change.
const TAG_SOURCE_TONE: Record<TagSource, "blue" | "yellow"> = {
  Official: "blue",
  "Self-Purchased": "yellow",
};

export function TagSourceBadge({ source }: { source: TagSource | null }) {
  if (!source) return <>—</>;
  return <span className={`badge-colored badge-${TAG_SOURCE_TONE[source]}`}>{source}</span>;
}
