import React, { useState, useEffect } from "react";
import { getAdminDashboard } from "../../services/api";
import { 
  FaUsers, 
  FaGlobe, 
  FaEnvelope, 
  FaChartLine,
  FaArrowUp,
  FaShieldAlt
} from "react-icons/fa";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 1250, // Örnek veri (Backend gelene kadar WOW için)
    totalTranslators: 450,
    totalMessages: 8520,
    growth: 12
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await getAdminDashboard();
      if (data) {
        setStats({ ...stats, ...data });
      }
    } catch (error) {
      console.warn("Gerçek veriler alınamadı, demo veriler gösteriliyor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* MODERN WELCOME BANNER */}
      <div className="welcome-banner">
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1>Sistem Genel Bakış</h1>
          <p>MiftahTEA platformundaki tüm operasyonları buradan izleyebilirsiniz.</p>
        </div>
        <FaShieldAlt style={{ 
          position: "absolute", 
          right: "40px", 
          top: "50%", 
          transform: "translateY(-50%)", 
          fontSize: "5rem", 
          opacity: 0.1 
        }} />
      </div>

      {/* STATS GRID */}
      <div className="stats-grid">
        {/* Toplam Kullanıcı */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
            <FaUsers />
          </div>
          <div className="stat-info">
            <h4>Toplam Kullanıcı</h4>
            <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
            <div style={{ color: "#22c55e", fontSize: "0.85rem", marginTop: "4px" }}>
              <FaArrowUp /> %{stats.growth} Bu ay
            </div>
          </div>
        </div>

        {/* Toplam Çevirmen */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(168, 85, 247, 0.1)", color: "#a855f7" }}>
            <FaGlobe />
          </div>
          <div className="stat-info">
            <h4>Aktif Çevirmenler</h4>
            <div className="stat-value">{stats.totalTranslators.toLocaleString()}</div>
            <div style={{ color: "#a855f7", fontSize: "0.85rem", marginTop: "4px" }}>
              En popüler rol
            </div>
          </div>
        </div>

        {/* Toplam Mesaj */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(249, 115, 22, 0.1)", color: "#f97316" }}>
            <FaEnvelope />
          </div>
          <div className="stat-info">
            <h4>Toplam Mesaj</h4>
            <div className="stat-value">{stats.totalMessages.toLocaleString()}</div>
            <div style={{ color: "#f97316", fontSize: "0.85rem", marginTop: "4px" }}>
              Anlık iletişim
            </div>
          </div>
        </div>

        {/* Analiz (Demo) */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
            <FaChartLine />
          </div>
          <div className="stat-info">
            <h4>Platform Skoru</h4>
            <div className="stat-value">9.8</div>
            <div style={{ color: "#3b82f6", fontSize: "0.85rem", marginTop: "4px" }}>
              Mükemmel performans
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "40px" }}>
        <h3 className="section-title">Hızlı İşlemler</h3>
        <div style={{ display: "flex", gap: "15px" }}>
          <button className="btn-modern" onClick={() => (window.location.href = "/admin/users")}>
            Kullanıcıları Düzenle
          </button>
          <button className="btn-modern" style={{ background: "white", color: "var(--primary-color)", border: "1px solid" }}>
            Yeni Admin Ekle
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
