import { configureStore } from "@reduxjs/toolkit";

import customerReducer from "../features/customers/customerSlice";
import authReducer from "../features/auth/authSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    dashboard: dashboardReducer,
  },
});