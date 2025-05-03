import { Destinacija } from "../modeli/modeli.js"; // Assuming you have a 'Destinacija' model similar to the 'Avion' model

// Dodaj novu destinaciju
const dodajDestinaciju = async (req, res) => {
  try {
    const novaDestinacija = new Destinacija(req.body);
    await novaDestinacija.save();
    res.status(201).json(novaDestinacija);
  } catch (greska) {
    res.status(400).json({ poruka: greska.message });
  }
};

// Dohvati sve destinacije
const dohvatiDestinacije = async (req, res) => {
  try {
    const destinacije = await Destinacija.find();
    res.json(destinacije);
  } catch (greska) {
    res.status(500).json({ poruka: greska.message });
  }
};

// Dohvati destinaciju po ID-u
const dohvatiDestinacijuPoId = async (req, res) => {
  try {
    const destinacija = await Destinacija.findById(req.params.id);
    if (!destinacija) return res.status(404).json({ poruka: "Destinacija nije pronađena." });
    res.json(destinacija);
  } catch (greska) {
    res.status(500).json({ poruka: greska.message });
  }
};

// Ažuriranje destinacije
const azurirajDestinaciju = async (req, res) => {
  try {
    const azuriranaDestinacija = await Destinacija.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!azuriranaDestinacija) return res.status(404).json({ poruka: "Destinacija nije pronađena." });
    res.json(azuriranaDestinacija);
  } catch (greska) {
    res.status(400).json({ poruka: greska.message });
  }
};

// Brisanje destinacije
const obrisiDestinaciju = async (req, res) => {
  try {
    const obrisanaDestinacija = await Destinacija.findByIdAndDelete(req.params.id);
    if (!obrisanaDestinacija) return res.status(404).json({ poruka: "Destinacija nije pronađena." });
    res.json({ poruka: "Destinacija uspješno obrisana." });
  } catch (greska) {
    res.status(500).json({ poruka: greska.message });
  }
};

export default {
  dodajDestinaciju,
  dohvatiDestinacije,
  dohvatiDestinacijuPoId,
  azurirajDestinaciju,
  obrisiDestinaciju,
};
