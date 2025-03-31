import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "/api/auth";

// Configure axios interceptor to automatically include auth token in all requests
axios.interceptors.request.use(
    (config) => {
      const token = Cookies.get("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);

const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);

  // Store token in cookie instead of localStorage
  Cookies.set("token", response.data.token, {
    expires: 1/24, // 1 hour
    sameSite: "strict",
    // secure: true, // Uncomment in production (HTTPS only)
  });

  return response.data;
};

const getUserProfile = async () => {
  // No need to manually get token and set headers anymore
  // The axios interceptor handles this automatically
  const response = await axios.get(`${API_URL}/profile`);
  return response.data;
};

const logout = () => {
  // Remove token from cookies instead of localStorage
  Cookies.remove("token");
};

const checkAuth = () => {
  return !!Cookies.get("token");
};

export default { register, login, getUserProfile, logout, checkAuth };