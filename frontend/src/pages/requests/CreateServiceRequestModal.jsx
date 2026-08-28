import { useState } from "react";
import {
  X,
  Plus,
  Loader2,
} from "lucide-react";

import api from "../../services/api";

import "./CreateServiceRequestModal.css";

const CreateServiceRequestModal = ({
  onClose,
  onSuccess,
  customers = [],
  teams = [],
  agents = [],
  currentUserRole,
}) => {
  const [formData, setFormData] = useState({
    customer: "",
    subject: "",
    description: "",
    category: "Technical Issue",
    severity: "Medium",
    assignedTeam: "",
    assignedAgent: "",
    status: "Open",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

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

    try {
      setLoading(true);
      setApiError("");

      const payload = {
        customer: formData.customer,
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        category: formData.category,
        severity: formData.severity,
        status: formData.status,
      };

      if (formData.assignedTeam) {
        payload.assignedTeam =
          formData.assignedTeam;
      }

      if (formData.assignedAgent) {
        payload.assignedAgent =
          formData.assignedAgent;
      }

      await api.post("/requests", payload);

      onSuccess?.();
    } catch (err) {
      console.error(
        "Failed to create service request:",
        err
      );

      setApiError(
        err.response?.data?.message ||
          "Failed to create service request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="create-request-overlay"
      onMouseDown={onClose}
    >
      <div
        className="create-request-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="create-request-header">
          <div className="create-request-title">
            <div className="create-request-icon">
              <Plus size={19} />
            </div>

            <div>
              <h2>Create Service Request</h2>

              <p>
                Record a new customer service issue.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="create-request-close"
            onClick={onClose}
            disabled={loading}
          >
            <X size={19} />
          </button>
        </div>

        <form
          className="create-request-form"
          onSubmit={handleSubmit}
        >
          {apiError && (
            <div className="create-request-api-error">
              {apiError}
            </div>
          )}

          <div className="create-request-grid">
            <div className="create-request-field">
              <label htmlFor="request-customer">
                Customer <span>*</span>
              </label>

              <select
                id="request-customer"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                disabled={loading}
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
                <small>{errors.customer}</small>
              )}
            </div>

            <div className="create-request-field">
              <label htmlFor="request-category">
                Category <span>*</span>
              </label>

              <select
                id="request-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
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

            <div className="create-request-field full-width">
              <label htmlFor="request-subject">
                Subject <span>*</span>
              </label>

              <input
                id="request-subject"
                type="text"
                name="subject"
                placeholder="Enter request subject"
                value={formData.subject}
                onChange={handleChange}
                disabled={loading}
              />

              {errors.subject && (
                <small>{errors.subject}</small>
              )}
            </div>

            <div className="create-request-field full-width">
              <label htmlFor="request-description">
                Description <span>*</span>
              </label>

              <textarea
                id="request-description"
                name="description"
                rows="5"
                placeholder="Describe the customer's issue..."
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
              />

              {errors.description && (
                <small>
                  {errors.description}
                </small>
              )}
            </div>

            <div className="create-request-field">
              <label htmlFor="request-severity">
                Severity <span>*</span>
              </label>

              <select
                id="request-severity"
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                disabled={loading}
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

            <div className="create-request-field">
              <label htmlFor="request-status">
                Status
              </label>

              <select
                id="request-status"
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
              </select>
            </div>

            {currentUserRole !== "agent" && (
              <>
            <div className="create-request-field">
              <label htmlFor="request-team">
                Support Team
              </label>

              <select
                id="request-team"
                name="assignedTeam"
                value={formData.assignedTeam}
                onChange={handleChange}
                disabled={loading}
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

            <div className="create-request-field">
              <label htmlFor="request-agent">
                Support Agent
              </label>

              <select
                id="request-agent"
                name="assignedAgent"
                value={formData.assignedAgent}
                onChange={handleChange}
                disabled={loading}
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
              </>
            )}
          </div>

          <div className="create-request-footer">
            <button
              type="button"
              className="create-request-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-request-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    className="create-request-spinner"
                  />

                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} />

                  Create Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateServiceRequestModal;