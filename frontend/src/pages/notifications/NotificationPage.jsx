import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Info,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";

import api from "../../services/api";
import { useAppDispatch } from "../../hooks/reduxHooks";
import {
  decrementUnreadCount,
  setUnreadCount as setGlobalUnreadCount,
} from "../../features/notifications/notificationSlice";

import "./NotificationPage.css";

const NotificationPage = () => {
  const dispatch = useAppDispatch();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageLimit: 20,
    totalNotifications: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const getNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/notifications", {
        params: {
          page,
          limit: 20,
          unreadOnly: unreadOnly || undefined,
        },
      });

      const result = response.data?.data;

      setNotifications(result?.notifications || []);

      const nextUnreadCount = result?.unreadCount || 0;
      setUnreadCount(nextUnreadCount);
      dispatch(setGlobalUnreadCount(nextUnreadCount));

      setPagination(
        result?.pagination || {
          currentPage: 1,
          pageLimit: 20,
          totalNotifications: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (err) {
      console.error(
        "Failed to fetch notifications:",
        err
      );

      setNotifications([]);

      setError(
        err.response?.data?.message ||
          "Failed to load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, page, unreadOnly]);

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  const handleFilterChange = (value) => {
    setUnreadOnly(value);
    setPage(1);
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(
        `/notifications/${notificationId}/read`
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : notification
        )
      );

      setUnreadCount((current) =>
        Math.max(current - 1, 0)
      );
      dispatch(decrementUnreadCount());
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to mark notification as read."
      );
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      await api.patch("/notifications/read-all");

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          readAt:
            notification.readAt ||
            new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
      dispatch(setGlobalUnreadCount(0));
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to mark all notifications as read."
      );
    }
  };

  const getNotificationIcon = (type) => {
    const normalizedType =
      String(type || "").toLowerCase();

    if (
      normalizedType.includes("critical") ||
      normalizedType.includes("alert") ||
      normalizedType.includes("breach")
    ) {
      return (
        <div className="notification-icon notification-icon-danger">
          <AlertTriangle size={19} />
        </div>
      );
    }

    if (
      normalizedType.includes("request") ||
      normalizedType.includes("service") ||
      normalizedType.includes("assignment")
    ) {
      return (
        <div className="notification-icon notification-icon-primary">
          <MessageSquare size={19} />
        </div>
      );
    }

    if (
      normalizedType.includes("warning") ||
      normalizedType.includes("sla")
    ) {
      return (
        <div className="notification-icon notification-icon-warning">
          <AlertCircle size={19} />
        </div>
      );
    }

    return (
      <div className="notification-icon notification-icon-info">
        <Info size={19} />
      </div>
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString();
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "Critical":
        return "request-severity-critical";

      case "High":
        return "request-severity-high";

      case "Medium":
        return "request-severity-medium";

      case "Low":
        return "request-severity-low";

      default:
        return "";
    }
  };

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-header">
        <div className="notifications-title-section">
          <div className="notifications-title-icon">
            <Bell size={22} />
          </div>

          <div>
            <h1>Notifications</h1>
            <p>
              Stay updated with your service requests
              and system activity.
            </p>
          </div>
        </div>

        <div className="notifications-actions">
          <button
            type="button"
            className="notification-refresh-button"
            onClick={getNotifications}
            disabled={loading}
            title="Refresh notifications"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "notification-spin"
                  : ""
              }
            />
            Refresh
          </button>

          <button
            type="button"
            className="notification-read-all-button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck size={17} />
            Mark all as read
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="notification-summary">
        <div className="notification-summary-card">
          <div className="summary-card-icon">
            <Bell size={20} />
          </div>

          <div>
            <span>Total Notifications</span>
            <strong>
              {pagination.totalNotifications}
            </strong>
          </div>
        </div>

        <div className="notification-summary-card unread-summary-card">
          <div className="summary-card-icon">
            <AlertCircle size={20} />
          </div>

          <div>
            <span>Unread Notifications</span>
            <strong>{unreadCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="notifications-toolbar">
        <div className="notification-filter-group">
          <button
            type="button"
            className={
              !unreadOnly
                ? "notification-filter active"
                : "notification-filter"
            }
            onClick={() =>
              handleFilterChange(false)
            }
          >
            All
          </button>

          <button
            type="button"
            className={
              unreadOnly
                ? "notification-filter active"
                : "notification-filter"
            }
            onClick={() =>
              handleFilterChange(true)
            }
          >
            Unread
            {unreadCount > 0 && (
              <span className="filter-count">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="notifications-error">
          <AlertCircle size={18} />
          <span>{error}</span>

          <button
            type="button"
            onClick={getNotifications}
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="notifications-loading">
          <Loader2
            size={28}
            className="notification-spin"
          />

          <p>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="notifications-empty">
          <div className="empty-notification-icon">
            <Bell size={30} />
          </div>

          <h2>No notifications</h2>

          <p>
            {unreadOnly
              ? "You have no unread notifications."
              : "You're all caught up. New notifications will appear here."}
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => {
            const notificationId =
              notification._id ||
              notification.id;

            const serviceRequest =
              notification.serviceRequest;

            return (
              <div
                key={notificationId}
                className={
                  notification.isRead
                    ? "notification-card"
                    : "notification-card unread"
                }
              >
                {getNotificationIcon(
                  notification.type
                )}

                <div className="notification-content">
                  <div className="notification-card-header">
                    <div className="notification-heading">
                      <h3>
                        {notification.title ||
                          "Notification"}
                      </h3>

                      {!notification.isRead && (
                        <span className="unread-badge">
                          New
                        </span>
                      )}
                    </div>

                    <span className="notification-date">
                      {formatDate(
                        notification.createdAt
                      )}
                    </span>
                  </div>

                  <p className="notification-message">
                    {notification.message}
                  </p>

                  {serviceRequest && (
                    <div className="notification-request">
                      <div>
                        <span className="request-label">
                          Request
                        </span>

                        <strong>
                          {serviceRequest.requestNumber ||
                            "-"}
                        </strong>
                      </div>

                      {serviceRequest.subject && (
                        <div>
                          <span className="request-label">
                            Subject
                          </span>

                          <span>
                            {serviceRequest.subject}
                          </span>
                        </div>
                      )}

                      {serviceRequest.status && (
                        <div>
                          <span className="request-label">
                            Status
                          </span>

                          <span className="request-status">
                            {serviceRequest.status}
                          </span>
                        </div>
                      )}

                      {serviceRequest.severity && (
                        <span
                          className={`request-severity ${getSeverityClass(
                            serviceRequest.severity
                          )}`}
                        >
                          {serviceRequest.severity}
                        </span>
                      )}
                    </div>
                  )}

                  {!notification.isRead && (
                    <button
                      type="button"
                      className="mark-read-button"
                      onClick={() =>
                        markAsRead(notificationId)
                      }
                    >
                      <Check size={15} />
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading &&
        pagination.totalPages > 1 && (
          <div className="notifications-pagination">
            <button
              type="button"
              disabled={
                !pagination.hasPreviousPage
              }
              onClick={() =>
                setPage((current) =>
                  Math.max(current - 1, 1)
                )
              }
            >
              <ChevronLeft size={17} />
              Previous
            </button>

            <span>
              Page {pagination.currentPage} of{" "}
              {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() =>
                setPage((current) =>
                  current + 1
                )
              }
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        )}
    </div>
  );
};

export default NotificationPage;