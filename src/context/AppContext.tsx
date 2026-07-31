import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";
import type { Permission } from "../types/customField";

type Toast = { id: number; message: string; tone: "success" | "error" };
type AppContextValue = {
  permission: Permission;
  setPermission: (permission: Permission) => void;
  notify: (message: string, tone?: Toast["tone"]) => void;
  toasts: Toast[];
};
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [permission, setPermission] = useState<Permission>({
    read: true,
    create: true,
    update: true,
    delete: true,
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const value = useMemo<AppContextValue>(
    () => ({
      permission,
      setPermission,
      toasts,
      notify: (message, tone = "success") => {
        const id = Date.now();
        setToasts((current) => [...current, { id, message, tone }]);
        window.setTimeout(
          () => setToasts((current) => current.filter((toast) => toast.id !== id)),
          3600,
        );
      },
    }),
    [permission, toasts],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
