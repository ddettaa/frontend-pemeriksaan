import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import authService from "../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    console.log("Login - Initial user check:", currentUser);
    if (currentUser) {
      const role = currentUser.user.role.toLowerCase();
      console.log("Login - User already logged in with role:", role);
      if (role === "dokter") {
        navigate("/dokter/Dashboard");
      } else if (role === "perawat") {
        navigate("/perawat/DashboardPerawat");
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("Login - Submitting form with:", formData.username);

    try {
      const response = await authService.login(
        formData.username,
        formData.password
      );
      console.log("Login - Response received:", response);

      if (response.success) {
        const user = response.data.user;
        const role = user.role.toLowerCase();
        console.log("Login - User role (normalized):", role);

        // Redirect based on role
        if (role === "dokter") {
          console.log("Login - Navigating to dokter dashboard...");
          navigate("/dokter/Dashboard", { replace: true });
        } else if (role === "perawat") {
          console.log("Login - Navigating to perawat dashboard...");
          navigate("/perawat/DashboardPerawat", { replace: true });
        }
      }
    } catch (error) {
      console.error("Login - Error occurred:", error);
      setError(error.message || "Username atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center relative bg-cover bg-center"
      style={{ backgroundImage: "url('/login-bg.png')" }}
    >
      {/* Logo kiri bawah */}
      <img
        src="/simrs.png"
        alt="Logo SIMRS"
        className="absolute bottom-4 left-4 w-14 h-14 z-10"
      />

      {/* Container utama */}
      <div className="w-[900px] h-[500px] rounded-3xl overflow-hidden flex shadow-2xl z-10 bg-white">
        {/* Gambar Dokter */}
        <div className="w-1/2">
          <img
            src="/dokter.jpeg"
            alt="Dokter"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Sisi Form */}
        <div className="w-1/2 flex flex-col items-center justify-center p-10 bg-white">
          <div className="w-full mb-6">
            <h2 className="text-2xl font-bold text-[#2e4e4e]">
              Selamat Datang
            </h2>
            <p className="text-sm text-gray-700 mt-1">
              Masuk ke akun SIMRS Anda
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-5">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full border-b border-gray-300 bg-transparent placeholder-gray-500 text-gray-900 text-sm focus:outline-none py-2 focus:border-[#2e4e4e] transition-all"
              />
            </div>

            <div className="mb-5 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full border-b border-gray-300 bg-transparent placeholder-gray-500 text-gray-900 text-sm focus:outline-none py-2 pr-8 focus:border-[#2e4e4e] transition-all"
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#558c89] text-white py-2 rounded-full shadow-md hover:bg-[#457c78] transition duration-300 mt-4 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
