import React, { useState, useEffect } from "react";
import axios from "axios";
import "../stilovi/App.css";
import { dohvatiDestinacije } from "../pomocne-funkcije/fetch-funkcije";

const getBaseUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }
  return "https://informacioni-sistem-za-aviokompanije.onrender.com";
};

const Letovi = () => {
  const [letovi, setLetovi] = useState([]);
  const [destinacije, setDestinacije] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    odrediste: "",
    dan: "",
    mjesec: "",
    godina: "",
  });

  const fetchDestinacije = async () => {
    try {
      const response = await axios.get(
        `${getBaseUrl()}/api/letovi/destinacije`
      );
      const data = response.data;

      if (!Array.isArray(data)) throw new Error("Nepodržan format");

      setDestinacije(data);
    } catch (err) {
      console.error("Greška pri dohvatanju destinacija:", err);
      setError("Greška pri dohvatanju destinacija.");
      setDestinacije([]);
    }
  };

  const fetchLetovi = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filters.odrediste) params.odrediste = filters.odrediste;

      if (filters.dan && filters.mjesec && filters.godina) {
        const dan = filters.dan.padStart(2, "0");
        const mjesec = filters.mjesec.padStart(2, "0");
        params.datumPolaska = `${dan}/${mjesec}/${filters.godina}`;
      }

      console.log("Pozivam API sa parametrima:", params);
      const response = await axios.get(`${getBaseUrl()}/api/letovi`, {
        params,
      });
      console.log("API odgovor:", response.data);

      if (!response.data) {
        throw new Error("Nema podataka o letovima");
      }

      if (!Array.isArray(response.data)) {
        throw new Error("Neočekivani format podataka sa servera");
      }

      const formattedLetovi = response.data.map((let_) => ({
        _id: let_._id || "",
        origin: let_.origin || "",
        destination: let_.destination || "",
        departureTime: let_.departureTime || "",
        arrivalTime: let_.arrivalTime || "",
        dolazakSljedeciDan: let_.dolazakSljedeciDan || false,
        flightNumber: let_.flightNumber || "",
        cijena: generisiCijenu(),
        avionId: let_.avionId
          ? {
              naziv: let_.avionId.naziv || "",
              model: let_.avionId.model || "",
            }
          : null,
      }));

      console.log("Formatirani letovi:", formattedLetovi);
      setLetovi(formattedLetovi);
    } catch (err) {
      console.error("Greška pri dohvatanju letova:", err);
      setError(
        "Došlo je do greške pri učitavanju letova. Molimo pokušajte ponovo."
      );
      setLetovi([]);
    } finally {
      setLoading(false);
    }
  };

  const generisiCijenu = () => {
    return Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
  };

  useEffect(() => {
    fetchDestinacije();
    fetchLetovi();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === "dan") {
      const dan = parseInt(value);
      if (value && (dan < 1 || dan > 31)) return;
      if (value && value.length > 2) return;
    }
    if (name === "mjesec") {
      const mjesec = parseInt(value);
      if (value && (mjesec < 1 || mjesec > 12)) return;
      if (value && value.length > 2) return;
    }
    if (name === "godina") {
      if (value && value.length > 4) return;
    }

    if (["dan", "mjesec", "godina"].includes(name) && value !== "") {
      if (!/^\d+$/.test(value)) return;
    }

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLetovi();
  };

  if (letovi.length === 0) {
    return (
      <div className="letovi-container">
        <div className="letovi-card">
          <h2>Trenutno nema dostupnih letova</h2>
          <p>
            Molimo vas da pokušate kasnije ili kontaktirajte administratora za
            više informacija.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="letovi-container">
      <h2>Pretraga Letova</h2>

      <form onSubmit={handleSearch} className="pretraga-forma">
        <div className="form-group">
          <select
            name="odrediste"
            value={filters.odrediste}
            onChange={handleFilterChange}
            className="input-field select-field">
            <option key="default" value="">
              Sve destinacije
            </option>
            {destinacije.map((dest) => (
              <option key={dest._id} value={dest.grad}>
                {dest.grad} - {dest.nazivAerodroma}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="pretrazi-dugme" disabled={loading}>
          Pretraži
        </button>
      </form>

      {loading && <div className="loading">Učitavanje...</div>}
      {error && <div className="error">{error}</div>}

      <div className="letovi-grid">
        {letovi.length > 0
          ? letovi.map((let_) => (
              <div
                key={let_._id || `let-${let_.origin}-${let_.destinatione}`}
                className="let-kartica">
                <div className="let-info">
                  <h3>Let {let_.flightNumber}</h3>
                  <p>
                    Ruta: {let_.origin} → {let_.destination}
                  </p>
                  <p>
                    Vrijeme: {let_.departureTime} – {let_.arrivalTime}{" "}
                    {let_.dolazakSljedeciDan ? "(dolazak sljedeći dan)" : ""}
                  </p>
                  <p>Cijena: {let_.cijena} €</p>{" "}
                  {let_.avionId && (
                    <p className="avion-info">
                      Avion: {let_.avionId.naziv} ({let_.avionId.model})
                    </p>
                  )}
                </div>

                <button
                  className="rezervisi-dugme"
                  onClick={() =>
                    (window.location.href = "/rezervacija/" + let_._id)
                  }>
                  Rezerviši
                </button>
              </div>
            ))
          : !loading &&
            !error && (
              <div className="no-results">
                Nema dostupnih letova za odabrane kriterije.
              </div>
            )}
      </div>
    </div>
  );
};

export default Letovi;
