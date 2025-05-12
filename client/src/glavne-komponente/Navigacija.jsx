import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../kontekst/AuthContext";

const Navigacija = () => {
  const { korisnik, odjaviKorisnika } = useAuth();
  const navigate = useNavigate();

  const handleOdjava = () => {
    odjaviKorisnika();
    navigate("/prijava");
  };

  return (
    <nav className="navigacija">
      <div>
        <Link to="/pocetna" className="logo avion">
          NRS Aviokompanija
        </Link>
      </div>

      <div className="navigacija-desno">
        {korisnik ? (
          <>
            <Link to="/pocetna" className="navigacija-link">
              Početna
            </Link>
            <Link to="/profil" className="navigacija-link">
              Profil
            </Link>
            <button onClick={handleOdjava} className="navigacija-dugme">
              Odjavite se
            </button>
          </>
        ) : (
          <>
            <Link to="/prijava" className="navigacija-link">
              Prijavite se
            </Link>
            <Link to="/registracija" className="navigacija-dugme">
              Registrujte se
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigacija;
