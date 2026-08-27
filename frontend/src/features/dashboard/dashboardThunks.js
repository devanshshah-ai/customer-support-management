import { createAsyncThunk } from "@reduxjs/toolkit";
import dashboardService from "./dashboardService";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const [summary, analytics] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getAnalytics(),
      ]);

      return {
        summary: summary.data || {},
        analytics: analytics.data || {},
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Unable to load dashboard data."
        )
      );
    }
  }
);