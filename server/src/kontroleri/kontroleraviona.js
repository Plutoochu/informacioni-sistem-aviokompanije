import Avion from '../modeli.js';

//Dodaj novi avion
const dodajAvion = async (req, res) => {
    try {
        const noviAvion = new Avion(req.body);
        await noviAvion.save();
        res.status(201).json(noviAvion);
    } catch (greska) {
        res.status(400).json({ poruka: greska.message });
    }
};

//Dohvati sve avione 
const dohvatiAvione = async (req, res) => {
    try {
        const avioni = await Avion.find();
        res.json(avioni);
    } catch (greska) {
        res.status(500).json({ poruka: greska.message });
    }
};


const dohvatiAvionPoId = async (req, res) => {
    try {
        const avion = await Avion.findById(req.params.id);
        if (!avion) return res.status(404).json({ poruka: "Avion nije pronađen." });
        res.json(avion);
    } catch (greska) {
        res.status(500).json({ poruka: greska.message });
    }
};

//Ažurirajnje aviona
const azurirajAvion = async (req, res) => {
    try {
        const azuriranAvion = await Avion.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!azuriranAvion) return res.status(404).json({ poruka: "Avion nije pronađen." });
        res.json(azuriranAvion);
    } catch (greska) {
        res.status(400).json({ poruka: greska.message });
    }
};

//Brisanje aviona
const obrisiAvion = async (req, res) => {
    try {
        const obrisanAvion = await Avion.findByIdAndDelete(req.params.id);
        if (!obrisanAvion) return res.status(404).json({ poruka: "Avion nije pronađen." });
        res.json({ poruka: "Avion uspješno obrisan." });
    } catch (greska) {
        res.status(500).json({ poruka: greska.message });
    }
};

export default {
    dodajAvion,
    dohvatiAvione,
    dohvatiAvionPoId,
    azurirajAvion,
    obrisiAvion
};
