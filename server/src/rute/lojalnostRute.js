// rute/lojalnostRute.js
import express from "express";
import { getLoyalty, redeemPoints } from "../kontroleri/lojalnostKontroleri.js";

const router = express.Router();

// GET /api/lojalnost?userId=...
router.get("/", getLoyalty);

// POST /api/lojalnost/redeem
router.post("/redeem", redeemPoints);

export default router;
