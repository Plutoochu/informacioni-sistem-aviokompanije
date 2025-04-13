import { Let, Avion } from "../modeli/modeli.js";

// Helper funkcije za rad sa datumima
const parseCustomDate = (dateStr) => {
  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return date;
};

const formatCustomDate = (date) => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

// Helper funkcija za validaciju datuma
const isValidDate = (day, month, year) => {
    const date = new Date(year, month - 1, day);
    return date.getDate() === parseInt(day) &&
           date.getMonth() === parseInt(month) - 1 &&
           date.getFullYear() === parseInt(year);
};

export const dohvatiLetove = async (req, res) => {
  try {
    const { odrediste, datumPolaska } = req.query;
    let query = {};

    if (odrediste) {
      query.odrediste = { $regex: new RegExp(odrediste, 'i') };
    }

    if (datumPolaska) {
      // Parsiramo datum iz formata dd/mm/yyyy
      const [dan, mjesec, godina] = datumPolaska.split('/').map(Number);
      
      // Validacija datuma
      if (!isValidDate(dan, mjesec, godina)) {
        return res.status(400).json({ message: "Neispravan format datuma. Koristite DD/MM/YYYY format." });
      }

      const startDate = new Date(godina, mjesec - 1, dan);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(godina, mjesec - 1, dan);
      endDate.setHours(23, 59, 59, 999);
      
      query.datumPolaska = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const letovi = await Let.find(query)
      .sort({ datumPolaska: 1 })
      .populate('avionId', 'naziv model brojSjedista')
      .lean();

    // Formatiramo datume u response-u
    const formattedLetovi = letovi.map(let_ => {
      const date = new Date(let_.datumPolaska);
      return {
        ...let_,
        datumPolaska: `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
      };
    });
      
    res.status(200).json(formattedLetovi);
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

    // Kreiramo datume u formatu dd/mm/yyyy
    const testniLetovi = [
      {
        polaziste: "Sarajevo",
        odrediste: "Istanbul",
        datumPolaska: parseCustomDate("01/05/2024"),
        cijena: 250,
        brojSlobodnihMjesta: 120,
        avionId: sacuvaniAvion._id
      },
      {
        polaziste: "Sarajevo",
        odrediste: "Dubai",
        datumPolaska: parseCustomDate("02/05/2024"),
        cijena: 450,
        brojSlobodnihMjesta: 150,
        avionId: sacuvaniAvion._id
      },
      {
        polaziste: "Sarajevo",
        odrediste: "Berlin",
        datumPolaska: parseCustomDate("03/05/2024"),
        cijena: 200,
        brojSlobodnihMjesta: 100,
        avionId: sacuvaniAvion._id
      }
    ];

    await Let.deleteMany({}); // Briše sve postojeće letove
    await Let.insertMany(testniLetovi);

    // Formatiramo datume u response-u
    const formattedLetovi = testniLetovi.map(let_ => ({
      ...let_,
      datumPolaska: formatCustomDate(let_.datumPolaska)
    }));

    res.status(201).json({ 
      message: "Testni letovi su uspješno kreirani",
      avion: sacuvaniAvion,
      letovi: formattedLetovi
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
