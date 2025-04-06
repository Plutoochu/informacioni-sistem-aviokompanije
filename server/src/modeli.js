import mongoose from "mongoose";

const avionSchema = new mongoose.Schema({
  naziv: {
    type: String,
    required: true,
    unique: true,
  },
  konfiguracijaSjedista: {
    type: String,
    required: true,
    match: /^[Ff]?\d+[Cc]?\d+[Yy]?\d+$/, // npr. F10C20Y120
  },
  datumDodavanja: {
    type: Date,
    default: Date.now,
  },
});

const Avion = mongoose.model("Avion", avionSchema);
export default Avion;
