import express from 'express';
import { resetujLozinku } from '../kontroleri/userKontroleri.js';

const router = express.Router();

router.post('/reset-password', resetujLozinku);

export default router;
