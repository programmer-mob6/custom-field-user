import { create } from "zustand";
import type { Permission } from "../types/permission";

type PermissionStore = {
  permission: Permission;
  setPermission: (permission: Permission) => void;
};

export const usePermissionStore = create<PermissionStore>((set) => ({
  permission: { read: true, create: true, update: true, delete: true },
  setPermission: (permission) => set({ permission }),
}));
