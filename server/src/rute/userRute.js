import { Router } from "express";
import { login } from "../kontroleri/userKontroleri.js";

const router = Router();

router.post('/login', login);

export default router;
