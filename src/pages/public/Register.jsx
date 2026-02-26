import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaApple,
  FaTwitter,
} from "react-icons/fa";
import { registerUser } from "../../services/api";
import "../../css/login.css";

const Register = () => {
  const navigate = useNavigate();

  /* Form verileri */
  const [data, setData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Customer",
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
    if (!data.fullName || !data.email || !data.password) {
      setError("Her alanı doldurmak zorunludur.");
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

      const res = await registerUser(payload);
      if (res.data.success) {
        setMessage("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        setData({
          fullName: "",
          email: "",
          password: "",
          role: "Customer",
        });
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Kayıt işlemi sırasında bir hata oluştu.",
      );
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

          {/* Password Input */}
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

          {/* PhoneNumber Input with Country Code */}

          {/* Role Selection */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              margin: "15px 0 5px",
              color: "#555",
              fontSize: "14px",
              justifyContent: "center",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="role"
                value="Customer"
                checked={data.role === "Customer"}
                onChange={(e) => setData({ ...data, role: e.target.value })}
              />
              Müşteri Ol
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="role"
                value="Translator"
                checked={data.role === "Translator"}
                onChange={(e) => setData({ ...data, role: e.target.value })}
              />
              Çevirmen Ol
            </label>
          </div>

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
