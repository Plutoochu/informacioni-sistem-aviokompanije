import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import "../stilovi/Rezervacija.css"; // Uvozimo stilove

const getBaseUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }
  return "https://informacioni-sistem-za-aviokompanije.onrender.com";
};

const Rezervacija = () => {
  const { id } = useParams();
  const location = useLocation();
  const passedFlight = location.state?.flight;

  // Osnovni podaci o letu
  const [letInfo, setLetInfo] = useState(passedFlight || null);
  const [loading, setLoading] = useState(passedFlight ? false : true);
  const [greska, setGreska] = useState(null);
  const [cijena, setCijena] = useState(passedFlight ? passedFlight.cijena : 0);
  const [bookingNumber, setBookingNumber] = useState("");

  const [classType, setClassType] = useState("Ekonomska");
  const [ticketType, setTicketType] = useState("Jednosmjerna"); // "Jednosmjerna" ili "Povratna"
  const [adultsCount, setAdultsCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infantsCount, setInfantsCount] = useState(0);

  const [passengers, setPassengers] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Kartica");

  const generisiBookingBroj = () => {
    return "BK-" + Math.floor(100000 + Math.random() * 900000);
  };


  useEffect(() => {
    if (!passedFlight) {
      const fetchLet = async () => {
        try {
          const response = await axios.get(`${getBaseUrl()}/api/letovi/${id}`);
          const flightData = response.data;
          setLetInfo(flightData);
          setCijena(flightData.cijena || 0);
          setBookingNumber(generisiBookingBroj());
        } catch (err) {
          console.error("Greška pri dohvatanju leta:", err);
          setGreska("Nismo mogli dohvatiti podatke o letu.");
        } finally {
          setLoading(false);
        }
      };
      fetchLet();
    } else {
      setBookingNumber(generisiBookingBroj());
    }
  }, [id, passedFlight]);

  // Ažuriramo listu putnika kad se promijeni broj odabranih putnika
  useEffect(() => {
    const totalPassengers =
      parseInt(adultsCount) + parseInt(childrenCount) + parseInt(infantsCount);
    const updatedPassengers = [];
    for (let i = 0; i < totalPassengers; i++) {
      updatedPassengers[i] =
        passengers[i] || {
          ime: "",
          prezime: "",
          idNumber: "",
          datumRodjenja: "",
          email: "",
          telefon: "",
        };
    }
    setPassengers(updatedPassengers);
  }, [adultsCount, childrenCount, infantsCount]);

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const bookingData = {
      bookingNumber,
      letInfo,
      classType,
      ticketType,
      adultsCount,
      childrenCount,
      infantsCount,
      passengers,
      paymentMethod,
    };
    console.log("Podaci rezervacije:", bookingData);
  };

  if (loading) return <div>Učitavanje...</div>;
  if (greska) return <div>{greska}</div>;
  if (!letInfo) return <div>Nema informacija o letu.</div>;

  return (
    <div className="booking-container">
      <h2>Detalji rezervacije</h2>
      <p>
        <strong>Booking broj:</strong> {bookingNumber}
      </p>
      <p>
        <strong>Aviokompanija:</strong>{" "}
        {letInfo.avionId?.naziv || "Nepoznato"}
      </p>
      <p>
        <strong>Broj leta:</strong> {letInfo.flightNumber}
      </p>
      <p>
        <strong>Polazak:</strong> {letInfo.origin}, {letInfo.departureTime}
      </p>
      <p>
        <strong>Dolazak:</strong> {letInfo.destination}, {letInfo.arrivalTime}{" "}
        {letInfo.dolazakSljedeciDan ? "(sljedeći dan)" : ""}
      </p>
      <p>
        <strong>Prtljag dozvoljen:</strong> 1 ručni + 1 čekirani (23kg)
      </p>
      <p>
        <strong>Cijena karte:</strong> {cijena} €
      </p>

      <h3>Odaberi opcije rezervacije</h3>
      <form className="rezervacija-forma" onSubmit={handleSubmit}>
        {/* Izbor klase */}
        <div className="form-group">
          <label>Klasa:</label>
          <select
            value={classType}
            onChange={(e) => setClassType(e.target.value)}
          >
            <option value="Ekonomska">Ekonomska</option>
            <option value="Biznis">Biznis</option>
            <option value="Prva klasa">Prva klasa</option>
          </select>
        </div>

        {/* Izbor tipa karte */}
        <div className="form-group">
          <label>Tip karte:</label>
          <div>
            <label>
              <input
                type="radio"
                name="ticketType"
                value="Jednosmjerna"
                checked={ticketType === "Jednosmjerna"}
                onChange={(e) => setTicketType(e.target.value)}
              />
              Jednosmjerna (One way)
            </label>
            <label>
              <input
                type="radio"
                name="ticketType"
                value="Povratna"
                checked={ticketType === "Povratna"}
                onChange={(e) => setTicketType(e.target.value)}
              />
              Povratna (Round trip)
            </label>
          </div>
        </div>

        {/* Broj putnika */}
        <div className="form-group">
          <label>Putnici:</label>
          <div className="passengers-count">
            <div>
              <label>Odrasli:</label>
              <input
                type="number"
                min="1"
                value={adultsCount}
                onChange={(e) => setAdultsCount(e.target.value)}
              />
            </div>
            <div>
              <label>Djeca:</label>
              <input
                type="number"
                min="0"
                value={childrenCount}
                onChange={(e) => setChildrenCount(e.target.value)}
              />
            </div>
            <div>
              <label>Bebe:</label>
              <input
                type="number"
                min="0"
                value={infantsCount}
                onChange={(e) => setInfantsCount(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Unos podataka za svakog putnika */}
        {(parseInt(adultsCount) +
          parseInt(childrenCount) +
          parseInt(infantsCount)) > 0 && (
          <div className="passengers-details">
            <h4>Unesite podatke putnika</h4>
            {passengers.map((passenger, index) => (
              <div key={index} className="passenger-form">
                <h5>Putnik {index + 1}</h5>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Ime"
                    value={passenger.ime}
                    onChange={(e) =>
                      handlePassengerChange(index, "ime", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Prezime"
                    value={passenger.prezime}
                    onChange={(e) =>
                      handlePassengerChange(index, "prezime", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Broj pasoša ili ID-a"
                    value={passenger.idNumber}
                    onChange={(e) =>
                      handlePassengerChange(index, "idNumber", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="date"
                    placeholder="Datum rođenja"
                    value={passenger.datumRodjenja}
                    onChange={(e) =>
                      handlePassengerChange(
                        index,
                        "datumRodjenja",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Email"
                    value={passenger.email}
                    onChange={(e) =>
                      handlePassengerChange(index, "email", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="tel"
                    placeholder="Telefon"
                    value={passenger.telefon}
                    onChange={(e) =>
                      handlePassengerChange(index, "telefon", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Izbor načina plaćanja */}
        <div className="form-group">
          <label>Način plaćanja:</label>
          <div>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="Kartica"
                checked={paymentMethod === "Kartica"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Kartica (Visa/Mastercard)
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="PayPal"
                checked={paymentMethod === "PayPal"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              PayPal
            </label>
          </div>
        </div>

        <button type="submit" className="rezervisi-dugme">
          Potvrdi rezervaciju
        </button>
      </form>
    </div>
  );
};

export default Rezervacija;
