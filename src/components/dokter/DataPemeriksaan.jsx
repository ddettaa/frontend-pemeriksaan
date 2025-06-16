import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const DataPemeriksaan = () => {
  // Helper function to convert gender
  const convertGender = (gender) => {
    if (!gender) return "-";
    return gender.toUpperCase() === "L"
      ? "Laki-laki"
      : gender.toUpperCase() === "P"
      ? "Perempuan"
      : gender;
  };

  const { id_pasien: no_reg } = useParams();
  const [pemeriksaanData, setPemeriksaanData] = useState({
    no_reg: "",
    nama: "",
    jenis_kelamin: "",
    suhu: "",
    tensi: "",
    tinggi_badan: "",
    berat_badan: "",
    keluhan: "",
    tanggal: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "https://ti054a02.agussbn.my.id"; // Hardcoded API URL

  useEffect(() => {
    const fetchPemeriksaanData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Token tidak ditemukan");
        }

        console.log("Fetching data for no_reg:", no_reg);

        // Mengambil data pemeriksaan berdasarkan no_registrasi
        const response = await axios.get(`${API_URL}/api/pemeriksaan/${no_reg}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        console.log("API Response:", response.data);

        if (response.data.status === "success" && response.data.data) {
          const data = response.data.data;

          // Use current date since we don't have created_at
          const tanggal = new Date().toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

          setPemeriksaanData({
            no_reg: data.no_registrasi,
            nama: data.pasien?.nama_pasien || "Tidak ada nama",
            jenis_kelamin: convertGender(data.pasien?.jenis_kelamin) || "-",
            suhu: data.suhu ? (data.suhu / 10).toFixed(1) : "-", // Konversi dari 365 ke 36.5
            tensi: data.tensi || "-",
            tinggi_badan: data.tinggi_badan || "-",
            berat_badan: data.berat_badan || "-",
            keluhan: data.keluhan || "-",
            tanggal: tanggal,
          });
        } else {
          throw new Error(
            response.data.message || "Data pemeriksaan tidak ditemukan"
          );
        }
      } catch (err) {
        console.error("Error fetching examination data:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Gagal mengambil data pemeriksaan"
        );

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (no_reg) {
      fetchPemeriksaanData();
    }
  }, [no_reg, API_URL]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0099a8]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex">
      <aside className="w-24 bg-[#dff4f4] flex flex-col items-center py-6">
        <div className="group mb-8">
          <Link to="/dokter/dashboard" className="flex flex-col items-center">
            <button className="p-3 rounded-xl mb-2 focus:outline-none bg-transparent hover:bg-white transform hover:scale-105 transition-all duration-200 hover:shadow-md">
              <svg
                className="w-5 h-5 text-gray-500 group-hover:text-[#0099a8]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-3m-8 0H5a2 2 0 0 1-2-2z" />
              </svg>
            </button>
            <span className="text-xs text-gray-500 group-hover:text-[#0099a8]">
              Dashboard
            </span>
          </Link>
        </div>

        <div className="group mb-8">
          <Link to="/dokter/list-pasien" className="flex flex-col items-center">
            <button className="p-3 rounded-xl mb-2 focus:outline-none bg-[#0099a8] shadow-md transform hover:scale-105 transition-all duration-200 hover:bg-[#007a85]">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11 a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159 c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
              </svg>
            </button>
            <span className="text-xs text-[#0099a8]">Data Pasien</span>
          </Link>
        </div>

        <div className="group mb-52">
          <Link to="/dokter/history" className="flex flex-col items-center">
            <button className="p-3 rounded-xl mb-2 focus:outline-none bg-transparent hover:bg-white transform hover:scale-105 transition-all duration-200 hover:shadow-md">
              <svg
                className="w-5 h-5 text-gray-500 group-hover:text-[#0099a8]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <span className="text-xs text-gray-500 group-hover:text-[#0099a8]">
              History
            </span>
          </Link>
        </div>

        <div className="group mb-8">
          <Link to="/dokter/akun" className="flex flex-col items-center">
            <button className="p-3 rounded-xl mb-2 focus:outline-none bg-transparent hover:bg-white transform hover:scale-105 transition-all duration-200 hover:shadow-md">
              <svg
                className="w-5 h-5 text-gray-500 group-hover:text-[#0099a8]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4s-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </button>
            <span className="text-xs text-gray-500 group-hover:text-[#0099a8]">
              Akun
            </span>
          </Link>
        </div>

        <div className="group">
          <Link to="/logout" className="flex flex-col items-center">
            <button className="p-3 rounded-xl mb-2 focus:outline-none bg-transparent hover:bg-white transform hover:scale-105 transition-all duration-200 hover:shadow-md">
              <svg
                className="w-5 h-5 text-gray-500 group-hover:text-[#0099a8]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <span className="text-xs text-gray-500 group-hover:text-[#0099a8]">
              Logout
            </span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-auto relative">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-lg font-bold">DIAGNOSA PASIEN</h1>
            <p className="text-sm font-semibold text-gray-600">
              Pemeriksaan Awal &gt; Diagnosa &gt; Resep Obat
            </p>
          </div>
          <img
            src="/simrs.png"
            alt="Logo"
            className="w-14 h-14"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(41%) sepia(85%) saturate(2044%) hue-rotate(165deg) brightness(93%) contrast(101%)",
            }}
          />
        </div>

        {/* Data Pasien */}
        <div className="bg-white rounded shadow px-8 py-6 border border-gray-200 w-[750px] mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Data Pasien</h2>
          <div className="grid grid-cols-2 gap-y-4 text-sm text-gray-700">
            <div>
              <div className="mb-2">
                <label>No Reg</label>
                <input
                  type="text"
                  value={pemeriksaanData.no_reg}
                  disabled
                  className="w-full bg-transparent border-none p-0 m-0 text-sm text-gray-800"
                />
              </div>
              <div className="mb-2">
                <label>Nama</label>
                <input
                  type="text"
                  value={pemeriksaanData.nama}
                  disabled
                  className="w-full bg-transparent border-none p-0 m-0 text-sm text-gray-800"
                />
              </div>
              <div>
                <label>Jenis Kelamin</label>
                <input
                  type="text"
                  value={pemeriksaanData.jenis_kelamin}
                  disabled
                  className="w-full bg-transparent border-none p-0 m-0 text-sm text-gray-800"
                />
              </div>
            </div>
            <div>
              <div className="mb-2">
                <label>Suhu</label>
                <input
                  type="text"
                  value={`${pemeriksaanData.suhu} °C`}
                  disabled
                  className="w-full bg-transparent border-none p-0 m-0 text-sm text-gray-800"
                />
              </div>
              <div className="mb-2">
                <label>Tensi</label>
                <input
                  type="text"
                  value={`${pemeriksaanData.tensi} mmHg`}
                  disabled
                  className="w-full bg-transparent border-none p-0 m-0 text-sm text-gray-800"
                />
              </div>
              <div className="mb-2">
                <label>Tinggi Badan</label>
                <input
                  type="text"
                  value={`${pemeriksaanData.tinggi_badan} cm`}
                  disabled
                  className="w-full bg-transparent border-none p-0 m-0 text-sm text-gray-800"
                />
              </div>
              <div>
                <label>Berat Badan</label>
                <input
                  type="text"
                  value={`${pemeriksaanData.berat_badan} kg`}
                  disabled
                  className="w-full bg-transparent border-none p-0 m-0 text-sm text-gray-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pemeriksaan */}
        <div className="bg-white rounded shadow px-8 py-6 border border-gray-200 w-[750px] mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Pemeriksaan</h2>
          <div className="text-sm text-gray-700">
            <div className="mb-2">
              <label>Tanggal</label>
              <input
                type="text"
                value={pemeriksaanData.tanggal}
                disabled
                className="w-full bg-transparent border-none p-0 m-0 text-sm text-gray-800"
              />
            </div>
            <div>
              <label>Keluhan</label>
              <input
                type="text"
                value={pemeriksaanData.keluhan}
                disabled
                className="w-full bg-transparent border-none p-0 m-0 text-sm text-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Tombol */}
        <Link to={`/dokter/diagnosa/${pemeriksaanData.no_reg}`}>
          <button className="bg-[#0099a8] text-white px-5 py-2 rounded shadow text-sm float-right hover:bg-[#007a85] transition-colors duration-200">
            SELANJUTNYA ⏵
          </button>
        </Link>
      </main>
    </div>
  );
};

export default DataPemeriksaan;
