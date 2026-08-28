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
  refreshKey,
  currentUserRole,
  teams = [],
  agents = [],
}) => {
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [category, setCategory] = useState("");
  const [assignedTeam, setAssignedTeam] = useState("");
  const [assignedAgent, setAssignedAgent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

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
          search: debouncedSearch.trim(),
          status: status || undefined,
          severity: severity || undefined,
          category: category || undefined,
          assignedTeam: assignedTeam || undefined,
          assignedAgent: assignedAgent || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          sortBy,
          sortOrder,
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
  }, [
    page,
    debouncedSearch,
    status,
    severity,
    category,
    assignedTeam,
    assignedAgent,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    refreshKey,
  ]);

  /*
   * Initial load + reload whenever
   * pagination/filter values change.
   */
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  /*
   * Debounce the actual API search value. Updating the input itself must not
   * recreate fetchRequests, otherwise every keystroke triggers a request.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
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

  const getSlaClass = (value) => {
    switch (value) {
      case "BREACHED":
      case "RESOLVED_AFTER_SLA":
        return "sla-breached";
      case "APPROACHING":
        return "sla-approaching";
      case "RESOLVED_WITHIN_SLA":
        return "sla-resolved";
      default:
        return "sla-within";
    }
  };

  const formatSlaStatus = (value) => {
    const labels = {
      WITHIN_SLA: "Within SLA",
      APPROACHING: "Approaching",
      BREACHED: "Breached",
      RESOLVED_WITHIN_SLA: "Resolved in SLA",
      RESOLVED_AFTER_SLA: "Resolved late",
    };
    return labels[value] || "—";
  };

  /*
   * Reset filters
   */
  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setSeverity("");
    setCategory("");
    setAssignedTeam("");
    setAssignedAgent("");
    setStartDate("");
    setEndDate("");
    setSortBy("createdAt");
    setSortOrder("desc");
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

        {(currentUserRole === "admin" ||
          currentUserRole === "manager") && (
          <>
            <select
              value={assignedTeam}
              onChange={(event) => {
                setAssignedTeam(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All Teams</option>
              {teams.map((team) => (
                <option
                  key={team.id || team._id}
                  value={team.id || team._id}
                >
                  {team.name}
                </option>
              ))}
            </select>

            <select
              value={assignedAgent}
              onChange={(event) => {
                setAssignedAgent(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All Agents</option>
              {agents.map((agent) => (
                <option
                  key={agent.id || agent._id}
                  value={agent.id || agent._id}
                >
                  {agent.name}
                </option>
              ))}
            </select>
          </>
        )}

        <label className="service-request-date-filter">
          <span>From</span>
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) => {
              setStartDate(event.target.value);
              setPage(1);
            }}
          />
        </label>

        <label className="service-request-date-filter">
          <span>To</span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => {
              setEndDate(event.target.value);
              setPage(1);
            }}
          />
        </label>

        <select
          value={sortBy}
          onChange={(event) => {
            setSortBy(event.target.value);
            setPage(1);
          }}
          title="Sort field"
        >
          <option value="createdAt">Sort: Created</option>
          <option value="updatedAt">Sort: Updated</option>
          <option value="slaDeadline">Sort: SLA Deadline</option>
          <option value="severity">Sort: Severity</option>
          <option value="status">Sort: Status</option>
          <option value="subject">Sort: Subject</option>
        </select>

        <select
          value={sortOrder}
          onChange={(event) => {
            setSortOrder(event.target.value);
            setPage(1);
          }}
          title="Sort direction"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
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
          category ||
          assignedTeam ||
          assignedAgent ||
          startDate ||
          endDate ||
          sortBy !== "createdAt" ||
          sortOrder !== "desc") && (
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
                <th>SLA</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="10"
                    className="service-request-loading"
                  >
                    Loading service requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
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
                      <span
                        className={`request-badge ${getSlaClass(
                          request.slaStatus
                        )}`}
                      >
                        {formatSlaStatus(request.slaStatus)}
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

                        {currentUserRole === "admin" && (
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
                        )}
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