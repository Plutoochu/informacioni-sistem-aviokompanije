import React, { useState, useEffect } from "react";
import {
  dodajDestinaciju,
  obrisiDestinaciju,
  dohvatiDestinacije,
  azurirajDestinaciju,
} from "../pomocne-funkcije/fetch-funkcije";
import "../stilovi/Destinacije.css";

const UpravljanjeDestinacijama = () => {
  const [grad, setGrad] = useState("");
  const [naziv, setNaziv] = useState("");
  const [iata, setIATA] = useState("");
  const [icao, setICAO] = useState("");
  const [destinacije, setDestinacije] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const fetchDestinacije = async () => {
      try {
        const podaci = await dohvatiDestinacije();
        setDestinacije(podaci);
      } catch (err) {
        console.error("Greška pri dohvaćanju destinacija:", err);
      }
    };

    fetchDestinacije();
  }, []);

  const resetForm = () => {
    setGrad("");
    setNaziv("");
    setIATA("");
    setICAO("");
    setEditId(null);
  };

  const handleDodajIliAzuriraj = async () => {
    if (!grad || !naziv || !iata || !icao) {
      return alert("Popuni sva polja!");
    }

    const novaDestinacija = {
      grad,
      nazivAerodroma: naziv,
      IATA: iata.toUpperCase(),
      ICAO: icao.toUpperCase(),
    };

    try {
      if (editId) {
        const azurirano = await azurirajDestinaciju(editId, novaDestinacija);
        setDestinacije((prev) => prev.map((d) => (d._id === editId ? azurirano : d)));
      } else {
        const dodana = await dodajDestinaciju(novaDestinacija);
        setDestinacije([...destinacije, dodana]);
      }

      resetForm();
    } catch (err) {
      console.error("Greška pri spremanju destinacije:", err);
    }
  };

  const handleBrisanje = async (id) => {
    try {
      await obrisiDestinaciju(id);
      setDestinacije(destinacije.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Greška pri brisanju destinacije:", err);
    }
  };

  const handleEdit = (destinacija) => {
    setGrad(destinacija.grad);
    setNaziv(destinacija.nazivAerodroma);
    setIATA(destinacija.IATA);
    setICAO(destinacija.ICAO);
    setEditId(destinacija._id);
  };

  return (
    <div className="destination-container">
      <h2>Upravljanje destinacijama</h2>

      <div className="form-container">
        <input type="text" placeholder="Grad" value={grad} onChange={(e) => setGrad(e.target.value)} />
        <input type="text" placeholder="Naziv aerodroma" value={naziv} onChange={(e) => setNaziv(e.target.value)} />
        <input
          type="text"
          placeholder="IATA kod (npr. SJJ)"
          value={iata}
          onChange={(e) => setIATA(e.target.value.toUpperCase())}
        />
        <input
          type="text"
          placeholder="ICAO kod (npr. LQSA)"
          value={icao}
          onChange={(e) => setICAO(e.target.value.toUpperCase())}
        />
        <button onClick={handleDodajIliAzuriraj}>{editId ? "Ažuriraj" : "Dodaj"} destinaciju</button>
      </div>

      <h3>Postojeće destinacije</h3>
      <div className="destination-list">
        {destinacije.map((d) => (
          <div key={d._id} className="destination-card">
            <div className="destination-info">
              <p>
                <strong>{d.grad}</strong>
              </p>
              <p>{d.nazivAerodroma}</p>
              <p>
                {d.IATA} / {d.ICAO}
              </p>
            </div>
            <div className="destination-actions">
              <button className="edit" onClick={() => handleEdit(d)}>
                Uredi
              </button>
              <button className="delete" onClick={() => handleBrisanje(d._id)}>
                Obriši
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpravljanjeDestinacijama;
