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

const Sidebar = ({ isOpen, onClose }) => {
  const user = useAppSelector(
    (state) => state.auth.user
  );

  const role = user?.role || "agent";

  const visibleMenuItems = menuItems.filter(
    (item) => item.roles.includes(role)
  );

  const getInitials = () => {
    if (!user?.name) {
      return "U";
    }

    return user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatRole = (value) => {
    if (!value) {
      return "User";
    }

    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
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

      <aside
        className={`sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo">
            CS
          </div>

          <div>
            <h1>Customer Support</h1>
            <p>Management System</p>
          </div>
        </div>

        {/* User */}
        <div className="sidebar-user">
          <div className="sidebar-avatar-wrapper">
            <div className="sidebar-avatar">
              {getInitials()}
            </div>

            <span className="online-indicator" />
          </div>

          <div className="sidebar-user-info">
            <p className="sidebar-user-name">
              {user?.name || "User"}
            </p>

            <p className="sidebar-user-role">
              {formatRole(role)}
            </p>

            <div className="online-status">
              <span />
              Online
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="sidebar-content">
          <p className="sidebar-section-title">
            Main Menu
          </p>

          <nav className="sidebar-nav">
            {visibleMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${
                    isActive
                      ? "sidebar-nav-item-active"
                      : ""
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="active-indicator" />
                    )}

                    <span className="sidebar-nav-icon">
                      {item.icon}
                    </span>

                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Support */}
          <p className="sidebar-section-title sidebar-support-title">
            Support
          </p>

          <div className="sidebar-nav">
            <button
              type="button"
              className="sidebar-nav-item sidebar-support-item"
            >
              <span className="sidebar-nav-icon">
                ♢
              </span>

              <span>Notifications</span>

              <span className="notification-badge">
                3
              </span>
            </button>

            <button
              type="button"
              className="sidebar-nav-item sidebar-support-item"
            >
              <span className="sidebar-nav-icon">
                ⚙
              </span>

              <span>Settings</span>
            </button>
          </div>

          {/* Help */}
          <div className="sidebar-help">
            <div className="sidebar-help-icon">
              ?
            </div>

            <h3>Need help?</h3>

            <p>
              Contact system support if you need
              assistance.
            </p>

            <button type="button">
              Contact Support
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <p>Customer Support Management</p>
          <span>v1.0.0</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;