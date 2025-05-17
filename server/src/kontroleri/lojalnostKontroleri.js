import { Loyalty, Let } from "../modeli/modeli.js";

// Dohvaća loyalty podatke za određenog korisnika preko query parametra ?userId=
export const getLoyalty = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "Nedostaje userId" });
    }

    const loyalty = await Loyalty.findOne({ user: userId });
    if (!loyalty) {
      return res.status(200).json({ totalPoints: 0, breakdown: [] });
    }

    return res.status(200).json({
      totalPoints: loyalty.totalPoints,
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
        .select(
          "polaziste odrediste datumPolaska vrijemePolaska vrijemeDolaska brojLeta aviokompanija"
        )
        .exec();

      if (!flightData || !flightData.aviokompanija) {
        console.log("Nedostaju podaci o letu ili aviokompaniji.");
        return;
      }

      const percentage = flightData.aviokompanija.percentagePoints || 0;

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

      const breakdownEntry = {
        bookingId: booking._id,
        flightNumber: flightData.brojLeta || "Nepoznato",
        points: pointsEarned,
        route: route,
        flightDate: formattedDate,
        flightTime: flightTime,
        ticketPrice: booking.cijenaKarte,
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
      console.log(
        "Nedostaju podaci u bookingu – cijenaKarte ili bookingNumber nisu definirani."
      );
    }
  } catch (error) {
    console.error("Greška pri ažuriranju loyalty nakon rezervacije:", error);
  }
};

// Endpoint za otkupljivanje (redeem) loyalty poena
export const redeemPoints = async (req, res) => {
  try {
    const { userId, pointsToRedeem } = req.body;
    if (!userId || typeof pointsToRedeem !== "number") {
      return res
        .status(400)
        .json({ message: "Nedostaju podaci za otkupljivanje poena." });
    }

    const loyalty = await Loyalty.findOne({ user: userId });
    if (!loyalty || loyalty.totalPoints < pointsToRedeem) {
      return res
        .status(400)
        .json({ message: "Nemate dovoljno poena za otkupljivanje." });
    }

    loyalty.totalPoints -= pointsToRedeem;
    loyalty.breakdown.push({
      bookingId: null,
      flightNumber: "REDEMPTION",
      points: -pointsToRedeem,
      route: "",
      flightDate: "",
      flightTime: "",
      ticketPrice: 0,
    });

    await loyalty.save();
    return res.status(200).json({
      message: "Poeni otkupljeni uspješno.",
      totalPoints: loyalty.totalPoints,
    });
  } catch (error) {
    console.error("Greška pri otkupljivanju poena:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
