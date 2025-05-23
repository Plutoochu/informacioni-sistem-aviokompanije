import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../stilovi/Registracija.css";
import { useLanguage } from "../kontekst/LanguageContext";

const getBaseUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }
  return "https://informacioni-sistem-za-aviokompanije.onrender.com";
};

const Registracija = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    ime: "",
    prezime: "",
    email: "",
    lozinka: "",
    potvrdaLozinke: "",
  });
  const [greska, setGreska] = useState("");
  const [uspjesno, setUspjesno] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGreska("");
    setUspjesno("");

    // Validacija
    if (!formData.ime || !formData.prezime || !formData.email || !formData.lozinka || !formData.potvrdaLozinke) {
      setGreska("Molimo popunite sva polja");
      return;
    }

    if (formData.lozinka !== formData.potvrdaLozinke) {
      setGreska("Lozinke se ne podudaraju");
      return;
    }

    try {
      const response = await axios.post(`${getBaseUrl()}/api/korisnici/registracija`, {
        ime: formData.ime,
        prezime: formData.prezime,
        email: formData.email,
        lozinka: formData.lozinka,
      });

      setUspjesno(t('auth.registerSuccess'));
      setTimeout(() => {
        navigate("/prijava");
      }, 2000);
    } catch (error) {
      setGreska(error.response?.data?.message || t('auth.registerError'));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{t('auth.register')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ime">{t('auth.firstName')}</label>
            <input
              type="text"
              id="ime"
              value={formData.ime}
              onChange={(e) => setFormData({ ...formData, ime: e.target.value })}
              placeholder={t('auth.enterName')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="prezime">{t('auth.lastName')}</label>
            <input
              type="text"
              id="prezime"
              value={formData.prezime}
              onChange={(e) => setFormData({ ...formData, prezime: e.target.value })}
              placeholder={t('auth.enterSurname')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t('auth.enterEmail')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lozinka">{t('auth.password')}</label>
            <input
              type="password"
              id="lozinka"
              value={formData.lozinka}
              onChange={(e) => setFormData({ ...formData, lozinka: e.target.value })}
              placeholder={t('auth.enterPassword')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="potvrdaLozinke">{t('auth.confirmPassword')}</label>
            <input
              type="password"
              id="potvrdaLozinke"
              value={formData.potvrdaLozinke}
              onChange={(e) => setFormData({ ...formData, potvrdaLozinke: e.target.value })}
              placeholder={t('auth.confirmPassword')}
            />
          </div>
          {greska && <div className="error-message">{greska}</div>}
          {uspjesno && <div className="success-message">{uspjesno}</div>}
          <button type="submit" className="auth-button">
            {t('auth.registerButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registracija;
