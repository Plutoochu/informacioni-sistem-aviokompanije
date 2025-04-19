import { Let, Avion, OtkazaniLet } from "../modeli/modeli.js";

// Helper funkcije za rad sa datumima
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
    console.log('Server primio zahtjev sa parametrima:', { odrediste, datumPolaska });
    
    let query = {};

    if (odrediste) {
      query.odrediste = { $regex: new RegExp(odrediste, "i") };
    }

    if (datumPolaska) {
      const [dan, mjesec, godina] = datumPolaska.split("/").map(Number);

      if (!isValidDate(dan, mjesec, godina)) {
        console.log('Neispravan format datuma:', datumPolaska);
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

    console.log('MongoDB query:', query);
    const letovi = await Let.find(query)
      .sort({ datumPolaska: 1 })
      .populate("avionId", "naziv model brojSjedista")
      .lean();

    console.log('Pronađeni letovi:', letovi);

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

    console.log('Formatirani letovi za slanje:', formattedLetovi);
    res.status(200).json(formattedLetovi);
  } catch (error) {
    console.error('Greška pri dohvatanju letova:', error);
    res.status(500).json({ message: "Greška pri dohvatanju letova" });
  }
};

export const dodajLet = async (req, res) => {
  try {
    const noviLet = new Let(req.body);
    await noviLet.save();
    res.status(201).json(noviLet);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dodavanju leta" });
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

export const obrisatiLet = async (req, res) => {
  try {
    const let_ = await Let.findByIdAndDelete(req.params.id);
    if (!let_) {
      return res.status(404).json({ message: "Let nije pronađen" });
    }
    res.status(200).json({ message: "Let uspješno obrisan" });
  } catch (error) {
    res.status(500).json({ message: "Greška pri brisanju leta" });
  }
};

export const otkaziLet = async (req, res) => {
  const { flightId, from, to, days } = req.body;

  try {
    const flight = await Let.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: "Let nije pronađen" });
    }

    const otkazaniLet = new OtkazaniLet({
      flightId,
      from: new Date(from),
      to: new Date(to),
      days,
    });

    await otkazaniLet.save();
    res.status(200).json({ message: "Let uspješno otkazan" });
  } catch (error) {
    res.status(500).json({ message: "Greška pri otkazivanju leta" });
  }
};

export const dohvatiOtkazaneLetove = async (req, res) => {
  try {
    const otkazaniLetovi = await OtkazaniLet.find()
      .populate("flightId")
      .sort({ from: 1 });
    res.status(200).json(otkazaniLetovi);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvatanju otkazanih letova" });
  }
};
