import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = React.createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [korisnik, setKorisnik] = useState(null);
  const navigate = useNavigate();

  const prijaviKorisnika = async (email, lozinka) => {
    try {
      const odgovor = await axios.post('http://localhost:5000/api/korisnici/prijava', {
        email,
        lozinka
      });

      if (odgovor.data.token) {
        localStorage.setItem('token', odgovor.data.token);
        localStorage.setItem('korisnik', JSON.stringify(odgovor.data.korisnik));
        setKorisnik(odgovor.data.korisnik);
        navigate('/pocetna');
        return { uspjesno: true };
      }
    } catch (error) {
      console.error('Greška pri prijavi:', error);
      return { 
        uspjesno: false, 
        poruka: error.response?.data?.message || 'Došlo je do greške prilikom prijave' 
      };
    }
  };

  const odjaviKorisnika = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('korisnik');
    setKorisnik(null);
    navigate('/prijava');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const sacuvaniKorisnik = localStorage.getItem('korisnik');
    
    if (token && sacuvaniKorisnik) {
      setKorisnik(JSON.parse(sacuvaniKorisnik));
    }
  }, []);

  const value = {
    korisnik,
    prijaviKorisnika,
    odjaviKorisnika
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 