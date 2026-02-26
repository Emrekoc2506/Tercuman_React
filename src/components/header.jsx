import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Sayfa geçişleri için Link, yönlendirme için useNavigate
import logo from "../logo/Logo.png";

// Eklediğimiz API servisleri (Bildirim Dataları için)
import {
  getTranslatorNotifications,
  markNotificationAsRead,
} from "../services/api";

function Header() {
  const navigate = useNavigate();

  // Kullanıcının giriş yapıp yapmadığını kontrol ediyoruz.
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // ==========================================
  // BİLDİRİM İŞLEMLERİ STATE & FONKSİYONLAR
  // ==========================================
  const [notifications, setNotifications] = useState([]); // Gelen bildirimleri tutar
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Çana tıklanınca menüyü açıp kapatma

  // Eğer giriş yapan "Translator" ise sayfa açıldığında bildirimlerini getir
  useEffect(() => {
    // case-insensitive kontrol
    const roleLower = userRole ? userRole.trim().toLowerCase() : "";
    if (roleLower === "translator" && token) {
      fetchNotifications();
    }
  }, [userRole, token]);

  const fetchNotifications = async () => {
    try {
      const res = await getTranslatorNotifications();
      if (res.data.success) {
        setNotifications(res.data.data || []);
      }
    } catch (error) {
      console.error("Bildirimler alınamadı:", error);
    }
  };

  // Bir bildirime tıklandığında (veya okundu butonuna basıldığında)
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      // Başarılı olursa listeyi frontend tarafında da 'isRead: true' olarak güncelle
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Bildirim okundu işaretlenemedi:", error);
    }
  };

  // Bildirim menusunu aç/kapat
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Okunmamış bildirim adedi
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ==========================================
  // KULLANICI İŞLEMLERİ (Çıkış Yap, Yönlendir)
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login"); // Çıkış yapınca giriş sayfasına at
    window.location.reload(); // Header'ın güncellenmesi için sayfayı yenile (Basit çözüm)
  };

  // Kullanıcı rolüne göre panel adresi belirleme
  const getDashboardPath = () => {
    // NOT: Localstorage'dan dönen string'i normalize edelim
    // (Örn: "Customer ", "admin", "Translator")
    const role = userRole ? userRole.trim().toLowerCase() : "";

    if (role === "admin") return "/admin/dashboard";
    if (role === "translator") return "/translator/dashboard";
    if (role === "customer" || role === "user") return "/customer/dashboard";

    // Geçersiz veya bilinmeyen rol ise:
    return "/";
  };

  // UI Renderleri için role belirleme
  const roleForUI = userRole ? userRole.trim().toLowerCase() : "";

  return (
    <header className="main-header" style={{ position: "relative" }}>
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* SOL: LOGO KISMI */}
        <div className="logo">
          <Link to="/">
            MiftahTEA
            <span>
              <img src={logo} alt="Logo" width="40" height="40" />
            </span>
          </Link>
        </div>

        {/* ORTA: MENÜ KISMI */}
        <nav className="nav-menu">
          <ul>
            <li>
              <Link to="/">Anasayfa</Link>
            </li>
            <li className="nav-item has-dropdown">
              <Link to="#">
                UZMANLIK ALANLARI <span className="arrow-down">▾</span>
              </Link>
              <ul className="dropdown-menu">
                <li>
                  <Link to="#">İngilizce</Link>
                </li>
                <li>
                  <Link to="#">Almanca</Link>
                </li>
                <li>
                  <Link to="#">Fransızca</Link>
                </li>
                <li>
                  <Link to="#">İspanyolca</Link>
                </li>
                <li>
                  <Link to="#">İtalyanca</Link>
                </li>
              </ul>
            </li>
            <li>
              <Link to="/contact">İletişim</Link>
            </li>
          </ul>
        </nav>

        {/* SAĞ: BUTONLAR & BİLDİRİM */}
        <div
          className="header-action"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          {/* SADECE TERCÜMANLAR İÇİN BİLDİRİM ÇANI */}
          {roleForUI === "translator" && token && (
            <div style={{ position: "relative", marginRight: "10px" }}>
              <button
                onClick={toggleDropdown}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                🔔
                {/* Okunmamış Bildirim Sayısı Balonu */}
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      background: "red",
                      color: "white",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* BİLDİRİM LİSTESİ PENCERESİ (DROPDOWN) */}
              {isDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: "0",
                    width: "300px",
                    maxHeight: "400px",
                    overflowY: "auto",
                    background: "white",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                    zIndex: 1000,
                    padding: "10px",
                    border: "1px solid #ddd",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "16px",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "5px",
                    }}
                  >
                    Bildirimler
                  </h4>

                  {notifications.length === 0 ? (
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#777",
                        textAlign: "center",
                      }}
                    >
                      Hiç bildiriminiz yok.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: "10px",
                            borderRadius: "6px",
                            background: n.isRead ? "#f8f9fa" : "#e6f7ff", // Okunanlar gri, okunmayanlar açık mavi
                            borderLeft: n.isRead
                              ? "3px solid #ccc"
                              : "3px solid #007bff",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            fontSize: "13px",
                          }}
                        >
                          <div>
                            <strong
                              style={{
                                display: "block",
                                marginBottom: "3px",
                                color: n.isRead ? "#555" : "#000",
                              }}
                            >
                              {n.title || "Yeni Bildirim"}
                            </strong>
                            <span style={{ color: "#666" }}>{n.message}</span>
                            <span
                              style={{
                                display: "block",
                                fontSize: "10px",
                                color: "#aaa",
                                marginTop: "5px",
                              }}
                            >
                              {new Date(n.createdAt).toLocaleString("tr-TR")}
                            </span>
                          </div>

                          {/* Okundu İşaretleme Butonu */}
                          {!n.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(n.id)}
                              title="Okundu İşaretle"
                              style={{
                                background: "none",
                                border: "none",
                                color: "#28a745",
                                cursor: "pointer",
                                fontSize: "16px",
                              }}
                            >
                              ✔
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------- */}
          {/* GİRİŞ - ÇIKIŞ - PANEL BUTONLARI         */}
          {/* ------------------------------------- */}
          {!token ? (
            // Giriş YAPMAMIŞ kullanıcılar için:
            <>
              <Link
                to="/register"
                className="btn-modern"
                style={{ fontSize: "0.85rem", padding: "8px 16px" }}
              >
                KAYIT OL
              </Link>
              <Link
                to="/login"
                className="btn-modern"
                style={{
                  fontSize: "0.85rem",
                  padding: "8px 16px",
                  background: "transparent",
                  color: "var(--primary-color)",
                  border: "2px solid var(--primary-color)",
                }}
              >
                GİRİŞ YAP
              </Link>
            </>
          ) : (
            // Giriş YAPMIŞ kullanıcılar için:
            <>
              {roleForUI === "translator" && (
                <button
                  onClick={() => navigate("/translator/ad-create")}
                  className="btn-modern"
                  style={{
                    fontSize: "0.85rem",
                    padding: "8px 16px",
                    background: "linear-gradient(135deg, #17a2b8, #138496)", // Info Blue color
                    marginRight: "5px",
                  }}
                >
                  İlan Yükle
                </button>
              )}
              <button
                onClick={() => {
                  const path = getDashboardPath();
                  console.log("Aktif Kullanıcı Rolü (Tarayıcı):", userRole); // Debug
                  console.log("Panel Yönlendirme Rotası:", path); // Debug

                  if (path !== "/") {
                    navigate(path);
                  } else {
                    alert(
                      `Panel Yönlendirme Hatası!\nHesabınızla (${userRole}) eşleşen geçerli bir panel (Admin/Customer/Translator) bulunamadı.`,
                    );
                  }
                }}
                className="btn-modern"
                style={{
                  fontSize: "0.85rem",
                  padding: "8px 16px",
                  background: "linear-gradient(135deg, #28a745, #218838)",
                }}
              >
                Hesabım
              </button>
              <button
                onClick={handleLogout}
                className="btn-modern"
                style={{
                  fontSize: "0.85rem",
                  padding: "8px 16px",
                  background: "linear-gradient(135deg, #dc3545, #c82333)",
                }}
              >
                ÇIKIŞ
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
