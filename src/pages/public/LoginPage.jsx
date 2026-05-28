import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGoogle, FaApple } from "react-icons/fa";
import { loginUser } from "../../services/api";
import "../../css/login.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const emailDomains = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com"];
  const [emailSuggestions, setEmailSuggestions] = useState([]);

  const handleInputChange = (event) => {
    const { id, value } = event.target;

    if (id === "email") {
      const [localPart, domainPart] = value.split("@");
      if (value.includes("@")) {
        if (!domainPart) {
          setEmailSuggestions(
            emailDomains.map((domain) => `${localPart}@${domain}`),
          );
        } else {
          const filtered = emailDomains
            .filter((domain) => domain.startsWith(domainPart))
            .map((domain) => `${localPart}@${domain}`);
          setEmailSuggestions(filtered);
        }
      } else {
        setEmailSuggestions([]);
      }
    }
    setData({ ...data, [id]: value });
    setError("");
  };

  // Email önerisine tıklayınca çalışacak fonksiyon
  const handleEmailSuggestionClick = (suggestedEmail) => {
    setData({ ...data, email: suggestedEmail });
    setEmailSuggestions([]);
  };

  // JWT Token Decode fonksiyonu
  const decodeJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Token decode edilemedi:", e);
      return null;
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!data.email || !data.password) {
      setError("E-posta ve şifre boş olamaz.");
      return;
    }

    // 🔥 ADMIN BYPASS (Backend'de kullanıcı olmasa bile giriş yapabilmek için)
    if (data.email === "admin@gmail.com" && data.password === "1Qaz2wsx3.") {
      localStorage.setItem("token", "mock-admin-token-12345");
      localStorage.setItem("refreshToken", "mock-refresh-token-12345");
      localStorage.setItem("role", "Admin");
      window.location.href = "/admin";
      return;
    }

    try {
      const responseData = await loginUser(data);
      // Interceptor veriyi otomatik açtı (responseData = { accessToken, refreshToken, ... })

      if (responseData?.accessToken || responseData?.token) {
        const incomingToken = responseData.accessToken || responseData.token;
        const incomingRefreshToken = responseData.refreshToken;

        // Rol çözme işlemi
        let incomingRole = responseData.role;
        if (!incomingRole && incomingToken) {
          try {
            const base64Url = incomingToken.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const decoded = JSON.parse(atob(base64));
            incomingRole =
              decoded[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
              ] ||
              decoded.role ||
              decoded.Role;
            if (Array.isArray(incomingRole)) incomingRole = incomingRole[0];
          } catch (e) {
            console.error("Token decode hatası:", e);
          }
        }

        // Eğer backend bize hiçbir şekilde rol göndermezse, sistemi kilitlememek adına varsayılan olarak "User" (Normal Kişi) yapıyoruz.
        if (!incomingRole) {
          incomingRole = "User";
        }

        // admin@gmail.com ise her zaman Admin yap
        if (data.email === "admin@gmail.com") {
          incomingRole = "Admin";
        }

        if (incomingToken) localStorage.setItem("token", incomingToken);
        if (incomingRefreshToken)
          localStorage.setItem("refreshToken", incomingRefreshToken);
        if (incomingRole) localStorage.setItem("role", incomingRole);

        // Navigasyon barın güncellenmesi için tam sayfa yenileme önerilir veya navigate
        window.location.href = "/";
      } else {
        setError("Giriş bilgileri doğrulanamadı.");
      }
    } catch (err) {
      console.error("Giriş hatası:", err);
      setError(
        err.response?.data?.Message || err.message || "Giriş başarısız oldu.",
      );
    }
  };

  return (
    <div className="login-page-wrapper auth-bg-gradient">
      <div className="auth-container glass-panel" style={{ border: "none" }}>
        <h2
          className="heading"
          style={{ textAlign: "center", marginBottom: "20px" }}
        >
          Giriş Yapın
        </h2>

        <form className="form" onSubmit={handleFormSubmit}>
          {/* E-mail Input */}
          <div style={{ position: "relative", width: "100%" }}>
            <input
              required
              className="modern-input"
              type="text"
              name="email"
              id="email"
              placeholder="E-mail"
              value={data.email}
              onChange={handleInputChange}
              autoComplete="off"
            />
            {/* Email Önerileri Listesi */}
            {emailSuggestions.length > 0 && (
              <ul
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "15px",
                  right: "15px",
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  borderBottomLeftRadius: "15px",
                  borderBottomRightRadius: "15px",
                  listStyle: "none",
                  padding: "0",
                  margin: "0",
                  zIndex: 100,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                {emailSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleEmailSuggestionClick(suggestion)}
                    style={{
                      padding: "10px 15px",
                      cursor: "pointer",
                      fontSize: "13px",
                      color: "#555",
                      borderBottom:
                        index !== emailSuggestions.length - 1
                          ? "1px solid #eee"
                          : "none",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#f0f2f5")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "white")
                    }
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Şifre Input + İkon */}
          <div className="password-wrapper">
            <input
              required
              className="modern-input"
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              placeholder="Şifre"
              value={data.password}
              onChange={handleInputChange}
            />
            <span
              className="password-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Şifremi Unuttum */}
          <div className="forgot-password">
            <Link to="/forgot-password">Parolanızı mı unuttunuz ?</Link>
          </div>

          {/* Giriş Butonu */}
          <button
            className="btn-modern"
            type="submit"
            style={{ width: "100%", marginTop: "15px" }}
          >
            Giriş Yapın
          </button>

          {error && (
            <div
              style={{
                color: "#ff4d4d",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}
        </form>

        {/* --- Sosyal Medya Butonları (YENİ TASARIM) --- */}
        <div className="social-divider">Veya şununla oturum açın</div>

        <ul className="wrapper">
          {/* Google */}
          <li
            className="icon google"
            onClick={() => (window.location.href = "/api/auth/google")}
            title="Google ile giriş yap"
          >
            <span className="tooltip">Google</span>
            <FaGoogle />
          </li>
          {/* Apple */}
          <li
            className="icon apple"
            onClick={() => (window.location.href = "/api/auth/apple")}
            title="Apple ile giriş yap"
          >
            <span className="tooltip">Apple</span>
            <FaApple style={{ fontSize: "22px", marginTop: "-2px" }} />
          </li>
        </ul>

        {/* Alt Link - Güncellendi */}
        <div
          className="agreement"
          style={{ marginTop: "15px", fontSize: "12px", color: "#555" }}
        >
          Hesabınız yok mu?{" "}
          <Link to="/register" style={{ fontWeight: "bold" }}>
            Kayıt Olun
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
