// Sprint 2 - User Authentication & Account Management

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Korisnik, ResetToken, Notifikacija } from "../modeli/modeli.js";
import config from "../config.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Konfiguracija za email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const azurirajKorisnika = async (req, res) => {
  try {
    const { id } = req.params;
    const { ime, prezime, email, telefon } = req.body;

    if (req.korisnik.id !== id && req.korisnik.role !== "admin") {
      return res.status(403).json({ poruka: "Nemate dozvolu za ažuriranje ovog korisnika." });
    }

    const korisnik = await Korisnik.findById(id);
    if (!korisnik) {
      return res.status(404).json({ poruka: "Korisnik nije pronađen." });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ poruka: "Neispravan format e-mail adrese." });
    }

    if (email && email !== korisnik.email) {
      const postojiEmail = await Korisnik.findOne({ email });
      if (postojiEmail) {
        return res.status(400).json({ poruka: "E-mail adresa je već u upotrebi." });
      }
      korisnik.email = email;
    }

    if (telefon && !/^\d{6,}$/.test(telefon)) {
      return res.status(400).json({
        poruka: "Neispravan format telefona. Dozvoljene su samo cifre (min 6).",
      });
    }

    if (ime) korisnik.ime = ime;
    if (prezime) korisnik.prezime = prezime;
    if (telefon) korisnik.telefon = telefon;

    await korisnik.save();

    return res.status(200).json({ poruka: "Podaci uspješno ažurirani.", korisnik });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ poruka: "Greška prilikom ažuriranja korisnika." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, lozinka } = req.body;

    console.log("Pokušaj prijave za:", email);

    const korisnik = await Korisnik.findOne({ email });
    if (!korisnik) {
      console.log("Korisnik nije pronađen");
      return res.status(401).json({ message: "Neispravan email ili lozinka" });
    }

    console.log("Korisnik pronađen:", korisnik.email);

    const isMatch = await bcrypt.compare(lozinka, korisnik.lozinka);
    if (!isMatch) {
      console.log("Neispravna lozinka");
      return res.status(401).json({ message: "Neispravan email ili lozinka" });
    }

    const token = jwt.sign({ id: korisnik._id, role: korisnik.role }, config.secret, { expiresIn: "24h" });

    console.log("Uspješna prijava");

    res.status(200).json({
      token,
      korisnik: {
        id: korisnik._id,
        ime: korisnik.ime,
        prezime: korisnik.prezime,
        email: korisnik.email,
        role: korisnik.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
};

export const dohvatiProfil = async (req, res) => {
  try {
    const korisnik = await Korisnik.findById(req.korisnik.id).select("-lozinka");
    if (!korisnik) {
      return res.status(404).json({ message: "Korisnik nije pronađen" });
    }
    res.json(korisnik);
  } catch (error) {
    console.error("Greška pri dohvatanju profila:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
};

export const azurirajProfil = async (req, res) => {
  try {
    const { ime, prezime, email, telefon } = req.body;

    // Pronalazimo korisnika po ID-u iz tokena
    const korisnik = await Korisnik.findById(req.korisnik.id);

    if (!korisnik) {
      return res.status(404).json({ message: "Korisnik nije pronađen" });
    }

    // Provjera email formata
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Neispravan format e-mail adrese" });
    }

    // Provjera da li email već postoji
    if (email && email !== korisnik.email) {
      const postojiEmail = await Korisnik.findOne({ email });
      if (postojiEmail) {
        return res.status(400).json({ message: "E-mail adresa je već u upotrebi" });
      }
    }

    // Provjera formata telefona
    if (telefon && !/^\d{6,}$/.test(telefon)) {
      return res.status(400).json({
        message: "Neispravan format telefona. Dozvoljene su samo cifre (min 6)",
      });
    }

    // Ažuriranje podataka
    if (ime) korisnik.ime = ime;
    if (prezime) korisnik.prezime = prezime;
    if (email) korisnik.email = email;
    if (telefon) korisnik.telefon = telefon;

    await korisnik.save();

    // Vraćamo ažurirane podatke bez lozinke
    const { lozinka, ...korisnikBezLozinke } = korisnik.toObject();
    res.json(korisnikBezLozinke);
  } catch (error) {
    console.error("Greška pri ažuriranju profila:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
};

export const registracija = async (req, res) => {
  try {
    const { ime, prezime, email, lozinka } = req.body;

    // Validacija
    if (!ime || !prezime || !email || !lozinka) {
      return res.status(400).json({ message: "Sva polja su obavezna" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Neispravan format e-mail adrese" });
    }

    // Provjera da li korisnik već postoji
    const postojeciKorisnik = await Korisnik.findOne({ email });
    if (postojeciKorisnik) {
      return res.status(400).json({ message: "Korisnik sa ovom email adresom već postoji" });
    }

    // Hashiranje lozinke
    const hashedLozinka = await bcrypt.hash(lozinka, 10);

    // Kreiranje novog korisnika
    const noviKorisnik = new Korisnik({
      ime,
      prezime,
      email,
      lozinka: hashedLozinka,
      role: "kupac",
    });

    await noviKorisnik.save();

    // Generisanje JWT tokena
    const token = jwt.sign({ id: noviKorisnik._id, role: noviKorisnik.role }, config.secret, { expiresIn: "24h" });

    res.status(201).json({
      message: "Korisnik uspješno registrovan",
      token,
      korisnik: {
        id: noviKorisnik._id,
        ime: noviKorisnik.ime,
        prezime: noviKorisnik.prezime,
        email: noviKorisnik.email,
        role: noviKorisnik.role,
      },
    });
  } catch (error) {
    console.error("Greška pri registraciji:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
};

export const zaboravljenaLozinka = async (req, res) => {
  try {
    const { email } = req.body;

    // Pronađi korisnika
    const korisnik = await Korisnik.findOne({ email });
    if (!korisnik) {
      return res.status(404).json({ message: "Korisnik sa ovom email adresom nije pronađen" });
    }

    // Obriši postojeći token ako postoji
    await ResetToken.deleteMany({ email });

    // Generiši token
    const token = crypto.randomBytes(32).toString("hex");

    // Sačuvaj token u bazi
    await ResetToken.create({
      email,
      token,
      expiresAt: new Date(Date.now() + 3600000), // 1 sat
    });

    // Kreiraj reset link
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    // Loguj token i link za testiranje
    console.log("Reset token:", token);
    console.log("Reset link:", resetLink);

    res.status(200).json({
      message: "Reset token je generisan",
      token,
      resetLink,
    });
  } catch (error) {
    console.error("Greška pri generisanju reset tokena:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
};

export const resetujLozinku = async (req, res) => {
  try {
    const { token, novaLozinka } = req.body;

    // Pronalaženje tokena u bazi
    const resetToken = await ResetToken.findOne({ token });
    if (!resetToken) {
      return res.status(400).json({ message: "Nevažeći token" });
    }

    // Provjera da li je token istekao
    if (resetToken.expiresAt < new Date()) {
      await ResetToken.deleteOne({ token });
      return res.status(400).json({ message: "Token je istekao" });
    }

    // Pronalaženje korisnika
    const korisnik = await Korisnik.findOne({ email: resetToken.email });
    if (!korisnik) {
      return res.status(404).json({ message: "Korisnik nije pronađen" });
    }

    // Hashiranje nove lozinke
    const hashedLozinka = await bcrypt.hash(novaLozinka, 10);

    // Ažuriranje lozinke
    korisnik.lozinka = hashedLozinka;
    await korisnik.save();

    // Brisanje tokena
    await ResetToken.deleteOne({ token });

    res.status(200).json({ message: "Lozinka je uspješno resetovana" });
  } catch (error) {
    console.error("Greška pri resetovanju lozinke:", error);
    res.status(500).json({ message: "Greška pri resetovanju lozinke" });
  }
};

export const dohvatiNotifikacijeZaKorisnika = async (req, res) => {
  try {
    const korisnikId = req.korisnik.id;
    const notifikacije = await Notifikacija.find({
      korisnik: korisnikId,
      procitano: false,
    }).sort({ createdAt: -1 });

    console.log("Fetched unread notifications for user:", notifikacije);
    res.status(200).json(notifikacije);
  } catch (err) {
    console.error("Greška pri dohvaćanju notifikacija:", err);
    res.status(500).json({ message: "Greška na serveru." });
  }
};

// In your user controller (userKontroleri.js)

export const oznaciKaoProcitano = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notifikacija = await Notifikacija.findByIdAndUpdate(
      notificationId,
      { procitano: true },
      { new: true } // to return the updated document
    );

    if (!notifikacija) {
      return res.status(404).json({ message: "Notifikacija nije pronađena" });
    }

    res.status(200).json({ message: "Notifikacija označena kao pročitana", notifikacija });
  } catch (err) {
    console.error("Greška pri označavanju notifikacije:", err);
    res.status(500).json({ message: "Greška pri označavanju notifikacije" });
  }
};
