import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../kontekst/AuthContext";
import { useLanguage } from "../kontekst/LanguageContext";
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
  const { t } = useLanguage();
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
        setError(t('reservations.cancelError'));
      } finally {
        setLoading(false);
      }
    };

    if (korisnik && korisnik.id) {
      fetchBookings();
    }
  }, [korisnik, t]);

  // Filtriranje rezervacija – aktivne i booking history
  const currentDate = new Date();
  const activeBookings = bookings.filter((booking) => {
    const flightDate = new Date(booking.flight?.datumPolaska);
    return booking.status === "active" && flightDate >= currentDate;
  });
  const pastBookings = bookings.filter((booking) => {
    const flightDate = new Date(booking.flight?.datumPolaska);
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
      setBookings(bookings.map((b) => (b._id === bookingId ? { ...b, status: "canceled" } : b)));
    } catch (error) {
      console.error("Greška pri poništavanju rezervacije:", error);
      alert(t('reservations.cancelError'));
    }
  };

  // Handler koji otvara modal za uređivanje rezervacije
  const handleEdit = (bookingId) => {
    const bookingToEdit = bookings.find((b) => b._id === bookingId);
    if (bookingToEdit) {
      setEditingReservation(bookingToEdit);
      setNewSeatSelection(bookingToEdit.seatSelection ? bookingToEdit.seatSelection.join(", ") : "");
      setShowEditModal(true);
    }
  };

  // Handler za spremanje izmjena rezervacije
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    // Parsiramo unesena sjedala (odvojena zarezom)
    const updatedSeats = newSeatSelection
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
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
        prevBookings.map((b) => (b._id === editingReservation._id ? { ...b, seatSelection: updatedSeats } : b))
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
        <p>{t('common.loading')}</p>
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
        <strong>{t('reservations.bookingNumber')}:</strong> {booking._id}
      </p>
      <p>
        <strong>{t('flights.flightNumber')}:</strong> {booking.flight.brojLeta}
      </p>
      <p>
        <strong>{t('flights.date')}:</strong> {new Date(booking.flight?.datumPolaska).toLocaleDateString()}
      </p>
      <p>
        <strong>{t('flights.route')}:</strong> {booking.flight.polaziste} - {booking.flight.odrediste}
      </p>
      <p>
        <strong>{t('flights.time')}:</strong> {booking.flight.vrijemePolaska} - {booking.flight.vrijemeDolaska}
      </p>
      <p>
        <strong>Aviokompanija:</strong> {booking.flight.aviokompanija?.naziv}
      </p>
      <p>
        <strong>{t('flights.price')}:</strong> {booking.cijenaKarte} KM
      </p>
      <p>
        <strong>{t('flights.class')}:</strong> {booking.classType}
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
        <strong>{t('reservations.status')}:</strong> {booking.status}
      </p>
      <p>
        <strong>{t('booking.seatSelection')}:</strong> {booking.seatSelection && booking.seatSelection.join(", ")}
      </p>
      <div className="booking-actions">
        <button onClick={() => handleEdit(booking._id)}>{t('reservations.modify')}</button>
        <button
          className="cancel-button"
          onClick={() => {
            if (window.confirm(t('reservations.cancelSuccess'))) {
              handleCancel(booking._id);
            }
          }}
        >
          {t('reservations.cancel')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="azuriraj-rezervacije-container">
      <h2 className="azuriraj-rezervacije-header">{t('reservations.title')}</h2>

      {/* Aktivne rezervacije */}
      <section>
        <h3>{t('reservations.active')}</h3>
        {activeBookings.length > 0 ? (
          <div className="azuriraj-rezervacije-lista">
            {activeBookings.map(renderBookingCard)}
          </div>
        ) : (
          <p style={{ textAlign: "center" }}>{t('reservations.noReservations')}</p>
        )}
      </section>

      {/* Booking History */}
      <section>
        <h3>{t('dashboard.flightHistory')}</h3>
        {pastBookings.length > 0 ? (
          <div className="azuriraj-rezervacije-lista">
            {pastBookings.map(renderBookingCard)}
          </div>
        ) : (
          <p style={{ textAlign: "center" }}>{t('reservations.noReservations')}</p>
        )}
      </section>

      {/* Modal za uređivanje rezervacije */}
      {showEditModal && editingReservation && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{t('reservations.modify')}</h3>
            <form onSubmit={handleSaveEdit}>
              <label htmlFor="seatSelection">{t('booking.seatSelection')}:</label>
              <input
                id="seatSelection"
                type="text"
                value={newSeatSelection}
                onChange={(e) => setNewSeatSelection(e.target.value)}
                placeholder="A1"
                required
              />
              <div className="modal-actions">
                <button type="submit">{t('common.save')}</button>
                <button type="button" onClick={() => setShowEditModal(false)}>
                  {t('common.cancel')}
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
