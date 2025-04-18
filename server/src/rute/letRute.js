import { Router } from "express";
import {
  dohvatiLetove,
  dodajLet,
  dohvatiLet,
  dohvatiDestinacije,
  azurirajLet,
  obrisatiLet,
  otkaziLet,
  dohvatiOtkazaneLetove
} from "../kontroleri/letKontroleri.js";

const router = Router();

// GET /api/letovi/destinacije - Dohvati sve dostupne destinacije
router.get("/destinacije", dohvatiDestinacije);

// GET /api/letovi - Dohvati sve letove
router.get("/", dohvatiLetove);

// POST /api/letovi - Dodaj novi let
router.post("/", dodajLet);

// GET /api/letovi/:id - Dohvati jedan let
router.get("/:id", dohvatiLet);

// PUT /api/letovi/:id - Ažuriraj postojeći let
router.put("/:id", azurirajLet);

// DELETE /api/letovi/:id - Obriši let
router.delete("/:id", obrisatiLet);

// POST /api/letovi/otkazi - Otkaži let
router.post("/otkazi", otkaziLet);

// GET /api/letovi/otkazani - Dohvati otkazane letove
router.get("/otkazani", dohvatiOtkazaneLetove);

export default router;
