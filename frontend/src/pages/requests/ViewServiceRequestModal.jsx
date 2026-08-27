import { useEffect, useState } from "react";
import {
  X,
  Loader2,
  ClipboardList,
  User,
  Building2,
  Calendar,
  Clock,
} from "lucide-react";

import api from "../../services/api";

import "./ViewServiceRequestModal.css";

const ViewServiceRequestModal = ({
  request,
  onClose,
}) => {
  const [requestData, setRequestData] =
    useState(request);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestId =
    request?._id || request?.id;

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/requests/${requestId}`
        );

        setRequestData(
          response.data?.data?.request ||
            request
        );
      } catch (err) {
        console.error(
          "Failed to fetch service request:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load request details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [requestId, request]);

  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString();
  };

  const getSeverityClass = (value) => {
    switch (value) {
      case "Critical":
        return "view-request-severity-critical";

      case "High":
        return "view-request-severity-high";

      case "Medium":
        return "view-request-severity-medium";

      case "Low":
        return "view-request-severity-low";

      default:
        return "";
    }
  };

  const getStatusClass = (value) => {
    switch (value) {
      case "Open":
        return "view-request-status-open";

      case "Under Investigation":
        return "view-request-status-investigation";

      case "Waiting for Customer":
        return "view-request-status-waiting";

      case "Resolved":
        return "view-request-status-resolved";

      case "Closed":
        return "view-request-status-closed";

      default:
        return "";
    }
  };

  return (
    <div
      className="view-request-overlay"
      onMouseDown={onClose}
    >
      <div
        className="view-request-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="view-request-header">
          <div className="view-request-title">
            <div className="view-request-icon">
              <ClipboardList size={19} />
            </div>

            <div>
              <h2>
                {requestData?.requestNumber ||
                  "Service Request"}
              </h2>

              <p>
                Service request details
              </p>
            </div>
          </div>

          <button
            type="button"
            className="view-request-close"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>

        {loading ? (
          <div className="view-request-loading">
            <Loader2
              size={28}
              className="view-request-spinner"
            />

            <span>
              Loading request details...
            </span>
          </div>
        ) : error ? (
          <div className="view-request-error">
            {error}
          </div>
        ) : (
          <div className="view-request-content">
            <div className="view-request-summary">
              <div>
                <span className="view-request-label">
                  Status
                </span>

                <span
                  className={`view-request-badge ${getStatusClass(
                    requestData?.status
                  )}`}
                >
                  {requestData?.status || "-"}
                </span>
              </div>

              <div>
                <span className="view-request-label">
                  Severity
                </span>

                <span
                  className={`view-request-badge ${getSeverityClass(
                    requestData?.severity
                  )}`}
                >
                  {requestData?.severity || "-"}
                </span>
              </div>

              <div>
                <span className="view-request-label">
                  Category
                </span>

                <strong>
                  {requestData?.category || "-"}
                </strong>
              </div>
            </div>

            <section className="view-request-section">
              <h3>Request Information</h3>

              <div className="view-request-info-grid">
                <div>
                  <span>
                    <ClipboardList size={14} />
                    Request Number
                  </span>

                  <strong>
                    {requestData?.requestNumber ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>
                    <Calendar size={14} />
                    Created Date
                  </span>

                  <strong>
                    {formatDateTime(
                      requestData?.createdAt
                    )}
                  </strong>
                </div>

                <div className="view-request-info-full">
                  <span>
                    Subject
                  </span>

                  <strong>
                    {requestData?.subject ||
                      "-"}
                  </strong>
                </div>

                <div className="view-request-info-full">
                  <span>
                    Description
                  </span>

                  <p>
                    {requestData?.description ||
                      "No description provided."}
                  </p>
                </div>
              </div>
            </section>

            <section className="view-request-section">
              <h3>Customer</h3>

              <div className="view-request-person-card">
                <div className="view-request-person-icon">
                  <User size={17} />
                </div>

                <div>
                  <strong>
                    {requestData?.customer?.name ||
                      "-"}
                  </strong>

                  <span>
                    {requestData?.customer?.email ||
                      "-"}
                  </span>

                  <span>
                    {requestData?.customer?.phone ||
                      "-"}
                  </span>
                </div>
              </div>
            </section>

            <section className="view-request-section">
              <h3>Assignment</h3>

              <div className="view-request-assignment-grid">
                <div>
                  <span>
                    <Building2 size={14} />
                    Support Team
                  </span>

                  <strong>
                    {requestData?.assignedTeam
                      ?.name ||
                      "Unassigned"}
                  </strong>
                </div>

                <div>
                  <span>
                    <User size={14} />
                    Support Agent
                  </span>

                  <strong>
                    {requestData?.assignedAgent
                      ?.name ||
                      "Unassigned"}
                  </strong>
                </div>
              </div>
            </section>

            <section className="view-request-section">
              <h3>SLA</h3>

              <div className="view-request-sla">
                <div>
                  <Clock size={16} />

                  <span>
                    SLA Deadline
                  </span>

                  <strong>
                    {formatDateTime(
                      requestData?.slaDeadline
                    )}
                  </strong>
                </div>

                <div>
                  <Calendar size={16} />

                  <span>
                    Resolution Date
                  </span>

                  <strong>
                    {formatDateTime(
                      requestData?.resolutionDate
                    )}
                  </strong>
                </div>
              </div>
            </section>
          </div>
        )}

        <div className="view-request-footer">
          <button
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewServiceRequestModal;