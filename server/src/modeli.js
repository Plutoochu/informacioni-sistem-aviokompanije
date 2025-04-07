// Sprint 2 - User Authentication & Account Management

const mongoose = require('mongoose');

const korisnikSchema = new mongoose.Schema({
    ime: {
        type: String,
        required: true
    },
    prezime: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    lozinka: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'kupac'],
        default: 'kupac'
    },
    telefon: {
        type: String
    },
    datumRegistracije: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Korisnik', korisnikSchema);

// Implementiran model korisnika sa osnovnim poljima (ime, prezime, email, lozinka) i rolama (admin/kupac)

