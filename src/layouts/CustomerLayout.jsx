import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaTachometerAlt, 
  FaUser, 
  FaEnvelope, 
  FaLanguage, 
  FaPlusCircle, 
  FaSignOutAlt,
  FaHome
} from "react-icons/fa";
import "../css/dashboard_modern.css";
import chatService from "../services/chatService";

const CustomerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const connectAndListen = async () => {
      try {
        await chatService.startConnection();
      } catch (err) {
        console.error("SignalR Layout bağlantı hatası:", err);
      }
    };

    const handleNewMessage = (message) => {
      if (!isMounted) return;
      
      // Mesajlar sayfasındaysa sağ altta popup göstermeye gerek yok
      if (location.pathname.includes("messages")) return;

      setToast({
        senderName: message.senderName || "Yeni Mesaj",
        text: message.text || "Size bir mesaj gönderildi."
      });

      // 4 saniye sonra popup'ı kapat
      setTimeout(() => {
        if (isMounted) setToast(null);
      }, 4000);
    };

    connectAndListen();
    chatService.onMessageReceived(handleNewMessage);

    return () => {
      isMounted = false;
      chatService.removeMessageCallback(handleNewMessage);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "Ana Sayfaya Dön", icon: <FaHome /> },
    { path: "/user/dashboard", label: "Gösterge Paneli", icon: <FaTachometerAlt /> },
    { path: "/user/profile", label: "Profilim", icon: <FaUser /> },
    { path: "/user/messages", label: "Mesajlarım", icon: <FaEnvelope /> },
    { path: "/user/ad-create", label: "İlan Oluştur", icon: <FaPlusCircle /> },
  ];

  return (
    <div className="dashboard-container">
      {/* MODERN SIDEBAR */}
      <aside className="modern-sidebar">
        <div className="sidebar-logo">
          <FaHome style={{ color: "var(--primary-color)" }} />
          <span>MiftahTEA</span>
        </div>

        <nav className="sidebar-nav">
          <ul style={{ listStyle: "none", padding: 0 }}>
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {/* Eğer unread sayısını da göstermek isterseniz buraya eklenebilir */}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-link" style={{ border: "none", background: "none", width: "100%", cursor: "pointer", color: "#ef4444" }}>
            <FaSignOutAlt />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* GLOBAL TOAST (BİLDİRİM) PENCERESİ */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          background: "white",
          borderLeft: "5px solid var(--primary-color)",
          padding: "15px 20px",
          borderRadius: "8px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          animation: "slideInRight 0.3s ease-out"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ color: "#333", fontSize: "14px" }}>🔔 Yeni Mesaj ({toast.senderName})</strong>
            <button 
              onClick={() => setToast(null)} 
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#999" }}>
              &times;
            </button>
          </div>
          <span style={{ color: "#555", fontSize: "13px", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {toast.text}
          </span>
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default CustomerLayout;
