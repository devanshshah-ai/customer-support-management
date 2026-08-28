import { useEffect, useState } from "react";
import {
  X,
  Pencil,
  User,
  History,
  Loader2,
} from "lucide-react";

import customerService from "../../features/customers/customerService";
import "./ViewCustomerModal.css";

const ViewCustomerModal = ({
  customer,
  onClose,
  onEdit,
}) => {
  const [profile, setProfile] = useState(customer);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const customerId = customer?.id || customer?._id;

  useEffect(() => {
    const loadHistory = async () => {
      if (!customerId) {
        setHistoryLoading(false);
        return;
      }

      try {
        setHistoryLoading(true);
        setHistoryError("");

        const response = await customerService.getCustomerById(
          customerId
        );
        const data = response?.data || {};

        setProfile(data.customer || customer);
        setServiceRequests(data.serviceRequests || []);
      } catch (error) {
        console.error("Failed to load customer history:", error);
        setHistoryError(
          error.response?.data?.message ||
            "Failed to load customer service history."
        );
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [customerId, customer]);

  if (!customer) {
    return null;
  }

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");

  const formatValue = (value) => value || "—";

  const titleCase = (value) => {
    if (!value) return "—";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="view-customer-overlay" onMouseDown={onClose}>
      <div
        className="view-customer-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="view-customer-header">
          <div className="view-customer-header-title">
            <div className="view-customer-header-avatar">
              {getInitials(profile?.name) || <User size={18} />}
            </div>
            <div className="view-customer-header-text">
              <h2>Customer Details</h2>
              <p>Profile and service request history</p>
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

        <div className="view-customer-body">
          <div className="view-customer-profile">
            <div className="view-customer-profile-avatar">
              {getInitials(profile?.name) || <User size={22} />}
            </div>
            <div className="view-customer-profile-info">
              <h3>{formatValue(profile?.name)}</h3>
              <p>{formatValue(profile?.email)}</p>
              <span
                className={`view-customer-status view-customer-status-${profile?.accountStatus}`}
              >
                {titleCase(profile?.accountStatus)}
              </span>
            </div>
          </div>

          <div className="view-customer-details-grid">
            <div className="view-customer-detail-card">
              <span>Full Name</span>
              <strong>{formatValue(profile?.name)}</strong>
            </div>
            <div className="view-customer-detail-card">
              <span>Email</span>
              <strong>{formatValue(profile?.email)}</strong>
            </div>
            <div className="view-customer-detail-card">
              <span>Phone</span>
              <strong>{formatValue(profile?.phone)}</strong>
            </div>
            <div className="view-customer-detail-card">
              <span>Company</span>
              <strong>{formatValue(profile?.company)}</strong>
            </div>
            <div className="view-customer-detail-card">
              <span>Location</span>
              <strong>{formatValue(profile?.location)}</strong>
            </div>
            <div className="view-customer-detail-card">
              <span>Customer Type</span>
              <strong>{titleCase(profile?.customerType)}</strong>
            </div>
            <div className="view-customer-detail-card full-width">
              <span>Account Status</span>
              <strong>
                <span
                  className={`view-customer-status view-customer-status-${profile?.accountStatus}`}
                >
                  {titleCase(profile?.accountStatus)}
                </span>
              </strong>
            </div>
          </div>

          <section className="view-customer-history-section">
            <div className="view-customer-history-heading">
              <div>
                <History size={17} />
                <div>
                  <h3>Service History</h3>
                  <p>All requests recorded for this customer.</p>
                </div>
              </div>
              <span>{serviceRequests.length} requests</span>
            </div>

            {historyLoading ? (
              <div className="view-customer-history-empty">
                <Loader2 className="view-customer-history-spinner" size={18} />
                Loading service history...
              </div>
            ) : historyError ? (
              <div className="view-customer-history-error">
                {historyError}
              </div>
            ) : serviceRequests.length === 0 ? (
              <div className="view-customer-history-empty">
                No service requests recorded for this customer.
              </div>
            ) : (
              <div className="view-customer-history-table-wrap">
                <table className="view-customer-history-table">
                  <thead>
                    <tr>
                      <th>Request</th>
                      <th>Subject</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Agent</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRequests.map((item) => (
                      <tr key={item._id || item.id}>
                        <td>
                          <strong>{item.requestNumber || "—"}</strong>
                        </td>
                        <td>{item.subject || "—"}</td>
                        <td>
                          <span className={`view-customer-history-badge severity-${String(item.severity || "").toLowerCase()}`}>
                            {item.severity || "—"}
                          </span>
                        </td>
                        <td>
                          <span className="view-customer-history-badge status">
                            {item.status || "—"}
                          </span>
                        </td>
                        <td>{item.assignedAgent?.name || "Unassigned"}</td>
                        <td>{formatDate(item.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

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
