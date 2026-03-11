import React, { useState, useEffect } from "react";
import {
  getListings, // PUBLIC/TRANSLATOR yerine LISTINGS tablosundan besleniyoruz
  addFavoriteTranslator,
  removeFavoriteTranslator,
  getCustomerFavorites,
  getLanguages, // Dil listesi için eklendi
  filterListings, // Filtre servisi
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

  // Dil ID → İsim dönüşümü için lookup map (backend isim değil ID gönderiyor)
  const [languageMap, setLanguageMap] = useState({});

  // Dilleri dropdown'larda göstermek için raw/dizi hali
  const [rawLanguages, setRawLanguages] = useState([]);

  // Filtreleme State'i
  const [filterParams, setFilterParams] = useState({
    sourceLanguageId: "",
    targetLanguageId: "",
    experienceLevel: "",
    city: "",
    serviceType: "",
    searchKeyword: "",
  });

  // O an giriş yapmış kullanıcının rolünü al (Kalp ikonunu sadece Müşteriye göstermek için)
  const userRole = localStorage.getItem("role"); // "Customer", "Translator" veya "Admin"

  // Görünüm Modu State'i (View Switcher için) "detailed", "horizontal", "gallery"
  const [viewMode, setViewMode] = useState("horizontal");

  // Sayfalama (Pagination) State'i
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const navigate = useNavigate();

  // 1. Sayfa açıldığında çevirmenleri ve (eğer müşteri isek) favorilerimizi çekiyoruz
  useEffect(() => {
    // Önce dil listesini çek, sonra ilanları yükle
    fetchLanguages().then(() => fetchTranslators());

    if (userRole === "Customer") {
      fetchFavorites();
    }
  }, [userRole]);

  // Tüm dilleri backend'den çekip { id: isim } map'i oluşturur
  const fetchLanguages = async () => {
    try {
      const res = await getLanguages();
      const langs = res.data?.data || res.data || [];
      const map = {};
      langs.forEach((l) => {
        // Backend'den gelen alan adı name/languageName olabilir
        map[l.id] = l.name || l.languageName || l.language || "?";
      });
      setLanguageMap(map);
      setRawLanguages(langs);
      return map; // Kullanılmak üzere döndür
    } catch (err) {
      console.error("Diller yüklenirken hata:", err);
      return {};
    }
  };

  // Çevirmen listesini backend'den çeken fonksiyon
  const fetchTranslators = async () => {
    try {
      setLoading(true);
      // Backend tarafında GET /api/public/translators olmadığı için geçici olarak (veya kalıcı olarak)
      // GET /api/Listings (tüm ilanlar) endpointini çağırıyoruz.
      const response = await getListings(1, 100); // İlk 100 ilanı getir

      console.log("Gelen İlanlar:", response.data);

      if (response.data.success) {
        // Gelen listeyi Translator kartlarının beklediği modele (DTO) dönüştür (Mapping)
        // Beklenen response.data -> { success: true, data: Array(2), totalCount: 2, ... }
        const mappedTranslators = (response.data.data || []).map((listing) => ({
          id: listing.userId, // Favori işlemleri için User ID gerekli
          listingId: listing.id, // İlanın kendi ID'si (Detay sayfasına gitmek için)
          fullName: listing.translatorName || listing.name || "Çevirmen",
          bio: listing.description || "",
          listingNo: listing.listingNo || listing.id, // Artık backend'den ListingNo geliyor
          createdAt: (() => {
            const raw = listing.createdAt || listing.createdDate;
            if (!raw) return "Belirtilmedi";
            const d = new Date(raw);
            return d.getFullYear() > 2000
              ? d.toLocaleDateString("tr-TR")
              : "Belirtilmedi";
          })(),
          gender: (() => {
            const g = listing.gender;
            console.log(
              "GENDER DEBUG:",
              listing.translatorName,
              "→ gender:",
              g,
            );
            if (!g || g === "" || g === 0 || g === "0" || g === "NotSpecified")
              return "Belirtilmedi";
            if (g === "Male" || g === "male" || g === 1 || String(g) === "1")
              return "Erkek";
            if (
              g === "Female" ||
              g === "female" ||
              g === 2 ||
              String(g) === "2"
            )
              return "Kadın";
            return g; // direkt döndür (Erkek/Kadın zaten yazılmışsa)
          })(),
          phone: listing.phone || "Belirtilmedi",
          photoUrl:
            listing.images && listing.images.length > 0
              ? listing.images[0]
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.translatorName || "Çevirmen")}&background=random`,
          languages: (() => {
            // Backend artık sourceLanguageName/targetLanguageName gönderiyor
            // Fallback olarak eski languageMap ID lookup'ı da var
            const srcName =
              listing.sourceLanguageName ||
              listing.sourceLanguage ||
              languageMap[listing.sourceLanguageId] ||
              null;
            const tgtName =
              listing.targetLanguageName ||
              listing.targetLanguage ||
              languageMap[listing.targetLanguageId] ||
              null;
            return srcName && tgtName
              ? [{ sourceLanguage: srcName, targetLanguage: tgtName }]
              : [];
          })(),
        }));

        setTranslators(mappedTranslators);
      }
    } catch (error) {
      console.error("Çevirmenler/İlanlar yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtre input değişikliklerini yakalar
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Filtreleri Uygula butonuna basıldığında
  const handleApplyFilters = async () => {
    try {
      setLoading(true);

      // Temiz parametreler: Sadece dolu olanları gönder
      const cleanParams = {};
      Object.entries(filterParams).forEach(([key, val]) => {
        if (val !== "") {
          cleanParams[key] = val;
        }
      });
      // Arama kelimesi eklenecekse buraya (ilerleyen adımlarda) eklenebilir.
      cleanParams.page = 1;
      cleanParams.pageSize = 100;

      // Filter servisini çağır. Henüz api.js'te import edilmediyse üst taraftan edeceğiz
      const response = await filterListings(cleanParams);

      if (response.data.success) {
        // Gelen listeyi yine aynı Translator kart yapısına dönüştür
        const mappedTranslators = (response.data.data || []).map((listing) => ({
          id: listing.userId,
          listingId: listing.id,
          fullName: listing.translatorName || listing.name || "Çevirmen",
          bio: listing.description || "",
          listingNo:
            listing.listingNo !== undefined ? listing.listingNo : listing.id,
          createdAt: (() => {
            const raw = listing.createdAt || listing.createdDate;
            if (!raw) return "Belirtilmedi";
            const d = new Date(raw);
            return d.getFullYear() > 2000
              ? d.toLocaleDateString("tr-TR")
              : "Belirtilmedi";
          })(),
          gender: (() => {
            const g = listing.gender;
            if (!g || g === 0 || g === "0" || g === "NotSpecified")
              return "Belirtilmedi";
            if (g === "Male" || g === 1 || String(g) === "1") return "Erkek";
            if (g === "Female" || g === 2 || String(g) === "2") return "Kadın";
            return g;
          })(),
          phone: listing.phone || "Belirtilmedi",
          photoUrl:
            listing.images && listing.images.length > 0
              ? listing.images[0]
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.translatorName || "Çevirmen")}&background=random`,
          languages: (() => {
            const srcName =
              listing.sourceLanguageName ||
              listing.sourceLanguage ||
              languageMap[listing.sourceLanguageId] ||
              null;
            const tgtName =
              listing.targetLanguageName ||
              listing.targetLanguage ||
              languageMap[listing.targetLanguageId] ||
              null;
            return srcName && tgtName
              ? [{ sourceLanguage: srcName, targetLanguage: tgtName }]
              : [];
          })(),
        }));

        setTranslators(mappedTranslators);
        setCurrentPage(1); // Filtreleme sonrası sayfa başa döner
      }
    } catch (error) {
      console.error("Filtreleme sırasında hata oluştu:", error);
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
        {/* Layout Grid (Sol: Filtre, Sağ: İçerik) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "30px",
            alignItems: "start",
          }}
        >
          {/* SOL: FİLTRELEME ALANI (Kullanıcının Çizdiği Mavi Alan) */}
          <aside
            style={{
              backgroundColor: "#fcfcfc",
              border: "1px solid #e0e0e0",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <h3
              style={{
                fontSize: "1.2rem",
                marginBottom: "15px",
                borderBottom: "2px solid #f1f1f1",
                paddingBottom: "10px",
              }}
            >
              Filtreler
            </h3>

            {/* Kaynak Dil Filtresi */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#444",
                }}
              >
                Kaynak Dil
              </label>
              <select
                name="sourceLanguageId"
                value={filterParams.sourceLanguageId}
                onChange={handleFilterChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "5px",
                  outline: "none",
                }}
              >
                <option value="">Tümü</option>
                {rawLanguages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name || lang.languageName || lang.language}
                  </option>
                ))}
              </select>
            </div>

            {/* Hedef Dil Filtresi */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#444",
                }}
              >
                Hedef Dil
              </label>
              <select
                name="targetLanguageId"
                value={filterParams.targetLanguageId}
                onChange={handleFilterChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "5px",
                  outline: "none",
                }}
              >
                <option value="">Tümü</option>
                {rawLanguages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name || lang.languageName || lang.language}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#444",
                }}
              >
                Deneyim Seviyesi
              </label>
              <select
                name="experienceLevel"
                value={filterParams.experienceLevel}
                onChange={handleFilterChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "5px",
                  outline: "none",
                }}
              >
                <option value="">Tümü</option>
                <option value="1">0-1 Yıl</option>
                <option value="2">1-3 Yıl</option>
                <option value="3">3-5 Yıl</option>
                <option value="4">5-10 Yıl</option>
                <option value="5">10+ Yıl</option>
              </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#444",
                }}
              >
                Şehir
              </label>
              <input
                type="text"
                name="city"
                value={filterParams.city}
                onChange={handleFilterChange}
                placeholder="Örn. Ankara"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "5px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#444",
                }}
              >
                Kategori
              </label>
              <select
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "5px",
                  outline: "none",
                }}
              >
                <option value="">Tümü</option>
                <option value="ceviri">Genel Çeviri</option>
                <option value="ozel-ders">Özel Ders Verenler</option>
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#444",
                }}
              >
                Cinsiyet
              </label>
              <select
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "5px",
                  outline: "none",
                }}
              >
                <option value="">Tümü</option>
                <option value="erkek">Erkek</option>
                <option value="kadin">Kadın</option>
              </select>
            </div>

            <button
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                backgroundColor: "#4f46e5",
                color: "#fff",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.2s",
              }}
              onClick={handleApplyFilters}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#4338ca")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#4f46e5")}
            >
              Filtreleri Uygula
            </button>
          </aside>

          {/* SAĞ: ARAMA & LİSTELEME ALANI (Kullanıcının Çizdiği Yeşil ve Kırmızı Alanlar) */}
          <div>
            {/* Üst Arama Paneli (Yeşil Alan) */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "30px",
                backgroundColor: "#fff",
                padding: "15px",
                borderRadius: "10px",
                border: "1px solid #e0e0e0",
                boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
              }}
            >
              <input
                type="text"
                name="searchKeyword"
                value={filterParams.searchKeyword}
                onChange={handleFilterChange}
                placeholder="İlan anahtar kelimesi, isim veya ilan no arayın..."
                style={{
                  flex: 1,
                  padding: "12px 15px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  outline: "none",
                }}
              />
              <button
                style={{
                  padding: "0 25px",
                  backgroundColor: "#4f46e5",
                  color: "#fff",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#4338ca")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#4f46e5")}
              >
                İlanı Ara
              </button>

              {/* Görünüm Değiştirici (View Switcher) Butonları */}
              <div
                style={{
                  display: "flex",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  overflow: "hidden",
                  marginLeft: "10px",
                }}
              >
                <button
                  title="Detaylı Liste"
                  onClick={() => setViewMode("detailed")}
                  style={{
                    padding: "8px 12px",
                    backgroundColor:
                      viewMode === "detailed" ? "#e2e8f0" : "#fff",
                    border: "none",
                    borderRight: "1px solid #ccc",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseOver={(e) =>
                    viewMode !== "detailed" &&
                    (e.currentTarget.style.backgroundColor = "#f7fafc")
                  }
                  onMouseOut={(e) =>
                    viewMode !== "detailed" &&
                    (e.currentTarget.style.backgroundColor = "#fff")
                  }
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={viewMode === "detailed" ? "#2b6cb0" : "#4a5568"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                    <line x1="15" y1="3" x2="15" y2="21"></line>
                  </svg>
                </button>
                <button
                  title="Yatay Liste"
                  onClick={() => setViewMode("horizontal")}
                  style={{
                    padding: "8px 12px",
                    backgroundColor:
                      viewMode === "horizontal" ? "#e2e8f0" : "#fff",
                    border: "none",
                    borderRight: "1px solid #ccc",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseOver={(e) =>
                    viewMode !== "horizontal" &&
                    (e.currentTarget.style.backgroundColor = "#f7fafc")
                  }
                  onMouseOut={(e) =>
                    viewMode !== "horizontal" &&
                    (e.currentTarget.style.backgroundColor = "#fff")
                  }
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={viewMode === "horizontal" ? "#2b6cb0" : "#4a5568"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </button>
                <button
                  title="Galeri Görünümü"
                  onClick={() => setViewMode("gallery")}
                  style={{
                    padding: "8px 12px",
                    backgroundColor:
                      viewMode === "gallery" ? "#e2e8f0" : "#fff",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseOver={(e) =>
                    viewMode !== "gallery" &&
                    (e.currentTarget.style.backgroundColor = "#f7fafc")
                  }
                  onMouseOut={(e) =>
                    viewMode !== "gallery" &&
                    (e.currentTarget.style.backgroundColor = "#fff")
                  }
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={viewMode === "gallery" ? "#2b6cb0" : "#4a5568"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
              </div>
              <select
                style={{
                  padding: "0 15px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  outline: "none",
                  minWidth: "170px",
                }}
              >
                <option value="">Görünüm Seçenekleri</option>
                <option value="newest">En Yeni İlanlar</option>
                <option value="price_asc">Fiyat (Önce En Düşük)</option>
                <option value="price_desc">Fiyat (Önce En Yüksek)</option>
              </select>
            </div>

            <h2
              className="heading-md"
              style={{
                marginBottom: "20px",
                paddingBottom: "10px",
                borderBottom: "1px solid #eaeaea",
              }}
            >
              Sistemimize Kayıtlı Çevirmenlerimiz{" "}
              <span
                style={{
                  fontSize: "1rem",
                  color: "#888",
                  fontWeight: "normal",
                }}
              >
                ({translators.length} Sonuç)
              </span>
            </h2>

            {/* Yatay İlan Kartları (Kırmızı Alan) */}
            {loading ? (
              <p className="text-center text-muted">
                Çevirmenler Yükleniyor...
              </p>
            ) : translators.length === 0 ? (
              <p
                className="text-center text-muted"
                style={{
                  padding: "50px",
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              >
                Arama kriterlerinize uygun aktif bir çevirmen bulunamadı.
              </p>
            ) : (
              <div
                style={
                  viewMode === "gallery"
                    ? {
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "20px",
                      }
                    : {
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                      }
                }
              >
                {/* SAYFALAMA (PAGINATION) HESABI */}
                {(() => {
                  const totalPages = Math.ceil(translators.length / PAGE_SIZE);
                  const paginatedTranslators = translators.slice(
                    (currentPage - 1) * PAGE_SIZE,
                    currentPage * PAGE_SIZE,
                  );

                  return (
                    <>
                      {/* KARTLAR */}
                      {paginatedTranslators.map((translator) => {
                        const isFavorite = favoriteIds.includes(translator.id);

                        return (
                          <div
                            key={translator.listingId || translator.id}
                            className="card modern-card-hover glass-panel item-card-horizontal"
                            style={{
                              position: "relative",
                              padding:
                                viewMode === "detailed" ? "25px" : "15px",
                              border: "1px solid #ebebeb",
                              borderRadius: "15px",
                              display: "flex", // Yatay (Horizontal) layout için flex
                              flexDirection:
                                viewMode === "gallery" ? "column" : "row",
                              gap: viewMode === "gallery" ? "15px" : "25px",
                              alignItems:
                                viewMode === "gallery" ? "center" : "center",
                              backgroundColor: "#fff",
                              textAlign:
                                viewMode === "gallery" ? "center" : "left",
                            }}
                          >
                            {/* Sol Taraf: Fotoğraf ve Favori Butonu */}
                            <div
                              style={{
                                width:
                                  viewMode === "gallery" ? "100%" : "120px",
                                flexShrink: 0,
                                textAlign: "center",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                position:
                                  viewMode === "gallery"
                                    ? "static"
                                    : "relative",
                              }}
                            >
                              {translator.photoUrl && (
                                <img
                                  src={translator.photoUrl}
                                  alt={translator.fullName}
                                  style={{
                                    width:
                                      viewMode === "gallery"
                                        ? "150px"
                                        : "100px",
                                    height:
                                      viewMode === "gallery"
                                        ? "150px"
                                        : "100px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    marginBottom:
                                      viewMode === "gallery" ? "5px" : "10px",
                                    border: "3px solid #f1f1f1",
                                  }}
                                />
                              )}
                              {/* KALP İKONU (SADECE CUSTOMER GÖREBİLİR) */}
                              {userRole === "Customer" && (
                                <button
                                  onClick={() => toggleFavorite(translator.id)}
                                  title={
                                    isFavorite
                                      ? "Favorilerden Çıkar"
                                      : "Favoriye Ekle"
                                  }
                                  style={{
                                    position:
                                      viewMode === "gallery"
                                        ? "absolute"
                                        : "static",
                                    top:
                                      viewMode === "gallery" ? "15px" : "auto",
                                    right:
                                      viewMode === "gallery" ? "15px" : "auto",
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "24px",
                                    padding: "0",
                                    transition: "transform 0.2s",
                                    marginTop:
                                      viewMode === "gallery" ? "0" : "5px",
                                  }}
                                  onMouseOver={(e) =>
                                    (e.currentTarget.style.transform =
                                      "scale(1.2)")
                                  }
                                  onMouseOut={(e) =>
                                    (e.currentTarget.style.transform =
                                      "scale(1)")
                                  }
                                >
                                  <span
                                    style={{
                                      color: isFavorite ? "#dc3545" : "#ccc",
                                    }}
                                  >
                                    {isFavorite ? "❤️" : "🤍"}
                                  </span>
                                </button>
                              )}
                            </div>

                            {/* Sağ Taraf: İlan İçeriği */}
                            <div
                              style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                width: "100%",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection:
                                    viewMode === "gallery" ? "column" : "row",
                                  justifyContent: "space-between",
                                  alignItems:
                                    viewMode === "gallery"
                                      ? "center"
                                      : "flex-start",
                                  gap: viewMode === "gallery" ? "15px" : "0",
                                  width: "100%",
                                }}
                              >
                                <div style={{ flex: 1, width: "100%" }}>
                                  {/* Çevirmen İsim Soyisim */}
                                  <h3
                                    style={{
                                      color: "var(--primary-color)",
                                      fontSize: "1.4rem",
                                      marginBottom: "0.5rem",
                                      fontWeight: "600",
                                      textAlign:
                                        viewMode === "gallery"
                                          ? "center"
                                          : "left",
                                    }}
                                  >
                                    {translator.fullName}
                                  </h3>

                                  {/* İlan Detayları Özeti */}
                                  <div
                                    style={{
                                      marginBottom: "15px",
                                      fontSize: "0.85rem",
                                      color: "#666",
                                      display: "flex",
                                      flexWrap: "wrap",
                                      justifyContent:
                                        viewMode === "gallery"
                                          ? "center"
                                          : "flex-start",
                                      gap: "10px 20px",
                                    }}
                                  >
                                    <span>
                                      <strong>İlan No:</strong> #
                                      {translator.listingNo}
                                    </span>
                                    <span>
                                      <strong>Tarih:</strong>{" "}
                                      {translator.createdAt}
                                    </span>
                                    <span>
                                      <strong>Cinsiyet:</strong>{" "}
                                      {translator.gender}
                                    </span>
                                    <span>
                                      <strong>Telefon:</strong>{" "}
                                      {translator.phone}
                                    </span>
                                  </div>

                                  {/* Çevirmen Biyografisi (Sadece Detaylı Görünümde) */}
                                  {viewMode === "detailed" && (
                                    <p
                                      className="text-muted"
                                      style={{
                                        fontStyle: "italic",
                                        marginBottom: "1rem",
                                        minHeight: "30px",
                                        fontSize: "0.95rem",
                                      }}
                                    >
                                      {translator.bio ||
                                        "Biyografi eklenmemiş."}
                                    </p>
                                  )}

                                  {/* Diller (Sadece Detaylı Görünümde) */}
                                  {viewMode === "detailed" && (
                                    <div>
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
                                          translator.languages.map(
                                            (lang, idx) => (
                                              <span
                                                key={idx}
                                                style={{
                                                  background: "#f8f9fa",
                                                  padding: "4px 12px",
                                                  borderRadius: "20px",
                                                  fontSize: "0.80rem",
                                                  color: "#333",
                                                  border: "1px solid #ddd",
                                                  fontWeight: "500",
                                                }}
                                              >
                                                {lang.sourceLanguage} ⇆{" "}
                                                {lang.targetLanguage}
                                              </span>
                                            ),
                                          )
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
                                  )}
                                </div>

                                {/* İlan İnceleme Butonu (Sağ Üst Köşede veya Ortada Hizalanmış) */}
                                <div
                                  style={{
                                    marginLeft:
                                      viewMode === "gallery" ? "0" : "20px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems:
                                      viewMode === "gallery"
                                        ? "center"
                                        : "flex-end",
                                    gap: "10px",
                                    width:
                                      viewMode === "gallery" ? "100%" : "auto",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#999",
                                      marginBottom: "5px",
                                      textAlign: "center",
                                    }}
                                  >
                                    %100 Doğrulanmış
                                  </div>
                                  <button
                                    className="btn-modern"
                                    style={{
                                      padding: "10px 20px",
                                      fontSize: "0.90rem",
                                      minWidth: "120px",
                                      width:
                                        viewMode === "gallery"
                                          ? "100%"
                                          : "auto",
                                    }}
                                    onClick={() =>
                                      navigate(
                                        `/listings/${translator.listingId || translator.id}`,
                                      )
                                    }
                                  >
                                    İlanı İncele
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* SAYFALAMA BUTONLARI */}
                      {totalPages > 1 && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "8px",
                            marginTop: "30px",
                            padding: "10px 0",
                          }}
                        >
                          {/* Geri */}
                          <button
                            onClick={() =>
                              setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                            style={{
                              padding: "8px 16px",
                              border: "1px solid #d0d0d0",
                              borderRadius: "8px",
                              background:
                                currentPage === 1 ? "#f5f5f5" : "#fff",
                              color: currentPage === 1 ? "#bbb" : "#333",
                              cursor:
                                currentPage === 1 ? "not-allowed" : "pointer",
                              fontWeight: "600",
                              fontSize: "1rem",
                              transition: "all 0.2s",
                            }}
                          >
                            &lsaquo;
                          </button>

                          {/* Sayfa numaraları */}
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                          ).map((page) => (
                            <button
                              key={page}
                              onClick={() => {
                                setCurrentPage(page);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              style={{
                                padding: "8px 14px",
                                border: "1px solid",
                                borderColor:
                                  currentPage === page
                                    ? "var(--primary-color, #5c6bc0)"
                                    : "#d0d0d0",
                                borderRadius: "8px",
                                background:
                                  currentPage === page
                                    ? "var(--primary-color, #5c6bc0)"
                                    : "#fff",
                                color: currentPage === page ? "#fff" : "#333",
                                cursor: "pointer",
                                fontWeight:
                                  currentPage === page ? "700" : "400",
                                fontSize: "0.95rem",
                                minWidth: "38px",
                                transition: "all 0.2s",
                              }}
                            >
                              {page}
                            </button>
                          ))}

                          {/* İleri */}
                          <button
                            onClick={() => {
                              setCurrentPage((p) =>
                                Math.min(totalPages, p + 1),
                              );
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            disabled={currentPage === totalPages}
                            style={{
                              padding: "8px 16px",
                              border: "1px solid #d0d0d0",
                              borderRadius: "8px",
                              background:
                                currentPage === totalPages ? "#f5f5f5" : "#fff",
                              color:
                                currentPage === totalPages ? "#bbb" : "#333",
                              cursor:
                                currentPage === totalPages
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight: "600",
                              fontSize: "1rem",
                              transition: "all 0.2s",
                            }}
                          >
                            &rsaquo;
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
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
