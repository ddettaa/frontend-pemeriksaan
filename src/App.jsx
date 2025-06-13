import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import DokterDashboard from "./components/dokter/Dashboard";
import DashboardPerawat from "./components/perawat/DashboardPerawat";
import ListPasien from "./components/dokter/ListPasien";
import DataPemeriksaan from "./components/dokter/DataPemeriksaan";
import Diagnosa from "./components/dokter/Diagnosa";
import History from "./components/dokter/History";
import Resep from "./components/dokter/Resep";
import ListPasienPerawat from "./components/perawat/ListPasienPerawat";
import HistoryPerawat from "./components/perawat/HistoryPerawat";
import InputPemeriksaan from "./components/perawat/InputPemeriksaan";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />

        {/* Protected Dokter Routes */}
        <Route
          path="/dokter/*"
          element={
            <ProtectedRoute allowedRoles={["dokter"]}>
              <Routes>
                <Route path="Dashboard" element={<DokterDashboard />} />
                <Route path="list-pasien" element={<ListPasien />} />
                <Route
                  path="data-pemeriksaan/:id_pasien"
                  element={<DataPemeriksaan />}
                />
                <Route path="diagnosa/:id_pasien" element={<Diagnosa />} />
                <Route path="resep/:id_pasien" element={<Resep />} />
                <Route path="history" element={<History />} />
                <Route
                  path="akun"
                  element={<div>Akun Dokter (Coming Soon)</div>}
                />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Protected Perawat Routes */}
        <Route
          path="/perawat/*"
          element={
            <ProtectedRoute allowedRoles={["perawat"]}>
              <Routes>
                <Route path="DashboardPerawat" element={<DashboardPerawat />} />
                <Route path="list-pasien" element={<ListPasienPerawat />} />
                <Route
                  path="input-pemeriksaan/:id_pasien"
                  element={<InputPemeriksaan />}
                />
                <Route path="history" element={<HistoryPerawat />} />
                <Route
                  path="detail-history/:id_pasien"
                  element={<div>Detail History Perawat (Coming Soon)</div>}
                />
                <Route
                  path="akun"
                  element={<div>Akun Perawat (Coming Soon)</div>}
                />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
