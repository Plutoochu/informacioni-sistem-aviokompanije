import express from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import compress from "compression";
import cors from "cors";
import dotenv from "dotenv";

import config from "./src/config.js";
import userRute from "./src/rute/userRute.js";
import adminRute from "./src/rute/adminRute.js";
import avionRute from "./src/rute/avionRute.js";
import letRute from "./src/rute/letRute.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compress());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rute
app.use("/api/korisnici", userRute);
app.use("/api/admin", adminRute);
app.use("/api/avioni", avionRute);
app.use("/api/letovi", letRute);

// Test ruta
app.get("/test", (req, res) => {
  res.json({ message: "Server radi!" });
});

mongoose
  .connect(config.mongo)
  .then(() => {
    console.log("MongoDB baza uspješno spojena!");
    const PORT = process.env.PORT || config.port;
    app.listen(PORT, () => 
      console.log(`Server pokrenut na portu: ${PORT}`)
    );
  })
  .catch((err) => console.log("Greška pri povezivanju sa bazom:", err));
