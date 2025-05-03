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

// TODO (Backend): Potrebna su dva endpointa:
// 1. GET /api/letovi/:id/sjedista - vraća zauzeta sjedišta
// 2. POST /api/rezervacije - potvrđuje rezervaciju sa sjedištima
// Detalji ispod u komentarima.

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

  // Trenutno hardkodirano za testiranje.
  // TODO (Backend): Dinamički dohvatiti konfiguraciju aviona za let.
  const [airplaneConfig] = useState({
    firstClass: {
      rows: 3,
      seatsPerRow: 4,
      startRow: 1,
      price: 300,
    },
    businessClass: {
      rows: 5,
      seatsPerRow: 4,
      startRow: 1,
      price: 200,
    },
    economyClass: {
      rows: 20,
      seatsPerRow: 6,
      startRow: 6,
      price: 100,
    },
  });

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);

  // TODO (Backend): OVDJE SU PRIVREMENI PODACI (mock) - treba ih zamijeniti pravim API pozivom
  useEffect(() => {
    // Simulacija dohvatanja zauzetih sjedista
    const fetchBookedSeats = async () => {
      try {
        const mockBookedSeats = [
          { class: "first", seat: "A1" },
          { class: "first", seat: "B2" },
          { class: "business", seat: "A4" },
          { class: "business", seat: "B5" },
          { class: "economy", seat: "A9" },
          { class: "economy", seat: "B10" },
          { class: "economy", seat: "C11" },
        ];
        setBookedSeats(mockBookedSeats);
      } catch (error) {
        console.error("Greška pri učitavanju sjedišta:", error);
      }
    };

    fetchBookedSeats();
  }, []);

  const handleSeatClick = (seat) => {
    if (bookedSeats.some((booked) => booked.seat === seat.id)) return;

    // Provjera da li je sjedište u odgovarajućoj klasi
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

    // Provjera odabranih sjedišta po broju putnika
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

  const isSeatBooked = (seatId) => bookedSeats.some((seat) => seat.seat === seatId);
  const isSeatSelected = (seatId) => selectedSeats.some((seat) => seat.id === seatId);

  const renderSeatMap = () => {
    const seats = [];
    const { firstClass, businessClass, economyClass } = airplaneConfig;

    // Prva klasa
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
            className={`seat ${isBooked ? "booked" : ""} ${isSelected ? "selected" : ""} first 
              ${reservation.classType !== "Prva klasa" ? "disabled" : ""}`}
            onClick={() => !isBooked && handleSeatClick({ id: seatId, class: "first" })}
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

    // Biznis klasa
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
            className={`seat ${isBooked ? "booked" : ""} ${isSelected ? "selected" : ""} business 
              ${reservation.classType !== "Biznis" ? "disabled" : ""}`}
            onClick={() => !isBooked && handleSeatClick({ id: seatId, class: "business" })}
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

    // Ekonomska klasa
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
            className={`seat ${isBooked ? "booked" : ""} ${isSelected ? "selected" : ""} economy 
              ${reservation.classType !== "Ekonomska" ? "disabled" : ""}`}
            onClick={() => !isBooked && handleSeatClick({ id: seatId, class: "economy" })}
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

  // TODO (Backend): KRITIČNO - Potrebna je serverska validacija zauzetosti sjedišta
  // Trenutna frontend validacija (preko bookedSeats) nije dovoljna jer se može desiti
  // da dva korisnika rezervišu isto sjedište ako rade istovremeno
  // Rješenje:
  // - Endpoint /api/rezervacije MORA u transakciji provjeriti da li su sva sjedišta još uvijek slobodna prije čuvanja
  // - Vratiti grešku (409 Conflict) ako bilo koje sjedište više nije dostupno
  const handleConfirmSeats = async () => {
    if (selectedSeats.length !== totalPassengers) {
      alert(`Morate odabrati tačno ${totalPassengers} sjedišta za ${totalPassengers} putnika`);
      return;
    }

    try {
      const response = await axios.post(`${getBaseUrl()}/api/rezervacije`, {
        ...reservation,
        seats: selectedSeats,
      });

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
