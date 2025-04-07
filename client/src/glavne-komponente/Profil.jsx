import { useState } from 'react';
import { useSelector } from 'react-redux';
import { azurirajKorisnika } from '../pomocne-funkcije/fetch-funkcije';



const Profil = ({ token }) => {
  const korisnik = useSelector(state => state.aviosistem.korisnik); 
  if (!korisnik) {
    return <div>Učitavanje korisničkih podataka...</div>;
  }

  const [editMode, setEditMode] = useState(false);
  const [forma, setForma] = useState({ ...korisnik });

  const handleChange = (e) => {
    setForma({ ...forma, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const azurirani = await azurirajKorisnika(korisnik._id, token, forma);
      alert("Podaci su uspješno ažurirani!");
      setEditMode(false);
    } catch (err) {
      alert("Došlo je do greške prilikom ažuriranja.");
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Profil korisnika</h2>
      {editMode ? (
        <form onSubmit={handleSubmit}>
          <label>Ime: <input name="ime" value={forma.ime} onChange={handleChange} /></label><br />
          <label>Prezime: <input name="prezime" value={forma.prezime} onChange={handleChange} /></label><br />
          <label>Email: <input name="email" value={forma.email} onChange={handleChange} /></label><br />
          <label>Telefon: <input name="telefon" value={forma.telefon || ''} onChange={handleChange} /></label><br />
          <button type="submit">Sačuvaj</button>
          <button type="button" onClick={() => setEditMode(false)}>Otkaži</button>
        </form>
      ) : (
        <div>
          <p><strong>Ime:</strong> {korisnik.ime}</p>
          <p><strong>Prezime:</strong> {korisnik.prezime}</p>
          <p><strong>Email:</strong> {korisnik.email}</p>
          <p><strong>Telefon:</strong> {korisnik.telefon || '/'}</p>
          <button onClick={() => setEditMode(true)}>Uredi profil</button>
        </div>
      )}
    </div>
  );
};

export default Profil;
