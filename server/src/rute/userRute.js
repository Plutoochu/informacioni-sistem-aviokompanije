import { Router } from "express";
import { azurirajKorisnika } from "../kontroleri/userKontroleri.js";
import { autentifikacija } from "../middleware.js";

const router = Router();

router.put("/update/:id", autentifikacija, azurirajKorisnika);

export default router;
