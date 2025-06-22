import axios from "axios";

const API_URL = "https://ti054a01.agussbn.my.id/api";

const login = async (email, password) => {
  try {
    console.log("Attempting login with:", { email });
    const response = await axios.post(`${API_URL}/login`, { email, password });

    console.log("Raw API Response:", response);

    const userData = response.data;
    console.log("User data received from API:", userData);

    // Simpan seluruh user object ke localStorage
    // userData.user berisi informasi user lengkap termasuk poli
    localStorage.setItem("user", JSON.stringify(userData.user));
    localStorage.setItem("token", `${userData.token_type} ${userData.access_token}`);

    console.log("Data saved to localStorage:");
    console.log("User:", JSON.stringify(userData.user));
    console.log("Token:", `${userData.token_type} ${userData.access_token}`);

    return userData;
  } catch (error) {
    console.error("Login error details:", error.response || error);
    throw error.response?.data || {
      success: false,
      message: "Terjadi kesalahan pada server",
    };
  }
};

const logout = async () => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      await axios.post(`${API_URL}/logout`, {}, {
        headers: { Authorization: token },
      });
    }
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  } catch (error) {
    console.error("Logout error:", error);
    // Tetap hapus data lokal meskipun API gagal
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
};

const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    console.log("getCurrentUser - Retrieved user:", user);
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

const authService = { login, logout, getCurrentUser };
export default authService;