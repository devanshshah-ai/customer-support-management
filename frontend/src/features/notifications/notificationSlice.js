import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../auth/authSlice";
import { fetchUnreadNotificationCount } from "./notificationThunks";

const initialState = {
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setUnreadCount: (state, action) => {
      state.unreadCount = Math.max(Number(action.payload) || 0, 0);
    },
    decrementUnreadCount: (state) => {
      state.unreadCount = Math.max(state.unreadCount - 1, 0);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadNotificationCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadNotificationCount.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadCount = Math.max(Number(action.payload) || 0, 0);
      })
      .addCase(fetchUnreadNotificationCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to load notification count.";
      })
      .addCase(logout, () => initialState);
  },
});

export const {
  setUnreadCount,
  decrementUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;
