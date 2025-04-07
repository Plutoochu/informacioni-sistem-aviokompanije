import { Let } from "../modeli/modeli.js";

export const dohvatiLetove = async (req, res) => {
  try {
    const letovi = await Let.find().sort({ datumPolaska: 1 }); // Sortiranje po datumu polaska
    res.status(200).json(letovi);
  } catch (error) {
    console.error("Greška pri dohvatanju letova:", error);
    res.status(500).json({ message: "Greška pri dohvatanju letova" });
  }
};

export const dodajLet = async (req, res) => {
  try {
    const noviLet = new Let(req.body);
    await noviLet.save();
    res.status(201).json(noviLet);
  } catch (error) {
    console.error("Greška pri dodavanju leta:", error);
    res.status(500).json({ message: "Greška pri dodavanju leta" });
  }
};

export const dohvatiLet = async (req, res) => {
  try {
    const let_ = await Let.findById(req.params.id);
    if (!let_) {
      return res.status(404).json({ message: "Let nije pronađen" });
    }
    res.status(200).json(let_);
  } catch (error) {
    console.error("Greška pri dohvatanju leta:", error);
    res.status(500).json({ message: "Greška pri dohvatanju leta" });
  }
};

export const kreirajTestneLetove = async (req, res) => {
  try {
    const testniLetovi = [
      {
        polaziste: "Sarajevo",
        odrediste: "Istanbul",
        datumPolaska: new Date("2024-05-01T10:00:00Z"),
        cijena: 250,
        brojSlobodnihMjesta: 120,
        avionId: "65f9d2e8b5b5b5b5b5b5b5b5", // Ovo trebate zamijeniti sa stvarnim ID-em aviona
      },
      {
        polaziste: "Sarajevo",
        odrediste: "Dubai",
        datumPolaska: new Date("2024-05-02T15:30:00Z"),
        cijena: 450,
        brojSlobodnihMjesta: 150,
        avionId: "65f9d2e8b5b5b5b5b5b5b5b5",
      },
      {
        polaziste: "Sarajevo",
        odrediste: "Berlin",
        datumPolaska: new Date("2024-05-03T08:45:00Z"),
        cijena: 200,
        brojSlobodnihMjesta: 100,
        avionId: "65f9d2e8b5b5b5b5b5b5b5b5",
      },
    ];

    await Let.deleteMany({}); // Briše sve postojeće letove
    await Let.insertMany(testniLetovi);

    res.status(201).json({ message: "Testni letovi su uspješno kreirani" });
  } catch (error) {
    console.error("Greška pri kreiranju testnih letova:", error);
    res.status(500).json({ message: "Greška pri kreiranju testnih letova" });
  }
};
