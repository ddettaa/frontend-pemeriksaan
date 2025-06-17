import { Link, useNavigate } from "react-router-dom";
import { useState, Fragment, useEffect, useCallback } from "react";
import { Menu, Transition } from "@headlessui/react";
import axios from "axios";

const ListPasienPerawat = () => {
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const [nurseName, setNurseName] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Definisikan API URL di luar fungsi untuk memudahkan debugging
  const API_URL = "https://ti054a01.agussbn.my.id"; // Updated to match the API URL used in DashboardPerawat

  useEffect(() => {
    const storedData = localStorage.getItem("user");
    if (storedData) {
      const userData = JSON.parse(storedData);
      if (userData.user && userData.user.nama_lengkap) {
        setNurseName(userData.user.nama_lengkap);
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Use the specific token provided by the user
      const token = "5|cLspys0H4S5EKbC4b6xwxmUx7GsXpIMeBkXWZEfmee7f7e4f";
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchQuery,
      });

      const response = await fetch(`${API_URL}/api/pasiens?${params}`, {

        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
          throw new Error("Sesi anda telah berakhir, silahkan login kembali");
        }
        throw new Error("Gagal mengambil data pasien");
      }

      const data = await response.json();

      console.log(data); // opsional: bantu debug struktur JSON
      
      if (data && Array.isArray(data.data)) {
        setPatients(data.data);
        setTotalPages(Math.ceil(data.meta.total / data.meta.per_page));
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
  }, [API_URL, currentPage, navigate, searchQuery]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]); // <-- tambahkan fetchPatients ke dependency array

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status) => {
    // Return default style if status is null or undefined
    if (!status) return "bg-gray-100 text-gray-800";

    // Safely convert to lowercase, using empty string as fallback
    const normalizedStatus = (status || "").toLowerCase();

    switch (normalizedStatus) {
      case "menunggu":
        return "bg-yellow-100 text-yellow-800";
      case "diperiksa":
        return "bg-blue-100 text-blue-800";
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

      <main className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-lg font-bold text-black">
              PASIEN RAWAT JALAN
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

        <div className="mt-8 mb-6">
          <div className="max-w-3xl">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cari Pasien
            </label>
            <div
              className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                isFocused
                  ? "ring-2 ring-[#0099a8] shadow-lg"
                  : "border border-gray-200 shadow-sm"
              }`}
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isFocused ? "text-[#0099a8]" : "text-gray-400"
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
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch({ target: { value: "" } })}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center bg-transparent hover:bg-transparent focus:outline-none"
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
            {isFocused && (
              <div className="mt-2 text-xs text-gray-500">
                Tekan Enter untuk mencari
              </div>
            )}
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
                    <th className="px-4 py-3 font-medium text-left">No rm</th>
                    <th className="px-4 py-3 font-medium text-left">Antrian</th>
                    <th className="px-4 py-3 font-medium text-left">Nama</th>
                    <th className="px-4 py-3 font-medium text-left">Status</th>
                    <th className="px-4 py-3 font-medium text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr
                      key={patient.id_pasien}
                      className="hover:bg-gray-50 text-gray-700 transition-colors duration-200"
                    >
                      <td className="px-4 py-3">{patient.rm}</td>
                      <td className="px-4 py-3">{patient.no_antrian}</td>
                      <td className="px-4 py-3">{patient.nama_pasien}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                            patient.current_status
                          )}`}
                        >
                          {patient.current_status || "Menunggu"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/perawat/InputPemeriksaan/${patient.rm}`}
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
                  ))}
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
            onClick={() =>
              handlePageChange(Math.min(currentPage + 1, totalPages))
            }
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
