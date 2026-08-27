import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import api from "../../services/api";

const SEVERITY_COLORS = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
};

const STATUS_COLORS = {
  Open: "#3b82f6",
  "Under Investigation": "#f59e0b",
  Resolved: "#22c55e",
  Closed: "#64748b",
};

const CATEGORY_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#06b6d4",
  "#f97316",
  "#84cc16",
];

const formatLabel = (value) => {
  if (!value) return "Unknown";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const ReportsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard/analytics");

      setAnalytics(response.data?.data || null);
    } catch (err) {
      console.error("Failed to load report analytics:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load report analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const categoryData = useMemo(() => {
    if (!analytics?.requestsByCategory) return [];

    return analytics.requestsByCategory.map((item) => ({
      name: formatLabel(item._id),
      requests: item.count,
    }));
  }, [analytics]);

  const severityData = useMemo(() => {
    if (!analytics?.requestsBySeverity) return [];

    return analytics.requestsBySeverity.map((item) => ({
      name: formatLabel(item._id),
      value: item.count,
    }));
  }, [analytics]);

  const statusData = useMemo(() => {
    if (!analytics?.requestsByStatus) return [];

    return analytics.requestsByStatus.map((item) => ({
      name: formatLabel(item._id),
      requests: item.count,
    }));
  }, [analytics]);

  const agentWorkloadData = useMemo(() => {
    if (!analytics?.agentWorkload) return [];

    return analytics.agentWorkload.map((item) => ({
      name: item.agent?.name || "Unassigned",
      openRequests: item.openRequests || 0,
      resolvedRequests: item.resolvedRequests || 0,
      totalRequests: item.totalRequests || 0,
    }));
  }, [analytics]);

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 p-6 lg:p-8">
        <div className="mb-6">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-80 animate-pulse rounded-xl bg-white shadow-sm"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-gray-50 p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Reports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Analyze service request performance and workload.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchAnalytics}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Analyze service requests, severity, status and agent workload.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Requests
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {statusData.reduce(
              (total, item) => total + item.requests,
              0
            )}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            All service requests
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Open Requests
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {statusData.find(
              (item) => item.name === "Open"
            )?.requests || 0}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Currently open
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Critical Issues
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {severityData.find(
              (item) => item.name === "Critical"
            )?.value || 0}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Critical severity requests
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Avg. Resolution
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {analytics?.averageResolutionTime?.hours || 0}h
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Average resolution time
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Requests by Category */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Requests by Category
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Distribution of service requests by category.
            </p>
          </div>

          <div className="h-[320px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={categoryData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 40,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="requests"
                    name="Requests"
                    radius={[6, 6, 0, 0]}
                  >
                    {categoryData.map(
                      (_, index) => (
                        <Cell
                          key={`category-${index}`}
                          fill={
                            CATEGORY_COLORS[
                              index %
                                CATEGORY_COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </div>

        {/* Requests by Severity */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Requests by Severity
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Breakdown of requests according to severity.
            </p>
          </div>

          <div className="h-[320px]">
            {severityData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={severityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={105}
                    innerRadius={45}
                    paddingAngle={3}
                    label
                  >
                    {severityData.map(
                      (entry, index) => (
                        <Cell
                          key={`severity-${index}`}
                          fill={
                            SEVERITY_COLORS[
                              entry.name
                            ] || "#6366f1"
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </div>

        {/* Requests by Status */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Requests by Status
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current distribution of service request statuses.
            </p>
          </div>

          <div className="h-[320px]">
            {statusData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={statusData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="requests"
                    name="Requests"
                    radius={[6, 6, 0, 0]}
                  >
                    {statusData.map(
                      (entry, index) => (
                        <Cell
                          key={`status-${index}`}
                          fill={
                            STATUS_COLORS[
                              entry.name
                            ] || "#6366f1"
                          }
                        />
                      )
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </div>

        {/* Agent Workload */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Agent Workload
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Open and resolved requests assigned to each agent.
            </p>
          </div>

          <div className="h-[320px]">
            {agentWorkloadData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={agentWorkloadData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="openRequests"
                    name="Open Requests"
                    stackId="requests"
                    fill="#f97316"
                  />

                  <Bar
                    dataKey="resolvedRequests"
                    name="Resolved Requests"
                    stackId="requests"
                    fill="#22c55e"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </div>
      </div>

      {/* Average Resolution */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Resolution Performance
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Average time taken to resolve closed and resolved requests.
            </p>
          </div>

          <div className="rounded-lg bg-green-50 px-5 py-3 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-green-600">
              Average Resolution Time
            </p>

            <p className="mt-1 text-2xl font-bold text-green-700">
              {analytics?.averageResolutionTime?.hours || 0} hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyChart = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-500">
          No data available
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Data will appear here once service requests are available.
        </p>
      </div>
    </div>
  );
};

export default ReportsPage;