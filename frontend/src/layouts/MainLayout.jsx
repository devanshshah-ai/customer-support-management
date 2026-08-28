import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { fetchUnreadNotificationCount } from "../features/notifications/notificationThunks";

import "./MainLayout.css";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id || state.auth.user?._id);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    const refreshNotificationCount = () => {
      dispatch(fetchUnreadNotificationCount());
    };

    refreshNotificationCount();

    const intervalId = window.setInterval(
      refreshNotificationCount,
      60000
    );

    window.addEventListener("focus", refreshNotificationCount);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshNotificationCount);
    };
  }, [dispatch, userId]);

  return (
    <div className="main-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-layout-content">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
