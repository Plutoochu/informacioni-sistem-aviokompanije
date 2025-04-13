import { Router } from "express";
import {
  dohvatiSveKorisnike,
  dohvatiKorisnikaPoId,
  promovirajUAdmina,
  demovirajUKorisnika,
  obrisiKorisnika,
  dodajNovogKorisnika,
} from "../kontroleri/adminKontroleri.js";
import avionKontroler from "../kontroleri/kontrolerAviona.js";
import kontrolerDestinacija from "../kontroleri/kontrolerDestinacija.js";

const router = Router();

router
  .post("/korisnici", dodajNovogKorisnika)
  .get("/korisnici", dohvatiSveKorisnike)
  .get("/korisnici/:id", dohvatiKorisnikaPoId)
  .put("/korisnici/:id/promoviraj", promovirajUAdmina)
  .put("/korisnici/:id/demoviraj", demovirajUKorisnika)
  .delete("/korisnici/:id", obrisiKorisnika);

router
  .post("/avioni", avionKontroler.dodajAvion)
  .get("/avioni", avionKontroler.dohvatiAvione)
  .get("/avioni/:id", avionKontroler.dohvatiAvionPoId)
  .put("/avioni/:id", avionKontroler.azurirajAvion)
  .delete("/avioni/:id", avionKontroler.obrisiAvion);

router
  .post("/destinacije", kontrolerDestinacija.dodajDestinaciju)
  .get("/destinacije", kontrolerDestinacija.dohvatiDestinacije)
  .get("/destinacije/:id", kontrolerDestinacija.dohvatiDestinacijuPoId)
  .put("/destinacije/:id", kontrolerDestinacija.azurirajDestinaciju)
  .delete("/destinacije/:id", kontrolerDestinacija.obrisiDestinaciju);

export default router;
