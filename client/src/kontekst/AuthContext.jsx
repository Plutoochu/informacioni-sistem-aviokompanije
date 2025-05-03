import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = React.createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [korisnik, setKorisnik] = useState(null);
  const navigate = useNavigate();

  const getBaseUrl = () => {
    if (window.location.hostname === "localhost") {
      return "http://localhost:5000";
    }
    return "https://informacioni-sistem-za-aviokompanije.onrender.com";
  };

  const prijaviKorisnika = async (email, lozinka) => {
    const adresaRute = `${getBaseUrl()}/api/korisnici/prijava`;

    try {
      const odgovor = await axios.post(adresaRute, {
        email,
        lozinka,
      });

      if (odgovor.data.token) {
        localStorage.setItem("token", odgovor.data.token);
        localStorage.setItem("korisnik", JSON.stringify(odgovor.data.korisnik));
        setKorisnik(odgovor.data.korisnik);
        if (odgovor.data.korisnik.role === "admin") {
          navigate("/admin-dashboard");
        } else navigate("/pocetna");
        return { uspjesno: true };
      }
    } catch (error) {
      console.error("Greška pri prijavi:", error);
      return {
        uspjesno: false,
        poruka: error.response?.data?.message || "Došlo je do greške prilikom prijave",
      };
    }
  };

  const resetujLozinku = async (email) => {
    const adresaRute = `${getBaseUrl()}/api/korisnici/reset-lozinke`;

    try {
      const Odgovor = await axios.post(adresaRute, { email });
      return {
        uspjesno: true,
        poruka: "Zahtjev za resetovanje lozinke je poslan na vaš email",
      };
    } catch (error) {
      console.error("Greška pri resetovanju lozinke:", error);
      return {
        uspjesno: false,
        poruka: error.response?.data?.message || "Došlo je do greške prilikom resetovanja lozinke",
      };
    }
  };

  const odjaviKorisnika = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("korisnik");
    setKorisnik(null);
    navigate("/prijava");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const sacuvaniKorisnik = localStorage.getItem("korisnik");

    if (token && sacuvaniKorisnik) {
      setKorisnik(JSON.parse(sacuvaniKorisnik));
    }
  }, []);

  const value = {
    korisnik,
    prijaviKorisnika,
    odjaviKorisnika,
    resetujLozinku,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
