import { Router } from "express";
import { getBookedSeats, confirmSeatReservation } from "../kontroleri/sjedistaKontroleri.js";

const router = Router();

router.get("/:id/sjedista", getBookedSeats);
router.post("/sjedala", confirmSeatReservation);

export default router;
