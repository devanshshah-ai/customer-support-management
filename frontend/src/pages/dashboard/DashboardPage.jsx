import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../app/hooks";

import {
  selectDashboardAnalytics,
  selectDashboardError,
  selectDashboardLoading,
  selectDashboardSummary,
} from "../../features/dashboard/dashboardSelectors";

import { fetchDashboard } from "../../features/dashboard/dashboardThunks";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

import "./DashboardPage.css";

const numberValue = (...values) => {
  const value = values.find(
    (item) =>
      item !== undefined &&
      item !== null
  );

  return Number.isFinite(Number(value))
    ? Number(value)
    : 0;
};

const getCollection = (source, keys) => {
  for (const key of keys) {
    if (Array.isArray(source?.[key])) {
      return source[key];
    }
  }

  return [];
};

const labelOf = (item) =>
  item?.label ??
  item?.name ??
  item?.category ??
  item?.severity ??
  item?.status ??
  item?.agent?.name ??
  item?._id ??
  "Unknown";

const valueOf = (item) =>
  numberValue(
    item?.count,
    item?.total,
    item?.value,
    item?.requests,
    item?.totalRequests,
    item?.openRequests
  );

const formatDuration = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "—";
  }

  if (typeof value === "string") {
    return value;
  }

  let minutes = value;

  if (typeof value === "object") {
    if (Number.isFinite(Number(value.minutes))) {
      minutes = Number(value.minutes);
    } else if (Number.isFinite(Number(value.milliseconds))) {
      minutes = Number(value.milliseconds) / (1000 * 60);
    } else if (Number.isFinite(Number(value.hours))) {
      minutes = Number(value.hours) * 60;
    }
  }

  minutes = Number(minutes);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "—";
  }

  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }

  const hours = minutes / 60;

  if (hours < 24) {
    return `${hours.toFixed(1)} hrs`;
  }

  return `${(hours / 24).toFixed(1)} days`;
};

const StatCard = ({
  title,
  value,
  icon,
  tone,
}) => (
  <article
    className={`dashboard-stat-card ${tone}`}
  >
    <div className="dashboard-stat-icon">
      {icon}
    </div>

    <div>
      <p>{title}</p>

      <strong>{value}</strong>
    </div>
  </article>
);

const ChartCard = ({
  title,
  items,
  emptyText = "No data available",
}) => {
  const max = Math.max(
    ...items.map(valueOf),
    1
  );

  return (
    <section className="dashboard-card">
      <div className="dashboard-card-heading">
        <div>
          <h2>{title}</h2>

          <p>Current distribution</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="dashboard-chart-empty">
          {emptyText}
        </div>
      ) : (
        <div className="dashboard-bars">
          {items.map((item, index) => {
            const value = valueOf(item);

            const width = `${
              Math.max(
                (value / max) * 100,
                value ? 4 : 0
              )
            }%`;

            return (
              <div
                className="dashboard-bar-row"
                key={`${labelOf(item)}-${index}`}
              >
                <div className="dashboard-bar-label">
                  <span>
                    {labelOf(item)}
                  </span>

                  <strong>{value}</strong>
                </div>

                <div className="dashboard-bar-track">
                  <div
                    className="dashboard-bar-fill"
                    style={{ width }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const summary = useAppSelector(
    selectDashboardSummary
  );

  const analytics = useAppSelector(
    selectDashboardAnalytics
  );

  const loading = useAppSelector(
    selectDashboardLoading
  );

  const error = useAppSelector(
    selectDashboardError
  );

  const user = useAppSelector(
    (state) => state.auth.user
  );

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const totalOpen = numberValue(
    summary.totalOpenRequests,
    summary.openRequests,
    summary.totalOpen,
    summary.open
  );

  const investigation = numberValue(
    summary.requestsUnderInvestigation,
    summary.underInvestigation,
    summary.investigationRequests
  );

  const resolved = numberValue(
    summary.resolvedRequests,
    summary.totalResolved,
    summary.resolved
  );

  const breaches = numberValue(
    summary.slaBreaches,
    summary.slaBreachCount,
    summary.breached
  );

  const critical = numberValue(
    summary.criticalIssues,
    summary.criticalRequests,
    summary.critical
  );

  const categoryItems = getCollection(
    analytics,
    [
      "requestsByCategory",
      "byCategory",
      "categoryBreakdown",
    ]
  );

  const severityItems = getCollection(
    analytics,
    [
      "requestsBySeverity",
      "bySeverity",
      "severityBreakdown",
    ]
  );

  const workloadItems = getCollection(
    analytics,
    [
      "agentWorkload",
      "agentWorkloads",
      "workloadByAgent",
    ]
  );

  const averageResolution =
    analytics.averageResolutionTime ??
    summary.averageResolutionTime ??
    analytics.averageResolutionMinutes;

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="dashboard-eyebrow">
            Management overview
          </span>

          <h1>
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 18
              ? "afternoon"
              : "evening"}
            ,{" "}
            {user?.name || "there"}
          </h1>

          <p>
            Monitor service requests, SLA performance,
            and team workload from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/requests")}
        >
          View Service Requests →
        </button>
      </section>

      {error && (
        <ErrorMessage message={error} />
      )}

      {loading &&
      !Object.keys(summary).length ? (
        <div className="dashboard-loading">
          <Loader />
        </div>
      ) : (
        <>
          <section className="dashboard-stat-grid">
            <StatCard
              title="Open Requests"
              value={totalOpen}
              icon="○"
              tone="blue"
            />

            <StatCard
              title="Under Investigation"
              value={investigation}
              icon="⌕"
              tone="purple"
            />

            <StatCard
              title="Resolved Requests"
              value={resolved}
              icon="✓"
              tone="green"
            />

            <StatCard
              title="SLA Breaches"
              value={breaches}
              icon="!"
              tone="red"
            />

            <StatCard
              title="Critical Issues"
              value={critical}
              icon="⚠"
              tone="orange"
            />

            <StatCard
              title="Avg. Resolution"
              value={formatDuration(
                averageResolution
              )}
              icon="◷"
              tone="cyan"
            />
          </section>

          <section className="dashboard-chart-grid">
            <ChartCard
              title="Requests by Category"
              items={categoryItems}
            />

            <ChartCard
              title="Requests by Severity"
              items={severityItems}
            />
          </section>

          <section className="dashboard-card dashboard-workload-card">
            <div className="dashboard-card-heading">
              <div>
                <h2>Agent Workload</h2>

                <p>
                  Assigned requests by support agent
                </p>
              </div>
            </div>

            {workloadItems.length === 0 ? (
              <div className="dashboard-chart-empty">
                No workload data available
              </div>
            ) : (
              <div className="dashboard-workload-list">
                {workloadItems.map(
                  (item, index) => (
                    <div
                      className="dashboard-workload-row"
                      key={`${labelOf(item)}-${index}`}
                    >
                      <div className="dashboard-agent-avatar">
                        {labelOf(item)
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="dashboard-agent-info">
                        <strong>
                          {labelOf(item)}
                        </strong>

                        <span>
                          {valueOf(item)} assigned requests
                        </span>
                      </div>

                      <div className="dashboard-workload-track">
                        <div
                          className="dashboard-workload-fill"
                          style={{
                            width: `${
                              Math.min(
                                valueOf(item) * 10,
                                100
                              )
                            }%`,
                          }}
                        />
                      </div>

                      <strong className="dashboard-workload-value">
                        {valueOf(item)}
                      </strong>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default DashboardPage;