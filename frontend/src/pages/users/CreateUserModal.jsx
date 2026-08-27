import { useState } from "react";

import {
  X,
  UserPlus,
  Loader2,
} from "lucide-react";

import { createUser } from "../../services/userService";

import "./CreateUserModal.css";

const CreateUserModal = ({
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "agent",
    isActive: true,
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

  const handleStatusChange = (event) => {
    setFormData((current) => ({
      ...current,
      isActive:
        event.target.value === "true",
    }));
  };

  const validate = () => {
    const validationErrors = {};

    if (!formData.name.trim()) {
      validationErrors.name =
        "Name is required.";
    } else if (
      formData.name.trim().length < 2
    ) {
      validationErrors.name =
        "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      validationErrors.email =
        "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      validationErrors.email =
        "Please enter a valid email address.";
    }

    if (!formData.password) {
      validationErrors.password =
        "Password is required.";
    } else if (
      formData.password.length < 8
    ) {
      validationErrors.password =
        "Password must be at least 8 characters.";
    } else if (
      formData.password.length > 16
    ) {
      validationErrors.password =
        "Password cannot exceed 16 characters.";
    }

    if (!formData.role) {
      validationErrors.role =
        "Role is required.";
    }

    setErrors(validationErrors);

    return (
      Object.keys(validationErrors)
        .length === 0
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

      await createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        isActive: formData.isActive,
      });

      onSuccess();
    } catch (err) {
      console.error(
        "Failed to create user:",
        err
      );

      setApiError(
        err.response?.data?.message ||
          "Failed to create user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="create-user-overlay"
      onMouseDown={onClose}
    >
      <div
        className="create-user-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* Header */}

        <div className="create-user-header">

          <div className="create-user-title">

            <div className="create-user-icon">
              <UserPlus size={19} />
            </div>

            <div>
              <h2>Add User</h2>
              <p>
                Create a new system user.
              </p>
            </div>

          </div>

          <button
            type="button"
            className="create-user-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            <X size={19} />
          </button>

        </div>


        {/* Form */}

        <form
          className="create-user-form"
          onSubmit={handleSubmit}
        >

          {apiError && (
            <div className="create-user-api-error">
              {apiError}
            </div>
          )}

          <div className="create-user-grid">

            {/* Name */}

            <div className="create-user-field full-width">

              <label htmlFor="create-user-name">
                Name
                <span>*</span>
              </label>

              <input
                id="create-user-name"
                type="text"
                name="name"
                placeholder="Enter user name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />

              {errors.name && (
                <small>
                  {errors.name}
                </small>
              )}

            </div>


            {/* Email */}

            <div className="create-user-field">

              <label htmlFor="create-user-email">
                Email
                <span>*</span>
              </label>

              <input
                id="create-user-email"
                type="email"
                name="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />

              {errors.email && (
                <small>
                  {errors.email}
                </small>
              )}

            </div>


            {/* Password */}

            <div className="create-user-field">

              <label htmlFor="create-user-password">
                Password
                <span>*</span>
              </label>

              <input
                id="create-user-password"
                type="password"
                name="password"
                placeholder="8-16 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />

              {errors.password && (
                <small>
                  {errors.password}
                </small>
              )}

            </div>


            {/* Role */}

            <div className="create-user-field">

              <label htmlFor="create-user-role">
                Role
                <span>*</span>
              </label>

              <select
                id="create-user-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="agent">
                  Agent
                </option>

                <option value="manager">
                  Manager
                </option>

                <option value="admin">
                  Admin
                </option>
              </select>

              {errors.role && (
                <small>
                  {errors.role}
                </small>
              )}

            </div>


            {/* Status */}

            <div className="create-user-field">

              <label htmlFor="create-user-status">
                Account Status
                <span>*</span>
              </label>

              <select
                id="create-user-status"
                value={
                  formData.isActive
                    ? "true"
                    : "false"
                }
                onChange={handleStatusChange}
                disabled={loading}
              >
                <option value="true">
                  Active
                </option>

                <option value="false">
                  Inactive
                </option>
              </select>

            </div>

          </div>


          {/* Footer */}

          <div className="create-user-footer">

            <button
              type="button"
              className="create-user-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-user-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    className="create-user-spinner"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Create User
                </>
              )}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateUserModal;