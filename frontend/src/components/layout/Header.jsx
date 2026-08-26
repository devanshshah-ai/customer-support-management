import { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAppDispatch,
  useAppSelector,
} from "../../hooks/reduxHooks";

import { logout } from "../../features/auth/authSlice";

import "./Header.css";

const pageInfo = {
  "/dashboard": {
    title: "Dashboard",
    description:
      "Overview of your support operations",
  },
  "/customers": {
    title: "Customers",
    description:
      "Manage your customer information",
  },
  "/requests": {
    title: "Service Requests",
    description:
      "Track and manage service requests",
  },
  "/teams": {
    title: "Teams",
    description:
      "Manage support teams and members",
  },
  "/users": {
    title: "Users",
    description:
      "Manage system users and permissions",
  },
  "/reports": {
    title: "Reports",
    description:
      "View support performance reports",
  },
};

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const user = useAppSelector(
    (state) => state.auth.user
  );

  const [profileOpen, setProfileOpen] =
    useState(false);

  const currentPage =
    pageInfo[location.pathname] || {
      title: "Customer Support",
      description:
        "Manage your support operations",
    };

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

  const formatRole = (role) => {
    if (!role) {
      return "User";
    }

    return (
      role.charAt(0).toUpperCase() +
      role.slice(1)
    );
  };

  const handleLogout = () => {
    dispatch(logout());

    setProfileOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="header-page-info">
          <h2>{currentPage.title}</h2>
          <p>{currentPage.description}</p>
        </div>
      </div>

      <div className="header-right">
        <button
          type="button"
          className="notification-button"
          aria-label="Notifications"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>

          <span className="notification-dot" />
        </button>

        <div className="header-divider" />

        <div className="profile-container">
          <button
            type="button"
            className="profile-button"
            onClick={() =>
              setProfileOpen(
                (current) => !current
              )
            }
          >
            <div className="header-avatar-wrapper">
              <div className="header-avatar">
                {getInitials()}
              </div>

              <span className="header-online-dot" />
            </div>

            <div className="header-user-info">
              <p>
                {user?.name || "User"}
              </p>

              <span>
                {formatRole(user?.role)}
              </span>
            </div>

            <svg
              className={`profile-chevron ${
                profileOpen
                  ? "profile-chevron-open"
                  : ""
              }`}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <p>
                  {user?.name || "User"}
                </p>

                <span>
                  {user?.email || ""}
                </span>

                <div className="role-badge">
                  <span />
                  {formatRole(user?.role)}
                </div>
              </div>

              <div className="profile-dropdown-actions">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                >
                  <span>⚙</span>
                  Account Settings
                </button>

                <button
                  type="button"
                  className="logout-button"
                  onClick={handleLogout}
                >
                  <span>↪</span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;