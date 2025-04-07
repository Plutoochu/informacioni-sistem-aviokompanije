import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://your-backend-url.com/api/reset-password", {
        token,
        newPassword: password,
      });
      setMessage("Lozinka je uspješno promijenjena!");
    } catch (err) {
      setMessage("Došlo je do greške. Pokušajte ponovo.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 0 25px rgba(0, 0, 0, 0.2)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "24px",
            textAlign: "center",
            color: "#1a1a1a",
          }}
        >
          Resetujte lozinku
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
          <label
            htmlFor="password"
            style={{ marginBottom: "8px", fontWeight: "500", color: "#333" }}
          >
            Nova lozinka:
          </label>
          <input
            id="password"
            type="password"
            placeholder="Unesite novu lozinku"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              marginBottom: "20px",
              fontSize: "16px",
            }}
          />

          <button
            type="submit"
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Resetuj
          </button>

          {message && (
          <p
          style={{
            marginTop: "16px",
            textAlign: "center",
            color: message.includes("greške") ? "#e63946" : "#1a7f37", 
            fontWeight: "500",
          }}
        >
          {message}
        </p>
          )}
        </form>
      </div>
    </div>
  );
}
