import { Loyalty, Let } from "../modeli/modeli.js";
import mongoose from "mongoose";

// Dohvaća loyalty podatke za određenog korisnika preko query parametra ?userId=
export const getLoyalty = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "Nedostaje userId" });
    }

    const loyalty = await Loyalty.findOne({ user: userId });
    if (!loyalty) {
      // Ako nema loyalty zapisa, vratite 0 activeDiscount
      return res.status(200).json({ totalPoints: 0, activeDiscount: 0, breakdown: [] });
    }

    return res.status(200).json({
      totalPoints: loyalty.totalPoints,
      activeDiscount: loyalty.activeDiscount || 0,
      breakdown: loyalty.breakdown,
    });
  } catch (error) {
    console.error("Greška pri dohvaćanju loyalty podataka:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const updateLoyaltyAfterBooking = async (booking) => {
  try {
    if (booking.cijenaKarte && booking.bookingNumber) {
      const flightData = await Let.findById(booking.flight)
        .populate("aviokompanija")
        .select("polaziste odrediste datumPolaska vrijemePolaska vrijemeDolaska brojLeta aviokompanija")
        .exec();

      if (!flightData || !flightData.aviokompanija) {
        console.log("Nedostaju podaci o letu ili aviokompaniji.");
        return;
      }

      const percentage = flightData.aviokompanija.percentagePoints || 0;
      // Koristimo booking.cijenaKarte (konačnu, diskontiranu cijenu) za obračun loyalty bodova.
      const pointsEarned = Math.floor(booking.cijenaKarte * percentage);

      const formattedDate = flightData.datumPolaska
        ? new Date(flightData.datumPolaska).toLocaleDateString("hr-HR")
        : "Nepoznato";

      const route =
        flightData.polaziste && flightData.odrediste
          ? `${flightData.polaziste} - ${flightData.odrediste}`
          : "Nepoznato";

      const flightTime =
        flightData.vrijemePolaska && flightData.vrijemeDolaska
          ? `${flightData.vrijemePolaska} - ${flightData.vrijemeDolaska}`
          : "Nepoznato";

      // U breakdownu koristimo konačnu cijenu (booking.cijenaKarte) umjesto originalne.
      const breakdownEntry = {
        bookingId: booking._id,
        flightNumber: flightData.brojLeta || "Nepoznato",
        points: pointsEarned,
        route: route,
        flightDate: formattedDate,
        flightTime: flightTime,
        ticketPrice: booking.cijenaKarte, // sada će se prikazivati npr. 280 KM
      };

      let loyalty = await Loyalty.findOne({ user: booking.user });
      if (!loyalty) {
        loyalty = new Loyalty({
          user: booking.user,
          totalPoints: pointsEarned,
          breakdown: [breakdownEntry],
        });
      } else {
        loyalty.totalPoints += pointsEarned;
        loyalty.breakdown.push(breakdownEntry);
      }

      await loyalty.save();
      console.log("Ažurirani loyalty podaci:", loyalty);
    } else {
      console.log("Nedostaju podaci u bookingu – cijenaKarte ili bookingNumber nisu definirani.");
    }
  } catch (error) {
    console.error("Greška pri ažuriranju loyalty nakon rezervacije:", error);
  }
};


// Definiramo prag otkupa bodova i discount
export const redeemPoints = async (req, res) => {
  try {
    const { userId, pointsToRedeem } = req.body;
    if (!userId || typeof pointsToRedeem !== "number") {
      return res.status(400).json({ message: "Nedostaju podaci za otkupljivanje poena." });
    }

    const REDEEM_THRESHOLD = 50;
    const DISCOUNT_RATE = 0.5;

    if (pointsToRedeem !== REDEEM_THRESHOLD) {
      return res.status(400).json({
        message: `Možete otkupiti tačno ${REDEEM_THRESHOLD} poena kako biste ostvarili popust.`,
      });
    }

    const loyalty = await Loyalty.findOne({ user: userId });
    if (!loyalty || loyalty.totalPoints < REDEEM_THRESHOLD) {
      return res.status(400).json({ message: "Nemate dovoljno poena za otkupljivanje." });
    }

    loyalty.totalPoints -= REDEEM_THRESHOLD;
    loyalty.breakdown.push({
      bookingId: new mongoose.Types.ObjectId(),
      flightNumber: "REDEMPTION",
      points: -REDEEM_THRESHOLD,
      route: "Otkupljeno",
      flightDate: "",
      flightTime: "",
      ticketPrice: 0,
    });
    // Postavljamo aktivni popust na 50%
    loyalty.activeDiscount = DISCOUNT_RATE;

    await loyalty.save();
    return res.status(200).json({
      message: "Poeni otkupljeni uspješno.",
      totalPoints: loyalty.totalPoints,
      discount: DISCOUNT_RATE,
    });
  } catch (error) {
    console.error("Greška pri otkupljivanju poena:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetActiveDiscount = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "Nedostaje userId" });
    }
    const loyalty = await Loyalty.findOne({ user: userId });
    if (!loyalty) {
      return res.status(404).json({ message: "Loyalty podaci nisu pronađeni." });
    }
    loyalty.activeDiscount = 0;
    await loyalty.save();
    res.status(200).json({ message: "Aktivni discount resetiran." });
  } catch (error) {
    console.error("Greška pri resetiranju discounta:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


