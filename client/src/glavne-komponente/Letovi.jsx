import React, { useState, useEffect } from "react";
import axios from "axios";
import "../stilovi/App.css";

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
      if (!response.data) {
        throw new Error("Nema podataka o destinacijama");
      }
      const destinacijeArray = Array.isArray(response.data)
        ? response.data
        : [];
      setDestinacije(destinacijeArray);
    } catch (err) {
      setError("Greška pri dohvatanju destinacija. Molimo pokušajte ponovo.");
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
        polaziste: let_.polaziste || "",
        odrediste: let_.odrediste || "",
        datumPolaska: let_.datumPolaska || "",
        cijena: let_.cijena || 0,
        brojSlobodnihMjesta: let_.brojSlobodnihMjesta || 0,
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
            {destinacije.map((destinacija) => (
              <option key={`dest-${destinacija}`} value={destinacija}>
                {destinacija}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group date-group">
          <div className="date-inputs">
            <input
              type="text"
              name="dan"
              placeholder="DD"
              value={filters.dan}
              onChange={handleFilterChange}
              className="input-field date-input"
              maxLength="2"
            />
            <span className="date-separator">/</span>
            <input
              type="text"
              name="mjesec"
              placeholder="MM"
              value={filters.mjesec}
              onChange={handleFilterChange}
              className="input-field date-input"
              maxLength="2"
            />
            <span className="date-separator">/</span>
            <input
              type="text"
              name="godina"
              placeholder="YYYY"
              value={filters.godina}
              onChange={handleFilterChange}
              className="input-field date-input year-input"
              maxLength="4"
            />
          </div>
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
                key={
                  let_._id ||
                  `let-${let_.polaziste}-${let_.odrediste}-${let_.datumPolaska}`
                }
                className="let-kartica">
                <div className="let-info">
                  <h3>
                    {let_.polaziste || ""} → {let_.odrediste || ""}
                  </h3>
                  <p>Datum polaska: {let_.datumPolaska || ""}</p>
                  <p>Cijena: {let_.cijena || 0} €</p>
                  <p>Slobodna mjesta: {let_.brojSlobodnihMjesta || 0}</p>
                  {let_.avionId && (
                    <p className="avion-info">
                      Avion: {let_.avionId.naziv || ""} (
                      {let_.avionId.model || ""})
                    </p>
                  )}
                </div>
                <button
                  className="rezervisi-dugme"
                  onClick={() =>
                    (window.location.href = "/rezervacija/" + let_._id)
                  }
                  disabled={!let_.brojSlobodnihMjesta}>
                  {!let_.brojSlobodnihMjesta ? "Popunjeno" : "Rezerviši"}
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