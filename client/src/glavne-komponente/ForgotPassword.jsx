import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../stilovi/App.css";

const getBaseUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }
  return "https://informacioni-sistem-za-aviokompanije.onrender.com";
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetInfo, setResetInfo] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetInfo(null);

    try {
      const response = await axios.post(`${getBaseUrl()}/api/reset-password`, {
        email,
      });

      setResetInfo({
        token: response.data.token,
        resetLink: response.data.resetLink,
      });

      setMessage("Token za resetovanje je generisan. Koristite link ispod za resetovanje lozinke:");
    } catch (err) {
      setError(err.response?.data?.message || "Došlo je do greške. Pokušajte ponovo.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Zaboravljena lozinka</h2>
        <p className="text-gray-600">Unesite vašu email adresu da generišemo link za resetovanje lozinke.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email adresa</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Unesite vaš email"
            />
          </div>

          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}

          {resetInfo && (
            <div className="reset-info">
              <p>Token: {resetInfo.token}</p>
              <p>
                Link za resetovanje: <a href={resetInfo.resetLink}>{resetInfo.resetLink}</a>
              </p>
            </div>
          )}

          <button type="submit" className="auth-button">
            Generiši link
          </button>

          <div className="link-container">
            <span>Vratite se na </span>
            <span className="link" onClick={() => navigate("/prijava")}>
              prijavu
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
