import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    // /auth/me returning 401 means "not logged in" and is an expected state.
    if (status === 401 && url.includes("/auth/me")) {
      error.isExpectedAuthError = true;
      return Promise.reject(error);
    }

    if (status === 401) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export default api;
