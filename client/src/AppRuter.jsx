import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./kontekst/AuthContext";
import Navigacija from "./glavne-komponente/Navigacija";
import Pocetna from "./glavne-komponente/Pocetna";
import Prijava from "./glavne-komponente/Prijava";
import Registracija from "./glavne-komponente/Registracija";
import Profil from "./glavne-komponente/Profil";
import Letovi from "./glavne-komponente/Letovi";
import ForgotPassword from "./glavne-komponente/ForgotPassword";
import ResetPassword from "./glavne-komponente/ResetPassword";
import AvioniForma from "./glavne-komponente/AvioniForma";
import "./stilovi/App.css";
import AdminDashboard from "./glavne-komponente/AdminDashboard";
import UpravljanjeKorisnicima from "./glavne-komponente/UpravljanjeKorisnicima";
import UpravljanjeAvionima from "./glavne-komponente/UpravljanjeAvionima";
import UpravljanjeDestinacijama from "./glavne-komponente/UpravljanjeDestinacijama";
import RasporedLetovaForma from "./glavne-komponente/RasporedLetovaForma";
import Rezervacija from "./glavne-komponente/Rezervacija";

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
              <Route path="/admin-dashboard" element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } />
              <Route path="/raspored-letova" element={
                <ProtectedAdminRoute>
                  <RasporedLetovaForma />
                </ProtectedAdminRoute>
              } />
              <Route path="/korisnici" element={
                <ProtectedAdminRoute>
                  <UpravljanjeKorisnicima />
                </ProtectedAdminRoute>
              } />
              <Route path="/upravljanje-avionima" element={
                <ProtectedAdminRoute>
                  <UpravljanjeAvionima />
                </ProtectedAdminRoute>
              } />
              <Route path="/destinacije" element={
                <ProtectedAdminRoute>
                  <UpravljanjeDestinacijama />
                </ProtectedAdminRoute>
              } />

              {/* Ostale rute */}
              <Route path="/prijava" element={<Prijava />} />
              <Route path="/registracija" element={<Registracija />} />
              <Route path="/profil" element={<Profil />} />
              <Route path="/letovi" element={<Letovi />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/avioni" element={<AvioniForma />} />
              <Route path="/rezervacija/:id" element={<Rezervacija />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;