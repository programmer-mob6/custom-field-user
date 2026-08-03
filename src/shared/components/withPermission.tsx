import type { ComponentType } from "react";
import { usePermissionStore } from "../store/permissionStore";
import type { Permission } from "../types/permission";

export function withPermission<P extends object>(
  Wrapped: ComponentType<P>,
  required: keyof Permission,
) {
  function PermissionGate(props: P) {
    const permission = usePermissionStore((state) => state.permission);
    if (!permission[required]) return null;
    return <Wrapped {...props} />;
  }
  PermissionGate.displayName = `withPermission(${Wrapped.displayName || Wrapped.name || "Component"})`;
  return PermissionGate;
}
