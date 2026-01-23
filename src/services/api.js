// src/services/api.js
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// ✅ Chuẩn hoá key
export const ACCESS_TOKEN_KEY = "accessToken";
export const LEGACY_ACCESS_TOKEN_KEY = "accesstoken"; // key cũ bạn đang dùng
export const REFRESH_TOKEN_KEY = "refreshToken";
export const USER_KEY = "user";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    // ✅ Ưu tiên key mới, fallback key cũ
    const token =
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
      localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY);

    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      // ✅ Xoá đúng token/user (không clear toàn bộ LS)
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      // (tuỳ bạn) có thể dispatch event để UI cập nhật
      try {
        window.dispatchEvent(new Event("userUpdated"));
      } catch (_) {}
    }
    return Promise.reject(error);
  }
);

export default api;
