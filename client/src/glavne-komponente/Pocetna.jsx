import { Link, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useAuth } from "../kontekst/AuthContext";
import { useLanguage } from "../kontekst/LanguageContext";
import { dohvatiNotifikacije, oznaciKaoProcitano } from "../pomocne-funkcije/fetch-funkcije";

const Pocetna = () => {
  const { korisnik } = useAuth();
  const { t } = useLanguage();
  const [notifikacije, setNotifikacije] = useState([]);

  useEffect(() => {
    const fetchNotifikacije = async () => {
      try {
        if (korisnik) {
          const response = await dohvatiNotifikacije();
          console.log("🎯 Notifikacije primljene:", response);
          setNotifikacije(response); // Set the notifications in state
        }
      } catch (err) {
        console.error("Greška pri dohvaćanju notifikacija:", err);
      }
    };

    fetchNotifikacije();
  }, [korisnik]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await oznaciKaoProcitano(notificationId);
      console.log("🎯 Notifikacija označena kao pročitana:", response);

      // Remove the notification from the UI by updating the state
      setNotifikacije((prevNotifikacije) =>
        prevNotifikacije.filter((n) => n._id !== notificationId)
      );
    } catch (err) {
      console.error("Greška pri označavanju notifikacije kao pročitane:", err);
    }
  };

  if (korisnik && korisnik.uloga === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return (
    <div className="pocetna-container">
      <div className="pocetna-card">
        <h2>{t('dashboard.welcome')}, {korisnik.ime}!</h2>
        {notifikacije && notifikacije.length > 0 ? (
          <div className="notifikacije-banner">
            <h3>📢 {t('notifications.title')}:</h3>
            <ul>
              {notifikacije.map((n) => (
                <li key={n._id}>
                  {n.poruka}
                  {!n.procitano && (
                    <button
                      onClick={() => handleMarkAsRead(n._id)}
                      className="mark-as-read-button"
                    >
                      {t('notifications.markAsRead')}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>{t('notifications.noNewNotifications')}</p>
        )}

        <p>{t('home.subtitle')}</p>
        <div className="pocetna-opcije">
          <Link to="/profil" className="pocetna-opcija">
            <div className="pocetna-opcija-kartica">
              <h3>{t('nav.profile')}</h3>
              <p>{t('dashboard.manageProfile')}</p>
            </div>
          </Link>
          <Link to="/letovi" className="pocetna-opcija">
            <div className="pocetna-opcija-kartica">
              <h3>{t('nav.flights')}</h3>
              <p>{t('home.searchFlights')}</p>
            </div>
          </Link>
          {/* Kartica za Rezervacije */}
          <Link to="/rezervacije" className="pocetna-opcija">
            <div className="pocetna-opcija-kartica">
              <h3>{t('nav.reservations')}</h3>
              <p>{t('home.manageBookings')}</p>
            </div>
          </Link>
          {/* Nova kartica za Loyalty */}
          <Link to="/loyalty" className="pocetna-opcija">
            <div className="pocetna-opcija-kartica">
              <h3>{t('nav.loyalty')}</h3>
              <p>{t('dashboard.loyaltyPoints')}</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pocetna;
