import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  Power,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";
import { useAppSelector } from "../../app/hooks";

import CreateTeamModal from "./CreateTeamModal";
import EditTeamModal from "./EditTeamModal";
import ViewTeamModal from "./ViewTeamModal";

import "./TeamListPage.css";

const TeamListPage = () => {
  const currentUserRole = useAppSelector(
    (state) => state.auth.user?.role
  );
  const canManageTeams = currentUserRole === "admin";
  const [teams, setTeams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageLimit: 10,
    totalTeams: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 10,
        search: search.trim(),
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (statusFilter !== "") {
        params.isActive = statusFilter;
      }

      const response = await api.get("/teams", {
        params,
      });

      const result = response.data?.data;

      setTeams(result?.teams || []);

      setPagination(
        result?.pagination || {
          currentPage: 1,
          pageLimit: 10,
          totalTeams: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (err) {
      console.error("Failed to fetch teams:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load teams. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTeams();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchTeams]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handleDelete = async (team) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${team.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await api.delete(`/teams/${team.id}`);

      await fetchTeams();
    } catch (err) {
      console.error("Failed to delete team:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete team. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusToggle = async (team) => {
    try {
      setActionLoading(true);
      setError("");

      await api.patch(`/teams/${team.id}/status`, {
        isActive: !team.isActive,
      });

      await fetchTeams();
    } catch (err) {
      console.error("Failed to update team status:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update team status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSuccess = async () => {
    setShowCreateModal(false);
    setPage(1);
    await fetchTeams();
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    setSelectedTeam(null);
    await fetchTeams();
  };

  const handleViewUpdate = async () => {
    await fetchTeams();
  };

  const openEdit = (team) => {
    setSelectedTeam(team);
    setShowEditModal(true);
  };

  const openView = (team) => {
    setSelectedTeam(team);
    setShowViewModal(true);
  };

  const totalTeams = pagination.totalTeams || 0;

  return (
    <div className="team-page">
      <div className="team-page-header">
        <div>
          <div className="team-page-title-row">
            <div className="team-page-icon">
              <Users size={22} />
            </div>

            <div>
              <h1>Teams</h1>
              <p>
                {canManageTeams
                  ? "Manage support teams and their assigned agents."
                  : "View support teams and their assigned agents."}
              </p>
            </div>
          </div>
        </div>

        {canManageTeams && (
          <button
            type="button"
            className="team-add-button"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={17} />
            Add Team
          </button>
        )}
      </div>

      <div className="team-toolbar">
        <div className="team-search-wrapper">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <select
          className="team-status-filter"
          value={statusFilter}
          onChange={handleStatusChange}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <button
          type="button"
          className="team-refresh-button"
          onClick={fetchTeams}
          disabled={loading}
          title="Refresh"
        >
          <RefreshCw
            size={17}
            className={loading ? "team-refresh-spin" : ""}
          />
        </button>
      </div>

      {error && (
        <div className="team-error">
          {error}
        </div>
      )}

      <div className="team-table-card">
        <div className="team-table-wrapper">
          <table className="team-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Description</th>
                <th>Members</th>
                <th>Status</th>
                <th>Created</th>
                <th className="team-actions-header">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="team-empty-cell"
                  >
                    Loading teams...
                  </td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="team-empty-cell"
                  >
                    <Users size={30} />
                    <span>No teams found.</span>
                  </td>
                </tr>
              ) : (
                teams.map((team) => (
                  <tr key={team.id}>
                    <td>
                      <div className="team-name-cell">
                        <div className="team-avatar">
                          {team.name
                            ?.charAt(0)
                            ?.toUpperCase() || "T"}
                        </div>

                        <div>
                          <strong>{team.name}</strong>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="team-description">
                        {team.description || "—"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="team-member-count"
                        onClick={() => openView(team)}
                      >
                        <Users size={14} />
                        {team.members?.length || 0}
                      </button>
                    </td>

                    <td>
                      <span
                        className={`team-status ${
                          team.isActive
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {team.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      {team.createdAt
                        ? new Date(
                            team.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                      <div className="team-actions">
                        <button
                          type="button"
                          className="team-action view"
                          title="View"
                          onClick={() => openView(team)}
                        >
                          <Eye size={16} />
                        </button>

                        {canManageTeams && (
<button
                          type="button"
                          className="team-action edit"
                          title="Edit"
                          onClick={() => openEdit(team)}
                        >
                          <Pencil size={16} />
                        </button>
)}

                        {canManageTeams && (
<button
                          type="button"
                          className="team-action status"
                          title={
                            team.isActive
                              ? "Deactivate"
                              : "Activate"
                          }
                          disabled={actionLoading}
                          onClick={() =>
                            handleStatusToggle(team)
                          }
                        >
                          <Power size={16} />
                        </button>
)}

                        {canManageTeams && (
<button
                          type="button"
                          className="team-action delete"
                          title="Delete"
                          disabled={actionLoading}
                          onClick={() =>
                            handleDelete(team)
                          }
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

        <div className="team-pagination">
          <span>
            {totalTeams === 0
              ? "No teams"
              : `Page ${pagination.currentPage} of ${
                  pagination.totalPages || 1
                }`}
          </span>

          <div className="team-pagination-buttons">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() =>
                setPage((current) => current - 1)
              }
            >
              <ChevronLeft size={17} />
              Previous
            </button>

            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() =>
                setPage((current) => current + 1)
              }
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {canManageTeams && showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {canManageTeams && showEditModal && selectedTeam && (
        <EditTeamModal
          team={selectedTeam}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTeam(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {showViewModal && selectedTeam && (
        <ViewTeamModal
          team={selectedTeam}
          onClose={() => {
            setShowViewModal(false);
            setSelectedTeam(null);
          }}
          onUpdate={handleViewUpdate}
          canManageTeams={canManageTeams}
        />
      )}
    </div>
  );
};

export default TeamListPage;