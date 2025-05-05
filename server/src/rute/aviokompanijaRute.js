import express from "express";
import {
  dodajAviokompaniju,
  dohvatiSveAviokompanije,
  azurirajAviokompaniju,
  obrisiAviokompaniju
} from "../kontroleri/aviokompanijaKontroleri.js";

const router = express.Router();

router.post("/", dodajAviokompaniju);
router.get("/", dohvatiSveAviokompanije);
router.put("/:id", azurirajAviokompaniju);
router.delete("/:id", obrisiAviokompaniju);

export default router;