import React, { useState } from "react";

const DestinacijeForma = () => {
  const [grad, setGrad] = useState("");
  const [naziv, setNaziv] = useState("");
  const [iata, setIATA] = useState("");
  const [icao, setICAO] = useState("");
  const [aerodromi, setAerodromi] = useState([]);

  const dodajAerodrom = () => {
    if (!grad || !naziv || !iata || !icao) return alert("Popuni sva polja!");

    const noviAerodrom = { grad, naziv, iata, icao };
    setAerodromi([...aerodromi, noviAerodrom]);

    setGrad("");
    setNaziv("");
    setIATA("");
    setICAO("");
  };

  const obrisiAerodrom = (index) => {
    const novi = aerodromi.filter((_, i) => i !== index);
    setAerodromi(novi);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>Upravljanje destinacijama</h2>

      <input
        type="text"
        placeholder="Grad"
        value={grad}
        onChange={(e) => setGrad(e.target.value)}
        style={{ marginBottom: "10px", width: "100%", padding: "8px" }}
      />
      <input
        type="text"
        placeholder="Naziv aerodroma"
        value={naziv}
        onChange={(e) => setNaziv(e.target.value)}
        style={{ marginBottom: "10px", width: "100%", padding: "8px" }}
      />
      <input
        type="text"
        placeholder="IATA kod (npr. SJJ)"
        value={iata}
        onChange={(e) => setIATA(e.target.value.toUpperCase())}
        style={{ marginBottom: "10px", width: "100%", padding: "8px" }}
      />
      <input
        type="text"
        placeholder="ICAO kod (npr. LQSA)"
        value={icao}
        onChange={(e) => setICAO(e.target.value.toUpperCase())}
        style={{ marginBottom: "10px", width: "100%", padding: "8px" }}
      />

      <button
        onClick={dodajAerodrom}
        style={{
          padding: "10px",
          width: "100%",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      >
        Dodaj destinaciju
      </button>

      <h3>Dodani aerodromi:</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#007bff" }}>
            <th
              style={{
                padding: "10px",
                border: "1px solid #ccc",
                color: "white",
              }}
            >
              GRAD
            </th>
            <th
              style={{
                padding: "10px",
                border: "1px solid #ccc",
                color: "white",
              }}
            >
              NAZIV AERODROMA
            </th>
            <th
              style={{
                padding: "10px",
                border: "1px solid #ccc",
                color: "white",
              }}
            >
              IATA / ICAO
            </th>
            <th
              style={{
                padding: "10px",
                border: "1px solid #ccc",
                color: "white",
              }}
            >
              AKCIJA
            </th>
          </tr>
        </thead>
        <tbody>
          {aerodromi.map((a, index) => (
            <tr key={index}>
              <td
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  color: "white",
                }}
              >
                {a.grad}
              </td>
              <td
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  color: "white",
                }}
              >
                {a.naziv}
              </td>
              <td
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  color: "white",
                }}
              >
                {a.iata} / {a.icao}
              </td>
              <td
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  color: "white",
                }}
              >
                <button
                  onClick={() => obrisiAerodrom(index)}
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Obriši
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DestinacijeForma;
