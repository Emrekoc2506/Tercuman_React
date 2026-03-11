import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getListingById, getLanguages } from "../../services/api";
import ChatModal from "../../components/ChatModal";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeTab, setActiveTab] = useState("detaylar"); // detaylar | konum
  const [languageMap, setLanguageMap] = useState({});

  useEffect(() => {
    // Tüm dilleri backend'den çekip { id: isim } map'i oluşturur
    const fetchLanguages = async () => {
      try {
        const res = await getLanguages();
        const langs = res.data?.data || res.data || [];
        const map = {};
        langs.forEach((l) => {
          map[l.id] = l.name || l.languageName || l.language || "?";
        });
        setLanguageMap(map);
      } catch (error) {
        console.error("Diller alınamadı:", error);
      }
    };

    const fetchDetail = async () => {
      try {
        const response = await getListingById(id);
        setListing(response.data?.data || response.data);
      } catch (error) {
        console.error("İlan detayı alınırken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLanguages().then(() => fetchDetail());
    }
  }, [id]);

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
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(userFullName)}&background=random`;

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
            <span
              style={{ cursor: "pointer", color: "#666", fontSize: "0.9rem" }}
            >
              ⭐ Favorilerime Ekle
            </span>
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
            {/* Fotoğraf Kutusu */}
            <div
              style={{
                backgroundColor: "#000",
                height: "450px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <img
                src={photoUrl}
                alt="İlan Görseli"
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            </div>

            {/* Alt Sekmeler (İlan Detayları / Konumu) */}
            <div
              style={{
                marginTop: "30px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                backgroundColor: "#fff",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  backgroundColor: "#f1f1f1",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <button
                  onClick={() => setActiveTab("detaylar")}
                  style={{
                    padding: "12px 25px",
                    border: "none",
                    fontWeight: "bold",
                    cursor: "pointer",
                    backgroundColor:
                      activeTab === "detaylar" ? "#4f46e5" : "transparent",
                    color: activeTab === "detaylar" ? "#fff" : "#666",
                  }}
                >
                  İlan Detayları
                </button>
              </div>

              <div style={{ padding: "20px", minHeight: "200px" }}>
                {activeTab === "detaylar" && (
                  <div>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        borderBottom: "1px dotted #ccc",
                        paddingBottom: "10px",
                        marginBottom: "15px",
                      }}
                    >
                      Açıklama
                    </h3>
                    <p
                      style={{
                        whiteSpace: "pre-wrap",
                        lineHeight: "1.6",
                        color: "#444",
                        fontSize: "0.95rem",
                      }}
                    >
                      {listing.description ||
                        "Bu ilan için bir açıklama girilmemiştir."}
                    </p>
                  </div>
                )}
                {activeTab === "konum" && (
                  <div>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        borderBottom: "1px dotted #ccc",
                        paddingBottom: "10px",
                        marginBottom: "15px",
                      }}
                    >
                      Konum Bilgisi
                    </h3>
                    <p style={{ color: "#444" }}>
                      İlan Konumu: <strong>{city}</strong>
                    </p>
                    <div
                      style={{
                        width: "100%",
                        height: "300px",
                        backgroundColor: "#eaeaea",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "8px",
                        marginTop: "15px",
                        color: "#999",
                      }}
                    >
                      (Harita Entegrasyonu Yapılacak)
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
