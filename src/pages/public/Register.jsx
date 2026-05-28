import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaApple,
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
    phoneNumber: "",
  });

  const [countryCode, setCountryCode] = useState("+90");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const countries = [
    { code: "+90", label: "tr", name: "Türkçe", flag: "https://flagcdn.com/w40/tr.png" },
    { code: "+966", label: "ar", name: "Arapça", flag: "https://flagcdn.com/w40/sa.png" },
    { code: "+1", label: "en", name: "İngilizce", flag: "https://flagcdn.com/w40/us.png" },
    { code: "+49", label: "de", name: "Almanca", flag: "https://flagcdn.com/w40/de.png" },
    { code: "+33", label: "fr", name: "Fransızca", flag: "https://flagcdn.com/w40/fr.png" },
    { code: "+34", label: "es", name: "İspanyolca", flag: "https://flagcdn.com/w40/es.png" },
    { code: "+39", label: "it", name: "İtalyanca", flag: "https://flagcdn.com/w40/it.png" },
    { code: "+7", label: "ru", name: "Rusça", flag: "https://flagcdn.com/w40/ru.png" },
    { code: "+86", label: "zh", name: "Çince", flag: "https://flagcdn.com/w40/cn.png" },
    { code: "+81", label: "ja", name: "Japonca", flag: "https://flagcdn.com/w40/jp.png" },
    { code: "+82", label: "ko", name: "Korece", flag: "https://flagcdn.com/w40/kr.png" },
    { code: "+351", label: "pt", name: "Portekizce", flag: "https://flagcdn.com/w40/pt.png" },
    { code: "+31", label: "nl", name: "Hollandaca", flag: "https://flagcdn.com/w40/nl.png" },
    { code: "+30", label: "el", name: "Yunanca", flag: "https://flagcdn.com/w40/gr.png" },
    { code: "+98", label: "fa", name: "Farsça", flag: "https://flagcdn.com/w40/ir.png" },
    { code: "+91", label: "hi", name: "Hintçe", flag: "https://flagcdn.com/w40/in.png" },
    { code: "+92", label: "ur", name: "Urduca", flag: "https://flagcdn.com/w40/pk.png" },
    { code: "+972", label: "he", name: "İbranice", flag: "https://flagcdn.com/w40/il.png" },
    { code: "+46", label: "sv", name: "İsveççe", flag: "https://flagcdn.com/w40/se.png" },
    { code: "+47", label: "no", name: "Norveççe", flag: "https://flagcdn.com/w40/no.png" },
    { code: "+45", label: "da", name: "Danca", flag: "https://flagcdn.com/w40/dk.png" },
    { code: "+358", label: "fi", name: "Fince", flag: "https://flagcdn.com/w40/fi.png" },
    { code: "+48", label: "pl", name: "Lehçe", flag: "https://flagcdn.com/w40/pl.png" },
    { code: "+36", label: "hu", name: "Macarca", flag: "https://flagcdn.com/w40/hu.png" },
    { code: "+40", label: "ro", name: "Romence", flag: "https://flagcdn.com/w40/ro.png" },
    { code: "+359", label: "bg", name: "Bulgarca", flag: "https://flagcdn.com/w40/bg.png" },
    { code: "+381", label: "sr", name: "Sırpça", flag: "https://flagcdn.com/w40/rs.png" },
    { code: "+385", label: "hr", name: "Hırvatça", flag: "https://flagcdn.com/w40/hr.png" },
    { code: "+387", label: "bs", name: "Boşnakça", flag: "https://flagcdn.com/w40/ba.png" },
    { code: "+355", label: "sq", name: "Arnavutça", flag: "https://flagcdn.com/w40/al.png" },
    { code: "+380", label: "uk", name: "Ukraynaca", flag: "https://flagcdn.com/w40/ua.png" },
    { code: "+995", label: "ka", name: "Gürcüce", flag: "https://flagcdn.com/w40/ge.png" },
    { code: "+374", label: "hy", name: "Ermenice", flag: "https://flagcdn.com/w40/am.png" },
    { code: "+66", label: "th", name: "Tayca", flag: "https://flagcdn.com/w40/th.png" },
    { code: "+84", label: "vi", name: "Vietnamca", flag: "https://flagcdn.com/w40/vn.png" },
    { code: "+60", label: "ms", name: "Malayca", flag: "https://flagcdn.com/w40/my.png" },
    { code: "+62", label: "id", name: "Endonezce", flag: "https://flagcdn.com/w40/id.png" },
    { code: "+254", label: "sw", name: "Svahili", flag: "https://flagcdn.com/w40/ke.png" },
    { code: "+27", label: "af", name: "Afrikanca", flag: "https://flagcdn.com/w40/za.png" },
    { code: "+251", label: "am", name: "Amharca", flag: "https://flagcdn.com/w40/et.png" },
    { code: "+994", label: "az", name: "Azerice", flag: "https://flagcdn.com/w40/az.png" },
    { code: "+7", label: "kk", name: "Kazakça", flag: "https://flagcdn.com/w40/kz.png" },
    { code: "+998", label: "uz", name: "Özbekçe", flag: "https://flagcdn.com/w40/uz.png" },
    { code: "+993", label: "tk", name: "Türkmence", flag: "https://flagcdn.com/w40/tm.png" },
    { code: "+93", label: "ps", name: "Peştuca", flag: "https://flagcdn.com/w40/af.png" },
    { code: "+880", label: "bn", name: "Bengalce", flag: "https://flagcdn.com/w40/bd.png" },
    { code: "+91", label: "ta", name: "Tamilce", flag: "https://flagcdn.com/w40/in.png" },
    { code: "+91", label: "te", name: "Teluguca", flag: "https://flagcdn.com/w40/in.png" },
  ];

  const selectedCountry =
    countries.find((c) => c.code === countryCode) || countries[0];

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.includes(searchTerm) ||
      c.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`;
    }
    if (phoneNumberLength < 9) {
      return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6)}`;
    }
    return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 8)} ${phoneNumber.slice(8, 10)}`;
  };

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

    if (id === "phoneNumber") {
      const formattedValue = formatPhoneNumber(value);
      setData({ ...data, [id]: formattedValue });
    } else {
      setData({ ...data, [id]: value });
    }
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
      // 1. Telefon numarasını temizle: Boşlukları ve rakam dışı her şeyi at (Uluslararası format için)
      let phonePart = data.phoneNumber.trim().replace(/\D/g, "");
      // Başındaki '0'ı at (örn: '0552' -> '552')
      if (phonePart.startsWith("0")) {
        phonePart = phonePart.substring(1);
      }
      const cleanedPhoneNumber = `${countryCode}${phonePart}`;
      
      const payload = {
        ...data,
        phoneNumber: cleanedPhoneNumber,
      };

      if (payload.gender) {
        payload.gender = Number(payload.gender);
      }

      const res = await registerUser(payload);
      if (res) { // Interceptor başarılıysa veriyi (veya true) döner
        setMessage("Kayıt başarılı! Sisteme giriş yapılıyor...");

        try {
          let responseData = res; // Eğer register endpoint'i token verdiyse, direkt kullan
          
          // Eğer token dönmemişse, loginUser ile zorla giriş yap
          if (!responseData?.accessToken && !responseData?.token) {
            responseData = await loginUser({
              email: data.email,
              password: data.password,
            });
          }

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
                incomingRole = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || decoded.Role;
                if (Array.isArray(incomingRole)) incomingRole = incomingRole[0];
              } catch (e) {
                console.error("Token decode hatası:", e);
              }
            }

            // Eğer backend bize hiçbir şekilde rol göndermezse, sistemi kilitlememek adına varsayılan olarak "User" (Normal Kişi) yapıyoruz.
            if (!incomingRole) {
              incomingRole = "User";
            }

            if (incomingToken) localStorage.setItem("token", incomingToken);
            if (incomingRefreshToken) localStorage.setItem("refreshToken", incomingRefreshToken);
            if (incomingRole) localStorage.setItem("role", incomingRole);

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
      console.error("--- KAYIT HATASI DETAYI ---");
      console.error("Durum Kodu:", err.response?.status);
      console.error("Hata Mesajı:", err.response?.data);
      console.error("---------------------------");

      let errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Kayıt işlemi sırasında bir sunucu hatası (500) oluştu. Lütfen backend konsolundaki logları kontrol edin.";

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
          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <div style={{ position: "relative", width: "110px" }}>
              {/* Dropdown Trigger */}
              <div
                className="modern-input"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  padding: "0 12px",
                  userSelect: "none",
                  backgroundColor: "white",
                  height: "45px",
                  opacity: 1, // Solukluğu gidermek için tam opaklık
                  border: "1px solid #e0e0e0", // Daha belirgin sınır
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <img
                    src={selectedCountry.flag}
                    alt={selectedCountry.label}
                    style={{
                      width: "22px",
                      height: "auto",
                      borderRadius: "2px",
                      opacity: 1,
                      filter: "brightness(1.05) contrast(1.05)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      color: "#333",
                    }}
                  >
                    {selectedCountry.label}
                  </span>
                </div>
                <span
                  style={{ fontSize: "10px", color: "#777", marginLeft: "4px" }}
                >
                  {isDropdownOpen ? "▲" : "▼"}
                </span>
              </div>

              {/* Dropdown Options */}
              {isDropdownOpen && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      top: "105%",
                      left: 0,
                      width: "220px",
                      backgroundColor: "white",
                      border: "1px solid #ddd",
                      borderRadius: "12px",
                      zIndex: 1000,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Search Input */}
                    <div
                      style={{ padding: "8px", borderBottom: "1px solid #eee" }}
                    >
                      <input
                        type="text"
                        placeholder="Dil veya kod ara..."
                        style={{
                          width: "100%",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1px solid #ddd",
                          fontSize: "12px",
                          outline: "none",
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()} // Engelle ki dropdown kapanmasın
                        autoFocus
                      />
                    </div>

                    <ul
                      style={{
                        listStyle: "none",
                        padding: "4px 0",
                        margin: 0,
                        maxHeight: "220px",
                        overflowY: "auto",
                      }}
                    >
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((c) => (
                          <li
                            key={c.code + c.label}
                            onClick={() => {
                              setCountryCode(c.code);
                              setIsDropdownOpen(false);
                              setSearchTerm("");
                            }}
                            style={{
                              padding: "10px 15px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              fontSize: "13px",
                              color: "#444",
                              transition: "background-color 0.2s",
                              backgroundColor:
                                countryCode === c.code
                                  ? "#f0f4ff"
                                  : "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#f5f7fa")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                countryCode === c.code
                                  ? "#f0f4ff"
                                  : "transparent")
                            }
                          >
                            <img
                              src={c.flag}
                              alt={c.label}
                              style={{
                                width: "20px",
                                borderRadius: "2px",
                                filter: "brightness(1.05) contrast(1.05)",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                              }}
                            />
                            <span
                              style={{
                                flex: 1,
                                fontWeight:
                                  countryCode === c.code ? "600" : "400",
                              }}
                            >
                              {c.name}
                            </span>
                            <span style={{ color: "#999", fontSize: "11px" }}>
                              {c.code}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li
                          style={{
                            padding: "15px",
                            textAlign: "center",
                            fontSize: "12px",
                            color: "#999",
                          }}
                        >
                          Sonuç bulunamadı
                        </li>
                      )}
                    </ul>
                  </div>
                  {/* Backdrop to close dropdown */}
                  <div
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setSearchTerm("");
                    }}
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 999,
                      background: "transparent",
                    }}
                  />
                </>
              )}
            </div>

            <input
              required
              className="modern-input"
              style={{ flex: 1 }}
              type="tel"
              placeholder="Telefon Numarası"
              id="phoneNumber"
              value={data.phoneNumber}
              onChange={handleInputChange}
            />
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
          <li
            className="icon google"
            onClick={() => window.location.href = "/api/auth/google"}
            title="Google ile kayıt ol"
          >
            <span className="tooltip">Google</span>
            <FaGoogle />
          </li>
          {/* Apple */}
          <li
            className="icon apple"
            onClick={() => window.location.href = "/api/auth/apple"}
            title="Apple ile kayıt ol"
          >
            <span className="tooltip">Apple</span>
            <FaApple style={{ fontSize: "22px", marginTop: "-2px" }} />
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
