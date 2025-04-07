export const provjeraAplikacije = (req, res) => {
  return res.status(200).json({ poruka: "Sve ok!" });
};


import { Destinacija } from "../modeli.js";

// Dohvati sve destinacije
const dohvatiDestinacije = async (req, res) => {
  try {
    const destinacije = await Destinacija.find();
    res.status(200).json(destinacije);
  } catch (err) {
    res.status(500).json({ poruka: "Greška pri dohvatanju destinacija." });
  }
};

// Dohvati jednu destinaciju
const jednaDestinacija = async (req, res) => {
  try {
    const destinacija = await Destinacija.findById(req.params.id);
    if (!destinacija) return res.status(404).json({ poruka: "Destinacija nije pronađena." });
    res.status(200).json(destinacija);
  } catch (err) {
    res.status(500).json({ poruka: "Greška pri dohvatanju destinacije." });
  }
};

// Dodaj novu destinaciju
const dodajDestinaciju = async (req, res) => {
  try {
    const novaDestinacija = new Destinacija(req.body);
    await novaDestinacija.save();
    res.status(201).json(novaDestinacija);
  } catch (err) {
    res.status(400).json({ poruka: "Greška pri dodavanju destinacije." });
  }
};

// Ažuriraj destinaciju
const azurirajDestinaciju = async (req, res) => {
  try {
    const azurirana = await Destinacija.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!azurirana) return res.status(404).json({ poruka: "Destinacija nije pronađena." });
    res.status(200).json(azurirana);
  } catch (err) {
    res.status(400).json({ poruka: "Greška pri ažuriranju destinacije." });
  }
};

// Obriši destinaciju
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
  dohvatiDestinacije,
  jednaDestinacija,
  dodajDestinaciju,
  azurirajDestinaciju,
  obrisiDestinaciju
};
