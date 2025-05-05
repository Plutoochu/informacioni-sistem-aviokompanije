import { Router } from "express";
import { dodajLet, dohvatiLet, dohvatiDestinacije, azurirajLet, pretraziLetove } from "../kontroleri/letKontroleri.js";
import { getBookedSeats } from "../kontroleri/sjedistaKontroleri.js";

const router = Router();

// GET /api/letovi/destinacije - Dohvati sve dostupne destinacije
router.get("/destinacije", dohvatiDestinacije);

// GET /api/letovi - Dohvati sve letove (sa mogućnošću filtriranja)
router.get("", pretraziLetove);

// POST /api/letovi - Dodaj novi let
router.post("", dodajLet);

// GET /api/letovi/:id - Dohvati jedan let
router.get("/:id", dohvatiLet);

// PUT /api/letovi/:id - Ažuriraj let
router.put("/:id", azurirajLet);

router.get("/:id/sjedista", getBookedSeats);

export default router;
