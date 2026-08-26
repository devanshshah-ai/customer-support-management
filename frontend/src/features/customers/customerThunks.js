import { createAsyncThunk } from "@reduxjs/toolkit";
import customerService from "./customerService";

export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (params, { rejectWithValue }) => {
    try {
      return await customerService.getCustomers(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch customers"
      );
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  "customers/fetchCustomerById",
  async (id, { rejectWithValue }) => {
    try {
      return await customerService.getCustomerById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch customer"
      );
    }
  }
);

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (customerData, { rejectWithValue }) => {
    try {
      return await customerService.createCustomer(
        customerData
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to create customer"
      );
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async (
    { id, customerData },
    { rejectWithValue }
  ) => {
    try {
      return await customerService.updateCustomer(
        id,
        customerData
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update customer"
      );
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async (id, { rejectWithValue }) => {
    try {
      return await customerService.deleteCustomer(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to delete customer"
      );
    }
  }
);