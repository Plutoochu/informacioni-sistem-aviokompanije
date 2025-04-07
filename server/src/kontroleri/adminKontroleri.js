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

// CRUD operacije
const dohvatiDestinacije = async (req, res) => {
  try {
    const destinacije = await Destinacija.find();
    res.status(200).json(destinacije);
  } catch (err) {
    res.status(500).json({ poruka: "Greška pri dohvatanju destinacija." });
  }
};

const jednaDestinacija = async (req, res) => {
  try {
    const destinacija = await Destinacija.findById(req.params.id);
    if (!destinacija) return res.status(404).json({ poruka: "Destinacija nije pronađena." });
    res.status(200).json(destinacija);
  } catch (err) {
    res.status(500).json({ poruka: "Greška pri dohvatanju destinacije." });
  }
};

const dodajDestinaciju = async (req, res) => {
  try {
    const novaDestinacija = new Destinacija(req.body);
    await novaDestinacija.save();
    res.status(201).json(novaDestinacija);
  } catch (err) {
    res.status(400).json({ poruka: "Greška pri dodavanju destinacije." });
  }
};

const azurirajDestinaciju = async (req, res) => {
  try {
    const azurirana = await Destinacija.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!azurirana) return res.status(404).json({ poruka: "Destinacija nije pronađena." });
    res.status(200).json(azurirana);
  } catch (err) {
    res.status(400).json({ poruka: "Greška pri ažuriranju destinacije." });
  }
};

const obrisiDestinaciju = async (req, res) => {
  try {
    const obrisana = await Destinacija.findByIdAndDelete(req.params.id);
    if (!obrisana) return res.status(404).json({ poruka: "Destinacija nije pronađena." });
    res.status(200).json({ poruka: "Destinacija uspješno obrisana." });
  } catch (err) {
    res.status(500).json({ poruka: "Greška pri brisanju destinacije." });
  }
};

export {
  unosDestinacijaIzJsonFajla,
  dohvatiDestinacije,
  jednaDestinacija,
  dodajDestinaciju,
  azurirajDestinaciju,
  obrisiDestinaciju
};
