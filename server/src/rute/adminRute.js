import { Router } from "express";
import { provjeraAplikacije, unosDestinacijaIzJsonFajla } from "../kontroleri/adminKontroleri.js";
import { proslijediDalje } from "../middlewares.js";

const router = Router();

// Ruta za provjeru aplikacije
router.get("/provjera", proslijediDalje, provjeraAplikacije);

// Ruta za unos destinacija iz JSON fajla
router.post("/unesi-destinacije-json", unosDestinacijaIzJsonFajla);

export default router;