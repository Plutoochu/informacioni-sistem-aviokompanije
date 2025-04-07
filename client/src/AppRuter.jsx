import { BrowserRouter, Route, Routes } from "react-router";
import Pocetna from "./glavne-komponente/Pocetna";
import AdminUserManagement from "./glavne-komponente/AdminUserManagement";
import "./stilovi/App.css";
import ResetPassword from "./glavne-komponente/ResetPassword";
import DestinacijeForma from "./glavne-komponente/DestinacijeForma";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Pocetna />} />
        <Route path="/" element={<Pocetna />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/destinacije" element={<DestinacijeForma />} />
        <Route path="/admin/korisnici" element={<AdminUserManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
