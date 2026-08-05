import { NavLink } from "react-router-dom";

export function AppSidebar() {
  return (
    <aside>
      <div className="brand">
        <span>■</span> samurai
      </div>
      <nav>
        <p>GLOBAL SETTINGS</p>
        <a>Organization</a>
        <NavLink
          to="/global-settings/user/custom-fields"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          User
        </NavLink>
        <NavLink to="/global-settings/tag" className={({ isActive }) => (isActive ? "active" : "")}>
          TAG
        </NavLink>
        <a>Role & Permission</a>
      </nav>
      <div className="profile">
        AW
        <br />
        <small>Admin Workspace</small>
      </div>
    </aside>
  );
}
