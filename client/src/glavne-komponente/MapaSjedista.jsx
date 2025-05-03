import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../stilovi/MapaSjedista.css";

const getBaseUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }
  return "https://informacioni-sistem-za-aviokompanije.onrender.com";
};

function parseSeatConfiguration(configStr) {
  const regex = /[Ff](\d+)[Cc](\d+)[Yy](\d+)/;
  const match = configStr.match(regex);
  if (!match) {
    throw new Error("Neispravna konfiguracija sjedala.");
  }
  return {
    first: { totalSeats: parseInt(match[1], 10) },
    business: { totalSeats: parseInt(match[2], 10) },
    economy: { totalSeats: parseInt(match[3], 10) },
  };
}


function seatLetterToIndex(letter) {
  return letter.charCodeAt(0) - "A".charCodeAt(0);
}

const MapaSjedista = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservation, flight } = location.state || {};

  // Računanje broja putnika
  const totalPassengers = reservation
    ? (parseInt(reservation.adultsCount) || 0) +
      (parseInt(reservation.childrenCount) || 0) +
      (parseInt(reservation.infantsCount) || 0)
    : 0;

  // State za let iz statea ponekad se mora "osvježiti" sa backenda
  const [flightData, setFlightData] = useState(flight);
  // State za kompletan Avion dokument
  const [avion, setAvion] = useState(null);
  // State za dinamičku konfiguraciju sjedala
  const [dynamicAirplaneConfig, setDynamicAirplaneConfig] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);

  // Re-fetch kompletnog leta
  useEffect(() => {
    const fetchCompleteFlight = async () => {
      try {
        const response = await axios.get(`${getBaseUrl()}/api/letovi/${flight._id}`);
        console.log("Osvježeni let s populate:", response.data);
        setFlightData(response.data);
      } catch (err) {
        console.error("Greška pri dohvatanju kompletnog leta:", err);
      }
    };
    if (flight && flight._id && (!flight.avionId || !flight.avionId._id)) {
      fetchCompleteFlight();
    }
  }, [flight]);

  useEffect(() => {
    if (flightData && flightData.avionId) {
      setAvion(flightData.avionId);
    }
  }, [flightData]);

// Dohvatamo zauzeta mjesta za dati let iz backenda
useEffect(() => {
  const fetchBookedSeats = async () => {
    try {
      const response = await axios.get(`${getBaseUrl()}/api/sjedista/${flightData._id}/sjedista`);
      console.log("Dohvaćena zauzeta sjedala:", response.data.bookedSeats);
      setBookedSeats(response.data.bookedSeats);
    } catch (error) {
      console.error("Greška pri dohvaćanju zauzetih sjedala:", error);
    }
  };
  if (flightData && flightData._id) {
    fetchBookedSeats();
  }
}, [flightData]);


  useEffect(() => {
    if (flightData && avion && flightData.seatConfiguration && avion.sjedalaPoRedu && avion.brojSjedista) {
      try {
        const config = parseSeatConfiguration(flightData.seatConfiguration);
        const firstRows = Math.ceil(config.first.totalSeats / avion.sjedalaPoRedu.F);
        const businessRows = Math.ceil(config.business.totalSeats / avion.sjedalaPoRedu.C);
        const economyRows = Math.ceil(config.economy.totalSeats / avion.sjedalaPoRedu.Y);
  
        const dynamicConfig = {
          firstClass: {
            rows: firstRows,
            seatsPerRow: avion.sjedalaPoRedu.F,
            startRow: 1,
            price: 300,
          },
          businessClass: {
            rows: businessRows,
            seatsPerRow: avion.sjedalaPoRedu.C,
            startRow: firstRows + 1,
            price: 200,
          },
          economyClass: {
            rows: economyRows,
            seatsPerRow: avion.sjedalaPoRedu.Y,
            startRow: firstRows + businessRows + 1,
            price: 100,
          },
        };
        setDynamicAirplaneConfig(dynamicConfig);
        console.log("Dynamic config:", dynamicConfig);
      } catch (err) {
        console.error("Greška pri postavljanju konfiguracije sjedala:", err);
      }
    }
  }, [flightData, avion]);
  

  const handleSeatClick = (seat) => {
    if (bookedSeats.some((booked) => booked === seat.id)) return;
  
    const selectedClass = reservation.classType;
    const seatClass = seat.class;
  
    if (
      (selectedClass === "Ekonomska" && seatClass !== "economy") ||
      (selectedClass === "Biznis" && seatClass !== "business") ||
      (selectedClass === "Prva klasa" && seatClass !== "first")
    ) {
      alert(`Možete odabrati samo sjedišta u ${selectedClass.toLowerCase()} klasi`);
      return;
    }
  
    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      if (selectedSeats.length < totalPassengers) {
        setSelectedSeats([...selectedSeats, seat]);
      } else {
        alert(`Možete odabrati samo ${totalPassengers} sjedišta za ${totalPassengers} putnika.`);
      }
    }
  };
  
  const isSeatBooked = (seatId) =>
    bookedSeats.some((bookedSeat) => bookedSeat === seatId);
  const isSeatSelected = (seatId) =>
    selectedSeats.some((seat) => seat.id === seatId);
  
  const renderSeatMap = () => {
    if (!dynamicAirplaneConfig) {
      return <div>Učitavam konfiguraciju sjedala...</div>;
    }
    const seats = [];
    const { firstClass, businessClass, economyClass } = dynamicAirplaneConfig;
  
    // Renderiranje Prve klase
    seats.push(
      <div key="first-label" className="class-label">
        Prva klasa
      </div>
    );
    for (let row = firstClass.startRow; row < firstClass.startRow + firstClass.rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < firstClass.seatsPerRow; col++) {
        const seatLetter = String.fromCharCode(65 + col);
        const seatId = `${seatLetter}${row}`;
        const isBooked = isSeatBooked(seatId);
        const isSelected = isSeatSelected(seatId);
        rowSeats.push(
          <div
            key={seatId}
            className={`seat ${isBooked ? "booked" : ""} ${isSelected ? "selected" : ""} first ${
              reservation.classType !== "Prva klasa" ? "disabled" : ""
            }`}
            onClick={() =>
              !isBooked && handleSeatClick({ id: seatId, class: "first" })
            }
          >
            {seatId}
          </div>
        );
      }
      seats.push(
        <div key={`row-${row}`} className="seat-row">
          {rowSeats}
        </div>
      );
    }
  
    // Renderiranje Biznis klase
    seats.push(
      <div key="business-label" className="class-label">
        Biznis klasa
      </div>
    );
    for (let row = businessClass.startRow; row < businessClass.startRow + businessClass.rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < businessClass.seatsPerRow; col++) {
        const seatLetter = String.fromCharCode(65 + col);
        const seatId = `${seatLetter}${row}`;
        const isBooked = isSeatBooked(seatId);
        const isSelected = isSeatSelected(seatId);
        rowSeats.push(
          <div
            key={seatId}
            className={`seat ${isBooked ? "booked" : ""} ${isSelected ? "selected" : ""} business ${
              reservation.classType !== "Biznis" ? "disabled" : ""
            }`}
            onClick={() =>
              !isBooked && handleSeatClick({ id: seatId, class: "business" })
            }
          >
            {seatId}
          </div>
        );
      }
      seats.push(
        <div key={`row-${row}`} className="seat-row">
          {rowSeats}
        </div>
      );
    }
  
    // Renderiranje Ekonomske klase
    seats.push(
      <div key="economy-label" className="class-label">
        Ekonomska klasa
      </div>
    );
    for (let row = economyClass.startRow; row < economyClass.startRow + economyClass.rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < economyClass.seatsPerRow; col++) {
        const seatLetter = String.fromCharCode(65 + col);
        const seatId = `${seatLetter}${row}`;
        const isBooked = isSeatBooked(seatId);
        const isSelected = isSeatSelected(seatId);
        rowSeats.push(
          <div
            key={seatId}
            className={`seat ${isBooked ? "booked" : ""} ${isSelected ? "selected" : ""} economy ${
              reservation.classType !== "Ekonomska" ? "disabled" : ""
            }`}
            onClick={() =>
              !isBooked && handleSeatClick({ id: seatId, class: "economy" })
            }
          >
            {seatId}
          </div>
        );
      }
      seats.push(
        <div key={`row-${row}`} className="seat-row">
          {rowSeats}
        </div>
      );
    }
  
    return seats;
  };
  
  const handleConfirmSeats = async () => {
    if (selectedSeats.length !== totalPassengers) {
      alert(`Morate odabrati tačno ${totalPassengers} sjedišta za ${totalPassengers} putnika`);
      return;
    }
  
    try {
      const response = await axios.post(`${getBaseUrl()}/api/rezervacije`, {
        ...reservation,
        seatSelection: selectedSeats.map((seat) => seat.id),
      });
  
      // Nakon uspješne rezervacije, ponovo dohvatimo booked seats
      const seatsResponse = await axios.get(`${getBaseUrl()}/api/sjedista/${flightData._id}/sjedista`);
      console.log("Ažurirana zauzeta sjedala:", seatsResponse.data.bookedSeats);
      setBookedSeats(seatsResponse.data.bookedSeats);
  
      alert("Rezervacija uspješno završena!");
      navigate("/");
    } catch (error) {
      console.error("Greška pri potvrdi rezervacije:", error);
      alert("Došlo je do greške pri potvrdi rezervacije");
    }
  };
  
  
  if (!reservation || !flight) {
    return (
      <div className="seat-map-container">
        <h2>Nema podataka o rezervaciji</h2>
        <button onClick={() => navigate("/")} className="confirm-button">
          Vrati se na početnu
        </button>
      </div>
    );
  }
  
  return (
    <div className="seat-map-container">
      <h2>Odabir sjedišta za let {flight.flightNumber}</h2>
      <p>
        <strong>Putnika:</strong> {totalPassengers} |<strong>Klasa:</strong> {reservation.classType}
      </p>
  
      <div className="seat-map-legend">
        <div className="legend-item">
          <div className="seat-sample available"></div>
          <span>Dostupno</span>
        </div>
        <div className="legend-item">
          <div className="seat-sample selected"></div>
          <span>Odabrano</span>
        </div>
        <div className="legend-item">
          <div className="seat-sample booked"></div>
          <span>Zauzeto</span>
        </div>
      </div>
  
      <div className="seat-map">{renderSeatMap()}</div>
  
      <div className="selected-seats-info">
        <h3>Odabrana sjedišta:</h3>
        {selectedSeats.length > 0 ? (
          <ul>
            {selectedSeats.map((seat) => (
              <li key={seat.id}>{seat.id}</li>
            ))}
          </ul>
        ) : (
          <p>Niste odabrali nijedno sjedište.</p>
        )}
      </div>
  
      <div className="action-buttons">
        <button onClick={() => navigate(-1)} className="back-button">
          Nazad
        </button>
        <button
          className="confirm-button"
          onClick={handleConfirmSeats}
          disabled={selectedSeats.length !== totalPassengers}
        >
          Potvrdi rezervaciju
        </button>
      </div>
    </div>
  );
};
  
export default MapaSjedista;
