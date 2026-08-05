import type { CommitOutcome, StagingBadge as Badge } from "../types/activateTag.types";

type Tone = "green" | "blue" | "yellow" | "red";

const BADGE_TONE: Record<Badge, Tone> = {
  Official: "blue",
  "Self-Purchased": "yellow",
  "Needs Info": "yellow",
  Error: "red",
};

const OUTCOME_TONE: Record<CommitOutcome, Tone> = {
  Activated: "green",
  "Waiting for Approval": "yellow",
  Failed: "red",
};

type Props = {
  badge: Badge;
  outcome: CommitOutcome | null;
  // Tooltip copy for the "Error" and "Failed" states.
  reason: string | null;
};

// Once a row is committed its outcome replaces the staging badge — the row
// becomes part of the session history (PRD §7.8).
export function StagingBadge({ badge, outcome, reason }: Props) {
  const label = outcome ?? badge;
  const tone = outcome ? OUTCOME_TONE[outcome] : BADGE_TONE[badge];
  return (
    <span className={`badge-colored badge-${tone}`} title={reason ?? undefined}>
      {label}
    </span>
  );
}
