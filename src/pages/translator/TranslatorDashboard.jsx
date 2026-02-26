import React, { useState, useEffect } from "react";
import { getTranslatorDashboard } from "../../services/api";
import { Link } from "react-router-dom";

// ==============================================================================
// TRANSLATOR DASHBOARD (ÇEVİRMEN PANELİ)
// ==============================================================================
// Bu sayfa SADECE "Translator" rolüne sahip kullanıcılar tarafından görülebilir.
// Çevirmen burada kendisine gelen mesajları, çeviri istatistiklerini,
// favori sayısını ve ilanının kaç kez görüntülendiğini görecek.

const TranslatorDashboard = () => {
  // Verileri tutacak state (Backend'den gelecek olan veri modeliyle uyumlu olarak)
  // 5️⃣ Dashboard Güncellemesi: TotalMessages, UnreadMessages, LanguageCount, TotalFavorites, TotalViews
  const [stats, setStats] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    languageCount: 0,
    totalFavorites: 0, // Yeni eklenen
    totalViews: 0, // Yeni eklenen
  });

  const [loading, setLoading] = useState(true);

  // Sayfa yüklendiğinde dashboard verilerini getir
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await getTranslatorDashboard();
      if (res.data.success) {
        // Backend'den gelen veri ile state'i güncelle
        setStats(res.data.data);
      }
    } catch (error) {
      console.error("Dashboard verisi alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Yükleniyor...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Çevirmen Paneli</h1>
      </div>
      <p>Hoş geldiniz, değerli çevirmenimiz. İşte durum özetiniz:</p>

      {/* İSTATİSTİK KARTLARI GRUBU 1 */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {/* Kart 1: Toplam Mesaj */}
        <div className="modern-card-hover glass-panel" style={cardStyle}>
          <h3>Toplam Mesaj</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold" }}>
            {stats.totalMessages || 0}
          </p>
        </div>

        {/* Kart 2: Okunmamış Mesaj */}
        <div
          className="modern-card-hover glass-panel"
          style={{ ...cardStyle, borderLeft: "5px solid orange" }}
        >
          <h3>Okunmamış Mesaj</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "orange" }}>
            {stats.unreadMessages || 0}
          </p>
        </div>

        {/* Kart 3: Dil Çiftleri */}
        <div
          className="modern-card-hover glass-panel"
          style={{ ...cardStyle, borderLeft: "5px solid green" }}
        >
          <h3>Dil Çiftleri</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "green" }}>
            {stats.languageCount || 0}
          </p>
        </div>
      </div>

      {/* İSTATİSTİK KARTLARI GRUBU 2 (YENİ EKLENENLER) */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {/* Kart 4: Toplam Favoriye Eklenme */}
        <div
          className="modern-card-hover glass-panel"
          style={{ ...cardStyle, borderLeft: "5px solid #dc3545" }}
        >
          <h3>Favoriye Eklenme</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#dc3545" }}>
            {stats.totalFavorites || 0}
          </p>
          <p style={{ fontSize: "0.85rem", color: "#777", marginTop: "5px" }}>
            Müşteriler tarafından favoriye alınma sayınız.
          </p>
        </div>

        {/* Kart 5: Profil Görüntülenme */}
        <div
          className="modern-card-hover glass-panel"
          style={{ ...cardStyle, borderLeft: "5px solid #17a2b8" }}
        >
          <h3>Profil Görüntülenme</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#17a2b8" }}>
            {stats.totalViews || 0}
          </p>
          <p style={{ fontSize: "0.85rem", color: "#777", marginTop: "5px" }}>
            Vitrin profilinizin toplam görüntülenme sayısı.
          </p>
        </div>
      </div>
    </div>
  );
};

// Basit kart stili
const cardStyle = {
  padding: "20px",
  flex: "1 1 250px", // Esnek genişlik, alt satıra inebilmesi için
  borderLeft: "5px solid var(--primary-color)",
};

export default TranslatorDashboard;
