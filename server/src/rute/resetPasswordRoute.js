import { Router } from "express";
import resetPassword from "../kontroleri/resetPassword.js";

const router = Router();

router.post("/reset-password", resetPassword);

export default router;
