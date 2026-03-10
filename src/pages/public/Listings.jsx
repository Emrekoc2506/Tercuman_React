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

  // 1. Sayfa ilk açıldığında Dilleri ve Şehirleri çek (Filtre Paneli İçin)
  // Ayrıca hiçbir filtre yokken tüm aktif ilanları da çekelim
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Promise.all kullanarak çoklu API isteklerini aynı anda (paralel) yapıyoruz
      const [langRes, cityRes, listingsRes] = await Promise.all([
        getLanguages(),
        getCities(),
        getListings(1, pageSize), // Filtresiz tüm ilanları 1. sayfadan getir
      ]);

      setLanguages(langRes.data?.data || langRes.data || []);
      setCities(cityRes.data?.data || cityRes.data || []);

      const listingsData = listingsRes.data?.data || listingsRes.data || [];
      setListings(listingsData);

      // Toplam sayfa sayısını hesapla (Eğer backend totalCount dönüyorsa)
      const total = listingsRes.data?.totalCount || listingsData.length;
      setTotalPages(Math.ceil(total / pageSize) || 1);
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
      // Boş olmayan filtreleri bir obje olarak ayır (Backend sadece dolu olanları görsün)
      const activeFilters = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key]) activeFilters[key] = filters[key];
      });

      console.log(
        `Filtrelerle arama yapılıyor (Sayfa: ${targetPage}):`,
        activeFilters,
      );

      let response;
      if (Object.keys(activeFilters).length > 0) {
        response = await filterListings({
          ...activeFilters,
          page: targetPage,
          pageSize,
        });
      } else {
        response = await getListings(targetPage, pageSize);
      }

      const listingsData = response.data?.data || response.data || [];
      setListings(listingsData);

      // Toplam sayfa sayısını güncelle
      const total = response.data?.totalCount || listingsData.length;
      setTotalPages(Math.ceil(total / pageSize) || 1);
      setPage(targetPage); // Mevcut sayfayı güncelle
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

        {/* Şehir Filtresi */}
        <div className="filter-group">
          <label>Şehir</label>
          <select
            name="cityId"
            value={filters.cityId}
            onChange={handleFilterChange}
          >
            <option value="">Tümü</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
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
                  {/* Profil / İlan Görseli Kısmı (Backend'den imageURL dönüyorsa kullanılır, yoksa default resim) */}
                  <div className="card-image">
                    {/* Varsayılan Avatar (Placeholder) */}
                    <span className="placeholder-icon">👤</span>
                  </div>

                  {/* İlan Bilgileri Ksımı */}
                  <div className="card-body">
                    <h4 className="card-title">{listing.title}</h4>

                    {/* Çevirmen adı vb. backend entity'sinden 'User.FullName' olarak gelirse */}
                    <p className="card-author">
                      {listing.user?.fullName || "Bilinmeyen Çevirmen"}
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
