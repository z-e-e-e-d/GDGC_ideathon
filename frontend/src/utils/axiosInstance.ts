import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Attach token if exists
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("koralink_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
