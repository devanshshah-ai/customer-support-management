import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import CustomerListPage from "../pages/customers/CustomerListPage";
import RequestListPage from "../pages/requests/RequestListPage";
import ProfilePage from "../pages/profile/ProfilePage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Application Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/customers" element={<CustomerListPage />} />
          <Route path="/requests" element={<RequestListPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;