import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";

// ==============================================================================
// ADMIN LAYOUT (YÖNETİCİ TEMASI)
// ==============================================================================
// Bu düzen, sadece Yöneticiler giriş yaptığında görünecek.
// Sol tarafta yönetim menüsü ve sağda içerik alanı.

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SOL MENÜ (SIDEBAR) */}
      <aside
        style={{
          width: "250px",
          background: "#333",
          color: "#fff",
          padding: "20px",
        }}
      >
        <h3>Yönetici Paneli</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ margin: "10px 0" }}>
            <Link to="/admin/dashboard" style={{ color: "#fff" }}>
              Dashboard
            </Link>
          </li>
          <li style={{ margin: "10px 0" }}>
            <Link to="/admin/users" style={{ color: "#fff" }}>
              Kullanıcılar
            </Link>
          </li>
          <li style={{ margin: "10px 0" }}>
            <Link to="/admin/messages" style={{ color: "#fff" }}>
              Mesajlar
            </Link>
          </li>
          <li style={{ marginTop: "20px" }}>
            <button onClick={handleLogout} style={{ color: "orange" }}>
              Çıkış Yap
            </button>
          </li>
        </ul>
      </aside>

      {/* SAĞ İÇERİK ALANI */}
      <main style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
