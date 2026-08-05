import { Bluetooth, Nfc, QrCode, Radio, Satellite } from "lucide-react";
import type { ComponentType } from "react";
import type { TagType } from "../types/tag.types";

type IconProps = { size?: number };

// New TAG Type? Register its icon here — nothing else needs to change.
const TAG_TYPE_ICONS: Record<TagType, ComponentType<IconProps>> = {
  RFID: Radio,
  NFC: Nfc,
  QR: QrCode,
  BLE: Bluetooth,
  GPS: Satellite,
};

type Props = { tagType: TagType; size?: number };

export function TagTypeIcon({ tagType, size = 16 }: Props) {
  const Icon = TAG_TYPE_ICONS[tagType];
  return <Icon size={size} aria-label={tagType} />;
}
