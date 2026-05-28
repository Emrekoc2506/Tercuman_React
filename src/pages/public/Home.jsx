import React, { useState, useEffect } from "react";
import {
  getListings, // PUBLIC/TRANSLATOR yerine LISTINGS tablosundan besleniyoruz
  addFavoriteTranslator,
  removeFavoriteTranslator,
  getCustomerFavorites,
  getLanguages, // Dil listesi için eklendi
  getCities, // Şehir listesi için eklendi
  filterListings, // Filtre servisi
} from "../../services/api"; // API servislerini içe aktar
import ContactModal from "../../components/ContactModal"; // İletişim Modal bileşeni
import Billboard from "../../components/Billboard"; // Hero/Banner alanı
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaCheckCircle,
} from "react-icons/fa";

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
    gender: "", // Cinsiyet filtresi eklendi
  });

  // Şehir seçimi için ek state'ler
  const [cities, setCities] = useState([]);
  const [citySearch, setCitySearch] = useState("");
  const [isCityOpen, setIsCityOpen] = useState(false);

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
    // Önce dil ve şehir listesini çek, sonra ilanları yükle
    Promise.all([fetchLanguages(), fetchCities()]).then(() =>
      fetchTranslators(),
    );

    if (userRole === "Customer") {
      fetchFavorites();
    }
  }, [userRole]);

  // Şehirleri backend'den çeken fonksiyon
  const fetchCities = async () => {
    try {
      const res = await getCities();
      const cityData = res.data?.data || res.data || [];
      setCities(cityData);
    } catch (err) {
      console.error("Şehirler yüklenirken hata:", err);
    }
  };

  // Tüm dilleri backend'den çekip { id: isim } map'i oluşturur
  const fetchLanguages = async () => {
    try {
      const langs = await getLanguages();
      const map = {};
      (langs || []).forEach((l) => {
        map[l.id] = l.name || l.languageName || l.language || "?";
      });
      setLanguageMap(map);
      setRawLanguages(langs || []);
      return map;
    } catch (err) {
      console.error("Diller yüklenirken hata:", err);
      return {};
    }
  };

  // Çevirmen listesini backend'den çeken fonksiyon
  const fetchTranslators = async () => {
    try {
      setLoading(true);
      const resData = await getListings(1, 100);

      // Paged yapı: resData = { items, totalCount, ... }
      const items = resData?.items || (Array.isArray(resData) ? resData : []);

      const mappedTranslators = items.map((listing) => ({
        id: listing.userId,
        listingId: listing.id,
        fullName: listing.translatorName || listing.name || "Çevirmen",
        bio: listing.description || "",
        listingNo: listing.listingNo || listing.id,
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
          if (!g || g === "" || g === 0 || g === "0" || g === "NotSpecified")
            return "Belirtilmedi";
          if (g === "Male" || g === "male" || g === 1 || String(g) === "1")
            return "Erkek";
          if (g === "Female" || g === "female" || g === 2 || String(g) === "2")
            return "Kadın";
          return g;
        })(),
        phone: listing.phone || "Belirtilmedi",
        photoUrl: (() => {
          if (listing.images && listing.images.length > 0) {
            return `${listing.images[0]}?v=${Date.now()}`;
          }
          if (listing.translatorPhotoUrl) {
             return `${listing.translatorPhotoUrl}?v=${Date.now()}`;
          }
          return `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.translatorName || "Çevirmen")}&background=random`;
        })(),
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

      // Filter servisini çağır
      const resData = await filterListings(cleanParams);

      const items = resData?.items || (Array.isArray(resData) ? resData : []);

      const mappedTranslators = items.map((listing) => ({
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
        photoUrl: (() => {
          if (listing.images && listing.images.length > 0) {
            return `${listing.images[0]}?v=${Date.now()}`;
          }
          if (listing.translatorPhotoUrl) {
             return `${listing.translatorPhotoUrl}?v=${Date.now()}`;
          }
          return `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.translatorName || "Çevirmen")}&background=random`;
        })(),
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
    } catch (error) {
      console.error("Filtreleme sırasında hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await getCustomerFavorites();
      // Axios interceptor veriyi direkt dönebilir (array olarak), veya sarmalanmış olabilir:
      const resData = response?.data?.data || response?.data || (Array.isArray(response) ? response : []);
      // Gelen favori listesinden İlan ID'lerini (ListingId) bir diziye çevir
      const fvIds = resData.map((fav) => fav.listingId || fav.id);
      setFavoriteIds(fvIds);
    } catch (error) {
      console.error("Favoriler yüklenirken hata:", error);
    }
  };

  // ---------------------------------------------------------------------------------
  // FAVORİYE EKLE / ÇIKAR (KALP İKONUNA TIKLAMA) İŞLEMİ
  // ---------------------------------------------------------------------------------
  const toggleFavorite = async (listingId) => {
    const isAlreadyFavorite = favoriteIds.includes(listingId);

    try {
      if (isAlreadyFavorite) {
        // Zaten favoriyse => Çıkar
        await removeFavoriteTranslator(listingId);
        // Frontend'deki listeyi de güncelle (Tıklananı diziden çıkar)
        setFavoriteIds((prevIds) => prevIds.filter((id) => id !== listingId));
      } else {
        // Favori değilse => Ekle
        await addFavoriteTranslator(listingId);
        // Frontend'deki listeye tıklananı ekle
        setFavoriteIds((prevIds) => [...prevIds, listingId]);
      }
    } catch (error) {
      const backendMsg = error.response?.data?.message || error.message || "Bilinmeyen sunucu hatası";
      console.error("Favori işlemi sırasında hata:", backendMsg, error.response?.data);
      alert(`Favori işlemi başarısız oldu:\n${backendMsg}`);
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
          className="container home-main-layout"
          style={{
            display: "flex",
            gap: "clamp(15px, 3vw, 30px)",
            padding: "40px 20px",
          }}
        >
          {/* SOL: FİLTRELEME ALANI (Kullanıcının Çizdiği Mavi Alan) */}
          <aside
            className="glass-panel home-sidebar"
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

              {/* Aramalı Şehir Seçici (Özel) */}
              <div
                className="custom-city-dropdown"
                style={{ position: "relative", marginTop: "5px" }}
              >
                <div
                  className={`city-active-tab ${isCityOpen ? "open" : ""}`}
                  onClick={() => setIsCityOpen(!isCityOpen)}
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    background: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.95rem",
                    transition: "all 0.2s",
                  }}
                >
                  {filterParams.city
                    ? cities.find((c) => c.id === filterParams.city)?.name ||
                      cities.find((c) => c.name === filterParams.city)?.name ||
                      filterParams.city
                    : "Tüm Şehirler"}
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "#888",
                      transition: "transform 0.2s",
                      transform: isCityOpen ? "rotate(180deg)" : "none",
                    }}
                  >
                    ▼
                  </span>
                </div>

                {isCityOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 5px)",
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #ddd",
                      borderRadius: "10px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      zIndex: 1000,
                      overflow: "hidden",
                      animation: "fadeIn 0.2s ease-out",
                    }}
                  >
                    <input
                      type="text"
                      autoFocus
                      placeholder="Şehir ara..."
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "none",
                        borderBottom: "1px solid #f0f0f0",
                        fontSize: "0.9rem",
                        outline: "none",
                        background: "#fcfcfc",
                      }}
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                      <div
                        style={{
                          padding: "10px 15px",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        className="city-option"
                        onClick={() => {
                          setFilterParams((prev) => ({ ...prev, city: "" }));
                          setIsCityOpen(false);
                          setCitySearch("");
                        }}
                      >
                        Tüm Şehirler
                      </div>
                      {cities
                        .filter((c) =>
                          c.name
                            .toLowerCase()
                            .includes(citySearch.toLowerCase()),
                        )
                        .map((c) => (
                          <div
                            key={c.id}
                            style={{
                              padding: "10px 15px",
                              fontSize: "0.9rem",
                              cursor: "pointer",
                              transition: "background 0.15s",
                              backgroundColor:
                                filterParams.city === c.id ||
                                filterParams.city === c.name
                                  ? "#f0f7ff"
                                  : "transparent",
                              color:
                                filterParams.city === c.id ||
                                filterParams.city === c.name
                                  ? "#4f46e5"
                                  : "#444",
                            }}
                            className="city-option"
                            onClick={() => {
                              setFilterParams((prev) => ({
                                ...prev,
                                city: c.id,
                              }));
                              setIsCityOpen(false);
                              setCitySearch("");
                            }}
                          >
                            {c.name}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <style>{`
                .city-option:hover { background-color: #f0f7ff !important; color: #4f46e5 !important; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
              `}</style>
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
                name="gender"
                value={filterParams.gender}
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
                <option value="1">Erkek</option>
                <option value="2">Kadın</option>
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
              className="home-search-bar"
              style={{
                display: "flex",
                flexWrap: "wrap",
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
                placeholder="İlan ara..."
                style={{
                  flex: "1 1 200px",
                  padding: "12px 15px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  outline: "none",
                }}
              />
              <button
                style={{
                  flex: "1 1 100px",
                  padding: "12px 25px",
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
                Bul
              </button>

              {/* Görünüm Değiştirici (View Switcher) Butonları */}
              <div
                style={{
                  display: "flex",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  overflow: "hidden",
                  marginLeft: "auto",
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
                        const isFavorite = favoriteIds.includes(
                          translator.listingId || translator.id,
                        );

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

                                    {/* Yatay Modda Dil Bilgisi */}
                                    {viewMode === "horizontal" &&
                                      translator.languages &&
                                      translator.languages.length > 0 && (
                                        <div
                                          style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "5px",
                                            marginLeft: "10px",
                                          }}
                                        >
                                          <strong style={{ whiteSpace: "nowrap" }}>
                                            Diller:
                                          </strong>
                                          {translator.languages.map(
                                            (lang, idx) => (
                                              <span
                                                key={idx}
                                                style={{
                                                  background: "#f0f7ff",
                                                  padding: "2px 8px",
                                                  borderRadius: "10px",
                                                  fontSize: "0.75rem",
                                                  color: "#0099db",
                                                  border: "1px solid #d0e8ff",
                                                }}
                                              >
                                                {lang.sourceLanguage} →{" "}
                                                {lang.targetLanguage}
                                              </span>
                                            ),
                                          )}
                                        </div>
                                      )}
                                  </div>

                                  {/* Galeri Modunda Dil Bilgisi (İşaretlenen Alana) */}
                                  {viewMode === "gallery" &&
                                    translator.languages &&
                                    translator.languages.length > 0 && (
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "center",
                                          flexWrap: "wrap",
                                          gap: "5px",
                                          marginBottom: "15px",
                                        }}
                                      >
                                        {translator.languages.map((lang, idx) => (
                                          <span
                                            key={idx}
                                            style={{
                                              background: "#f0f7ff",
                                              padding: "3px 10px",
                                              borderRadius: "12px",
                                              fontSize: "0.75rem",
                                              color: "#0099db",
                                              border: "1px solid #d0e8ff",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {lang.sourceLanguage} →{" "}
                                            {lang.targetLanguage}
                                          </span>
                                        ))}
                                      </div>
                                    )}

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
                                  {/* KALP BUTONU (SADECE CUSTOMER) */}
                                  {userRole === "Customer" && (
                                    <button
                                      onClick={() =>
                                        toggleFavorite(
                                          translator.listingId || translator.id,
                                        )
                                      }
                                      title={
                                        isFavorite
                                          ? "Favorilerden Çıkar"
                                          : "Favoriye Ekle"
                                      }
                                      style={{
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "transform 0.2s",
                                        // Galeri modunda kartın sol üstüne yerleştir
                                        ...(viewMode === "gallery" && {
                                          position: "absolute",
                                          top: "10px",
                                          right: "10px",
                                          zIndex: 2,
                                        }),
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
                                      {isFavorite ? (
                                        // Dolu kırmızı kalp
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 24 24"
                                          width="28"
                                          height="28"
                                        >
                                          <path
                                            fill="#dc3545"
                                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                          />
                                        </svg>
                                      ) : (
                                        // Boş outline kalp (siyah çizgi)
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 24 24"
                                          width="28"
                                          height="28"
                                        >
                                          <path
                                            fill="none"
                                            stroke="#555"
                                            strokeWidth="1.8"
                                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                          />
                                        </svg>
                                      )}
                                    </button>
                                  )}
                                  {/* İLANI İNCELE BUTONU */}
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
                                  {/* %100 DOĞRULANMIŞ (BUTONUN ALTINDA) */}
                                  <div
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#999",
                                      textAlign: "center",
                                    }}
                                  >
                                    %100 Doğrulanmış
                                  </div>
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
