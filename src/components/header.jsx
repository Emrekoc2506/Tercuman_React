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
  // Kullanıcının giriş yapıp yapmadığını kontrol ediyoruz.
  const token = localStorage.getItem("token");

  // ==========================================
  // BİLDİRİM İŞLEMLERİ STATE & FONKSİYONLAR
  // ==========================================
  const [notifications, setNotifications] = useState([]); // Gelen bildirimleri tutar
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Çana tıklanınca menüyü açıp kapatma

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await getTranslatorNotifications();
      if (res.data.success) {
        setNotifications(res.data.data || []);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.warn("Bildirimler yetkisiz erişim nedeniyle (401) atlanıyor.");
      } else {
        console.error("Bildirimler alınamadı:", error);
      }
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
    navigate("/login"); // Çıkış yapınca giriş sayfasına at
    window.location.reload(); // Header'ın güncellenmesi için sayfayı yenile (Basit çözüm)
  };

  // Herkes aynı panele (Dashboard) gidiyor
  const getDashboardPath = () => {
    return "/user/dashboard";
  };

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
          {/* BİLDİRİM ÇANI (Giriş Yapan Herkes İçin) */}
          {token && (
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
                          key={n.messageId}
                          style={{
                            padding: "10px",
                            borderRadius: "6px",
                            background: n.isRead ? "#f8f9fa" : "#e6f7ff",
                            borderLeft: n.isRead
                              ? "3px solid #ccc"
                              : "3px solid #007bff",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            fontSize: "13px",
                            transition: "all 0.2s",
                          }}
                        >
                          <div style={{ flex: 1, marginRight: "10px" }}>
                            <strong
                              style={{
                                display: "block",
                                marginBottom: "2px",
                                color: n.isRead ? "#666" : "#222",
                                fontSize: "14px",
                              }}
                            >
                              {n.senderName}{" "}
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#888",
                                  fontWeight: "normal",
                                  marginLeft: "5px",
                                }}
                              >
                                • Mesaj
                              </span>
                            </strong>
                            <span
                              style={{
                                color: "#555",
                                display: "-webkit-box",
                                WebkitLineClamp: "2",
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                line闖ight: "1.4",
                              }}
                            >
                              {n.content}
                            </span>
                            <span
                              style={{
                                display: "block",
                                fontSize: "10px",
                                color: "#aaa",
                                marginTop: "6px",
                              }}
                            >
                              {new Date(n.sentAt).toLocaleString("tr-TR", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>

                          {!n.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(n.messageId)}
                              title="Okundu İşaretle"
                              style={{
                                background: "#28a74522",
                                border: "none",
                                color: "#28a745",
                                borderRadius: "50%",
                                width: "24px",
                                height: "24px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                fontSize: "12px",
                                flexShrink: 0,
                                marginTop: "2px",
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
              <button
                onClick={() => {
                  navigate("/user/dashboard");
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
