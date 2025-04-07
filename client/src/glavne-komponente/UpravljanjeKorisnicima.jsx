import React, { useEffect, useState } from "react";
import { dobaviKorisnike } from "../pomocne-funkcije/fetch-funkcije";

const UpravljanjeKorisnicima = () => {
  const [korisnici, setKorisnici] = useState(null);

  useEffect(() => {
    dobaviKorisnike()
      .then((data) => {
        setKorisnici(data.data);
      })
      .catch((error) => {
        console.log(`Desila se greska: ${error}`);
      });
  }, []);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Lista korisnika</h1>
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-left text-sm uppercase tracking-wider">
              <th className="p-3">Ime</th>
              <th className="p-3">Prezime</th>
              <th className="p-3">Email</th>
              <th className="p-3">Telefon</th>
              <th className="p-3">Role</th>
              <th className="p-3">Datum registracije</th>
            </tr>
          </thead>
          <tbody>
            {korisnici.map((korisnik) => (
              <tr key={korisnik._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{korisnik.ime}</td>
                <td className="p-3">{korisnik.prezime}</td>
                <td className="p-3">{korisnik.email}</td>
                <td className="p-3">{korisnik.telefon || "N/A"}</td>
                <td className="p-3 capitalize">{korisnik.role}</td>
                <td className="p-3">{new Date(korisnik.datumRegistracije).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UpravljanjeKorisnicima;
