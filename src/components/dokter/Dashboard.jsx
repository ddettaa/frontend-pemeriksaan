import { Link, useNavigate } from "react-router-dom";
import { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";

const Dashboard = () => {
  // ===== HOOKS UNTUK NAVIGASI =====
  const navigate = useNavigate(); // Hook untuk berpindah halaman

  // ===== STATE VARIABLES (Data yang bisa berubah) =====
  const [poliName, setPoliName] = useState(""); // Nama poli/spesialis dokter
  const [doctorName, setDoctorName] = useState(""); // Nama dokter yang sedang login
  const [jadwalDokter, setJadwalDokter] = useState([]); // Daftar jadwal dokter
  const [loading, setLoading] = useState(true); // Status loading saat mengambil data
  const [error, setError] = useState(null); // Pesan error jika ada masalah
  const [antrianHariIni, setAntrianHariIni] = useState(0); // Jumlah antrian hari ini
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
        // Debug: tampilkan semua data poli dan tanggal
        console.log('[ANTRIAN] idPoliUser:', idPoliUser, 'todayStr:', todayStr);
        filtered.forEach(item => {
          console.log('[ANTRIAN] item.id_poli:', item.id_poli, 'tgl_kunjungan:', item.tgl_kunjungan, 'created_at:', item.created_at);
        });
        // Filter by id_poli
        filtered = filtered.filter((item) => String(item.id_poli) === String(idPoliUser));
        // Filter by tanggal (tgl_kunjungan atau created_at, fallback empty string)
        filtered = filtered.filter((item) => {
          // Prefer tgl_kunjungan jika ada, jika tidak created_at
          let tglRaw = item.tgl_kunjungan || item.created_at || '';
          let tglStr = tglRaw.slice(0, 10);
          if (String(item.id_poli) === String(idPoliUser)) {
            console.log('[ANTRIAN] After poli filter, tglRaw:', tglRaw, 'tglStr:', tglStr, 'todayStr:', todayStr, 'isSameDay:', tglStr === todayStr);
          }
          return tglStr === todayStr;
        });
        console.log('[ANTRIAN] Final filtered:', filtered);
        setAntrianHariIni(filtered.length);
      } catch (e) {
        console.error('[ANTRIAN] Error:', e);
        setAntrianHariIni(0);
      }
    };
    fetchAntrian();
  }, [idPoliUser]);

  // ===== FUNGSI HELPER =====
  /**
   * Fungsi untuk mengambil nilai dari objek yang kompleks/nested
   * Berguna karena data dari API bisa punya struktur yang berbeda-beda
   * @param {Object} obj - Objek yang akan dicari nilainya
   * @param {Array} paths - Array berisi kemungkinan path/lokasi data
   * @returns {any} - Nilai yang ditemukan atau null
   */
  const getValueFromNestedObject = (obj, paths) => {
    // Loop setiap kemungkinan path
    for (const path of paths) {
      const keys = path.split('.'); // Pisahkan path berdasarkan titik (contoh: 'user.nama' jadi ['user', 'nama'])
      let value = obj; // Mulai dari objek utama
      
      // Cek setiap level dalam path
      for (const key of keys) {
        value = value?.[key]; // Ambil nilai, jika tidak ada akan jadi undefined
        if (!value) break; // Jika tidak ada nilai, berhenti cek
      }
      
      // Jika menemukan nilai, return nilai tersebut
      if (value) return value;
    }
    return null; // Jika tidak menemukan apa-apa, return null
  };

  /**
   * Fungsi untuk mengambil data dokter dari API eksternal
   * Digunakan sebagai fallback jika data tidak lengkap di localStorage
   */
  const fetchDoctorDataFromAPI = async (userData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return; // Jika tidak ada token, keluar dari fungsi

      // Panggil API untuk mendapatkan data dokter
      const response = await fetch("https://ti054a01.agussbn.my.id/api/dokter", {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) return; // Jika response tidak ok, keluar

      const data = await response.json();
      if (!data.data || !Array.isArray(data.data)) return; // Validasi data

      // Cari dokter yang sesuai dengan user yang login
      const doctorId = getValueFromNestedObject(userData, ['id_dokter', 'id', 'user_id', 'id_user']);
      let currentDoctor = null;

      // Cari berdasarkan ID
      if (doctorId) {
        currentDoctor = data.data.find(doctor => 
          [doctor.id_dokter, doctor.id, doctor.id_user].includes(doctorId)
        );
      }

      // Jika tidak ketemu berdasarkan ID, cari berdasarkan nama atau ambil yang pertama
      if (!currentDoctor) {
        currentDoctor = doctorName 
          ? data.data.find(doctor => doctor.nama_dokter === doctorName)
          : data.data[0];
      }

      // Update state jika menemukan data dokter
      if (currentDoctor) {
        if (!doctorName && currentDoctor.nama_dokter) {
          setDoctorName(currentDoctor.nama_dokter);
        }
        if (currentDoctor.spesialis) {
          setPoliName(currentDoctor.spesialis.toUpperCase());
        }
      }
    } catch (error) {
      console.error("Error saat mengambil data dokter dari API:", error);
    }
  };

  // ===== EFFECT HOOKS (Jalankan kode saat komponen dimuat) =====
  
  /**
   * Effect untuk inisialisasi data user saat komponen pertama kali dimuat
   */
  useEffect(() => {
    const initializeUserData = async () => {
      // Ambil data user dari localStorage
      const storedData = localStorage.getItem("user");
      
      // Jika tidak ada data user, redirect ke halaman login
      if (!storedData) {
        navigate("/");
        return;
      }

      try {
        const userData = JSON.parse(storedData); // Parse JSON string jadi objek
        
        // === AMBIL NAMA DOKTER ===
        // Daftar kemungkinan field yang berisi nama dokter
        const doctorNamePossibleFields = [
          'nama_dokter', 'nama_lengkap', 'name', 'full_name', 
          'user.nama_lengkap', 'user.nama_dokter'
        ];
        const foundDoctorName = getValueFromNestedObject(userData, doctorNamePossibleFields);
        if (foundDoctorName) setDoctorName(foundDoctorName);

        // === AMBIL NAMA POLI/SPESIALIS ===
        // Daftar kemungkinan field yang berisi nama poli
        const poliNamePossibleFields = [
          'spesialis', 'nama_poli', 'poli_name', 'department',
          'poli.nama_poli', 'user.spesialis', 'user.poli.nama_poli'
        ];
        const foundPoliName = getValueFromNestedObject(userData, poliNamePossibleFields);
        
        if (foundPoliName) {
          setPoliName(foundPoliName.toUpperCase()); // Ubah ke huruf besar
        } else {
          // Jika tidak ada di localStorage, coba ambil dari API
          await fetchDoctorDataFromAPI(userData);
        }

      } catch (error) {
        console.error("Error saat parsing data user:", error);
        navigate("/"); // Jika error, redirect ke login
      }
    };

    initializeUserData(); // Jalankan fungsi inisialisasi
  }, [navigate]); // Dependency: navigate (jalankan ulang jika navigate berubah)

  /**
   * Effect untuk mengambil jadwal dokter dari API
   */
  useEffect(() => {
    const fetchJadwalDokter = async () => {
      try {
        setLoading(true); // Set loading jadi true
        setError(null); // Reset error

        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token tidak ditemukan");

        // Panggil API jadwal dokter
        const response = await fetch("https://ti054a02.agussbn.my.id/api/jadwal-dokter", {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        // Pastikan data adalah array, jika tidak ambil dari property 'data'
        const jadwalData = Array.isArray(data) ? data : data.data || [];
        setJadwalDokter(jadwalData);

      } catch (err) {
        console.error("Error saat mengambil jadwal:", err);
        setError(err.message); // Set pesan error
      } finally {
        setLoading(false); // Set loading jadi false (baik berhasil atau error)
      }
    };

    fetchJadwalDokter(); // Jalankan fungsi fetch
  }, []); // Dependency kosong: hanya jalankan sekali saat komponen dimuat

  // ===== EVENT HANDLERS =====
  /**
   * Fungsi untuk handle logout
   * Menghapus data dari localStorage dan redirect ke login
   */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // ===== KONFIGURASI NAVIGASI =====
  /**
   * Daftar menu navigasi untuk sidebar
   */
  const navigationItems = [
    {
      to: "/dokter/Dashboard",
      icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-3m-8 0H5a2 2 0 0 1-2-2z", // SVG path untuk icon rumah
      label: "Dashboard",
      active: true // Menu yang sedang aktif
    },
    {
      to: "/dokter/listPasien",
      icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11 a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159 c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9", // SVG path untuk icon orang
      label: "Data Pasien"
    },
    {
      to: "/dokter/history",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", // SVG path untuk icon jam
      label: "History"
    }
  ];

  // ===== RENDER COMPONENT =====
  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex">
      
      {/* ===== SIDEBAR ===== */}
      <aside className="w-24 bg-[#dff4f4] flex flex-col items-center py-6">
        
        {/* Menu Navigasi */}
        {navigationItems.map((item, index) => (
          <div key={item.to} className={`group ${index === navigationItems.length - 1 ? 'mb-52' : 'mb-8'}`}>
            <Link to={item.to} className="flex flex-col items-center">
              <button className={`p-3 rounded-xl mb-2 focus:outline-none transform hover:scale-105 transition-all duration-200 ${
                item.active 
                  ? 'bg-[#0099a8] shadow-md hover:bg-[#007a85]' // Style untuk menu aktif
                  : 'bg-transparent hover:bg-white hover:shadow-md' // Style untuk menu tidak aktif
              }`}>
                <svg
                  className={`w-5 h-5 ${
                    item.active ? 'text-white' : 'text-gray-500 group-hover:text-[#0099a8]'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d={item.icon} />
                </svg>
              </button>
              <span className={`text-xs ${
                item.active ? 'text-[#0099a8]' : 'text-gray-500 group-hover:text-[#0099a8]'
              }`}>
                {item.label}
              </span>
            </Link>
          </div>
        ))}

        {/* Menu Akun dengan Dropdown */}
        <Menu as="div" className="relative group mb-8">
          {({ open }) => (
            <>
              {/* Button untuk membuka dropdown */}
              <div className="flex flex-col items-center">
                <Menu.Button className={`p-3 rounded-xl focus:outline-none transform hover:scale-105 transition-all duration-200 ${
                  open ? "bg-white shadow-md" : "bg-transparent hover:bg-white hover:shadow-md"
                }`}>
                  <svg
                    className={`w-5 h-5 ${
                      open ? "text-[#0099a8]" : "text-gray-500 group-hover:text-[#0099a8]"
                    } transition-colors duration-200`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4s-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </Menu.Button>
                <span className={`text-xs ${
                  open ? "text-[#0099a8]" : "text-gray-500 group-hover:text-[#0099a8]"
                } transition-colors duration-200`}>
                  Akun
                </span>
              </div>

              {/* Dropdown Menu dengan Animasi */}
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
                          active ? "bg-[#f0f9fa] text-[#0099a8]" : "text-gray-500 bg-white"
                        } flex items-center w-full px-4 py-2 text-sm transition-colors duration-150 hover:text-[#0099a8]`}
                      >
                        <svg
                          className={`mr-3 h-5 w-5 ${active ? "text-[#0099a8]" : "text-gray-500"}`}
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

      {/* ===== KONTEN UTAMA ===== */}
      <main className="flex-1 p-8 overflow-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div>
            {/* Judul Dashboard */}
            <h1 className="text-lg font-bold text-black">
              DASHBOARD <span className="font-normal">({poliName || "Loading..."})</span>
            </h1>
            {/* Sapaan kepada dokter */}
            <p className="text-sm text-gray-600 mt-1">Halo, {doctorName || "Loading..."}</p>
            
            {/* Box Antrian */}
            <div className="mt-8 mb-6">
              <div className="bg-[#c9d6ec] text-white inline-block rounded-md px-4 py-2 font-semibold w-[150px]">
                ANTRIAN <br />
                <span className="text-xl font-bold text-white block">{antrianHariIni}</span>
              </div>
            </div>
          </div>
          
          {/* Logo SIMRS */}
          <img
            src="/simrs.png"
            alt="simrs"
            className="w-14 h-14"
            style={{
              filter: "brightness(0) saturate(100%) invert(41%) sepia(85%) saturate(2044%) hue-rotate(165deg) brightness(93%) contrast(101%)",
            }}
          />
        </div>

        {/* ===== TABEL JADWAL DOKTER ===== */}
        <div className="mt-6">
          <h2 className="font-semibold text-base mb-2">JADWAL DOKTER</h2>

          {/* Tampilkan loading */}
          {loading && <p>Loading jadwal...</p>}
          
          {/* Tampilkan error jika ada */}
          {error && <p className="text-red-500">Error: {error}</p>}

          {/* Tampilkan tabel jika tidak loading dan tidak error */}
          {!loading && !error && (
            <table className="min-w-full border border-gray-300 bg-white text-sm rounded-xl overflow-hidden shadow-sm">
              {/* Header Tabel */}
              <thead>
                <tr className="bg-[#c9d6ec] text-gray-700">
                  <th className="px-4 py-2 font-medium text-left">Nama Dokter</th>
                  <th className="px-4 py-2 font-medium text-left">Hari</th>
                  <th className="px-4 py-2 font-medium text-left">Jam</th>
                </tr>
              </thead>
              
              {/* Body Tabel */}
              <tbody className="divide-y divide-gray-200">
                {jadwalDokter.length === 0 ? (
                  // Jika tidak ada data jadwal
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">
                      Data jadwal kosong
                    </td>
                  </tr>
                ) : (
                  // Jika ada data jadwal, tampilkan setiap baris
                  jadwalDokter.map((jadwal, index) => (
                    <tr key={jadwal.id || index} className="hover:bg-gray-50 text-gray-700">
                      <td className="px-4 py-2">
                        {jadwal.nama_dokter || jadwal.doctor_name || "N/A"}
                      </td>
                      <td className="px-4 py-2">
                        {jadwal.hari || jadwal.day || "N/A"}
                      </td>
                      <td className="px-4 py-2">
                        {/* Format jam dengan berbagai kemungkinan field */}
                        {(jadwal.jam_mulai && jadwal.jam_akhir) 
                          ? `${jadwal.jam_mulai} - ${jadwal.jam_akhir}`
                          : (jadwal.start_time && jadwal.end_time)
                          ? `${jadwal.start_time} - ${jadwal.end_time}`
                          : "N/A"
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;