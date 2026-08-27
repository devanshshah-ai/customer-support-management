import { useEffect, useState } from "react";

import { X, Pencil, Loader2 } from "lucide-react";

import api from "../../services/api";

import "./EditCustomerModal.css";

const EditCustomerModal = ({
  customer,
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

  useEffect(() => {
    if (!customer) {
      return;
    }

    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      company: customer.company || "",
      location: customer.location || "",
      customerType: customer.customerType || "individual",
      accountStatus: customer.accountStatus || "active",
    });

    setErrors({});
    setApiError("");
  }, [customer]);

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
      validationErrors.name = "Customer name is required.";
    }

    if (!formData.email.trim()) {
      validationErrors.email = "Email is required.";
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

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    if (!customer?.id) {
      setApiError("Customer ID is missing.");
      return;
    }

    try {
      setLoading(true);
      setApiError("");

      await api.put(`/customers/${customer.id}`, {
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
      console.error("Failed to update customer:", err);

      const message =
        err.response?.data?.message ||
        "Failed to update customer. Please try again.";

      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="edit-customer-overlay"
      onMouseDown={onClose}
    >
      <div
        className="edit-customer-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="edit-customer-header">
          <div className="edit-customer-title">
            <div className="edit-customer-icon">
              <Pencil size={18} />
            </div>

            <div>
              <h2>Edit Customer</h2>
              <p>Update customer profile information.</p>
            </div>
          </div>

          <button
            type="button"
            className="edit-customer-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        <form
          className="edit-customer-form"
          onSubmit={handleSubmit}
        >
          {apiError && (
            <div className="edit-customer-api-error">
              {apiError}
            </div>
          )}

          <div className="edit-customer-grid">
            <div className="edit-customer-field full-width">
              <label htmlFor="edit-customer-name">
                Customer Name
                <span>*</span>
              </label>

              <input
                id="edit-customer-name"
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

            <div className="edit-customer-field">
              <label htmlFor="edit-customer-email">
                Email
                <span>*</span>
              </label>

              <input
                id="edit-customer-email"
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

            <div className="edit-customer-field">
              <label htmlFor="edit-customer-phone">
                Phone
              </label>

              <input
                id="edit-customer-phone"
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

            <div className="edit-customer-field">
              <label htmlFor="edit-customer-company">
                Company
              </label>

              <input
                id="edit-customer-company"
                type="text"
                name="company"
                placeholder="Company name"
                value={formData.company}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="edit-customer-field">
              <label htmlFor="edit-customer-location">
                Location
              </label>

              <input
                id="edit-customer-location"
                type="text"
                name="location"
                placeholder="City, State, Country"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="edit-customer-field">
              <label htmlFor="edit-customer-type">
                Customer Type
                <span>*</span>
              </label>

              <select
                id="edit-customer-type"
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

            <div className="edit-customer-field">
              <label htmlFor="edit-customer-status">
                Account Status
                <span>*</span>
              </label>

              <select
                id="edit-customer-status"
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

          <div className="edit-customer-footer">
            <button
              type="button"
              className="edit-customer-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-customer-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    className="edit-customer-spinner"
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

export default EditCustomerModal;