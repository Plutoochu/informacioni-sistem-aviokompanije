import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Destinacija, Korisnik } from "../modeli/modeli.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const destinacijeJsonPutanja = path.join(__dirname, "..", "destinacije.json");

const ucitajDestinacijeIzJsona = () => {
  const rawData = fs.readFileSync(destinacijeJsonPutanja);
  return JSON.parse(rawData);
};

const unesiDestinacije = async () => {
  const destinacije = ucitajDestinacijeIzJsona();

  try {
    await Destinacija.insertMany(destinacije);
    console.log("Destinacije su uspješno unesene!");
  } catch (err) {
    console.log("Greška pri unosu destinacija u bazu", err);
  }
};

export const provjeraAplikacije = (req, res) => {
  return res.status(200).json({ poruka: "Sve ok!" });
};

const unesiDestinacijeIzJsona = async (req, res) => {
  try {
    await unesiDestinacije();
    res
      .status(200)
      .json({ poruka: "Destinacije uspješno unesene iz JSON fajla!" });
  } catch (err) {
    res.status(500).json({ poruka: "Greška pri unosu destinacija." });
  }
};

// CRUD operacije nad destinacijama
const dohvatiSveDestinacije = async (req, res) => {
  try {
    const destinacije = await Destinacija.find();
    res.status(200).json(destinacije);
  } catch (err) {
    res.status(500).json({ poruka: "Greška pri dohvatanju destinacija." });
  }
};

const dohvatiJednuDestinaciju = async (req, res) => {
  try {
    const destinacija = await Destinacija.findById(req.params.id);
    if (!destinacija)
      return res.status(404).json({ poruka: "Destinacija nije pronađena." });
    res.status(200).json(destinacija);
  } catch (err) {
    res.status(500).json({ poruka: "Greška pri dohvatanju destinacije." });
  }
};

const dodajNovuDestinaciju = async (req, res) => {
  try {
    const novaDestinacija = new Destinacija(req.body);
    await novaDestinacija.save();
    res.status(201).json(novaDestinacija);
  } catch (err) {
    res.status(400).json({ poruka: "Greška pri dodavanju destinacije." });
  }
};

const azurirajDestinaciju = async (req, res) => {
  try {
    const azurirana = await Destinacija.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!azurirana)
      return res.status(404).json({ poruka: "Destinacija nije pronađena." });
    res.status(200).json(azurirana);
  } catch (err) {
    res.status(400).json({ poruka: "Greška pri ažuriranju destinacije." });
  }
};

const obrisiDestinaciju = async (req, res) => {
  try {
    const obrisana = await Destinacija.findByIdAndDelete(req.params.id);
    if (!obrisana)
      return res.status(404).json({ poruka: "Destinacija nije pronađena." });
    res.status(200).json({ poruka: "Destinacija uspješno obrisana." });
  } catch (err) {
    res.status(500).json({ poruka: "Greška pri brisanju destinacije." });
  }
};

// Operacije nad korisnicima
const dohvatiSveKorisnike = async (req, res) => {
  try {
    const korisnici = await Korisnik.find({}).select("-password");

    res.status(200).json(korisnici);
  } catch (error) {
    res.status(500).json({
      message: "Greška pri dohvaćanju korisnika",

      error: error.message,
    });
  }
};

const dohvatiKorisnikaPoId = async (req, res) => {
  try {
    const korisnik = await Korisnik.findById(req.params.id).select("-password");

    if (korisnik) {
      res.json(korisnik);
    } else {
      res.status(404).json({ poruka: "Korisnik nije pronađen" });
    }
  } catch (error) {
    res.status(500).json({ poruka: "Greška na serveru", error: error.message });
  }
};

const promovirajUAdmina = async (req, res) => {
  try {
    const korisnik = await Korisnik.findById(req.params.id);

    if (!korisnik) {
      return res.status(404).json({ poruka: "Korisnik nije pronađen" });
    }

    if (korisnik.role === "admin") {
      return res.status(400).json({ poruka: "Korisnik je već administrator" });
    }

    korisnik.role = "admin";
    const azuriranKorisnik = await korisnik.save();

    res.json({
      _id: azuriranKorisnik._id,
      name: azuriranKorisnik.name,
      email: azuriranKorisnik.email,
      role: azuriranKorisnik.role,
    });
  } catch (error) {
    res.status(500).json({ poruka: "Greška na serveru", error: error.message });
  }
};

const demovirajUKorisnika = async (req, res) => {
  try {
    const korisnik = await Korisnik.findById(req.params.id);

    if (!korisnik) {
      return res.status(404).json({ poruka: "Korisnik nije pronađen" });
    }

    if (korisnik.role === "kupac") {
      return res
        .status(400)
        .json({ poruka: "Korisnik je već obični korisnik" });
    }

    korisnik.role = "kupac";
    const azuriranKorisnik = await korisnik.save();

    res.json({
      _id: azuriranKorisnik._id,
      name: azuriranKorisnik.name,
      email: azuriranKorisnik.email,
      role: azuriranKorisnik.role,
    });
  } catch (error) {
    res.status(500).json({ poruka: "Greška na serveru", error: error.message });
  }
};

const obrisiKorisnika = async (req, res) => {
  try {
    const korisnik = await Korisnik.findById(req.params.id);
    if (!korisnik) {
      return res.status(404).json({ poruka: "Korisnik nije pronađen" });
    }
    await korisnik.deleteOne();
    res.json({ poruka: "Korisnik uspješno obrisan" });
  } catch (error) {
    res.status(500).json({ poruka: "Greška na serveru", error: error.message });
  }
};

const dodajNovogKorisnika = async (req, res) => {
  try {
    const { ime, prezime, email, lozinka, role, telefon } = req.body;

    // Provjeravamo da li korisnik već postoji
    const postojeciKorisnik = await Korisnik.findOne({ email });
    if (postojeciKorisnik) {
      return res
        .status(400)
        .json({ poruka: "Korisnik s ovim emailom već postoji" });
    }

    // Kreiramo novog korisnika
    const noviKorisnik = new Korisnik({
      ime,
      prezime,
      email,
      lozinka, // Lozinka bi trebala biti hashed prije nego se pohrani
      role,
      telefon,
    });

    // Spremaj korisnika u bazu
    const kreiraniKorisnik = await noviKorisnik.save();

    // Vraćamo novog korisnika kao odgovor
    res.status(201).json({
      _id: kreiraniKorisnik._id,
      ime: kreiraniKorisnik.ime,
      prezime: kreiraniKorisnik.prezime,
      email: kreiraniKorisnik.email,
      role: kreiraniKorisnik.role,
    });
  } catch (error) {
    res
      .status(500)
      .json({ poruka: "Greška pri dodavanju korisnika", error: error.message });
  }
};

export {
  unesiDestinacijeIzJsona,
  dohvatiSveDestinacije,
  dohvatiJednuDestinaciju,
  dodajNovuDestinaciju,
  azurirajDestinaciju,
  obrisiDestinaciju,
  dohvatiSveKorisnike,
  dohvatiKorisnikaPoId,
  promovirajUAdmina,
  demovirajUKorisnika,
  obrisiKorisnika,
  dodajNovogKorisnika,
};
