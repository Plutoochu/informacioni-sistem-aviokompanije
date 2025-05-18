import { Booking, Let, Loyalty } from "../modeli/modeli.js";
import nodemailer from "nodemailer";
import { updateLoyaltyAfterBooking } from "../kontroleri/lojalnostKontroleri.js";  // Uvoz funkcije za update loyalty

// Konfiguracija transporter-a pomoću NodeMailer-a
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false,
  auth: { user: "apikey", pass: process.env.SENDGRID_API_KEY },
  tls: { rejectUnauthorized: false },
});

// Funkcija za slanje potvrde emaila
const sendConfirmationEmail = async (to, booking) => {
  const htmlContent = `
    <h1>Potvrda rezervacije</h1>
    <p>Poštovani/a,</p>
    <p>Vaša rezervacija <strong>${booking.bookingNumber}</strong> je uspješno kreirana.</p>
    <p>
      <strong>Let:</strong> ${booking.flight.brojLeta}<br/>
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
    from: `"NRS Aviokompanija" <${process.env.SENDER_EMAIL}>`,
    to,
    subject: `Potvrda rezervacije - ${booking.bookingNumber}`,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

// Funkcija za slanje emaila o otkazivanju
export const sendCancellationEmail = async (to, korisnikIme, booking, letInfo, otkazaniPeriod) => {
  const htmlContent = `
    <h1>Otkazivanje leta</h1>
    <p>Poštovani/a ${korisnikIme},</p>
    <p>Obavještavamo Vas da je let <strong>${letInfo.brojLeta}</strong> na koji ste izvršili rezervaciju <strong>${booking.bookingNumber}</strong> otkazan u periodu od <strong>${otkazaniPeriod.from}</strong> do <strong>${otkazaniPeriod.to}</strong>.</p>
    <p>Molimo Vas da kontaktirate podršku radi daljih koraka (promjena ili povrat novca).</p>
    <p>Hvala na razumijevanju,</p>
  `;

  const mailOptions = {
    from: `"NRS Aviokompanija" <${process.env.SENDER_EMAIL}>`,
    to,
    subject: `Otkazivanje leta - ${letInfo.brojLeta}`,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

export const createBooking = async (req, res) => {
  try {
    const {
      flightId,
      classType,
      ticketType,
      passengers,
      paymentMethod,
      cardDetails,
      seatSelection,
      userId,
      cijenaKarte,    // konačna cijena (npr. 560 KM)
      originalCijena, // može biti poslano, a ako nije, postavit ćemo default na cijenaKarte
    } = req.body;

    // Ako originalCijena nije poslan, postavljamo je na vrijednost cijenaKarte.
    const originalCijenaFinal = originalCijena || cijenaKarte;
    
    // Debugging log – ispišite payload koji ste primili u createBooking
    console.log("createBooking payload:", { 
      flightId, 
      classType, 
      ticketType, 
      passengers, 
      paymentMethod, 
      cardDetails, 
      seatSelection, 
      userId, 
      cijenaKarte, 
      originalCijena: originalCijenaFinal 
    });

    if (
      !flightId ||
      !classType ||
      !ticketType ||
      !passengers ||
      !userId ||
      !cijenaKarte ||
      !originalCijenaFinal
    ) {
      return res.status(400).json({
        message:
          "Nedostaju obavezni podaci (uključujući originalCijena i cijenaKarte).",
      });
    }

    const flight = await Let.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: "Let nije pronađen." });
    }

    const createdBookings = [];

    // Kreiramo rezervaciju za svakog putnika – jedna rezervacija po putniku
    for (let i = 0; i < passengers.length; i++) {
      const bookingNumber =
        "BK-" + Math.floor(100000 + Math.random() * 900000) + "-" + (i + 1);

      const seatForPassenger = Array.isArray(seatSelection)
        ? [seatSelection[i]]
        : [];

      const newBooking = new Booking({
        bookingNumber,
        flight: flightId,
        classType,
        ticketType,
        adultsCount: 1,
        childrenCount: 0,
        infantsCount: 0,
        passengers: [passengers[i]],
        paymentMethod,
        cardDetails: paymentMethod === "Kartica" ? cardDetails : undefined,
        seatSelection: seatForPassenger,
        user: userId,
        status: "active",
        cijenaKarte,         // finalna cijena (npr. 560 KM)
        originalCijena: originalCijenaFinal, // originalna cijena (ako nema popusta, jednaka je finalnoj)
      });

      await newBooking.save();
      await updateLoyaltyAfterBooking(newBooking);
      createdBookings.push(newBooking);
    }
    
    // Reset activeDiscount za korisnika – discount vrijedi samo za ovu rezervaciju
    const loyalty = await Loyalty.findOne({ user: userId });
    if (loyalty) {
      loyalty.activeDiscount = 0;
      await loyalty.save();
    }

    res.status(201).json({ message: "Rezervacija uspješna!", bookings: createdBookings });
  } catch (err) {
    console.error("Greška prilikom kreiranja rezervacije:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId, userId } = req.body;
    if (!bookingId || !userId) {
      return res.status(400).json({ message: "Nedostaju bookingId ili userId." });
    }
    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) {
      return res.status(404).json({ message: "Rezervacija nije pronađena ili ne pripada korisniku." });
    }
    booking.status = "canceled";
    await booking.save();
    return res.status(200).json({ message: "Rezervacija uspješno poništena.", booking });
  } catch (error) {
    console.error("Greška pri poništavanju rezervacije:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

export const modifyBooking = async (req, res) => {
  try {
    const { bookingId, userId, newSeatSelection, otherChanges } = req.body;
    if (!bookingId || !userId) {
      return res.status(400).json({ message: "Nedostaju bookingId ili userId." });
    }
    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) {
      return res.status(404).json({ message: "Rezervacija nije pronađena ili ne pripada korisniku." });
    }
    if (newSeatSelection && Array.isArray(newSeatSelection)) {
      const otherBookings = await Booking.find({
        flight: booking.flight,
        status: "active",
        _id: { $ne: bookingId },
      }).select("seatSelection");

      let occupiedSeats = [];
      otherBookings.forEach((otherBooking) => {
        if (otherBooking.seatSelection && Array.isArray(otherBooking.seatSelection)) {
          occupiedSeats = occupiedSeats.concat(otherBooking.seatSelection);
        }
      });

      const conflictSeats = newSeatSelection.filter((seat) => occupiedSeats.includes(seat));
      if (conflictSeats.length > 0) {
        return res.status(409).json({
          message: "Odabrana sjedala su već rezervirana.",
          conflictSeats,
        });
      }

      booking.seatSelection = newSeatSelection;
    }
    if (otherChanges) {
      Object.assign(booking, otherChanges);
    }
    const updatedBooking = await booking.save();
    return res.status(200).json({ message: "Rezervacija uspješno izmijenjena.", booking: updatedBooking });
  } catch (error) {
    console.error("Greška pri izmjeni rezervacije:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "Nedostaje userId." });
    }
    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "flight",
        populate: { path: "aviokompanija", select: "naziv" },
      })
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Greška pri dohvaćanju rezervacija:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};
