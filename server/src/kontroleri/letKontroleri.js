import { Let, Avion } from "../modeli/modeli.js";

export const dohvatiLetove = async (req, res) => {
  try {
    const { odrediste, datumPolaska } = req.query;
    let query = {};

    if (odrediste) {
      query.odrediste = { $regex: new RegExp(odrediste, 'i') };
    }

    if (datumPolaska) {
      // Kreiranje raspona za taj dan (od početka do kraja dana)
      const startDate = new Date(datumPolaska);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(datumPolaska);
      endDate.setHours(23, 59, 59, 999);
      
      query.datumPolaska = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const letovi = await Let.find(query)
      .sort({ datumPolaska: 1 })
      .populate('avionId', 'naziv model brojSjedista');
      
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
    // Prvo kreiramo testni avion
    const testniAvion = new Avion({
      naziv: "Boeing 737",
      model: "737-800",
      tip: "Putnički",
      registracijskiBroj: "TC-JFV",
      konfiguracijaSjedala: "F10C20Y120",
      brojSjedista: 150,
      status: "aktivan",
      sjedalaPoRedu: {
        F: 2,
        C: 3,
        Y: 6
      }
    });

    await Avion.deleteMany({}); // Briše sve postojeće avione
    const sacuvaniAvion = await testniAvion.save();

    const testniLetovi = [
      {
        polaziste: "Sarajevo",
        odrediste: "Istanbul",
        datumPolaska: new Date("2024-05-01T10:00:00Z"),
        cijena: 250,
        brojSlobodnihMjesta: 120,
        avionId: sacuvaniAvion._id
      },
      {
        polaziste: "Sarajevo",
        odrediste: "Dubai",
        datumPolaska: new Date("2024-05-02T15:30:00Z"),
        cijena: 450,
        brojSlobodnihMjesta: 150,
        avionId: sacuvaniAvion._id
      },
      {
        polaziste: "Sarajevo",
        odrediste: "Berlin",
        datumPolaska: new Date("2024-05-03T08:45:00Z"),
        cijena: 200,
        brojSlobodnihMjesta: 100,
        avionId: sacuvaniAvion._id
      }
    ];

    await Let.deleteMany({}); // Briše sve postojeće letove
    await Let.insertMany(testniLetovi);

    res.status(201).json({ 
      message: "Testni letovi su uspješno kreirani",
      avion: sacuvaniAvion,
      brojLetova: testniLetovi.length
    });
  } catch (error) {
    console.error("Greška pri kreiranju testnih letova:", error);
    res.status(500).json({ message: "Greška pri kreiranju testnih letova" });
  }
};

export const dohvatiDestinacije = async (req, res) => {
  try {
    // Dohvatamo jedinstvene destinacije iz svih letova
    const destinacije = await Let.distinct('odrediste');
    res.status(200).json(destinacije.sort()); // Sortiramo abecedno
  } catch (error) {
    console.error("Greška pri dohvatanju destinacija:", error);
    res.status(500).json({ message: "Greška pri dohvatanju destinacija" });
  }
};
