import express from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import compress from "compression";
import cors from "cors";

import config from "./src/config.js";
import userRute from "./src/rute/userRute.js";
import adminRute from "./src/rute/adminRute.js";
import avionRute from "./src/rute/avionRute.js";
import aviokompanijaRute from "./src/rute/aviokompanijaRute.js";
import letRute from "./src/rute/letRute.js";
import resetPasswordRoute from "./src/rute/resetPasswordRoute.js";
import rezervacijaRute from "./src/rute/rezervacijaRute.js";
import sjedistaRute from "./src/rute/sjedistaRute.js";
import cijeneRute from "./src/rute/cijeneRute.js";
// import apiRute from "./src/rute/index.js"

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compress());
app.use(cors({ credentials: true }));

app.use("/api/korisnici", userRute);
app.use("/api/admin", adminRute);
app.use("/api/avioni", avionRute);
app.use("/api/aviokompanije", aviokompanijaRute);
app.use("/api/letovi", letRute);
app.use("/api/", resetPasswordRoute);
app.use("/api/rezervacije", rezervacijaRute);
app.use("/api/sjedista", sjedistaRute);
app.use("/api/cijene", cijeneRute);

// app.use("/api", apiRute);

app.listen(config.port, () => console.log(`Server pokrenut na portu: ${config.port}`));

mongoose
  .connect(config.mongo)
  .then(() => console.log(`MongoDB baza uspješno spojena!`))
  .catch((err) => console.log("Greška pri povezivanju sa bazom:", err));
