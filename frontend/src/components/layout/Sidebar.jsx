import { NavLink } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";

import "./Sidebar.css";

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "▦",
    roles: ["admin", "manager", "agent"],
  },
  {
    label: "Customers",
    path: "/customers",
    icon: "♟",
    roles: ["admin", "manager", "agent"],
  },
  {
    label: "Service Requests",
    path: "/requests",
    icon: "▤",
    roles: ["admin", "manager", "agent"],
  },
  {
    label: "Teams",
    path: "/teams",
    icon: "♧",
    roles: ["admin", "manager"],
  },
  {
    label: "Users",
    path: "/users",
    icon: "♙",
    roles: ["admin"],
  },
  {
    label: "Reports",
    path: "/reports",
    icon: "▥",
    roles: ["admin", "manager"],
  },
];

const SupportLink = ({
  to,
  icon,
  children,
  badge,
  onClick,
}) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `sidebar-nav-item sidebar-support-item ${
        isActive ? "sidebar-nav-item-active" : ""
      }`
    }
  >
    {({ isActive }) => (
      <>
        {isActive && <span className="active-indicator" />}
        <span className="sidebar-nav-icon">{icon}</span>
        <span>{children}</span>
        {badge > 0 && (
          <span className="notification-badge">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </>
    )}
  </NavLink>
);

const Sidebar = ({ isOpen, onClose }) => {
  const user = useAppSelector((state) => state.auth.user);
  const unreadCount = useAppSelector(
    (state) => state.notifications?.unreadCount || 0
  );

  const role = user?.role || "agent";
  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(role)
  );

  const getInitials = () => {
    if (!user?.name) {
      return "U";
    }

    return user.name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatRole = (value) => {
    if (!value) {
      return "User";
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo">CS</div>

          <div>
            <h1>Customer Support</h1>
            <p>Management System</p>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar-wrapper">
            <div className="sidebar-avatar">{getInitials()}</div>
            <span className="online-indicator" />
          </div>

          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name || "User"}</p>
            <p className="sidebar-user-role">{formatRole(role)}</p>

            <div className="online-status">
              <span />
              Online
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          <p className="sidebar-section-title">Main Menu</p>

          <nav className="sidebar-nav">
            {visibleMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${
                    isActive ? "sidebar-nav-item-active" : ""
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="active-indicator" />}
                    <span className="sidebar-nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <p className="sidebar-section-title sidebar-support-title">
            Support
          </p>

          <nav className="sidebar-nav">
            <SupportLink
              to="/notifications"
              icon="♢"
              badge={unreadCount}
              onClick={onClose}
            >
              Notifications
            </SupportLink>

            <SupportLink
              to="/profile"
              icon="⚙"
              onClick={onClose}
            >
              Settings
            </SupportLink>
          </nav>

          <div className="sidebar-help">
            <div className="sidebar-help-icon">?</div>
            <h3>Need help?</h3>
            <p>
              Contact system support if you need assistance.
            </p>
            <button type="button">Contact Support</button>
          </div>
        </div>

        <div className="sidebar-footer">
          <p>Customer Support Management</p>
          <span>v1.0.0</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
