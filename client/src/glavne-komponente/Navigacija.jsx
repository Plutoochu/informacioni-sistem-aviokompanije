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
      <div className="navigacija-lijevo">
        <Link to="/" className="logo">
          Aviokompanija
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
              Odjavi se
            </button>
          </>
        ) : (
          <>
            <Link to="/prijava" className="navigacija-link">
              Prijavi se
            </Link>
            <Link to="/registracija" className="navigacija-dugme">
              Registruj se
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigacija;
