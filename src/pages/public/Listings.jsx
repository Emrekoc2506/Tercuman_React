import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getListings,
  filterListings,
  getLanguages,
  getCities,
} from "../../services/api";
import "../../css/listings.css";

const Listings = () => {
  const navigate = useNavigate();

  // --- STATE (DURUM) YÖNETİMİ ---
  // API'den gelen verileri saklıyoruz
  const [listings, setListings] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- SAYFALAMA STATE'LERİ ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 9; // Her sayfada 9 ilan gösterelim

  // Müşterinin seçtiği filtre kriterleri
  const [filters, setFilters] = useState({
    sourceLanguageId: "",
    targetLanguageId: "",
    cityId: "",
    serviceType: "",
    minPrice: "",
    maxPrice: "",
  });

  // Şehir seçici için ek state'ler
  const [citySearch, setCitySearch] = useState("");
  const [isCityOpen, setIsCityOpen] = useState(false);

  // 1. Sayfa ilk açıldığında Dilleri ve Şehirleri çek (Filtre Paneli İçin)
  // Ayrıca hiçbir filtre yokken tüm aktif ilanları da çekelim
  useEffect(() => {
    fetchInitialData();
  }, []);

  // 🔄 Sayfa yüklendiğinde temel verileri çek
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Dilleri, Şehirleri ve ilk ilanları paralel olarak çek
      const [languagesData, citiesData, pagedData] = await Promise.all([
        getLanguages(),
        getCities(),
        getListings(1, pageSize),
      ]);

      setLanguages(languagesData || []);
      setCities(citiesData || []);

      // İlanları ve sayfalama bilgilerini set et
      const items = pagedData?.items || [];
      const total = pagedData?.totalCount || items.length;

      // Cache busting: Fotoğraf URL'lerine zaman damgası ekle
      const timestamp = Date.now();
      const updatedItems = items.map((item) => ({
        ...item,
        translatorPhotoUrl: item.translatorPhotoUrl
          ? `${item.translatorPhotoUrl}?v=${timestamp}`
          : item.translatorPhotoUrl,
      }));

      setListings(updatedItems);
      setTotalPages(Math.ceil(total / pageSize) || 1);
      setPage(1); // İlk yüklemede her zaman 1. sayfayı göster
    } catch (error) {
      console.error("Veriler alınırken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Filtre seçenekleri değiştiğinde state'i güncelle
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // 3. 'Filtrele' butonuna basılınca çalışan fonksiyon
  // Oluşan filtre değerleriyle (params) backend'e istek atıp sonuçları güncelleriz
  const applyFilters = async (targetPage = 1) => {
    setLoading(true);
    try {
      const activeFilters = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key]) activeFilters[key] = filters[key];
      });

      let pagedData;
      if (Object.keys(activeFilters).length > 0) {
        pagedData = await filterListings({
          ...activeFilters,
          page: targetPage,
          pageSize,
        });
      } else {
        pagedData = await getListings(targetPage, pageSize);
      }

      // Interceptor veriyi zaten açtı: items, totalCount...
      const items = pagedData?.items || [];
      const total = pagedData?.totalCount || items.length;

      // Cache busting: Fotoğraf URL'lerine zaman damgası ekle
      const timestamp = Date.now();
      const updatedItems = items.map((item) => ({
        ...item,
        translatorPhotoUrl: item.translatorPhotoUrl
          ? `${item.translatorPhotoUrl}?v=${timestamp}`
          : item.translatorPhotoUrl,
      }));

      setListings(updatedItems);
      setTotalPages(Math.ceil(total / pageSize) || 1);
      setPage(targetPage);
    } catch (error) {
      console.error("İlanlar filtrelenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa değiştirme fonksiyonu
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      applyFilters(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" }); // Sayfa değişince en üste kaydır
    }
  };

  // 4. İlan Kartına tıklandığında Detay Sayfasına Yönlendirme
  const goToDetail = (id) => {
    navigate(`/listings/${id}`);
  };

  return (
    <div className="listings-page-container">
      {/* SOL: FİLTRE PANELİ */}
      <aside className="filter-sidebar">
        <h3>Gelişmiş Filtreleme</h3>

        {/* Kaynak Dil Filtresi */}
        <div className="filter-group">
          <label>Kaynak Dil</label>
          <select
            name="sourceLanguageId"
            value={filters.sourceLanguageId}
            onChange={handleFilterChange}
          >
            <option value="">Tümü</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Hedef Dil Filtresi */}
        <div className="filter-group">
          <label>Hedef Dil</label>
          <select
            name="targetLanguageId"
            value={filters.targetLanguageId}
            onChange={handleFilterChange}
          >
            <option value="">Tümü</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Şehir Filtresi (Özel Aramalı Tip) */}
        <div className="filter-group city-searchable-container">
          <label>Şehir</label>
          <div className="custom-city-dropdown">
            <div
              className={`city-active-tab ${isCityOpen ? "open" : ""}`}
              onClick={() => setIsCityOpen(!isCityOpen)}
            >
              {filters.cityId
                ? cities.find((c) => c.id === filters.cityId)?.name ||
                  "Şehir Seçiliyor..."
                : "Tüm Şehirler"}
              <span className="dropdown-arrow">▼</span>
            </div>

            {isCityOpen && (
              <div className="city-dropdown-content">
                <input
                  type="text"
                  autoFocus
                  placeholder="Şehir ara..."
                  className="city-search-input"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="city-options-list">
                  <div
                    className="city-option"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, cityId: "" }));
                      setIsCityOpen(false);
                      setCitySearch("");
                    }}
                  >
                    Tüm Şehirler
                  </div>
                  {cities
                    .filter((c) =>
                      c.name.toLowerCase().includes(citySearch.toLowerCase()),
                    )
                    .map((c) => (
                      <div
                        key={c.id}
                        className={`city-option ${filters.cityId === c.id ? "selected" : ""}`}
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, cityId: c.id }));
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
        </div>

        {/* Hizmet Türü Filtresi (Backend'deki ServiceType Enum ile uyumlu) */}
        <div className="filter-group">
          <label>Hizmet Türü</label>
          <select
            name="serviceType"
            value={filters.serviceType}
            onChange={handleFilterChange}
          >
            <option value="">Fark Etmez</option>
            <option value={1}>Sadece Online</option>
            <option value={2}>Sadece Yüz Yüze</option>
            <option value={3}>Online + Yüz Yüze</option>
          </select>
        </div>

        {/* Fiyat Aralığı */}
        <div className="filter-group price-range">
          <label>Fiyat Aralığı (TL)</label>
          <div className="inputs">
            <input
              type="number"
              name="minPrice"
              placeholder="Min"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
            <span>-</span>
            <input
              type="number"
              name="maxPrice"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        {/* Filtre Uygula Butonu */}
        <button className="btn-apply-filters" onClick={() => applyFilters(1)}>
          Sonuçları Göster
        </button>

        {/* Filtreleri Temizle Butonu */}
        <button
          className="btn-clear-filters"
          onClick={() => {
            setFilters({
              sourceLanguageId: "",
              targetLanguageId: "",
              cityId: "",
              serviceType: "",
              minPrice: "",
              maxPrice: "",
            });
            setTimeout(applyFilters, 100); // Temizledikten sonra tümünü getir
          }}
        >
          Filtreleri Temizle
        </button>
      </aside>

      {/* SAĞ: İLAN SONUÇLARI */}
      <main className="listings-content">
        <div className="listings-header">
          <h2>Çevirmen İlanları</h2>
          <span className="results-count">
            ({listings.length} İlan Bulundu)
          </span>
        </div>

        {loading ? (
          <div className="loading-spinner">İlanlar yükleniyor...</div>
        ) : listings.length === 0 ? (
          <div className="no-results">
            Bu kriterlere uygun ilan bulunamadı. Lütfen filtrelerinizi
            değiştirin.
          </div>
        ) : (
          <div className="listings-grid">
            {/* API'den gelen ilan (Listing) listesini dönüyoruz */}
            {listings.map((listing) => {
              // Backend'den 'enum' olarak sayı dönebilir. Kullanıcıya özel metin gösterelim.
              const svcTypeText =
                listing.serviceType === 1
                  ? "Online"
                  : listing.serviceType === 2
                    ? "Yüz Yüze"
                    : "Hibrit";

              const genderText =
                listing.gender === "Male" ||
                listing.gender === "1" ||
                listing.gender === 1
                  ? "Erkek 👨"
                  : listing.gender === "Female" ||
                      listing.gender === "2" ||
                      listing.gender === 2
                    ? "Kadın 👩"
                    : null;

              return (
                <div
                  key={listing.id}
                  className="listing-card"
                  onClick={() => goToDetail(listing.id)}
                >
                  {/* Profil / İlan Görseli Kısmı */}
                  <div className="card-image">
                    {listing.translatorPhotoUrl ? (
                      <img
                        src={listing.translatorPhotoUrl}
                        alt={listing.translatorName}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <span
                      className="placeholder-icon"
                      style={{
                        display: listing.translatorPhotoUrl ? "none" : "flex",
                      }}
                    >
                      👤
                    </span>

                    {/* İlan Numarası Rozeti (Yeni) */}
                    <div className="listing-no-badge">#{listing.listingNo}</div>
                  </div>

                  {/* İlan Bilgileri Ksımı */}
                  <div className="card-body">
                    <h4 className="card-title">{listing.title}</h4>

                    {/* Çevirmen adı backend DTO'sundan 'translatorName' olarak geliyor */}
                    <p className="card-author">
                      {listing.translatorName || "Bilinmeyen Çevirmen"}
                    </p>

                    {/* Hizmet Türü ve Şehir Etiketleri */}
                    <div className="card-tags">
                      <span className="tag">{svcTypeText}</span>
                      {listing.city && (
                        <span className="tag">📍 {listing.city}</span>
                      )}
                      {listing.createdAt && (
                        <span className="tag">
                          📅{" "}
                          {new Date(listing.createdAt).toLocaleDateString(
                            "tr-TR",
                          )}
                        </span>
                      )}
                      {genderText && <span className="tag">{genderText}</span>}
                    </div>

                    {/* Fiyat Ksımı (Sağ altta büyükçe) */}
                    <div className="card-footer">
                      <span className="price">{listing.price} ₺</span>
                      <button className="btn-view-detail">İncele</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- SAYFALAMA (PAGINATION) KONTROLLERİ --- */}
        {!loading && totalPages > 1 && (
          <div
            className="pagination-container"
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "2rem",
              gap: "10px",
            }}
          >
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              style={{
                padding: "8px 16px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                backgroundColor: page === 1 ? "#f5f5f5" : "#fff",
                cursor: page === 1 ? "not-allowed" : "pointer",
                color: page === 1 ? "#999" : "#333",
              }}
            >
              Önceki
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontWeight: "500",
              }}
            >
              Sayfa {page} / {totalPages}
            </div>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              style={{
                padding: "8px 16px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                backgroundColor: page === totalPages ? "#f5f5f5" : "#fff",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                color: page === totalPages ? "#999" : "#333",
              }}
            >
              Sonraki
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Listings;
