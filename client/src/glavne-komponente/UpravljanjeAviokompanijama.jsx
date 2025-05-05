import React, { useState, useEffect } from "react";
import {
  dodajAviokompaniju,
  obrisiAviokompaniju,
  dohvatiAviokompanije,
  azurirajAviokompaniju,
} from "../pomocne-funkcije/fetch-funkcije";
import "../stilovi/Aviokompanije.css";

const UpravljanjeAviokompanijama = () => {
  const [naziv, setNaziv] = useState("");
  const [kod, setKod] = useState("");
  const [aviokompanije, setAviokompanije] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const fetchAviokompanije = async () => {
      try {
        const podaci = await dohvatiAviokompanije();
        setAviokompanije(podaci);
      } catch (err) {
        console.error("Greška pri dohvaćanju aviokompanija:", err);
      }
    };

    fetchAviokompanije();
  }, []);

  const resetForm = () => {
    setNaziv("");
    setKod("");
    setEditId(null);
  };

  const handleDodajIliAzuriraj = async () => {
    if (!naziv || !kod) {
      return alert("Popuni sva polja!");
    }

    const novaAviokompanija = {
      naziv,
      kod: kod.toUpperCase(),
    };

    try {
      if (editId) {
        const azurirano = await azurirajAviokompaniju(editId, novaAviokompanija);
        setAviokompanije((prev) => prev.map((a) => (a._id === editId ? azurirano : a)));
      } else {
        const dodana = await dodajAviokompaniju(novaAviokompanija);
        setAviokompanije([...aviokompanije, dodana]);
      }

      resetForm();
    } catch (err) {
      console.error("Greška pri spremanju aviokompanije:", err);
    }
  };

  const handleBrisanje = async (id) => {
    try {
      await obrisiAviokompaniju(id);
      setAviokompanije(aviokompanije.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Greška pri brisanju aviokompanije:", err);
    }
  };

  const handleEdit = (aviokompanija) => {
    setNaziv(aviokompanija.naziv);
    setKod(aviokompanija.kod);
    setEditId(aviokompanija._id);
  };

  return (
    <div className="avio-container">
      <h2>Upravljanje aviokompanijama</h2>

      <div className="form-container">
        <input 
          type="text" 
          placeholder="Naziv aviokompanije" 
          value={naziv} 
          onChange={(e) => setNaziv(e.target.value)} 
        />
        <input
          type="text"
          placeholder="Kod aviokompanije (npr. JU, LH)"
          value={kod}
          onChange={(e) => setKod(e.target.value.toUpperCase())}
          maxLength="3"
        />
        <button onClick={handleDodajIliAzuriraj}>
          {editId ? "Ažuriraj" : "Dodaj"} aviokompaniju
        </button>
      </div>

      <h3>Postojeće aviokompanije</h3>
      <div className="avio-list">
        {aviokompanije.map((a) => (
          <div key={a._id} className="avio-card">
            <div className="avio-info">
              <p>
                <strong>{a.naziv}</strong>
              </p>
              <p>Kod: {a.kod}</p>
            </div>
            <div className="avio-actions">
              <button className="edit" onClick={() => handleEdit(a)}>
                Uredi
              </button>
              <button className="delete" onClick={() => handleBrisanje(a._id)}>
                Obriši
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpravljanjeAviokompanijama;