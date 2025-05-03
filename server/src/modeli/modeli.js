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
    flightNumber: {
      type: String,
      required: true,
    },
    aviokompanija: {
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
          const [h1, m1] = this.departureTime.split(":").map(Number);
          const [h2, m2] = v.split(":").map(Number);
          const departureMinutes = h1 * 60 + m1;
          const arrivalMinutes = h2 * 60 + m2;

          // Ako je dolazak sljedeći dan, validacija uvijek prolazi
          if (this.dolazakSljedeciDan) return true;

          return arrivalMinutes > departureMinutes;
        },
        message: "Vrijeme dolaska mora biti nakon vremena polaska (osim ako nije sljedeći dan).",
      },
    },
    dolazakSljedeciDan: {
      type: Boolean,
      default: false,
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
    days: [
      {
        type: String, // "1" = ponedjeljak, "2" = utorak...
        enum: ["1", "2", "3", "4", "5", "6", "7"],
      },
    ],
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

const Notifikacija = mongoose.model("Notifikacija", NotifikacijaSchema);

const OtkazaniLet = mongoose.model("OtkazaniLet", OtkazaniLetSchema);
const Korisnik = mongoose.model("Korisnik", KorisnikSchema);
const Destinacija = mongoose.model("Destinacija", DestinacijaSchema);
const Avion = mongoose.model("Avion", AvionSchema);
const ResetToken = mongoose.model("ResetToken", ResetTokenSchema);
const Let = mongoose.model("Let", LetSchema);
const Booking = mongoose.model("Booking", BookingSchema);

export { Korisnik, Destinacija, Avion, ResetToken, Let, OtkazaniLet, Notifikacija, Booking };
