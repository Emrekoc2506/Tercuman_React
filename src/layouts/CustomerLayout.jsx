import React from "react";
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

const CustomerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
    </div>
  );
};

export default CustomerLayout;
