import mongoose from "mongoose";
import { Booking, Let, Avion } from "../modeli/modeli.js";

/**
 * Parsira konfiguracijski string sjedala.
 * Očekivani format: "F10C20Y120"
 * Vraća objekt:
 * {
 *   first: { totalRows: 10 },
 *   business: { totalRows: 20 },
 *   economy: { totalRows: 120 }
 * }
 */
function parseSeatConfiguration(configStr) {
  const regex = /F(\d+)[Cc](\d+)[Yy](\d+)/;
  const match = configStr.match(regex);
  if (!match) {
    throw new Error("Neispravna konfiguracija sjedala.");
  }
  return {
    first: { totalRows: parseInt(match[1], 10) },
    business: { totalRows: parseInt(match[2], 10) },
    economy: { totalRows: parseInt(match[3], 10) },
  };
}

/**
 * Pomoćna funkcija koja pretvara slovo u index (A->0, B->1, …)
 */
function seatLetterToIndex(letter) {
  return letter.charCodeAt(0) - "A".charCodeAt(0);
}

/**
 * Validira pojedino sjedalo.
 * @param {string} seatId - oznaka sjedala, npr. "B4"
 * @param {object} config - konfiguracija sjedala, rezultat parseSeatConfiguration
 * @param {string} selectedClass - "Prva klasa", "Biznis" ili "Ekonomska"
 * @param {object} seatsPerRow - Broj sjedala po redu, npr. { first: 4, business: 4, economy: 6 }
 * @returns {boolean} - true ako je sjedalo validno
 */
function validateSeat(seatId, config, selectedClass, seatsPerRow) {
  let classKey;
  if (selectedClass === "Prva klasa") {
    classKey = "first";
  } else if (selectedClass === "Biznis") {
    classKey = "business";
  } else if (selectedClass === "Ekonomska") {
    classKey = "economy";
  } else {
    return false;
  }
  // Izvuci oznaku sjedala (prvo slovo) i red (ostatak stringa)
  const seatLetter = seatId.charAt(0);
  const row = parseInt(seatId.substring(1), 10);
  if (Number.isNaN(row)) return false;
  const classConfig = config[classKey];
  // Provjera redova
  if (row < 1 || row > classConfig.totalRows) return false;
  // Provjera kolona – kolona se dobiva iz abecednog indeksa
  const letterIndex = seatLetterToIndex(seatLetter);
  if (letterIndex < 0 || letterIndex >= seatsPerRow[classKey]) return false;
  return true;
}

export const getBookedSeats = async (req, res) => {
    try {
      const flightId = req.params.id;
      const bookings = await Booking.find({ flight: flightId });
      const bookedSeats = bookings.reduce((acc, booking) => {
        if (booking.seatSelection && Array.isArray(booking.seatSelection)) {
          return acc.concat(booking.seatSelection);
        }
        return acc;
      }, []);
      res.json({ bookedSeats });
    } catch (error) {
      console.error("Greška pri dohvatu sjedala:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

export const confirmSeatReservation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      flightId,
      bookingNumber,
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

    if (!flightId || !seatSelection || seatSelection.length === 0) {
      return res.status(400).json({ error: "Nedostaju potrebni podaci." });
    }

    // Dohvatanje leta
    const letDoc = await Let.findById(flightId).session(session);
    if (!letDoc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Let nije pronađen." });
    }

    // Dohvatanje aviona koji se odnosi na ovaj let
    const avion = await Avion.findById(letDoc.avionId).session(session);
    if (!avion) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Avion nije pronađen." });
    }

    // Parsiranje konfiguracije sjedala (npr. "F10C20Y120") iz letDoc
    const parsedConfig = parseSeatConfiguration(letDoc.seatConfiguration);
    // Broj sjedala po redu iz Aviona (npr. Avion.sjedalaPoRedu daje { F: 4, C: 4, Y: 6 })
    const seatsPerRow = {
      first: avion.sjedalaPoRedu.F,
      business: avion.sjedalaPoRedu.C,
      economy: avion.sjedalaPoRedu.Y,
    };

    // Validacija svakog odabranog sjedala prema konfiguraciji
    for (const seat of seatSelection) {
      if (!validateSeat(seat, parsedConfig, classType, seatsPerRow)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: `Sjedište ${seat} nije validno za ${classType} klasu.` });
      }
    }

    const existingBookings = await Booking.find({ flight: flightId }).session(session);
    const bookedSeats = existingBookings.reduce((acc, booking) => {
      if (booking.seatSelection && Array.isArray(booking.seatSelection)) {
        return acc.concat(booking.seatSelection);
      }
      return acc;
    }, []);
    const conflictSeats = seatSelection.filter((seat) => bookedSeats.includes(seat));
    if (conflictSeats.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ error: "Jedno ili više sjedala je već rezervirano.", conflictSeats });
    }

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

    await newBooking.save({ session });
    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({ message: "Rezervacija sjedala uspješna!", booking: newBooking });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Greška pri rezervaciji sjedala:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
