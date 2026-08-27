import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";

import api from "../../services/api";

import CreateCustomerModal from "./CreateCustomerModal";
import ViewCustomerModal from "./ViewCustomerModal";
import EditCustomerModal from "./EditCustomerModal";

import "./CustomerList.css";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [accountStatus, setAccountStatus] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageLimit: 10,
    totalCustomers: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customers", {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          customerType: customerType || undefined,
          accountStatus: accountStatus || undefined,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      });

      const responseData = response.data?.data || response.data;

      setCustomers(responseData?.customers || []);

      setPagination(
        responseData?.pagination || {
          currentPage: page,
          pageLimit: 10,
          totalCustomers: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (err) {
      console.error("Failed to fetch customers:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load customers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, search, customerType, accountStatus]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleCustomerTypeChange = (event) => {
    setCustomerType(event.target.value);
    setPage(1);
  };

  const handleAccountStatusChange = (event) => {
    setAccountStatus(event.target.value);
    setPage(1);
  };

  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
    setShowViewModal(false);
  };

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/customers/${customer.id}`);

      await fetchCustomers();
    } catch (err) {
      console.error("Failed to delete customer:", err);

      window.alert(
        err.response?.data?.message ||
          "Failed to delete customer. Please try again."
      );
    }
  };

  const handleCreateSuccess = async () => {
    setShowCreateModal(false);
    setPage(1);
    await fetchCustomers();
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    setSelectedCustomer(null);
    await fetchCustomers();
  };

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  const formatCustomerType = (type) => {
    if (!type) {
      return "—";
    }

    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatAccountStatus = (status) => {
    if (!status) {
      return "—";
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="customer-list-page">
      <div className="customer-list-header">
        <div>
          <h1>Customers</h1>
          <p>Manage customer profiles and service history.</p>
        </div>

        <button
          type="button"
          className="customer-add-button"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      <div className="customer-toolbar">
        <div className="customer-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <select
          value={customerType}
          onChange={handleCustomerTypeChange}
          className="customer-filter"
        >
          <option value="">All Types</option>
          <option value="individual">Individual</option>
          <option value="business">Business</option>
        </select>

        <select
          value={accountStatus}
          onChange={handleAccountStatusChange}
          className="customer-filter"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="customer-table-card">
        {loading ? (
          <div className="customer-list-state">
            <div className="customer-loader" />
            <p>Loading customers...</p>
          </div>
        ) : error ? (
          <div className="customer-list-state customer-error-state">
            <p>{error}</p>

            <button
              type="button"
              onClick={fetchCustomers}
              className="customer-retry-button"
            >
              Try Again
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div className="customer-list-state">
            <Users size={42} />
            <h3>No customers found</h3>
            <p>
              Try changing your search or filters, or add a new customer.
            </p>
          </div>
        ) : (
          <>
            <div className="customer-table-wrapper">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="customer-name-cell">
                          <div className="customer-avatar">
                            {getInitials(customer.name)}
                          </div>

                          <div>
                            <strong>{customer.name}</strong>
                            <span>{customer.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>{customer.phone || "—"}</td>

                      <td>{customer.company || "—"}</td>

                      <td>{customer.location || "—"}</td>

                      <td>
                        {formatCustomerType(customer.customerType)}
                      </td>

                      <td>
                        <span
                          className={`customer-status customer-status-${customer.accountStatus}`}
                        >
                          {formatAccountStatus(customer.accountStatus)}
                        </span>
                      </td>

                      <td>
                        <div className="customer-actions">
                          <button
                            type="button"
                            className="customer-action-button view"
                            title="View customer"
                            onClick={() => handleView(customer)}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            className="customer-action-button edit"
                            title="Edit customer"
                            onClick={() => handleEdit(customer)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            className="customer-action-button delete"
                            title="Delete customer"
                            onClick={() => handleDelete(customer)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="customer-pagination">
              <span>
                Showing{" "}
                {customers.length > 0
                  ? (pagination.currentPage - 1) *
                      pagination.pageLimit +
                    1
                  : 0}{" "}
                to{" "}
                {(pagination.currentPage - 1) *
                    pagination.pageLimit +
                  customers.length}{" "}
                of {pagination.totalCustomers} customers
              </span>

              <div className="customer-pagination-controls">
                <button
                  type="button"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() =>
                    setPage((currentPage) => currentPage - 1)
                  }
                >
                  <ChevronLeft size={17} />
                </button>

                <span className="customer-page-number">
                  {pagination.currentPage} /{" "}
                  {pagination.totalPages || 1}
                </span>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage}
                  onClick={() =>
                    setPage((currentPage) => currentPage + 1)
                  }
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showCreateModal && (
        <CreateCustomerModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showViewModal && selectedCustomer && (
        <ViewCustomerModal
          customer={selectedCustomer}
          onClose={() => {
            setShowViewModal(false);
            setSelectedCustomer(null);
          }}
          onEdit={() => handleEdit(selectedCustomer)}
        />
      )}

      {showEditModal && selectedCustomer && (
        <EditCustomerModal
          customer={selectedCustomer}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCustomer(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default CustomerList;