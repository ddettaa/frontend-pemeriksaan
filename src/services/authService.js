import axios from "axios";

const API_URL = "https://ti054a02.agussbn.my.id/api";

const login = async (username, password) => {
  try {
    console.log("Attempting login with:", { username });
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password,
    });

    console.log("Raw API Response:", response);

    if (response.data.success) {
      console.log("Login successful, storing data...");
      const userData = response.data.data;
      console.log("User data to store:", userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", userData.token);
    }

    return response.data;
  } catch (error) {
    console.error("Login error details:", error.response || error);
    throw (
      error.response?.data || {
        success: false,
        message: "Terjadi kesalahan pada server",
      }
    );
  }
};

const logout = async () => {
  try {
    const token = localStorage.getItem("token");
    await axios.post(
      `${API_URL}/logout`,
      {},
      {
        headers: {
          Authorization: token,
        },
      }
    );
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    console.log("Stored user string:", userStr);
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log("Parsed user data:", user);
      return user;
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

const authService = {
  login,
  logout,
  getCurrentUser,
};

export default authService;
