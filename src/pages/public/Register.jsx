import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaApple,
  FaTwitter,
} from "react-icons/fa";
import { registerUser, loginUser } from "../../services/api";
import "../../css/login.css";

const Register = () => {
  const navigate = useNavigate();

  /* Form verileri */
  const [data, setData] = useState({
    fullName: "",
    email: "",
    password: "",
    gender: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Email öneri sistemi için state
  const emailDomains = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com"];
  const [emailSuggestions, setEmailSuggestions] = useState([]);

  const handleInputChange = (event) => {
    const { id, value } = event.target;

    // Email öneri mantığı
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
    // Kullanıcı yazarken hataları temizle
    if (error) setError("");
  };

  const handleEmailSuggestionClick = (suggestedEmail) => {
    setData({ ...data, email: suggestedEmail });
    setEmailSuggestions([]);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    // 1. Koşul: Boş alan kontrolü
    if (!data.fullName || !data.email || !data.password || !data.gender) {
      setError("Tüm alanları ve cinsiyeti doldurmak zorunludur.");
      return;
    }

    // 2. Koşul: Geçerli e-posta formatı
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      setError("Geçersiz e-posta formatı.");
      return;
    }

    // 3. Koşul: Şifre uzunluğu ve karmaşıklığı
    if (data.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setIsLoading(true);

    try {
      // API'ye gönderilecek veriyi hazırla
      const payload = { ...data };
      if (payload.gender) {
        payload.gender = Number(payload.gender);
      }

      const res = await registerUser(payload);
      if (res.data.success) {
        setMessage("Kayıt başarılı! Sisteme giriş yapılıyor...");

        try {
          // Otomatik giriş işlemini başlat
          const loginRes = await loginUser({
            email: data.email,
            password: data.password,
          });

          if (
            loginRes.data.success ||
            loginRes.data.token ||
            loginRes.data.accessToken
          ) {
            const responseData = loginRes.data.data || loginRes.data;
            const incomingToken =
              responseData.accessToken || responseData.token;
            const incomingRefreshToken = responseData.refreshToken;
            let incomingRole = responseData.role;

            // Rol çözme işlemi (eğer yanıt içinde açıkça yoksa token içerisinden bul)
            if (!incomingRole && incomingToken) {
              try {
                const base64Url = incomingToken.split(".")[1];
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split("")
                    .map(function (c) {
                      return (
                        "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                      );
                    })
                    .join(""),
                );
                const decoded = JSON.parse(jsonPayload);
                if (decoded) {
                  incomingRole =
                    decoded[
                      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                    ] ||
                    decoded.role ||
                    decoded.Role;
                  if (Array.isArray(incomingRole)) {
                    incomingRole = incomingRole[0];
                  }
                }
              } catch (e) {
                console.error("Token decode hatası:", e);
              }
            }

            // localStorage'a verileri yaz
            if (incomingToken) localStorage.setItem("token", incomingToken);
            if (incomingRefreshToken)
              localStorage.setItem("refreshToken", incomingRefreshToken);
            if (incomingRole) localStorage.setItem("role", incomingRole);

            // Navigasyon barın ve sistemin bu değişimi tam algılaması için window.location.href ile ana sayfaya yönlendir
            window.location.href = "/";
            return;
          } else {
            throw new Error("Giriş bilgileri alınamadı.");
          }
        } catch (loginErr) {
          console.error("Otomatik giriş hatası:", loginErr);
          setMessage(
            "Kayıt başarılı ancak otomatik giriş yapılamadı. Giriş sayfasına yönlendiriliyorsunuz...",
          );
          setTimeout(() => navigate("/login"), 2000);
        }
      }
    } catch (err) {
      console.error(err);
      let errorMessage =
        err.response?.data?.message ||
        "Kayıt işlemi sırasında bir hata oluştu.";

      // Backend'den gelen spesifik İngilizce hatayı yakalayıp Türkçe'ye çeviriyoruz
      if (
        typeof errorMessage === "string" &&
        (errorMessage.includes("Email already exists") ||
          errorMessage.includes("already registered"))
      ) {
        errorMessage =
          "Bu e-posta adresi zaten sistemde kayıtlı. Lütfen farklı bir adres deneyin veya giriş yapın.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper auth-bg-gradient">
      <div
        className="auth-container glass-panel"
        style={{ border: "none", zIndex: 1 }}
      >
        <h2
          className="heading"
          style={{ textAlign: "center", marginBottom: "20px" }}
        >
          Kayıt Olun
        </h2>

        <form className="form" onSubmit={handleFormSubmit}>
          {/* FullName Input */}
          <input
            required
            className="modern-input"
            type="text"
            placeholder="Ad Soyad"
            id="fullName"
            value={data.fullName}
            onChange={handleInputChange}
            autoComplete="name"
          />

          {/* Email Input */}
          <div style={{ position: "relative", width: "100%" }}>
            <input
              required
              className="modern-input"
              type="text"
              placeholder="Email"
              id="email"
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

          <div className="password-wrapper">
            <input
              required
              className="modern-input"
              type={showPassword ? "text" : "password"}
              placeholder="Şifre"
              id="password"
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

          {/* Gender (Cinsiyet) Seçimi */}
          <div style={{ marginTop: "10px" }}>
            <select
              required
              className="modern-input"
              id="gender"
              value={data.gender}
              onChange={handleInputChange}
              style={{
                color: data.gender ? "#333" : "#777",
              }}
            >
              <option value="" disabled>
                Cinsiyetinizi Seçin
              </option>
              <option value="1">Erkek</option>
              <option value="2">Kadın</option>
            </select>
          </div>

          {/* PhoneNumber Input with Country Code */}

          {/* Register Button */}
          <button
            className="btn-modern"
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              marginTop: "15px",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "İşleniyor..." : "Kaydol"}
          </button>

          {/* Mesaj Alanları */}
          {message && (
            <div
              style={{
                color: "#28a745",
                fontSize: "13px",
                textAlign: "center",
                marginTop: "5px",
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
                marginTop: "5px",
                fontWeight: "500",
              }}
            >
              {error}
            </div>
          )}
        </form>

        {/* --- YENİ EKLENEN SOSYAL MEDYA BUTONLARI --- */}
        <div className="social-divider">Veya şununla kaydolun:</div>

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

        {/* Login Link */}
        <div
          className="agreement"
          style={{ marginTop: "20px", fontSize: "12px", color: "#555" }}
        >
          Hesabınız var mı?{" "}
          <Link to="/login" style={{ fontWeight: "bold" }}>
            Giriş Yapın
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
