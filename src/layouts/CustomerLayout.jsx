import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";

// ==============================================================================
// CUSTOMER LAYOUT (MÜŞTERİ TEMASI)
// ==============================================================================
// Bu düzen, sadece Müşteriler (Customer) giriş yaptığında görünecek.
// Sol tarafta bir menü (Sidebar) ve sağda içerik alanı olacak.

const CustomerLayout = () => {
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
        <h3>Müşteri Paneli</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ margin: "10px 0" }}>
            <Link to="/customer/dashboard">Gösterge Paneli</Link>
          </li>
          <li style={{ margin: "10px 0" }}>
            <Link to="/customer/profile">Profilim</Link>
          </li>
          {/* Gelecekte eklenebilecek linkler:
          <li style={{ margin: "10px 0" }}>
            <Link to="/customer/orders">Siparişlerim</Link>
          </li>
          */}
          <li style={{ marginTop: "20px" }}>
            <button
              onClick={handleLogout}
              style={{
                color: "red",
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
                font: "inherit",
              }}
            >
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

export default CustomerLayout;
