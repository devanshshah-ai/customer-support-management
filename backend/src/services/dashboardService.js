const ServiceRequest = require("../models/ServiceRequest");
const { getSlaStatus } = require("./slaService");
const { getRequestScope } = require("./requestAccessService");

const withScope = (scope, extra = {}) => ({
  ...scope,
  ...extra,
});

const getDashboardSummary = async (actor) => {
  const scope = getRequestScope(actor);

  const [
    totalOpen,
    underInvestigation,
    resolved,
    criticalIssues,
    totalRequests,
  ] = await Promise.all([
    ServiceRequest.countDocuments(
      withScope(scope, { status: "Open" })
    ),
    ServiceRequest.countDocuments(
      withScope(scope, {
        status: "Under Investigation",
      })
    ),
    ServiceRequest.countDocuments(
      withScope(scope, {
        status: { $in: ["Resolved", "Closed"] },
      })
    ),
    ServiceRequest.countDocuments(
      withScope(scope, {
        severity: "Critical",
        status: { $nin: ["Resolved", "Closed"] },
      })
    ),
    ServiceRequest.countDocuments(scope),
  ]);

  const activeRequests = await ServiceRequest.find(
    withScope(scope, {
      status: { $nin: ["Resolved", "Closed"] },
    })
  )
    .select(
      "severity status createdAt slaDeadline resolutionDate"
    )
    .lean();

  let slaBreaches = 0;
  let slaApproaching = 0;

  activeRequests.forEach((request) => {
    const slaStatus = getSlaStatus(
      request.slaDeadline,
      request.status,
      request.createdAt,
      request.resolutionDate
    );

    if (slaStatus === "BREACHED") {
      slaBreaches += 1;
    }

    if (slaStatus === "APPROACHING") {
      slaApproaching += 1;
    }
  });

  return {
    totalOpen,
    underInvestigation,
    resolved,
    slaBreaches,
    slaApproaching,
    criticalIssues,
    totalRequests,
  };
};

const getDashboardAnalytics = async (actor) => {
  const scope = getRequestScope(actor);
  const matchStage = Object.keys(scope).length
    ? [{ $match: scope }]
    : [];

  const [
    requestsByCategory,
    requestsBySeverity,
    requestsByStatus,
    agentWorkload,
    averageResolution,
  ] = await Promise.all([
    ServiceRequest.aggregate([
      ...matchStage,
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    ServiceRequest.aggregate([
      ...matchStage,
      { $group: { _id: "$severity", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    ServiceRequest.aggregate([
      ...matchStage,
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    ServiceRequest.aggregate([
      ...matchStage,
      {
        $match: {
          assignedAgent: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$assignedAgent",
          totalRequests: { $sum: 1 },
          openRequests: {
            $sum: {
              $cond: [
                {
                  $not: [
                    {
                      $in: [
                        "$status",
                        ["Resolved", "Closed"],
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          resolvedRequests: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$status",
                    ["Resolved", "Closed"],
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "agent",
        },
      },
      {
        $unwind: {
          path: "$agent",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          totalRequests: 1,
          openRequests: 1,
          resolvedRequests: 1,
          agent: {
            id: "$agent._id",
            name: "$agent.name",
            email: "$agent.email",
          },
        },
      },
      { $sort: { openRequests: -1 } },
    ]),
    ServiceRequest.aggregate([
      ...matchStage,
      {
        $match: {
          status: { $in: ["Resolved", "Closed"] },
          resolutionDate: { $ne: null },
        },
      },
      {
        $project: {
          resolutionTime: {
            $subtract: ["$resolutionDate", "$createdAt"],
          },
        },
      },
      {
        $group: {
          _id: null,
          averageResolutionTimeMs: {
            $avg: "$resolutionTime",
          },
          resolvedCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const averageResolutionTimeMs =
    averageResolution[0]?.averageResolutionTimeMs || 0;

  return {
    requestsByCategory,
    requestsBySeverity,
    requestsByStatus,
    agentWorkload,
    averageResolutionTime: {
      milliseconds: averageResolutionTimeMs,
      hours: Number(
        (averageResolutionTimeMs / (1000 * 60 * 60)).toFixed(2)
      ),
    },
  };
};

module.exports = {
  getDashboardSummary,
  getDashboardAnalytics,
};
