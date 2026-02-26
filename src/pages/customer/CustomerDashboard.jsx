import React, { useState, useEffect } from "react";
import {
  getCustomerFavorites,
  removeFavoriteTranslator,
} from "../../services/api"; // Eklediğimiz servisler
import { Link } from "react-router-dom";

const CustomerDashboard = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sayfa yüklendiğinde favori çevirmenleri API'den getirir
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      // Backend'deki GET /api/customer/favorites endpoint'ine istek atıyoruz
      const res = await getCustomerFavorites();

      if (res.data.success) {
        // Favori listesini state'e atıyoruz
        setFavorites(res.data.data || []);
      }
    } catch (error) {
      console.error("Favoriler yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // Favorilerden Çıkarma (Kalp ikonunu / butonu tıklayınca)
  const handleRemoveFavorite = async (translatorId) => {
    // Silme teyidi al
    if (
      !window.confirm(
        "Bu çevirmeni favorilerden çıkarmak istediğinize emin misiniz?",
      )
    )
      return;

    try {
      // Backend'de DELETE /api/customer/favorite/{id} işlemini çalıştır
      await removeFavoriteTranslator(translatorId);

      // UI tarafında listeyi güncelle (ilgili ID'yi kaldır)
      setFavorites((prev) =>
        prev.filter((fav) => fav.translatorId !== translatorId),
      );

      alert("Çevirmen favorilerinizden çıkarıldı.");
    } catch (error) {
      alert("Çıkarma işlemi sırasında bir hata oluştu.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Müşteri Paneline Hoş Geldiniz</h2>
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
      <p>
        Bu panel üzerinden ileride çeviri siparişlerinizi, profil bilgilerinizi
        ve geçmiş işlemlerinizi yönetebileceksiniz.
      </p>

      {/* Sipariş vb. özet bilgiler alanı (Mevcut yapı korundu) */}
      <div
        className="glass-panel modern-card-hover"
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "none", // glass-panel kullanacak
          borderRadius: "8px",
          marginBottom: "30px", // Favori kısmı ile arasına biraz boşluk açıldı
        }}
      >
        <h4>Özet Bilgiler</h4>
        <ul>
          <li>Aktif Siparişleriniz: 0</li>
          <li>Tamamlanan Siparişleriniz: 0</li>
          <li>Okunmamış Mesajlarınız: 0</li>
          {/* Favori sayısını da özet kısmına yazdır */}
          <li>Favori Çevirmenleriniz: {favorites.length}</li>
        </ul>
      </div>

      <hr />

      {/* ---------------------------------------------------- */}
      {/* 3️⃣ YENİ EKLENEN FAVORİ SİSTEMİ BÖLÜMÜ                */}
      {/* ---------------------------------------------------- */}
      <div>
        <h3>Favori Çevirmenlerim</h3>
        {loading ? (
          <p>Yükleniyor...</p>
        ) : favorites.length === 0 ? (
          <p style={{ color: "#777", fontStyle: "italic" }}>
            Henüz favorinize eklediğiniz bir çevirmen bulunmuyor. Anasayfadan
            kalp ikonuna tıklayarak favorilerinize çevirmen ekleyebilirsiniz.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
              marginTop: "15px",
            }}
          >
            {/* Favoriler dizisi üzerinde dönüyoruz */}
            {favorites.map((fav) => (
              <div
                key={fav.id} // fav tablosunun kendi id'si
                className="glass-panel modern-card-hover"
                style={{
                  border: "none", // glass-panel kullanacak
                  borderRadius: "15px",
                  padding: "20px",
                  position: "relative", // İçindeki çarpı butonu için relative yaptık
                }}
              >
                {/* Çıkarma Butonu (Sağ üstte 'X') */}
                <button
                  onClick={() => handleRemoveFavorite(fav.translatorId)} // Backend'e kullanıcının id'si gitmeli
                  title="Favorilerden Çıkar"
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    color: "red",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  X
                </button>

                {/* Çevirmen Bilgileri */}
                {/* Backend DTO'sundan gelen bilgilere göre isim ve bio'yu yazıyoruz. 
                    (Not: publicDTO içinde tam dönüyorsa ona göre kullanırız) */}
                <h4
                  style={{
                    color: "#007BFF",
                    margin: "0 0 10px 0",
                    paddingRight: "25px",
                  }}
                >
                  {fav.translatorName || `Çevirmen #${fav.translatorId}`}
                </h4>

                {/* İstenirse burada listeye giden link eklenebilir veya Modal açılabilir. */}
                <p style={{ fontSize: "14px", color: "#555" }}>
                  Bu çevirmeni anasayfada veya detay sayfasında bulabilirsiniz.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
