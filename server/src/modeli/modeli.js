import mongoose from "mongoose";

const KorisnikSchema = new mongoose.Schema({
  ime: {
    type: String,
    required: true,
  },
  prezime: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  lozinka: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "kupac"],
    default: "kupac",
  },
  telefon: {
    type: String,
  },
  datumRegistracije: {
    type: Date,
    default: Date.now,
  },
});

const DestinacijaSchema = new mongoose.Schema({
  grad: { type: String, required: true }, // City name
  nazivAerodroma: { type: String, required: true }, // Airport name
  IATA: { type: String, required: true, uppercase: true, unique: true }, // IATA code (uppercase)
  ICAO: { type: String, required: true, uppercase: true, unique: true }, // ICAO code (uppercase)
});
// Model za avion
const AvionSchema = new mongoose.Schema({
  naziv: {
    type: String,
    required: true,
    unique: true,
  },
  model: {
    type: String,
    required: true,
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
    match: /^[Ff]?\d+[Cc]?\d+[Yy]?\d+$/, // npr. F10C20Y120
  },
  brojSjedista: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["aktivan", "neaktivan", "u održavanju"],
    default: "aktivan",
  },
  sjedalaPoRedu: {
    F: { type: Number, default: 0 },
    C: { type: Number, default: 0 },
    Y: { type: Number, default: 0 },
  },
  datumDodavanja: {
    type: Date,
    default: Date.now,
  },
});

// Model za reset token
const ResetTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 3600000), // 1 sat
  },
});

const LetSchema = new mongoose.Schema(
  {
    flightNumber: {
      type: String,
      required: true,
    },
    schedule: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          // Validate that the schedule is a valid pattern (e.g., "1234567" or "x56")
          return /^[1234567x]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid schedule format!`,
      },
    },
    departureTime: {
      type: String,
      required: true,
    },
    arrivalTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return v > this.departureTime; // Ensure arrival is after departure
        },
        message: "Arrival time must be after departure time.",
      },
    },
    origin: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    seatConfiguration: {
      type: String,
      required: true,
    },
    validityFrom: {
      type: Date,
      required: true,
    },
    validityTo: {
      type: Date,
      required: true,
    },
    avionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Avion",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Kreiranje modela
const Korisnik = mongoose.model("Korisnik", KorisnikSchema);
const Destinacija = mongoose.model("Destinacija", DestinacijaSchema);
const Avion = mongoose.model("Avion", AvionSchema);
const ResetToken = mongoose.model("ResetToken", ResetTokenSchema);
const Let = mongoose.model("Let", LetSchema);

export { Korisnik, Destinacija, Avion, ResetToken, Let };
