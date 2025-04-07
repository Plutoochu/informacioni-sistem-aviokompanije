import express from 'express';
import avionKontroler from '../kontroleri/kontroleraviona.js';

const router = express.Router();

router.post('/', avionKontroler.dodajAvion);
router.get('/', avionKontroler.dohvatiAvione);
router.get('/:id', avionKontroler.dohvatiAvionPoId);
router.put('/:id', avionKontroler.azurirajAvion);
router.delete('/:id', avionKontroler.obrisiAvion);

export default router;
