import { useState } from "react";
import {
  X,
  Users,
  Loader2,
  Save,
} from "lucide-react";

import api from "../../services/api";

import "./EditTeamModal.css";

const EditTeamModal = ({
  team,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: team?.name || "",
    description: team?.description || "",
    isActive: team?.isActive ?? true,
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

    if (!formData.name.trim()) {
      validationErrors.name =
        "Team name is required.";
    } else if (formData.name.trim().length < 2) {
      validationErrors.name =
        "Team name must be at least 2 characters.";
    }

    if (formData.description.length > 500) {
      validationErrors.description =
        "Description cannot exceed 500 characters.";
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

      await api.put(`/teams/${team.id}`, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
      });

      onSuccess();
    } catch (err) {
      console.error(
        "Failed to update team:",
        err
      );

      setApiError(
        err.response?.data?.message ||
          "Failed to update team. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="edit-team-overlay"
      onMouseDown={onClose}
    >
      <div
        className="edit-team-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="edit-team-header">
          <div className="edit-team-title">
            <div className="edit-team-icon">
              <Users size={19} />
            </div>

            <div>
              <h2>Edit Team</h2>
              <p>
                Update team information.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="edit-team-close"
            onClick={onClose}
            disabled={loading}
          >
            <X size={19} />
          </button>
        </div>

        <form
          className="edit-team-form"
          onSubmit={handleSubmit}
        >
          {apiError && (
            <div className="edit-team-api-error">
              {apiError}
            </div>
          )}

          <div className="edit-team-field">
            <label htmlFor="edit-team-name">
              Team Name <span>*</span>
            </label>

            <input
              id="edit-team-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />

            {errors.name && (
              <small>{errors.name}</small>
            )}
          </div>

          <div className="edit-team-field">
            <label htmlFor="edit-team-description">
              Description
            </label>

            <textarea
              id="edit-team-description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />

            <div className="edit-team-character-count">
              {formData.description.length}/500
            </div>

            {errors.description && (
              <small>
                {errors.description}
              </small>
            )}
          </div>

          <div className="edit-team-status-row">
            <div>
              <strong>Team Status</strong>
              <span>
                Control whether this team is active.
              </span>
            </div>

            <label className="edit-team-switch">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    isActive:
                      event.target.checked,
                  }))
                }
                disabled={loading}
              />

              <span />
            </label>
          </div>

          <div className="edit-team-footer">
            <button
              type="button"
              className="edit-team-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-team-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    className="edit-team-spinner"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
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

export default EditTeamModal;