import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },
});

/*
 * Attach JWT token to every authenticated request.
 */
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
 * Handle API responses.
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    /*
     * Do NOT immediately remove the token here.
     *
     * A 401 can happen for an individual request
     * and should not automatically destroy the
     * entire frontend authentication state.
     *
     * Authentication cleanup is handled by the
     * Redux auth flow.
     */
    if (error.response?.status === 401) {
      console.warn(
        "API returned 401:",
        error.response?.data?.message ||
          "Unauthorized"
      );
    }

    return Promise.reject(error);
  }
);

export default api;