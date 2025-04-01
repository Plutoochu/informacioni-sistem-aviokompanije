import { BrowserRouter, Route, Routes } from "react-router";
import Pocetna from "./glavne-komponente/Pocetna";
import "./stilovi/App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Pocetna />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
