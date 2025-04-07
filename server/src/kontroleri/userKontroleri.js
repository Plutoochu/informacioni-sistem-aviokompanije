import Korisnik from "../modeli.js";

export const azurirajKorisnika = async (req, res) => {
  try {
    const { id } = req.params;
    const { ime, prezime, email, telefon } = req.body;

    if (req.korisnik.id !== id && req.korisnik.role !== "admin") {
      return res.status(403).json({ poruka: "Nemate dozvolu za ažuriranje ovog korisnika." });
    }

    const korisnik = await Korisnik.findById(id);
    if (!korisnik) {
      return res.status(404).json({ poruka: "Korisnik nije pronađen." });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ poruka: "Neispravan format e-mail adrese." });
    }

    if (email && email !== korisnik.email) {
      const postojiEmail = await Korisnik.findOne({ email });
      if (postojiEmail) {
        return res.status(400).json({ poruka: "E-mail adresa je već u upotrebi." });
      }
      korisnik.email = email;
    }
    
    if (telefon && !/^\d{6,}$/.test(telefon)) {
      return res.status(400).json({ poruka: "Neispravan format telefona. Dozvoljene su samo cifre (min 6)." });
    }

    if (ime) korisnik.ime = ime;
    if (prezime) korisnik.prezime = prezime;
    if (telefon) korisnik.telefon = telefon;

    await korisnik.save();

    return res.status(200).json({ poruka: "Podaci uspješno ažurirani.", korisnik });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ poruka: "Greška prilikom ažuriranja korisnika." });
  }
};
