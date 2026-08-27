import { createSlice } from "@reduxjs/toolkit";
import { fetchDashboard } from "./dashboardThunks";

const initialState = {
  summary: {},
  analytics: {},
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",

  initialState,

  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;

        state.summary = action.payload.summary;
        state.analytics = action.payload.analytics;
      })

      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload ||
          "Unable to load dashboard data.";
      });
  },
});

export const {
  clearDashboardError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;