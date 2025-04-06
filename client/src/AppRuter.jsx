import { BrowserRouter, Route, Routes } from "react-router";
import Pocetna from "./glavne-komponente/Pocetna";
import "./stilovi/App.css";
import ResetPassword from "./glavne-komponente/ResetPassword";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Pocetna />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
