import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";

// ==============================================================================
// TRANSLATOR LAYOUT (ÇEVİRMEN TEMASI)
// ==============================================================================
// Bu düzen, sadece Çevirmenler giriş yaptığında görünecek.
// Sol tarafta bir menü (Sidebar) ve sağda içerik alanı olacak.

const TranslatorLayout = () => {
  const navigate = useNavigate();

  // Çıkış yapma fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SOL MENÜ (SIDEBAR) */}
      <aside style={{ width: "250px", background: "#f4f4f4", padding: "20px" }}>
        <h3>Çevirmen Paneli</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ margin: "10px 0" }}>
            <Link to="/" style={{ fontWeight: "bold", color: "#007BFF" }}>
              Ana Sayfa
            </Link>
          </li>
          <li style={{ margin: "10px 0" }}>
            <Link to="/translator/dashboard">Gösterge Paneli</Link>
          </li>
          <li style={{ margin: "10px 0" }}>
            <Link to="/translator/messages">Mesajlar</Link>
          </li>
          <li style={{ margin: "10px 0" }}>
            <Link to="/translator/languages">Dil Yönetimi</Link>
          </li>
          <li style={{ margin: "10px 0" }}>
            <Link to="/translator/profile">Profilim</Link>
          </li>
          <li style={{ marginTop: "20px" }}>
            <button onClick={handleLogout} style={{ color: "red" }}>
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

export default TranslatorLayout;
