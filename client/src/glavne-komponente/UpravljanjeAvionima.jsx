import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router";
import {
  dohvatiSveZrakoplove,
  dodajZrakoplov,
  azurirajZrakoplov,
  obrisiZrakoplov,
  dohvatiTipoveZrakoplova,
} from "../pomocne-funkcije/fetch-funkcije";

import DodajZrakoplovModal from "../glavne-komponente/DodajZrakoplovModal";
import AzurirajZrakoplovModal from "../glavne-komponente/AzurirajZrakoplovModal";
import "../stilovi/UpravljanjeZrakoplovima.css";

const UpravljanjeAvionima = () => {
  const navigate = useNavigate();
  const [zrakoplovi, setZrakoplovi] = useState([]);
  const [tipoviZrakoplova, setTipoviZrakoplova] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDodajModal, setShowDodajModal] = useState(false);
  const [showAzurirajModal, setShowAzurirajModal] = useState(false);
  const [odabraniZrakoplov, setOdabraniZrakoplov] = useState(null);

  // Dohvati sve zrakoplove i tipove zrakoplova
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [zrakoplovData, tipoviData] = await Promise.all([dohvatiSveZrakoplove(), dohvatiTipoveZrakoplova()]);
        setZrakoplovi(zrakoplovData);
        setTipoviZrakoplova(tipoviData);
        setError(null);
      } catch (err) {
        setError("Došlo je do greške prilikom dohvaćanja podataka.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Funkcija za dodavanje novog zrakoplova
  const handleDodajZrakoplov = async (noviZrakoplov) => {
    try {
      const result = await dodajZrakoplov(noviZrakoplov);
      setZrakoplovi([...zrakoplovi, result]);
      setShowDodajModal(false);
    } catch (err) {
      setError("Greška prilikom dodavanja zrakoplova.");
      console.error(err);
    }
  };

  // Funkcija za ažuriranje zrakoplova
  const handleAzurirajZrakoplov = async (id, azuriraniPodaci) => {
    try {
      const result = await azurirajZrakoplov(id, azuriraniPodaci);
      setZrakoplovi(zrakoplovi.map((z) => (z._id === id ? result : z)));
      setShowAzurirajModal(false);
      setOdabraniZrakoplov(null);
    } catch (err) {
      setError("Greška prilikom ažuriranja zrakoplova.");
      console.error(err);
    }
  };

  // Funkcija za brisanje zrakoplova
  const handleObrisiZrakoplov = async (id) => {
    if (window.confirm("Jeste li sigurni da želite obrisati ovaj zrakoplov?")) {
      try {
        await obrisiZrakoplov(id);
        setZrakoplovi(zrakoplovi.filter((z) => z._id !== id));
      } catch (err) {
        setError("Greška prilikom brisanja zrakoplova.");
        console.error(err);
      }
    }
  };

  // Funkcija za otvaranje modala za ažuriranje
  const handleOtvoriAzurirajModal = (zrakoplov) => {
    setOdabraniZrakoplov(zrakoplov);
    setShowAzurirajModal(true);
  };

  // Funkcija za parsiranje konfiguracije sjedala
  const parseKonfiguracijaSjedala = (konfiguracija) => {
    const regex = /([A-Z])(\d+)/g;
    let match;
    const rezultat = [];

    while ((match = regex.exec(konfiguracija)) !== null) {
      const klasa = match[1];
      const brojSjedala = Number.parseInt(match[2]);

      let nazivKlase = "";
      switch (klasa) {
        case "F":
          nazivKlase = "Prva klasa";
          break;
        case "C":
          nazivKlase = "Poslovna klasa";
          break;
        case "Y":
          nazivKlase = "Ekonomska klasa";
          break;
        default:
          nazivKlase = "Nepoznata klasa";
      }

      // Push string format instead of an object
      rezultat.push(`${nazivKlase}: ${brojSjedala} sjedala`);
    }

    // Join the results into a single string (this is important to render valid children)
    return rezultat.join(", ");
  };

  // Izračunaj ukupan broj sjedala
  const izracunajUkupnoSjedala = (konfiguracija) => {
    const regex = /([A-Z])(\d+)/g;
    let match;
    let ukupno = 0;

    while ((match = regex.exec(konfiguracija)) !== null) {
      ukupno += Number.parseInt(match[2]);
    }

    return ukupno;
  };

  return (
    <div className="upravljanje-zrakoplovima-container">
      <h1>Upravljanje Zrakoplovima</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="actions-container">
        <button className="dodaj-zrakoplov-btn" onClick={() => navigate("/avioni")}>
          Dodaj Novi Avion
        </button>
      </div>

      {isLoading ? (
        <div className="loading">Učitavanje...</div>
      ) : (
        <div className="zrakoplovi-tablica-container">
          <table className="zrakoplovi-tablica">
            <thead>
              <tr>
                <th>Naziv</th>
                <th>Konfiguracija Sjedala</th>
                <th>Ukupno Sjedala</th>
                <th>Sjedala po Redu</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {zrakoplovi.length > 0 ? (
                zrakoplovi.map((zrakoplov) => (
                  <tr key={zrakoplov._id}>
                    <td>{zrakoplov.naziv}</td>
                    <td>{parseKonfiguracijaSjedala(zrakoplov.konfiguracijaSjedala)}</td>
                    <td>{izracunajUkupnoSjedala(zrakoplov.konfiguracijaSjedala)}</td>
                    <td>
                      {Object.entries(zrakoplov.sjedalaPoRedu)
                        .map(([klasa, brojSjedala]) => `${klasa}: ${brojSjedala}`)
                        .join(", ")}
                    </td>
                    <td className="akcije-celija">
                      <button className="azuriraj-btn" onClick={() => handleOtvoriAzurirajModal(zrakoplov)}>
                        Ažuriraj
                      </button>
                      <button className="obrisi-btn" onClick={() => handleObrisiZrakoplov(zrakoplov._id)}>
                        Obriši
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="nema-podataka">
                    Nema dostupnih zrakoplova
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal za dodavanje zrakoplova */}
      {showDodajModal && (
        <DodajZrakoplovModal
          tipoviZrakoplova={tipoviZrakoplova}
          onDodaj={handleDodajZrakoplov}
          onClose={() => setShowDodajModal(false)}
        />
      )}

      {/* Modal za ažuriranje zrakoplova */}
      {showAzurirajModal && odabraniZrakoplov && (
        <AzurirajZrakoplovModal
          zrakoplov={odabraniZrakoplov}
          tipoviZrakoplova={tipoviZrakoplova}
          onAzuriraj={(azuriraniPodaci) => handleAzurirajZrakoplov(odabraniZrakoplov._id, azuriraniPodaci)}
          onClose={() => {
            setShowAzurirajModal(false);
            setOdabraniZrakoplov(null);
          }}
        />
      )}
    </div>
  );
};

export default UpravljanjeAvionima;
