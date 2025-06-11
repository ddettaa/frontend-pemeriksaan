import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const statusService = {
  // Mendapatkan status terkini pasien
  getCurrentStatus: async (noReg) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/api/status/${noReg}/current`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    return response.data;
  },

  // Mendapatkan history status pasien
  getStatusHistory: async (noReg) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/api/status/${noReg}/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    return response.data;
  },

  // Menambah status baru
  addStatus: async (data) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_URL}/api/status`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },
};

export default statusService;
