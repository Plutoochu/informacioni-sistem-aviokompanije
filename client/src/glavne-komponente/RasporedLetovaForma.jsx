import React, { useState, useEffect } from "react";
import {
  dodajLet,
  azurirajLet,
  dohvatiSveLetove,
  otkaziLet,
  dohvatiOtkazaneLetove,
  dohvatiSveZrakoplove,
  dohvatiDestinacije,
  aktivirajLet,
} from "../pomocne-funkcije/fetch-funkcije";
import "../stilovi/RasporedLetova.css";

const RasporedLetovaForma = ({ flightData }) => {
  const [avioni, setAvioni] = useState([]);
  const [letovi, setLetovi] = useState([]);
  const [destinacije, setDestinacije] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFlightId, setSelectedFlightId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelFromDate, setCancelFromDate] = useState("");
  const [cancelToDate, setCancelToDate] = useState("");
  const [cancelDays, setCancelDays] = useState([]);
  const [selectedFlightForCancel, setSelectedFlightForCancel] = useState(null);
  const [otkazaniLetovi, setOtkazaniLetovi] = useState([]);

  const handleCancelClick = (let_) => {
    if (let_.schedule) {
      setSelectedFlightForCancel(let_);
      setCancelFromDate(let_.validityFrom?.slice(0, 10));
      setCancelToDate(let_.validityTo?.slice(0, 10));
      setCancelDays(let_.schedule.split(""));
      setShowCancelModal(true);
    } else {
      console.error("Raspored nije definiran za ovaj let.");
    }
  };

  const handleDayCheckboxChange = (e) => {
    const value = e.target.value;
    setCancelDays((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]));
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    try {
      await otkaziLet({
        flightId: selectedFlightForCancel._id,
        from: cancelFromDate,
        to: cancelToDate,
        days: cancelDays,
      });

      alert("Let uspješno otkazan.");
      setShowCancelModal(false);
      setCancelDays([]);
      setCancelFromDate("");
      setCancelToDate("");

      const otkazaniRes = await dohvatiOtkazaneLetove();

      const updatedLet = letovi.map((let_) => (let_._id === let_._id ? { ...let_, status: "Aktivan" } : let_));
      setLetovi(updatedLet);
      setOtkazaniLetovi(otkazaniRes);
    } catch (err) {
      console.error(err);
      alert("Došlo je do greške prilikom otkazivanja.");
    }
  };

  const handleReactivateFlight = async (let_) => {
    try {
      const otkazani = otkazaniLetovi.filter((o) => o.flightId === let_._id);

      for (const o of otkazani) {
        await aktivirajLet({
          flightId: o.flightId,
          from: o.from,
          to: o.to,
          days: o.days,
        });
      }

      alert("Let je ponovo aktiviran.");

      const otkazaniRes = await dohvatiOtkazaneLetove();

      const updatedLet = letovi.map((let_) => (let_._id === let_._id ? { ...let_, status: "Aktivan" } : let_));
      setLetovi(updatedLet);
      setOtkazaniLetovi(otkazaniRes);
    } catch (err) {
      alert("Greška pri aktiviranju leta.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const destRes = await dohvatiDestinacije();
        const avionRes = await dohvatiSveZrakoplove();
        const letoviRes = await dohvatiSveLetove();
        const otkazaniRes = await dohvatiOtkazaneLetove();

        // Filtriranje letova koji imaju važeće podatke
        const validLetovi = letoviRes.filter((let_) => {
          return (
            let_.flightNumber &&
            let_.schedule &&
            let_.departureTime &&
            let_.arrivalTime &&
            let_.origin &&
            let_.destination
          );
        });

        setDestinacije(destRes);
        setAvioni(avionRes);
        setLetovi(validLetovi); // Set filtered list
        setOtkazaniLetovi(otkazaniRes);
      } catch (err) {
        console.error("Greška pri učitavanju podataka:", err);
      }
    };

    fetchData();
  }, []);

  const isFlightCanceled = (let_) => {
    // Ensure schedule exists before using it
    if (!let_.schedule) {
      return false; // Return false or any other fallback value you prefer
    }

    const letId = let_._id;
    const validityStart = new Date(let_.validityFrom);
    const validityEnd = new Date(let_.validityTo);
    const daysInSchedule = let_.schedule.split(""); // Now it's safe to call split

    return otkazaniLetovi.some((otkazan) => {
      const from = new Date(otkazan.from);
      const to = new Date(otkazan.to);
      const hasOverlap = from <= validityEnd && to >= validityStart;

      const hasDayMatch = otkazan.days.some((day) => daysInSchedule.includes(day));

      return otkazan.flightId === letId && hasOverlap && hasDayMatch;
    });
  };

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
    if (!schedule) {
      return "Nema rasporeda"; // Return a default message if schedule is not available
    }

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
    dolazakSljedeciDan: false,
    aviokompanija: "",
  });

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
      dolazakSljedeciDan: false,
      aviokompanija: let_.aviokompanija || "",
    });
    setIsEditing(true);
    setSelectedFlightId(let_._id);
    setShowForm(true);
  };

  const handleChange = (e) => {
    setErrorMessage("");
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isTimeValid = (start, end, nextDay) => {
      const toMinutes = (t) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };
      const startMin = toMinutes(start);
      const endMin = toMinutes(end);

      return nextDay ? true : endMin > startMin;
    };

    if (!isTimeValid(formData.departureTime, formData.arrivalTime, formData.dolazakSljedeciDan)) {
      setErrorMessage("Vrijeme dolaska mora biti nakon polaska (ili označi dolazak sljedeći dan).");
      return;
    }

    try {
      if (isEditing && selectedFlightId) {
        await azurirajLet(selectedFlightId, formData);
        alert("Let ažuriran!");
      } else {
        await dodajLet(formData);
        alert("Let dodan!");
      }
      const letoviRes = await dohvatiSveLetove();
      const validLetovi = letoviRes.filter((let_) => {
        return (
          let_.flightNumber &&
          let_.schedule &&
          let_.departureTime &&
          let_.arrivalTime &&
          let_.origin &&
          let_.destination
        );
      });
      setLetovi(validLetovi);
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
        aviokompanija: "",
      });
      setErrorMessage(""); // Očisti eventualnu staru poruku
    } catch (error) {
      console.error("Greška:", error);

      const backendMessage = error.response?.data?.message || error.message || "Greška pri dodavanju.";

      setErrorMessage(backendMessage);
    }
  };

  return (
    <div className="flight-layout-container">
      {/* Sekcija: Forma za dodavanje/uređivanje */}
      {showForm && (
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
                  step="60"
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="dolazakSljedeciDan"
                  checked={formData.dolazakSljedeciDan}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dolazakSljedeciDan: e.target.checked,
                    }))
                  }
                />{" "}
                Dolazak sljedeći dan
              </label>
            </div>
            {["origin", "destination"].map((field) => (
              <div className="form-group" key={field}>
                <label htmlFor={field}>{field === "origin" ? "Polazište" : "Odredište"}</label>
                <select id={field} name={field} value={formData[field]} onChange={handleChange} required>
                  <option value="">-- Odaberi --</option>
                  {destinacije.map((dest) => (
                    <option key={dest._id} value={dest.grad}>
                      {dest.grad} - {dest.nazivAerodroma}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {/* NOVO polje za unos naziv aviokompanije */}
            <div className="form-group">
              <label htmlFor="aviokompanija">Aviokompanija</label>
              <input
                type="text"
                id="aviokompanija"
                name="aviokompanija"
                value={formData.aviokompanija}
                onChange={handleChange}
                placeholder="Unesite naziv aviokompanije"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="avionId">Avion</label>
              <select id="avionId" name="avionId" value={formData.avionId} onChange={handleChange} required>
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
              <input type="date" name="validityFrom" value={formData.validityFrom} onChange={handleChange} required />
              <input type="date" name="validityTo" value={formData.validityTo} onChange={handleChange} required />
            </div>
            <button className="btn-submit" type="submit">
              {isEditing ? "Ažuriraj" : "Spremi"}
            </button>
            <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
              Otkaži
            </button>
          </form>
        </div>
      )}

      {/* Sekcija: Lista letova */}
      <div className="flight-list">
        <button
          className="btn-add"
          onClick={() => {
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
              dolazakSljedeciDan: false,
            });
            setIsEditing(false);
            setSelectedFlightId(null);
            setErrorMessage("");
            setShowForm(true);
          }}
        >
          Dodaj let
        </button>
        <h2>Rasporedi letova</h2>
        {letovi.length === 0 ? (
          <p>Nema letova s važećim podacima.</p> // Prikazuj poruku ako nema validnih letova
        ) : (
          <table>
            <thead>
              <tr>
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
                  <td>{let_.flightNumber || "N/A"}</td>
                  <td>
                    {let_.origin} → {let_.destination}
                  </td>
                  <td>
                    {let_.departureTime && let_.arrivalTime ? `${let_.departureTime} - ${let_.arrivalTime}` : "N/A"}
                  </td>
                  <td>{let_.avionId?.naziv || "N/A"}</td>
                  <td>{let_.schedule ? opisRasporeda(let_.schedule) : "Nema rasporeda"}</td>
                  <td>
                    {let_.validityFrom ? let_.validityFrom.slice(0, 10) : "N/A"} –{" "}
                    {let_.validityTo ? let_.validityTo.slice(0, 10) : "N/A"}
                  </td>
                  <td className={isFlightCanceled(let_) ? "flight-canceled" : "flight-active"}>
                    {isFlightCanceled(let_) ? "Otkazan" : "Aktivan"}
                  </td>
                  <td>
                    {isFlightCanceled(let_) ? (
                      <button className="btn-add" onClick={() => handleReactivateFlight(let_)}>
                        Aktiviraj
                      </button>
                    ) : (
                      <>
                        <button className="btn-edit" onClick={() => handleEdit(let_)}>
                          Uredi
                        </button>
                        <button onClick={() => handleCancelClick(let_)} className="btn-cancel">
                          Otkazi
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Otkazivanje leta</h3>
            <form onSubmit={handleCancelSubmit}>
              <p>
                <strong>{selectedFlightForCancel?.origin}</strong> →{" "}
                <strong>{selectedFlightForCancel?.destination}</strong>
                <br />
                Vrijeme: {selectedFlightForCancel?.departureTime} – {selectedFlightForCancel?.arrivalTime}
              </p>

              <div className="form-group">
                <label>Od datuma:</label>
                <input
                  type="date"
                  value={cancelFromDate}
                  onChange={(e) => setCancelFromDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Do datuma:</label>
                <input type="date" value={cancelToDate} onChange={(e) => setCancelToDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Dani letenja za otkaz:</label>
                {["1", "2", "3", "4", "5", "6", "7"].map((d) => (
                  <label key={d} style={{ marginRight: "10px" }}>
                    <input
                      type="checkbox"
                      value={d}
                      checked={cancelDays.includes(d)}
                      onChange={handleDayCheckboxChange}
                    />{" "}
                    {daniSedmice[d]}
                  </label>
                ))}
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-submit">
                  Potvrdi otkazivanje
                </button>
                <button type="button" onClick={() => setShowCancelModal(false)} className="btn-cancel">
                  Zatvori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RasporedLetovaForma;
