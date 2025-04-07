import React from 'react';
import '../stilovi/App.css';

const Letovi = () => {
    // Statični podaci za prikaz
    const mockLetovi = [
        {
            id: 1,
            polaziste: 'Sarajevo',
            odrediste: 'Istanbul',
            datumPolaska: '01.05.2024 10:00',
            cijena: 250,
            brojSlobodnihMjesta: 120
        },
        {
            id: 2,
            polaziste: 'Sarajevo',
            odrediste: 'Dubai',
            datumPolaska: '02.05.2024 15:30',
            cijena: 450,
            brojSlobodnihMjesta: 150
        },
        {
            id: 3,
            polaziste: 'Sarajevo',
            odrediste: 'Berlin',
            datumPolaska: '03.05.2024 08:45',
            cijena: 200,
            brojSlobodnihMjesta: 100
        }
    ];

    return (
        <div className="letovi-container">
            <h2>Dostupni Letovi</h2>
            <div className="letovi-grid">
                {mockLetovi.map((flight) => (
                    <div key={flight.id} className="let-kartica">
                        <div className="let-info">
                            <h3>{flight.polaziste} → {flight.odrediste}</h3>
                            <p>Datum polaska: {flight.datumPolaska}</p>
                            <p>Cijena: {flight.cijena} €</p>
                            <p>Slobodna mjesta: {flight.brojSlobodnihMjesta}</p>
                        </div>
                        <button className="rezervisi-dugme" onClick={() => alert('Funkcionalnost rezervacije će biti dostupna uskoro!')}>
                            Rezerviši
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Letovi; 