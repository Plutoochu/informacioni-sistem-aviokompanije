import express from "express";
import { dohvatiCjenovnik, dodajCijenu, azurirajCijenu, obrisiCijenu } from "../kontroleri/cjenovnikKontroleri.js";

const router = express.Router();

router.get("/", dohvatiCjenovnik);
router.post("/", dodajCijenu);
router.put("/:id", azurirajCijenu);
router.delete("/:id", obrisiCijenu);

export default router;
