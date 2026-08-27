const ServiceRequest = require("../models/ServiceRequest");
const { getSlaStatus } = require("./slaService");

const getDashboardSummary = async () => {
  const [
    totalOpen,
    underInvestigation,
    resolved,
    criticalIssues,
    totalRequests,
  ] = await Promise.all([
    ServiceRequest.countDocuments({
      status: "Open",
    }),

    ServiceRequest.countDocuments({
      status: "Under Investigation",
    }),

    ServiceRequest.countDocuments({
      status: {
        $in: ["Resolved", "Closed"],
      },
    }),

    ServiceRequest.countDocuments({
      severity: "Critical",
      status: {
        $nin: ["Resolved", "Closed"],
      },
    }),

    ServiceRequest.countDocuments(),
  ]);

  const activeRequests =
    await ServiceRequest.find({
      status: {
        $nin: ["Resolved", "Closed"],
      },
    })
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
      slaBreaches++;
    }

    if (slaStatus === "APPROACHING") {
      slaApproaching++;
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

const getDashboardAnalytics = async () => {
  const [
    requestsByCategory,
    requestsBySeverity,
    requestsByStatus,
    agentWorkload,
    averageResolution,
  ] = await Promise.all([
    ServiceRequest.aggregate([
      {
        $group: {
          _id: "$category",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]),

    ServiceRequest.aggregate([
      {
        $group: {
          _id: "$severity",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]),

    ServiceRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]),

    ServiceRequest.aggregate([
      {
        $match: {
          assignedAgent: {
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: "$assignedAgent",
          totalRequests: {
            $sum: 1,
          },
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
      {
        $sort: {
          openRequests: -1,
        },
      },
    ]),

    ServiceRequest.aggregate([
      {
        $match: {
          status: {
            $in: ["Resolved", "Closed"],
          },
          resolutionDate: {
            $ne: null,
          },
        },
      },
      {
        $project: {
          resolutionTime: {
            $subtract: [
              "$resolutionDate",
              "$createdAt",
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          averageResolutionTimeMs: {
            $avg: "$resolutionTime",
          },
          resolvedCount: {
            $sum: 1,
          },
        },
      },
    ]),
  ]);

  const averageResolutionTimeMs =
    averageResolution[0]?.averageResolutionTimeMs || 0;

  const averageResolutionTimeHours =
    averageResolutionTimeMs / (1000 * 60 * 60);

  return {
    requestsByCategory,
    requestsBySeverity,
    requestsByStatus,
    agentWorkload,
    averageResolutionTime: {
      milliseconds: averageResolutionTimeMs,
      hours: Number(
        averageResolutionTimeHours.toFixed(2)
      ),
    },
  };
};

module.exports = {
  getDashboardSummary,
  getDashboardAnalytics,
};