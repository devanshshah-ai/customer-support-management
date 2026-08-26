import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "../features/customers/customerSlice";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    // existing reducers
    auth: authReducer,
    customers: customerReducer,
  },
});