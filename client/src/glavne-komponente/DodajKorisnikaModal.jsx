import { useState } from "react";
import "../stilovi/DodajKorisnikaModal.css";

const DodajKorisnikaModal = ({ otvoren, onZatvori, onDodajKorisnika }) => {
  const [forma, setForma] = useState({
    ime: "",
    prezime: "",
    email: "",
    lozinka: "",
    role: "kupac",
    telefon: "",
  });

  const [greska, setGreska] = useState("");

  const handleChange = (e) => {
    setForma({ ...forma, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!forma.ime || !forma.prezime || !forma.email || !forma.lozinka) {
      setGreska("Molimo popunite sva obavezna polja.");
      return;
    }
    try {
      await onDodajKorisnika(forma);
      onZatvori();
      setForma({
        ime: "",
        prezime: "",
        email: "",
        lozinka: "",
        role: "kupac",
        telefon: "",
      });
      setGreska("");
    } catch (err) {
      setGreska("Došlo je do greške pri dodavanju korisnika.");
    }
  };

  if (!otvoren) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Dodaj korisnika</h2>
        {greska && <p className="error-message">{greska}</p>}
        <form onSubmit={handleSubmit}>
          <input name="ime" placeholder="Ime *" value={forma.ime} onChange={handleChange} />
          <input name="prezime" placeholder="Prezime *" value={forma.prezime} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email *" value={forma.email} onChange={handleChange} />
          <input name="lozinka" type="password" placeholder="Lozinka *" value={forma.lozinka} onChange={handleChange} />
          <input name="telefon" placeholder="Telefon" value={forma.telefon} onChange={handleChange} />
          <select name="role" value={forma.role} onChange={handleChange}>
            <option value="kupac">Kupac</option>
            <option value="admin">Admin</option>
          </select>
          <div className="modal-buttons">
            <button type="button" onClick={onZatvori} className="cancel-btn">
              Otkaži
            </button>
            <button type="submit" className="submit-btn">
              Dodaj korisnika
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DodajKorisnikaModal;
