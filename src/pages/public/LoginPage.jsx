import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaApple,
  FaTwitter,
} from "react-icons/fa";
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
    try {
      const res = await loginUser(data);
      console.log("LOGIN API YANITI:", res.data); // Hata Tespiti İçin Eklendi

      if (res.data.success) {
        // Backend'in DTO yapısına göre data.data
        const responseData = res.data.data || res.data;

        // DİKKAT: Backend'den "accessToken" olarak dönüyor. Bu yüzden accessToken arıyoruz.
        const incomingToken = responseData.accessToken || responseData.token;

        // DİKKAT: Backend C# tarafında eklenmiş olan yeni "refreshToken" alanını da okuyoruz (7 gün geçerli uzun süreli token)
        const incomingRefreshToken = responseData.refreshToken;

        let incomingRole = responseData.role;

        // EĞER ROL JSON'DA YOKSA (undefined ise) AMA TOKEN VARSA TOKEN'I ÇÖZ
        if (!incomingRole && incomingToken) {
          const decoded = decodeJwt(incomingToken);
          console.log("ÇÖZÜMLENMİŞ TOKEN İÇERİĞİ:", decoded);
          if (decoded) {
            // ASP.NET Core varsayılan Claim tipleri veya normal role prop'u
            incomingRole =
              decoded[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
              ] ||
              decoded.role ||
              decoded.Role;

            // Eğer liste olarak gelirse string'e çevir
            if (Array.isArray(incomingRole)) {
              incomingRole = incomingRole[0];
            }
          }
        }

        console.log("ÇIKARILAN ROL BİLGİSİ:", incomingRole);

        // -- 1. ACCESS TOKEN (Kısa süreli - İstek yapmak için kullanılır) tarayıcıya kaydediliyor --
        if (incomingToken) localStorage.setItem("token", incomingToken);

        // -- 2. REFRESH TOKEN (Uzun süreli - Arka planda Access Token'ı yenilemek için kullanılır) kaydediliyor --
        if (incomingRefreshToken)
          localStorage.setItem("refreshToken", incomingRefreshToken);

        // -- 3. Kullanıcı Rolü kaydediliyor --
        if (incomingRole) localStorage.setItem("role", incomingRole);

        // -- Tüm veriler başarılıysa anasayfaya (veya ilgili panele) yönlendir --
        navigate("/");
      } else {
        setError(res.data.message || "Giriş başarısız oldu.");
      }
    } catch (err) {
      console.error("Giriş hatası:", err);
      // Eğer server 500 dönüyorsa veya message yoksa
      setError(err.response?.data?.message || "Giriş başarısız oldu.");
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
          <li className="icon google">
            <span className="tooltip">Google</span>
            <FaGoogle />
          </li>
          {/* Apple */}
          <li className="icon apple">
            <span className="tooltip">Apple</span>
            <FaApple style={{ fontSize: "22px", marginTop: "-2px" }} />
          </li>
          {/* Twitter */}
          <li className="icon twitter">
            <span className="tooltip">Twitter</span>
            <FaTwitter />
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
