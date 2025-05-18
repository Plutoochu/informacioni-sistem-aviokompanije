import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../kontekst/AuthContext";
import { Link } from "react-router-dom";
import coin from "../assets/coin.png";
import "../stilovi/Lojalnost.css";

const getBaseUrl = () => {
  return window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://informacioni-sistem-za-aviokompanije.onrender.com";
};

const REDEEM_THRESHOLD = 50; // Prag otkupa bodova

const Lojalnost = () => {
  const { korisnik } = useAuth();
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [redeemMsg, setRedeemMsg] = useState("");

  // Dohvaćanje loyalty podataka
  const fetchLoyalty = async () => {
    try {
      const response = await axios.get(`${getBaseUrl()}/api/loyalty`, {
        params: { userId: korisnik.id },
      });
      setLoyalty(response.data);
    } catch (err) {
      console.error("Greška pri dohvaćanju loyalty podataka:", err);
      setError("Greška pri dohvaćanju loyalty podataka.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (korisnik && korisnik.id) {
      fetchLoyalty();
    }
  }, [korisnik]);

  // Funkcija koja poziva endpoint za otkup bodova
  const handleRedeem = async () => {
    try {
      const response = await axios.post(`${getBaseUrl()}/api/loyalty/redeem`, {
        userId: korisnik.id,
        pointsToRedeem: REDEEM_THRESHOLD,
      });
      setRedeemMsg(response.data.message);
      // Osvježavanje stanja loyalty podataka nakon otkupa
      fetchLoyalty();
    } catch (err) {
      console.error("Greška pri otkupljivanju poena:", err);
      setRedeemMsg(err.response?.data?.message || "Došlo je do greške pri otkupljivanju bodova.");
    }
  };

  if (loading) {
    return (
      <div className="loyalty-container">
        <p>Učitavanje loyalty podataka...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loyalty-container">
        <p>{error}</p>
      </div>
    );
  }

  // Notifikacija (opcionalno): uzimamo zadnji unos iz breakdowna
  const loyaltyNotification =
    loyalty.breakdown && loyalty.breakdown.length > 0
      ? `Osvojili ste ${loyalty.breakdown[loyalty.breakdown.length - 1].points} poena za let ${loyalty.breakdown[loyalty.breakdown.length - 1].route || "Nepoznato"}!`
      : "";

  // Poruka o mogućnosti otkupa bodova:
  const redeemInfo =
    loyalty.totalPoints >= REDEEM_THRESHOLD
      ? "Imate dovoljno bodova za otkup bodova!"
      : `Imate skupljenih ${loyalty.totalPoints} bodova – potrebno je minimalno ${REDEEM_THRESHOLD} bodova za otkup.`;

  // Kreiramo listu za prikaz loyalty zapisa tako da izbacimo one zapise vezane uz redemption
  const displayBreakdown =
    loyalty.breakdown && Array.isArray(loyalty.breakdown)
      ? loyalty.breakdown.filter(
          (item) => item.flightNumber !== "REDEMPTION"
        )
      : [];

  return (
    <div className="loyalty-container">
      <h2 className="loyalty-header">Loyalty Program</h2>
      
    {/* {loyaltyNotification && (
        <div className="loyalty-notification">
          {loyaltyNotification}
        </div>
    )} */}

      <p className="loyalty-summary">
        Vaše trenutno stanje loyalty poena:{" "}
        <span className="loyalty-points">
          <img src={coin} alt="Coin" className="loyalty-coin" />
          <span className="loyalty-number">{loyalty.totalPoints}</span>
        </span>
      </p>

      <p className="loyalty-redeem-message">{redeemInfo}</p>

      {loyalty.totalPoints >= REDEEM_THRESHOLD && (
        <button onClick={handleRedeem} className="redeem-button">
          Otkupi {REDEEM_THRESHOLD} bodova za 50% popusta
        </button>
      )}

      {redeemMsg && (
        <div className="redeem-message">
          {redeemMsg}
        </div>
      )}

      <h3 className="loyalty-header" style={{ fontSize: "1.5rem" }}>
        Detalji po rezervacijama
      </h3>

      {displayBreakdown && displayBreakdown.length > 0 ? (
        <div className="loyalty-breakdown">
          {displayBreakdown.map((item) => (
            <div key={item.bookingId} className="loyalty-item">
              <div className="loyalty-item-content">
                <div className="loyalty-item-header">
                  Rezervacija: {item.bookingId}
                </div>
                <div className="loyalty-details">
                  <div className="loyalty-detail">
                    <span className="loyalty-label">Let:</span> {item.flightNumber}
                  </div>
                  <div className="loyalty-detail">
                    <span className="loyalty-label">Ruta:</span> {item.route || "Nepoznato"}
                  </div>
                  <div className="loyalty-detail">
                    <span className="loyalty-label">Datum leta:</span> {item.flightDate || "Nepoznato"}
                  </div>
                  <div className="loyalty-detail">
                    <span className="loyalty-label">Vrijeme:</span> {item.flightTime || "Nepoznato"}
                  </div>
                  <div className="loyalty-detail">
                    <span className="loyalty-label">Cijena karte:</span>{" "}
                    {item.ticketPrice ? item.ticketPrice + " KM" : "Nepoznato"}
                  </div>
                  <div className="loyalty-detail">
                    <span className="loyalty-label">Loyalty poeni:</span> {item.points}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center" }}>
          Nema podataka o loyalty poenima za rezervacije.
        </p>
      )}

      <div className="loyalty-footer">
        <Link to="/pocetna" className="loyalty-link">
          Povratak na početnu
        </Link>
      </div>
    </div>
  );
};

export default Lojalnost;
