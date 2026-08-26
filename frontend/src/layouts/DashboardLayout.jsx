import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <aside>
        <h2>Customer Support</h2>

        <nav>
          <p>Dashboard</p>
          <p>Customers</p>
          <p>Requests</p>
          <p>Teams</p>
          <p>Users</p>
          <p>Profile</p>
        </nav>
      </aside>

      <main>
        <header>
          <h1>Customer Support Management</h1>
        </header>

        <section>
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default DashboardLayout;