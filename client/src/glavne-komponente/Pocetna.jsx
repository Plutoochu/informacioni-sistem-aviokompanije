import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../kontekst/AuthContext';

const Pocetna = () => {
  const { korisnik } = useAuth();

  // Ako je korisnik admin, preusmjeri ga na admin dashboard
  if (korisnik && korisnik.uloga === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (!korisnik) {
    return (
      <div className="pocetna-container">
        <div className="pocetna-card">
          <h2>Dobrodošli u Aviokompaniju</h2>
          <p>Pronađite i rezervišite svoje savršeno putovanje</p>
          <div className="pocetna-dugmad">
            <Link to="/prijava" className="pocetna-dugme">
              Prijavi se
            </Link>
            <Link to="/registracija" className="pocetna-dugme">
              Registruj se
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pocetna-container">
      <div className="pocetna-card">
        <h2>Dobrodošli, {korisnik.ime}!</h2>
        <p>Gdje želite putovati danas?</p>
        <div className="pocetna-opcije">
          <Link to="/profil" className="pocetna-opcija">
            <div className="pocetna-opcija-kartica">
              <h3>Profil</h3>
              <p>Upravljajte svojim podacima i lozinkom</p>
            </div>
          </Link>
          <Link to="/letovi" className="pocetna-opcija">
            <div className="pocetna-opcija-kartica">
              <h3>Letovi</h3>
              <p>Pretražite i rezervišite letove</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pocetna;