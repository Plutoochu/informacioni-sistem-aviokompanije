import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../kontekst/AuthContext";
import { useLanguage } from "../kontekst/LanguageContext";
import LanguageSwitcher from "../reusable-komponente/LanguageSwitcher";

const Navigacija = () => {
  const { korisnik, odjaviKorisnika } = useAuth();
  const { t } = useLanguage();
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
            {korisnik.role !== "admin" && (
              <>
                <Link to="/pocetna" className="navigacija-link">
                  {t('nav.home')}
                </Link>
                <Link to="/letovi" className="navigacija-link">
                  {t('nav.flights')}
                </Link>
                <Link to="/rezervacije" className="navigacija-link">
                  {t('nav.reservations')}
                </Link>
                <Link to="/loyalty" className="navigacija-link">
                  {t('nav.loyalty')}
                </Link>
              </>
            )}
            <Link to="/profil" className="navigacija-link">
              {t('nav.profile')}
            </Link>
            <LanguageSwitcher />
            <button onClick={handleOdjava} className="navigacija-dugme">
              {t('nav.logout')}
            </button>
          </>
        ) : (
          <>
            <LanguageSwitcher />
            <Link to="/prijava" className="navigacija-link">
              {t('nav.login')}
            </Link>
            <Link to="/registracija" className="navigacija-dugme">
              {t('nav.register')}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigacija;
