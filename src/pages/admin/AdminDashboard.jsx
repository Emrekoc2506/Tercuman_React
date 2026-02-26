import React, { useState, useEffect } from "react";
import { getAdminDashboard } from "../../services/api";
import { Link } from "react-router-dom";

// ==============================================================================
// ADMIN DASHBOARD (YÖNETİCİ PANELİ)
// ==============================================================================
// Bu sayfa SADECE "Admin" rolüne sahip kullanıcılar tarafından görülebilir.
// Yönetici burada site genelindeki kullanıcı sayılarını, mesaj trafiğini
// görebilecek ve kullanıcıları yönetebilecek.

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTranslators: 0,
    totalMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await getAdminDashboard();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error("Admin dashboard hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Yönetici Paneli (Admin)</h1>
        <Link
          to="/"
          className="btn-modern"
          style={{
            padding: "8px 16px",
            fontSize: "0.9rem",
          }}
        >
          Anasayfaya Dön
        </Link>
      </div>
      <p>Sistem genel durumunu buradan izleyebilirsiniz.</p>

      {/* İSTATİSTİK KARTLARI */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {/* Kart 1: Toplam Kullanıcı */}
        <div className="modern-card-hover glass-panel" style={cardStyle}>
          <h3>Toplam Kullanıcı</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold" }}>
            {stats.totalUsers}
          </p>
        </div>

        {/* Kart 2: Toplam Çevirmen */}
        <div
          className="modern-card-hover glass-panel"
          style={{ ...cardStyle, borderLeft: "5px solid purple" }}
        >
          <h3>Toplam Çevirmen</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "purple" }}>
            {stats.totalTranslators}
          </p>
        </div>

        {/* Kart 3: Toplam Mesaj */}
        <div
          className="modern-card-hover glass-panel"
          style={{ ...cardStyle, borderLeft: "5px solid orange" }}
        >
          <h3>Toplam Mesaj</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "orange" }}>
            {stats.totalMessages}
          </p>
        </div>
      </div>
    </div>
  );
};

// Basit kart stili
const cardStyle = {
  padding: "20px",
  flex: 1,
  borderLeft: "5px solid var(--primary-color)",
};

export default AdminDashboard;
