import { quotaCategoryFor } from "../hooks/useActivateTagSession";
import { activatableTagTypes, type ActivatableTagType } from "../types/activateTag.types";
import type { QuotaAllocation, QuotaCategory } from "../types/tag.types";

const RFID_HELPER =
  "RFID licenses are split by Object TAG and User TAG — remaining quota shown per SKU match, or below once you select a Type for self-purchased TAGs.";

// GPS registers by IMEI upload / manual entry rather than a live scan, so it
// is not reachable from this scan-based build.
const GPS_UNAVAILABLE = "GPS activation uses Upload File / Manual Entry, which isn't built yet.";

type Props = {
  tagType: ActivatableTagType | null;
  onSelect: (next: ActivatableTagType) => void;
  remainingFor: (category: QuotaCategory) => number;
  quotas: QuotaAllocation;
};

export function TagTypeField({ tagType, onSelect, remainingFor, quotas }: Props) {
  const helper = () => {
    if (!tagType) return null;
    if (tagType === "RFID") return { text: RFID_HELPER, danger: false };
    const category = quotaCategoryFor(tagType, null);
    if (!category) return null;
    const remaining = remainingFor(category);
    return {
      text: `${remaining} of ${quotas[category]} ${tagType} TAG licenses remaining.`,
      danger: remaining <= 0,
    };
  };
  const hint = helper();

  return (
    <div className="activate-field">
      <span className="activate-label">TAG Type*</span>
      <div className="radio-row">
        {activatableTagTypes.map((option) => {
          const unavailable = option === "GPS";
          return (
            <label key={option} title={unavailable ? GPS_UNAVAILABLE : undefined}>
              <input
                type="radio"
                name="tag-type"
                checked={tagType === option}
                disabled={unavailable}
                onChange={() => onSelect(option)}
              />
              {option}
            </label>
          );
        })}
      </div>
      {hint && <p className={`activate-helper ${hint.danger ? "danger-text" : ""}`}>{hint.text}</p>}
    </div>
  );
}
