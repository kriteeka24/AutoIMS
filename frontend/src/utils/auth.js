/**
 * Auth utility for handling authentication across the app
 */

const API_BASE = "http://localhost:5000/api";

/**
 * Check if user is authenticated by verifying token exists
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

/**
 * Get the auth token
 */
export const getAuthToken = () => localStorage.getItem("token");

/**
 * Clear auth and redirect to login
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

/**
 * Handle API response - if 401, clear token and redirect to login
 * @param {Response} response - Fetch response object
 * @returns {Response} - The response if OK
 * @throws {Error} - Throws error for non-OK responses
 */
export const handleAuthResponse = async (response) => {
  if (response.status === 401) {
    // Token is invalid or employee not found - clear and redirect
    console.warn("Authentication failed - redirecting to login");
    logout();
    throw new Error("Session expired. Please log in again.");
  }
  return response;
};

/**
 * Make an authenticated API request with automatic 401 handling
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export const authFetch = async (url, options = {}) => {
  const token = getAuthToken();

  if (!token) {
    logout();
    throw new Error("No authentication token");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, { ...options, headers });

  // Handle 401 - redirect to login
  if (response.status === 401) {
    console.warn("Auth token invalid or employee not found - logging out");
    logout();
    throw new Error("Session expired. Please log in again.");
  }

  return response;
};

/**
 * Verify current session is valid
 * @returns {Promise<boolean>} - True if session is valid
 */
export const verifySession = async () => {
  try {
    const token = getAuthToken();
    if (!token) return false;

    // Make a lightweight API call to verify the token
    const response = await fetch(`${API_BASE}/employees`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      logout();
      return false;
    }

    return response.ok;
  } catch (err) {
    console.error("Session verification failed:", err);
    return false;
  }
};

export default {
  isAuthenticated,
  getAuthToken,
  logout,
  handleAuthResponse,
  authFetch,
  verifySession,
};
