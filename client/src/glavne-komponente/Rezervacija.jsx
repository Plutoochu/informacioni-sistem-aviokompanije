import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const getBaseUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }
  return "https://informacioni-sistem-za-aviokompanije.onrender.com";
};

const Rezervacija = () => {
  const { id } = useParams();
  const [letInfo, setLetInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greska, setGreska] = useState(null);
  const [cijena, setCijena] = useState(0);
  const [bookingNumber, setBookingNumber] = useState("");

  const generisiBookingBroj = () => {
    return "BK-" + Math.floor(100000 + Math.random() * 900000); // npr. BK-458239
  };

  const generisiCijenu = () => {
    return Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
  };

  useEffect(() => {
    const fetchLet = async () => {
      try {
        const response = await axios.get(`${getBaseUrl()}/api/letovi/${id}`);
        setLetInfo(response.data);
        setCijena(generisiCijenu());
        setBookingNumber(generisiBookingBroj());
      } catch (err) {
        console.error("Greška pri dohvatanju leta:", err);
        setGreska("Nismo mogli dohvatiti podatke o letu.");
      } finally {
        setLoading(false);
      }
    };

    fetchLet();
  }, [id]);

  if (loading) return <div>Učitavanje...</div>;
  if (greska) return <div>{greska}</div>;
  if (!letInfo) return <div>Nema informacija o letu.</div>;

  return (
    <div className="booking-container">
      <h2>Detalji rezervacije</h2>

      <p><strong>Booking broj:</strong> {bookingNumber}</p>
      <p><strong>Aviokompanija:</strong> {letInfo.avionId?.naziv || "Nepoznato"}</p>
      <p><strong>Broj leta:</strong> {letInfo.flightNumber}</p>

      <p>
        <strong>Polazak:</strong> {letInfo.origin}, {letInfo.departureTime}
      </p>
      <p>
        <strong>Dolazak:</strong> {letInfo.destination}, {letInfo.arrivalTime}{" "}
        {letInfo.dolazakSljedeciDan ? "(sljedeći dan)" : ""}
      </p>

      <p><strong>Prtljag dozvoljen:</strong> 1 ručni + 1 čekirani (23kg)</p>
      <p><strong>Cijena karte:</strong> {letInfo.cijena} €</p>

      <h3>Unesite podatke putnika</h3>
      <form className="rezervacija-forma">
        <input type="text" placeholder="Ime i prezime" required />
        <input type="email" placeholder="Email" required />
        <input type="text" placeholder="Broj pasoša" required />
        <button type="submit">Potvrdi rezervaciju</button>
      </form>
    </div>
  );
};

export default Rezervacija;
