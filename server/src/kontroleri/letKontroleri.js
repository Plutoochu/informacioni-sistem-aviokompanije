import {
  Let,
  Avion,
  OtkazaniLet,
  Notifikacija,
  Korisnik,
} from "../modeli/modeli.js";

const parseCustomDate = (dateStr) => {
  const [day, month, year] = dateStr.split("/").map(Number);
  const date = new Date(year, month - 1, day);
  return date;
};

const formatCustomDate = (date) => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
};

// Helper funkcija za validaciju datuma
const isValidDate = (day, month, year) => {
  const date = new Date(year, month - 1, day);
  return (
    date.getDate() === parseInt(day) &&
    date.getMonth() === parseInt(month) - 1 &&
    date.getFullYear() === parseInt(year)
  );
};

export const dohvatiLetove = async (req, res) => {
  try {
    const { odrediste, datumPolaska } = req.query;
    console.log("Server primio zahtjev sa parametrima:", {
      odrediste,
      datumPolaska,
    });

    let query = {};

    if (odrediste) {
      query.odrediste = { $regex: new RegExp(odrediste, "i") };
    }

    if (datumPolaska) {
      const [dan, mjesec, godina] = datumPolaska.split("/").map(Number);

      if (!isValidDate(dan, mjesec, godina)) {
        console.log("Neispravan format datuma:", datumPolaska);
        return res.status(400).json({
          message: "Neispravan format datuma. Koristite DD/MM/YYYY format.",
        });
      }

      const startDate = new Date(godina, mjesec - 1, dan);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(godina, mjesec - 1, dan);
      endDate.setHours(23, 59, 59, 999);

      query.datumPolaska = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    console.log("MongoDB query:", query);
    const letovi = await Let.find(query)
      .sort({ datumPolaska: 1 })
      .populate("avionId", "naziv model brojSjedista")
      .lean();

    console.log("Pronađeni letovi:", letovi);

    const formattedLetovi = letovi.map((let_) => {
      const date = new Date(let_.datumPolaska);
      return {
        ...let_,
        datumPolaska: `${date.getDate().toString().padStart(2, "0")}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${date.getFullYear()}`,
      };
    });

    console.log("Formatirani letovi za slanje:", formattedLetovi);
    res.status(200).json(formattedLetovi);
  } catch (error) {
    console.error("Greška pri dohvatanju letova:", error);
    res.status(500).json({ message: "Greška pri dohvatanju letova" });
  }
};

export const dodajLet = async (req, res) => {
  try {
    const noviLet = new Let(req.body);
    await noviLet.save();
    res.status(201).json(noviLet);
  } catch (error) {
    // Ovo šalje TAČNU poruku validacije npr. "Arrival time must be after departure time"
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res
      .status(500)
      .json({ message: "Greška pri dodavanju leta.", details: error.message });
  }
};

export const dohvatiLet = async (req, res) => {
  try {
    const let_ = await Let.findById(req.params.id);
    if (!let_) {
      return res.status(404).json({ message: "Let nije pronađen" });
    }
    res.status(200).json(let_);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvatanju leta" });
  }
};

export const dohvatiDestinacije = async (req, res) => {
  try {
    const destinacije = await Let.distinct("odrediste");
    res.status(200).json(destinacije.sort());
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvatanju destinacija" });
  }
};

export const azurirajLet = async (req, res) => {
  try {
    const let_ = await Let.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!let_) {
      return res.status(404).json({ message: "Let nije pronađen" });
    }
    res.status(200).json(let_);
  } catch (error) {
    res.status(500).json({ message: "Greška pri ažuriranju leta" });
  }
};
export const otkaziLet = async (req, res) => {
  const { flightId, from, to, days } = req.body;

  if (!flightId || !from || !to || !days?.length) {
    return res.status(400).json({ poruka: "Nedostaju podaci." });
  }

  try {
    // Snimi otkaz u kolekciju
    const noviOtkaz = new OtkazaniLet({
      flightId,
      from: new Date(from),
      to: new Date(to),
      days,
    });

    await noviOtkaz.save();

    // Fetch the flight details to get the flight number
    const flight = await Let.findById(flightId);
    if (!flight) {
      return res.status(404).json({ poruka: "Let nije pronađen." });
    }

    // Kreiraj notifikacije za sve kupce
    const sviKorisnici = await Korisnik.find({ role: "kupac" });

    const notifikacije = sviKorisnici.map((korisnik) => ({
      korisnik: korisnik._id,
      poruka: `Let ${flight.flightNumber} je otkazan.`,
    }));

    await Notifikacija.insertMany(notifikacije);

    res.status(201).json({ poruka: "Let otkazan i notifikacije poslane." });
  } catch (err) {
    console.error("❌ Greška pri otkazivanju i slanju notifikacija:", err);
    res.status(500).json({ poruka: "Greška na serveru." });
  }
};

export const dohvatiOtkazaneLetove = async (req, res) => {
  try {
    const otkazani = await OtkazaniLet.find({}).lean();

    console.log(`Dohvaćeno ${otkazani.length} otkazanih letova.`);

    res.status(200).json(otkazani);
  } catch (err) {
    console.error("Greška pri dohvatanju otkazanih letova:", err);
    res.status(500).json({ message: "Greška na serveru." });
  }
};

export const obrisiOtkazaniLet = async (req, res) => {
  try {
    const { flightId, from, to, days } = req.body;

    console.log("➡️ Stigao DELETE zahtjev za aktivaciju leta sa podacima:", {
      flightId,
      from,
      to,
      days,
    });

    if (!flightId || !from || !to || !days || !Array.isArray(days)) {
      return res.status(400).json({ message: "Nedostaju podaci za brisanje." });
    }

    await OtkazaniLet.deleteMany({
      flightId,
      from: { $lte: new Date(from) },
      to: { $gte: new Date(to) },
      days: { $in: days },
    });

    console.log("➡️ Tipovi:", {
      flightId: typeof flightId,
      from: typeof from,
      to: typeof to,
      days: Array.isArray(days),
    });

    res.status(200).json({ message: "Let ponovo aktiviran." });
  } catch (err) {
    console.error("❌ Greška pri aktiviranju leta:", err);
    res.status(500).json({ message: "Greška na serveru." });
  }
};

export const posaljiNotifikacijuSvima = async (naslov, poruka) => {
  const korisnici = await Korisnik.find({}, "_id");

  const notifikacije = korisnici.map((k) => ({
    korisnikId: k._id,
    naslov,
    poruka,
  }));

  await Notifikacija.insertMany(notifikacije);
  console.log(`✅ Notifikacija poslana ${korisnici.length} korisnika.`);
};