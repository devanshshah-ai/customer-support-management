import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import MainLayout from "../layouts/MainLayout";

import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import DashboardPage from "../pages/dashboard/DashboardPage";
import CustomerListPage from "../pages/customers/CustomerListPage";
import ServiceRequestsPage from "../pages/requests/ServiceRequestsPage";
import TeamListPage from "../pages/teams/TeamListPage";
import UserListPage from "../pages/users/UserListPage";

const Placeholder = ({ title }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-gray-900">
      {title}
    </h1>
  </div>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Guest Routes */}

        <Route element={<GuestRoute />}>
          <Route
            path="/login"
            element={<LoginPage />}
          />
        </Route>


        {/* Protected Routes */}

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            {/* Dashboard */}

            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />


            {/* Customers */}

            <Route
              path="/customers"
              element={<CustomerListPage />}
            />


            {/* Service Requests */}

            <Route
              path="/requests"
              element={<ServiceRequestsPage />}
            />


            {/* Admin + Manager */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "admin",
                    "manager",
                  ]}
                />
              }
            >

              <Route
                path="/teams"
                element={<TeamListPage />}
              />

              <Route
                path="/reports"
                element={
                  <Placeholder title="Reports" />
                }
              />

            </Route>


            {/* Admin Only */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={["admin"]}
                />
              }
            >

              <Route
                path="/users"
                element={<UserListPage />}
              />

            </Route>

          </Route>
        </Route>


        {/* Default */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


        {/* Unknown Route */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;