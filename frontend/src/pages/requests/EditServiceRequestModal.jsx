import { useEffect, useState } from "react";
import {
  X,
  Pencil,
  Loader2,
} from "lucide-react";

import api from "../../services/api";

import "./EditServiceRequestModal.css";

const EditServiceRequestModal = ({
  request,
  onClose,
  onSuccess,
  customers = [],
  teams = [],
  agents = [],
  currentUserRole,
}) => {
  const isAgent = currentUserRole === "agent";
  const [formData, setFormData] = useState({
    customer: "",
    subject: "",
    description: "",
    category: "",
    severity: "",
    assignedTeam: "",
    assignedAgent: "",
    status: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!request) {
      return;
    }

    setFormData({
      customer:
        request.customer?._id ||
        request.customer?.id ||
        request.customer ||
        "",

      subject: request.subject || "",

      description:
        request.description || "",

      category:
        request.category || "",

      severity:
        request.severity || "",

      assignedTeam:
        request.assignedTeam?._id ||
        request.assignedTeam?.id ||
        request.assignedTeam ||
        "",

      assignedAgent:
        request.assignedAgent?._id ||
        request.assignedAgent?.id ||
        request.assignedAgent ||
        "",

      status:
        request.status || "",
    });
  }, [request]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setApiError("");
  };

  const validate = () => {
    const validationErrors = {};

    if (!formData.customer) {
      validationErrors.customer =
        "Customer is required.";
    }

    if (!formData.subject.trim()) {
      validationErrors.subject =
        "Subject is required.";
    }

    if (!formData.description.trim()) {
      validationErrors.description =
        "Description is required.";
    }

    if (!formData.category) {
      validationErrors.category =
        "Category is required.";
    }

    if (!formData.severity) {
      validationErrors.severity =
        "Severity is required.";
    }

    if (!formData.status) {
      validationErrors.status =
        "Status is required.";
    }

    setErrors(validationErrors);

    return (
      Object.keys(validationErrors).length === 0
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const requestId =
      request?._id || request?.id;

    if (!requestId) {
      setApiError(
        "Invalid service request ID."
      );
      return;
    }

    try {
      setLoading(true);
      setApiError("");

      const payload = isAgent
        ? { status: formData.status }
        : {
            customer: formData.customer,
            subject: formData.subject.trim(),
            description: formData.description.trim(),
            category: formData.category,
            severity: formData.severity,
            status: formData.status,
            assignedTeam: formData.assignedTeam || null,
            assignedAgent: formData.assignedAgent || null,
          };

      await api.put(
        `/requests/${requestId}`,
        payload
      );

      onSuccess?.();
    } catch (err) {
      console.error(
        "Failed to update service request:",
        err
      );

      setApiError(
        err.response?.data?.message ||
          "Failed to update service request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="edit-request-overlay"
      onMouseDown={onClose}
    >
      <div
        className="edit-request-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="edit-request-header">
          <div className="edit-request-title">
            <div className="edit-request-icon">
              <Pencil size={18} />
            </div>

            <div>
              <h2>Edit Service Request</h2>

              <p>
                {request?.requestNumber ||
                  "Update request"}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="edit-request-close"
            onClick={onClose}
            disabled={loading}
          >
            <X size={19} />
          </button>
        </div>

        <form
          className="edit-request-form"
          onSubmit={handleSubmit}
        >
          {apiError && (
            <div className="edit-request-api-error">
              {apiError}
            </div>
          )}

          {isAgent && (
            <div className="edit-request-api-error">
              Support agents can update status only. Assignment and request details are managed by support managers.
            </div>
          )}

          <div className="edit-request-grid">
            <div className="edit-request-field">
              <label>
                Customer <span>*</span>
              </label>

              <select
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                disabled={loading || isAgent}
              >
                <option value="">
                  Select customer
                </option>

                {customers.map((customer) => (
                  <option
                    key={
                      customer._id ||
                      customer.id
                    }
                    value={
                      customer._id ||
                      customer.id
                    }
                  >
                    {customer.name}
                  </option>
                ))}
              </select>

              {errors.customer && (
                <small>
                  {errors.customer}
                </small>
              )}
            </div>

            <div className="edit-request-field">
              <label>
                Category <span>*</span>
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading || isAgent}
              >
                <option value="Technical Issue">
                  Technical Issue
                </option>

                <option value="Billing">
                  Billing
                </option>

                <option value="Account">
                  Account
                </option>

                <option value="Product Information">
                  Product Information
                </option>

                <option value="Delivery">
                  Delivery
                </option>

                <option value="Complaint">
                  Complaint
                </option>
              </select>
            </div>

            <div className="edit-request-field full-width">
              <label>
                Subject <span>*</span>
              </label>

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                disabled={loading || isAgent}
              />

              {errors.subject && (
                <small>
                  {errors.subject}
                </small>
              )}
            </div>

            <div className="edit-request-field full-width">
              <label>
                Description <span>*</span>
              </label>

              <textarea
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                disabled={loading || isAgent}
              />

              {errors.description && (
                <small>
                  {errors.description}
                </small>
              )}
            </div>

            <div className="edit-request-field">
              <label>
                Severity <span>*</span>
              </label>

              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                disabled={loading || isAgent}
              >
                <option value="Critical">
                  Critical
                </option>

                <option value="High">
                  High
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Low">
                  Low
                </option>
              </select>
            </div>

            <div className="edit-request-field">
              <label>
                Status <span>*</span>
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="Open">
                  Open
                </option>

                <option value="Under Investigation">
                  Under Investigation
                </option>

                <option value="Waiting for Customer">
                  Waiting for Customer
                </option>

                <option value="Resolved">
                  Resolved
                </option>

                <option value="Closed">
                  Closed
                </option>
              </select>

              {errors.status && (
                <small>
                  {errors.status}
                </small>
              )}
            </div>

            <div className="edit-request-field">
              <label>
                Support Team
              </label>

              <select
                name="assignedTeam"
                value={formData.assignedTeam}
                onChange={handleChange}
                disabled={loading || isAgent}
              >
                <option value="">
                  Unassigned
                </option>

                {teams.map((team) => (
                  <option
                    key={
                      team._id ||
                      team.id
                    }
                    value={
                      team._id ||
                      team.id
                    }
                  >
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="edit-request-field">
              <label>
                Support Agent
              </label>

              <select
                name="assignedAgent"
                value={formData.assignedAgent}
                onChange={handleChange}
                disabled={loading || isAgent}
              >
                <option value="">
                  Unassigned
                </option>

                {agents.map((agent) => (
                  <option
                    key={
                      agent._id ||
                      agent.id
                    }
                    value={
                      agent._id ||
                      agent.id
                    }
                  >
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="edit-request-footer">
            <button
              type="button"
              className="edit-request-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-request-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    className="edit-request-spinner"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Pencil size={16} />

                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceRequestModal;