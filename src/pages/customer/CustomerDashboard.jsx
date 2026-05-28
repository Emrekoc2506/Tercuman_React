import React, { useState, useEffect } from "react";
import {
  getCustomerFavorites,
  removeFavoriteTranslator,
} from "../../services/api";
import { Link } from "react-router-dom";
import {
  FaStar,
  FaClipboardList,
  FaCheckCircle,
  FaEnvelopeOpen,
  FaHeart,
  FaArrowRight,
  FaTrashAlt,
} from "react-icons/fa";
import ContactModal from "../../components/ContactModal";

const CustomerDashboard = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranslator, setSelectedTranslator] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await getCustomerFavorites();
      // Axios interceptor veriyi direkt dönebilir (array olarak), veya sarmalanmış olabilir:
      const resData = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
      setFavorites(resData);
    } catch (error) {
      console.error("Favoriler yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (listingId) => {
    if (
      !window.confirm(
        "Bu çevirmeni favorilerden çıkarmak istediğinize emin misiniz?",
      )
    )
      return;

    try {
      await removeFavoriteTranslator(listingId);
      setFavorites((prev) => prev.filter((fav) => fav.listingId !== listingId));
    } catch (error) {
      alert("Çıkarma işlemi sırasında bir hata oluştu.");
    }
  };

  return (
    <div>
      {/* WELCOME BANNER */}
      <div className="welcome-banner">
        <h1>Hoş Geldiniz, 👋</h1>
        <p>MiftahTEA uzmanlarıyla çeviri süreçlerinizi kolayca yönetin.</p>
        <Link
          to="/"
          style={{
            marginTop: "20px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "white",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "0.9rem",
          }}
        >
          Yeni Çevirmen Keşfet <FaArrowRight fontSize="12px" />
        </Link>
      </div>

      {/* STATS GRID */}
      <div className="stats-grid">
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{
              background: "rgba(79, 70, 229, 0.1)",
              color: "var(--primary-color)",
            }}
          >
            <FaClipboardList />
          </div>
          <div className="stat-info">
            <h4>Aktif Siparişler</h4>
            <div className="stat-value">0</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}
          >
            <FaCheckCircle />
          </div>
          <div className="stat-info">
            <h4>Tamamlanan</h4>
            <div className="stat-value">0</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}
          >
            <FaEnvelopeOpen />
          </div>
          <div className="stat-info">
            <h4>Mesajlar</h4>
            <div className="stat-value">0</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
          >
            <FaHeart />
          </div>
          <div className="stat-info">
            <h4>Favoriler</h4>
            <div className="stat-value">{favorites.length}</div>
          </div>
        </div>
      </div>

      {/* FAVORITES SECTION */}
      <h3 className="section-title">
        <FaStar style={{ color: "#f59e0b" }} /> Favori Çevirmenlerim
      </h3>

      {loading ? (
        <div
          className="glass-panel"
          style={{ padding: "40px", textAlign: "center" }}
        >
          <p>Yükleniyor...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div
          className="glass-panel"
          style={{ padding: "40px", textAlign: "center" }}
        >
          <p style={{ color: "#64748b", fontStyle: "italic" }}>
            Henüz favorinize eklediğiniz bir çevirmen bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="fav-grid">
          {favorites.map((fav) => (
            <div
              key={fav.id || fav.listingId}
              className="glass-panel fav-card modern-card-hover"
            >
              <button
                className="remove-fav-btn"
                onClick={() => handleRemoveFavorite(fav.listingId)}
              >
                <FaTrashAlt />
              </button>

              <div
                style={{ display: "flex", gap: "15px", alignItems: "center" }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    background: "var(--primary-color)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                    fontWeight: "700",
                  }}
                >
                  {fav.translatorName?.charAt(0) || "T"}
                </div>
                <div>
                  <h4 style={{ margin: 0, color: "#1e293b" }}>
                    {fav.translatorName || "Uzman Çevirmen"}
                  </h4>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    Profesyonel Tercüman
                  </span>
                </div>
              </div>

              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Link
                  to={`/listings/${fav.listingId || ""}`}
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--primary-color)",
                    textDecoration: "none",
                    fontWeight: "600",
                  }}
                >
                  Profili Görüntüle
                </Link>
                <button
                  className="btn-modern"
                  style={{
                    padding: "6px 12px",
                    fontSize: "0.75rem",
                    background: "#f1f5f9",
                    color: "#334155",
                    boxShadow: "none",
                  }}
                  onClick={() => {
                    setSelectedTranslator({
                      id: fav.translatorId || fav.userId,
                      fullName: fav.translatorName || "Çevirmen",
                    });
                    setIsModalOpen(true);
                  }}
                >
                  Mesaj Gönder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MESAJ MODAL */}
      {isModalOpen && selectedTranslator && (
        <ContactModal
          translatorId={selectedTranslator.id}
          translatorName={selectedTranslator.fullName}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTranslator(null);
          }}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
