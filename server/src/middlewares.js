import jwt from "jsonwebtoken";
import config from "./config.js";

export const autentifikacija = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Nije pronađen token" });
    }

    const decoded = jwt.verify(token, config.secret);

    req.korisnik = decoded;

    next();
  } catch (error) {
    console.error("Autentifikacija error:", error);
    res.status(401).json({ message: "Nevažeći token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.korisnik?.role !== "admin") {
    return res.status(403).json({ message: "Nemate dopuštenje za ovu radnju!" });
  }
  next();
};
