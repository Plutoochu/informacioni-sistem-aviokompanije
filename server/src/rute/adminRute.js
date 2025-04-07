import { Router } from "express";
import { unosDestinacijaIzJsonFajla } from "../kontroleri/adminKontroleri.js";
import {
  dohvatiDestinacije,
  jednaDestinacija,
  dodajDestinaciju,
  azurirajDestinaciju,
  obrisiDestinaciju,
} from "../kontroleri/adminKontroleri.js";

const router = Router();

router
  .post("/unesi-destinacije-json", unosDestinacijaIzJsonFajla)
  .get("/destinacije", dohvatiDestinacije)
  .get("/destinacije/:id", jednaDestinacija)
  .post("/destinacije", dodajDestinaciju)
  .put("/destinacije/:id", azurirajDestinaciju)
  .delete("/destinacije/:id", obrisiDestinaciju);

export default router;
