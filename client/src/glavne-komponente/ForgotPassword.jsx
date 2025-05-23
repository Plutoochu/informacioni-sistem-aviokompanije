import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../kontekst/LanguageContext";

const getBaseUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }
  return "https://informacioni-sistem-za-aviokompanije.onrender.com";
};

const ForgotPassword = () => {
  const { t } = useLanguage();
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

      setMessage(t('auth.tokenGenerated'));
    } catch (err) {
      setError(err.response?.data?.message || t('auth.resetError'));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{t('auth.forgotPasswordTitle')}</h2>
        <p className="text-gray-600">{t('auth.forgotPasswordDescription')}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t('auth.emailAddress')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t('auth.enterYourEmail')}
            />
          </div>

          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}

          {resetInfo && (
            <div className="reset-info">
              <p>{t('auth.token')}: {resetInfo.token}</p>
              <p>
                {t('auth.resetLink')}: <a href={resetInfo.resetLink}>{resetInfo.resetLink}</a>
              </p>
            </div>
          )}

          <button type="submit" className="auth-button">
            {t('auth.generateLink')}
          </button>

          <div className="link-container">
            <span>{t('auth.returnTo')} </span>
            <span className="link" onClick={() => navigate("/prijava")}>
              {t('auth.login')}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
