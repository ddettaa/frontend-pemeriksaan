import { Link, useNavigate } from "react-router-dom";
import { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [poliName, setPoliName] = useState("");
  const [doctorName, setDoctorName] = useState("");

  // State untuk data jadwal dokter
  const [jadwalDokter, setJadwalDokter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("user");
    if (storedData) {
      const userData = JSON.parse(storedData);
      if (userData.user && userData.user.nama_lengkap) {
        setDoctorName(userData.user.nama_lengkap);
      }
      if (userData.poli) {
        setPoliName(userData.poli.nama_poli.toUpperCase());
      }
    }
  }, []);

  // Fungsi logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Fetch data jadwal dokter dari backend API
  useEffect(() => {
    const fetchJadwalDokter = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token"); // jika pakai token
        const response = await fetch(
          "https://ti054a02.agussbn.my.id/api/jadwal-dokter",
          {
            headers: {
              Authorization: `Bearer ${token}`, // jika perlu otentikasi
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil data jadwal dokter");
        }

        const data = await response.json();
        setJadwalDokter(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJadwalDokter();
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex">
      <aside className="w-24 bg-[#dff4f4] flex flex-col items-center py-6">
        {/* Dashboard Link */}
        <div className="group mb-8">
          <Link to="/dokter/dashboard" className="flex flex-col items-center">
            <button className="p-3 rounded-xl mb-2 focus:outline-none bg-[#0099a8] shadow-md transform hover:scale-105 transition-all duration-200 hover:bg-[#007a85]">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-3m-8 0H5a2 2 0 0 1-2-2z" />
              </svg>
            </button>
            <span className="text-xs text-[#0099a8]">Dashboard</span>
          </Link>
        </div>

        {/* Data Pasien Link */}
        <div className="group mb-8">
          <Link to="/dokter/listPasien" className="flex flex-col items-center">
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

        {/* History Link */}
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

        {/* Menu Akun */}
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
              DASHBOARD <span className="font-normal">({poliName})</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">Halo, {doctorName}</p>
            <div className="mt-8 mb-6">
              <div className="bg-[#c9d6ec] text-white inline-block rounded-md px-4 py-2 font-semibold w-[150px]">
                ANTRIAN <br />
                <span className="text-xl font-bold text-white block">0001</span>
              </div>
            </div>
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

        <div className="mt-6">
          <h2 className="font-semibold text-base mb-2">JADWAL DOKTER</h2>

          {/* Loading */}
          {loading && <p>Loading jadwal...</p>}

          {/* Error */}
          {error && <p className="text-red-500">Error: {error}</p>}

          {/* Tabel Jadwal Dokter */}
          {!loading && !error && (
            <table className="min-w-full border border-gray-300 bg-white text-sm">
              <thead>
                <tr className="bg-[#c9d6ec] text-gray-700">
                  <th className="px-4 py-2 font-medium text-left">
                    Nama Dokter
                  </th>
                  <th className="px-4 py-2 font-medium text-left">Hari</th>
                  <th className="px-4 py-2 font-medium text-left">Jam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jadwalDokter.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-gray-500">
                      Data jadwal kosong
                    </td>
                  </tr>
                )}
                {jadwalDokter.map((jadwal) => (
                  <tr
                    key={jadwal.id}
                    className="hover:bg-gray-50 text-gray-700"
                  >
                    <td className="px-4 py-2">{jadwal.nama_dokter}</td>
                    <td className="px-4 py-2">{jadwal.hari}</td>
                    <td className="px-4 py-2">{`${jadwal.jam_mulai} - ${jadwal.jam_akhir}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
