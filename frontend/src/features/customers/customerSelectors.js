export const selectCustomers = (state) =>
  state.customers.customers;

export const selectSelectedCustomer = (state) =>
  state.customers.selectedCustomer;

export const selectCustomerPagination = (state) =>
  state.customers.pagination;

export const selectCustomerFilters = (state) =>
  state.customers.filters;

export const selectCustomerLoading = (state) =>
  state.customers.loading;

export const selectCustomerDetailsLoading = (state) =>
  state.customers.detailsLoading;

export const selectCustomerMutationLoading = (state) =>
  state.customers.mutationLoading;

export const selectCustomerError = (state) =>
  state.customers.error;