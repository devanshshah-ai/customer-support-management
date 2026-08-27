import { useEffect, useState } from "react";
import {
  X,
  Users,
  Loader2,
  UserPlus,
} from "lucide-react";

import api from "../../services/api";

import "./CreateTeamModal.css";

const CreateTeamModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    members: [],
    isActive: true,
  });

  const [agents, setAgents] = useState([]);

  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoadingAgents(true);

        const response = await api.get("/users", {
          params: {
            role: "agent",
            isActive: "true",
            limit: 100,
          },
        });

        const users =
          response.data?.data?.users ||
          response.data?.data ||
          [];

        setAgents(Array.isArray(users) ? users : []);
      } catch (err) {
        console.error(
          "Failed to fetch agents:",
          err
        );

        setApiError(
          err.response?.data?.message ||
            "Failed to load agents."
        );
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []);

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

  const handleMemberToggle = (agentId) => {
    setFormData((current) => {
      const exists = current.members.includes(agentId);

      return {
        ...current,
        members: exists
          ? current.members.filter(
              (id) => id !== agentId
            )
          : [...current.members, agentId],
      };
    });
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

      await api.post("/teams", {
        name: formData.name.trim(),
        description: formData.description.trim(),
        members: formData.members,
        isActive: formData.isActive,
      });

      onSuccess();
    } catch (err) {
      console.error(
        "Failed to create team:",
        err
      );

      setApiError(
        err.response?.data?.message ||
          "Failed to create team. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="create-team-overlay"
      onMouseDown={onClose}
    >
      <div
        className="create-team-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="create-team-header">
          <div className="create-team-title">
            <div className="create-team-icon">
              <Users size={19} />
            </div>

            <div>
              <h2>Create Team</h2>
              <p>
                Create a support team and assign agents.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="create-team-close"
            onClick={onClose}
            disabled={loading}
          >
            <X size={19} />
          </button>
        </div>

        <form
          className="create-team-form"
          onSubmit={handleSubmit}
        >
          {apiError && (
            <div className="create-team-api-error">
              {apiError}
            </div>
          )}

          <div className="create-team-field">
            <label htmlFor="team-name">
              Team Name <span>*</span>
            </label>

            <input
              id="team-name"
              name="name"
              type="text"
              placeholder="Enter team name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />

            {errors.name && (
              <small>{errors.name}</small>
            )}
          </div>

          <div className="create-team-field">
            <label htmlFor="team-description">
              Description
            </label>

            <textarea
              id="team-description"
              name="description"
              rows="3"
              placeholder="Describe the team..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />

            <div className="create-team-character-count">
              {formData.description.length}/500
            </div>

            {errors.description && (
              <small>
                {errors.description}
              </small>
            )}
          </div>

          <div className="create-team-members">
            <div className="create-team-members-header">
              <div>
                <label>Assign Agents</label>
                <p>
                  Select active support agents.
                </p>
              </div>

              <span>
                {formData.members.length} selected
              </span>
            </div>

            <div className="create-team-agent-list">
              {loadingAgents ? (
                <div className="create-team-agent-loading">
                  <Loader2
                    size={18}
                    className="create-team-spinner"
                  />
                  Loading agents...
                </div>
              ) : agents.length === 0 ? (
                <div className="create-team-agent-empty">
                  No active agents available.
                </div>
              ) : (
                agents.map((agent) => (
                  <label
                    key={agent.id || agent._id}
                    className="create-team-agent"
                  >
                    <input
                      type="checkbox"
                      checked={formData.members.includes(
                        agent.id || agent._id
                      )}
                      onChange={() =>
                        handleMemberToggle(
                          agent.id || agent._id
                        )
                      }
                      disabled={loading}
                    />

                    <div className="create-team-agent-avatar">
                      {agent.name
                        ?.charAt(0)
                        ?.toUpperCase() || "A"}
                    </div>

                    <div className="create-team-agent-info">
                      <strong>
                        {agent.name || "Unknown Agent"}
                      </strong>

                      <span>
                        {agent.email || ""}
                      </span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="create-team-status-row">
            <div>
              <strong>Team Status</strong>
              <span>
                New teams are active by default.
              </span>
            </div>

            <label className="create-team-switch">
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

          <div className="create-team-footer">
            <button
              type="button"
              className="create-team-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-team-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    className="create-team-spinner"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Create Team
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;