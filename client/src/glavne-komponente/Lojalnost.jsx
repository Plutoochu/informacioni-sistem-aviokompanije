import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../kontekst/AuthContext";
import { Link } from "react-router-dom";
import coin from "../assets/coin.png";  // Pretpostavljamo da se slika nalazi u assets folderu
import "../stilovi/Lojalnost.css";

const getBaseUrl = () => {
  return window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://informacioni-sistem-za-aviokompanije.onrender.com";
};

const Lojalnost = () => {
  const { korisnik } = useAuth();
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

    if (korisnik && korisnik.id) {
      fetchLoyalty();
    }
  }, [korisnik]);

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

  return (
    <div className="loyalty-container">
      <h2 className="loyalty-header">Loyalty Program</h2>
      <p className="loyalty-summary">
        Vaše trenutno stanje loyalty poena:{" "}
        <span className="loyalty-points">
          <img src={coin} alt="Coin" className="loyalty-coin" />
          <span className="loyalty-number">{loyalty.totalPoints}</span>
        </span>
      </p>
      <h3 className="loyalty-header" style={{ fontSize: "1.5rem" }}>
        Detalji po rezervacijama
      </h3>
      
      {loyalty.breakdown && loyalty.breakdown.length > 0 ? (
        <div className="loyalty-breakdown">
          {loyalty.breakdown.map((item) => (
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
                    <span className="loyalty-label">Cijena karte:</span> {item.ticketPrice ? item.ticketPrice + " KM" : "Nepoznato"}
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
