import { Link, useNavigate } from "react-router-dom";
import { useState, Fragment, useEffect, useCallback } from "react";
import { Menu, Transition } from "@headlessui/react";

const ListPasienPerawat = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDateFocused, setIsDateFocused] = useState(false);
  const navigate = useNavigate();
  const [nurseName, setNurseName] = useState("");
  const [poliName, setPoliName] = useState("");

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedDate, setSelectedDate] = useState(() => {
  const today = new Date();
  // Adjust for timezone offset to get local date
  return new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
});


// Force set selectedDate to today on mount and when day changes
useEffect(() => {
  const setToday = () => {
    const todayStr = new Date();
    // Adjust for timezone offset to get local date
    const local = new Date(todayStr.getTime() - todayStr.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    setSelectedDate(local);
  };
  setToday();
  const interval = setInterval(() => {
    setToday();
  }, 60 * 1000);
  return () => clearInterval(interval);
}, []);

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

  // Updated API URL
  const API_URL = "https://ti054a01.agussbn.my.id";

  useEffect(() => {
    const storedData = localStorage.getItem("user");
    console.log("Stored user data:", storedData); // Debug log

    if (storedData) {
      try {
        const userData = JSON.parse(storedData);
        console.log("Parsed user data:", userData); // Debug log

        // Check different possible structures for user data
        let userName = "";

        // Try different possible paths for user name
        if (userData.user && userData.user.nama_lengkap) {
          userName = userData.user.nama_lengkap;
        } else if (userData.nama_lengkap) {
          userName = userData.nama_lengkap;
        } else if (userData.user && userData.user.name) {
          userName = userData.user.name;
        } else if (userData.name) {
          userName = userData.name;
        }

        console.log("Extracted userName:", userName); // Debug log

        setNurseName(userName || "Perawat");
      } catch (error) {
        console.error("Error parsing user data:", error);
        setNurseName("Perawat");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the correct API endpoint without token
      const response = await fetch(`${API_URL}/api/pendaftaran`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data pasien");
      }

      const data = await response.json();
      console.log("API Response:", data); // Debug log

      if (data && Array.isArray(data.data)) {
        let filteredPatients = data.data;

// Filter by nurse's poli if available
const storedData = localStorage.getItem("user");
if (storedData) {
  try {
    const userData = JSON.parse(storedData);
    let userPoliName = "";
    if (userData.user && userData.user.poli_name) {
      userPoliName = userData.user.poli_name;
    } else if (userData.poli_name) {
      userPoliName = userData.poli_name;
    } else if (userData.user && userData.user.nama_poli) {
      userPoliName = userData.user.nama_poli;
    } else if (userData.nama_poli) {
      userPoliName = userData.nama_poli;
    } else if (userData.user && userData.user.poli) {
      userPoliName = userData.user.poli;
    } else if (userData.poli) {
      userPoliName = userData.poli;
    }

    // Jika userPoliName adalah objek, ambil nama_poli-nya
    let poliNama = userPoliName;
    if (typeof userPoliName === "object" && userPoliName !== null) {
      poliNama = userPoliName.nama_poli;
    }

    if (poliNama) {
      filteredPatients = filteredPatients.filter(
        (patient) =>
          (patient.nama_poli || "").trim().toLowerCase() ===
          (poliNama || "").trim().toLowerCase()
      );
    }
  } catch (error) {
    console.error("Error parsing user data for filtering:", error);
  }
}

filteredPatients = filteredPatients.filter(
    (patient) =>
      (patient.tgl_kunjungan || patient.created_at || "").slice(0, 10) === selectedDate
  );

// Apply search filter if searchQuery exists
if (searchQuery.trim()) {
  filteredPatients = filteredPatients.filter(
    (patient) =>
      patient.nama_pasien.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.rm.toString().includes(searchQuery)
  );
}

// Pagination
const itemsPerPage = 10;
const totalItems = filteredPatients.length;
const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
setTotalPages(calculatedTotalPages);


const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

setPatients(paginatedPatients);

        console.log("Total patients:", totalItems); // Debug log
        console.log("Current page patients:", paginatedPatients.length); // Debug log
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
  }, [API_URL, currentPage, searchQuery, selectedDate]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleLogout = async () => {
    try {
      // Remove token-based logout since we're not using tokens anymore
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // ...existing code...
const getStatusColor = (status) => {
  // Bisa menerima status string atau angka
  if (status === null || status === undefined) return "bg-gray-100 text-gray-800";
  let statusRaw = status;
  if (typeof status === "string") {
    statusRaw = status.toLowerCase();
  }
  // Mapping status_raw atau status string
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
            to="/perawat/listPasien"
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

      <main className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-start mb-8">
  <div>
    <h1 className="text-lg font-bold text-black">
      PASIEN RAWAT JALAN <span className="font-normal">({poliName})</span>
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

        <div className="max-w-3xl">
      <label
        htmlFor="search"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Cari Pasien
      </label>
      <div
        className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
          isSearchFocused
            ? "ring-2 ring-[#0099a8] shadow-lg"
            : "border border-gray-200 shadow-sm"
        }`}
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className={`w-5 h-5 transition-colors duration-200 ${
              isSearchFocused ? "text-[#0099a8]" : "text-gray-400"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          id="search"
          type="text"
          placeholder="Cari berdasarkan nama pasien atau nomor Rekam Medis..."
          className="block w-full pl-12 pr-4 py-3.5 text-sm text-gray-700 placeholder-gray-400 bg-white focus:outline-none"
          value={searchQuery}
          onChange={handleSearch}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => handleSearch({ target: { value: "" } })}
            className="absolute inset-y-0 right-0 pr-4 flex items-center bg-transparent hover:bg-transparent focus:outline-none"
            tabIndex={-1}
          >
            <svg
              className="w-5 h-5 text-[#0099a8] hover:text-[#007a85] transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      {isSearchFocused && (
        <div className="mt-2 text-xs text-gray-500">
          Tekan Enter untuk mencari
        </div>
      )}
    </div>
  );


        <div className="mb-8 max-w-xs">
  <label
    className="block text-[13px] font-semibold text-gray-700 mb-2 tracking-widest"
    style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      letterSpacing: "0.09em",
    }}
  >
    Tanggal Kunjungan
  </label>
  <div
    className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
      isDateFocused
        ? "ring-2 ring-[#0099a8] shadow-lg"
        : "border border-gray-200 shadow-sm"
    }`}
  >
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      {/* Icon kalender SVG */}
      <svg
        className={`w-5 h-5 transition-colors duration-200 ${
          isDateFocused ? "text-[#0099a8]" : "text-gray-400"
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
    <input
  type="date"
  value={selectedDate}
  onChange={e => {
    setSelectedDate(e.target.value);
    setCurrentPage(1);
  }}
  onFocus={() => setIsDateFocused(true)}
  onBlur={() => setIsDateFocused(false)}
  className="block w-full pl-12 pr-4 py-3.5 text-sm text-gray-700 bg-white focus:outline-none rounded-xl"
  style={{
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    boxShadow: "none",
    cursor: "pointer",
    height: "48px",
    // JANGAN tambahkan appearance: "none"
  }}
/>
  </div>
</div>
        <div className="mt-6 overflow-x-auto">
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
                    <th className="px-4 py-3 font-medium text-left">
                      No Registrasi
                    </th>
                    <th className="px-4 py-3 font-medium text-left">No RM</th>
                    <th className="px-4 py-3 font-medium text-left">Nama</th>
                    <th className="px-4 py-3 font-medium text-left">Poli</th>
                    <th className="px-4 py-3 font-medium text-left">Dokter</th>
                    <th className="px-4 py-3 font-medium text-left">Status</th>
                    <th className="px-4 py-3 font-medium text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-200">
                  {patients.length > 0 ? (
                    patients.map((patient) => (
                      <tr
                        key={patient.no_registrasi}
                        className="hover:bg-gray-50 text-gray-700 transition-colors duration-200"
                      >
                        <td className="px-4 py-3">{patient.no_antrian}</td>
                        <td className="px-4 py-3">{patient.no_registrasi}</td>
                        <td className="px-4 py-3">{patient.rm}</td>
                        <td className="px-4 py-3">{patient.nama_pasien}</td>
                        <td className="px-4 py-3">{patient.nama_poli}</td>
                        <td className="px-4 py-3">{patient.nama_dokter}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(patient.status)}`}>
                          {patient.status || "Menunggu"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/perawat/InputPemeriksaan/${patient.no_registrasi}`}
                          >
                            <button className="text-[#558c89] hover:text-[#0099a8] p-1.5 rounded-full transition-colors duration-200 bg-transparent">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3zM19 19H5V5h7" />
                              </svg>
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Tidak ada pasien ditemukan untuk poli Anda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end items-center space-x-1 text-xs">
  <button
    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
    disabled={currentPage === 1}
    className={`border px-3 py-1.5 text-white rounded-l-lg ${
      currentPage === 1
        ? "bg-gray-300 cursor-not-allowed opacity-50"
        : "bg-[#0099a8] hover:bg-[#007a85]"
    } transition-colors duration-200`}
  >
    Previous
  </button>
  {[...Array(totalPages)].map((_, index) => (
    <button
      key={index + 1}
      onClick={() => handlePageChange(index + 1)}
      className={`border px-3 py-1.5 ${
        currentPage === index + 1
          ? "text-white bg-[#0099a8] hover:bg-[#007a85]"
          : "text-gray-500 hover:text-[#0099a8] hover:border-[#0099a8] hover:bg-[#e6f3f3] bg-white"
      } transition-colors duration-200`}
    >
      {index + 1}
    </button>
  ))}
  <button
    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
    disabled={currentPage === totalPages}
    className={`border px-3 py-1.5 text-white rounded-r-lg ${
      currentPage === totalPages
        ? "bg-gray-300 cursor-not-allowed opacity-50"
        : "bg-[#0099a8] hover:bg-[#007a85]"
    } transition-colors duration-200`}
  >
    Next
  </button>
</div>
      </main>
    </div>
  );
};

export default ListPasienPerawat;
