import express from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import compress from "compression";
import cors from "cors";

import config from "./src/config.js";
import userRute from "./src/rute/userRute.js";
import adminRute from "./src/rute/adminRute.js";
import avionRute from "./src/rute/avionRute.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compress());
app.use(cors({ credentials: true }));

app.use("/api/user", userRute);
app.use("/api/admin", adminRute);
app.use("/api/avioni", avionRute);

app.listen(config.port, () => console.log(`Server pokrenut na portu: ${config.port}`));

mongoose
  .connect(config.mongo)
  .then(() => console.log("Mongo baza uspjesno spojena!"))
  .catch((err) => console.log(err));
