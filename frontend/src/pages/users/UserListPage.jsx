import { useCallback, useEffect, useState } from "react";

import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";

import {
  getUsers,
  updateUserStatus,
  deleteUser,
} from "../../services/userService";

import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";
import ViewUserModal from "./ViewUserModal";

import "./UserListPage.css";

const UserListPage = () => {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState("");

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageLimit: 10,
    totalUsers: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit,
        search: search.trim(),
        sortBy,
        sortOrder,
      };

      if (role) {
        params.role = role;
      }

      if (isActive !== "") {
        params.isActive = isActive;
      }

      const response = await getUsers(params);

      setUsers(response.data?.users || []);

      setPagination(
        response.data?.pagination || {
          currentPage: page,
          pageLimit: limit,
          totalUsers: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (err) {
      console.error("Failed to load users:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load users. Please try again."
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    search,
    role,
    isActive,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleRoleChange = (event) => {
    setRole(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event) => {
    setIsActive(event.target.value);
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((current) =>
        current === "asc" ? "desc" : "asc"
      );
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }

    setPage(1);
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleCreateSuccess = async () => {
    setShowCreateModal(false);
    setPage(1);
    await fetchUsers();
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    await fetchUsers();
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleToggleStatus = async (user) => {
    const action = user.isActive
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await updateUserStatus(
        user.id,
        !user.isActive
      );

      await fetchUsers();
    } catch (err) {
      console.error(
        "Failed to update user status:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update user status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await deleteUser(user.id);

      if (
        users.length === 1 &&
        page > 1
      ) {
        setPage((currentPage) =>
          currentPage - 1
        );
      } else {
        await fetchUsers();
      }
    } catch (err) {
      console.error(
        "Failed to delete user:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete user."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getRoleLabel = (userRole) => {
    if (!userRole) {
      return "-";
    }

    return userRole
      .charAt(0)
      .toUpperCase() +
      userRole.slice(1);
  };

  const getSortIndicator = (field) => {
    if (sortBy !== field) {
      return "";
    }

    return sortOrder === "asc"
      ? " ↑"
      : " ↓";
  };

  return (
    <div className="users-page">

      {/* Header */}

      <div className="users-page-header">
        <div className="users-page-heading">
          <div className="users-page-icon">
            <Users size={22} />
          </div>

          <div>
            <h1>Users</h1>
            <p>
              Manage system users and their
              access.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="users-create-button"
          onClick={() =>
            setShowCreateModal(true)
          }
        >
          <Plus size={17} />
          Add User
        </button>
      </div>


      {/* Filters */}

      <div className="users-toolbar">

        <div className="users-search-wrapper">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <select
          value={role}
          onChange={handleRoleChange}
          className="users-filter"
        >
          <option value="">
            All Roles
          </option>

          <option value="admin">
            Admin
          </option>

          <option value="manager">
            Manager
          </option>

          <option value="agent">
            Agent
          </option>
        </select>

        <select
          value={isActive}
          onChange={handleStatusChange}
          className="users-filter"
        >
          <option value="">
            All Status
          </option>

          <option value="true">
            Active
          </option>

          <option value="false">
            Inactive
          </option>
        </select>

        <button
          type="button"
          className="users-refresh-button"
          onClick={handleRefresh}
          disabled={loading}
          title="Refresh"
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "users-refresh-spinning"
                : ""
            }
          />
        </button>

      </div>


      {/* Error */}

      {error && (
        <div className="users-error">
          {error}
        </div>
      )}


      {/* Table */}

      <div className="users-table-card">

        <div className="users-table-wrapper">

          <table className="users-table">

            <thead>
              <tr>

                <th
                  onClick={() =>
                    handleSort("name")
                  }
                >
                  Name
                  {getSortIndicator("name")}
                </th>

                <th
                  onClick={() =>
                    handleSort("email")
                  }
                >
                  Email
                  {getSortIndicator("email")}
                </th>

                <th
                  onClick={() =>
                    handleSort("role")
                  }
                >
                  Role
                  {getSortIndicator("role")}
                </th>

                <th>Status</th>

                <th
                  onClick={() =>
                    handleSort("createdAt")
                  }
                >
                  Created
                  {getSortIndicator(
                    "createdAt"
                  )}
                </th>

                <th className="users-actions-heading">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="users-loading"
                  >
                    <RefreshCw
                      size={22}
                      className="users-refresh-spinning"
                    />

                    <span>
                      Loading users...
                    </span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="users-empty"
                  >
                    <Users size={30} />

                    <strong>
                      No users found
                    </strong>

                    <span>
                      Try changing your search
                      or filters.
                    </span>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>

                    <td>
                      <div className="users-name-cell">
                        <div className="users-avatar">
                          {user.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <span>
                          {user.name}
                        </span>
                      </div>
                    </td>

                    <td>
                      {user.email}
                    </td>

                    <td>
                      <span
                        className={`users-role users-role-${user.role}`}
                      >
                        {getRoleLabel(
                          user.role
                        )}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          user.isActive
                            ? "users-status users-status-active"
                            : "users-status users-status-inactive"
                        }
                      >
                        <span className="users-status-dot" />
                        {user.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      {formatDate(
                        user.createdAt
                      )}
                    </td>

                    <td>
                      <div className="users-actions">

                        <button
                          type="button"
                          className="users-action users-action-view"
                          onClick={() =>
                            handleView(user)
                          }
                          title="View"
                          disabled={
                            actionLoading
                          }
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          className="users-action users-action-edit"
                          onClick={() =>
                            handleEdit(user)
                          }
                          title="Edit"
                          disabled={
                            actionLoading
                          }
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="users-action users-action-status"
                          onClick={() =>
                            handleToggleStatus(
                              user
                            )
                          }
                          title={
                            user.isActive
                              ? "Deactivate"
                              : "Activate"
                          }
                          disabled={
                            actionLoading
                          }
                        >
                          {user.isActive ? (
                            <UserX size={16} />
                          ) : (
                            <UserCheck
                              size={16}
                            />
                          )}
                        </button>

                        <button
                          type="button"
                          className="users-action users-action-delete"
                          onClick={() =>
                            handleDelete(user)
                          }
                          title="Delete"
                          disabled={
                            actionLoading
                          }
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>


        {/* Pagination */}

        {!loading &&
          pagination.totalUsers > 0 && (
            <div className="users-pagination">

              <span>
                Showing{" "}
                <strong>
                  {(
                    (pagination.currentPage -
                      1) *
                    pagination.pageLimit
                  ) + 1}
                </strong>{" "}
                to{" "}
                <strong>
                  {Math.min(
                    pagination.currentPage *
                      pagination.pageLimit,
                    pagination.totalUsers
                  )}
                </strong>{" "}
                of{" "}
                <strong>
                  {pagination.totalUsers}
                </strong>{" "}
                users
              </span>

              <div className="users-pagination-controls">

                <button
                  type="button"
                  disabled={
                    !pagination.hasPreviousPage
                  }
                  onClick={() =>
                    setPage(
                      (currentPage) =>
                        currentPage - 1
                    )
                  }
                >
                  <ChevronLeft size={17} />
                </button>

                <span>
                  Page{" "}
                  <strong>
                    {pagination.currentPage}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {Math.max(
                      pagination.totalPages,
                      1
                    )}
                  </strong>
                </span>

                <button
                  type="button"
                  disabled={
                    !pagination.hasNextPage
                  }
                  onClick={() =>
                    setPage(
                      (currentPage) =>
                        currentPage + 1
                    )
                  }
                >
                  <ChevronRight size={17} />
                </button>

              </div>

            </div>
          )}

      </div>


      {/* Modals */}

      {showCreateModal && (
        <CreateUserModal
          onClose={() =>
            setShowCreateModal(false)
          }
          onSuccess={handleCreateSuccess}
        />
      )}

      {showEditModal &&
        selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() =>
              setShowEditModal(false)
            }
            onSuccess={handleEditSuccess}
          />
        )}

      {showViewModal &&
        selectedUser && (
          <ViewUserModal
            user={selectedUser}
            onClose={() =>
              setShowViewModal(false)
            }
          />
        )}

    </div>
  );
};

export default UserListPage;