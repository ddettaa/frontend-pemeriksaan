import { Link, useNavigate } from "react-router-dom";
import { useState, Fragment, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";

const History = () => {
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const [poliName, setPoliName] = useState("");
  const [doctorName, setDoctorName] = useState("");

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

        <div className="group mb-52">
          <Link to="/dokter/history" className="flex flex-col items-center">
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
            <p className="text-sm text-gray-600 mt-1">Halo, {doctorName}</p>
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

        <div className="mt-4 relative">
          <div
            className={`flex items-center bg-white rounded-xl overflow-hidden transition-all duration-300 ${
              isFocused
                ? "ring-2 ring-[#0099a8] shadow-lg"
                : "border border-gray-200 shadow-sm"
            }`}
          >
            <div className="pl-4 pr-2 py-2">
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
              type="text"
              placeholder="Cari nama pasien atau nomor registrasi..."
              className="w-full py-2.5 pr-4 text-sm text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </div>
          {isFocused && (
            <div className="absolute inset-x-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 text-sm py-2 z-10">
              <div className="px-4 py-1.5 text-gray-500">
                Ketik untuk mencari...
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-6 text-sm">
          <div>
            <h2 className="font-semibold mb-2 text-gray-700">Hari ini</h2>
            <table className="min-w-full border border-gray-300 bg-white">
              <thead>
                <tr className="bg-[#c9d6ec] text-gray-700 text-sm">
                  <th className="px-4 py-2 font-medium text-left">No Reg</th>
                  <th className="px-4 py-2 font-medium text-left">Antrian</th>
                  <th className="px-4 py-2 font-medium text-left">Nama</th>
                  <th className="px-4 py-2 font-medium text-left">Status</th>
                  <th className="px-4 py-2 font-medium text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 text-gray-700">
                  <td className="px-4 py-2">457459</td>
                  <td className="px-4 py-2">0001</td>
                  <td className="px-4 py-2">Noor Putri</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Selesai
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <Link to="/dokter/data-pemeriksaan/457459">
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
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="font-semibold mb-2 text-gray-700">
              Jum'at, 09 - 05 - 2025
            </h2>
            <table className="min-w-full border border-gray-300 bg-white">
              <thead>
                <tr className="bg-[#c9d6ec] text-gray-700 text-sm">
                  <th className="px-4 py-2 font-medium text-left">No Reg</th>
                  <th className="px-4 py-2 font-medium text-left">Antrian</th>
                  <th className="px-4 py-2 font-medium text-left">Nama</th>
                  <th className="px-4 py-2 font-medium text-left">Status</th>
                  <th className="px-4 py-2 font-medium text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 text-gray-700">
                  <td className="px-4 py-2">457458</td>
                  <td className="px-4 py-2">0002</td>
                  <td className="px-4 py-2">Ahmad Baidawi</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Selesai
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <Link to="/dokter/data-pemeriksaan/457458">
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
              </tbody>
            </table>
          </div>
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

export default History;
