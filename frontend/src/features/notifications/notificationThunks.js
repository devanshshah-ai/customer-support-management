import { createAsyncThunk } from "@reduxjs/toolkit";
import notificationService from "./notificationService";

export const fetchUnreadNotificationCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getUnreadCount();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to load notification count."
      );
    }
  }
);
