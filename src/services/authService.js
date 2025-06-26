import axios from "axios";

// Configure axios instance
const api = axios.create({
  baseURL: "https://ti054a02.agussbn.my.id",
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const authService = {
  async login(credentials) {
    try {
      console.log("Attempting login with:", credentials);

      // Get CSRF token first
      console.log("Fetching CSRF cookie...");
      const csrfResponse = await api.get("/sanctum/csrf-cookie");
      console.log("CSRF cookie response:", csrfResponse.status);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Login request
      console.log("Making login request...");
      const response = await api.post("/api/login", credentials);
      console.log("Login successful:", response.data);

      const loginData = response.data.data; // seluruh objek data
      localStorage.setItem("user", JSON.stringify(loginData));
      localStorage.setItem("token", loginData.token);

      return loginData;
    } catch (error) {
      console.error("Login error details:", error.response || error);
      throw error;
    }
  },

  async logout() {
    try {
      await api.post("/api/logout");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      // ✅ Bersihkan localStorage saat logout
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  },

  // ✅ Ambil dari localStorage agar tidak perlu async/await
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem("token");
  },
};

export default authService;
