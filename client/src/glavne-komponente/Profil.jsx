import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../kontekst/LanguageContext";
import axios from "axios";

const getBaseUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }
  return "https://informacioni-sistem-za-aviokompanije.onrender.com";
};

const Profil = () => {
  const { t } = useLanguage();
  const [podaci, setPodaci] = useState({
    ime: "",
    prezime: "",
    email: "",
    telefon: "",
  });
  const [poruka, setPoruka] = useState("");
  const [greska, setGreska] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const dohvatiProfil = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("Nema tokena, preusmjeravam na login");
          navigate("/prijava");
          return;
        }

        const response = await axios.get(`${getBaseUrl()}/api/korisnici/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPodaci(response.data);
      } catch (error) {
        console.error("Greška pri dohvatanju profila:", error);
        setGreska(t('profile.updateError'));
      }
    };

    dohvatiProfil();
  }, [navigate, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPodaci((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!podaci.email || !podaci.telefon || !podaci.ime || !podaci.prezime) {
      setGreska(t('common.required'));
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${getBaseUrl()}/api/korisnici/profil`, podaci, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPoruka(t('profile.updateSuccess'));
      setGreska("");
      setPodaci(response.data);
    } catch (error) {
      setGreska(error.response?.data?.message || t('profile.updateError'));
      setPoruka("");
    }
  };

  return (
    <div className="profil-container">
      <div className="profil-card">
        <h2>{t('profile.title')}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ime">{t('profile.firstName')}:</label>
            <input
              type="text"
              id="ime"
              name="ime"
              value={podaci.ime}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="prezime">{t('profile.lastName')}:</label>
            <input
              type="text"
              id="prezime"
              name="prezime"
              value={podaci.prezime}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('profile.email')}:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={podaci.email}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefon">{t('profile.phone')}:</label>
            <input
              type="text"
              id="telefon"
              name="telefon"
              value={podaci.telefon}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <button type="submit" className="button">
            {t('profile.save')}
          </button>

          {poruka && <p className="success">{poruka}</p>}
          {greska && <p className="error">{greska}</p>}
        </form>
      </div>
    </div>
  );
};

export default Profil;
