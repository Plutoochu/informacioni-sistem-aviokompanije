import React, { useState, useEffect } from "react";
import axios from "axios";
import "../stilovi/AvioniForma.css";
import "../stilovi/App.css";

const getBaseUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }
  return "https://informacioni-sistem-za-aviokompanije.onrender.com";
};

const AvioniForma = () => {
  const [avioni, setAvioni] = useState([]);
  const [formData, setFormData] = useState({
    naziv: "",
    model: "",
    tip: "",
    registracijskiBroj: "",
    konfiguracijaSjedala: "",
    brojSjedista: "",
    status: "aktivan",
    sjedalaPoRedu: {
      F: 0,
      C: 0,
      Y: 0,
    },
  });

  useEffect(() => {
    dohvatiAvione();
  }, []);

  const dohvatiAvione = async () => {
    try {
      const response = await axios.get(`${getBaseUrl()}/api/avioni`);
      setAvioni(response.data);
    } catch (error) {
      console.error("Greška pri dohvatanju aviona:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSjedalaChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      sjedalaPoRedu: {
        ...prev.sjedalaPoRedu,
        [name]: parseInt(value) || 0,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${getBaseUrl()}/api/avioni`, formData);
      dohvatiAvione();
      setFormData({
        naziv: "",
        model: "",
        tip: "",
        registracijskiBroj: "",
        konfiguracijaSjedala: "",
        brojSjedista: "",
        status: "aktivan",
        sjedalaPoRedu: {
          F: 0,
          C: 0,
          Y: 0,
        },
      });
    } catch (error) {
      console.error("Greška pri dodavanju aviona:", error);
    }
  };

  return (
    <div className="avioni-container">
      <h2>Upravljanje avionima</h2>

      <form onSubmit={handleSubmit} className="avioni-forma">
        <div className="form-group">
          <label>Naziv:</label>
          <input type="text" name="naziv" value={formData.naziv} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Model:</label>
          <input type="text" name="model" value={formData.model} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Tip:</label>
          <input type="text" name="tip" value={formData.tip} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Registracijski broj:</label>
          <input
            type="text"
            name="registracijskiBroj"
            value={formData.registracijskiBroj}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Konfiguracija sjedala (npr. F10C20Y120):</label>
          <input
            type="text"
            name="konfiguracijaSjedala"
            value={formData.konfiguracijaSjedala}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Broj sjedista:</label>
          <input type="number" name="brojSjedista" value={formData.brojSjedista} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Status:</label>
          <select name="status" value={formData.status} onChange={handleChange} required>
            <option value="aktivan">Aktivan</option>
            <option value="neaktivan">Neaktivan</option>
            <option value="u održavanju">U održavanju</option>
          </select>
        </div>

        <div className="sjedala-container">
          <h3>Broj sjedala po klasi:</h3>
          <div className="form-group">
            <label>First Class (F):</label>
            <input type="number" name="F" value={formData.sjedalaPoRedu.F} onChange={handleSjedalaChange} />
          </div>
          <div className="form-group">
            <label>Business Class (C):</label>
            <input type="number" name="C" value={formData.sjedalaPoRedu.C} onChange={handleSjedalaChange} />
          </div>
          <div className="form-group">
            <label>Economy Class (Y):</label>
            <input type="number" name="Y" value={formData.sjedalaPoRedu.Y} onChange={handleSjedalaChange} />
          </div>
        </div>

        <button type="submit" className="submit-button">
          Dodaj avion
        </button>
      </form>

      <div className="avioni-list">
        <h3>Lista aviona:</h3>
        <table>
          <thead>
            <tr>
              <th>Naziv</th>
              <th>Model</th>
              <th>Tip</th>
              <th>Reg. broj</th>
              <th>Status</th>
              <th>Sjedala</th>
            </tr>
          </thead>
          <tbody>
            {avioni.map((avion) => (
              <tr key={avion._id}>
                <td>{avion.naziv}</td>
                <td>{avion.model}</td>
                <td>{avion.tip}</td>
                <td>{avion.registracijskiBroj}</td>
                <td>{avion.status}</td>
                <td>
                  F:{avion.sjedalaPoRedu.F} C:{avion.sjedalaPoRedu.C} Y:
                  {avion.sjedalaPoRedu.Y}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AvioniForma;
