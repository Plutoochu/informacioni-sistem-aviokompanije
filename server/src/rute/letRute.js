import { Router } from 'express';
import { dohvatiLetove, dodajLet, dohvatiLet, kreirajTestneLetove } from '../kontroleri/letKontroleri.js';

const router = Router();

// GET /api/letovi - Dohvati sve letove
router.get('/', dohvatiLetove);

// POST /api/letovi - Dodaj novi let
router.post('/', dodajLet);

// GET /api/letovi/:id - Dohvati jedan let
router.get('/:id', dohvatiLet);

// POST /api/letovi/kreiraj-testne - Kreiraj testne letove
router.post('/kreiraj-testne', kreirajTestneLetove);

export default router; 