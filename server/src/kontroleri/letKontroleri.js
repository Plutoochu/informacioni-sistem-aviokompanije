import mongoose from "mongoose";
import { Let, Destinacija, OtkazaniLet, Notifikacija, Korisnik, Booking } from "../modeli/modeli.js";
import { sendCancellationEmail } from "./rezervacijaKontroleri.js";

export const dohvatiLetove = async (req, res) => {
  try {
    const { odrediste, datumOd, datumDo, aviokompanija, departureFrom, departureTo, arrivalFrom, arrivalTo } =
      req.query;
    console.log("Server primio zahtjev sa parametrima:", {
      odrediste,
      datumOd,
      datumDo,
      aviokompanija,
      departureFrom,
      departureTo,
      arrivalFrom,
      arrivalTo,
    });

    let query = {};

    // Filter by destination (using your field; adjust if necessary)
    if (odrediste) {
      query.destination = { $regex: new RegExp(odrediste, "i") };
    }

    // Filter by date range (using validityFrom/validityTo in your DB)
    if (datumOd && datumDo) {
      const startDate = new Date(datumOd);
      const endDate = new Date(datumDo);
      endDate.setHours(23, 59, 59, 999);
      query.validityFrom = { $lte: endDate };
      query.validityTo = { $gte: startDate };
    }

    if (aviokompanija) {
      query.aviokompanija = { $regex: new RegExp(aviokompanija, "i") };
    }

    // Filter by departure time range (departureTime is stored as string "HH:MM")
    if (departureFrom && departureTo) {
      query.departureTime = { $gte: departureFrom, $lte: departureTo };
    } else if (departureFrom) {
      query.departureTime = { $gte: departureFrom };
    } else if (departureTo) {
      query.departureTime = { $lte: departureTo };
    }

    // Filter by arrival time range (arrivalTime stored as string)
    if (arrivalFrom && arrivalTo) {
      query.arrivalTime = { $gte: arrivalFrom, $lte: arrivalTo };
    } else if (arrivalFrom) {
      query.arrivalTime = { $gte: arrivalFrom };
    } else if (arrivalTo) {
      query.arrivalTime = { $lte: arrivalTo };
    }

    console.log("MongoDB query:", query);

    const letovi = await Let.find(query)
      .sort({ flightNumber: 1 })
      .populate("avionId", "naziv model brojSjedista")
      .lean();

    console.log("Pronađeni letovi:", letovi);
    res.status(200).json(letovi);
  } catch (error) {
    console.error("Greška pri dohvatanju letova:", error);
    res.status(500).json({ message: "Greška pri dohvatanju letova" });
  }
};

// Novi kontroler za napredno pretraživanje
export const pretraziLetove = async (req, res) => {
  try {
    const { aviokompanija, polaziste, odrediste, datumOd, datumDo } = req.query;
    const query = {};

    // Filtriranje po aviokompaniji (ID)
    if (aviokompanija) {
      query.aviokompanija = new mongoose.Types.ObjectId(aviokompanija);
    }

    // Filtriranje po polazištu i odredištu
    if (polaziste) query.origin = polaziste;
    if (odrediste) query.destination = odrediste;

    // Filtriranje po datumu
    if (datumOd || datumDo) {
      query.validityFrom = {};
      if (datumOd) query.validityFrom.$gte = new Date(datumOd);
      if (datumDo) query.validityFrom.$lte = new Date(datumDo);
    }

    const letovi = await Let.find(query)
      .populate({
        path: 'aviokompanija',
        select: 'naziv kod'
      })
      .populate({
        path: 'avionId',
        select: 'naziv model'
      })
      .sort({ departureTime: 1 });

    res.status(200).json(letovi);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    res.status(500).json({ message: "Greška pri dodavanju leta.", details: error.message });
  }
};

export const dohvatiLet = async (req, res) => {
  try {
    // populate bez selecta = vraća sav Avion dokument, uključujući _id
    const letDoc = await Let.findById(req.params.id)
      .populate('aviokompanija', 'naziv kod')
      .populate("avionId");

    if (!letDoc) {
      return res.status(404).json({ message: "Let nije pronađen." });
    }
    res.json(letDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const dohvatiDestinacije = async (req, res) => {
  try {
    const destinacije = await Destinacija.find();
    res.json(destinacije);
  } catch (greska) {
    res.status(500).json({ poruka: greska.message });
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
    const noviOtkaz = new OtkazaniLet({
      flightId,
      from: new Date(from),
      to: new Date(to),
      days,
    });

    await noviOtkaz.save();

    const flight = await Let.findById(flightId);
    if (!flight) {
      return res.status(404).json({ poruka: "Let nije pronađen." });
    }

    const sviKorisnici = await Korisnik.find({ role: "kupac" });

    const notifikacije = sviKorisnici.map((korisnik) => ({
      korisnik: korisnik._id,
      poruka: `Let ${flight.flightNumber} je otkazan.`,
    }));

    await Notifikacija.insertMany(notifikacije);

    // ✅ Slanje emailova putnicima
    try {
      const rezervacije = await Booking.find({ flight: flightId }).populate("flight");

      for (const rezervacija of rezervacije) {
        for (const putnik of rezervacija.passengers) {
          if (putnik.email) {
            try {
              await sendCancellationEmail(
                putnik.email,
                putnik.ime,
                rezervacija,
                rezervacija.flight,
                {
                  from: new Date(from).toLocaleDateString(),
                  to: new Date(to).toLocaleDateString(),
                }
              );
            } catch (e) {
              console.error(`⚠️ Greška prilikom slanja maila za ${putnik.email}:`, e);
            }
          }
        }
      }
    } catch (greskaEmail) {
      console.error("⚠️ Greška prilikom dohvatanja rezervacija ili slanja emailova:", greskaEmail);
    }

    res.status(201).json({ poruka: "Let otkazan i notifikacije + emailovi su poslani." });
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
