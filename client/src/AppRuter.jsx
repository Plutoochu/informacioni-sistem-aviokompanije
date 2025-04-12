import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./kontekst/AuthContext";
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

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navigacija />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/prijava" replace />} />
              <Route path="/pocetna" element={<Pocetna />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/korisnici" element={<UpravljanjeKorisnicima />} />
              <Route
                path="/upravljanje-avionima"
                element={<UpravljanjeAvionima />}
              />

              <Route
                path="/destinacije"
                element={<UpravljanjeDestinacijama />}
              />
              <Route path="/prijava" element={<Prijava />} />
              <Route path="/registracija" element={<Registracija />} />
              <Route path="/profil" element={<Profil />} />
              <Route path="/letovi" element={<Letovi />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/avioni" element={<AvioniForma />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
