import mongoose from 'mongoose';

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

// Model za destinaciju
const destinacijaSchema = new mongoose.Schema({
  grad: { type: String, required: true },
  nazivAerodroma: { type: String, required: true },
  IATA: { type: String, required: true },
  ICAO: { type: String, required: true },
});

// Model za avion
const avionSchema = new mongoose.Schema({
  naziv: {
    type: String,
    required: true,
    unique: true
  },
  model: {
    type: String,
    required: true
  },
  tip: {
    type: String,
    required: true,
  },
  registracijskiBroj: {
    type: String,
    required: true,
  },
  konfiguracijaSjedala: {
    type: String,
    required: true,
    match: /^[Ff]?\d+[Cc]?\d+[Yy]?\d+$/ // npr. F10C20Y120
  },
  brojSjedista: {
    type: Number,
    required: true
  },
  status: { 
    type: String, 
    enum: ['aktivan', 'neaktivan', 'u održavanju'],
    default: 'aktivan'
  },
  sjedalaPoRedu: {
    F: { type: Number, default: 0 },
    C: { type: Number, default: 0 },
    Y: { type: Number, default: 0 },
  },
  datumDodavanja: {
    type: Date,
    default: Date.now
  }
});

// Model za reset token
const resetTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 3600000) // 1 sat
  }
});

// Kreiranje modela
const Korisnik = mongoose.model('Korisnik', korisnikSchema);
const Destinacija = mongoose.model("Destinacija", destinacijaSchema);
const Avion = mongoose.model('Avion', avionSchema);
const ResetToken = mongoose.model('ResetToken', resetTokenSchema);

export {
    Korisnik,
    Destinacija,
    Avion,
    ResetToken
};

