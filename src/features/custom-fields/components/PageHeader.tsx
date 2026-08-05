import { useShallow } from "zustand/shallow";
import { usePermissionStore } from "../../../shared/store/permissionStore";

export function PageHeader() {
  const { permission, setPermission } = usePermissionStore(
    useShallow((state) => ({
      permission: state.permission.create,
      setPermission: state.setPermission,
    })),
  );
  return (
    <>
      <div className="breadcrumb">
        Global Settings <span>/</span> User
      </div>
      <div className="page-title">
        <div>
          <h1>User</h1>
          <p>Manage users, organizational structure, and profile settings.</p>
        </div>
        <select
          className="role-select"
          value={permission ? "admin" : "readonly"}
          onChange={(event) =>
            setPermission(
              event.target.value === "admin"
                ? { read: true, create: true, update: true, delete: true }
                : { read: true, create: false, update: false, delete: false },
            )
          }
        >
          <option value="admin">Total Control</option>
          <option value="readonly">Read Only</option>
        </select>
      </div>
      <div className="tabs">
        <button>User List</button>
        <button>Position</button>
        <button>Division</button>
        <button className="selected">Custom Field</button>
      </div>
    </>
  );
}
