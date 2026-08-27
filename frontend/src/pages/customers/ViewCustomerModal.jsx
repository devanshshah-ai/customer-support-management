import { X, Pencil, User } from "lucide-react";

import "./ViewCustomerModal.css";

const ViewCustomerModal = ({
  customer,
  onClose,
  onEdit,
}) => {
  if (!customer) {
    return null;
  }

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  const formatValue = (value) => {
    if (!value) {
      return "—";
    }

    return value;
  };

  const formatCustomerType = (type) => {
    if (!type) {
      return "—";
    }

    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatAccountStatus = (status) => {
    if (!status) {
      return "—";
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div
      className="view-customer-overlay"
      onMouseDown={onClose}
    >
      <div
        className="view-customer-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}
        <div className="view-customer-header">
          <div className="view-customer-header-title">
            <div className="view-customer-header-avatar">
              {getInitials(customer.name) || (
                <User size={18} />
              )}
            </div>

            <div className="view-customer-header-text">
              <h2>Customer Details</h2>
              <p>Customer profile information</p>
            </div>
          </div>

          <button
            type="button"
            className="view-customer-close"
            onClick={onClose}
            aria-label="Close customer details"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="view-customer-body">
          <div className="view-customer-profile">
            <div className="view-customer-profile-avatar">
              {getInitials(customer.name) || (
                <User size={22} />
              )}
            </div>

            <div className="view-customer-profile-info">
              <h3>{formatValue(customer.name)}</h3>

              <p>{formatValue(customer.email)}</p>

              <span
                className={`view-customer-status view-customer-status-${customer.accountStatus}`}
              >
                {formatAccountStatus(
                  customer.accountStatus
                )}
              </span>
            </div>
          </div>

          <div className="view-customer-details-grid">
            <div className="view-customer-detail-card">
              <span>Full Name</span>
              <strong>
                {formatValue(customer.name)}
              </strong>
            </div>

            <div className="view-customer-detail-card">
              <span>Email</span>
              <strong>
                {formatValue(customer.email)}
              </strong>
            </div>

            <div className="view-customer-detail-card">
              <span>Phone</span>
              <strong>
                {formatValue(customer.phone)}
              </strong>
            </div>

            <div className="view-customer-detail-card">
              <span>Company</span>
              <strong>
                {formatValue(customer.company)}
              </strong>
            </div>

            <div className="view-customer-detail-card">
              <span>Location</span>
              <strong>
                {formatValue(customer.location)}
              </strong>
            </div>

            <div className="view-customer-detail-card">
              <span>Customer Type</span>
              <strong>
                {formatCustomerType(
                  customer.customerType
                )}
              </strong>
            </div>

            <div className="view-customer-detail-card full-width">
              <span>Account Status</span>

              <strong>
                <span
                  className={`view-customer-status view-customer-status-${customer.accountStatus}`}
                >
                  {formatAccountStatus(
                    customer.accountStatus
                  )}
                </span>
              </strong>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="view-customer-footer">
          <button
            type="button"
            className="view-customer-cancel-button"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="view-customer-edit-button"
            onClick={onEdit}
          >
            <Pencil size={16} />
            Edit Customer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCustomerModal;