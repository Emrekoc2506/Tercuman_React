import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getListingById,
  getLanguages,
  addFavoriteTranslator,
  removeFavoriteTranslator,
  getCustomerFavorites,
} from "../../services/api";
import ChatModal from "../../components/ChatModal";
import {
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaRegStar,
  FaShieldAlt,
  FaHeart,
  FaRegHeart,
  FaExclamationTriangle,
  FaAward,
  FaGraduationCap,
  FaLink,
  FaImage,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeTab, setActiveTab] = useState("detaylar"); // detaylar | konum | sertifikalar | diploma
  const [languageMap, setLanguageMap] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Dinamik Belgeler
  const [dynamicDiplomas, setDynamicDiplomas] = useState([]);
  const [dynamicCerts, setDynamicCerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Dilleri ve İlan Detayını paralel çek
        const [langs, detail] = await Promise.all([
          getLanguages(),
          getListingById(id),
        ]);

        // 2. Dil map'ini oluştur
        const map = {};
        (langs || []).forEach((l) => {
          map[l.id] = l.name || l.languageName || l.language || "?";
        });
        setLanguageMap(map);

        // 3. İlan detayını işle
        if (detail) {
          const timestamp = Date.now();
          const updatedDetail = { ...detail };

          if (updatedDetail.translatorPhotoUrl) {
            updatedDetail.translatorPhotoUrl = `${updatedDetail.translatorPhotoUrl}?v=${timestamp}`;
          }

          if (updatedDetail.images && Array.isArray(updatedDetail.images)) {
            updatedDetail.images = updatedDetail.images.map(
              (img) => `${img}?v=${timestamp}`,
            );
          }

          setListing(updatedDetail);
        }

        // 4. Favori durumu (Eğer login ise)
        const token = localStorage.getItem("token");
        if (token && id) {
          try {
            const favorites = await getCustomerFavorites();
            const favoriteList = favorites || [];
            const favorited = favoriteList.some(
              (f) => f.listingId === id || f.id === id,
            );
            setIsFavorited(favorited);
          } catch (favError) {
            console.warn(
              "Favori durumu alınamadı (API 500 hatası olabilir):",
              favError,
            );
            setIsFavorited(false);
          }
        }
      } catch (error) {
        console.error("Veri alınırken hata:", error);
        setListing(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleToggleFavorite = async () => {
    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        await removeFavoriteTranslator(id);
        setIsFavorited(false);
      } else {
        await addFavoriteTranslator(id);
        setIsFavorited(true);
      }
    } catch (err) {
      alert(
        "Favori işlemi gerçekleştirilemedi. Giriş yapmış olmanız gerekebilir.",
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Auto-slide logic
  useEffect(() => {
    if (!listing || !listing.images || listing.images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === listing.images.length - 1 ? 0 : prev + 1,
      );
    }, 5000); // 5 seconds

    return () => clearInterval(timer);
  }, [listing]);

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) =>
      prev === listing.images.length - 1 ? 0 : prev + 1,
    );
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) =>
      prev === 0 ? listing.images.length - 1 : prev - 1,
    );
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px",
          fontSize: "1.2rem",
          height: "80vh",
        }}
      >
        İlan detayı yükleniyor...
      </div>
    );
  }

  if (!listing) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px",
          fontSize: "1.2rem",
          color: "red",
          height: "80vh",
        }}
      >
        İlan bulunamadı!
      </div>
    );
  }

  // Güvenlik ve Fallback Kontrolleri (Backend boş gönderirse)
  const userFullName =
    listing.translatorName ||
    listing.userFullName ||
    listing.name ||
    "Çevirmen Üye";
  const initials = userFullName.substring(0, 2).toUpperCase();
  const photoUrl =
    listing.translatorPhotoUrl ||
    (listing.images && listing.images.length > 0 ? listing.images[0] : null) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userFullName)}&background=random`;

  const listingNo =
    listing.listingNo !== undefined
      ? `TRC-${listing.listingNo}`
      : listing.id
        ? `TRC-${listing.id.substring(0, 8).toUpperCase()}`
        : "Bilinmiyor";
  // Tarih: backend "createdAt" alanı gönderiliyor
  const rawDate = listing.createdAt || listing.createdDate;
  const createdAt =
    rawDate && new Date(rawDate).getFullYear() > 2000
      ? new Date(rawDate).toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "Tarih Belirtilmedi";

  const rawUserDate = listing.userCreatedAt;
  const userCreatedAt =
    rawUserDate && new Date(rawUserDate).getFullYear() > 2000
      ? new Date(rawUserDate).toLocaleDateString("tr-TR", {
          month: "long",
          year: "numeric",
        })
      : "Bilinmiyor";

  const city = listing.city || "Şehir Belirtilmemiş";

  // Cinsiyet: backend JsonStringEnumConverter ile "Male"/"Female" string gönderiyor
  const translateGender = (g) => {
    if (!g || g === "" || g === "0" || g === 0 || g === "Unspecified")
      return "Belirtilmemiş";

    // Küçük/büyük harf toleransı
    const safeG = String(g).toLowerCase().trim();
    if (safeG === "male" || safeG === "1" || safeG === "erkek") return "Erkek";
    if (
      safeG === "female" ||
      safeG === "2" ||
      safeG === "kadın" ||
      safeG === "kadin"
    )
      return "Kadın";

    return "Belirtilmemiş";
  };
  const gender = translateGender(listing.gender);
  const phone = listing.phone || listing.userPhone || "Telefon Belirtilmemiş";
  const category = listing.category || "Genel Çeviri / Özel Ders";

  const images =
    listing.images && listing.images.length > 0
      ? listing.images
      : [
          `https://ui-avatars.com/api/?name=${encodeURIComponent(userFullName)}&background=random`,
        ];

  // Hizmet Türü: backend string veya sayı gönderebilir
  const mapServiceType = (v) => {
    if (v === 1 || v === "Online" || v === "online")
      return "Çevrimiçi (Online)";
    if (v === 2 || v === "FaceToFace" || v === "Yüz Yüze") return "Yüz Yüze";
    if (v === 2 || v === "FaceToFace") return "Yüz Yüze";
    if (v === 3 || v === "Both") return "Hem Online Hem Yüz Yüze";
    return "Belirtilmemiş";
  };
  const serviceTypeStr = mapServiceType(listing.serviceType);

  // Deneyim Seviyesi: backend "ZeroToOne", "TenPlus" vb. string gönderiyor
  const mapExperience = (v) => {
    if (v === 1 || v === "ZeroToOne") return "0-1 Yıl";
    if (v === 2 || v === "OneToThree") return "1-3 Yıl";
    if (v === 3 || v === "ThreeToFive") return "3-5 Yıl";
    if (v === 4 || v === "FiveToTen") return "5-10 Yıl";
    if (v === 5 || v === "TenPlus") return "10+ Yıl";
    if (!v || v === 0) return "Belirtilmedi";
    return String(v);
  };
  const experienceStr = mapExperience(listing.experienceLevel);

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        padding: "30px 0",
      }}
    >
      <div
        className="container"
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 15px" }}
      >
        {/* Üst Kısım: Başlık */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid #ddd",
            paddingBottom: "10px",
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              fontSize: "1.6rem",
              color: "#333",
              margin: 0,
              fontWeight: "600",
            }}
          >
            {listing.title}
          </h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: isFavorited ? "#ef4444" : "#666",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "600",
              }}
            >
              {isFavorited ? <FaHeart /> : <FaRegHeart />}
              {isFavorited ? "Favorilerimde" : "Favorilerime Ekle"}
            </button>
          </div>
        </div>

        {/* Ana İçerik Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "7fr 5fr",
            gap: "20px",
          }}
        >
          {/* SOL KOLON: Fotoğraf ve Alt Sekmeler */}
          <div>
            {/* Carousel Kutusu */}
            <div
              className="image-carousel-container"
              style={{
                backgroundColor: "#f1f5f9",
                height: "350px", // 450px'den 350px'e düşürdük
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "12px",
                overflow: "hidden",
                position: "relative",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              {images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: currentSlide === idx ? 1 : 0,
                    transition: "opacity 0.5s ease-in-out",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#000",
                  }}
                >
                  <img
                    src={img}
                    alt={`Listing Slide ${idx}`}
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              ))}

              {/* Controls */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    style={{
                      position: "absolute",
                      left: "15px",
                      background: "rgba(255,255,255,0.7)",
                      border: "none",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <FaChevronLeft color="#333" />
                  </button>
                  <button
                    onClick={nextSlide}
                    style={{
                      position: "absolute",
                      right: "15px",
                      background: "rgba(255,255,255,0.7)",
                      border: "none",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <FaChevronRight color="#333" />
                  </button>

                  {/* Dots */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "20px",
                      display: "flex",
                      gap: "8px",
                      zIndex: 10,
                    }}
                  >
                    {images.map((_, idx) => (
                      <div
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background:
                            currentSlide === idx
                              ? "#fff"
                              : "rgba(255,255,255,0.5)",
                          cursor: "pointer",
                          transition: "all 0.3s",
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ESKİ BEĞENİLEN KUTUCUKLU SEKME TASARIMI (3 AYRI SEKME) */}
            <div style={{ marginTop: "30px" }}>
              <div 
                style={{ 
                  display: "flex", 
                  backgroundColor: "#f1f5f9",
                  borderRadius: "12px 12px 0 0",
                  overflow: "hidden",
                  width: "fit-content"
                }}
              >
                <button
                  onClick={() => setActiveTab("detaylar")}
                  style={{
                    backgroundColor: activeTab === "detaylar" ? "#4f46e5" : "transparent",
                    color: activeTab === "detaylar" ? "#fff" : "#475569",
                    border: "none",
                    padding: "15px 30px",
                    fontSize: "1rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    borderRight: "1px solid #e2e8f0"
                  }}
                >
                  İlan Detayları
                </button>
                <button
                  onClick={() => setActiveTab("sertifikalar")}
                  style={{
                    backgroundColor: activeTab === "sertifikalar" ? "#4f46e5" : "transparent",
                    color: activeTab === "sertifikalar" ? "#fff" : "#475569",
                    border: "none",
                    padding: "15px 30px",
                    fontSize: "1rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    borderRight: "1px solid #e2e8f0"
                  }}
                >
                  Sertifikalar
                </button>
                <button
                  onClick={() => setActiveTab("diploma")}
                  style={{
                    backgroundColor: activeTab === "diploma" ? "#4f46e5" : "transparent",
                    color: activeTab === "diploma" ? "#fff" : "#475569",
                    border: "none",
                    padding: "15px 30px",
                    fontSize: "1rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                >
                  Diploma
                </button>
              </div>

              {/* SEKME İÇERİĞİ KUTUSU */}
              <div 
                style={{ 
                  backgroundColor: "#fff", 
                  border: "1px solid #e2e8f0", 
                  borderRadius: "0 0 12px 12px", 
                  padding: "30px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
                }}
              >
                {activeTab === "detaylar" && (
                  <p
                    style={{
                      lineHeight: "1.8",
                      color: "#334155",
                      whiteSpace: "pre-wrap",
                      fontSize: "1rem",
                      margin: 0
                    }}
                  >
                    {listing.description || "Bu ilan için bir açıklama girilmemiştir."}
                  </p>
                )}

                {activeTab === "sertifikalar" && (
                  <div>
                    <h3 style={{ color: "#1e293b", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                      <FaAward style={{ color: "#fbbf24" }} /> Uzmanlık Sertifikaları
                    </h3>
                    <div className="certification-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                      {dynamicCerts.map(cert => (
                        <div key={cert.id} className="certification-item gold">
                          <div className="cert-icon gold"><FaAward /></div>
                          <div className="cert-info">
                            <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {cert.title}
                              {cert.status === "Verified" ? (
                                <FaCheckCircle style={{ color: "#22c55e", fontSize: "0.9rem" }} title="Onaylı Belge" />
                              ) : (
                                <FaClock style={{ color: "#f59e0b", fontSize: "0.9rem" }} title="Onay Bekliyor" />
                              )}
                            </h4>
                            <p>{cert.organization}</p>
                            
                            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                              {cert.image && (
                                <a href={cert.image} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", color: "#d97706", textDecoration: "none", background: "#fef3c7", padding: "4px 8px", borderRadius: "4px" }}>
                                  <FaImage /> Fotoğraf
                                </a>
                              )}
                              {cert.link && (
                                <a href={cert.link} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", color: "#d97706", textDecoration: "none", background: "#fef3c7", padding: "4px 8px", borderRadius: "4px" }}>
                                  <FaLink /> Belge Linki
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {dynamicCerts.length === 0 && <p style={{ color: "#94a3b8" }}>Henüz sertifika eklenmemiş.</p>}
                    </div>
                  </div>
                )}

                {activeTab === "diploma" && (
                  <div
                    style={{
                      padding: "20px",
                      backgroundColor: "#f0f7ff",
                      border: "2px solid #3b82f6",
                      borderRadius: "16px",
                    }}
                  >
                    <h3
                      style={{
                        marginTop: 0,
                        color: "#1e3a8a",
                        fontSize: "1.1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "15px",
                      }}
                    >
                      <FaGraduationCap /> Akademik Diplomalar
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      {dynamicDiplomas.map(dip => (
                        <div
                          key={dip.id}
                          className="certification-item blue"
                          style={{ backgroundColor: "#fff" }}
                        >
                          <div className="cert-icon blue">
                            <FaGraduationCap />
                          </div>
                          <div className="cert-info">
                            <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {dip.title}
                              {dip.status === "Verified" ? (
                                <FaCheckCircle style={{ color: "#3b82f6", fontSize: "0.9rem" }} title="Onaylı Üniversite Diploması" />
                              ) : (
                                <FaClock style={{ color: "#64748b", fontSize: "0.9rem" }} title="Onay Bekliyor" />
                              )}
                            </h4>
                            <p>{dip.institution}</p>
                            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                              {dip.image && (
                                <a href={dip.image} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", color: "#3b82f6", textDecoration: "none", background: "#eff6ff", padding: "4px 10px", borderRadius: "6px", fontWeight: "600" }}>
                                  <FaImage /> Diploma Fotoğrafı
                                </a>
                              )}
                              {dip.link && (
                                <a href={dip.link} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", color: "#3b82f6", textDecoration: "none", background: "#eff6ff", padding: "4px 10px", borderRadius: "6px", fontWeight: "600" }}>
                                  <FaLink /> Belgeyi Görüntüle
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {dynamicDiplomas.length === 0 && <p style={{ color: "#64748b" }}>Henüz diploma eklenmemiş.</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SAĞ KOLON: İlan Tablosu ve Kullanıcı Profili */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* 1. Kutu: İlan Özellikleri */}
            <div
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #ddd",
                  paddingBottom: "15px",
                  marginBottom: "15px",
                }}
              >
                <span
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: "bold",
                    color: "#224A8B",
                  }}
                >
                  {listing.price ? `${listing.price} TL` : "Fiyat Belirtilmedi"}
                </span>
              </div>

              <table
                style={{
                  width: "100%",
                  fontSize: "0.9rem",
                  borderCollapse: "collapse",
                }}
              >
                <tbody>
                  {[
                    {
                      label: "İlan No",
                      value: (
                        <strong style={{ color: "#d9534f" }}>
                          {listingNo}
                        </strong>
                      ),
                    },
                    { label: "İlan Tarihi", value: createdAt },
                    { label: "Kategori", value: "Genel Çeviri" },
                    { label: "Şehir", value: city },
                    {
                      label: "Uzmanlık Dilleri",
                      value: `${languageMap[listing.sourceLanguageId] || listing.sourceLanguageName || "Bilinmiyor"} - ${languageMap[listing.targetLanguageId] || listing.targetLanguageName || "Bilinmiyor"}`,
                    },
                    { label: "Deneyim", value: experienceStr },
                    { label: "Ders/Hizmet Yeri", value: serviceTypeStr },
                    { label: "Cinsiyet", value: gender },
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px dotted #eee" }}>
                      <td
                        style={{
                          padding: "8px 0",
                          color: "#666",
                          width: "40%",
                        }}
                      >
                        <strong>{row.label}</strong>
                      </td>
                      <td
                        style={{
                          padding: "8px 0",
                          color: "#333",
                          width: "60%",
                        }}
                      >
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: "15px", textAlign: "right" }}>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#999",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  İlan ile İlgili Şikayetim Var
                </span>
              </div>
            </div>

            {/* 2. Kutu: Çevirmen / İlan Sahibi Profili */}
            <div
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                {/* İsim yerine Baş Harfler (ÇE vb.) gösteren Avatar, eğer fotoğraf yoksa */}
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: "#cddc39",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "1.2rem",
                    color: "#333",
                    fontWeight: "bold",
                  }}
                >
                  {initials}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      color: "#333",
                    }}
                  >
                    {userFullName}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>
                    Hesap açma tarihi: {userCreatedAt}
                  </div>
                </div>
              </div>

              <div
                style={{
                  borderTop: "1px solid #eee",
                  paddingtop: "15px",
                  marginTop: "15px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <span style={{ color: "#666", fontWeight: "bold" }}>Cep</span>
                  <span style={{ color: "#333", fontWeight: "bold" }}>
                    {phone}
                  </span>
                </div>

                <button
                  onClick={() => setShowChatModal(true)}
                  style={{
                    width: "100%",
                    marginTop: "15px",
                    padding: "10px",
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    color: "#333",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#f9f9f9")
                  }
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#fff")}
                >
                  <span style={{ fontSize: "1.2rem" }}>✉</span> Mesaj gönder
                </button>
              </div>
            </div>

            {/* 3. Kutu: Güvenlik İpuçları */}
            <div
              style={{
                backgroundColor: "#f9fcff",
                border: "1px solid #b8daff",
                borderRadius: "8px",
                padding: "15px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  color: "#0056b3",
                  marginBottom: "5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                🛡️ Güvenlik İpuçları
              </div>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#333",
                  margin: 0,
                  lineHeight: "1.4",
                }}
              >
                Özel ders / çeviri veren kişiden hizmet almadan ödeme yapmayın,
                para göndermeyin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showChatModal && (
        <ChatModal
          receiverId={listing.userId || listing.user?.id}
          receiverName={userFullName}
          onClose={() => setShowChatModal(false)}
        />
      )}
    </div>
  );
};

export default ListingDetail;
