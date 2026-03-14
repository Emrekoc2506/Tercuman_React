import axios from "axios";

// 1. Temel yapılandırma
const api = axios.create({
  baseURL: "/api", // Proxy üzerinden gidecek
  headers: { "Content-Type": "application/json" },
});

// 2. Token'ı her isteğe otomatik ekleyen "Interceptor" (Ajan)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Tarayıcı hafızasından token'ı al
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Varsa başlığa ekle
  }
  return config;
});

// ==============================================================================
// 2.1 YANIT (RESPONSE) INTERCEPTOR'I (Otomatik Refresh Token Ajanı)
// ==============================================================================
// API'den gelen cevapları dinler. Eğer 401 (Yetkisiz - Token Süresi Dolmuş) hatası gelirse,
// arka planda sessizce yeni token alır ve yarım kalan isteği yeni token ile tekrar dener.
api.interceptors.response.use(
  (response) => {
    // İstek başarılıysa cevabı aynen geri döndür
    return response;
  },
  async (error) => {
    // Hata durumunda burası çalışır
    const originalRequest = error.config;

    // Eğer hata 401 ise (yetki hatası/token bitmiş) VE bu isteği daha önce tekrar etmediysek (_retry bayrağı yoksa)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Sonsuz döngüden kaçınmak için bu isteği "tekrarlanıyor" olarak işaretle

      try {
        // 1. Tarayıcının hafızasından mevcut Refresh Token'ı alıyoruz
        const currentRefreshToken = localStorage.getItem("refreshToken");

        if (!currentRefreshToken) {
          // Eğer refresh token yoksa (silinmiş falan olabilir), hiçbir işlem yapamayız. Hatayı fırlatmaya devam et.
          return Promise.reject(error);
        }

        console.log(
          "Token süresi dolmuş. Refresh Token kullanılarak yeni Token alınıyor...",
        );

        // 2. Yeni token almak için backend'in yenileme (refresh) servisine istek atıyoruz
        // NOT: Kendi 'api' instance'ımız yerine saf axios kullanarak atıyoruz ki, 401 hatası alırsa tekrar bu interceptor'a düşüp döngüye girmesin!
        const res = await axios.post(
          "/api/auth/refresh",
          { refreshToken: currentRefreshToken },
          {
            headers: { "Content-Type": "application/json" },
          },
        );

        if (res.data?.success) {
          // 3. Backend'den yeni bir kısa süreli accessToken geldi!
          const responseData = res.data.data || res.data;
          const newAccessToken = responseData.accessToken;

          if (newAccessToken) {
            console.log("Yeni token başarıyla alındı ve güncellendi.");
            // Yeni token'ı tarayıcının hafızasına kaydet (eski token'ın üzerine yazar)
            localStorage.setItem("token", newAccessToken);

            // 4. Yetki hatası alınarak yarım kalan asıl isteğin başlığını (Authorization) YENİ TOKEN ile değiştir
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // 5. Asıl isteği baştan gönder. Kullanıcı hiçbir şey farketmez!
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // EĞER REFRESH TOKEN DA SÜRESİNİ DOLDURDUYSA (örn. 7 gün geçmişse) veya GECERSİZSE
        console.error(
          "Refresh Token da süresini doldurmuş veya geçersiz! Lütfen tekrar giriş yapın.",
          refreshError,
        );

        // Kullanıcının güvenliği için tarayıcıda tutulan eski ve geçersiz tüm verileri temizle
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");

        // Kullanıcıyı direkt giriş sayfasına yönlendir (oturumdan atıyoruz)
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    // Gelen hata 401 değilse (mesela 500 server error veya 404 not found) hatayı fırlatmaya devam et
    return Promise.reject(error);
  },
);

// ==============================================================================
// 3. API ENDPOINT TANIMLARI (Fonksiyonlar)
// ==============================================================================

// 🔐 AUTH (Kimlik Doğrulama) İŞLEMLERİ
// Kullanıcı giriş yaparken bu fonksiyonu çağırır.
// Endpoint: POST /auth/login
export const loginUser = (data) => api.post("/auth/login", data);

// Endpoint: POST /auth/register
export const registerUser = (data) => api.post("/auth/register", data);

// Endpoint: POST /auth/forgot-password
export const forgotPassword = (data) => api.post("/auth/forgot-password", data);

// Endpoint: POST /auth/refresh (Manuel test için eklendi, otomatik interceptor da bunu yapar)
export const refreshToken = (token) =>
  api.post("/auth/refresh", `"${token}"`, {
    headers: { "Content-Type": "application/json" },
  });

// ==============================================================================
// 🌍 PUBLIC (HERKESE AÇIK) İŞLEMLER
// ==============================================================================

// Çevirmenleri listeleme (Anasayfada vitrin için). Arama, filtreleme vb. parametreleri alabilir.
// Endpoint: GET /public/translators
export const getTranslators = (params) =>
  api.get("/public/translators", { params });

// Sayfalı ilan listesi getirir
// Endpoint: GET /Listings
export const getListings = (page = 1, pageSize = 10, sort = null) =>
  api.get("/Listings", { params: { page, pageSize, sort } });

// İlanları filtreler (Dil, Şehir, Fiyat, Hizmet Türü vb.)
// Endpoint: GET /Listings/filter
export const filterListings = (filterParams) =>
  api.get("/Listings/filter", { params: filterParams });

// Tüm dilleri getirir (Dropdown için)
// Endpoint: GET /Languages
export const getLanguages = () => api.get("/Languages");

// Tüm şehirleri getirir (Dropdown için)
// Endpoint: GET /Cities
export const getCities = () => api.get("/Cities");

// Belirli bir ilanın detayını getirir
// Endpoint: GET /Listings/{id}
export const getListingById = (id) => api.get(`/Listings/${id}`);

// Yeni ilan oluşturur (Çevirmen panelinden)
// Endpoint: POST /Listings
export const createListing = (data) => api.post("/Listings", data);

// Çevirmene mesaj gönderme (Müşteri veya ziyaretçi gönderir).
// Endpoint: POST /public/contact
export const sendContactMessage = (data) => api.post("/public/contact", data);

// ==============================================================================
// 🧑‍💼 TRANSLATOR (ÇEVİRMEN) PANELİ İŞLEMLERİ
// ==============================================================================

// Çevirmen dashboard verilerini (okunmamış mesaj sayısı, dil sayısı, profil görüntülenme vs.) getirir.
// Endpoint: GET /translator/dashboard
export const getTranslatorDashboard = () => api.get("/translator/dashboard");

// Çevirmenin kendine gelen mesajları listelemesi.
// Endpoint: GET /translator/messages
export const getTranslatorMessages = () => api.get("/translator/messages");

// ---------------------------------------------------------
// YENİ EKLENEN PROFİL VE İLAN İŞLEMLERİ (1️⃣ Tercüman İlan Sistemi)
// ---------------------------------------------------------

// Çevirmenin kendi profil/ilan bilgilerini getirmesi. (Tercüman profili sekmesinde dolacak)
// Endpoint: GET /translator/profile
export const getTranslatorProfile = () => api.get("/translator/profile");

// Çevirmenin kendi profil bilgilerini oluşturması veya güncellemesi.
// Endpoint: PUT /translator/profile
export const updateTranslatorProfile = (data) =>
  api.put("/translator/profile", data);

// Profil fotoğrafı yükleme.
// Endpoint: POST /translator/profile/image
export const uploadProfileImage = (formData) =>
  api.post("/translator/profile/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Çevirmenin ilanını aktif (görünür) veya pasif (gizli) duruma getirmesi.
// Endpoint: PUT /translator/profile/toggle
export const toggleTranslatorProfileStatus = () =>
  api.put("/translator/profile/toggle");

// İlana fotoğraf yükleme.
// Endpoint: POST /Listings/{id}/images
export const uploadListingImages = (listingId, formData) =>
  api.post(`/Listings/${listingId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ---------------------------------------------------------
// YENİ EKLENEN BİLDİRİM İŞLEMLERİ (4️⃣ Bildirim Sistemi)
// ---------------------------------------------------------

// Endpoint: GET /Notifications
export const getTranslatorNotifications = () => api.get("/Notifications");

// Endpoint: PUT /Notifications/{id}/read
export const markNotificationAsRead = (id) =>
  api.put(`/Notifications/${id}/read`);

// ---------------------------------------------------------
// DİL İŞLEMLERİ
// ---------------------------------------------------------

// Çevirmenin bildiği dilleri listelemesi.
// Endpoint: GET /translator/languages
export const getTranslatorLanguages = () => api.get("/translator/languages");

// Çevirmenin yeni bir dil çifti eklemesi.
// Endpoint: POST /translator/languages
export const addTranslatorLanguage = (data) =>
  api.post("/translator/languages", data);

// Çevirmenin var olan bir dil çiftini güncellemesi.
// Endpoint: PUT /public/languages (Backend'de PublicController'da mevcut)
export const updateTranslatorLanguage = (data) =>
  api.put("/public/languages", data);

// Çevirmenin bir dil çiftini silmesi.
// Endpoint: DELETE /public/languages/{id} (Backend'de PublicController'da mevcut)
export const deleteTranslatorLanguage = (id) =>
  api.delete(`/public/languages/${id}`);

// ==============================================================================
// 🛒 CUSTOMER (MÜŞTERİ) PANELİ İŞLEMLERİ (3️⃣ Favori Sistemi)
// ==============================================================================

// Müşterinin bir çevirmeni favorilerine eklemesi (Kalp ikonuna tıklanınca).
// Endpoint: POST /customer/favorite/{translatorId}
export const addFavoriteTranslator = (translatorId) =>
  api.post(`/customer/favorite/${translatorId}`);

// Müşterinin bir çevirmeni favorilerinden çıkarması (Kalp tikini kaldırınca).
// Endpoint: DELETE /customer/favorite/{translatorId}
export const removeFavoriteTranslator = (translatorId) =>
  api.delete(`/customer/favorite/${translatorId}`);

// Müşterinin kendi favoriye eklediği tüm çevirmenlerin listesini getirmesi.
// Endpoint: GET /customer/favorites
export const getCustomerFavorites = () => api.get("/customer/favorites");

// Müşterinin kendi profil bilgilerini getirmesi.
// Endpoint: GET /customer/profile (Backend CustomerController'da mevcut)
export const getCustomerProfile = () => api.get("/customer/profile");

// Müşterinin kendi profilini güncellemesi.
// Endpoint: PUT /customer/profile (Backend CustomerController'da mevcut)
export const updateCustomerProfile = (data) =>
  api.put("/customer/profile", data);

// ==============================================================================
// 👑 ADMIN PANELİ İŞLEMLERİ
// ==============================================================================

// Admin dashboard verilerini (genel istatistikler) getirir.
// Endpoint: GET /admin/dashboard
export const getAdminDashboard = () => api.get("/admin/dashboard");

// Sistemdeki tüm kullanıcıları listeler (Yönetim için).
// Endpoint: GET /admin/users
export const getAdminUsers = () => api.get("/admin/users");

// Sistemdeki tüm mesajları görüntüler (Denetim için).
// Endpoint: GET /admin/messages
export const getAdminMessages = () => api.get("/admin/messages");

// Bir kullanıcının rolünü değiştirir (Admin, Translator, Customer).
// Endpoint: PUT /admin/users/change-role
export const changeUserRole = (data) =>
  api.put("/admin/users/change-role", data);

// Bir kullanıcıyı aktif veya pasif duruma getirir (Banlama/Açma).
// Endpoint: PUT /admin/users/toggle-active/{id}
export const toggleUserActiveStatus = (id) =>
  api.put(`/admin/users/toggle-active/${id}`);

export default api;
