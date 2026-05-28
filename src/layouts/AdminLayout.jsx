import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaEnvelope, 
  FaChartBar, 
  FaSignOutAlt,
  FaHome,
  FaShieldAlt
} from "react-icons/fa";
import "../css/dashboard_modern.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "Siteden Çık", icon: <FaHome /> },
    { path: "/admin/dashboard", label: "Yönetici Paneli", icon: <FaTachometerAlt /> },
    { path: "/admin/users", label: "Kullanıcı Yönetimi", icon: <FaUsers /> },
    { path: "/admin/messages", label: "Destek Mesajları", icon: <FaEnvelope /> },
    { path: "/admin/reports", label: "Şikayetler", icon: <FaShieldAlt /> },
  ];

  return (
    <div className="dashboard-container">
      {/* MODERN SIDEBAR */}
      <aside className="modern-sidebar">
        <div className="sidebar-logo">
          <FaShieldAlt style={{ color: "#fbbf24" }} />
          <span>Admin Panel</span>
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
            <span>Güvenli Çıkış</span>
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

export default AdminLayout;
