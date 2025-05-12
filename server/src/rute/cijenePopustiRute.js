import express from "express";
import {
  dohvatiCjenovnik,
  dodajCijenu,
  azurirajCijenu,
  obrisiCijenu,
  dohvatiPopuste,
  dodajPopust,
  azurirajPopust,
  obrisiPopust,
} from "../kontroleri/cijenePopustiKontroleri.js";

const router = express.Router();

router.get("/cijene/", dohvatiCjenovnik);
router.post("/cijene/", dodajCijenu);
router.put("/cijene/:id", azurirajCijenu);
router.delete("/cijene/:id", obrisiCijenu);

router.get("/popusti/", dohvatiPopuste);
router.post("/popusti/", dodajPopust);
router.put("/popusti/:id", azurirajPopust);
router.delete("/popusti/:id", obrisiPopust);

export default router;
