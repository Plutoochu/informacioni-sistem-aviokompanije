import { Router } from "express";
const router = Router();
import resetPassword from "../kontroleri/resetPassword.js";

router.post("/reset-password", resetPassword);

export default router;
