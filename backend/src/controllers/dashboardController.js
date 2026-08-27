const dashboardService = require("../services/dashboardService");

const getDashboardSummary = async (req, res, next) => {
  try {
    const summary =
      await dashboardService.getDashboardSummary();

    res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardAnalytics = async (req, res, next) => {
  try {
    const analytics =
      await dashboardService.getDashboardAnalytics();

    res.status(200).json({
      success: true,
      message: "Dashboard analytics fetched successfully",
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getDashboardAnalytics,
};