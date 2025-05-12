import { Schema, model } from "mongoose";

const korisnikSchema = new Schema({
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

const destinacijaSchema = new Schema({
  grad: { type: String, required: true },
  nazivAerodroma: { type: String, required: true },
  IATA: { type: String, required: true, uppercase: true, unique: true },
  ICAO: { type: String, required: true, uppercase: true, unique: true },
});

const avionSchema = new Schema({
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

const resetTokenSchema = new Schema({
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

const letSchema = new Schema(
  {
    brojLeta: {
      type: String,
      required: true,
    },
    aviokompanija: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: "Avion",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const otkazaniLetSchema = new Schema(
  {
    flightId: {
      type: Schema.Types.ObjectId,
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

const notifikacijaSchema = new Schema(
  {
    korisnik: {
      type: Schema.Types.ObjectId,
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

const bookingSchema = new Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
    },
    flight: {
      type: Schema.Types.ObjectId,
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
      type: Array,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "Korisnik",
      required: true,
    },
    status: {
      type: String,
      default: "active",
    },
  },
  { timestamps: true }
);

const aviokompanijaSchema = new Schema(
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

const cijenaSchema = new Schema({
  polaziste: {
    type: String,
    required: true,
  },
  odrediste: {
    type: String,
    required: true,
  },
  aviokompanija: {
    type: String,
    required: true,
  },
  klasa: {
    type: String,
    required: true,
  },
  odDatuma: {
    type: Date,
    required: true,
  },
  doDatuma: {
    type: Date,
    required: true,
  },
  cijena: {
    type: Number,
    required: true,
  },
});

const Notifikacija = model("Notifikacija", notifikacijaSchema);
const OtkazaniLet = model("OtkazaniLet", otkazaniLetSchema);
const Korisnik = model("Korisnik", korisnikSchema);
const Destinacija = model("Destinacija", destinacijaSchema);
const Avion = model("Avion", avionSchema);
const ResetToken = model("ResetToken", resetTokenSchema);
const Let = model("Let", letSchema);
const Booking = model("Booking", bookingSchema);
const Aviokompanija = model("Aviokompanija", aviokompanijaSchema);
const Cijena = model("Cijena", cijenaSchema);

export { Korisnik, Destinacija, Avion, ResetToken, Let, OtkazaniLet, Notifikacija, Booking, Aviokompanija, Cijena };
