import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

const RangkumanPemeriksaan = () => {
  // Perbaiki destructuring agar sesuai dengan route: /perawat/rangkuman/:no_registrasi
  const { no_registrasi } = useParams();
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

  const API_URL = "https://ti054a02.agussbn.my.id";

  // Helper function to convert gender
  const convertGender = (gender) => {
    if (!gender) return "-";
    return gender.toUpperCase() === "L"
      ? "Laki-laki"
      : gender.toUpperCase() === "P"
      ? "Perempuan"
      : gender;
  };

  useEffect(() => {
    const fetchPemeriksaanData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        console.log("[RangkumanPemeriksaan] Fetching:", `${API_URL}/api/pemeriksaan/${no_registrasi}`);
        const response = await axios.get(
          `${API_URL}/api/pemeriksaan/${no_registrasi}`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        console.log("[RangkumanPemeriksaan] API response:", response.data);
        if (response.data.status === "success" && response.data.data) {
          const dataArr = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
          console.log("[RangkumanPemeriksaan] Data array:", dataArr);
          let found = dataArr[0];
          if (dataArr.length > 1 && no_registrasi) {
            found = dataArr.find(item =>
              String(item.pasien?.no_registrasi) === String(no_registrasi) ||
              String(item.pemeriksaan?.no_registrasi) === String(no_registrasi)
            ) || dataArr[0];
          }
          console.log("[RangkumanPemeriksaan] Found record:", found);
          const pemeriksaan = found.pemeriksaan;
          const pasien = found.pasien;
          const tanggal = pasien && pasien.tgl_kunjungan
            ? new Date(pasien.tgl_kunjungan).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })
            : "-";
          setPemeriksaanData({
            no_reg: pemeriksaan.no_registrasi,
            nama: pasien?.nama_pasien || "Tidak ada nama",
            jenis_kelamin: convertGender(pasien?.jenis_kelamin) || "-",
            suhu: pemeriksaan.suhu ? (pemeriksaan.suhu / 10).toFixed(1) : "-",
            tensi: pemeriksaan.tensi || "-",
            tinggi_badan: pemeriksaan.tinggi_badan || "-",
            berat_badan: pemeriksaan.berat_badan || "-",
            keluhan: pemeriksaan.keluhan || "-",
            tanggal: tanggal,
            tindakan: (typeof pemeriksaan.tindakan === 'string' && pemeriksaan.tindakan.trim() !== '') ? pemeriksaan.tindakan : (pemeriksaan.tindakan ? JSON.stringify(pemeriksaan.tindakan) : '-'),
            diagnosa: (typeof pemeriksaan.diagnosa === 'string' && pemeriksaan.diagnosa.trim() !== '') ? pemeriksaan.diagnosa : (pemeriksaan.diagnosa ? JSON.stringify(pemeriksaan.diagnosa) : '-'),
          });
        } else {
          console.error("[RangkumanPemeriksaan] API error:", response.data);
          throw new Error(response.data.message || "Data pemeriksaan tidak ditemukan");
        }
      } catch (err) {
        console.error("[RangkumanPemeriksaan] Exception:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Gagal mengambil data pemeriksaan"
        );
      } finally {
        setIsLoading(false);
      }
    };
    if (no_registrasi) {
      fetchPemeriksaanData();
    }
  }, [no_registrasi, API_URL]);

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
      <main className="flex-1 p-10 overflow-auto relative">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-lg font-bold">RANGKUMAN PEMERIKSAAN</h1>
            <p className="text-sm font-semibold text-gray-600">
              Data Pemeriksaan Pasien
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
        {/* Hasil Pemeriksaan */}
        <div className="bg-white rounded shadow px-8 py-6 border border-gray-200 w-[750px] mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Hasil Pemeriksaan</h2>
          <div className="text-sm text-gray-700 grid grid-cols-2 gap-x-8 gap-y-2">
            <div>
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
            <div>
              <div className="mb-2">
                <label>Tindakan</label>
                <input
                  type="text"
                  value={pemeriksaanData.tindakan}
                  disabled
                  className="w-full bg-transparent border-none p-0 m-0 text-sm text-gray-800"
                />
              </div>
              <div>
                <label>Diagnosa</label>
                <input
                  type="text"
                  value={pemeriksaanData.diagnosa}
                  disabled
                  className="w-full bg-transparent border-none p-0 m-0 text-sm text-gray-800"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            className="bg-[#0099a8] text-white px-5 py-2 rounded shadow text-sm hover:bg-[#007a85] transition-colors duration-200"
            onClick={() => {
              try {
                const user = localStorage.getItem("user");
                if (user) {
                  const parsed = JSON.parse(user);
                  // Cek role di root (untuk login manual) dan di user.role (untuk login API)
                  const role = parsed?.role || parsed?.user?.role;
                  if (role === "DOKTER") {
                    window.location.href = "/dokter/history";
                    return;
                  }
                  if (role === "PERAWAT") {
                    window.location.href = "/perawat/history";
                    return;
                  }
                }
              } catch (e) {
                console.error("KEMBALI error", e);
              }
              window.location.href = "/login";
            }}
          >
            KEMBALI
          </button>
        </div>
      </main>
    </div>
  );
};

export default RangkumanPemeriksaan;
