import React from "react";
import { Outlet, useNavigate } from "react-router";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate("korisnici")}>Upravljanje korisnicima</button>
      <button onClick={() => navigate("avioni")}>Upravljanje destinacijama</button>
      <button onClick={() => navigate("destinacije")}>Upravljanje avionima</button>
      <Outlet />
    </div>
  );
};

export default AdminDashboard;
