import { Router } from "express";
import { unesiDestinacijeIzJsona } from "../kontroleri/adminKontroleri.js";
import {
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
} from "../kontroleri/adminKontroleri.js";
import { adminOnly, autentifikacija } from "../middlewares.js";

const router = Router();

router
  .post("/unesi-destinacije-json", unesiDestinacijeIzJsona)
  .get("/destinacije", dohvatiSveDestinacije)
  .get("/destinacije/:id", dohvatiJednuDestinaciju)
  .post("/destinacije", dodajNovuDestinaciju)
  .put("/destinacije/:id", azurirajDestinaciju)
  .delete("/destinacije/:id", obrisiDestinaciju);

router
  .post("/korisnici", autentifikacija, adminOnly, dodajNovogKorisnika)
  .get("/korisnici", autentifikacija, adminOnly, dohvatiSveKorisnike)
  .get("/korisnici/:id", autentifikacija, adminOnly, dohvatiKorisnikaPoId)
  .put(
    "/korisnici/:id/promoviraj",
    autentifikacija,
    adminOnly,
    promovirajUAdmina
  )
  .put(
    "/korisnici/:id/demoviraj",
    autentifikacija,
    adminOnly,
    demovirajUKorisnika
  )
  .delete("/korisnici/:id", autentifikacija, adminOnly, obrisiKorisnika);

export default router;
