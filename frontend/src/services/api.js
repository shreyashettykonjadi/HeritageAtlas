import axios from "axios";

export function getApiData(response) {
  const data = response?.data;

  if (data == null) {
    return null;
  }

  // Supports both wrapped and direct API response formats.
  return data?.payload ?? data?.data ?? data?.user ?? data;
}

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

    // Login/register 401s are user-facing validation states, not global auth failures.
    if (status === 401 && (url.includes("/auth/login") || url.includes("/auth/register"))) {
      return Promise.reject(error);
    }

    if (status === 401) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export default api;
