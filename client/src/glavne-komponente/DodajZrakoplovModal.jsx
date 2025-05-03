"use client";

import { useState } from "react";
import "../stilovi/Modal.css";

const DodajZrakoplovModal = ({ tipoviZrakoplova, onDodaj, onClose }) => {
  const [formData, setFormData] = useState({
    tip: "",
    registracijskiBroj: "",
    konfiguracijaSjedala: {
      F: 0, // Prva klasa
      C: 0, // Poslovna klasa
      Y: 0, // Ekonomska klasa
    },
    sjedalaPoRedu: {
      F: 0, // Sjedala po redu u prvoj klasi
      C: 0, // Sjedala po redu u poslovnoj klasi
      Y: 0, // Sjedala po redu u ekonomskoj klasi
    },
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("konfiguracija")) {
      const klasa = name.split("-")[1]; // npr. "konfiguracija-F" -> "F"
      setFormData({
        ...formData,
        konfiguracijaSjedala: {
          ...formData.konfiguracijaSjedala,
          [klasa]: Number.parseInt(value) || 0,
        },
      });
    } else if (name.startsWith("sjedalaPoRedu")) {
      const klasa = name.split("-")[1]; // npr. "sjedalaPoRedu-F" -> "F"
      setFormData({
        ...formData,
        sjedalaPoRedu: {
          ...formData.sjedalaPoRedu,
          [klasa]: Number.parseInt(value) || 0,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tip) {
      newErrors.tip = "Tip zrakoplova je obavezan";
    }

    if (!formData.registracijskiBroj) {
      newErrors.registracijskiBroj = "Registracijski broj je obavezan";
    }

    // Provjeri da barem jedna klasa ima sjedala
    const ukupnoSjedala =
      formData.konfiguracijaSjedala.F + formData.konfiguracijaSjedala.C + formData.konfiguracijaSjedala.Y;

    if (ukupnoSjedala === 0) {
      newErrors.konfiguracija = "Zrakoplov mora imati barem jednu konfiguraciju sjedala";
    }

    // Provjeri da svaka klasa koja ima sjedala ima i definiran broj sjedala po redu
    if (formData.konfiguracijaSjedala.F > 0 && formData.sjedalaPoRedu.F === 0) {
      newErrors.sjedalaPoReduF = "Morate definirati broj sjedala po redu za prvu klasu";
    }

    if (formData.konfiguracijaSjedala.C > 0 && formData.sjedalaPoRedu.C === 0) {
      newErrors.sjedalaPoReduC = "Morate definirati broj sjedala po redu za poslovnu klasu";
    }

    if (formData.konfiguracijaSjedala.Y > 0 && formData.sjedalaPoRedu.Y === 0) {
      newErrors.sjedalaPoReduY = "Morate definirati broj sjedala po redu za ekonomsku klasu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Kreiraj string konfiguracije sjedala (npr. "F10C20Y120")
    let konfiguracijaString = "";
    if (formData.konfiguracijaSjedala.F > 0) {
      konfiguracijaString += `F${formData.konfiguracijaSjedala.F}`;
    }
    if (formData.konfiguracijaSjedala.C > 0) {
      konfiguracijaString += `C${formData.konfiguracijaSjedala.C}`;
    }
    if (formData.konfiguracijaSjedala.Y > 0) {
      konfiguracijaString += `Y${formData.konfiguracijaSjedala.Y}`;
    }

    // Kreiraj naziv zrakoplova (tip + registracijski broj)
    const naziv = `${formData.tip} ${formData.registracijskiBroj}`;

    // Pripremi podatke za slanje
    const noviZrakoplov = {
      naziv,
      tip: formData.tip,
      registracijskiBroj: formData.registracijskiBroj,
      konfiguracijaSjedala: konfiguracijaString,
      sjedalaPoRedu: {
        F: formData.sjedalaPoRedu.F,
        C: formData.sjedalaPoRedu.C,
        Y: formData.sjedalaPoRedu.Y,
      },
    };

    onDodaj(noviZrakoplov);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Dodaj Novi Zrakoplov</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="tip">Tip Zrakoplova:</label>
            <select
              id="tip"
              name="tip"
              value={formData.tip}
              onChange={handleChange}
              className={errors.tip ? "error" : ""}
            >
              <option value="">Odaberite tip zrakoplova</option>
              {tipoviZrakoplova.map((tip) => (
                <option key={tip.kod} value={tip.kod}>
                  {tip.naziv} ({tip.kod})
                </option>
              ))}
            </select>
            {errors.tip && <div className="error-text">{errors.tip}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="registracijskiBroj">Registracijski Broj:</label>
            <input
              type="text"
              id="registracijskiBroj"
              name="registracijskiBroj"
              value={formData.registracijskiBroj}
              onChange={handleChange}
              className={errors.registracijskiBroj ? "error" : ""}
              placeholder="npr. OU-ABC"
            />
            {errors.registracijskiBroj && <div className="error-text">{errors.registracijskiBroj}</div>}
          </div>

          <h3>Konfiguracija Sjedala</h3>
          {errors.konfiguracija && <div className="error-text">{errors.konfiguracija}</div>}

          <div className="konfiguracija-container">
            <div className="konfiguracija-grupa">
              <h4>Prva Klasa (F)</h4>
              <div className="form-group">
                <label htmlFor="konfiguracija-F">Broj Sjedala:</label>
                <input
                  type="number"
                  id="konfiguracija-F"
                  name="konfiguracija-F"
                  value={formData.konfiguracijaSjedala.F}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="sjedalaPoRedu-F">Sjedala po Redu:</label>
                <input
                  type="number"
                  id="sjedalaPoRedu-F"
                  name="sjedalaPoRedu-F"
                  value={formData.sjedalaPoRedu.F}
                  onChange={handleChange}
                  min="0"
                  className={errors.sjedalaPoReduF ? "error" : ""}
                />
                {errors.sjedalaPoReduF && <div className="error-text">{errors.sjedalaPoReduF}</div>}
              </div>
            </div>

            <div className="konfiguracija-grupa">
              <h4>Poslovna Klasa (C)</h4>
              <div className="form-group">
                <label htmlFor="konfiguracija-C">Broj Sjedala:</label>
                <input
                  type="number"
                  id="konfiguracija-C"
                  name="konfiguracija-C"
                  value={formData.konfiguracijaSjedala.C}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="sjedalaPoRedu-C">Sjedala po Redu:</label>
                <input
                  type="number"
                  id="sjedalaPoRedu-C"
                  name="sjedalaPoRedu-C"
                  value={formData.sjedalaPoRedu.C}
                  onChange={handleChange}
                  min="0"
                  className={errors.sjedalaPoReduC ? "error" : ""}
                />
                {errors.sjedalaPoReduC && <div className="error-text">{errors.sjedalaPoReduC}</div>}
              </div>
            </div>

            <div className="konfiguracija-grupa">
              <h4>Ekonomska Klasa (Y)</h4>
              <div className="form-group">
                <label htmlFor="konfiguracija-Y">Broj Sjedala:</label>
                <input
                  type="number"
                  id="konfiguracija-Y"
                  name="konfiguracija-Y"
                  value={formData.konfiguracijaSjedala.Y}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="sjedalaPoRedu-Y">Sjedala po Redu:</label>
                <input
                  type="number"
                  id="sjedalaPoRedu-Y"
                  name="sjedalaPoRedu-Y"
                  value={formData.sjedalaPoRedu.Y}
                  onChange={handleChange}
                  min="0"
                  className={errors.sjedalaPoReduY ? "error" : ""}
                />
                {errors.sjedalaPoReduY && <div className="error-text">{errors.sjedalaPoReduY}</div>}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Odustani
            </button>
            <button type="submit" className="submit-btn">
              Dodaj Zrakoplov
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DodajZrakoplovModal;
