import axios from "axios";

const BASE_URL = "http://localhost:5000/api/v1"; // Adjust to your backend URL

export const authApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

authApi.defaults.headers.common["Content-Type"] = "application/json";

// Request interceptor to add auth token
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// // Response interceptor to handle errors
// authApi.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token");
//       window.location.href = "/auth/login";
//     }
//     return Promise.reject(error);
//   }
// );

// API methods matching your backend endpoints
export const authService = {
  register: async (userData) => {
    const response = await authApi.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await authApi.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  verifyOTP: async (otpData) => {
    const response = await authApi.post("/auth/verify-otp", otpData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await authApi.post("/auth/forgotpassword", { email });
    return response.data;
  },

  resetPassword: async (resetData) => {
    const response = await authApi.post(
      `/auth/resetpassword/${resetData.token}`,
      {
        password: resetData.password,
      }
    );
    return response.data;
  },

  getMe: async () => {
    const response = await authApi.get("/auth/me");
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },
};
