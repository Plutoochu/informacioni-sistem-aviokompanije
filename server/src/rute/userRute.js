import { Router } from "express";
import { login } from "../kontroleri/userKontroleri.js";
import { azurirajKorisnika } from "../kontroleri/userKontroleri.js";
import { autentifikacija } from "../middlewares.js";

const router = Router();

router.post("/login", login);
router.put("/update/:id", autentifikacija, azurirajKorisnika);

export default router;
