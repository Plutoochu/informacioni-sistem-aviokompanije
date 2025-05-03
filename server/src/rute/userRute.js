import { Router } from "express";
import {
  login,
  registracija,
  azurirajProfil,
  dohvatiProfil,
  zaboravljenaLozinka,
  resetujLozinku,
  dohvatiNotifikacijeZaKorisnika,
  oznaciKaoProcitano,
} from "../kontroleri/userKontroleri.js";
import { autentifikacija } from "../middlewares.js";
import bcrypt from "bcryptjs";
import { Korisnik } from "../modeli/modeli.js";

const router = Router();

// Glavne rute za autentifikaciju
router.post("/prijava", login);
router.post("/registracija", registracija);

// Rute za profil
router.get("/me", autentifikacija, dohvatiProfil);
router.put("/profil", autentifikacija, azurirajProfil);

// Ruta za resetovanje lozinke
router.post("/forgot-password", zaboravljenaLozinka);
router.post("/reset-password", resetujLozinku);

// Privremena ruta za hashiranje lozinke
router.post("/hash", async (req, res) => {
  try {
    const { lozinka } = req.body;
    const hashedLozinka = await bcrypt.hash(lozinka, 10);
    res.json({ hashedLozinka });
  } catch (error) {
    res.status(500).json({ message: "Greška pri hashiranju" });
  }
});

// Privremena ruta za kreiranje testnog korisnika
router.post("/create-test", async (req, res) => {
  try {
    const { ime, prezime, email, lozinka } = req.body;
    const hashedLozinka = await bcrypt.hash(lozinka, 10);

    const korisnik = new Korisnik({
      ime,
      prezime,
      email,
      lozinka: hashedLozinka,
      role: "kupac",
    });

    await korisnik.save();
    res.status(201).json({ message: "Test korisnik kreiran" });
  } catch (error) {
    res.status(500).json({ message: "Greška pri kreiranju korisnika" });
  }
});

// Ruta za kreiranje testnog admin korisnika
router.post("/create-admin", async (req, res) => {
  try {
    const { ime, prezime, email, lozinka } = req.body;
    const hashedLozinka = await bcrypt.hash(lozinka, 10);

    const korisnik = new Korisnik({
      ime,
      prezime,
      email,
      lozinka: hashedLozinka,
      role: "admin",
    });

    await korisnik.save();
    res.status(201).json({ message: "Admin korisnik kreiran" });
  } catch (error) {
    res.status(500).json({ message: "Greška pri kreiranju admin korisnika" });
  }
});

router.get("/dobavi-korisnike", async (req, res) => {
  try {
    const korisnici = await Korisnik.find();
    console.log(korisnici);

    res.status(200).json(korisnici);
  } catch (error) {
    res.status(500).json({ message: "Desila se greska" });
  }
});

router.get("/moje-notifikacije", autentifikacija, dohvatiNotifikacijeZaKorisnika);

router.put("/notifikacije/:notificationId", autentifikacija, oznaciKaoProcitano);

export default router;
