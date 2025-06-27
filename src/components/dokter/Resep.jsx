import { Link, useNavigate } from 'react-router-dom';
import { useState, Fragment, useEffect } from 'react';
import { Combobox, Transition, Menu } from '@headlessui/react';
import { useParams } from "react-router-dom";
import { useRef } from 'react';

const Resep = () => {
  const { no_registrasi } = useParams();
  const [forms, setForms] = useState([{ obat: '', aturan: '', jumlah: '' }]);
  const [query, setQuery] = useState('');
  const [idResep, setIdResep] = useState('');
  const [obatOptions, setObatOptions] = useState([]);
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  
  const createResepRequested = useRef(false);

  useEffect(() => {
    const resepFlag = localStorage.getItem(`resep_created_${no_registrasi}`);
    if (resepFlag) {
      setIdResep(resepFlag);
      return;
    }

    // Cegah double POST karena Strict Mode
    if (createResepRequested.current) return;
    createResepRequested.current = true;

    const createEmptyResep = async () => {
      try {
        const response = await fetch("https://ti054a02.agussbn.my.id/api/e-resep", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ no_registrasi: String(no_registrasi) })
        });
        const data = await response.json();
        if (response.ok && data.id_resep) {
          setIdResep(data.id_resep);
          localStorage.setItem(`resep_created_${no_registrasi}`, data.id_resep);
        } else {
          setIdResep("Gagal mendapatkan ID");
        }
      } catch {
        setIdResep("Gagal mendapatkan ID");
      }
    };

    createEmptyResep();
  }, [no_registrasi]);

  useEffect(() => {
    const fetchObatOptions = async () => {
      try {
        const response = await fetch("https://ti054a04.agussbn.my.id/api/admin/obat", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data obat");
        }

        const data = await response.json();
        setObatOptions(data.data || []); // Asumsikan data obat ada di `data.data`
      } catch (error) {
        console.error("Error fetching obat options:", error);
      }
    };

    fetchObatOptions();
  }, []);

  const filteredObat =
    query === ''
      ? obatOptions
      : obatOptions.filter((item) =>
          item.nama_obat.toLowerCase().includes(query.toLowerCase()) // Asumsikan nama obat ada di `nama_obat`
        );
  const handleSaveResep = async () => {
  try {
    if (!idResep || idResep === "Gagal mendapatkan ID") {
      alert("ID Resep belum tersedia!");
      return;
    }
    for (const form of forms) {
      if (!form.obat || !form.jumlah || !form.aturan) {
        alert("Semua field resep harus diisi!");
        return;
      }
    }
    for (const form of forms) {
  await fetch(`https://ti054a02.agussbn.my.id/api/e-resep/${idResep}/detail`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      id_obat: form.obat,
      jumlah: form.jumlah,
      aturan_pakai: form.aturan,
    }),
  });
}

// ⬇️ Update status pasien menjadi "Diperiksa" (status: 2)
await fetch(`https://ti054a01.agussbn.my.id/api/pendaftaran/${no_registrasi}`, {
  method: "PUT",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  body: JSON.stringify({ status: 2 }), // ⬅️ status_raw = 2 = "Diperiksa"
});

// ⬇️ Tampilkan notifikasi dan redirect
setShowToast(true);
setTimeout(() => {
  setShowToast(false);
  localStorage.removeItem(`resep_created_${no_registrasi}`);
  navigate("/dokter/listPasien");
}, 1800);

  } catch (error) {
    console.error("Gagal menyimpan resep:", error);
    alert("Gagal menyimpan resep.");
  }
};

const handleCancel = async () => {
  if (idResep && idResep !== "Gagal mendapatkan ID") {
    await fetch(`https://ti054a02.agussbn.my.id/api/e-resep/${idResep}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    localStorage.removeItem(`resep_created_${no_registrasi}`);
  }
  navigate("/dokter/listPasien");
};

    const handleAddForm = () => {
    setForms([...forms, { obat: '', aturan: '', jumlah: '' }]);
  };

  const handleDeleteForm = (indexToDelete) => {
    setForms(forms.filter((_, index) => index !== indexToDelete));
  };

  const handleObatChange = (value, index) => {
    const newForms = [...forms];
    newForms[index].obat = value;
    setForms(newForms);
  };

  const handleAturanChange = (e, index) => {
    const newForms = [...forms];
    newForms[index].aturan = e.target.value;
    setForms(newForms);
  };

  const handleJumlahChange = (e, index) => {
    const newForms = [...forms];
    newForms[index].jumlah = parseInt(e.target.value, 10);

    setForms(newForms);
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

{showToast && (
  <div className="fixed top-8 right-8 z-50">
    <div className="flex items-center px-6 py-4 bg-green-500 text-white rounded-xl shadow-lg animate-slide-in">
      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span className="font-semibold">Resep berhasil disimpan!</span>
    </div>
  </div>
)}

      <main className="flex-1 p-10 overflow-auto relative">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-lg font-bold">DIAGNOSA PASIEN</h1>
            <p className="text-sm font-semibold text-gray-600">Pemeriksaan Awal &gt; Pemeriksaan &gt; Resep Obat</p>
          </div>
          <img src="/simrs.png" alt="Logo" className="w-14 h-14" style={{ filter: 'brightness(0) saturate(100%) invert(41%) sepia(85%) saturate(2044%) hue-rotate(165deg) brightness(93%) contrast(101%)' }} />
        </div>

        <div className="w-[750px] space-y-6">
          {/* Resep ID Field */}
          <div className="bg-gray-100 p-6 rounded-xl border border-gray-200">
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-500">ID Resep:</label>
        <input
          type="text"
          value={idResep}
          readOnly
          className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none cursor-not-allowed font-medium select-none"
        />
            </div>
          </div>

          {forms.map((form, index) => (
            <div key={index} className="space-y-4 bg-gray-50 p-6 rounded-xl relative">
              <div className="flex justify-between items-center absolute -top-3 left-4 right-4">
                <div className="bg-[#0099a8] text-white px-3 py-1 rounded-lg text-sm font-medium">
                  Obat {index + 1}
                </div>
                {index > 0 && (
                  <button
                    onClick={() => handleDeleteForm(index)}
                    className="bg-red-500 text-white p-1 rounded-lg hover:bg-red-600 transition-colors duration-200"
                    title="Hapus obat"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="relative mt-4">
                <Combobox value={form.obat} onChange={(value) => handleObatChange(value, index)}>
                  <div className="relative">
                    <Combobox.Input
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0099a8] focus:border-transparent text-[#0099a8] bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Cari Obat/BHP..."
                    />
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                      afterLeave={() => setQuery('')}
                    >
                      <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
                        {filteredObat.length === 0 && query !== '' ? (
                          <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                            Tidak ada obat yang sesuai.
                          </div>
                        ) : (
                          filteredObat.map((item, idx) => (
                            <Combobox.Option
                              key={idx}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 px-4 ${
                                  active ? 'bg-[#0099a8] text-white' : 'text-[#0099a8]'
                                }`
                              }
                              value={item.id_obat} // Gunakan `nama_obat` sebagai nilai
                            >
                              {({ selected }) => (
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {item.nama_obat} {/* Tampilkan nama obat */}
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

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={form.aturan}
                  onChange={(e) => handleAturanChange(e, index)}
                  placeholder="Aturan Pakai"
                  className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0099a8] focus:border-transparent text-[#0099a8] bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
                />
                <input
                  type="text"
                  value={form.jumlah}
                  onChange={(e) => handleJumlahChange(e, index)}
                  placeholder="Jumlah"
                  className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0099a8] focus:border-transparent text-[#0099a8] bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
                />
              </div>
            </div>
          ))}

          <button
            onClick={handleAddForm}
            className="flex items-center space-x-2 text-white bg-[#0099a8] px-4 py-2 rounded-xl hover:bg-[#007a85] transition-colors duration-200 text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Tambah</span>
          </button>
        </div>

        <div className="fixed bottom-8 right-8 space-x-4">
          <button
  className="bg-red-500 text-white px-6 py-2 rounded-xl shadow text-sm hover:bg-red-600 transition-colors duration-200"
  onClick={handleCancel}
>
  BATAL
</button>
          <button className="bg-green-500 text-white px-6 py-2 rounded-xl shadow text-sm hover:bg-green-600 transition-colors duration-200" onClick={handleSaveResep}>
            SIMPAN
          </button>
        </div>
      </main>
    </div>
  );
};

export default Resep;