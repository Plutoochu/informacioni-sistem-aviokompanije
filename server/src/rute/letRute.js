import { Router } from "express";
import { dohvatiLetove, dodajLet, dohvatiLet, dohvatiDestinacije, azurirajLet } from "../kontroleri/letKontroleri.js";

const router = Router();

// GET /api/letovi/destinacije - Dohvati sve dostupne destinacije
router.get("/destinacije", dohvatiDestinacije);

// GET /api/letovi - Dohvati sve letove
router.get("", dohvatiLetove);

// POST /api/letovi - Dodaj novi let
router.post("", dodajLet);

// GET /api/letovi/:id - Dohvati jedan let
router.get("/:id", dohvatiLet);

// PUT /api/letovi/:id - Ažuriraj let
router.put("/:id", azurirajLet);

export default router;
