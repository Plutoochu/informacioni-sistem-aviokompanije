import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../stilovi/App.css";

const getBaseUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }
  return "https://informacioni-sistem-za-aviokompanije.onrender.com";
};

export default function ResetPassword() {
  const [novaLozinka, setNovaLozinka] = useState("");
  const [potvrdaLozinke, setPotvrdaLozinke] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Nevažeći link za resetovanje lozinke");
      return;
    }
    setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (novaLozinka !== potvrdaLozinke) {
      setError("Lozinke se ne podudaraju");
      return;
    }

    try {
      const response = await axios.post(`${getBaseUrl()}/api/korisnici/reset-password`, {
        token,
        novaLozinka,
      });

      if (response.data.message) {
        setMessage(response.data.message);
        setTimeout(() => {
          navigate("/prijava");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Došlo je do greške. Pokušajte ponovo.");
    }
  };

  if (!token) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-form">
          <h2>Greška</h2>
          <p className="error">{error}</p>
          <button onClick={() => navigate("/prijava")} className="auth-button">
            Vrati se na prijavu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-form">
        <h2>Resetujte lozinku</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="novaLozinka">Nova lozinka:</label>
            <input
              type="password"
              id="novaLozinka"
              value={novaLozinka}
              onChange={(e) => setNovaLozinka(e.target.value)}
              required
              placeholder="Unesite novu lozinku"
            />
          </div>

          <div className="form-group">
            <label htmlFor="potvrdaLozinke">Potvrdite lozinku:</label>
            <input
              type="password"
              id="potvrdaLozinke"
              value={potvrdaLozinke}
              onChange={(e) => setPotvrdaLozinke(e.target.value)}
              required
              placeholder="Potvrdite novu lozinku"
            />
          </div>

          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}

          <button type="submit" className="auth-button">
            Resetuj lozinku
          </button>
        </form>
      </div>
    </div>
  );
}
