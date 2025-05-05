import React, { useState, useEffect } from "react";
import {
  dodajLet,
  azurirajLet,
  dohvatiSveLetove,
  otkaziLet,
  dohvatiOtkazaneLetove,
  aktivirajLet,
} from "../pomocne-funkcije/let-fetch-funkcije";
import { dohvatiDestinacije, dohvatiAviokompanije, dohvatiSveZrakoplove } from "../pomocne-funkcije/fetch-funkcije";
import "../stilovi/RasporedLetova.css";

const RasporedLetovaForma = () => {
  const [avioni, setAvioni] = useState([]);
  const [letovi, setLetovi] = useState([]);
  const [destinacije, setDestinacije] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFlightId, setSelectedFlightId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [aviokompanije, setAviokompanije] = useState([]);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelFromDate, setCancelFromDate] = useState("");
  const [cancelToDate, setCancelToDate] = useState("");
  const [cancelDays, setCancelDays] = useState([]);
  const [selectedFlightForCancel, setSelectedFlightForCancel] = useState(null);
  const [otkazaniLetovi, setOtkazaniLetovi] = useState([]);
  const [dodajSkupLetova, setDodajSkupLetova] = useState(false);

  const handleCancelClick = (let_) => {
    if (let_.rasporedLetova) {
      setSelectedFlightForCancel(let_);
      setCancelFromDate(let_.datumPolaska?.slice(0, 10));
      setCancelToDate(let_.datumDolaska?.slice(0, 10));
      setCancelDays(let_.rasporedLetova.split(""));
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
      console.log(err);

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
        const aviokompanijeRes = await dohvatiAviokompanije();

        // Filtriranje letova koji imaju važeće podatke
        const validLetovi = letoviRes.filter((let_) => {
          return let_.brojLeta && let_.vrijemePolaska && let_.vrijemeDolaska && let_.polaziste && let_.odrediste;
        });

        setDestinacije(destRes);
        setAvioni(avionRes);
        setLetovi(validLetovi); // Set filtered list
        setOtkazaniLetovi(otkazaniRes);
        setAviokompanije(aviokompanijeRes);
      } catch (err) {
        console.error("Greška pri učitavanju podataka:", err);
      }
    };

    fetchData();
  }, []);

  const isFlightCanceled = (let_) => {
    // Ensure rasporedLetova exists before using it
    if (!let_.rasporedLetova) {
      return false; // Return false or any other fallback value you prefer
    }

    const letId = let_._id;
    const validityStart = new Date(let_.datumPolaska);
    const validityEnd = new Date(let_.datumDolaska);
    const daysInSchedule = let_.rasporedLetova.split(""); // Now it's safe to call split

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

  const [formData, setFormData] = useState({
    brojLeta: "",
    vrijemePolaska: "",
    vrijemeDolaska: "",
    polaziste: "",
    odrediste: "",
    konfiguracijaSjedista: "",
    rasporedLetova: "",
    datumPolaska: "",
    datumDo: "",
    avionId: "",
    aviokompanija: "",
  });

  const handleEdit = (let_) => {
    setFormData({
      brojLeta: let_.brojLeta,
      vrijemePolaska: let_.vrijemePolaska,
      vrijemeDolaska: let_.vrijemeDolaska,
      polaziste: let_.polaziste,
      odrediste: let_.odrediste,
      konfiguracijaSjedista: let_.konfiguracijaSjedista,
      rasporedLetova: let_.rasporedLetova,
      datumPolaska: let_.datumPolaska?.slice(0, 10),
      datumDo: let_.datumDo?.slice(0, 10),
      avionId: let_.avionId?._id || let_.avionId,
      aviokompanija: let_.aviokompanija?._id || let_.aviokompanija,
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
        return let_.brojLeta && let_.vrijemePolaska && let_.vrijemeDolaska && let_.polaziste && let_.odrediste;
      });
      setLetovi(validLetovi);
      // setFormData({
      //   brojLeta: "",
      //   vrijemePolaska: "",
      //   vrijemeDolaska: "",
      //   polaziste: "",
      //   odrediste: "",
      //   konfiguracijaSjedista: "",
      //   rasporedLetova: "",
      //   datumPolaska: "",
      //   datumDo: "",
      //   avionId: "",
      //   aviokompanija: "",
      // });
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
        <div className="flight-rasporedLetova-form">
          <h2>{isEditing ? "Uredi let" : "Dodaj let"}</h2>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <form onSubmit={handleSubmit}>
            {["brojLeta", "vrijemePolaska", "vrijemeDolaska"].map((field) => (
              <div className="form-group" key={field}>
                <label htmlFor={field}>
                  {field === "brojLeta"
                    ? "Broj leta"
                    : field === "vrijemePolaska"
                    ? "Vrijeme polaska"
                    : "Vrijeme dolaska"}
                </label>
                <input
                  type={field.includes("vrijeme") ? "time" : "text"}
                  step="60"
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
            {["polaziste", "odrediste"].map((field) => (
              <div className="form-group" key={field}>
                <label htmlFor={field}>{field === "polaziste" ? "Polazište" : "Odredište"}</label>
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

            <div className="form-group">
              <label htmlFor="aviokompanija">Aviokompanija</label>
              <select
                id="aviokompanija"
                name="aviokompanija"
                value={formData.aviokompanija}
                onChange={handleChange}
                required
              >
                <option value="">-- Odaberi aviokompaniju --</option>
                {aviokompanije.map((avio) => (
                  <option key={avio._id} value={avio._id}>
                    {avio.naziv} ({avio.kod})
                  </option>
                ))}
              </select>
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
                name="konfiguracijaSjedista"
                value={formData.konfiguracijaSjedista}
                onChange={handleChange}
                placeholder="npr. F10C20Y120"
                required
              />
            </div>

            <div className="form-group">
              <label>Datum polaska</label>
              <input type="date" name="datumPolaska" value={formData.datumPolaska} onChange={handleChange} required />
            </div>

            <div className="flex gap-4">
              <label htmlFor="skupLetova">Dodaj vise letova</label>
              <input
                type="checkbox"
                name="skupLetova"
                onChange={() => {
                  setDodajSkupLetova((s) => !s);
                  setFormData((s) => {
                    return { ...s, rasporedLetova: "", datumDo: "" };
                  });
                }}
              />
            </div>

            {dodajSkupLetova ? (
              <>
                <div className="form-group">
                  <label>Raspored (dani letenja)</label>
                  <input
                    type="text"
                    name="rasporedLetova"
                    value={formData.rasporedLetova}
                    onChange={handleChange}
                    placeholder="1234567 ili x56"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Datum do</label>
                  <input type="date" name="datumDo" value={formData.datumDo} onChange={handleChange} required />
                </div>
              </>
            ) : null}
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
              brojLeta: "",
              vrijemePolaska: "",
              vrijemeDolaska: "",
              polaziste: "",
              odrediste: "",
              konfiguracijaSjedista: "",
              rasporedLetova: "",
              datumPolaska: "",
              datumDo: "",
              avionId: "",
            });
            setIsEditing(false);
            setSelectedFlightId(null);
            setErrorMessage("");
            setShowForm(true);
          }}
        >
          Dodaj let
        </button>
        <h2>Raspored letova</h2>
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
                <th>Aviokompanija</th>
                <th>Datum polaska</th>
                <th>Datum dolaska</th>
                <th>Status</th>
                <th>Akcija</th>
              </tr>
            </thead>
            <tbody>
              {letovi.map((let_) => (
                <tr key={let_._id}>
                  <td>{let_.brojLeta || "N/A"}</td>
                  <td>
                    {let_.polaziste} → {let_.odrediste}
                  </td>
                  <td>
                    {let_.vrijemePolaska && let_.vrijemeDolaska
                      ? `${let_.vrijemePolaska} - ${let_.vrijemeDolaska}`
                      : "N/A"}
                  </td>
                  <td>{let_.avionId?.naziv || "N/A"}</td>
                  <td>{aviokompanije.find((a) => a._id === let_.aviokompanija)?.naziv || "N/A"} </td>
                  <td>{let_.datumPolaska ? let_.datumPolaska.slice(0, 10) : "N/A"}</td>
                  <td>{let_.datumDolaska ? let_.datumDolaska.slice(0, 10) : "N/A"}</td>
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
                <strong>{selectedFlightForCancel?.polaziste}</strong> →{" "}
                <strong>{selectedFlightForCancel?.odrediste}</strong>
                <br />
                Vrijeme: {selectedFlightForCancel?.vrijemePolaska} – {selectedFlightForCancel?.vrijemeDolaska}
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
