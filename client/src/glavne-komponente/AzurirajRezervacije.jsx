import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../kontekst/AuthContext";
import { useNavigate } from "react-router-dom";
import "../stilovi/AzurirajRezervacije.css";

// Funkcija za generiranje cijene karte između 100 i 1000
const generisiCijenu = () => {
  return Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
};

const getBaseUrl = () => {
  return window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://informacioni-sistem-za-aviokompanije.onrender.com";
};

const AzurirajRezervacije = () => {
  const { korisnik } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Novo stanje za uređivanje
  const [editingReservation, setEditingReservation] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newSeatSelection, setNewSeatSelection] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        console.log("Pozivam API za rezervacije za userId:", korisnik.id);
        const response = await axios.get(`${getBaseUrl()}/api/rezervacije`, {
          params: { userId: korisnik.id },
        });
        console.log("Rezervacije primljene:", response.data);
        // Za svaku rezervaciju, ako flight nema cijenu, generiramo je jednom
        const updatedBookings = response.data.map((booking) => {
          if (booking.flight && !booking.flight.cijenaKarte) {
            booking.flight.cijenaKarte = generisiCijenu();
          }
          return booking;
        });
        setBookings(updatedBookings);
      } catch (err) {
        console.error("Greška pri dohvaćanju rezervacija:", err);
        setError("Greška prilikom dohvaćanja rezervacija.");
      } finally {
        setLoading(false);
      }
    };

    if (korisnik && korisnik.id) {
      fetchBookings();
    }
  }, [korisnik]);

  // Filtriranje rezervacija – aktivne i booking history
  const currentDate = new Date();
  const activeBookings = bookings.filter((booking) => {
    const flightDate = new Date(booking.flight.datumPolaska);
    return booking.status === "active" && flightDate >= currentDate;
  });
  const pastBookings = bookings.filter((booking) => {
    const flightDate = new Date(booking.flight.datumPolaska);
    return flightDate < currentDate || booking.status !== "active";
  });

  // Handler za poništavanje rezervacije
  const handleCancel = async (bookingId) => {
    try {
      const response = await axios.post(`${getBaseUrl()}/api/rezervacije/cancel`, {
        bookingId,
        userId: korisnik.id,
      });
      alert(response.data.message);
      setBookings(
        bookings.map((b) =>
          b._id === bookingId ? { ...b, status: "canceled" } : b
        )
      );
    } catch (error) {
      console.error("Greška pri poništavanju rezervacije:", error);
      alert("Došlo je do greške pri poništavanju rezervacije.");
    }
  };

  // Handler koji otvara modal za uređivanje rezervacije
  const handleEdit = (bookingId) => {
    const bookingToEdit = bookings.find((b) => b._id === bookingId);
    if (bookingToEdit) {
      setEditingReservation(bookingToEdit);
      setNewSeatSelection(
        bookingToEdit.seatSelection ? bookingToEdit.seatSelection.join(", ") : ""
      );
      setShowEditModal(true);
    }
  };

  // Handler za spremanje izmjena rezervacije
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    // Parsiramo unesena sjedala (odvojena zarezom)
    const updatedSeats = newSeatSelection.split(",").map((s) => s.trim()).filter(Boolean);
    // Ograničenje: dozvoljeno je odabrati točno jedno sjedalo
    if (updatedSeats.length !== 1) {
      alert("Za uređivanje rezervacije morate odabrati točno jedno sjedalo za jednog putnika.");
      return;
    }
    try {
      const response = await axios.post(`${getBaseUrl()}/api/rezervacije/modify`, {
        bookingId: editingReservation._id,
        userId: editingReservation.user,
        newSeatSelection: updatedSeats,
      });
      alert(response.data.message);
      // Ažuriramo stanje rezervacija
      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b._id === editingReservation._id ? { ...b, seatSelection: updatedSeats } : b
        )
      );
      setShowEditModal(false);
      setEditingReservation(null);
    } catch (error) {
      console.error("Greška pri izmjeni rezervacije:", error);
      alert("Došlo je do greške prilikom izmjene rezervacije.");
    }
  };

  if (loading) {
    return (
      <div className="azuriraj-rezervacije-container">
        <p>Učitavanje rezervacija...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="azuriraj-rezervacije-container">
        <p>{error}</p>
      </div>
    );
  }

  // Funkcija koja renderira rezervacijsku karticu – ista struktura za aktivne rezervacije i booking history
  const renderBookingCard = (booking) => (
    <div key={booking._id} className="booking-card">
      <p>
        <strong>Rezervacija ID:</strong> {booking._id}
      </p>
      <p>
        <strong>Let:</strong> {booking.flight.brojLeta}
      </p>
      <p>
        <strong>Datum leta:</strong>{" "}
        {new Date(booking.flight.datumPolaska).toLocaleDateString()}
      </p>
      <p>
        <strong>Ruta leta:</strong> {booking.flight.polaziste} - {booking.flight.odrediste}
      </p>
      <p>
        <strong>Vrijeme leta:</strong>{" "}
        {booking.flight.vrijemePolaska} - {booking.flight.vrijemeDolaska}
      </p>
      <p>
        <strong>Aviokompanija:</strong> {booking.flight.aviokompanija?.naziv}
      </p>
      <p>
        <strong>Cijena karte:</strong> {booking.flight.cijenaKarte} &euro;
      </p>
      <p>
        <strong>Klasa leta:</strong> {booking.classType}
      </p>
      <p>
        <strong>Putnik:</strong>{" "}
        {booking.passengers && booking.passengers.length > 0
          ? booking.passengers.map((p, i) => (
              <span key={i}>
                {p.ime} {p.prezime}
                {i < booking.passengers.length - 1 ? ", " : ""}
              </span>
            ))
          : "Nema podataka"}
      </p>
      <p>
        <strong>Status:</strong> {booking.status}
      </p>
      <p>
        <strong>Odabir sjedišta:</strong>{" "}
        {booking.seatSelection && booking.seatSelection.join(", ")}
      </p>
      <div className="booking-actions">
        <button onClick={() => handleEdit(booking._id)}>
          Izmijeni rezervaciju
        </button>
        <button
          className="cancel-button"
          onClick={() => {
            if (window.confirm("Da li ste sigurni da želite otkazati rezervaciju?")) {
              handleCancel(booking._id);
            }
          }}
        >
          Poništi rezervaciju
        </button>
      </div>
    </div>
  );

  return (
    <div className="azuriraj-rezervacije-container">
      <h2>Moje rezervacije</h2>
      
      {/* Sekcija za aktivne rezervacije */}
      <div className="active-reservations">
        <h3>Aktivne rezervacije</h3>
        {activeBookings.length === 0 ? (
          <p>Nema aktivnih rezervacija.</p>
        ) : (
          activeBookings.map((booking) => renderBookingCard(booking))
        )}
      </div>

      {/* Sekcija za Booking History – ista struktura kao za aktivne rezervacije */}
      <div className="booking-history">
        <h3>Booking History</h3>
        {pastBookings.length === 0 ? (
          <p>Nema rezervacija u historiji.</p>
        ) : (
          pastBookings.map((booking) => renderBookingCard(booking))
        )}
      </div>

      {/* Modal za uređivanje rezervacije */}
      {showEditModal && editingReservation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Uredi rezervaciju {editingReservation._id}</h3>
            <form onSubmit={handleSaveEdit}>
              <label htmlFor="seatEdit">Nova sjedala (odvojena zarezom):</label>
              <input
                id="seatEdit"
                type="text"
                value={newSeatSelection}
                onChange={(e) => setNewSeatSelection(e.target.value)}
              />
              <div className="modal-buttons">
                <button type="submit">Spremi izmjene</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingReservation(null);
                  }}
                >
                  Odustani
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AzurirajRezervacije;
