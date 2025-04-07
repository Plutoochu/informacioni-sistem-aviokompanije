// Sprint 2 - User Authentication & Account Management

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Korisnik from '../modeli.js';

export const login = async (req, res) => {
    try {
        const { email, lozinka } = req.body;

        
        const korisnik = await Korisnik.findOne({ email });
        if (!korisnik) {
            return res.status(401).json({ message: 'Neispravan email ili lozinka' });
        }

        
        const isMatch = await bcrypt.compare(lozinka, korisnik.lozinka);
        if (!isMatch) {
            return res.status(401).json({ message: 'Neispravan email ili lozinka' });
        }

        const token = jwt.sign(
            { id: korisnik._id, role: korisnik.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        
        res.status(200).json({
            token,
            korisnik: {
                id: korisnik._id,
                ime: korisnik.ime,
                prezime: korisnik.prezime,
                email: korisnik.email,
                role: korisnik.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Greška na serveru' });
    }
};

// Implementiran login kontroler sa JWT autentifikacijom

