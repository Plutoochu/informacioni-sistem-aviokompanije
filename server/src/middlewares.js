// Sprint 2 - User Authentication & Account Management

import jwt from 'jsonwebtoken';
import config from './config.js';

export const proslijediDalje = (req, res, next) => {
  next();
};

export const autentifikacija = (req, res, next) => {
    try {
      
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Nije pronađen token' });
        }

        const decoded = jwt.verify(token, config.secret);
        
        req.korisnik = decoded;
        
        next();
    } catch (error) {
        console.error('Autentifikacija error:', error);
        res.status(401).json({ message: 'Nevažeći token' });
    }
};

// Middleware za autentifikaciju koji:
// Provjerava prisustvo JWT tokena u Authorization headeru
// Verifikuje token sa JWT_SECRET
// Ako je token validan, dodaje korisnikove podatke u req.korisnik
// Koristi se na zaštićenim rutama koje zahtijevaju prijavu



