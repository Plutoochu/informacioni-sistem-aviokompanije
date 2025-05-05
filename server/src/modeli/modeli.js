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
    enum: ["aktivan", "otkazan", "u održavanju"],
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
    brojLeta: {
      type: String,
      required: true,
    },
    aviokompanija: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Aviokompanija",
      required: true,
    },
    vrijemePolaska: {
      type: String,
      required: true,
    },
    vrijemeDolaska: {
      type: String,
      required: true,
    },
    polaziste: {
      type: String,
      required: true,
    },
    odrediste: {
      type: String,
      required: true,
    },
    konfiguracijaSjedista: {
      type: String,
      required: true,
    },
    datumPolaska: {
      type: Date,
      required: true,
    },
    datumDolaska: {
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

const OtkazaniLetSchema = new mongoose.Schema(
  {
    flightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Let",
      required: true,
    },
    from: {
      type: Date,
      required: true,
    },
    to: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const NotifikacijaSchema = new mongoose.Schema(
  {
    korisnik: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Korisnik",
      required: true,
    },
    poruka: {
      type: String,
      required: true,
    },
    procitano: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const BookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
    },
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Let",
      required: true,
    },
    classType: {
      type: String,
      required: true,
    },
    ticketType: {
      type: String,
      required: true,
    },
    adultsCount: {
      type: Number,
      required: true,
    },
    childrenCount: {
      type: Number,
      required: true,
    },
    infantsCount: {
      type: Number,
      required: true,
    },
    passengers: {
      type: Array,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    cardDetails: {
      cardNumber: { type: String },
      cardExpiry: { type: String },
      cardCVC: { type: String },
    },
    seatSelection: {
      type: Array, // npr. niz stringova koji predstavljaju brojeve sjedala
    },
  },
  { timestamps: true }
);

const aviokompanijaSchema = new mongoose.Schema(
  {
    naziv: {
      type: String,
      required: true,
      unique: true,
    },
    kod: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      maxlength: 3,
    },
  },
  { timestamps: true }
);

const Notifikacija = mongoose.model("Notifikacija", NotifikacijaSchema);
const OtkazaniLet = mongoose.model("OtkazaniLet", OtkazaniLetSchema);
const Korisnik = mongoose.model("Korisnik", KorisnikSchema);
const Destinacija = mongoose.model("Destinacija", DestinacijaSchema);
const Avion = mongoose.model("Avion", AvionSchema);
const ResetToken = mongoose.model("ResetToken", ResetTokenSchema);
const Let = mongoose.model("Let", LetSchema);
const Booking = mongoose.model("Booking", BookingSchema);
const Aviokompanija = mongoose.model("Aviokompanija", aviokompanijaSchema);

export { Korisnik, Destinacija, Avion, ResetToken, Let, OtkazaniLet, Notifikacija, Booking, Aviokompanija };
