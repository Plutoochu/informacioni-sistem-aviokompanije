import { Router } from "express";
import { provjeraAplikacije } from "../kontroleri/adminKontroleri.js";
import { proslijediDalje } from "../middlewares.js";

const router = Router();

router.get("/provjera", proslijediDalje, provjeraAplikacije);

export default router;
