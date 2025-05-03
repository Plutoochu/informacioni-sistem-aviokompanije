// rezervacijaKontroleri.js
import { Booking, Let } from "../modeli/modeli.js";
import nodemailer from "nodemailer";

// Konfiguracija transporter-a pomoću NodeMailer-a
const transporter = nodemailer.createTransport({
  service: "gmail", // ili drugi SMTP servis po potrebi
  auth: {
    user: process.env.EMAIL_USER, // npr. "moja.adresa@gmail.com"
    pass: process.env.EMAIL_PASS, // lozinka ili API ključ (po mogućnosti app password)
  },
});

// Funkcija za slanje potvrde emaila
const sendConfirmationEmail = async (to, booking) => {
  // Kreiramo HTML sadržaj emaila koristeći podatke rezervacije
  const htmlContent = `
    <h1>Potvrda rezervacije</h1>
    <p>Poštovani/a,</p>
    <p>Vaša rezervacija <strong>${booking.bookingNumber}</strong> je uspješno kreirana.</p>
    <p>
      <strong>Let:</strong> ${booking.flight.flightNumber}<br/>
      <strong>Klasa:</strong> ${booking.classType}<br/>
      <strong>Tip karte:</strong> ${booking.ticketType}
    </p>
    ${
      booking.seatSelection && booking.seatSelection.length
        ? `<p><strong>Izabrana sjedala:</strong> ${booking.seatSelection.join(", ")}</p>`
        : ""
    }
    <p><strong>Putnici:</strong></p>
    <ul>
      ${booking.passengers.map((p) => `<li>${p.ime} ${p.prezime} - ${p.email}</li>`).join("")}
    </ul>
    <p>Hvala na kupovini!</p>
  `;

  const mailOptions = {
    from: `"Aviokompanija" <${process.env.EMAIL_USER}>`,
    to, // primatelj – email adresa kupca
    subject: `Potvrda rezervacije - ${booking.bookingNumber}`,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

export const createBooking = async (req, res) => {
  try {
    const {
      bookingNumber,
      flightId,
      classType,
      ticketType,
      adultsCount,
      childrenCount,
      infantsCount,
      passengers,
      paymentMethod,
      cardDetails,
      seatSelection,
    } = req.body;

    // Validacija obaveznih podataka
    if (
      !bookingNumber ||
      !flightId ||
      !classType ||
      !ticketType ||
      !passengers ||
      typeof adultsCount === "undefined" ||
      typeof childrenCount === "undefined" ||
      typeof infantsCount === "undefined"
    ) {
      return res.status(400).json({ message: "Nedostaju obavezni podaci." });
    }

    // Ako se plaća karticom, validiraj podatke o kartici
    if (paymentMethod === "Kartica") {
      if (!cardDetails || !cardDetails.cardNumber || !cardDetails.cardExpiry || !cardDetails.cardCVC) {
        return res.status(400).json({ message: "Nedostaju podaci o kartici." });
      }
      if (!/^\d{16}$/.test(cardDetails.cardNumber)) {
        return res.status(400).json({ message: "Nevažeći broj kartice. Unesite 16 cifara." });
      }
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(cardDetails.cardExpiry)) {
        return res.status(400).json({ message: "Nevažeći datum isteka. Koristite format YYYY-MM." });
      }
      if (!/^\d{3}$/.test(cardDetails.cardCVC)) {
        return res.status(400).json({ message: "Nevažeći CVC. Unesite 3 cifre." });
      }
    }

    // Provera da li let postoji
    const flight = await Let.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: "Let nije pronađen." });
    }

    // Kreiranje nove rezervacije
    const newBooking = new Booking({
      bookingNumber,
      flight: flightId,
      classType,
      ticketType,
      adultsCount,
      childrenCount,
      infantsCount,
      passengers,
      paymentMethod,
      cardDetails: paymentMethod === "Kartica" ? cardDetails : undefined,
      seatSelection,
    });

    await newBooking.save();

    // Populiramo podatke o letu radi uključivanja u email
    const populatedBooking = await Booking.findById(newBooking._id).populate("flight");

    // Pokušavamo poslati email potvrde na adresu prvog putnika
    try {
      const recipientEmail = newBooking.passengers[0]?.email;
      if (recipientEmail) {
        await sendConfirmationEmail(recipientEmail, populatedBooking);
      }
    } catch (emailError) {
      console.error("Greška slanja emaila:", emailError);
      // Ako slanje emaila ne uspije, rezervacija se još uvijek kreira – samo se loguje greška.
    }

    res.status(201).json({ message: "Rezervacija uspješna!", booking: newBooking });
  } catch (err) {
    console.error("Greška prilikom kreiranja rezervacije:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
