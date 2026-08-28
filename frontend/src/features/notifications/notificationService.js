import api from "../../services/api";

const notificationService = {
  getUnreadCount: async () => {
    const response = await api.get("/notifications", {
      params: {
        page: 1,
        limit: 1,
      },
    });

    return response.data?.data?.unreadCount || 0;
  },
};

export default notificationService;
