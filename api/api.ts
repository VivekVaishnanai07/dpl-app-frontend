import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Base API URL
const BASE_URL = "https://dpl-app-backend.onrender.com/api";

// Create Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Use a workaround for async token fetching in the interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("isToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return Promise.resolve(config); // Ensure Axios waits for token
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Handle Expired Tokens)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("isToken");
      console.error("Session expired. Please login again.");
    }
    return Promise.reject(error);
  }
);

export default api;
