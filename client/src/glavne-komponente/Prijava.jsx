import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../kontekst/AuthContext";
import { useLanguage } from "../kontekst/LanguageContext";

const Prijava = () => {
  const [formData, setFormData] = useState({
    email: "",
    lozinka: "",
  });
  const [greska, setGreska] = useState("");
  const { prijaviKorisnika } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGreska("");

    if (!formData.email || !formData.lozinka) {
      setGreska("Molimo popunite sva polja");
      return;
    }

    const rezultat = await prijaviKorisnika(formData.email, formData.lozinka);
    if (!rezultat.uspjesno) {
      setGreska(rezultat.poruka || t('auth.loginError'));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{t('auth.login')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t('auth.email')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lozinka">{t('auth.password')}</label>
            <input
              type="password"
              id="lozinka"
              value={formData.lozinka}
              onChange={(e) => setFormData({ ...formData, lozinka: e.target.value })}
              placeholder={t('auth.password')}
            />
          </div>
          {greska && <div className="error-message">{greska}</div>}
          <button type="submit" className="auth-button">
            {t('auth.loginButton')}
          </button>
          <div className="link-container">
            <span>{t('auth.forgotPassword')} </span>
            <span className="link" onClick={() => navigate("/forgot-password")}>
              {t('auth.resetPassword')}
            </span>
          </div>
          <div className="link-container">
            <span>{t('auth.dontHaveAccount')} </span>
            <span className="link" onClick={() => navigate("/registracija")}>
              {t('auth.registerButton')}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Prijava;
