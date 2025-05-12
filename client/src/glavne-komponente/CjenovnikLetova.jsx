import React, { useEffect, useState } from "react";
import { dohvatiDestinacije, dohvatiAviokompanije } from "../pomocne-funkcije/fetch-funkcije";
import { dohvatiCjenovnik, dodajCijenu, azurirajCijenu, obrisiCijenu } from "../pomocne-funkcije/cijeneApi";

const CjenovnikLetova = () => {
  const [aviokompanije, setAviokompanije] = useState([]);
  const [destinacije, setDestinacije] = useState([]);
  const [cjenovnik, setCjenovnik] = useState([]);
  const [dodavanjeCijene, setDodavanjeCijene] = useState(false);
  const [cijenaIdAzuriranje, setCijenaIdAzuriranje] = useState("");

  const [novaCijena, setNovaCijena] = useState({
    polaziste: "",
    odrediste: "",
    aviokompanija: "",
    klasa: "",
    odDatuma: "",
    doDatuma: "",
    cijena: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const destRes = await dohvatiDestinacije();
        const aviokompanijeRes = await dohvatiAviokompanije();
        const cjenovnikRes = await dohvatiCjenovnik();

        setDestinacije(destRes);
        setAviokompanije(aviokompanijeRes);
        setCjenovnik(cjenovnikRes);
      } catch (err) {
        console.error("Greška pri učitavanju podataka:", err);
      }
    })();
  }, []);

  const handleChange = (e) => {
    setNovaCijena((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDodavanjeCijene = async (e) => {
    e.preventDefault();

    if (cijenaIdAzuriranje) {
      const i = cjenovnik.findIndex((cijena) => cijena._id === cijenaIdAzuriranje);

      await azurirajCijenu(cijenaIdAzuriranje, novaCijena);

      const noviCjenovnik = [...cjenovnik];
      noviCjenovnik[i] = { _id: cijenaIdAzuriranje, ...novaCijena };
      setCjenovnik(noviCjenovnik);
    } else {
      const res = await dodajCijenu(novaCijena);
      setCjenovnik((s) => [...s, { _id: res._id, ...novaCijena }]);
    }

    // setNovaCijena({
    //   polaziste: "",
    //   odrediste: "",
    //   aviokompanija: "",
    //   klasa: "",
    //   odDatuma: "",
    //   doDatuma: "",
    //   cijena: "",
    // });
    // setDodavanjeCijene(false);
  };

  const handleObrisi = async (_id) => {
    await obrisiCijenu(_id);
    setCjenovnik((s) => s.filter((cijena) => cijena._id !== _id));
    setCijenaIdAzuriranje("");
  };

  const handleAzuriraj = async (cijena) => {
    setCijenaIdAzuriranje(cijena._id);
    setDodavanjeCijene(true);
    setNovaCijena({
      polaziste: cijena.polaziste,
      odrediste: cijena.odrediste,
      aviokompanija: cijena.aviokompanija,
      klasa: cijena.klasa,
      odDatuma: cijena.odDatuma.slice(0, 10),
      doDatuma: cijena.doDatuma.slice(0, 10),
      cijena: cijena.cijena,
    });
  };

  const handleOtkazi = async () => {
    setNovaCijena({
      polaziste: "",
      odrediste: "",
      aviokompanija: "",
      klasa: "",
      odDatuma: "",
      doDatuma: "",
      cijena: "",
    });
    setCijenaIdAzuriranje("");
    setDodavanjeCijene(false);
  };

  return (
    <div className="flex flex-col gap-5 max-w-11/12 mx-auto">
      <h1 className="mt-8 text-5xl text-center">Cjenovnik</h1>
      <div className="flex flex-col bg-white p-5 rounded-xl gap-4">
        {cjenovnik.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Klasa</th>
                <th>Ruta</th>
                <th>Aviokompanija</th>
                <th>Od - do</th>
                <th>Cijena (KM)</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {cjenovnik.map((cijena, id) => {
                return (
                  <tr key={id}>
                    <td>{cijena.klasa}</td>
                    <td>
                      {cijena.polaziste} → {cijena.odrediste}
                    </td>
                    <td>{cijena.aviokompanija}</td>
                    <td>
                      {cijena.odDatuma.slice(0, 10)} - {cijena.doDatuma.slice(0, 10)}
                    </td>
                    <td>{cijena.cijena}</td>
                    <td>
                      <div className="flight-actions">
                        <button className="btn-edit" onClick={() => handleAzuriraj(cijena)}>
                          Uredi
                        </button>
                        <button className="btn-cancel" onClick={() => handleObrisi(cijena._id)}>
                          Obriši
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-center my-2 text-xl">
            Trenutno nema unesenih cijena.
            <br /> Dodajte novu cijenu za prikaz.
          </p>
        )}
        {dodavanjeCijene && (
          <form onSubmit={handleDodavanjeCijene}>
            <div className="flex gap-4">
              <div className="form-group">
                <label htmlFor="klasa">Klasa</label>
                <select id="klasa" name="klasa" value={novaCijena.klasa} onChange={handleChange} required>
                  <option value="">-- Odaberite klasu --</option>
                  {["Ekonomska", "Biznis", "Prva"].map((klasa) => (
                    <option key={klasa} value={klasa}>
                      {klasa}
                    </option>
                  ))}
                </select>
              </div>

              {["polaziste", "odrediste"].map((polje, id) => (
                <div className="form-group" key={id}>
                  <label htmlFor={polje}>{polje === "polaziste" ? "Polazište" : "Odredište"}</label>
                  <select id={polje} name={polje} value={novaCijena[polje]} onChange={handleChange} required>
                    <option value="">-- Odaberite --</option>
                    {destinacije.map((dest) => (
                      <option key={dest._id} value={dest.grad}>
                        {dest.grad} - {dest.nazivAerodroma}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="form-group">
                <label htmlFor="aviokompanija">Aviokompanija</label>
                <select
                  id="aviokompanija"
                  name="aviokompanija"
                  value={novaCijena.aviokompanija}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Odaberite aviokompaniju --</option>
                  {aviokompanije.map((avio) => (
                    <option key={avio._id} value={avio.naziv}>
                      {avio.naziv} ({avio.kod})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="odDatuma">Od datuma:</label>
                <input
                  type="date"
                  value={novaCijena.odDatuma}
                  name="odDatuma"
                  onChange={(e) => setNovaCijena((s) => ({ ...s, odDatuma: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="doDatuma">Do datuma:</label>
                <input
                  type="date"
                  value={novaCijena.doDatuma}
                  name="doDatuma"
                  onChange={(e) => setNovaCijena((s) => ({ ...s, doDatuma: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cijena">Cijena (KM)</label>
                <input
                  type="number"
                  id="cijena"
                  name="cijena"
                  value={novaCijena.cijena}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                formAction="submit"
                className=" hover:bg-green-700 bg-green-600 text-white py-2.5 px-5 rounded-md cursor-pointer self-center"
              >
                {cijenaIdAzuriranje ? "Ažuriraj cijenu" : "Dodaj cijenu"}
              </button>
              <button
                className="bg-red-600 text-white py-2.5 px-5 rounded-md cursor-pointer hover:bg-red-700 self-center"
                onClick={handleOtkazi}
              >
                Otkaži
              </button>
            </div>
          </form>
        )}
        {!dodavanjeCijene && (
          <button
            className="hover:bg-green-700 bg-green-600 text-white py-2.5 px-5 rounded-md cursor-pointer self-center"
            onClick={() => setDodavanjeCijene((s) => !s)}
          >
            Nova cijena
          </button>
        )}
      </div>
    </div>
  );
};

export default CjenovnikLetova;
