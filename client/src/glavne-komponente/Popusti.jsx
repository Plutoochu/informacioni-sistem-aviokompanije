import { useEffect, useState } from "react";
import { dohvatiPopuste, dodajPopust, azurirajPopust, obrisiPopust } from "../pomocne-funkcije/cijenePopustiApi";

const Popusti = ({ destinacije, aviokompanije }) => {
  const [popusti, setPopusti] = useState([]);
  const [dodavanjePopusta, setDodavanjePopusta] = useState(false);
  const [popustIdAzuriranje, setPopustIdAzuriranje] = useState("");

  const [noviPopust, setNoviPopust] = useState({
    polaziste: "",
    odrediste: "",
    aviokompanija: "",
    klasa: "",
    odDatuma: "",
    doDatuma: "",
    popust: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const popustiRes = await dohvatiPopuste();

        setPopusti(popustiRes);
      } catch (err) {
        console.error("Greška pri učitavanju podataka:", err);
      }
    })();
  }, []);

  const handleChange = (e) => {
    setNoviPopust((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDodavanjePopusta = async (e) => {
    e.preventDefault();

    if (popustIdAzuriranje) {
      const i = popusti.findIndex((popust) => popust._id === popustIdAzuriranje);

      await azurirajPopust(popustIdAzuriranje, noviPopust);

      const noviPopusti = [...popusti];
      noviPopusti[i] = { _id: popustIdAzuriranje, ...noviPopust };
      setPopusti(noviPopusti);
    } else {
      const res = await dodajPopust(noviPopust);
      setPopusti((s) => [...s, { _id: res._id, ...noviPopust }]);
    }

    // setNoviPopust({
    //   polaziste: "",
    //   odrediste: "",
    //   aviokompanija: "",
    //   klasa: "",
    //   odDatuma: "",
    //   doDatuma: "",
    //   popust: "",
    // });
    // setDodavanjePopusta(false);
  };

  const handleObrisi = async (_id) => {
    await obrisiPopust(_id);
    setPopusti((s) => s.filter((popust) => popust._id !== _id));
    setPopustIdAzuriranje("");
  };

  const handleAzuriraj = async (popust) => {
    setPopustIdAzuriranje(popust._id);
    setDodavanjePopusta(true);
    setNoviPopust({
      polaziste: popust.polaziste,
      odrediste: popust.odrediste,
      aviokompanija: popust.aviokompanija,
      klasa: popust.klasa,
      odDatuma: popust.odDatuma.slice(0, 10),
      doDatuma: popust.doDatuma.slice(0, 10),
      popust: popust.popust,
    });
  };

  const handleOtkazi = async () => {
    setNoviPopust({
      polaziste: "",
      odrediste: "",
      aviokompanija: "",
      klasa: "",
      odDatuma: "",
      doDatuma: "",
      popust: "",
    });
    setPopustIdAzuriranje("");
    setDodavanjePopusta(false);
  };

  return (
    <>
      <h1 className="mt-8 text-5xl text-center">Popusti</h1>
      <div className="flex flex-col bg-white p-5 rounded-xl gap-4">
        {popusti.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Klasa</th>
                <th>Ruta</th>
                <th>Aviokompanija</th>
                <th>Od - do</th>
                <th>Popust (%)</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {popusti.map((popust, id) => {
                return (
                  <tr key={id}>
                    <td>{popust.klasa}</td>
                    <td>
                      {popust.polaziste} → {popust.odrediste}
                    </td>
                    <td>{popust.aviokompanija}</td>
                    <td>
                      {popust.odDatuma.slice(0, 10)} - {popust.doDatuma.slice(0, 10)}
                    </td>
                    <td>{popust.popust}</td>
                    <td>
                      <div className="flight-actions">
                        <button className="btn-edit" onClick={() => handleAzuriraj(popust)}>
                          Uredi
                        </button>
                        <button className="btn-cancel" onClick={() => handleObrisi(popust._id)}>
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
            Trenutno nema unesenih popusta.
            <br /> Dodajte novi popust za prikaz.
          </p>
        )}
        {dodavanjePopusta && (
          <form onSubmit={handleDodavanjePopusta}>
            <div className="flex gap-4">
              <div className="form-group">
                <label htmlFor="klasa">Klasa</label>
                <select id="klasa" name="klasa" value={noviPopust.klasa} onChange={handleChange} required>
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
                  <select id={polje} name={polje} value={noviPopust[polje]} onChange={handleChange} required>
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
                  value={noviPopust.aviokompanija}
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
                  value={noviPopust.odDatuma}
                  name="odDatuma"
                  onChange={(e) => setNoviPopust((s) => ({ ...s, odDatuma: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="doDatuma">Do datuma:</label>
                <input
                  type="date"
                  value={noviPopust.doDatuma}
                  name="doDatuma"
                  onChange={(e) => setNoviPopust((s) => ({ ...s, doDatuma: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="popust">Popust (%)</label>
                <input
                  type="number"
                  id="popust"
                  name="popust"
                  value={noviPopust.popust}
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
                {popustIdAzuriranje ? "Ažuriraj popust" : "Dodaj popust"}
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
        {!dodavanjePopusta && (
          <button
            className="hover:bg-green-700 bg-green-600 text-white py-2.5 px-5 rounded-md cursor-pointer self-center"
            onClick={() => setDodavanjePopusta((s) => !s)}
          >
            Novi popust
          </button>
        )}
      </div>
    </>
  );
};

export default Popusti;
