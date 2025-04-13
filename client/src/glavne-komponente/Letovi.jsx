import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../stilovi/App.css';

const Letovi = () => {
    const [letovi, setLetovi] = useState([]);
    const [destinacije, setDestinacije] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        odrediste: '',
        dan: '',
        mjesec: '',
        godina: ''
    });

    const fetchDestinacije = async () => {
        try {
            const response = await axios.get('/api/letovi/destinacije');
            setDestinacije(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Greška pri dohvatanju destinacija:', err);
            setDestinacije([]);
        }
    };

    const fetchLetovi = async () => {
        try {
            setLoading(true);
            setError(null);
            const params = {};
            if (filters.odrediste) params.odrediste = filters.odrediste;
            
            // Kreiramo datum samo ako su sva polja popunjena
            if (filters.dan && filters.mjesec && filters.godina) {
                const datumString = `${filters.godina}-${filters.mjesec.padStart(2, '0')}-${filters.dan.padStart(2, '0')}`;
                params.datumPolaska = datumString;
            }
            
            const response = await axios.get('/api/letovi', { params });
            setLetovi(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Došlo je do greške pri učitavanju letova.');
            console.error('Greška:', err);
            setLetovi([]);
        } finally {
            setLoading(false);
        }
    };

    const kreirajTestneLetove = async () => {
        try {
            setLoading(true);
            setError(null);
            await axios.post('/api/letovi/kreiraj-testne');
            await fetchLetovi();
            await fetchDestinacije();
            alert('Testni letovi su uspješno kreirani!');
        } catch (err) {
            setError('Došlo je do greške pri kreiranju testnih letova.');
            console.error('Greška:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDestinacije();
        fetchLetovi();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        
        // Validacija unosa
        if (name === 'dan') {
            const dan = parseInt(value);
            if (value && (dan < 1 || dan > 31)) return;
            if (value && value.length > 2) return;
        }
        if (name === 'mjesec') {
            const mjesec = parseInt(value);
            if (value && (mjesec < 1 || mjesec > 12)) return;
            if (value && value.length > 2) return;
        }
        if (name === 'godina') {
            if (value && value.length > 4) return;
        }
        
        // Dozvoljavamo samo brojeve za datum
        if (['dan', 'mjesec', 'godina'].includes(name) && value !== '') {
            if (!/^\d+$/.test(value)) return;
        }

        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchLetovi();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('bs-BA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="letovi-container">
            <h2>Pretraga Letova</h2>
            
            <div className="admin-controls" style={{ marginBottom: '1rem' }}>
                <button 
                    onClick={kreirajTestneLetove} 
                    className="kreiraj-testne-dugme"
                    disabled={loading}
                >
                    Kreiraj testne letove
                </button>
            </div>

            <form onSubmit={handleSearch} className="pretraga-forma">
                <div className="form-group">
                    <select
                        name="odrediste"
                        value={filters.odrediste}
                        onChange={handleFilterChange}
                        className="input-field select-field"
                    >
                        <option value="">Sve destinacije</option>
                        {Array.isArray(destinacije) && destinacije.map((destinacija) => (
                            <option key={destinacija} value={destinacija}>
                                {destinacija}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group date-group">
                    <div className="date-inputs">
                        <input
                            type="text"
                            name="dan"
                            placeholder="DD"
                            value={filters.dan}
                            onChange={handleFilterChange}
                            className="input-field date-input"
                            maxLength="2"
                        />
                        <span className="date-separator">/</span>
                        <input
                            type="text"
                            name="mjesec"
                            placeholder="MM"
                            value={filters.mjesec}
                            onChange={handleFilterChange}
                            className="input-field date-input"
                            maxLength="2"
                        />
                        <span className="date-separator">/</span>
                        <input
                            type="text"
                            name="godina"
                            placeholder="YYYY"
                            value={filters.godina}
                            onChange={handleFilterChange}
                            className="input-field date-input year-input"
                            maxLength="4"
                        />
                    </div>
                </div>
                <button type="submit" className="pretrazi-dugme" disabled={loading}>
                    Pretraži
                </button>
            </form>

            {loading && <div className="loading">Učitavanje...</div>}
            {error && <div className="error">{error}</div>}
            
            <div className="letovi-grid">
                {Array.isArray(letovi) && letovi.map((let_) => (
                    <div key={let_._id} className="let-kartica">
                        <div className="let-info">
                            <h3>{let_.polaziste} → {let_.odrediste}</h3>
                            <p>Datum polaska: {formatDate(let_.datumPolaska)}</p>
                            <p>Cijena: {let_.cijena} €</p>
                            <p>Slobodna mjesta: {let_.brojSlobodnihMjesta}</p>
                            {let_.avionId && (
                                <p className="avion-info">
                                    Avion: {let_.avionId.naziv} ({let_.avionId.model})
                                </p>
                            )}
                        </div>
                        <button 
                            className="rezervisi-dugme" 
                            onClick={() => alert('Funkcionalnost rezervacije će biti dostupna uskoro!')}
                            disabled={let_.brojSlobodnihMjesta === 0}
                        >
                            {let_.brojSlobodnihMjesta === 0 ? 'Popunjeno' : 'Rezerviši'}
                        </button>
                    </div>
                ))}
                {!loading && !error && (!letovi || letovi.length === 0) && (
                    <div className="no-results">
                        Nema dostupnih letova za odabrane kriterije.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Letovi; 