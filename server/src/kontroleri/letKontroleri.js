import mongoose from "mongoose";
import { Let, Destinacija, OtkazaniLet, Notifikacija, Korisnik, Booking, Cijena, Popust } from "../modeli/modeli.js";
import { sendCancellationEmail } from "./rezervacijaKontroleri.js";

const dolazakSljedeciDan = (vrijemePolaska, vrijemeDolaska) => {
  const [h1, m1] = vrijemePolaska.split(":").map(Number);
  const [h2, m2] = vrijemeDolaska.split(":").map(Number);
  const polazak = h1 * 60 + m1;
  const dolazak = h2 * 60 + m2;
  return polazak >= dolazak;
};

const ispravanRasporedLetova = (rasporedLetova) => {
  if (!/^[1234567x]+$/.test(rasporedLetova)) return false;

  const jedinstveniSkup = new Set(rasporedLetova);
  return (
    jedinstveniSkup.size === rasporedLetova.length &&
    (rasporedLetova.includes("x") ? rasporedLetova.startsWith("x") : true)
  );
};

const dajDatumDolaska = (datumPolaska, dolaziSljedeciDan) => {
  let datumDolaska = new Date(datumPolaska);
  if (dolaziSljedeciDan) {
    datumDolaska.setDate(datumDolaska.getDate() + 1);
  }
  return datumDolaska;
};

const ispravniDatumiRaspona = (datumPolaska, datumDo) => {
  return datumPolaska <= datumDo;
};

export const dohvatiLetove = async (req, res) => {
  try {
    const {
      odrediste,
      datumOd,
      datumDo,
      aviokompanija,
      vrijemePolaskaOd,
      vrijemePolaskaDo,
      vrijemeDolaskaOd,
      vrijemeDolaskaDo,
    } = req.query;

    let query = {};

    if (odrediste) {
      query.odrediste = { $regex: new RegExp(odrediste, "i") };
    }

    if (datumOd && datumDo) {
      const startDate = new Date(datumOd);
      const endDate = new Date(datumDo);
      endDate.setHours(23, 59, 59, 999);
      query.datumPolaska = { $lte: endDate };
      query.datumDolaska = { $gte: startDate };
    }

    if (aviokompanija) {
      query.aviokompanija = { $regex: new RegExp(aviokompanija, "i") };
    }

    // Filter by departure time range (stored as string "HH:MM")
    if (vrijemePolaskaOd && vrijemePolaskaDo) {
      query.vrijemePolaska = { $gte: vrijemePolaskaOd, $lte: vrijemePolaskaDo };
    } else if (vrijemePolaskaOd) {
      query.vrijemePolaska = { $gte: vrijemePolaskaOd };
    } else if (vrijemePolaskaDo) {
      query.vrijemePolaska = { $lte: vrijemePolaskaDo };
    }

    // Filter by arrival time range (stored as string "HH:MM")
    if (vrijemeDolaskaOd && vrijemeDolaskaDo) {
      query.vrijemeDolaska = { $gte: vrijemeDolaskaOd, $lte: vrijemeDolaskaDo };
    } else if (vrijemeDolaskaOd) {
      query.vrijemeDolaska = { $gte: vrijemeDolaskaOd };
    } else if (vrijemeDolaskaDo) {
      query.vrijemeDolaska = { $lte: vrijemeDolaskaDo };
    }

    const letovi = await Let.find(query).sort({ brojLeta: 1 }).populate("avionId", "naziv model brojSjedista").lean();

    res.status(200).json(letovi);
  } catch (error) {
    console.error("Greška pri dohvatanju letova:", error);
    res.status(500).json({ message: "Greška pri dohvatanju letova" });
  }
};

export const pretraziLetove = async (req, res) => {
  try {
    const {
      aviokompanija,
      polaziste,
      odrediste,
      klasa,
      datumOd,
      datumDo,
      vrijemePolaskaOd,
      vrijemePolaskaDo,
      vrijemeDolaskaOd,
      vrijemeDolaskaDo,
    } = req.query;
    const query = {};

    // Filtriranje po aviokompaniji (ID)
    if (aviokompanija) {
      // Ako je aviokompanija predmet pretrage (ID) – pretvorite ga u ObjectId
      query.aviokompanija = new mongoose.Types.ObjectId(aviokompanija);
    }

    // Filtriranje po polazištu i odredištu
    if (polaziste) query.polaziste = polaziste;
    if (odrediste) query.odrediste = odrediste;

    // Filtriranje po datumu (datumPolaska)
    if (datumOd || datumDo) {
      query.datumPolaska = {};
      if (datumOd) query.datumPolaska.$gte = new Date(datumOd);
      if (datumDo) query.datumPolaska.$lte = new Date(datumDo);
    }

    // Filtriranje po vremenu polaska (stored as string "HH:MM")
    if (vrijemePolaskaOd && vrijemePolaskaDo) {
      query.vrijemePolaska = { $gte: vrijemePolaskaOd, $lte: vrijemePolaskaDo };
    } else if (vrijemePolaskaOd) {
      query.vrijemePolaska = { $gte: vrijemePolaskaOd };
    } else if (vrijemePolaskaDo) {
      query.vrijemePolaska = { $lte: vrijemePolaskaDo };
    }

    // Filtriranje po vremenu dolaska (stored as string "HH:MM")
    if (vrijemeDolaskaOd && vrijemeDolaskaDo) {
      query.vrijemeDolaska = { $gte: vrijemeDolaskaOd, $lte: vrijemeDolaskaDo };
    } else if (vrijemeDolaskaOd) {
      query.vrijemeDolaska = { $gte: vrijemeDolaskaOd };
    } else if (vrijemeDolaskaDo) {
      query.vrijemeDolaska = { $lte: vrijemeDolaskaDo };
    }

    const letovi = await Let.find(query)
      .populate({
        path: "aviokompanija",
        select: "naziv kod",
      })
      .populate({
        path: "avionId",
        select: "naziv model",
      })
      .sort({ vrijemePolaska: 1 });

    const letoviSaCijenom = [];

    for (const jedanLet of letovi) {
      const cijena = await Cijena.findOne({
        polaziste: jedanLet.polaziste,
        odrediste: jedanLet.odrediste,
        aviokompanija: jedanLet.aviokompanija?.naziv,
        klasa: klasa,
        odDatuma: { $lte: jedanLet.datumPolaska },
        doDatuma: { $gte: jedanLet.datumPolaska },
      });

      if (cijena) {
        const popust = await Popust.findOne({
          aviokompanija: jedanLet.aviokompanija?.naziv,
          klasa: klasa,
          odDatuma: { $lte: jedanLet.datumPolaska },
          doDatuma: { $gte: jedanLet.datumPolaska },
        });
        letoviSaCijenom.push({
          ...jedanLet.toObject(),
          cijenaBezPopusta: popust ? cijena.cijena : "",
          cijena: popust ? cijena.cijena * ((100 - popust.popust) / 100.0) : cijena.cijena,
        });
      }
    }

    res.status(200).json(letoviSaCijenom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const dodajLet = async (req, res) => {
  try {
    const { rasporedLetova, datumDo, ...jedanLet } = req.body;

    let datumPolaska = new Date(jedanLet.datumPolaska);
    const datumDoString = datumDo;
    const datumDoDate = new Date(datumDoString);
    const dolaziSljedeciDan = dolazakSljedeciDan(jedanLet.vrijemePolaska, jedanLet.vrijemeDolaska);

    if (
      !rasporedLetova ||
      !datumDoString ||
      !ispravanRasporedLetova(rasporedLetova) ||
      !ispravniDatumiRaspona(datumPolaska, datumDoDate)
    ) {
      const noviLet = new Let({ ...jedanLet, datumDolaska: dajDatumDolaska(datumPolaska, dolaziSljedeciDan) });
      await noviLet.save();
      return res.status(201).json({ poruka: "Uspjesno dodan let" });
    } else {
      const letovi = [];

      let brojLeta = jedanLet.brojLeta;

      while (datumPolaska <= datumDoDate) {
        if (
          (rasporedLetova.includes("x") && !rasporedLetova.includes(datumPolaska.getDay())) ||
          rasporedLetova.includes(datumPolaska.getDay()) ||
          (datumPolaska.getDay() === 0 && rasporedLetova.includes(datumPolaska.getDay() + 1))
        ) {
          letovi.push({
            ...jedanLet,
            brojLeta: brojLeta++,
            datumPolaska: new Date(datumPolaska),
            datumDolaska: dajDatumDolaska(datumPolaska, dolaziSljedeciDan),
          });
        }
        datumPolaska.setDate(datumPolaska.getDate() + 1);
      }
      await Let.insertMany(letovi);
      return res.status(201).json({ poruka: "Uspjesno dodani letovi" });
    }
  } catch (error) {
    // Ovo šalje TAČNU poruku validacije npr. "Arrival time must be after departure time"
    // if (error.name === "ValidationError") {
    //   return res.status(400).json({ message: error.message });
    // }

    res.status(500).json({ message: "Greška pri dodavanju leta.", details: error.message });
  }
};

export const dohvatiLet = async (req, res) => {
  try {
    // populate bez selecta = vraća sav Avion dokument, uključujući _id
    const letDoc = await Let.findById(req.params.id).populate("aviokompanija", "naziv kod").populate("avionId");

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
    res.status(200).json(destinacije);
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
  const { flightId, from, to } = req.body;

  if (!flightId || !from || !to) {
    return res.status(400).json({ poruka: "Nedostaju podaci." });
  }

  try {
    const noviOtkaz = new OtkazaniLet({
      flightId,
      from: new Date(from),
      to: new Date(to),
    });

    await noviOtkaz.save();

    const flight = await Let.findById(flightId);
    if (!flight) {
      return res.status(404).json({ poruka: "Let nije pronađen." });
    }

    const sviKorisnici = await Korisnik.find({ role: "kupac" });

    const notifikacije = sviKorisnici.map((korisnik) => ({
      korisnik: korisnik._id,
      poruka: `Let ${flight.brojLeta} je otkazan.`,
    }));

    await Notifikacija.insertMany(notifikacije);

    // ✅ Slanje emailova putnicima
    try {
      const rezervacije = await Booking.find({ flight: flightId }).populate("flight");

      for (const rezervacija of rezervacije) {
        for (const putnik of rezervacija.passengers) {
          if (putnik.email) {
            try {
              await sendCancellationEmail(putnik.email, putnik.ime, rezervacija, rezervacija.flight, {
                from: new Date(from).toLocaleDateString(),
                to: new Date(to).toLocaleDateString(),
              });
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

    res.status(200).json(otkazani);
  } catch (err) {
    console.error("Greška pri dohvatanju otkazanih letova:", err);
    res.status(500).json({ message: "Greška na serveru." });
  }
};

export const obrisiOtkazaniLet = async (req, res) => {
  try {
    const { flightId, from, to } = req.body;

    if (!flightId || !from || !to) {
      return res.status(400).json({ message: "Nedostaju podaci za brisanje." });
    }

    await OtkazaniLet.deleteMany({
      flightId,
      from: { $lte: new Date(from) },
      to: { $gte: new Date(to) },
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
