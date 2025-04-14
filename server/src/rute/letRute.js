import { Router } from "express";
import {
  dohvatiLetove,
  dodajLet,
  dohvatiLet,
  kreirajTestneLetove,
  dohvatiDestinacije,
  filtrirajLetove,
  azurirajLet,
  obrisatiLet,
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

// POST /api/letovi/kreiraj-testne - Kreiraj testne letove
router.post("/kreiraj-testne", kreirajTestneLetove);

// POST /api/letovi/filtriraj - Filtriraj letove prema rasporedu i datumu (novi endpoint)
router.post("/filtriraj", filtrirajLetove);

// PUT /api/letovi/:id - Ažuriraj postojeći let (novi endpoint)
router.put("/:id", azurirajLet);

// DELETE /api/letovi/:id - Obriši let (novi endpoint)
router.delete("/:id", obrisatiLet);

export default router;
