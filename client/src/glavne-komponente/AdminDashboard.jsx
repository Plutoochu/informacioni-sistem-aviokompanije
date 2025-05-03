import React from "react";
import { useNavigate, Outlet } from "react-router";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="pocetna-container">
      <div className="pocetna-card">
        <h2>Dobrodošli, Admin!</h2>
        <p>Izaberite opciju za upravljanje sistemom</p>
        <div className="pocetna-opcije">
          <div className="pocetna-opcija" onClick={() => navigate("/korisnici")} style={{ cursor: "pointer" }}>
            <div className="pocetna-opcija-kartica">
              <h3>Korisnici</h3>
              <p>Upravljanje korisničkim nalozima</p>
            </div>
          </div>

          <div
            className="pocetna-opcija"
            onClick={() => navigate("/upravljanje-avionima")}
            style={{ cursor: "pointer" }}
          >
            <div className="pocetna-opcija-kartica">
              <h3>Avioni</h3>
              <p>Dodavanje i uređivanje aviona</p>
            </div>
          </div>

          <div className="pocetna-opcija" onClick={() => navigate("/destinacije")} style={{ cursor: "pointer" }}>
            <div className="pocetna-opcija-kartica">
              <h3>Destinacije</h3>
              <p>Dodavanje i uređivanje destinacija</p>
            </div>
          </div>

          <div className="pocetna-opcija" onClick={() => navigate("/raspored-letova")} style={{ cursor: "pointer" }}>
            <div className="pocetna-opcija-kartica">
              <h3>Letovi</h3>
              <p>Dodavanje i uređivanje letova</p>
            </div>
          </div>
        </div>
      </div>

      <Outlet />
    </div>
  );
};

export default AdminDashboard;
