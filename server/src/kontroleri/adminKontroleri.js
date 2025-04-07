import fs from 'fs';
import path from 'path';
import { Destinacija } from "../modeli.js";

const destinacijeJsonPath = path.join(__dirname, '..', 'destinacije.json');

const ucitajDestinacijeIzJsonFajla = () => {
  const rawData = fs.readFileSync(destinacijeJsonPath);
  return JSON.parse(rawData);
};

const unesiDestinacijeIzJsonFajla = async () => {
  const destinacije = ucitajDestinacijeIzJsonFajla();
  
  try {
    await Destinacija.insertMany(destinacije);
    console.log('Destinacije su uspješno unesene!');
  } catch (err) {
    console.log('Greška pri unosu destinacija u bazu', err);
  }
};

export const provjeraAplikacije = (req, res) => {
  return res.status(200).json({ poruka: "Sve ok!" });
};

const unosDestinacijaIzJsonFajla = async (req, res) => {
  try {
    await unesiDestinacijeIzJsonFajla();
    res.status(200).json({ poruka: "Destinacije uspješno unesene iz JSON fajla!" });
  } catch (err) {
    res.status(500).json({ poruka: "Greška pri unosu destinacija." });
  }
};

export { unosDestinacijaIzJsonFajla };