"use client";

import { useState, useEffect } from "react";
import {
  dobijSveKorisnike,
  promovisiNaAdmina,
  demovisiToKorisnika,
  obrisiKorisnika,
  dodajKorisnika,
} from "../pomocne-funkcije/fetch-funkcije";
import "../stilovi/AdminUserManagement.css";
import DodajKorisnikaModal from "./DodajKorisnikaModal";

const UpravljanjeKorisnicima = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOtvoren, setModalOtvoren] = useState(false);

  useEffect(() => {
    dobijKorisnike();
  }, []);

  const dobijKorisnike = async () => {
    try {
      setLoading(true);
      const data = await dobijSveKorisnike();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError("Failed to load users. Please try again.");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const dodajNovogKorisnika = async (noviKorisnik) => {
    try {
      const dodani = await dodajKorisnika(noviKorisnik);
      setUsers((prev) => [...prev, dodani]);
    } catch (err) {
      console.error("Dodavanje korisnika nije uspjelo:", err);
      throw err;
    }
  };

  const upravljajPromocijomKorisnika = async (userId) => {
    if (actionInProgress) return;
    try {
      setActionInProgress(true);
      await promovisiNaAdmina(userId);
      setUsers(users.map((user) => (user._id === userId ? { ...user, role: "admin" } : user)));
    } catch (err) {
      setError("Failed to promote user.");
      console.error("Error promoting user:", err);
    } finally {
      setActionInProgress(false);
    }
  };

  const upravljajDemocijomKorisnika = async (userId) => {
    if (actionInProgress) return;
    try {
      setActionInProgress(true);
      await demovisiToKorisnika(userId);
      setUsers(users.map((user) => (user._id === userId ? { ...user, role: "kupac" } : user)));
    } catch (err) {
      setError("Failed to demote user.");
      console.error("Error demoting admin:", err);
    } finally {
      setActionInProgress(false);
    }
  };

  const upravaljajBrisanjemKorisnika = async (userId) => {
    if (actionInProgress) return;
    const potvrda = confirm("Are you sure you want to delete this user?");
    if (!potvrda) return;

    try {
      setActionInProgress(true);
      await obrisiKorisnika(userId);
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      setError("Failed to delete user.");
      console.error("Error deleting user:", err);
    } finally {
      setActionInProgress(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-user-management">
        <h1>User Management</h1>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-management">
      <h1>User Management</h1>

      {error && <div className="error-message">{error}</div>}

      <button onClick={() => setModalOtvoren(true)} className="promote-btn add-user-btn">
        Dodaj korisnika
      </button>

      <DodajKorisnikaModal
        otvoren={modalOtvoren}
        onZatvori={() => setModalOtvoren(false)}
        onDodajKorisnika={dodajNovogKorisnika}
      />

      <div className="controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button onClick={dobijKorisnike} className="refresh-btn">
          <svg
            className="refresh-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
          Refresh
        </button>
      </div>

      <div className="user-list">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th className="hide-mobile">Phone</th>
              <th className="hide-mobile">Points</th>
              <th className="hide-mobile">Bookings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name || "N/A"}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                  </td>
                  <td className="hide-mobile">{user.phoneNumber || "N/A"}</td>
                  <td className="hide-mobile">{user.loyaltyPoints || 0}</td>
                  <td className="hide-mobile">
                    {user.bookingHistory?.length > 0 ? (
                      <span className="booking-badge">{user.bookingHistory.length} bookings</span>
                    ) : (
                      "None"
                    )}
                  </td>
                  <td>
                    {user.role === "kupac" ? (
                      <button
                        onClick={() => upravljajPromocijomKorisnika(user._id)}
                        disabled={actionInProgress}
                        className="promote-btn"
                      >
                        Promote
                      </button>
                    ) : user.role === "admin" ? (
                      <button
                        onClick={() => upravljajDemocijomKorisnika(user._id)}
                        disabled={actionInProgress}
                        className="demote-btn"
                      >
                        Demote
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => upravaljajBrisanjemKorisnika(user._id)}
                      disabled={actionInProgress}
                      className="demote-btn delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-users">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UpravljanjeKorisnicima;
