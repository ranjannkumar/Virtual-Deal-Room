import axios from "axios";

const API_URL = "/api/auth";  

const register = async (userData) => {
  return await axios.post(`${API_URL}/register`, userData);
};

const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  localStorage.setItem("token", response.data.token);
  return response.data;
};

const getUserProfile = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const logout = () => {
  localStorage.removeItem("token");
};

export default { register, login, getUserProfile, logout };
