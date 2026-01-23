// /Music-Web/src/services/auth.service.js
import api, {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
} from "./api";

export const authService = {
  signup(data) {
    return api.post("/auth/signup", data);
  },

  login(data) {
    return api.post("/auth/login", data);
  },

  me() {
    return api.get("/auth/me");
  },

  setSession({ accessToken, refreshToken, user }) {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  logout() {
    this.clearSession();
  },
};
