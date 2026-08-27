import { useState } from "react";
import {
  X,
  UserPlus,
  Loader2,
} from "lucide-react";

import api from "../../services/api";

import "./CreateCustomerModal.css";

const CreateCustomerModal = ({
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    location: "",
    customerType: "individual",
    accountStatus: "active",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));

    setApiError("");
  };

  const validate = () => {
    const validationErrors = {};

    if (!formData.name.trim()) {
      validationErrors.name =
        "Customer name is required.";
    }

    if (!formData.email.trim()) {
      validationErrors.email =
        "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      validationErrors.email =
        "Please enter a valid email address.";
    }

    if (
      formData.phone &&
      !/^[0-9+\-\s()]{7,20}$/.test(
        formData.phone.trim()
      )
    ) {
      validationErrors.phone =
        "Please enter a valid phone number.";
    }

    if (!formData.customerType) {
      validationErrors.customerType =
        "Customer type is required.";
    }

    if (!formData.accountStatus) {
      validationErrors.accountStatus =
        "Account status is required.";
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

      await api.post("/customers", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        customerType: formData.customerType,
        accountStatus: formData.accountStatus,
      });

      onSuccess();
    } catch (err) {
      console.error(
        "Failed to create customer:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Failed to create customer. Please try again.";

      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="create-customer-overlay"
      onMouseDown={onClose}
    >
      <div
        className="create-customer-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="create-customer-header">
          <div className="create-customer-title">
            <div className="create-customer-icon">
              <UserPlus size={19} />
            </div>

            <div>
              <h2>Add Customer</h2>

              <p>
                Create a new customer profile.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="create-customer-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        <form
          className="create-customer-form"
          onSubmit={handleSubmit}
        >
          {apiError && (
            <div className="create-customer-api-error">
              {apiError}
            </div>
          )}

          <div className="create-customer-grid">
            <div className="create-customer-field full-width">
              <label htmlFor="customer-name">
                Customer Name
                <span>*</span>
              </label>

              <input
                id="customer-name"
                type="text"
                name="name"
                placeholder="Enter customer name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />

              {errors.name && (
                <small>{errors.name}</small>
              )}
            </div>

            <div className="create-customer-field">
              <label htmlFor="customer-email">
                Email
                <span>*</span>
              </label>

              <input
                id="customer-email"
                type="email"
                name="email"
                placeholder="customer@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />

              {errors.email && (
                <small>{errors.email}</small>
              )}
            </div>

            <div className="create-customer-field">
              <label htmlFor="customer-phone">
                Phone
              </label>

              <input
                id="customer-phone"
                type="text"
                name="phone"
                placeholder="+1 555 123 4567"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />

              {errors.phone && (
                <small>{errors.phone}</small>
              )}
            </div>

            <div className="create-customer-field">
              <label htmlFor="customer-company">
                Company
              </label>

              <input
                id="customer-company"
                type="text"
                name="company"
                placeholder="Company name"
                value={formData.company}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="create-customer-field">
              <label htmlFor="customer-location">
                Location
              </label>

              <input
                id="customer-location"
                type="text"
                name="location"
                placeholder="City, State, Country"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="create-customer-field">
              <label htmlFor="customer-type">
                Customer Type
                <span>*</span>
              </label>

              <select
                id="customer-type"
                name="customerType"
                value={formData.customerType}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="individual">
                  Individual
                </option>

                <option value="business">
                  Business
                </option>
              </select>

              {errors.customerType && (
                <small>
                  {errors.customerType}
                </small>
              )}
            </div>

            <div className="create-customer-field">
              <label htmlFor="customer-status">
                Account Status
                <span>*</span>
              </label>

              <select
                id="customer-status"
                name="accountStatus"
                value={formData.accountStatus}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>

                <option value="pending">
                  Pending
                </option>
              </select>

              {errors.accountStatus && (
                <small>
                  {errors.accountStatus}
                </small>
              )}
            </div>
          </div>

          <div className="create-customer-footer">
            <button
              type="button"
              className="create-customer-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-customer-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    className="create-customer-spinner"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Create Customer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomerModal;