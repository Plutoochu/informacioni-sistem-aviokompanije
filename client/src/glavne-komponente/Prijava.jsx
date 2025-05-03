import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../kontekst/AuthContext";

const Prijava = () => {
  const [formData, setFormData] = useState({
    email: "",
    lozinka: "",
  });
  const [greska, setGreska] = useState("");
  const { prijaviKorisnika } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGreska("");

    if (!formData.email || !formData.lozinka) {
      setGreska("Molimo popunite sva polja");
      return;
    }

    const rezultat = await prijaviKorisnika(formData.email, formData.lozinka);
    if (!rezultat.uspjesno) {
      setGreska(rezultat.poruka || "Došlo je do greške prilikom prijave");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Prijava</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Unesite email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="lozinka">Lozinka</label>
            <input
              type="password"
              id="lozinka"
              value={formData.lozinka}
              onChange={(e) => setFormData({ ...formData, lozinka: e.target.value })}
              placeholder="Unesite lozinku"
            />
          </div>
          {greska && <div className="error-message">{greska}</div>}
          <button type="submit" className="auth-button">
            Prijavi se
          </button>
          <div className="link-container">
            <span>Zaboravili ste lozinku? </span>
            <span className="link" onClick={() => navigate("/forgot-password")}>
              Resetujte je
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Prijava;
