import type { ComponentType } from "react";
import { useAppContext } from "../context/AppContext";
import type { Permission } from "../types/customField";

export function withPermission<P extends object>(
  Wrapped: ComponentType<P>,
  required: keyof Permission,
) {
  function PermissionGate(props: P) {
    const { permission } = useAppContext();
    if (!permission[required]) return null;
    return <Wrapped {...props} />;
  }
  PermissionGate.displayName = `withPermission(${Wrapped.displayName || Wrapped.name || "Component"})`;
  return PermissionGate;
}
