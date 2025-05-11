import { Router } from "express";
import { createBooking, cancelBooking, modifyBooking, getBookings } from "../kontroleri/rezervacijaKontroleri.js";

const router = Router();

// POST /api/rezervacije - Kreiraj novu rezervaciju
router.post("", createBooking);

// POST /api/rezervacije/cancel - Poništi rezervaciju
router.post("/cancel", cancelBooking);

// POST /api/rezervacije/modify - Izmijeni rezervaciju
router.post("/modify", modifyBooking);

// GET /api/rezervacije - Dohvati rezervacije za korisnika (booking history)
router.get("", getBookings);

export default router;
