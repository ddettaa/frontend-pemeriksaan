import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Combobox, Transition, Menu } from "@headlessui/react";
import { Fragment } from "react";
import axios from "axios";

const Diagnosa = () => {
  const { id_pasien: no_reg } = useParams();
  const navigate = useNavigate();
  const [diagnosa, setDiagnosa] = useState("");
  const [tindakan, setTindakan] = useState("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tindakanOptions, setTindakanOptions] = useState([]); // Ubah menjadi state untuk menyimpan data tindakan dari API

  const API_URL = "https://ti054a02.agussbn.my.id"; // Hardcoded API URL
  const token = localStorage.getItem("token");
  
  useEffect(() => {
    const fetchTindakanOptions = async () => {
      try {
        const response = await fetch(
          "https://ti054a03.agussbn.my.id/api/tindakan",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Pastikan token diambil dari localStorage atau state
            },
          }
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil data tindakan");
        }

        const data = await response.json();
        setTindakanOptions(data.data || []); // Asumsikan data tindakan ada di `data.data`
      } catch (error) {
        console.error("Error fetching tindakan options:", error);
      }
    };

    fetchTindakanOptions();
  }, []);

  const filteredTindakan =
    query === ""
      ? tindakanOptions
      : tindakanOptions.filter((item) =>
          item.nama_tindakan.toLowerCase().includes(query.toLowerCase()) // Asumsikan nama tindakan ada di `nama_tindakan`
        );

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      // Validate inputs
      if (!diagnosa.trim()) {
        throw new Error("Diagnosa wajib diisi");
      }
      if (!tindakan.trim()) {
        throw new Error("Tindakan wajib diisi");
      }

      // Send update request
      const response = await axios.put(
        `${API_URL}/api/pemeriksaan/${no_reg}/diagnosa`,
        {
          diagnosa,
          tindakan,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        // Navigate to next page (e.g., resep)
        navigate(`/dokter/resep/${no_reg}`);
      } else {
        throw new Error(response.data.message || "Gagal menyimpan diagnosa");
      }
    } catch (err) {
      console.error("Error saving diagnosis:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Terjadi kesalahan saat menyimpan diagnosa"
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/");
                  }}
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
            <h1 className="text-lg font-bold">DIAGNOSA PASIEN</h1>
            <p className="text-sm font-semibold text-gray-600">
              Pemeriksaan Awal &gt; Pemeriksaan &gt; Resep Obat
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

        {/* Hasil Pemeriksaan */}
        <div className="mb-8 w-[750px]">
          <h2 className="font-semibold text-gray-700 mb-3">
            Hasil Pemeriksaan
          </h2>
          <div className="text-sm">
            <textarea
              value={diagnosa}
              onChange={(e) => setDiagnosa(e.target.value)}
              placeholder="Masukkan hasil pemeriksaan..."
              className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0099a8] focus:border-transparent text-[#0099a8] bg-white resize-none shadow-md hover:shadow-lg transition-shadow duration-200"
            />
          </div>
        </div>

        {/* Tindakan */}
        <div className="mb-8 w-[750px]">
          <h2 className="font-semibold text-gray-700 mb-3">Tindakan</h2>
          <div className="text-sm">
            <Combobox value={tindakan} onChange={setTindakan}>
              <div className="relative">
                <Combobox.Input
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0099a8] focus:border-transparent text-[#0099a8] bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ketik untuk mencari tindakan..."
                />
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  afterLeave={() => setQuery("")}
                >
                  <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {filteredTindakan.length === 0 && query !== "" ? (
                      <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                        Tidak ada tindakan yang sesuai.
                      </div>
                    ) : (
                      filteredTindakan.map((item, index) => (
                        <Combobox.Option
                          key={index}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 px-4 ${
                              active
                                ? "bg-[#0099a8] text-white"
                                : "text-[#0099a8]"
                            }`
                          }
                          value={item.nama_tindakan} // Gunakan `nama_tindakan` sebagai nilai
                        >
                          {({ selected }) => (
                            <span
                              className={`block truncate ${
                                selected ? "font-medium" : "font-normal"
                              }`}
                            >
                              {item.nama_tindakan} {/* Tampilkan nama tindakan */}
                            </span>
                          )}
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </Transition>
              </div>
            </Combobox>
          </div>
        </div>

        {/* Tombol */}
        <div className="mt-8 flex justify-end">
          {error && <div className="mr-4 text-red-500 text-sm">{error}</div>}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`bg-[#0099a8] text-white px-5 py-2 rounded-xl shadow text-sm hover:bg-[#007a85] transition-colors duration-200 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "MENYIMPAN..." : "SELANJUTNYA ⏵"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Diagnosa;
