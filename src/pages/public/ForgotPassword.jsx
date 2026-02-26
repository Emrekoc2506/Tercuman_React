import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/api";
import "../../css/login.css";

const ForgotPassword = () => {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (event) => {
    setEmail(event.target.value);
    if (error) setError("");
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Lütfen e-posta adresinizi girin.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await forgotPassword({ email });
      if (res.data.success) {
        setMessage("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
        setEmail("");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Bir hata oluştu. Lütfen tekrar deneyin.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="auth-container">
        <div className="heading" style={{ fontSize: "28px" }}>
          Şifremi Unuttum
        </div>

        <form className="form" onSubmit={handleFormSubmit}>
          {/* E-posta Input */}
          <input
            className="input"
            type="email"
            placeholder="E-posta Adresiniz"
            id="email"
            value={email}
            onChange={handleInputChange}
            required
          />

          {/* Buton */}
          <button
            className="login-button"
            type="submit"
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? "Gönderiliyor..." : "Bağlantı Gönder"}
          </button>

          {/* Mesaj Alanları */}
          {message && (
            <div
              style={{
                color: "#28a745",
                fontSize: "13px",
                textAlign: "center",
                marginTop: "10px",
                fontWeight: "500",
              }}
            >
              {message}
            </div>
          )}

          {error && (
            <div
              style={{
                color: "#ff4d4d",
                fontSize: "13px",
                textAlign: "center",
                marginTop: "10px",
                fontWeight: "500",
              }}
            >
              {error}
            </div>
          )}
        </form>

        {/* Geri Dön Linki */}
        <div className="agreement" style={{ marginTop: "30px" }}>
          <Link to="/login" style={{ fontSize: "12px" }}>
            ← Giriş Ekranına Dön
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
