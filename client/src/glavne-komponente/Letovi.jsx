import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../kontekst/AuthContext"; // Pretpostavljamo da imate AuthContext

const getBaseUrl = () => {
  return window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://informacioni-sistem-za-aviokompanije.onrender.com";
};

const Letovi = () => {
  const { korisnik } = useAuth(); // Dohvaćamo trenutnog korisnika
  const [letovi, setLetovi] = useState([]);
  const [destinacije, setDestinacije] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aviokompanije, setAviokompanije] = useState([]);

  // Filteri za pretragu letova
  const [filters, setFilters] = useState({
    polaziste: "",
    odrediste: "",
    datumOd: "2025-05-07",
    datumDo: "2025-05-20",
    aviokompanija: "",
    klasa: "Ekonomska",
    vrijemePolaskaOd: "",
    vrijemePolaskaDo: "",
    vrijemeDolaskaOd: "",
    vrijemeDolaskaDo: "",
  });

  const navigate = useNavigate();

  // Funkcija za format vremena (npr. osigurava format "HH:MM")
  const formatTime = (timeStr) => {
    if (!timeStr) return timeStr;
    let [hours, minutes] = timeStr.split(":");
    hours = hours.padStart(2, "0");
    return `${hours}:${minutes}`;
  };

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

  const fetchAviokompanije = async () => {
    try {
      const response = await axios.get(`${getBaseUrl()}/api/aviokompanije`);
      setAviokompanije(response.data || []);
    } catch (err) {
      console.error("Greška pri dohvaćanju aviokompanija:", err);
      setAviokompanije([]);
    }
  };

  // Funkcija za dohvat loyalty discounta za trenutnog korisnika iz baze
  const fetchActiveDiscount = async () => {
    if (!korisnik || !korisnik.id) return 0;
    try {
      const response = await axios.get(`${getBaseUrl()}/api/loyalty`, {
        params: { userId: korisnik.id },
      });
      // Ovdje očekujemo da getLoyalty vraća activeDiscount
      return response.data.activeDiscount || 0;
    } catch (err) {
      console.error("Greška pri dohvatanju loyalty discounta:", err);
      return 0;
    }
  };

  // State koji označava da je pretraga izvršena
  const [hasSearched, setHasSearched] = useState(false);

  // Dohvat letova nakon pretrage – uključuje dohvat activeDiscounta
  const fetchLetovi = async () => {
    try {
      setLoading(true);
      setError(null);

      // Građenje query parametara prema filterima
      const params = {};
      if (filters.polaziste) params.polaziste = filters.polaziste;
      if (filters.odrediste) params.odrediste = filters.odrediste;
      if (filters.datumOd) params.datumOd = filters.datumOd;
      if (filters.datumDo) params.datumDo = filters.datumDo;
      if (filters.aviokompanija) params.aviokompanija = filters.aviokompanija;
      if (filters.klasa) params.klasa = filters.klasa;
      if (filters.vrijemePolaskaOd)
        params.vrijemePolaskaOd = formatTime(filters.vrijemePolaskaOd);
      if (filters.vrijemePolaskaDo)
        params.vrijemePolaskaDo = formatTime(filters.vrijemePolaskaDo);
      if (filters.vrijemeDolaskaOd)
        params.vrijemeDolaskaOd = formatTime(filters.vrijemeDolaskaOd);
      if (filters.vrijemeDolaskaDo)
        params.vrijemeDolaskaDo = formatTime(filters.vrijemeDolaskaDo);

      console.log("Pozivam API sa parametrima:", params);
      const response = await axios.get(`${getBaseUrl()}/api/letovi`, { params });
      console.log("API odgovor:", response.data);

      if (!response.data) {
        throw new Error("Nema podataka o letovima");
      }
      if (!Array.isArray(response.data)) {
        throw new Error("Neočekivani format podataka sa servera");
      }

      // Dohvatamo aktivni discount iz baze
      const activeDiscount = await fetchActiveDiscount();
      console.log("Aktivni loyalty discount:", activeDiscount);

      // Formatiramo letove i primjenjujemo discount na cijenu
      const formattedLetovi = response.data.map((let_) => ({
        _id: let_._id || "",
        polaziste: let_.polaziste || "",
        odrediste: let_.odrediste || "",
        datumPolaska: let_.datumPolaska ? new Date(let_.datumPolaska).toLocaleDateString() : "",
        datumDolaska: let_.datumDolaska ? new Date(let_.datumDolaska).toLocaleDateString() : "",
        vrijemePolaska: let_.vrijemePolaska || "",
        vrijemeDolaska: let_.vrijemeDolaska || "",
        brojLeta: let_.brojLeta || "",
        // Ako postoji aktivni discount, nova cijena = originalna cijena * (1 - activeDiscount)
        cijena: activeDiscount > 0 ? let_.cijena * (1 - activeDiscount) : let_.cijena,
        cijenaBezPopusta: let_.cijenaBezPopusta,
        avionId: let_.avionId
          ? {
              naziv: let_.avionId.naziv || "",
              model: let_.avionId.model || "",
            }
          : null,
        aviokompanija: {
          naziv: let_.aviokompanija?.naziv || let_.aviokompanijaNaziv || "Nepoznata aviokompanija",
          kod: let_.aviokompanija?.kod || let_.aviokompanijaKod || "",
        },
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
    setHasSearched(true);
    fetchLetovi();
  };

  useEffect(() => {
    fetchDestinacije();
    fetchAviokompanije();
    // Letovi se učitavaju tek nakon pretrage
  }, []);

  return (
    <div className="letovi-container">
      <h2>Pretraga Letova</h2>
      <form onSubmit={handleSearch} className="pretraga-forma">
        {/* Prvi red: Polazište, Odredište, Datum od, Datum do */}
        <div className="first-row">
          <div className="form-group">
            <label>Polazište:</label>
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
          <div className="form-group">
            <label>Odredište:</label>
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
        </div>
        {/* Drugi red: Aviokompanija, Vrijeme polaska od, Vrijeme polaska do */}
        <div className="second-row">
          <div className="form-group">
            <label>Aviokompanija:</label>
            <select
              name="aviokompanija"
              value={filters.aviokompanija}
              onChange={handleFilterChange}
              className="input-field select-field"
            >
              <option value="">Sve aviokompanije</option>
              {aviokompanije.map((avio) => (
                <option key={avio._id} value={avio._id}>
                  {avio.naziv} ({avio.kod})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Vrijeme polaska od:</label>
            <input
              type="time"
              name="vrijemePolaskaOd"
              value={filters.vrijemePolaskaOd}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label>Vrijeme polaska do:</label>
            <input
              type="time"
              name="vrijemePolaskaDo"
              value={filters.vrijemePolaskaDo}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>
        </div>
        {/* Treći red: Vrijeme dolaska od, Vrijeme dolaska do, Dugme Pretraži */}
        <div className="third-row">
          <div className="form-group">
            <label htmlFor="klasa">Klasa</label>
            <select id="klasa" name="klasa" value={filters.klasa} onChange={handleFilterChange} required>
              <option value="">-- Odaberite klasu --</option>
              {["Ekonomska", "Biznis", "Prva"].map((klasa) => (
                <option key={klasa} value={klasa}>
                  {klasa}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Vrijeme dolaska od:</label>
            <input
              type="time"
              name="vrijemeDolaskaOd"
              value={filters.vrijemeDolaskaOd}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label>Vrijeme dolaska do:</label>
            <input
              type="time"
              name="vrijemeDolaskaDo"
              value={filters.vrijemeDolaskaDo}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>
        </div>
        <div className="form-group btn-row">
          <button type="submit" className="pretrazi-dugme" disabled={loading}>
            Pretraži
          </button>
        </div>
      </form>
      
      {loading && <div className="loading">Učitavanje...</div>}
      {error && <div className="error">{error}</div>}
      
      {/* Prikaz letova tek nakon pretrage */}
      {hasSearched && (
        <div className="letovi-grid">
          {letovi.length > 0
            ? letovi.map((let_) => (
                <div key={let_._id || `let-${let_.polaziste}-${let_.odrediste}`} className="let-kartica">
                  <div className="let-info">
                    <h3>Let {let_.brojLeta}</h3>
                    <p>
                      Ruta: {let_.polaziste} → {let_.odrediste}
                    </p>
                    <p>
                      Datum: {let_.datumPolaska} - {let_.datumDolaska}
                    </p>
                    <p>
                      Vrijeme: {let_.vrijemePolaska} - {let_.vrijemeDolaska}
                    </p>
                    <p>
                      Cijena {let_.cijenaBezPopusta && "s popustom"}:{" "}
                      {let_.cijenaBezPopusta && (
                        <span className="slanted-strike mr-2">
                          {let_.cijenaBezPopusta} KM
                        </span>
                      )}
                      <span>{let_.cijena.toFixed(2)} KM</span>
                    </p>
                    {let_.aviokompanija && (
                      <p>
                        Aviokompanija: {let_.aviokompanija.naziv}
                        {let_.aviokompanija.kod && ` (${let_.aviokompanija.kod})`}
                      </p>
                    )}
                    {let_.avionId && (
                      <p className="avion-info">
                        Avion: {let_.avionId.naziv} ({let_.avionId.model})
                      </p>
                    )}
                  </div>
                  <button
                    className="rezervisi-dugme"
                    onClick={() =>
                      navigate(`/rezervacija/${let_._id}`, { state: { flight: let_, klasa: filters.klasa } })
                    }
                  >
                    Rezerviši
                  </button>
                </div>
              ))
            : !loading && !error && (
                <div className="no-results">
                  Nema dostupnih letova za odabrane kriterije.
                </div>
              )}
        </div>
      )}
    </div>
  );
};

export default Letovi;
