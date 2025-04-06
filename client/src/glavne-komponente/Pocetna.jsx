import React, { useState } from "react";
import { useNavigate } from "react-router";
import avionLogo from "../assets/avion.svg";
import { prijava, registracija } from "../pomocne-funkcije/fetch-funkcije";
import { Dugme } from "../reusable-komponente/Dugme";

const Pocetna = () => {
  const [prijavaPodaci, setPrijavaPodaci] = useState({
    korisnickoImeIliEmail: "",
    sifra: ""
  });
  const [registracijaPodaci, setRegistracijaPodaci] = useState({
    korisnickoIme: "",
    email: "",
    sifra: "",
    potvrdaSifre: ""
  });
  const [greska, setGreska] = useState("");
  const [prikazRegistracije, setPrikazRegistracije] = useState(false);
  const navigate = useNavigate();

  const handlePrijava = async (e) => {
    e.preventDefault();
    const { korisnickoImeIliEmail, sifra } = prijavaPodaci;
    
    if (!korisnickoImeIliEmail || !sifra) {
      setGreska("Molimo popunite sva polja.");
      return;
    }

    try {
      const odgovor = await prijava({ 
        usernameEmail: korisnickoImeIliEmail, 
        password: sifra 
      });
      
      if (odgovor && odgovor.uspesno) {
        navigate("/");
      } else {
        setGreska(odgovor?.poruka || "Pogrešni prijavni podaci.");
      }
    } catch (err) {
      setGreska(err.response?.data?.poruka || "Došlo je do greške prilikom prijave.");
      console.error(err);
    }
  };

  const handleRegistracija = async (e) => {
    e.preventDefault();
    const { korisnickoIme, email, sifra, potvrdaSifre } = registracijaPodaci;
    
    if (!korisnickoIme || !email || !sifra || !potvrdaSifre) {
      setGreska("Sva polja moraju biti popunjena.");
      return;
    }
    
    if (sifra !== potvrdaSifre) {
      setGreska("Šifre se ne podudaraju.");
      return;
    }

    try {
      const odgovor = await registracija({ 
        username: korisnickoIme,
        email: email,
        password: sifra
      });
      
      if (odgovor && odgovor.uspesno) {
        setGreska("");
        setPrikazRegistracije(false);
        setGreska("Registracija uspješna! Možete se prijaviti.");
      } else {
        setGreska(odgovor?.poruka || "Došlo je do greške prilikom registracije.");
      }
    } catch (err) {
      setGreska(err.response?.data?.poruka || "Došlo je do greške prilikom registracije.");
      console.error(err);
    }
  };

  return (
    <div className="App">
      <div className="flex gap-8 mb-8 justify-center">
        <img src={avionLogo} className="logo avion" alt="Avion logo" />
      </div>
  
      <div className="card">
        <h1>{prikazRegistracije ? "Registracija" : "Prijava"}</h1>
        
        {!prikazRegistracije ? (
          <form onSubmit={handlePrijava}>
            <input
              type="text"
              value={prijavaPodaci.korisnickoImeIliEmail}
              onChange={(e) => setPrijavaPodaci({...prijavaPodaci, korisnickoImeIliEmail: e.target.value})}
              placeholder="Korisničko ime ili email"
              className="input-field"
            />
            <input
              type="password"
              value={prijavaPodaci.sifra}
              onChange={(e) => setPrijavaPodaci({...prijavaPodaci, sifra: e.target.value})}
              placeholder="Šifra"
              className="input-field"
            />
            {greska && <p className="error">{greska}</p>}
            <Dugme text="Prijavi se" type="submit" />
            <p className="mt-4">
              Nemate račun?{""}
              <span 
                className="link" 
                onClick={() => setPrikazRegistracije(true)}
              >
                Registrujte se!
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegistracija}>
            <input
              type="text"
              value={registracijaPodaci.korisnickoIme}
              onChange={(e) => setRegistracijaPodaci({...registracijaPodaci, korisnickoIme: e.target.value})}
              placeholder="Korisničko ime"
              className="input-field"
            />
            <input
              type="email"
              value={registracijaPodaci.email}
              onChange={(e) => setRegistracijaPodaci({...registracijaPodaci, email: e.target.value})}
              placeholder="Email"
              className="input-field"
            />
            <input
              type="password"
              value={registracijaPodaci.sifra}
              onChange={(e) => setRegistracijaPodaci({...registracijaPodaci, sifra: e.target.value})}
              placeholder="Šifra"
              className="input-field"
            />
            <input
              type="password"
              value={registracijaPodaci.potvrdaSifre}
              onChange={(e) => setRegistracijaPodaci({...registracijaPodaci, potvrdaSifre: e.target.value})}
              placeholder="Potvrdite šifru"
              className="input-field"
            />
            {greska && <p className="error">{greska}</p>}
            <Dugme text="Registruj se" type="submit" />
            <p className="mt-4">
              Već ste registrovani?{""}
              <span 
                className="link" 
                onClick={() => setPrikazRegistracije(false)}
              >
                Prijavite se!
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Pocetna;