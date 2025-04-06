import React, { useEffect, useState } from "react";
import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";
import { provjeraAplikacije } from "../pomocne-funkcije/fetch-funkcije";
import { Dugme } from "../reusable-komponente/Dugme";

const Pocetna = () => {
  const [count, setCount] = useState(0);
  const [okCount, setOkCount] = useState(0);
  const [poruka, setPoruka] = useState(null);

  useEffect(() => {
    provjeraHandler();
  }, []);

  const provjeraHandler = () => {
    provjeraAplikacije()
      .then((res) => {
        if (res) {
          setPoruka(res);
          setOkCount((prevState) => prevState + 1);
        } else setPoruka("Nesto se pokvarilo :(");
      })
      .catch((err) => {
        console.log(err);
        setPoruka("Nesto se pokvarilo :(");
      });
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <Dugme text="Klik za provjeru!" onClick={provjeraHandler} />
      {poruka !== null && (
        <p>
          {poruka} {okCount > 1 && `x${okCount}`}
        </p>
      )}
    </>
  );
};

export default Pocetna;
