import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../stilovi/App.css";

const getBaseUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }
  return "https://informacioni-sistem-za-aviokompanije.onrender.com";
};

const Profil = () => {
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
        setGreska("Došlo je do greške pri dohvatanju podataka");
      }
    };

    dohvatiProfil();
  }, [navigate]);

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
      setGreska("Sva polja moraju biti popunjena.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${getBaseUrl()}/api/korisnici/profil`, podaci, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPoruka("Profil uspješno ažuriran");
      setGreska("");
      setPodaci(response.data);
    } catch (error) {
      setGreska(error.response?.data?.message || "Došlo je do greške pri ažuriranju profila");
      setPoruka("");
    }
  };

  return (
    <div className="profil-container">
      <div className="profil-card">
        <h2>Upravljanje profilom</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ime">Ime:</label>
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
            <label htmlFor="prezime">Prezime:</label>
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
            <label htmlFor="email">Email:</label>
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
            <label htmlFor="telefon">Telefon:</label>
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
            Sačuvaj promjene
          </button>

          {poruka && <p className="success">{poruka}</p>}
          {greska && <p className="error">{greska}</p>}
        </form>
      </div>
    </div>
  );
};

export default Profil;
