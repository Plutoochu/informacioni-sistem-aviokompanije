import { Cijena, Popust } from "../modeli/modeli.js";

const dohvatiCjenovnik = async (req, res) => {
  try {
    const cijene = await Cijena.find();
    res.status(200).json(cijene);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const dodajCijenu = async (req, res) => {
  try {
    const cijena = new Cijena(req.body);
    await cijena.save();
    res.status(201).json({ poruka: "Nova cijena uspješno dodana", _id: cijena._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const azurirajCijenu = async (req, res) => {
  try {
    const cijena = await Cijena.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ poruka: "Cijena uspješno ažurirana", cijena });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obrisiCijenu = async (req, res) => {
  try {
    await Cijena.findByIdAndDelete(req.params.id);
    res.status(200).json({ poruka: "Cijena uspješno obrisana" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const dohvatiPopuste = async (req, res) => {
  try {
    const cijene = await Popust.find();
    res.status(200).json(cijene);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const dodajPopust = async (req, res) => {
  try {
    const popust = new Popust(req.body);
    await popust.save();
    res.status(201).json({ poruka: "Nova popust uspješno dodana", _id: popust._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const azurirajPopust = async (req, res) => {
  try {
    const popust = await Popust.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ poruka: "Popust uspješno ažuriran", popust });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obrisiPopust = async (req, res) => {
  try {
    await Popust.findByIdAndDelete(req.params.id);
    res.status(200).json({ poruka: "Popust uspješno obrisan" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export {
  dohvatiCjenovnik,
  dodajCijenu,
  azurirajCijenu,
  obrisiCijenu,
  dohvatiPopuste,
  dodajPopust,
  azurirajPopust,
  obrisiPopust,
};
