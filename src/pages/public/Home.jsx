import React, { useState, useEffect } from "react";
import {
  getTranslators,
  addFavoriteTranslator,
  removeFavoriteTranslator,
  getCustomerFavorites,
} from "../../services/api"; // API servislerini içe aktar
import ContactModal from "../../components/ContactModal"; // İletişim Modal bileşeni
import Billboard from "../../components/Billboard"; // Hero/Banner alanı
import { useNavigate } from "react-router-dom";

// ==============================================================================
// HOME PAGE (ANASAYFA - ÇEVİRMEN LİSTELEME)
// ==============================================================================
// Sistemde kayıtlı ve "İlanı Aktif" olan çevirmenlerin müşterilere listelendiği vitrin.
// Ayrıca müşteri girişi yapıldıysa çevirmen kartları üzerinde "Favoriye Ekle" seçeneği bulunur.

const Home = () => {
  // Çevirmen Listesi ve Yükleme Durumu State'leri
  const [translators, setTranslators] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Kontrol State'leri (Mesaj Gönderme / İletişime Geçme için)
  const [selectedTranslator, setSelectedTranslator] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Müşterinin favoriye eklediği çevirmenlerin ID listesini tutacak state
  const [favoriteIds, setFavoriteIds] = useState([]);

  // O an giriş yapmış kullanıcının rolünü al (Kalp ikonunu sadece Müşteriye göstermek için)
  const userRole = localStorage.getItem("role"); // "Customer", "Translator" veya "Admin"

  const navigate = useNavigate();

  // 1. Sayfa açıldığında çevirmenleri ve (eğer müşteri isek) favorilerimizi çekiyoruz
  useEffect(() => {
    fetchTranslators();

    if (userRole === "Customer") {
      fetchFavorites();
    }
  }, [userRole]);

  // Çevirmen listesini backend'den çeken fonksiyon
  const fetchTranslators = async () => {
    try {
      setLoading(true);
      // Backend tarafında GET /api/public/translators sadece IsActive=true olanları getirecek şekilde ayarlandıysa
      // direkt bu listeyi state'e basabiliriz. Aksi takdirde frontend'de filtreleme (.filter) yapılabilir.
      const response = await getTranslators();
      if (response.data.success) {
        setTranslators(response.data.data.items || []);
      }
    } catch (error) {
      console.error("Çevirmenler yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // Müşterinin favoriye eklediği çevirmenleri (ID'lerini) çeken fonksiyon
  const fetchFavorites = async () => {
    try {
      const response = await getCustomerFavorites();
      if (response.data.success) {
        // Gelen favori listesinden sadece çevirmen ID'lerini bir diziye (array) çevir
        const fvIds = response.data.data.map((fav) => fav.translatorId);
        setFavoriteIds(fvIds);
      }
    } catch (error) {
      console.error("Favoriler yüklenirken hata:", error);
    }
  };

  // ---------------------------------------------------------------------------------
  // FAVORİYE EKLE / ÇIKAR (KALP İKONUNA TIKLAMA) İŞLEMİ
  // ---------------------------------------------------------------------------------
  const toggleFavorite = async (translatorId) => {
    const isAlreadyFavorite = favoriteIds.includes(translatorId);

    try {
      if (isAlreadyFavorite) {
        // Zaten favoriyse => Çıkar
        await removeFavoriteTranslator(translatorId);
        // Frontend'deki listeyi de güncelle (Tıklananı diziden çıkar)
        setFavoriteIds((prevIds) =>
          prevIds.filter((id) => id !== translatorId),
        );
      } else {
        // Favori değilse => Ekle
        await addFavoriteTranslator(translatorId);
        // Frontend'deki listeye tıklananı ekle
        setFavoriteIds((prevIds) => [...prevIds, translatorId]);
      }
    } catch (error) {
      console.error("Favori işlemi sırasında hata:", error);
      alert("Favori işlemi başarısız oldu. Lütfen tekrar deneyin.");
    }
  };

  // ---------------------------------------------------------------------------------
  // MODAL FONKSİYONLARI (İletişime Geç)
  // ---------------------------------------------------------------------------------
  const handleOpenContact = (translator) => {
    setSelectedTranslator(translator);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTranslator(null);
    setIsModalOpen(false);
  };

  // Sayfa aşağı kaydırma
  const scrollToTranslators = () => {
    const section = document.getElementById("translator-list");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="container-fluid" style={{ padding: "0" }}>
      {/* 1. BILLBOARD / HERO SECTION */}
      <Billboard
        onScrollTo={scrollToTranslators}
        onRegister={() => navigate("/register")}
      />

      {/* 2. TRANSLATOR LIST SECTION */}
      <section
        id="translator-list"
        className="container section"
        style={{ padding: "80px 20px" }}
      >
        <h2 className="heading-lg text-center" style={{ marginBottom: "40px" }}>
          Sistemimize Kayıtlı Çevirmenlerimiz
        </h2>

        {loading ? (
          <p className="text-center text-muted">Çevirmenler Yükleniyor...</p>
        ) : translators.length === 0 ? (
          <p className="text-center text-muted">
            Arama kriterlerinize uygun aktif bir çevirmen bulunamadı.
          </p>
        ) : (
          <div
            className="grid-auto-fit"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {/* HER BİR ÇEVİRMEN İÇİN KART OLUŞTUR */}
            {translators.map((translator) => {
              // Bu çevirmen müşterinin favorisinde mi kontrolü
              const isFavorite = favoriteIds.includes(translator.id);

              return (
                <div
                  key={translator.id}
                  className="card modern-card-hover glass-panel"
                  style={{
                    position: "relative",
                    padding: "20px",
                    border: "none", // glass-panel border'ı kullanacak
                    borderRadius: "15px",
                  }}
                >
                  {/* KALP İKONU (SADECE CUSTOMER GÖREBİLİR) */}
                  {userRole === "Customer" && (
                    <button
                      onClick={() => toggleFavorite(translator.id)}
                      title={
                        isFavorite ? "Favorilerden Çıkar" : "Favoriye Ekle"
                      }
                      style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "24px",
                        padding: "0",
                        transition: "transform 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform = "scale(1.2)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    >
                      {/* Favoriyse Kırmızı Kalp, Değilse Boş (Gri) Kalp */}
                      <span style={{ color: isFavorite ? "#dc3545" : "#ccc" }}>
                        {isFavorite ? "❤️" : "🤍"}
                      </span>
                    </button>
                  )}

                  {/* Profil Resmi Alanı (Varsa) */}
                  {translator.photoUrl && (
                    <div style={{ textAlign: "center", marginBottom: "15px" }}>
                      <img
                        src={translator.photoUrl}
                        alt={translator.fullName}
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}

                  {/* Çevirmen İsim Soyisim */}
                  <h3
                    style={{
                      color: "var(--primary-color)",
                      fontSize: "1.25rem",
                      marginBottom: "0.5rem",
                      paddingRight: "30px", // Kalp ikonu ile metnin üst üste binmesini engellemek için sağ boşluk
                    }}
                  >
                    {translator.fullName}
                  </h3>

                  {/* Çevirmen Biyografisi */}
                  <p
                    className="text-muted"
                    style={{
                      fontStyle: "italic",
                      marginBottom: "1rem",
                      minHeight: "50px",
                    }}
                  >
                    {translator.bio || "Biyografi eklenmemiş."}
                  </p>

                  {/* Diller */}
                  <div style={{ marginBottom: "20px" }}>
                    <strong>Uzmanlık Dilleri:</strong>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      {translator.languages &&
                      translator.languages.length > 0 ? (
                        translator.languages.map((lang, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: "#f8f9fa",
                              padding: "6px 14px",
                              borderRadius: "20px",
                              fontSize: "0.80rem",
                              color: "#333",
                              border: "1px solid #ddd",
                              fontWeight: "500",
                            }}
                          >
                            {lang.sourceLanguage} ⇆ {lang.targetLanguage}
                          </span>
                        ))
                      ) : (
                        <span
                          className="text-muted"
                          style={{ fontSize: "0.85rem" }}
                        >
                          Henüz dil bilgisi girilmedi.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* İletişim Butonu */}
                  <button
                    className="btn-modern"
                    style={{
                      width: "100%",
                      marginTop: "10px",
                    }}
                    onClick={() => handleOpenContact(translator)}
                  >
                    Hemen İletişime Geç
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL BİLEŞENİ (Mesaj Gönderme Penceresi) */}
      {isModalOpen && selectedTranslator && (
        <ContactModal
          translatorId={selectedTranslator.id}
          translatorName={selectedTranslator.fullName}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Home;
