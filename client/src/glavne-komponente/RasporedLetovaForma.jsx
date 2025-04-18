import React, { useState, useEffect } from "react";
import {
  dodajLet,
  azurirajLet,
  dohvatiSveLetove,
  dohvatiOtkazaneLetove,
  otkaziLet,
} from "../pomocne-funkcije/fetch-funkcije";
import "../stilovi/RasporedLetova.css";

const RasporedLetovaForma = ({ flightData }) => {
  const [avioni, setAvioni] = useState([]);
  const [letovi, setLetovi] = useState([]);
  const [destinacije, setDestinacije] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFlightId, setSelectedFlightId] = useState(null);

  const [cancelFromDate, setCancelFromDate] = useState("");
  const [cancelToDate, setCancelToDate] = useState("");
  const [cancelDays, setCancelDays] = useState([]);
  const [otkazaniLetovi, setOtkazaniLetovi] = useState([]);

  const [showCancelForm, setShowCancelForm] = useState(false);
  const [selectedFlightInfo, setSelectedFlightInfo] = useState(null);

  const dani = [
    { value: "1", label: "Ponedjeljak" },
    { value: "2", label: "Utorak" },
    { value: "3", label: "Srijeda" },
    { value: "4", label: "Četvrtak" },
    { value: "5", label: "Petak" },
    { value: "6", label: "Subota" },
    { value: "7", label: "Nedjelja" },
  ];

  const daniSedmice = {
    1: "Pon",
    2: "Uto",
    3: "Sri",
    4: "Čet",
    5: "Pet",
    6: "Sub",
    7: "Ned",
    x: "Ad-hoc",
  };

  const opisRasporeda = (schedule) => {
    if (schedule === "1234567") return "Svaki dan";
    if (schedule.startsWith("x")) {
      const excluded = schedule
        .slice(1)
        .split("")
        .map((d) => daniSedmice[d] || d)
        .join(", ");
      return `Svi dani osim: ${excluded}`;
    }
    return schedule
      .split("")
      .map((char) => daniSedmice[char] || char)
      .join(", ");
  };

  const [formData, setFormData] = useState({
    flightNumber: "",
    departureTime: "",
    arrivalTime: "",
    origin: "",
    destination: "",
    seatConfiguration: "",
    schedule: "",
    validityFrom: "",
    validityTo: "",
    avionId: "",
  });

  useEffect(() => {
    const fetchOtkazani = async () => {
      try {
        const data = await dohvatiOtkazaneLetove();
        setOtkazaniLetovi(data);
      } catch (err) {
        console.error("Greška pri dohvaćanju otkazanih letova:", err);
      }
    };
    fetchOtkazani();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const destRes = await fetch(
          "http://localhost:5000/api/admin/destinacije",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const avionRes = await fetch("http://localhost:5000/api/admin/avioni", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const letoviRes = await dohvatiSveLetove();

        setDestinacije(await destRes.json());
        setAvioni(await avionRes.json());
        setLetovi(letoviRes);
      } catch (err) {
        console.error("Greška pri učitavanju podataka:", err);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (let_) => {
    setFormData({
      flightNumber: let_.flightNumber,
      departureTime: let_.departureTime,
      arrivalTime: let_.arrivalTime,
      origin: let_.origin,
      destination: let_.destination,
      seatConfiguration: let_.seatConfiguration,
      schedule: let_.schedule,
      validityFrom: let_.validityFrom?.slice(0, 10),
      validityTo: let_.validityTo?.slice(0, 10),
      avionId: let_.avionId?._id || let_.avionId,
    });
    setIsEditing(true);
    setSelectedFlightId(let_._id);
  };

  const handleChange = (e) => {
    setErrorMessage("");
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCancelClick = (let_) => {
    setSelectedFlightId(let_._id);
    setSelectedFlightInfo(let_);

    const raspored = let_.schedule.startsWith("x")
      ? "1234567".split("").filter((d) => !let_.schedule.includes(d))
      : let_.schedule.split("");

    setCancelDays(raspored);
    setCancelFromDate(let_.validityFrom?.slice(0, 10) || "");
    setCancelToDate(let_.validityTo?.slice(0, 10) || "");
    setShowCancelForm(true);

    setShowCancelForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && selectedFlightId) {
        await azurirajLet(selectedFlightId, formData);
        alert("Let ažuriran!");
      } else {
        await dodajLet(formData);
        alert("Let dodan!");
      }
      const refreshed = await dohvatiSveLetove();
      setLetovi(refreshed);
      setFormData({
        flightNumber: "",
        departureTime: "",
        arrivalTime: "",
        origin: "",
        destination: "",
        seatConfiguration: "",
        schedule: "",
        validityFrom: "",
        validityTo: "",
        avionId: "",
      });
    } catch (error) {
      console.error("Greška:", error);
      setErrorMessage("Greška pri spremanju podataka.");
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFlightId) {
      alert("Odaberi let koji želiš otkazati.");
      return;
    }

    const cancelPayload = {
      flightId: selectedFlightId,
      from: cancelFromDate,
      to: cancelToDate,
      days: cancelDays,
    };

    try {
      await otkaziLet(cancelPayload);
      alert("Let uspješno otkazan.");
      setShowCancelForm(false);
      const osvjezeniLetovi = await dohvatiSveLetove();
      const otkazani = await dohvatiOtkazaneLetove();
      setLetovi(osvjezeniLetovi);
      setOtkazaniLetovi(otkazani);
    } catch (err) {
      console.error("Greška pri otkazivanju:", err);
      alert("Greška pri otkazivanju leta.");
    }
  };
  const toggleCancelDay = (value) => {
    setCancelDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  return (
    <div className="flight-layout-container">
      {/* Sekcija: Forma za dodavanje/uređivanje */}
      <div className="flight-schedule-form">
        <h2>{isEditing ? "Uredi let" : "Dodaj let"}</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <form onSubmit={handleSubmit}>
          {["flightNumber", "departureTime", "arrivalTime"].map((field) => (
            <div className="form-group" key={field}>
              <label htmlFor={field}>
                {field === "flightNumber"
                  ? "Broj leta"
                  : field === "departureTime"
                  ? "Vrijeme polaska"
                  : "Vrijeme dolaska"}
              </label>
              <input
                type={field.includes("Time") ? "time" : "text"}
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          {["origin", "destination"].map((field) => (
            <div className="form-group" key={field}>
              <label htmlFor={field}>
                {field === "origin" ? "Polazište" : "Odredište"}
              </label>
              <select
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required>
                <option value="">-- Odaberi --</option>
                {destinacije.map((dest) => (
                  <option key={dest._id} value={dest.grad}>
                    {dest.grad} - {dest.nazivAerodroma}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="form-group">
            <label htmlFor="avionId">Avion</label>
            <select
              id="avionId"
              name="avionId"
              value={formData.avionId}
              onChange={handleChange}
              required>
              <option value="">-- Odaberi avion --</option>
              {avioni.map((avion) => (
                <option key={avion._id} value={avion._id}>
                  {avion.naziv} ({avion.model})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Konfiguracija sjedišta</label>
            <input
              type="text"
              name="seatConfiguration"
              value={formData.seatConfiguration}
              onChange={handleChange}
              placeholder="npr. F10C20Y120"
              required
            />
          </div>
          <div className="form-group">
            <label>Raspored (dani letenja)</label>
            <input
              type="text"
              name="schedule"
              value={formData.schedule}
              onChange={handleChange}
              placeholder="1234567 ili x56"
              required
            />
          </div>
          <div className="form-group">
            <label>Važi od - do</label>
            <input
              type="date"
              name="validityFrom"
              value={formData.validityFrom}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="validityTo"
              value={formData.validityTo}
              onChange={handleChange}
              required
            />
          </div>
          <button className="btn-submit" type="submit">
            {isEditing ? "Ažuriraj" : "Spremi"}
          </button>
        </form>
      </div>

      {/* Sekcija: Lista letova */}
      <div className="flight-list">
        <h2>Rasporedi letova</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Let</th>
              <th>Ruta</th>
              <th>Vrijeme</th>
              <th>Avion</th>
              <th>Raspored</th>
              <th>Period</th>
              <th>Status</th>
              <th>Akcija</th>
            </tr>
          </thead>
          <tbody>
            {letovi.map((let_, i) => (
              <tr key={let_._id}>
                <td>{i + 1}</td>
                <td>{let_.flightNumber}</td>
                <td>
                  {let_.origin} → {let_.destination}
                </td>
                <td>
                  {let_.departureTime} - {let_.arrivalTime}
                </td>
                <td>{let_.avionId?.naziv}</td>
                <td>{opisRasporeda(let_.schedule)}</td>
                <td>
                  {let_.validityFrom?.slice(0, 10)} –{" "}
                  {let_.validityTo?.slice(0, 10)}
                </td>
                <td>
                  {otkazaniLetovi.includes(let_._id) ? (
                    <span style={{ color: "red", fontWeight: "bold" }}>
                      Otkazan
                    </span>
                  ) : (
                    <span style={{ color: "green" }}>Aktivan</span>
                  )}
                </td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(let_)}>
                    Uredi
                  </button>
                  <button
                    onClick={() => handleCancelClick(let_)}
                    className="btn-cancel">
                    Otkazi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCancelForm && selectedFlightInfo && (
        <div className="modal-overlay" onClick={() => setShowCancelForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowCancelForm(false)}>
              ✕
            </button>

            <h2>Otkazivanje leta: {selectedFlightInfo.flightNumber}</h2>
            <p>
              Ruta: {selectedFlightInfo.origin} →{" "}
              {selectedFlightInfo.destination}
              <br />
              Period: {selectedFlightInfo.validityFrom?.slice(0, 10)} –{" "}
              {selectedFlightInfo.validityTo?.slice(0, 10)}
            </p>

            {/* forma kao i prije */}
            <form onSubmit={handleCancelSubmit}>
              <div className="form-group">
                <label>Period otkazivanja</label>
                <input
                  type="date"
                  value={cancelFromDate}
                  onChange={(e) => setCancelFromDate(e.target.value)}
                  required
                />
                <input
                  type="date"
                  value={cancelToDate}
                  onChange={(e) => setCancelToDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Dani u sedmici (opcionalno)</label>
                <div className="days-checkboxes">
                  {dani.map((dan) => (
                    <label key={dan.value} style={{ marginRight: "1rem" }}>
                      <input
                        type="checkbox"
                        value={dan.value}
                        checked={cancelDays.includes(dan.value)}
                        onChange={() => toggleCancelDay(dan.value)}
                      />
                      {dan.label}
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-submit">
                Otkazi let
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RasporedLetovaForma;
