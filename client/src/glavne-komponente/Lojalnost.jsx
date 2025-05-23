import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../kontekst/AuthContext";
import { useLanguage } from "../kontekst/LanguageContext";
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
  const { t } = useLanguage();
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
      setError(t('loyalty.redeemError'));
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
      setRedeemMsg(err.response?.data?.message || t('loyalty.redeemError'));
    }
  };

  if (loading) {
    return (
      <div className="loyalty-container">
        <p>{t('common.loading')}</p>
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
      ? t('loyalty.discountActive')
      : `${t('loyalty.totalPoints')}: ${loyalty.totalPoints} - ${t('loyalty.notEnoughPoints')} (${t('common.required')}: ${REDEEM_THRESHOLD})`;

  // Kreiramo listu za prikaz loyalty zapisa tako da izbacimo one zapise vezane uz redemption
  const displayBreakdown =
    loyalty.breakdown && Array.isArray(loyalty.breakdown)
      ? loyalty.breakdown.filter(
          (item) => item.flightNumber !== "REDEMPTION"
        )
      : [];

  return (
    <div className="loyalty-container">
      <h2 className="loyalty-header">{t('loyalty.title')}</h2>
      
    {/* {loyaltyNotification && (
        <div className="loyalty-notification">
          {loyaltyNotification}
        </div>
    )} */}

      <p className="loyalty-summary">
        {t('loyalty.totalPoints')}:{" "}
        <span className="loyalty-points">
          <img src={coin} alt="Coin" className="loyalty-coin" />
          <span className="loyalty-number">{loyalty.totalPoints}</span>
        </span>
      </p>

      <p className="loyalty-redeem-message">{redeemInfo}</p>

      {/* Dugme za otkupljivanje poena ako ih ima dovoljno */}
      {loyalty.totalPoints >= REDEEM_THRESHOLD && (
        <button className="loyalty-redeem-button" onClick={handleRedeem}>
          {t('loyalty.redeemPoints')} ({REDEEM_THRESHOLD} {t('loyalty.points')})
        </button>
      )}

      {/* Poruka nakon otkupa */}
      {redeemMsg && <p className="loyalty-redeem-result">{redeemMsg}</p>}

      {/* Prikaz loyalty history */}
      <h3 className="loyalty-history-header">{t('loyalty.pointsHistory')}</h3>
      {displayBreakdown && displayBreakdown.length > 0 ? (
        <div className="loyalty-history">
          {displayBreakdown.map((item, index) => (
            <div key={index} className="loyalty-history-item">
              <div className="loyalty-points-earned">
                <img src={coin} alt="Coin" className="loyalty-coin-small" />
                <span className="loyalty-points-text">+{item.points}</span>
              </div>
              <div className="loyalty-flight-info">
                <div className="loyalty-details">
                  <div className="loyalty-detail">
                    <span className="loyalty-label">{t('loyalty.flightNumber')}:</span> {item.flightNumber}
                  </div>
                  <div className="loyalty-detail">
                    <span className="loyalty-label">{t('loyalty.route')}:</span> {item.route || "Nepoznato"}
                  </div>
                  <div className="loyalty-detail">
                    <span className="loyalty-label">{t('loyalty.date')}:</span> {item.flightDate || "Nepoznato"}
                  </div>
                  <div className="loyalty-detail">
                    <span className="loyalty-label">{t('flights.time')}:</span> {item.flightTime || "Nepoznato"}
                  </div>
                  <div className="loyalty-detail">
                    <span className="loyalty-label">{t('loyalty.price')}:</span>{" "}
                    {item.ticketPrice ? item.ticketPrice + " KM" : "Nepoznato"}
                  </div>
                  <div className="loyalty-detail">
                    <span className="loyalty-label">{t('loyalty.points')}:</span> {item.points}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center" }}>
          {t('loyalty.pointsHistory')} - {t('common.info')}.
        </p>
      )}

      <div className="loyalty-footer">
        <Link to="/pocetna" className="loyalty-link">
          {t('nav.home')}
        </Link>
      </div>
    </div>
  );
};

export default Lojalnost;
