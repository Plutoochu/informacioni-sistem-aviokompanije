import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../stilovi/Rezervacija.css"; // Uvozimo stilove

const getBaseUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }
  return "https://informacioni-sistem-za-aviokompanije.onrender.com";
};

const Rezervacija = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const passedFlight = location.state?.flight;

  // Stanja za mapu sjedista
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [reservationData, setReservationData] = useState(null);

  // Osnovni podaci o letu
  const [letInfo, setLetInfo] = useState(passedFlight || null);
  const [loading, setLoading] = useState(passedFlight ? false : true);
  const [greska, setGreska] = useState(null);
  const [cijena, setCijena] = useState(passedFlight ? passedFlight.cijena : 0);
  const [bookingNumber, setBookingNumber] = useState("");

  // Opcije rezervacije
  const [classType, setClassType] = useState("Ekonomska");
  const [ticketType, setTicketType] = useState("Jednosmjerna"); // "Jednosmjerna" ili "Povratna"
  const [adultsCount, setAdultsCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infantsCount, setInfantsCount] = useState(0);

  // Podaci putnika – dinamički se generišu prema broju putnika
  const [passengers, setPassengers] = useState([]);

  // Način plaćanja
  const [paymentMethod, setPaymentMethod] = useState("Kartica");
  // Kreditna kartica – stariji state je zamijenjen novim dijeljenjem na mjesec i godinu
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiryMonth, setCardExpiryMonth] = useState("");
  const [cardExpiryYear, setCardExpiryYear] = useState("");
  const [cardCVC, setCardCVC] = useState("");

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
    const totalPassengers = parseInt(adultsCount) + parseInt(childrenCount) + parseInt(infantsCount);
    const updatedPassengers = [];
    for (let i = 0; i < totalPassengers; i++) {
      updatedPassengers[i] = passengers[i] || {
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

  // Validacija podataka kreditne kartice
  const validateCardDetails = () => {
    // Broj kartice – očisti eventualne razmake i provjeri da sadrži točno 16 znamenki
    const cleanedCardNumber = cardNumber;
    const cardNumberRegex = /^\d{16}$/;
    if (!cardNumberRegex.test(cleanedCardNumber)) {
      alert("Nevažeći broj kartice. Unesite točno 16 cifara.");
      return false;
    }
    // Validacija CVC – točno 3 cifre
    const cvcRegex = /^\d{3}$/;
    if (!cvcRegex.test(cardCVC)) {
      alert("Nevažeći CVC. Unesite točno 3 cifre.");
      return false;
    }
    // Provjera da su odabrani mjesec i godina za datum isteka
    if (!cardExpiryMonth || !cardExpiryYear) {
      alert("Molimo odaberite datum isteka kartice.");
      return false;
    }
    // Kombinovanje u format "YYYY-MM"
    const expiryString = `${cardExpiryYear}-${cardExpiryMonth}`;
    // Regex za provjeru formata "YYYY-MM"
    const expiryRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!expiryRegex.test(expiryString)) {
      alert("Nevažeći datum isteka. Koristite format YYYY-MM.");
      return false;
    }
    // Provjera da li je kartica istekla
    const currentDate = new Date();
    const currentYearTwo = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const expiryYearInt = parseInt(cardExpiryYear);
    const expiryMonthInt = parseInt(cardExpiryMonth);
    if (expiryYearInt < currentYearTwo || (expiryYearInt === currentYearTwo && expiryMonthInt < currentMonth)) {
      alert("Kreditna kartica je istekla. Unesite važeći datum isteka.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paymentMethod === "Kartica") {
      if (!validateCardDetails()) {
        return;
      }
    }

    const cardDetails =
      paymentMethod === "Kartica"
        ? {
            cardNumber: cardNumber.replace(/\s+/g, ""), // briše eventualne razmake
            // Kombinujemo na način: "2027-09" umjesto "09/2027"
            cardExpiry: `${cardExpiryYear}-${cardExpiryMonth}`,
            cardCVC,
          }
        : null;

    const bookingData = {
      bookingNumber,
      flightId: letInfo._id,
      classType,
      ticketType,
      adultsCount,
      childrenCount,
      infantsCount,
      passengers,
      paymentMethod,
      cardDetails: paymentMethod === "Kartica" ? cardDetails : undefined,
      // seatSelection opcionalno, ako postoji
    };

    console.log("Podaci rezervacije:", bookingData);
    setReservationData(bookingData);
    setShowSeatMap(true);

    setReservationData(bookingData);

    navigate("/mapa-sjedista", {
      state: {
        reservation: bookingData,
        flight: letInfo,
      },
    });
  };

  if (loading) return <div>Učitavanje...</div>;
  if (greska) return <div>{greska}</div>;
  if (!letInfo) return <div>Nema informacija o letu.</div>;

  // Generisanje opcija za mjesec (01 do 12)
  // Opcije za mjesec – od "01" do "12"
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, "0");
    return (
      <option key={month} value={month}>
        {month}
      </option>
    );
  });

  // Opcije za godinu – puni brojevi, od trenutne godine do trenutne + 10
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => {
    const yearFull = currentYear + i;
    return (
      <option key={yearFull} value={yearFull}>
        {yearFull}
      </option>
    );
  });

  return (
    <div className="booking-container">
      <h2>Detalji rezervacije</h2>
      <p>
        <strong>Booking broj:</strong> {bookingNumber}
      </p>
      <p>
        <strong>Aviokompanija:</strong> {letInfo.avionId?.naziv || "Nepoznato"}
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
          <select value={classType} onChange={(e) => setClassType(e.target.value)}>
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
              <input type="number" min="1" value={adultsCount} onChange={(e) => setAdultsCount(e.target.value)} />
            </div>
            <div>
              <label>Djeca:</label>
              <input type="number" min="0" value={childrenCount} onChange={(e) => setChildrenCount(e.target.value)} />
            </div>
            <div>
              <label>Bebe:</label>
              <input type="number" min="0" value={infantsCount} onChange={(e) => setInfantsCount(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Unos podataka putnika */}
        {parseInt(adultsCount) + parseInt(childrenCount) + parseInt(infantsCount) > 0 && (
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
                    onChange={(e) => handlePassengerChange(index, "ime", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Prezime"
                    value={passenger.prezime}
                    onChange={(e) => handlePassengerChange(index, "prezime", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Broj pasoša ili ID (XXXXXXXX)"
                    maxLength="8"
                    pattern="[A-Za-z0-9]{1,8}"
                    value={passenger.idNumber}
                    onChange={(e) => handlePassengerChange(index, "idNumber", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="date"
                    placeholder="Datum rođenja"
                    value={passenger.datumRodjenja}
                    onChange={(e) => handlePassengerChange(index, "datumRodjenja", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Email"
                    value={passenger.email}
                    onChange={(e) => handlePassengerChange(index, "email", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="tel"
                    placeholder="Telefon"
                    value={passenger.telefon}
                    onChange={(e) => handlePassengerChange(index, "telefon", e.target.value)}
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

        {/* Dodatna polja za kreditnu karticu – prikazuju se samo ako je izabran način plaćanja "Kartica" */}
        {paymentMethod === "Kartica" && (
          <div className="credit-card-details">
            <div className="form-group">
              <label>Broj kartice:</label>
              <input
                type="text"
                name="cardNumber"
                placeholder="1234456787654321"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                maxLength={16}
                required
              />
            </div>
            <div className="form-group">
              <label>Datum isteka:</label>
              <select
                name="cardExpiryMonth"
                value={cardExpiryMonth}
                onChange={(e) => setCardExpiryMonth(e.target.value)}
                required
              >
                <option value="">Mjesec</option>
                {monthOptions}
              </select>
              <select
                name="cardExpiryYear"
                value={cardExpiryYear}
                onChange={(e) => setCardExpiryYear(e.target.value)}
                required
              >
                <option value="">Godina</option>
                {yearOptions}
              </select>
            </div>
            <div className="form-group">
              <label>CVC:</label>
              <input
                type="text"
                name="cardCVC"
                placeholder="xxx"
                value={cardCVC}
                onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, ""))}
                maxLength={3}
                required
              />
            </div>
          </div>
        )}

        <button type="submit" className="rezervisi-dugme">
          Dalje na odabir sjedišta
        </button>
      </form>
    </div>
  );
};

export default Rezervacija;
