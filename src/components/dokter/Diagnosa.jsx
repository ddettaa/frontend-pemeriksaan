import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, Fragment } from "react";
import { Combobox, Transition } from "@headlessui/react";
import axios from "axios";

const Diagnosa = () => {
  const { id_pasien: no_reg } = useParams();
  const navigate = useNavigate();
  const [diagnosa, setDiagnosa] = useState("");
  const [tindakan, setTindakan] = useState("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const tindakanOptions = [
    "Pemberian obat tetes mata antibiotik",
    "Pemberian obat tetes mata steroid",
    "Kompres air hangat",
    "Pembersihan kelopak mata",
    "Rujukan ke spesialis mata",
    "Observasi dan monitoring",
  ];

  const filteredTindakan =
    query === ""
      ? tindakanOptions
      : tindakanOptions.filter((item) =>
          item.toLowerCase().includes(query.toLowerCase())
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
        navigate("/login");
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
                          value={item}
                        >
                          {({ selected }) => (
                            <span
                              className={`block truncate ${
                                selected ? "font-medium" : "font-normal"
                              }`}
                            >
                              {item}
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
