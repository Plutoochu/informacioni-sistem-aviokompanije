import { Router } from "express";
import {
  dohvatiSveKorisnike,
  dohvatiKorisnikaPoId,
  promovirajUAdmina,
  demovirajUKorisnika,
  obrisiKorisnika,
  dodajNovogKorisnika,
} from "../kontroleri/adminKontroleri.js";
import {
  dohvatiLetove,
  dohvatiLet,
  dodajLet,
  azurirajLet,
  obrisatiLet,
  otkaziLet,
  dohvatiOtkazaneLetove,
} from "../kontroleri/letKontroleri.js";
import avionKontroler from "../kontroleri/kontrolerAviona.js";
import kontrolerDestinacija from "../kontroleri/kontrolerDestinacija.js";

import { autentifikacija, adminOnly } from "../middlewares.js";

const router = Router();

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

// Admin rute za avione
router
  .post("/avioni", autentifikacija, adminOnly, avionKontroler.dodajAvion)
  .get("/avioni", autentifikacija, adminOnly, avionKontroler.dohvatiAvione)
  .get(
    "/avioni/:id",
    autentifikacija,
    adminOnly,
    avionKontroler.dohvatiAvionPoId
  )
  .put("/avioni/:id", autentifikacija, adminOnly, avionKontroler.azurirajAvion)
  .delete(
    "/avioni/:id",
    autentifikacija,
    adminOnly,
    avionKontroler.obrisiAvion
  );

// Admin rute za destinacije
router
  .post(
    "/destinacije",
    autentifikacija,
    adminOnly,
    kontrolerDestinacija.dodajDestinaciju
  )
  .get(
    "/destinacije",
    autentifikacija,
    adminOnly,
    kontrolerDestinacija.dohvatiDestinacije
  )
  .get(
    "/destinacije/:id",
    autentifikacija,
    adminOnly,
    kontrolerDestinacija.dohvatiDestinacijuPoId
  )
  .put(
    "/destinacije/:id",
    autentifikacija,
    adminOnly,
    kontrolerDestinacija.azurirajDestinaciju
  )
  .delete(
    "/destinacije/:id",
    autentifikacija,
    adminOnly,
    kontrolerDestinacija.obrisiDestinaciju
  );

router
  .get("/letovi", autentifikacija, adminOnly, dohvatiLetove)
  .get("/letovi/:id", autentifikacija, adminOnly, dohvatiLet)
  .post("/letovi", autentifikacija, adminOnly, dodajLet)
  .put("/letovi/:id", autentifikacija, adminOnly, azurirajLet)
  .delete("/letovi/:id", autentifikacija, adminOnly, obrisatiLet)
  .post("/letovi/otkazivanje", autentifikacija, adminOnly, otkaziLet)
  .get("/letovi/otkazani", autentifikacija, adminOnly, dohvatiOtkazaneLetove);

export default router;
