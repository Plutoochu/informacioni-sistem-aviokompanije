import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../stilovi/App.css";
import { dohvatiDestinacije } from "../pomocne-funkcije/fetch-funkcije";

const getBaseUrl = () => {
  return window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://informacioni-sistem-za-aviokompanije.onrender.com";
};

const Letovi = () => {
  const [letovi, setLetovi] = useState([]);
  const [destinacije, setDestinacije] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Postavljamo filtere i dodajemo i polje za aviokompaniju
  const [filters, setFilters] = useState({
    polaziste: "",
    odrediste: "",
    datumOd: "",
    datumDo: "",
    aviokompanija: "",
    departureFrom: "",
    departureTo: "",
    arrivalFrom: "",
    arrivalTo: "",
  });

  const navigate = useNavigate();

  const fetchDestinacije = async () => {
    try {
      const response = await axios.get(`${getBaseUrl()}/api/letovi/destinacije`);
      const data = response.data;
      if (!Array.isArray(data)) throw new Error("Nepodržan format");
      setDestinacije(data);
    } catch (err) {
      console.error("Greška pri dohvatanju destinacija:", err);
      setError("Greška pri dohvatanju destinacija.");
      setDestinacije([]);
    }
  };

  const generisiCijenu = () => {
    return Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
  };

  const fetchLetovi = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters based on filters
      const params = {};
      if (filters.polaziste) params.polaziste = filters.polaziste;
      if (filters.odrediste) params.odrediste = filters.odrediste;
      if (filters.datumOd) params.datumOd = filters.datumOd;
      if (filters.datumDo) params.datumDo = filters.datumDo;
      if (filters.aviokompanija) params.aviokompanija = filters.aviokompanija;
      if (filters.departureFrom) params.departureFrom = filters.departureFrom;
      if (filters.departureTo) params.departureTo = filters.departureTo;
      if (filters.arrivalFrom) params.arrivalFrom = filters.arrivalFrom;
      if (filters.arrivalTo) params.arrivalTo = filters.arrivalTo;

      console.log("Pozivam API sa parametrima:", params);
      const response = await axios.get(`${getBaseUrl()}/api/letovi`, { params });
      console.log("API odgovor:", response.data);

      if (!response.data) {
        throw new Error("Nema podataka o letovima");
      }
      if (!Array.isArray(response.data)) {
        throw new Error("Neočekivani format podataka sa servera");
      }

      // Formatiramo letove i dodajemo polje aviokompanija
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
        aviokompanija: let_.aviokompanija || "",
      }));

      console.log("Formatirani letovi:", formattedLetovi);
      setLetovi(formattedLetovi);
    } catch (err) {
      console.error("Greška pri dohvatanju letova:", err);
      setError("Došlo je do greške pri učitavanju letova. Molimo pokušajte ponovo.");
      setLetovi([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLetovi();
  };

  useEffect(() => {
    fetchDestinacije();
    fetchLetovi();
  }, []);

  if (letovi.length === 0) {
    return (
      <div className="letovi-container">
        <div className="letovi-card">
          <h2>Trenutno nema dostupnih letova</h2>
          <p>Molimo vas da pokušate kasnije ili kontaktirajte administratora za više informacija.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="letovi-container">
      <h2>Pretraga Letova</h2>
      <form onSubmit={handleSearch} className="pretraga-forma">
        {/* Filter za polazište */}
        <div className="form-group">
          <label>Od:</label>
          <select
            name="polaziste"
            value={filters.polaziste}
            onChange={handleFilterChange}
            className="input-field select-field"
          >
            <option value="">Sva polazista</option>
            {destinacije.map((dest) => (
              <option key={`polaziste-${dest._id}`} value={dest.grad}>
                {dest.grad} - {dest.nazivAerodroma}
              </option>
            ))}
          </select>
        </div>
        {/* Filter za odredište */}
        <div className="form-group">
          <label>Do:</label>
          <select
            name="odrediste"
            value={filters.odrediste}
            onChange={handleFilterChange}
            className="input-field select-field"
          >
            <option value="">Sve destinacije</option>
            {destinacije.map((dest) => (
              <option key={`odrediste-${dest._id}`} value={dest.grad}>
                {dest.grad} - {dest.nazivAerodroma}
              </option>
            ))}
          </select>
        </div>
        {/* Filter za datum */}
        <div className="form-group">
          <label>Datum od:</label>
          <input
            type="date"
            name="datumOd"
            value={filters.datumOd}
            onChange={handleFilterChange}
            className="input-field date-input"
            required
          />
        </div>
        <div className="form-group">
          <label>Datum do:</label>
          <input
            type="date"
            name="datumDo"
            value={filters.datumDo}
            onChange={handleFilterChange}
            className="input-field date-input"
            required
          />
        </div>
        {/* Filter za aviokompaniju */}
        <div className="form-group">
          <label>Aviokompanija:</label>
          <input
            type="text"
            name="aviokompanija"
            value={filters.aviokompanija}
            onChange={handleFilterChange}
            placeholder="Unesite naziv aviokompanije"
            className="input-field"
          />
        </div>
        {/* Filter za vrijeme polaska */}
        <div className="form-group">
          <label>Vrijeme polaska od:</label>
          <input
            type="time"
            name="departureFrom"
            value={filters.departureFrom}
            onChange={handleFilterChange}
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>Vrijeme polaska do:</label>
          <input
            type="time"
            name="departureTo"
            value={filters.departureTo}
            onChange={handleFilterChange}
            className="input-field"
          />
        </div>
        {/* Filter za vrijeme dolaska */}
        <div className="form-group">
          <label>Vrijeme dolaska od:</label>
          <input
            type="time"
            name="arrivalFrom"
            value={filters.arrivalFrom}
            onChange={handleFilterChange}
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>Vrijeme dolaska do:</label>
          <input
            type="time"
            name="arrivalTo"
            value={filters.arrivalTo}
            onChange={handleFilterChange}
            className="input-field"
          />
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
              <div key={let_._id || `let-${let_.origin}-${let_.destination}`} className="let-kartica">
                <div className="let-info">
                  <h3>Let {let_.flightNumber}</h3>
                  <p>
                    Ruta: {let_.origin} → {let_.destination}
                  </p>
                  <p>
                    Vrijeme: {let_.departureTime} – {let_.arrivalTime}{" "}
                    {let_.dolazakSljedeciDan ? "(dolazak sljedeći dan)" : ""}
                  </p>
                  <p>Cijena: {let_.cijena} €</p>
                  {let_.aviokompanija && <p>Aviokompanija: {let_.aviokompanija}</p>}
                  {let_.avionId && (
                    <p className="avion-info">
                      Avion: {let_.avionId.naziv} ({let_.avionId.model})
                    </p>
                  )}
                </div>
                <button
                  className="rezervisi-dugme"
                  onClick={() => navigate(`/rezervacija/${let_._id}`, { state: { flight: let_ } })}
                >
                  Rezerviši
                </button>
              </div>
            ))
          : !loading && !error && <div className="no-results">Nema dostupnih letova za odabrane kriterije.</div>}
      </div>
    </div>
  );
};

export default Letovi;
