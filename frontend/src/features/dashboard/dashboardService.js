import api from "../../services/api";

const dashboardService = {
  getSummary: async () => {
    const response = await api.get("/dashboard/summary");
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get("/dashboard/analytics");
    return response.data;
  },
};

export default dashboardService;