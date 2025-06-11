import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Dialog } from "@headlessui/react";
import axios from "axios";

const InputPemeriksaan = () => {
  const { id_pasien: no_reg } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    suhu: "",
    tinggiBadan: "",
    tensi: "",
    beratBadan: "",
    keluhan: "",
  });

  const [patientData, setPatientData] = useState({
    noReg: "",
    nama: "",
  });

  const [errors, setErrors] = useState({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const userData = JSON.parse(localStorage.getItem("user"));

        if (!token || !userData?.poli?.id_poli) {
          navigate("/login");
          return;
        }

        // Menggunakan no_reg untuk mencari data pasien
        const params = new URLSearchParams({
          search: no_reg,
          id_poli: userData.poli.id_poli.toString(),
        });

        console.log("Fetching patient data with params:", params.toString());

        const response = await axios.get(`${API_URL}/api/pasien?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (
          response.data.status === "success" &&
          response.data.data.data.length > 0
        ) {
          const patient = response.data.data.data[0];
          // Pastikan no_reg yang diset sesuai dengan yang dari URL
          if (patient.no_reg.toString() === no_reg) {
            setPatientData({
              noReg: patient.no_reg,
              nama: patient.nama_pasien,
            });
            console.log("Patient data loaded:", patient);
          } else {
            throw new Error("Data pasien tidak sesuai");
          }
        } else {
          throw new Error("Data pasien tidak ditemukan");
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
        setError(err.message || "Gagal mengambil data pasien");
        console.error("Error fetching patient data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (no_reg) {
      fetchPatientData();
    }
  }, [no_reg, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "keluhan") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (name === "tensi") {
      // Izinkan angka dan slash untuk tensi
      if (/^[\d\/]*$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      // Hanya izinkan angka dan titik untuk field numerik lainnya
      if (/^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.suhu) newErrors.suhu = "Suhu wajib diisi";
    if (!formData.tinggiBadan)
      newErrors.tinggiBadan = "Tinggi badan wajib diisi";
    if (!formData.tensi) {
      newErrors.tensi = "Tensi wajib diisi";
    } else if (!/^\d+\/\d+$/.test(formData.tensi)) {
      newErrors.tensi = "Format tensi tidak valid (contoh: 120/80)";
    }
    if (!formData.beratBadan) newErrors.beratBadan = "Berat badan wajib diisi";
    if (!formData.keluhan) newErrors.keluhan = "Keluhan wajib diisi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user"));

      if (!token || !userData?.poli?.id_poli) {
        navigate("/login");
        return;
      }

      // Debug log untuk melihat struktur data user
      console.log("User Data Structure:", userData);

      // Ambil id_perawat dari additional_info
      const id_perawat = userData.additional_info?.id_perawat;

      if (!id_perawat) {
        throw new Error("ID Perawat tidak ditemukan dalam data user");
      }

      // Validasi no_reg
      if (!patientData.noReg) {
        throw new Error("No Registrasi tidak valid");
      }

      // Format data sesuai dengan struktur tabel pemeriksaan
      const pemeriksaanData = {
        no_registrasi: parseInt(patientData.noReg),
        id_dokter: userData.poli.id_dokter,
        id_perawat: parseInt(id_perawat),
        rm: null,
        suhu: Math.round(parseFloat(formData.suhu) * 10), // Konversi 36.5 -> 365
        tensi: formData.tensi.trim(),
        tinggi_badan: Math.round(parseFloat(formData.tinggiBadan)),
        berat_badan: Math.round(parseFloat(formData.beratBadan)),
        keluhan: formData.keluhan,
        diagnosa: null,
        tindakan: null,
      };

      // Validate no_registrasi
      if (
        !pemeriksaanData.no_registrasi ||
        isNaN(pemeriksaanData.no_registrasi)
      ) {
        throw new Error("Nomor registrasi tidak valid atau bukan angka");
      }

      // Validate id_dokter
      if (!pemeriksaanData.id_dokter) {
        throw new Error("ID Dokter tidak ditemukan dalam data poli");
      }

      // Debug log
      console.log("Data yang akan dikirim:", {
        pemeriksaanData,
        patientData,
        noReg: patientData.noReg,
        parsedNoReg: parseInt(patientData.noReg),
        userData,
      });

      // Validasi data sebelum dikirim
      if (
        isNaN(pemeriksaanData.suhu) ||
        pemeriksaanData.suhu < 350 ||
        pemeriksaanData.suhu > 450
      ) {
        throw new Error("Suhu harus antara 35-45°C");
      }
      if (
        isNaN(pemeriksaanData.tinggi_badan) ||
        pemeriksaanData.tinggi_badan < 30 ||
        pemeriksaanData.tinggi_badan > 300
      ) {
        throw new Error("Tinggi badan harus antara 30-300 cm");
      }
      if (
        isNaN(pemeriksaanData.berat_badan) ||
        pemeriksaanData.berat_badan < 1 ||
        pemeriksaanData.berat_badan > 500
      ) {
        throw new Error("Berat badan harus antara 1-500 kg");
      }
      if (!pemeriksaanData.tensi || !/^\d+\/\d+$/.test(pemeriksaanData.tensi)) {
        throw new Error("Format tensi tidak valid (contoh: 120/80)");
      }
      if (!pemeriksaanData.keluhan) {
        throw new Error("Keluhan wajib diisi");
      }

      // Simpan data pemeriksaan
      const response = await axios.post(
        `${API_URL}/api/pemeriksaan`,
        pemeriksaanData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      // Jika pemeriksaan berhasil disimpan, update status pasien
      if (response.data.status === "success") {
        // Update status pasien menjadi "Diperiksa"
        await axios.post(
          `${API_URL}/api/status`,
          {
            no_registrasi: patientData.noReg,
            status: "Diperiksa",
            role: "perawat",
            id_petugas: id_perawat,
            keterangan: "Status diubah melalui pemeriksaan",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        navigate("/perawat/list-pasien");
      } else {
        throw new Error(
          response.data.message || "Gagal menyimpan data pemeriksaan"
        );
      }
    } catch (err) {
      console.error("Error saving examination data:", err);
      console.log("Error response data:", err.response?.data);

      // Tampilkan pesan error yang lebih detail
      let errorMessage = err.message || "Gagal menyimpan data pemeriksaan";
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        errorMessage = Object.keys(errors)
          .map((key) => `${key}: ${errors[key].join(", ")}`)
          .join("\n");
      }

      setError(errorMessage);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setIsSaving(false);
      setIsConfirmOpen(false);
    }
  };

  const handleCancel = () => {
    // Show confirmation if form has been modified
    if (Object.values(formData).some((value) => value !== "")) {
      if (
        window.confirm(
          "Apakah Anda yakin ingin membatalkan? Data yang telah diisi akan hilang."
        )
      ) {
        navigate("/perawat/list-pasien");
      }
    } else {
      navigate("/perawat/list-pasien");
    }
  };

  const handleLogout = () => {
    // Hapus data login dari localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Arahkan ke halaman login
    navigate("/login");
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex">
      <aside className="w-24 bg-[#dff4f4] flex flex-col items-center py-6">
        <div className="group mb-8">
          <Link
            to="/perawat/DashboardPerawat"
            className="flex flex-col items-center"
          >
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
          <Link
            to="/perawat/list-pasien"
            className="flex flex-col items-center"
          >
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
          <Link to="/perawat/history" className="flex flex-col items-center">
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

        <Menu as="div" className="relative group mb-8">
          {({ open }) => (
            <>
              <div className="flex flex-col items-center">
                <Menu.Button
                  className={`p-3 rounded-xl focus:outline-none transform hover:scale-105 transition-all duration-200 ${
                    open ? "bg-white shadow-md" : "bg-transparent"
                  } hover:bg-white hover:shadow-md`}
                >
                  <svg
                    className={`w-5 h-5 ${
                      open ? "text-[#0099a8]" : "text-gray-500"
                    } group-hover:text-[#0099a8] transition-colors duration-200`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4s-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </Menu.Button>
                <span
                  className={`text-xs ${
                    open ? "text-[#0099a8]" : "text-gray-500"
                  } group-hover:text-[#0099a8] transition-colors duration-200`}
                >
                  Akun
                </span>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute left-full top-0 ml-2 w-40 origin-top-left rounded-lg bg-white shadow-md border border-gray-100 focus:outline-none py-1 z-50">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active
                            ? "bg-[#f0f9fa] text-[#0099a8]"
                            : "text-gray-500 bg-white"
                        } flex items-center w-full px-4 py-2 text-sm transition-colors duration-150 hover:text-[#0099a8]`}
                      >
                        <svg
                          className={`mr-3 h-5 w-5 ${
                            active ? "text-[#0099a8]" : "text-gray-500"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </>
          )}
        </Menu>
      </aside>

      <main className="flex-1 p-10 overflow-auto relative">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-lg font-bold">DATA PASIEN</h1>
            <p className="text-sm font-semibold text-gray-600">
              Pemeriksaan Awal
            </p>
          </div>
          <img
            src="/simrs.png"
            alt="simrs"
            className="w-14 h-14"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(41%) sepia(85%) saturate(2044%) hue-rotate(165deg) brightness(93%) contrast(101%)",
            }}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0099a8]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-2 gap-6 max-w-4xl text-sm"
          >
            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                No Reg
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={patientData.noReg}
                  disabled
                  readOnly
                  className="w-full border border-gray-300 px-4 py-4 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed shadow-sm"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v.01M12 12v.01M12 9v.01M12 6v.01"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Nama
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={patientData.nama}
                  disabled
                  readOnly
                  className="w-full border border-gray-300 px-4 py-4 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed shadow-sm"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v.01M12 12v.01M12 9v.01M12 6v.01"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Suhu
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="suhu"
                  value={formData.suhu}
                  onChange={handleChange}
                  placeholder="36.5"
                  className={`w-full border ${
                    errors.suhu ? "border-red-500" : "border-gray-300"
                  } px-4 py-4 rounded-xl pr-10 bg-white text-[#0099a8] focus:outline-none focus:ring-2 focus:ring-[#0099a8] focus:border-transparent shadow-md hover:shadow-lg transition-shadow duration-200`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                  °C
                </span>
              </div>
              {errors.suhu && (
                <p className="mt-1 text-red-500 text-xs">{errors.suhu}</p>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Tinggi Badan
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="tinggiBadan"
                  value={formData.tinggiBadan}
                  onChange={handleChange}
                  placeholder="170"
                  className={`w-full border ${
                    errors.tinggiBadan ? "border-red-500" : "border-gray-300"
                  } px-4 py-4 rounded-xl pr-10 bg-white text-[#0099a8] focus:outline-none focus:ring-2 focus:ring-[#0099a8] focus:border-transparent shadow-md hover:shadow-lg transition-shadow duration-200`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                  cm
                </span>
              </div>
              {errors.tinggiBadan && (
                <p className="mt-1 text-red-500 text-xs">
                  {errors.tinggiBadan}
                </p>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Tensi
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="tensi"
                  value={formData.tensi}
                  onChange={handleChange}
                  placeholder="120/80"
                  className={`w-full border ${
                    errors.tensi ? "border-red-500" : "border-gray-300"
                  } px-4 py-4 rounded-xl pr-14 bg-white text-[#0099a8] focus:outline-none focus:ring-2 focus:ring-[#0099a8] focus:border-transparent shadow-md hover:shadow-lg transition-shadow duration-200`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                  mmHg
                </span>
              </div>
              {errors.tensi && (
                <p className="mt-1 text-red-500 text-xs">{errors.tensi}</p>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Berat Badan
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="beratBadan"
                  value={formData.beratBadan}
                  onChange={handleChange}
                  placeholder="65"
                  className={`w-full border ${
                    errors.beratBadan ? "border-red-500" : "border-gray-300"
                  } px-4 py-4 rounded-xl pr-10 bg-white text-[#0099a8] focus:outline-none focus:ring-2 focus:ring-[#0099a8] focus:border-transparent shadow-md hover:shadow-lg transition-shadow duration-200`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                  kg
                </span>
              </div>
              {errors.beratBadan && (
                <p className="mt-1 text-red-500 text-xs">{errors.beratBadan}</p>
              )}
            </div>
            <div className="col-span-2">
              <label className="block font-semibold mb-2 text-gray-700">
                Keluhan
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                name="keluhan"
                value={formData.keluhan}
                onChange={handleChange}
                placeholder="Masukkan keluhan pasien"
                rows="4"
                className={`w-full border ${
                  errors.keluhan ? "border-red-500" : "border-gray-300"
                } px-4 py-4 rounded-xl bg-white text-[#0099a8] focus:outline-none focus:ring-2 focus:ring-[#0099a8] focus:border-transparent shadow-md hover:shadow-lg transition-shadow duration-200`}
              />
              {errors.keluhan && (
                <p className="mt-1 text-red-500 text-xs">{errors.keluhan}</p>
              )}
            </div>
          </form>
        )}

        <div className="fixed bottom-8 right-8 space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-red-500 text-white px-6 py-2 rounded-xl shadow text-sm hover:bg-red-600 transition-colors duration-200"
          >
            BATAL
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-6 py-2 rounded-xl shadow text-sm hover:bg-green-600 transition-colors duration-200"
          >
            SIMPAN
          </button>
        </div>

        {/* Confirmation Dialog */}
        <Dialog
          open={isConfirmOpen}
          onClose={() => !isSaving && setIsConfirmOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-sm rounded-xl bg-white p-6 shadow-xl">
              <Dialog.Title className="text-lg font-medium text-gray-900">
                Konfirmasi Penyimpanan
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-gray-500">
                Apakah Anda yakin ingin menyimpan data pemeriksaan ini? Status
                pasien akan berubah menjadi "Diperiksa".
              </Dialog.Description>

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={isSaving}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className={`inline-flex justify-center rounded-md border border-transparent bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 ${
                    isSaving ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                  onClick={handleConfirmSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Menyimpan..." : "Ya, Simpan"}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </main>
    </div>
  );
};

export default InputPemeriksaan;
