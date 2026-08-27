import { useEffect, useState } from "react";
import {
  X,
  Users,
  UserPlus,
  UserMinus,
  Loader2,
  Mail,
  CalendarDays,
} from "lucide-react";

import api from "../../services/api";

import "./ViewTeamModal.css";

const ViewTeamModal = ({
  team,
  onClose,
  onUpdate,
}) => {
  const [teamData, setTeamData] = useState(team);

  const [agents, setAgents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);

  const [selectedAgent, setSelectedAgent] =
    useState("");

  const [error, setError] = useState("");

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/teams/${team.id}`
      );

      const updatedTeam =
        response.data?.data?.team;

      if (updatedTeam) {
        setTeamData(updatedTeam);
      }
    } catch (err) {
      console.error(
        "Failed to fetch team:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load team details."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
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
    }
  };

  useEffect(() => {
    fetchTeam();
    fetchAgents();
  }, [team.id]);

  const memberIds = new Set(
    (teamData?.members || []).map(
      (member) => member.id || member._id
    )
  );

  const availableAgents = agents.filter(
    (agent) =>
      !memberIds.has(agent.id || agent._id)
  );

  const handleAddMember = async () => {
    if (!selectedAgent) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await api.post(
        `/teams/${team.id}/members`,
        {
          userId: selectedAgent,
        }
      );

      setSelectedAgent("");

      await fetchTeam();
      await fetchAgents();

      if (onUpdate) {
        await onUpdate();
      }
    } catch (err) {
      console.error(
        "Failed to add team member:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to add agent to team."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (
    member
  ) => {
    const memberId =
      member.id || member._id;

    const confirmed = window.confirm(
      `Remove ${
        member.name || "this agent"
      } from the team?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await api.delete(
        `/teams/${team.id}/members/${memberId}`
      );

      await fetchTeam();
      await fetchAgents();

      if (onUpdate) {
        await onUpdate();
      }
    } catch (err) {
      console.error(
        "Failed to remove team member:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to remove agent from team."
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className="view-team-overlay"
      onMouseDown={onClose}
    >
      <div
        className="view-team-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="view-team-header">
          <div className="view-team-title">
            <div className="view-team-icon">
              <Users size={20} />
            </div>

            <div>
              <h2>
                {teamData?.name || "Team"}
              </h2>

              <p>
                Team details and assigned agents
              </p>
            </div>
          </div>

          <button
            type="button"
            className="view-team-close"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>

        <div className="view-team-content">
          {error && (
            <div className="view-team-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="view-team-loading">
              <Loader2
                size={22}
                className="view-team-spinner"
              />
              Loading team details...
            </div>
          ) : (
            <>
              <div className="view-team-info-grid">
                <div className="view-team-info-card">
                  <span>Status</span>

                  <strong
                    className={
                      teamData?.isActive
                        ? "active"
                        : "inactive"
                    }
                  >
                    {teamData?.isActive
                      ? "Active"
                      : "Inactive"}
                  </strong>
                </div>

                <div className="view-team-info-card">
                  <span>Members</span>

                  <strong>
                    {teamData?.members
                      ?.length || 0}
                  </strong>
                </div>

                <div className="view-team-info-card">
                  <span>Created</span>

                  <strong>
                    {teamData?.createdAt
                      ? new Date(
                          teamData.createdAt
                        ).toLocaleDateString()
                      : "—"}
                  </strong>
                </div>
              </div>

              <div className="view-team-description">
                <span>Description</span>

                <p>
                  {teamData?.description ||
                    "No description provided."}
                </p>
              </div>

              <div className="view-team-section">
                <div className="view-team-section-header">
                  <div>
                    <h3>Team Members</h3>

                    <p>
                      Agents currently assigned
                      to this team.
                    </p>
                  </div>

                  <span>
                    {teamData?.members
                      ?.length || 0}
                  </span>
                </div>

                <div className="view-team-members">
                  {teamData?.members?.length ===
                  0 ? (
                    <div className="view-team-no-members">
                      <Users size={22} />
                      <span>
                        No agents assigned yet.
                      </span>
                    </div>
                  ) : (
                    teamData.members.map(
                      (member) => (
                        <div
                          className="view-team-member"
                          key={
                            member.id ||
                            member._id
                          }
                        >
                          <div className="view-team-member-avatar">
                            {member.name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "A"}
                          </div>

                          <div className="view-team-member-info">
                            <strong>
                              {member.name ||
                                "Unknown Agent"}
                            </strong>

                            <span>
                              <Mail
                                size={12}
                              />
                              {member.email ||
                                "No email"}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="view-team-remove"
                            disabled={
                              actionLoading
                            }
                            onClick={() =>
                              handleRemoveMember(
                                member
                              )
                            }
                            title="Remove agent"
                          >
                            <UserMinus
                              size={15}
                            />
                          </button>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>

              <div className="view-team-add-section">
                <div>
                  <h3>Add Agent</h3>
                  <p>
                    Add an active support agent
                    to this team.
                  </p>
                </div>

                <div className="view-team-add-controls">
                  <select
                    value={selectedAgent}
                    onChange={(event) =>
                      setSelectedAgent(
                        event.target.value
                      )
                    }
                    disabled={actionLoading}
                  >
                    <option value="">
                      Select an agent
                    </option>

                    {availableAgents.map(
                      (agent) => (
                        <option
                          key={
                            agent.id ||
                            agent._id
                          }
                          value={
                            agent.id ||
                            agent._id
                          }
                        >
                          {agent.name}
                          {agent.email
                            ? ` — ${agent.email}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={
                      handleAddMember
                    }
                    disabled={
                      !selectedAgent ||
                      actionLoading
                    }
                  >
                    {actionLoading ? (
                      <Loader2
                        size={15}
                        className="view-team-spinner"
                      />
                    ) : (
                      <UserPlus
                        size={15}
                      />
                    )}

                    Add
                  </button>
                </div>

                {availableAgents.length ===
                  0 && (
                  <span className="view-team-no-agents">
                    All active agents are already
                    members of this team.
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="view-team-footer">
          <div>
            <CalendarDays size={14} />
            {teamData?.updatedAt
              ? `Updated ${new Date(
                  teamData.updatedAt
                ).toLocaleDateString()}`
              : ""}
          </div>

          <button
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTeamModal;