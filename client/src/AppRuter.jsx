import React from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AdminDashboard from "./glavne-komponente/AdminDashboard";
import AvioniForma from "./glavne-komponente/AvioniForma";
import ForgotPassword from "./glavne-komponente/ForgotPassword";
import Letovi from "./glavne-komponente/Letovi";
import MapaSjedista from "./glavne-komponente/MapaSjedista";
import Navigacija from "./glavne-komponente/Navigacija";
import Pocetna from "./glavne-komponente/Pocetna";
import Prijava from "./glavne-komponente/Prijava";
import Profil from "./glavne-komponente/Profil";
import RasporedLetovaForma from "./glavne-komponente/RasporedLetovaForma";
import Registracija from "./glavne-komponente/Registracija";
import ResetPassword from "./glavne-komponente/ResetPassword";
import Rezervacija from "./glavne-komponente/Rezervacija";
import UpravljanjeAvionima from "./glavne-komponente/UpravljanjeAvionima";
import UpravljanjeDestinacijama from "./glavne-komponente/UpravljanjeDestinacijama";
import UpravljanjeKorisnicima from "./glavne-komponente/UpravljanjeKorisnicima";
import { AuthProvider, useAuth } from "./kontekst/AuthContext";
import "./stilovi/App.css";

// Komponenta za zaštićene admin rute
const ProtectedAdminRoute = ({ children }) => {
  const { korisnik } = useAuth();

  if (!korisnik || korisnik.role !== "admin") {
    return <Navigate to="/prijava" replace />;
  }

  return children;
};

// Komponenta za preusmjeravanje admina
const AdminRedirect = () => {
  const { korisnik } = useAuth();

  if (korisnik && korisnik.role === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return <Pocetna />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navigacija />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/prijava" replace />} />
              <Route path="/pocetna" element={<AdminRedirect />} />

              {/* Zaštićene admin rute */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/raspored-letova"
                element={
                  <ProtectedAdminRoute>
                    <RasporedLetovaForma />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/korisnici"
                element={
                  <ProtectedAdminRoute>
                    <UpravljanjeKorisnicima />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/upravljanje-avionima"
                element={
                  <ProtectedAdminRoute>
                    <UpravljanjeAvionima />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/destinacije"
                element={
                  <ProtectedAdminRoute>
                    <UpravljanjeDestinacijama />
                  </ProtectedAdminRoute>
                }
              />

              {/* Ostale rute */}
              <Route path="/prijava" element={<Prijava />} />
              <Route path="/registracija" element={<Registracija />} />
              <Route path="/profil" element={<Profil />} />
              <Route path="/letovi" element={<Letovi />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/avioni" element={<AvioniForma />} />
              <Route path="/rezervacija/:id" element={<Rezervacija />} />
              <Route path="/mapa-sjedista" element={<MapaSjedista />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
