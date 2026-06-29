import axios from "axios";

// ── Environment helpers ──────────────────────────────────────────────────────
const getEnv = (key) => import.meta.env[key] || "";

// Dynamically compute the API base URL.
// In dev, NEXT_PUBLIC_API_BASE_URL is "/api/method/" (uses Vite dev server proxy).
// In production (e.g. Vercel), we construct the absolute URL to the ngrok backend.
const getBaseURL = () => {
  let envUrl = getEnv("NEXT_PUBLIC_API_BASE_URL");
  
  if (import.meta.env.PROD && envUrl.startsWith("/")) {
    const target = getEnv("NEXT_PUBLIC_PROXY_TARGET");
    if (target) {
      envUrl = `${target.replace(/\/$/, '')}${envUrl}`;
    }
  }

  // Ensure it ends with a trailing slash
  if (envUrl && !envUrl.endsWith("/")) {
    envUrl += "/";
  }
  return envUrl;
};

// Build an axios instance pointed at the API base URL.
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "ngrok-skip-browser-warning": "69420", // Bypass ngrok warning dialogs
  },
  withCredentials: true, // Forward cookies for Frappe session support
});

// ── Exported endpoint map (read once at boot) ────────────────────────────────
export const ENDPOINTS = {
  ping:           getEnv("NEXT_PUBLIC_ENDPOINT_PING"),
  properties:     getEnv("NEXT_PUBLIC_ENDPOINT_PROPERTIES"),
  bookInspection: getEnv("NEXT_PUBLIC_ENDPOINT_BOOK_INSPECTION"),
  createProperty: getEnv("NEXT_PUBLIC_ENDPOINT_CREATE_PROPERTY"),
  auth:           getEnv("NEXT_PUBLIC_ENDPOINT_AUTH_REGISTER_LOGIN"),
  login:          getEnv("NEXT_PUBLIC_ENDPOINT_LOGIN"),
  adminLogin:     getEnv("NEXT_PUBLIC_ENDPOINT_ADMIN_LOGIN"),
};

// ── Response interceptor — normalise Frappe errors ──────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message ||
                    error.response?.data?.exc_type ||
                    error.message ||
                    "An unexpected error occurred";

    console.error(`[apiClient] ${status ?? "NETWORK"} →`, message);

    // Re-throw a clean error so callers don't need to dig into axios internals
    const clean = new Error(message);
    clean.status = status;
    clean.raw    = error;
    return Promise.reject(clean);
  },
);

// Helper to strip leading slash so that Axios merges baseURL and endpoint relatively.
const cleanEndpoint = (endpoint) => {
  if (!endpoint) return "";
  return endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
};

// ── Public client API ────────────────────────────────────────────────────────
export const apiClient = {
  /**
   * GET request. Appends token as a Bearer header when supplied.
   * @param {string} endpoint  - relative path, e.g. ENDPOINTS.properties
   * @param {string|null} token
   * @returns {Promise<any>}   - response.data (already unwrapped by axios)
   */
  async get(endpoint, token = null) {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const url = cleanEndpoint(endpoint);
    const response = await axiosInstance.get(url, { headers });
    return response.data;
  },

  /**
   * POST request.
   * @param {string} endpoint
   * @param {object} body
   * @param {string|null} token
   * @returns {Promise<any>}
   */
  async post(endpoint, body, token = null) {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const url = cleanEndpoint(endpoint);
    const response = await axiosInstance.post(url, body, { headers });
    return response.data;
  },
};
