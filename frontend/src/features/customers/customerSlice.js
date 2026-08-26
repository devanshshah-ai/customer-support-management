import { createSlice } from "@reduxjs/toolkit";

import {
  fetchCustomers,
  fetchCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "./customerThunks";

const initialState = {
  customers: [],

  selectedCustomer: null,

  pagination: {
    currentPage: 1,
    pageLimit: 10,
    totalCustomers: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },

  filters: {
    search: "",
    customerType: "",
    accountStatus: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },

  loading: false,
  detailsLoading: false,
  mutationLoading: false,

  error: null,
};

const customerSlice = createSlice({
  name: "customers",

  initialState,

  reducers: {
    setSearch: (state, action) => {
      state.filters.search = action.payload;
      state.pagination.currentPage = 1;
    },

    setCustomerType: (state, action) => {
      state.filters.customerType = action.payload;
      state.pagination.currentPage = 1;
    },

    setAccountStatus: (state, action) => {
      state.filters.accountStatus = action.payload;
      state.pagination.currentPage = 1;
    },

    setSorting: (state, action) => {
      state.filters.sortBy = action.payload.sortBy;
      state.filters.sortOrder = action.payload.sortOrder;
      state.pagination.currentPage = 1;
    },

    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },

    setPageLimit: (state, action) => {
      state.pagination.pageLimit = action.payload;
      state.pagination.currentPage = 1;
    },

    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },

    clearCustomerError: (state) => {
      state.error = null;
    },

    resetCustomerFilters: (state) => {
      state.filters = {
        search: "",
        customerType: "",
        accountStatus: "",
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      state.pagination.currentPage = 1;
    },
  },

  extraReducers: (builder) => {
    // Fetch customers
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchCustomers.fulfilled,
        (state, action) => {
          state.loading = false;

          state.customers =
            action.payload.data?.customers || [];

          state.pagination =
            action.payload.data?.pagination ||
            state.pagination;
        }
      )

      .addCase(
        fetchCustomers.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch customers";
        }
      );

    // Fetch customer by ID
    builder
      .addCase(
        fetchCustomerById.pending,
        (state) => {
          state.detailsLoading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchCustomerById.fulfilled,
        (state, action) => {
          state.detailsLoading = false;

          state.selectedCustomer =
            action.payload.data?.customer || null;
        }
      )

      .addCase(
        fetchCustomerById.rejected,
        (state, action) => {
          state.detailsLoading = false;
          state.error =
            action.payload ||
            "Failed to fetch customer";
        }
      );

    // Create customer
    builder
      .addCase(
        createCustomer.pending,
        (state) => {
          state.mutationLoading = true;
          state.error = null;
        }
      )

      .addCase(
        createCustomer.fulfilled,
        (state, action) => {
          state.mutationLoading = false;

          const customer =
            action.payload.data?.customer;

          if (customer) {
            state.customers.unshift(customer);

            state.pagination.totalCustomers += 1;
          }
        }
      )

      .addCase(
        createCustomer.rejected,
        (state, action) => {
          state.mutationLoading = false;
          state.error =
            action.payload ||
            "Failed to create customer";
        }
      );

    // Update customer
    builder
      .addCase(
        updateCustomer.pending,
        (state) => {
          state.mutationLoading = true;
          state.error = null;
        }
      )

      .addCase(
        updateCustomer.fulfilled,
        (state, action) => {
          state.mutationLoading = false;

          const updatedCustomer =
            action.payload.data?.customer;

          if (!updatedCustomer) {
            return;
          }

          const index = state.customers.findIndex(
            (customer) =>
              customer.id === updatedCustomer.id
          );

          if (index !== -1) {
            state.customers[index] =
              updatedCustomer;
          }

          if (
            state.selectedCustomer?.id ===
            updatedCustomer.id
          ) {
            state.selectedCustomer =
              updatedCustomer;
          }
        }
      )

      .addCase(
        updateCustomer.rejected,
        (state, action) => {
          state.mutationLoading = false;
          state.error =
            action.payload ||
            "Failed to update customer";
        }
      );

    // Delete customer
    builder
      .addCase(
        deleteCustomer.pending,
        (state) => {
          state.mutationLoading = true;
          state.error = null;
        }
      )

      .addCase(
        deleteCustomer.fulfilled,
        (state, action) => {
          state.mutationLoading = false;

          const deletedId =
            action.payload.data?.id;

          if (deletedId) {
            state.customers =
              state.customers.filter(
                (customer) =>
                  customer.id !== deletedId
              );

            state.pagination.totalCustomers =
              Math.max(
                state.pagination.totalCustomers - 1,
                0
              );
          }

          if (
            state.selectedCustomer?.id ===
            deletedId
          ) {
            state.selectedCustomer = null;
          }
        }
      )

      .addCase(
        deleteCustomer.rejected,
        (state, action) => {
          state.mutationLoading = false;
          state.error =
            action.payload ||
            "Failed to delete customer";
        }
      );
  },
});

export const {
  setSearch,
  setCustomerType,
  setAccountStatus,
  setSorting,
  setPage,
  setPageLimit,
  clearSelectedCustomer,
  clearCustomerError,
  resetCustomerFilters,
} = customerSlice.actions;

export default customerSlice.reducer;