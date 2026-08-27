import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ClipboardList,
} from "lucide-react";

import api from "../../services/api";

import "./ServiceRequestList.css";

const ServiceRequestList = ({
  onCreate,
  onView,
  onEdit,
}) => {
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [category, setCategory] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  /*
   * Fetch service requests
   */
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/requests", {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          status: status || undefined,
          severity: severity || undefined,
          category: category || undefined,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      });

      const result = response.data?.data;

      setRequests(result?.requests || []);

      setPagination(
        result?.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (err) {
      console.error("Failed to fetch service requests:", err);

      setRequests([]);

      setError(
        err.response?.data?.message ||
          "Failed to load service requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status, severity, category]);

  /*
   * Initial load + reload whenever
   * pagination/filter values change.
   */
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  /*
   * Search with a small debounce
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /*
   * Reload after create/edit/delete.
   *
   * Parent components can call the callback
   * returned through onCreate/onEdit if needed.
   */
  const handleRefresh = () => {
    fetchRequests();
  };

  /*
   * Delete request
   */
  const handleDelete = async (requestId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/requests/${requestId}`);

      /*
       * Immediately reload the grid after deletion.
       */
      await fetchRequests();
    } catch (err) {
      console.error("Failed to delete service request:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete service request. Please try again."
      );
    }
  };

  /*
   * Format date
   */
  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /*
   * Status class
   */
  const getStatusClass = (value) => {
    switch (value) {
      case "Open":
        return "status-open";

      case "Under Investigation":
        return "status-investigation";

      case "Waiting for Customer":
        return "status-waiting";

      case "Resolved":
        return "status-resolved";

      case "Closed":
        return "status-closed";

      default:
        return "";
    }
  };

  /*
   * Severity class
   */
  const getSeverityClass = (value) => {
    switch (value) {
      case "Critical":
        return "severity-critical";

      case "High":
        return "severity-high";

      case "Medium":
        return "severity-medium";

      case "Low":
        return "severity-low";

      default:
        return "";
    }
  };

  /*
   * Reset filters
   */
  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setSeverity("");
    setCategory("");
    setPage(1);
  };

  return (
    <div className="service-request-page">
      {/* Page Header */}
      <div className="service-request-page-header">
        <div>
          <div className="service-request-title-row">
            <div className="service-request-title-icon">
              <ClipboardList size={21} />
            </div>

            <div>
              <h1>Service Requests</h1>

              <p>
                Manage and track customer service requests.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="service-request-create-btn"
          onClick={onCreate}
        >
          <Plus size={17} />
          Create Request
        </button>
      </div>

      {/* Filters */}
      <div className="service-request-filters">
        <div className="service-request-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search request number, customer or subject..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Under Investigation">
            Under Investigation
          </option>
          <option value="Waiting for Customer">
            Waiting for Customer
          </option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          value={severity}
          onChange={(event) => {
            setSeverity(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All Categories</option>
          <option value="Technical Issue">
            Technical Issue
          </option>
          <option value="Billing">Billing</option>
          <option value="Account">Account</option>
          <option value="Product Information">
            Product Information
          </option>
          <option value="Delivery">Delivery</option>
          <option value="Complaint">Complaint</option>
        </select>

        <button
          type="button"
          className="service-request-refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
          title="Refresh"
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "service-request-refresh-spin"
                : ""
            }
          />
        </button>

        {(search ||
          status ||
          severity ||
          category) && (
          <button
            type="button"
            className="service-request-reset-btn"
            onClick={handleResetFilters}
          >
            Reset
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="service-request-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={handleRefresh}
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="service-request-table-card">
        <div className="service-request-table-wrapper">
          <table className="service-request-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Assigned Agent</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="service-request-loading"
                  >
                    Loading service requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="service-request-empty"
                  >
                    <ClipboardList size={30} />

                    <strong>
                      No service requests found
                    </strong>

                    <span>
                      Try changing your search or filters.
                    </span>
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request._id}>
                    <td>
                      <span className="request-number">
                        {request.requestNumber}
                      </span>
                    </td>

                    <td>
                      <div className="customer-cell">
                        <strong>
                          {request.customer?.name ||
                            "Unknown Customer"}
                        </strong>

                        <span>
                          {request.customer?.email ||
                            "-"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="request-subject">
                        {request.subject || "-"}
                      </span>
                    </td>

                    <td>
                      {request.category || "-"}
                    </td>

                    <td>
                      <span
                        className={`request-badge ${getSeverityClass(
                          request.severity
                        )}`}
                      >
                        {request.severity || "-"}
                      </span>
                    </td>

                    <td>
                      {request.assignedAgent?.name ||
                        "Unassigned"}
                    </td>

                    <td>
                      <span
                        className={`request-badge ${getStatusClass(
                          request.status
                        )}`}
                      >
                        {request.status || "-"}
                      </span>
                    </td>

                    <td>
                      {formatDate(request.createdAt)}
                    </td>

                    <td>
                      <div className="service-request-actions">
                        <button
                          type="button"
                          className="request-action view"
                          onClick={() =>
                            onView?.(request)
                          }
                          title="View"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          className="request-action edit"
                          onClick={() =>
                            onEdit?.(request, fetchRequests)
                          }
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="request-action delete"
                          onClick={() =>
                            handleDelete(request._id)
                          }
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.total > 0 && (
          <div className="service-request-pagination">
            <div>
              Showing{" "}
              <strong>
                {(pagination.page - 1) *
                  pagination.limit +
                  1}
              </strong>{" "}
              to{" "}
              <strong>
                {Math.min(
                  pagination.page *
                    pagination.limit,
                  pagination.total
                )}
              </strong>{" "}
              of{" "}
              <strong>{pagination.total}</strong>{" "}
              requests
            </div>

            <div className="service-request-pagination-controls">
              <button
                type="button"
                disabled={
                  !pagination.hasPreviousPage
                }
                onClick={() =>
                  setPage((current) =>
                    Math.max(current - 1, 1)
                  )
                }
              >
                <ChevronLeft size={17} />
              </button>

              <span>
                Page {pagination.page} of{" "}
                {pagination.totalPages || 1}
              </span>

              <button
                type="button"
                disabled={
                  !pagination.hasNextPage
                }
                onClick={() =>
                  setPage((current) =>
                    current + 1
                  )
                }
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceRequestList;