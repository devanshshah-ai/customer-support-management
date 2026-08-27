import { useEffect, useState } from "react";

import {
  X,
  Pencil,
  Loader2,
} from "lucide-react";

import { updateUser } from "../../services/userService";

import "./EditUserModal.css";

const EditUserModal = ({
  user,
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

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "agent",
      isActive: Boolean(user.isActive),
    });
  }, [user]);

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

    if (
      formData.password &&
      formData.password.length < 8
    ) {
      validationErrors.password =
        "Password must be at least 8 characters.";
    }

    if (
      formData.password &&
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

      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        isActive: formData.isActive,
      };

      if (formData.password) {
        updateData.password =
          formData.password;
      }

      await updateUser(
        user.id,
        updateData
      );

      onSuccess();
    } catch (err) {
      console.error(
        "Failed to update user:",
        err
      );

      setApiError(
        err.response?.data?.message ||
          "Failed to update user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="edit-user-overlay"
      onMouseDown={onClose}
    >
      <div
        className="edit-user-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* Header */}

        <div className="edit-user-header">

          <div className="edit-user-title">

            <div className="edit-user-icon">
              <Pencil size={18} />
            </div>

            <div>
              <h2>Edit User</h2>
              <p>
                Update user information.
              </p>
            </div>

          </div>

          <button
            type="button"
            className="edit-user-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            <X size={19} />
          </button>

        </div>


        {/* Form */}

        <form
          className="edit-user-form"
          onSubmit={handleSubmit}
        >

          {apiError && (
            <div className="edit-user-api-error">
              {apiError}
            </div>
          )}

          <div className="edit-user-grid">

            {/* Name */}

            <div className="edit-user-field full-width">

              <label htmlFor="edit-user-name">
                Name
                <span>*</span>
              </label>

              <input
                id="edit-user-name"
                type="text"
                name="name"
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

            <div className="edit-user-field">

              <label htmlFor="edit-user-email">
                Email
                <span>*</span>
              </label>

              <input
                id="edit-user-email"
                type="email"
                name="email"
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

            <div className="edit-user-field">

              <label htmlFor="edit-user-password">
                New Password
              </label>

              <input
                id="edit-user-password"
                type="password"
                name="password"
                placeholder="Leave blank to keep current"
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

            <div className="edit-user-field">

              <label htmlFor="edit-user-role">
                Role
                <span>*</span>
              </label>

              <select
                id="edit-user-role"
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

            <div className="edit-user-field">

              <label htmlFor="edit-user-status">
                Account Status
                <span>*</span>
              </label>

              <select
                id="edit-user-status"
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

          <div className="edit-user-footer">

            <button
              type="button"
              className="edit-user-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-user-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    className="edit-user-spinner"
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

export default EditUserModal;