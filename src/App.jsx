import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
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

// Layout kosong dengan Outlet untuk nested route
const PerawatLayout = () => <Outlet />;
const DokterLayout = () => <Outlet />;

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Dokter Routes */}
        <Route
          path="/dokter"
          element={
            <ProtectedRoute allowedRoles={["dokter"]}>
              <DokterLayout />
            </ProtectedRoute>
          }
        >
          <Route path="Dashboard" element={<DokterDashboard />} />
          <Route path="listPasien" element={<ListPasien />} />
          <Route
            path="data-pemeriksaan/:id_pasien"
            element={<DataPemeriksaan />}
          />
          <Route path="diagnosa/:id_pasien" element={<Diagnosa />} />
          <Route path="resep/:id_pasien" element={<Resep />} />
          <Route path="history" element={<History />} />
          <Route path="akun" element={<div>Akun Dokter (Coming Soon)</div>} />
        </Route>

        {/* Protected Perawat Routes */}
        <Route
          path="/perawat"
          element={
            <ProtectedRoute allowedRoles={["perawat"]}>
              <PerawatLayout />
            </ProtectedRoute>
          }
        >
          <Route path="DashboardPerawat" element={<DashboardPerawat />} />
          <Route path="listPasien" element={<ListPasienPerawat />} />
          <Route
            path="InputPemeriksaan/:no_registrasi"
            element={<InputPemeriksaan />}
          />
          <Route path="history" element={<HistoryPerawat />} />
          <Route
            path="detail-history/:id_pasien"
            element={<div>Detail History Perawat (Coming Soon)</div>}
          />
          <Route path="akun" element={<div>Akun Perawat (Coming Soon)</div>} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
