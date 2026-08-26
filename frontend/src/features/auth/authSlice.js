import { createSlice } from "@reduxjs/toolkit";

import {
  loginUser,
  registerUser,
  fetchCurrentUser,
} from "./authThunks";

const storedToken =
  localStorage.getItem("accessToken");

const storedUser =
  localStorage.getItem("user");

const initialState = {
  user: storedUser
    ? JSON.parse(storedUser)
    : null,

  accessToken: storedToken || null,

  isAuthenticated: Boolean(storedToken),

  loading: false,

  initialized: false,

  error: null,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;

      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem("user");
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // Login
    builder
      .addCase(
        loginUser.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        loginUser.fulfilled,
        (state, action) => {
          state.loading = false;

          const data = action.payload.data;

          state.user = data.user;
          state.accessToken = data.accessToken;
          state.isAuthenticated = true;

          localStorage.setItem(
            "accessToken",
            data.accessToken
          );

          localStorage.setItem(
            "user",
            JSON.stringify(data.user)
          );
        }
      )

      .addCase(
        loginUser.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Login failed";
        }
      );

    // Register
    builder
      .addCase(
        registerUser.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        registerUser.fulfilled,
        (state, action) => {
          state.loading = false;

          const data = action.payload.data;

          if (data?.accessToken) {
            state.user = data.user;
            state.accessToken =
              data.accessToken;
            state.isAuthenticated = true;

            localStorage.setItem(
              "accessToken",
              data.accessToken
            );

            localStorage.setItem(
              "user",
              JSON.stringify(data.user)
            );
          }
        }
      )

      .addCase(
        registerUser.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Registration failed";
        }
      );

    // Current user
    builder
      .addCase(
        fetchCurrentUser.pending,
        (state) => {
          state.loading = true;
        }
      )

      .addCase(
        fetchCurrentUser.fulfilled,
        (state, action) => {
          state.loading = false;
          state.initialized = true;

          const user =
            action.payload.data?.user;

          if (user) {
            state.user = user;
            state.isAuthenticated = true;

            localStorage.setItem(
              "user",
              JSON.stringify(user)
            );
          }
        }
      )

      .addCase(
        fetchCurrentUser.rejected,
        (state) => {
          state.loading = false;
          state.initialized = true;

          state.user = null;
          state.accessToken = null;
          state.isAuthenticated = false;

          localStorage.removeItem(
            "accessToken"
          );

          localStorage.removeItem("user");
        }
      );
  },
});

export const {
  logout,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;