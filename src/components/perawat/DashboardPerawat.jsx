import { Link, useNavigate } from "react-router-dom";
import { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";

const DashboardPerawat = () => {
  const navigate = useNavigate();
  const [poliName, setPoliName] = useState("");
  const [nurseName, setNurseName] = useState("");

  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [antrianHariIni, setAntrianHariIni] = useState(0);
  // State untuk tanggal dan jam sekarang (WIB)
  const [nowWIB, setNowWIB] = useState("");
  // Update waktu sekarang (WIB) setiap detik
  useEffect(() => {
    const updateNow = () => {
      const now = new Date();
      // Format: Sabtu, 28 Juni 2025 14:05:01
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' };
      setNowWIB(new Intl.DateTimeFormat('id-ID', options).format(now));
    };
    updateNow();
    const interval = setInterval(updateNow, 1000);
    return () => clearInterval(interval);
  }, []);
  // Fetch jumlah antrian hari ini dari /pendaftaran, filter by id_poli dan tanggal hari ini (zona waktu Indonesia)
  const [idPoliUser, setIdPoliUser] = useState(null);
  useEffect(() => {
    // Ambil id_poli dari localStorage user
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const userData = JSON.parse(stored);
        let idPoli = null;
        if (userData.poli && userData.poli.id_poli) {
          idPoli = userData.poli.id_poli;
        } else if (userData.id_poli) {
          idPoli = userData.id_poli;
        } else if (userData.poli_id) {
          idPoli = userData.poli_id;
        }
        if (idPoli) setIdPoliUser(String(idPoli));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!idPoliUser) return;
    const fetchAntrian = async () => {
      try {
        const res = await fetch("https://ti054a01.agussbn.my.id/api/pendaftaran");
        if (!res.ok) throw new Error("Failed to fetch antrian");
        const data = await res.json();
        // Ambil tanggal hari ini di zona waktu Asia/Jakarta (WIB)
        const now = new Date();
        const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(now); // yyyy-mm-dd
        let filtered = Array.isArray(data.data) ? data.data : [];
        // Filter by id_poli
        filtered = filtered.filter((item) => String(item.id_poli) === String(idPoliUser));
        // Filter by tanggal (tgl_kunjungan atau created_at, fallback empty string)
        filtered = filtered.filter((item) => {
          let tglRaw = item.tgl_kunjungan || item.created_at || '';
          let tglStr = tglRaw.slice(0, 10);
          return tglStr === todayStr;
        });
        setAntrianHariIni(filtered.length);
      } catch {
        setAntrianHariIni(0);
      }
    };
    fetchAntrian();
  }, [idPoliUser]);

  // Fetch data jadwal dari API saat komponen mount
  useEffect(() => {
    fetch("https://ti054a02.agussbn.my.id/api/jadwal")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        setJadwal(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex">
      <aside className="w-24 bg-[#dff4f4] flex flex-col items-center py-6">
        {/* Sidebar navigation */}
        <div className="group mb-8">
          <Link
            to="/perawat/DashboardPerawat"
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
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-3m-8 0H5a2 2 0 0 1-2-2z" />
              </svg>
            </button>
            <span className="text-xs text-[#0099a8]">Dashboard</span>
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
              DASHBOARD <span className="font-normal">({poliName})</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Halo, nurse {nurseName}
            </p>
            <div className="mt-8 mb-6 flex gap-4">
              <div className="bg-[#4E71CC] opacity-80 text-white inline-block rounded-md px-4 py-2 font-semibold w-[150px]">
                ANTRIAN <br />
                <span className="text-xl font-bold text-white block">{antrianHariIni}</span>
              </div>
              <div className="bg-[#3A6065] text-white inline-block rounded-md px-4 py-2 font-semibold w-[260px]">
                TANGGAL & JAM <br />
                <span className="text-base font-bold text-white block" style={{wordBreak:'break-word'}}>{nowWIB}</span>
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
          <h2 className="font-semibold text-base mb-2">JADWAL PERAWAT</h2>

          {loading && <p>Loading jadwal...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {!loading && !error && (
            <table className="min-w-full border border-gray-300 bg-white text-sm rounded-xl overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-[#c9d6ec] text-gray-700">
                  <th className="px-4 py-2 font-medium text-left">
                    Nama Perawat
                  </th>
                  <th className="px-4 py-2 font-medium text-left">Hari</th>
                  <th className="px-4 py-2 font-medium text-left">Jam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jadwal.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-gray-500">
                      Data jadwal kosong
                    </td>
                  </tr>
                )}
                {jadwal.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 text-gray-700">
                    <td className="px-4 py-2">{item.nama_perawat}</td>
                    <td className="px-4 py-2">{item.hari}</td>
                    <td className="px-4 py-2">{item.jam}</td>
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

export default DashboardPerawat;
