import {
  X,
  User,
  Mail,
  Shield,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import "./ViewUserModal.css";

const ViewUserModal = ({
  user,
  onClose,
}) => {
  if (!user) {
    return null;
  }

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const roleLabel =
    user.role
      ?.charAt(0)
      ?.toUpperCase() +
      user.role?.slice(1);

  return (
    <div
      className="view-user-overlay"
      onMouseDown={onClose}
    >
      <div
        className="view-user-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* Header */}

        <div className="view-user-header">

          <div className="view-user-title">

            <div className="view-user-icon">
              <User size={19} />
            </div>

            <div>
              <h2>User Details</h2>
              <p>
                View user account information.
              </p>
            </div>

          </div>

          <button
            type="button"
            className="view-user-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={19} />
          </button>

        </div>


        {/* Profile */}

        <div className="view-user-content">

          <div className="view-user-profile">

            <div className="view-user-avatar">
              {user.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div className="view-user-profile-info">
              <h3>{user.name}</h3>

              <span>
                {user.email}
              </span>
            </div>

            <div
              className={
                user.isActive
                  ? "view-user-status view-user-status-active"
                  : "view-user-status view-user-status-inactive"
              }
            >
              {user.isActive ? (
                <CheckCircle2 size={14} />
              ) : (
                <XCircle size={14} />
              )}

              {user.isActive
                ? "Active"
                : "Inactive"}
            </div>

          </div>


          {/* Details */}

          <div className="view-user-details">

            <div className="view-user-detail">

              <div className="view-user-detail-icon">
                <User size={16} />
              </div>

              <div>
                <span>Full Name</span>
                <strong>
                  {user.name || "-"}
                </strong>
              </div>

            </div>


            <div className="view-user-detail">

              <div className="view-user-detail-icon">
                <Mail size={16} />
              </div>

              <div>
                <span>Email Address</span>
                <strong>
                  {user.email || "-"}
                </strong>
              </div>

            </div>


            <div className="view-user-detail">

              <div className="view-user-detail-icon">
                <Shield size={16} />
              </div>

              <div>
                <span>Role</span>
                <strong>
                  {roleLabel || "-"}
                </strong>
              </div>

            </div>


            <div className="view-user-detail">

              <div className="view-user-detail-icon">
                {user.isActive ? (
                  <CheckCircle2
                    size={16}
                  />
                ) : (
                  <XCircle size={16} />
                )}
              </div>

              <div>
                <span>Account Status</span>
                <strong>
                  {user.isActive
                    ? "Active"
                    : "Inactive"}
                </strong>
              </div>

            </div>


            <div className="view-user-detail">

              <div className="view-user-detail-icon">
                <CalendarDays
                  size={16}
                />
              </div>

              <div>
                <span>Created At</span>
                <strong>
                  {formatDate(
                    user.createdAt
                  )}
                </strong>
              </div>

            </div>


            <div className="view-user-detail">

              <div className="view-user-detail-icon">
                <Clock size={16} />
              </div>

              <div>
                <span>Last Updated</span>
                <strong>
                  {formatDate(
                    user.updatedAt
                  )}
                </strong>
              </div>

            </div>

          </div>

        </div>


        {/* Footer */}

        <div className="view-user-footer">

          <button
            type="button"
            className="view-user-close-button"
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </div>
    </div>
  );
};

export default ViewUserModal;