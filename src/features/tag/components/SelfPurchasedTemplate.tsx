import { useState } from "react";
import { quotaCategoryFor } from "../hooks/useActivateTagSession";
import { useIdentityDraft } from "../hooks/useIdentityDraft";
import type { ActivatableTagType, TagIdentity } from "../types/activateTag.types";
import type { QuotaAllocation, QuotaCategory } from "../types/tag.types";
import {
  BrandControl,
  CategoryControl,
  DeviceNameControl,
  ModelControl,
  SkuControl,
} from "./IdentityControls";

const DESCRIPTION =
  "If some of your TAGs aren't part of your distributor's registered stock, add their details here once — it'll be applied automatically to every unmatched TAG you scan in this session, so you don't have to fill it in per TAG.";
const LOCKED_REASON =
  "Self-purchased activation is not enabled for your account. Contact your administrator.";
const NO_TYPE_REASON = "Select a TAG Type first.";

const emptyDraft: TagIdentity = {
  deviceName: "",
  sku: null,
  brand: "",
  modelType: "",
  category: null,
};

type QuotaProps = {
  remainingFor: (category: QuotaCategory) => number;
  quotas: QuotaAllocation;
};

type Props = QuotaProps & {
  tagType: ActivatableTagType | null;
  byoEnabled: boolean;
  onApply: (identity: TagIdentity | null) => void;
};

export function SelfPurchasedTemplate({
  tagType,
  byoEnabled,
  onApply,
  remainingFor,
  quotas,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const locked = !byoEnabled || !tagType;
  const lockReason = !byoEnabled ? LOCKED_REASON : NO_TYPE_REASON;

  const toggle = () => {
    // Collapsing also clears the template — the fields and the value it feeds
    // to unmatched rows go away together.
    if (expanded) onApply(null);
    setExpanded((current) => !current);
  };

  return (
    <div className={`template-section ${locked ? "locked" : ""}`}>
      <button
        className="template-toggle"
        disabled={locked}
        title={locked ? lockReason : undefined}
        onClick={toggle}
      >
        {expanded ? "− Remove template" : "+ Add self-purchased template"}
        {locked && " 🔒"}
      </button>
      <p className="activate-helper">{DESCRIPTION}</p>
      {expanded && tagType && (
        <TemplateFields
          key={tagType}
          tagType={tagType}
          onApply={onApply}
          remainingFor={remainingFor}
          quotas={quotas}
        />
      )}
    </div>
  );
}

function TemplateFields({
  tagType,
  onApply,
  remainingFor,
  quotas,
}: QuotaProps & { tagType: ActivatableTagType; onApply: Props["onApply"] }) {
  const draft = useIdentityDraft(tagType, emptyDraft, (identity, isValid) =>
    onApply(isValid ? identity : null),
  );

  // RFID quota only becomes a single number once the row's pool is known —
  // that is, once a Type is picked or derived from the SKU (PRD §7.8).
  const category = quotaCategoryFor(tagType, draft.draft.category);
  const rfidQuota =
    tagType === "RFID" && category
      ? {
          remaining: remainingFor(category),
          total: quotas[category],
          label: draft.draft.category,
        }
      : null;

  return (
    <div className="template-fields">
      <label className="activate-field">
        <span className="activate-label">Device Name*</span>
        <DeviceNameControl draft={draft} />
      </label>
      <label className="activate-field">
        <span className="activate-label">SKU</span>
        <SkuControl draft={draft} />
        <p className="activate-helper">
          Leave empty if this is a self-purchased TAG with no matching SKU.
        </p>
      </label>
      <label className="activate-field">
        <span className="activate-label">Brand*</span>
        <BrandControl draft={draft} />
      </label>
      <label className="activate-field">
        <span className="activate-label">Model</span>
        <ModelControl draft={draft} />
      </label>
      {tagType === "RFID" && (
        <div className="activate-field">
          <span className="activate-label">Type*</span>
          <CategoryControl draft={draft} name="template-category" />
          {rfidQuota && (
            <p className={`activate-helper ${rfidQuota.remaining <= 0 ? "danger-text" : ""}`}>
              {rfidQuota.remaining} of {rfidQuota.total} RFID – {rfidQuota.label} licenses
              remaining.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
