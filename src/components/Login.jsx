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

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    console.log("Login - Initial user check:", currentUser);

    if (currentUser) {
      const role = currentUser.role;
      if (role === "DOKTER") {
        navigate("/dokter/Dashboard", { replace: true });
      } else if (role === "PERAWAT") {
        navigate("/perawat/DashboardPerawat", { replace: true });
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

    try {
      const response = await authService.login({
        username: formData.username,
        password: formData.password,
      });

      console.log("Login - Response received:", response);

      const { token, user } = response;

      if (token && user) {
        // user dan token sudah disimpan otomatis oleh authService
        const role = user.role;

        if (role === "DOKTER") {
          navigate("/dokter/Dashboard", { replace: true });
        } else if (role === "PERAWAT") {
          navigate("/perawat/DashboardPerawat", { replace: true });
        } else {
          setError("Role tidak dikenali.");
        }
      } else {
        setError("Login gagal. Data tidak lengkap.");
      }
    } catch (error) {
      console.error("Login - Error occurred:", error);
      setError("Username atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center relative bg-cover bg-center"
      style={{ backgroundImage: "url('/login-bg.png')" }}
    >
      <img
        src="/simrs.png"
        alt="Logo SIMRS"
        className="absolute bottom-4 left-4 w-14 h-14 z-10"
      />

      <div className="w-[900px] h-[500px] rounded-3xl overflow-hidden flex shadow-2xl z-10 bg-white">
        <div className="w-1/2">
          <img
            src="/dokter.jpeg"
            alt="Dokter"
            className="w-full h-full object-cover"
          />
        </div>

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
              <div
                className="relative text-red-500 text-sm text-center mb-4 animate-shake bg-red-50 border border-red-200 rounded-lg py-2 px-4 flex items-center justify-center gap-2 shadow-sm transition-all duration-300"
                style={{ minHeight: 40 }}
              >
                <svg className="w-5 h-5 text-red-400 animate-bounce mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                </svg>
                <span>{error}</span>
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
