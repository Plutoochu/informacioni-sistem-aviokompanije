import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getBaseUrl } from "../pomocne-funkcije/fetch-funkcije";
import "../stilovi/App.css";

const Letovi = () => {
  const [letovi, setLetovi] = useState([]);
  const [destinacije, setDestinacije] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchDestinacije = async () => {
      try {
        const response = await axios.get(`${getBaseUrl()}/api/letovi/destinacije`);
        setDestinacije(response.data);
      } catch (error) {
        console.error("Greška pri dohvatanju destinacija:", error);
        setError("Greška pri dohvatanju destinacija");
      }
    };

    fetchDestinacije();
  }, []);

  useEffect(() => {
    const fetchLetovi = async () => {
      try {
        setLoading(true);
        let url = `${getBaseUrl()}/api/letovi`;
        const params = {};

        if (selectedDestination) {
          params.odrediste = selectedDestination;
        }
        if (selectedDate) {
          params.datumPolaska = selectedDate;
        }

        const response = await axios.get(url, { params });
        
        if (response.data && Array.isArray(response.data)) {
          setLetovi(response.data);
          setError(null);
        } else {
          throw new Error("Neočekivani format podataka sa servera");
        }
      } catch (error) {
        console.error("Greška pri dohvatanju letova:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Greška pri dohvatanju letova"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLetovi();
  }, [selectedDestination, selectedDate]);

  const handleDestinationChange = (event) => {
    setSelectedDestination(event.target.value);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  if (loading) {
    return <div>Učitavanje...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="letovi-container">
      <h2>Pretraga letova</h2>
      <div className="filter-section">
        <select
          value={selectedDestination}
          onChange={handleDestinationChange}
          className="filter-select"
        >
          <option value="">Sve destinacije</option>
          {destinacije.map((destinacija) => (
            <option key={destinacija} value={destinacija}>
              {destinacija}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={selectedDate}
          onChange={handleDateChange}
          placeholder="DD/MM/YYYY"
          className="filter-input"
        />
      </div>

      {letovi.length === 0 ? (
        <div className="no-flights-message">
          Trenutno nema dostupnih letova. Molimo vas da pokušate kasnije ili
          kontaktirajte administratora za više informacija.
        </div>
      ) : (
        <div className="letovi-grid">
          {letovi.map((let_) => (
            <div key={let_._id} className="let-card">
              <h3>
                {let_.polaziste} → {let_.odrediste}
              </h3>
              <p>Datum polaska: {let_.datumPolaska}</p>
              <p>Cijena: {let_.cijena} KM</p>
              <p>
                Avion: {let_.avionId?.naziv} {let_.avionId?.model}
              </p>
              <p>Slobodna mjesta: {let_.brojSlobodnihMjesta}</p>
              {user && (
                <Link
                  to={`/rezervacija/${let_._id}`}
                  className="rezervisi-button"
                >
                  Rezerviši
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Letovi;
