import { X } from "lucide-react";
import type { IdentityDraft } from "../hooks/useIdentityDraft";
import { tagCategories } from "../types/tag.types";

type Props = { draft: IdentityDraft; disabled?: boolean };

export function DeviceNameControl({ draft, disabled }: Props) {
  return (
    <select
      className={draft.missing.deviceName ? "invalid" : ""}
      value={draft.draft.deviceName}
      disabled={disabled}
      aria-label="Device Name"
      onChange={(event) => draft.update({ deviceName: event.target.value })}
    >
      <option value="">Search and select device name...</option>
      {draft.deviceOptions.map((option) => (
        <option key={option.name} value={option.name}>
          {option.name}
        </option>
      ))}
    </select>
  );
}

export function SkuControl({ draft, disabled }: Props) {
  return (
    <div className="sku-control">
      <select
        value={draft.draft.sku ?? ""}
        disabled={disabled}
        aria-label="SKU"
        onChange={(event) => draft.selectSku(event.target.value)}
      >
        <option value="">Search and select SKU (optional)...</option>
        {draft.skuOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {option.code}
          </option>
        ))}
      </select>
      {draft.skuLocked && !disabled && (
        <button className="icon-button" aria-label="Clear SKU" onClick={draft.clearSku}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export function BrandControl({ draft, disabled }: Props) {
  return (
    <input
      className={draft.missing.brand ? "invalid" : ""}
      value={draft.draft.brand}
      // Filled from the SKU and read-only whenever a SKU is chosen.
      disabled={disabled || draft.skuLocked}
      placeholder="Enter brand"
      aria-label="Brand"
      onChange={(event) => draft.update({ brand: event.target.value })}
    />
  );
}

export function ModelControl({ draft, disabled }: Props) {
  return (
    <input
      value={draft.draft.modelType}
      disabled={disabled || draft.skuLocked}
      placeholder="Enter model (optional)"
      aria-label="Model"
      onChange={(event) => draft.update({ modelType: event.target.value })}
    />
  );
}

// RFID only — the one TAG Type whose licenses are split into two pools.
export function CategoryControl({ draft, disabled, name }: Props & { name: string }) {
  return (
    <div className={`radio-row ${draft.missing.category ? "invalid" : ""}`}>
      {tagCategories.map((category) => (
        <label key={category}>
          <input
            type="radio"
            name={name}
            checked={draft.draft.category === category}
            disabled={disabled || draft.skuLocked}
            onChange={() => draft.update({ category })}
          />
          {category}
        </label>
      ))}
    </div>
  );
}
