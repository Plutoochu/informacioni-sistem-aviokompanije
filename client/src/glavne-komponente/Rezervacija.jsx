import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../stilovi/Rezervacija.css"; // Uvozimo stilove
import { useAuth } from "../kontekst/AuthContext";

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
  const classType = location.state?.klasa;

  // Pozivamo useAuth jednom na vrhu
  const { korisnik } = useAuth();

  // Stanja za mapu sjedista
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [reservationData, setReservationData] = useState(null);

  // Osnovni podaci o letu
  const [letInfo, setLetInfo] = useState(passedFlight || null);
  const [loading, setLoading] = useState(passedFlight ? false : true);
  const [greska, setGreska] = useState(null);
  const [cijenaKarte, setCijena] = useState(passedFlight ? passedFlight.cijena : 0);
  const [bookingNumber, setBookingNumber] = useState("");

  // Opcije rezervacije
  const [ticketType, setTicketType] = useState("Jednosmjerna"); // "Jednosmjerna" ili "Povratna"
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(1);
  const [infantsCount, setInfantsCount] = useState(0);

  // Podaci putnika – dinamički se generišu prema broju putnika
  const [passengers, setPassengers] = useState([]);

  const [aviokompanije, setAviokompanije] = useState([]);

  const fetchAviokompanije = async () => {
    try {
      const response = await axios.get(`${getBaseUrl()}/api/aviokompanije`);
      setAviokompanije(response.data);
    } catch (err) {
      console.error("Greška pri dohvatanju aviokompanija:", err);
    }
  };

  // Način plaćanja
  const [paymentMethod, setPaymentMethod] = useState("Kartica");
  // Kreditna kartica – podaci
  const [cardNumber, setCardNumber] = useState("1234567891234567");
  const [cardExpiryMonth, setCardExpiryMonth] = useState("07");
  const [cardExpiryYear, setCardExpiryYear] = useState("2025");
  const [cardCVC, setCardCVC] = useState("557");

  const generisiBookingBroj = () => {
    return "BK-" + Math.floor(100000 + Math.random() * 900000);
  };

  useEffect(() => {
    if (!passedFlight) {
      const fetchLet = async () => {
        try {
          const response = await axios.get(`${getBaseUrl()}/api/letovi/${id}`);
          const flightData = response.data;
          console.log("Dohvaćen let:", flightData);
          setLetInfo(flightData);
          setCijena(flightData.cijena || 0);
          setBookingNumber(generisiBookingBroj());
          await fetchAviokompanije();
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
      fetchAviokompanije();
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
    const cleanedCardNumber = cardNumber;
    const cardNumberRegex = /^\d{16}$/;
    if (!cardNumberRegex.test(cleanedCardNumber)) {
      alert("Nevažeći broj kartice. Unesite točno 16 cifara.");
      return false;
    }
    const cvcRegex = /^\d{3}$/;
    if (!cvcRegex.test(cardCVC)) {
      alert("Nevažeći CVC. Unesite točno 3 cifre.");
      return false;
    }
    if (!cardExpiryMonth || !cardExpiryYear) {
      alert("Molimo odaberite datum isteka kartice.");
      return false;
    }
    const expiryString = `${cardExpiryYear}-${cardExpiryMonth}`;
    const expiryRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!expiryRegex.test(expiryString)) {
      alert("Nevažeći datum isteka. Koristite format YYYY-MM.");
      return false;
    }
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
            cardNumber: cardNumber.replace(/\s+/g, ""),
            cardExpiry: `${cardExpiryYear}-${cardExpiryMonth}`,
            cardCVC,
          }
        : null;
  
    // Dohvatimo activeDiscount iz Loyalty podataka
    let activeDiscount = 0;
    try {
      const loyaltyRes = await axios.get(`${getBaseUrl()}/api/loyalty`, {
        params: { userId: korisnik.id },
      });
      activeDiscount = loyaltyRes.data.activeDiscount || 0;
      console.log("Aktivni discount:", activeDiscount);
    } catch (error) {
      console.error("Greška pri pribavljanju loyalty podataka:", error);
    }
  
    /* 
       Ako je discount aktivan, pretpostavljamo da je 
       passedFlight.cijena već diskontirana (npr. 280 KM) te je originalna cijena zapravo dvostruka (560),
       dok u slučaju da discount nije aktivan, passedFlight.cijena je već originalna.
    */
    const originalPrice = activeDiscount > 0 ? passedFlight.cijena * 2 : passedFlight.cijena;
    const finalPrice = originalPrice * (1 - activeDiscount); // npr. 560 * 0.5 = 280
  
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
      cijenaKarte: finalPrice,         // finalna cijena (npr. 280 KM)
      originalCijena: originalPrice,    // originalna cijena (npr. 560 KM)
    };
  
    // Spremamo u state rezervacije (npr. za daljnje korake)
    setReservationData(bookingData);
    setShowSeatMap(true);
  
    console.log("Booking data:", bookingData);
  
    try {
      // Resetiramo activeDiscount u bazi (popust vrijedi samo za ovu rezervaciju)
      await axios.post(`${getBaseUrl()}/api/loyalty/resetDiscount`, { userId: korisnik.id });
    } catch (error) {
      console.error("Greška pri resetiranju discounta:", error);
    }
  
    // Prosljeđujemo bookingData na stranicu za odabir sjedala
    navigate("/mapa-sjedista", {
      state: { reservation: bookingData, flight: letInfo, discount: activeDiscount },
    });
  };
  
   
  if (loading) return <div>Učitavanje...</div>;
  if (greska) return <div>{greska}</div>;
  if (!letInfo) return <div>Nema informacija o letu.</div>;

  // Opcije za mjesec i godinu za karticu
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, "0");
    return (
      <option key={month} value={month}>
        {month}
      </option>
    );
  });

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
        <strong>Aviokompanija:</strong>{" "}
        {letInfo.aviokompanija?.naziv ||
          aviokompanije.find((a) => a._id === letInfo.aviokompanija?._id)?.naziv ||
          aviokompanije.find((a) => a._id === letInfo.aviokompanija)?.naziv ||
          "Nepoznato"}
      </p>
      <p>
        <strong>Broj leta:</strong> {letInfo.brojLeta}
      </p>
      <p>
        <strong>Polazak:</strong> {letInfo.polaziste}, {letInfo.vrijemePolaska}
      </p>
      <p>
        <strong>Dolazak:</strong> {letInfo.odrediste}, {letInfo.vrijemeDolaska}
      </p>
      <p>
        <strong>Prtljag dozvoljen:</strong> 1 ručni + 1 čekirani (23kg)
      </p>
      <p>
        <strong>Cijena jedne karte:</strong> {cijenaKarte} KM
      </p>
      <p>
        <strong>Klasa:</strong> {classType}
      </p>

      <h3>Odaberi opcije rezervacije</h3>
      <form className="rezervacija-forma" onSubmit={handleSubmit}>
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
                    pattern="[A-Z0-9]{1,8}"
                    value={passenger.idNumber}
                    onChange={(e) => handlePassengerChange(index, "idNumber", e.target.value.toUpperCase())}
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
                    maxLength="9"
                    pattern="[0-9]{9}"
                    value={passenger.telefon}
                    onChange={(e) => handlePassengerChange(index, "telefon", e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        )}

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
