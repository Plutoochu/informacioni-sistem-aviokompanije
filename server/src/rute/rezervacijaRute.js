import { Router } from "express";
import { createBooking } from "../kontroleri/rezervacijaKontroleri.js";

const router = Router();

// POST /api/rezervacije - Kreiraj novu rezervaciju
router.post("", createBooking);

export default router;
