import { useState, useEffect } from "react";
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

    const novaAviokompanija = { naziv, kod: kod.toUpperCase() };

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
      <h1 className="text-3xl">Upravljanje aviokompanijama</h1>
      <div className="form-container">
        <input type="text" placeholder="Naziv aviokompanije" value={naziv} onChange={(e) => setNaziv(e.target.value)} />
        <input
          type="text"
          placeholder="Kod aviokompanije (npr. JU, LH)"
          value={kod}
          onChange={(e) => setKod(e.target.value.toUpperCase())}
          maxLength="3"
        />
        <button onClick={handleDodajIliAzuriraj}>{editId ? "Ažuriraj" : "Dodaj"} aviokompaniju</button>
      </div>

      <h1 className="text-3xl">Lista aviokompanija</h1>
      {aviokompanije.length === 0 ? (
        <p>Trenutno nema aviokompanija.</p>
      ) : (
        <div className="avio-table-wrapper">
          <table className="avio-table">
            <thead>
              <tr>
                <th>Naziv</th>
                <th>Kod</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {aviokompanije.map((a) => (
                <tr key={a._id}>
                  <td>{a.naziv}</td>
                  <td>{a.kod}</td>
                  <td>
                    <button className="avio-btn edit" onClick={() => handleEdit(a)}>
                      Uredi
                    </button>
                    <button
                      className="avio-btn delete"
                      onClick={() =>
                        window.confirm("Jeste li sigurni da želite obrisati ovu aviokompaniju?") &&
                        handleBrisanje(a._id)
                      }
                    >
                      Obriši
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UpravljanjeAviokompanijama;
