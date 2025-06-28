import { Link, useNavigate } from "react-router-dom";
import { useState, Fragment, useEffect, useCallback } from "react";
import { Menu, Transition } from "@headlessui/react";

const HistoryPerawat = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [patients, setPatients] = useState([]);
  // Helper untuk badge status
  const getStatusColor = (status) => {
    if (status === null || status === undefined) return "bg-gray-100 text-gray-800";
    let statusRaw = status;
    if (typeof status === "string") statusRaw = status.toLowerCase();
    switch (statusRaw) {
      case 0:
      case "menunggu":
        return "bg-yellow-100 text-yellow-800";
      case 1:
      case "diperiksa":
        return "bg-blue-100 text-blue-800";
      case 2:
      case "selesai diperiksa":
        return "bg-purple-100 text-purple-800";
      case 3:
      case "selesai pembayaran":
        return "bg-pink-100 text-pink-800";
      case 4:
      case "selesai":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  });
  // Fetch pasien history (semua status selain hari ini, default: semua data poli user)
  const API_URL = "https://ti054a01.agussbn.my.id";
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/pendaftaran`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Gagal mengambil data pasien");
      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        let filteredPatients = data.data;
        // Filter by poli user
        const storedData = localStorage.getItem("user");
        let poliNama = "";
        if (storedData) {
          try {
            const userData = JSON.parse(storedData);
            if (userData.poli && userData.poli.nama_poli) {
              poliNama = userData.poli.nama_poli;
            } else if (userData.nama_poli) {
              poliNama = userData.nama_poli;
            }
          } catch (e) {
            // Optional: log or ignore
          }
        }
        if (poliNama) {
          filteredPatients = filteredPatients.filter(
            (patient) => (patient.nama_poli || "").trim().toLowerCase() === poliNama.trim().toLowerCase()
          );
        }
        // Filter by tanggal (bukan hari ini)
        // Filter hanya berdasarkan tgl_pendaftaran (bukan hari ini)
        // Filter hanya berdasarkan tgl_kunjungan (bukan hari ini)
        // Filter hanya pasien dengan tgl_kunjungan === selectedDate (sama seperti ListPasienPerawat)
        filteredPatients = filteredPatients.filter(
          (patient) => {
            const tgl = (patient.tgl_kunjungan || "").slice(0, 10);
            // Status bisa angka (2) atau string "selesai diperiksa"
            const status = patient.status;
            return (
              tgl === selectedDate &&
              (status === 2 || (typeof status === "string" && status.toLowerCase() === "selesai diperiksa"))
            );
          }
        );
        // Search
        if (searchQuery.trim()) {
          filteredPatients = filteredPatients.filter(
            (patient) =>
              patient.nama_pasien.toLowerCase().includes(searchQuery.toLowerCase()) ||
              patient.rm?.toString().includes(searchQuery)
          );
        }
        setPatients(filteredPatients);
      } else {
        setPatients([]);
        throw new Error("Format data tidak sesuai");
      }
    } catch (err) {
      setError(err.message);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, searchQuery, selectedDate]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  const navigate = useNavigate();
  const [poliName, setPoliName] = useState("");
  const [nurseName, setNurseName] = useState("");

  useEffect(() => {
    const storedData = localStorage.getItem("user");
    if (storedData) {
      const userData = JSON.parse(storedData);
      if (userData.user && userData.user.nama_lengkap) {
        setNurseName(userData.user.nama_lengkap);
      }
      if (userData.poli) {
        setPoliName(userData.poli.nama_poli.toUpperCase());
      }
    }
  }, []);

  const handleLogout = () => {
    // Hapus data login dari localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Arahkan ke halaman login
    navigate("/");
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 flex">
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
            to="/perawat/listPasien"
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
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11 a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159 c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
              </svg>
            </button>
            <span className="text-xs text-gray-500 group-hover:text-[#0099a8]">
              Data Pasien
            </span>
          </Link>
        </div>

        <div className="group mb-52">
          <Link to="/perawat/history" className="flex flex-col items-center">
            <button className="bg-[#0099a8] text-white p-3 rounded-xl shadow-md mb-2 focus:outline-none hover:bg-[#007a85] transform hover:scale-105 transition-all duration-200">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <span className="text-xs text-[#0099a8]">History</span>
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

      <main className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-lg font-bold text-black">
              PASIEN RAWAT JALAN{" "}
              <span className="font-normal">({poliName})</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Halo, nurse {nurseName}
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

        {/* Search & Date Filter */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 mt-4 mb-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Cari Pasien</label>
            <input
              id="search"
              type="text"
              placeholder="Cari berdasarkan nama pasien atau nomor RM..."
              className="block w-full px-4 py-3 text-sm text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0099a8]"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Kunjungan</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="block w-full px-4 py-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0099a8]"
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <h2 className="font-semibold mb-2 text-gray-800">Riwayat Pasien</h2>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0099a8] mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : (
            <div className="border border-gray-300 rounded-xl overflow-hidden shadow-sm">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-[#c9d6ec] text-gray-700 text-sm">
                    <th className="px-4 py-3 font-medium text-left">Antrian</th>
                    <th className="px-4 py-3 font-medium text-left">No Registrasi</th>
                    <th className="px-4 py-3 font-medium text-left">No RM</th>
                    <th className="px-4 py-3 font-medium text-left">Nama</th>
                    <th className="px-4 py-3 font-medium text-left">Poli</th>
                    <th className="px-4 py-3 font-medium text-left">Dokter</th>
                    <th className="px-4 py-3 font-medium text-left">Tgl Kunjungan</th>
                    <th className="px-4 py-3 font-medium text-left">Status</th>
                    <th className="px-4 py-3 font-medium text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-200">
                  {patients.length > 0 ? (
                    patients.map((patient) => (
                      <tr key={patient.no_registrasi} className="hover:bg-gray-50 text-gray-700 transition-colors duration-200">
                        <td className="px-4 py-3">{patient.no_antrian}</td>
                        <td className="px-4 py-3">{patient.no_registrasi}</td>
                        <td className="px-4 py-3">{patient.rm}</td>
                        <td className="px-4 py-3">{patient.nama_pasien}</td>
                        <td className="px-4 py-3">{patient.nama_poli}</td>
                        <td className="px-4 py-3">{patient.nama_dokter}</td>
                        <td className="px-4 py-3">{(patient.tgl_kunjungan || '').slice(0, 10)}</td>
                        <td className="px-2 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(patient.status)}`}>
                            {patient.status || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <Link to={`/perawat/rangkuman/${patient.no_registrasi}`} title="Lihat rangkuman pemeriksaan">
                            <button className="text-[#0099a8] hover:text-[#007a85] p-1.5 rounded-full transition-colors duration-200 bg-transparent border border-[#0099a8] hover:border-[#007a85]">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M9 17v-2a4 4 0 014-4h4M7 7h.01M7 11h.01M7 15h.01M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        Tidak ada riwayat pasien ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end items-center space-x-1 text-xs">
          <button className="border px-3 py-1.5 text-white bg-gray-300 rounded-l cursor-not-allowed opacity-50">
            Previous
          </button>
          <button className="border px-3 py-1.5 text-white bg-[#0099a8] hover:bg-[#007a85] transition-colors duration-200">
            1
          </button>
          <button className="border px-3 py-1.5 text-gray-500 hover:text-[#0099a8] hover:border-[#0099a8] hover:bg-[#e6f3f3] transition-colors duration-200 bg-white">
            2
          </button>
          <button className="border px-3 py-1.5 text-gray-500 hover:text-[#0099a8] hover:border-[#0099a8] hover:bg-[#e6f3f3] rounded-r transition-colors duration-200 bg-white">
            Next
          </button>
        </div>
      </main>
    </div>
  );
};

export default HistoryPerawat;
