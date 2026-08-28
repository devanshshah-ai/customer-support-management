import api from "../../services/api";

const aiService = {
  generateSummary: async (requestId) => {
    const response = await api.post(
      `/requests/${requestId}/ai/summary`
    );
    return response.data;
  },

  suggestResponse: async (requestId) => {
    const response = await api.post(
      `/requests/${requestId}/ai/suggest-response`
    );
    return response.data;
  },

  analyzeIssue: async ({ subject, description }) => {
    const response = await api.post("/requests/ai/analyze", {
      subject,
      description,
    });
    return response.data;
  },
};

export default aiService;
