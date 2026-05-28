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

// 2.2 YANIT (RESPONSE) INTERCEPTOR'I (ApiResponse Unwrapper & Error Handler)
api.interceptors.response.use(
  (response) => {
    // Backend ApiResponse<T> sarmalayıcısı kullanıyor: { success, data, message, errors }
    // Eğer cevap bu formattaysa direkt 'data' kısmını döndür ki sayfalar uğraşmasın.
    if (
      response.data &&
      Object.prototype.hasOwnProperty.call(response.data, "success")
    ) {
      // Eğer backend sadece success:true döndüyse ve data yoksa undefined dönmemesi için:
      return response.data.data !== undefined
        ? response.data.data
        : response.data;
    }
    return response.data || response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 Yetki Hatası (Token Yenileme Mantığı)
    if (error.response?.status === 401 && !originalRequest._retry) {
      const token = localStorage.getItem("token");
      // 🔥 MOCK TOKEN KONTROLÜ: Eğer mock token kullanıyorsak yenileme yapma ve yönlendirme
      if (token && token.startsWith("mock-")) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const currentRefreshToken = localStorage.getItem("refreshToken");
        if (!currentRefreshToken) return Promise.reject(error);

        // Kendi api instance'ımızı değil, axios'u direkt kullanıyoruz (döngü engelleme)
        const res = await axios.post("/api/auth/refresh", {
          refreshToken: currentRefreshToken,
        });

        const responseData = res.data?.data || res.data;
        const newAccessToken = responseData?.accessToken;

        if (newAccessToken) {
          localStorage.setItem("token", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Hata mesajını daha okunabilir yap (ApiResponse içindeki message'ı önceliklendir)
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Bilinmeyen bir hata oluştu";

    return Promise.reject({
      ...error,
      message: errorMessage,
      details: errorData?.errors,
    });
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

// Çevirmenleri listeleme (Anasayfada vitrin için).
// NOT: Backend'de henüz /public/translators yok, bu yüzden /Listings kullanıyoruz.
export const getTranslators = (params) => api.get("/Listings", { params });

// Sayfalı ilan listesi getirir
// Endpoint: GET /Listings
export const getListings = async (page = 1, pageSize = 10, sort = null) => {
  const data = await api.get("/Listings", {
    params: { page, pageSize, sort },
  });

  // 'data' artık otomatik açılmış PagedResultDto: { items: [], totalCount: 0, ... }
  if (data?.items && Array.isArray(data.items)) {
    data.items.forEach((item) => {
      // Değişik veri isimlerine karşı dirençli yapıyoruz
      item.phoneNumber = item.phoneNumber || item.phone || "";
    });
  }
  return data;
};

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

// Konuşma listesini getirir.
// Endpoint: GET /api/conversations
export const getConversations = () => api.get("/conversations");

// Yeni bir konuşma başlatır veya mevcut olanın ID'sini döner.
// Endpoint: POST /api/conversations/start?receiverId={receiverId}
export const startConversation = (receiverId) =>
  api.post(`/conversations/start?receiverId=${receiverId}`);

// Belirli bir konuşmanın mesajlarını listelemesi.
// Endpoint: GET /api/messages/{conversationId}
export const getTranslatorMessages = (conversationId) =>
  api.get(`/messages/${conversationId}`);

// ---------------------------------------------------------
// YENİ EKLENEN PROFİL VE İLAN İŞLEMLERİ (1️⃣ Tercüman İlan Sistemi)
// ---------------------------------------------------------

// Çevirmenin kendi profil/ilan bilgilerini getirmesi. (Düzeltme: Backend /api/users/profile bekliyor)
// Endpoint: GET /users/profile
export const getTranslatorProfile = async () => {
  const data = await api.get("/users/profile");
  if (data) {
    data.phoneNumber = data.phoneNumber || data.phone || "";
  }
  return data;
};

// Çevirmenin kendi profil bilgilerini oluşturması veya güncellemesi. (Düzeltme: Backend /api/users/profile bekliyor)
// Endpoint: PUT /users/profile
export const updateTranslatorProfile = (data) =>
  api.put("/users/profile", data);

// Şifre değiştirme.
// Endpoint: POST /users/change-password
export const changePassword = (data) =>
  api.post("/users/change-password", data);

// Profil fotoğrafı yükleme. (Düzeltme: Backend /api/users/profile/image bekliyor)
// Endpoint: POST /users/profile/image
export const uploadProfileImage = (formData) =>
  api.post("/users/profile/image", formData, {
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

// Endpoint: PUT /Notifications/{messageId}/read (Düzeltme: Backend {messageId} bekliyor)
export const markNotificationAsRead = (messageId) =>
  api.put(`/Notifications/${messageId}/read`);

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

// İlan detayını getiren yardımcı (Eğer sarmalayıcıyı aşmak gerekirse diye)
export const getListingDetail = (id) => api.get(`/Listings/${id}`);

// ==============================================================================
// 🛒 CUSTOMER (MÜŞTERİ) PANELİ İŞLEMLERİ (3️⃣ Favori Sistemi)
// ==============================================================================

// Müşterinin bir çevirmeni favorilerine eklemesi (Kalp ikonuna tıklanınca). (Düzeltme: Backend /api/Favorites/{listingId} bekliyor)
// Endpoint: POST /Favorites/{listingId}
export const addFavoriteTranslator = (listingId) =>
  api.post(`/Favorites/${listingId}`, {});

// Müşterinin bir çevirmeni favorilerinden çıkarması (Kalp tikini kaldırınca). (Düzeltme: Backend /api/Favorites/{listingId} bekliyor)
// Endpoint: DELETE /Favorites/{listingId}
export const removeFavoriteTranslator = (listingId) =>
  api.delete(`/Favorites/${listingId}`);

// Müşterinin kendi favoriye eklediği tüm çevirmenlerin listesini getirmesi. (Düzeltme: Backend /api/Favorites bekliyor)
// Endpoint: GET /Favorites
export const getCustomerFavorites = async () => {
  const data = await api.get("/Favorites");
  if (Array.isArray(data)) {
    data.forEach((item) => {
      if (item) item.phoneNumber = item.phoneNumber || item.phone || "";
    });
  }
  return data;
};

// Müşterinin kendi profil bilgilerini getirmesi. (Düzeltme: Backend /api/users/profile kullanıyor)
// Endpoint: GET /users/profile
export const getCustomerProfile = async () => {
  const data = await api.get("/users/profile");
  if (data) {
    data.phoneNumber = data.phoneNumber || data.phone || "";
  }
  return data;
};

// Müşterinin kendi profilini güncellemesi. (Düzeltme: Backend /api/users/profile kullanıyor)
// Endpoint: PUT /users/profile
export const updateCustomerProfile = (data) => api.put("/users/profile", data);

// ==============================================================================
// 👑 ADMIN PANELİ İŞLEMLERİ (Ayrı Katman Gereksinimleri)
// ==============================================================================

// Admin dashboard verilerini (genel istatistikler) getirir.
// Endpoint: GET /api/admin/stats
export const getAdminDashboard = () => api.get("/admin/stats");

// Sistemdeki tüm kullanıcıları listeler (Yönetim için).
// Endpoint: GET /api/admin/users
export const getAdminUsers = () => api.get("/admin/users");

// Bir kullanıcının rolünü değiştirir (Admin, Translator, Customer).
// Endpoint: PUT /api/admin/users/role
export const changeUserRole = (data) => api.put("/admin/users/role", data);

// Bir kullanıcıyı aktif veya pasif duruma getirir (Banlama/Açma).
// Endpoint: PUT /api/admin/users/{id}/toggle-status
export const toggleUserActiveStatus = (id) =>
  api.put(`/admin/users/${id}/toggle-status`);

// 👑 ADMIN MESSAGES & REPORTS
// Sistemdeki tüm mesajlaşmaları listeler (Audit).
export const getAdminMessages = () => api.get("/admin/messages");

// Tüm şikayet raporlarını listeler.
export const getAllReports = () => api.get("/admin/reports");

// Bir şikayeti çözüldü olarak işaretler.
export const resolveReport = (id) => api.put(`/admin/reports/${id}/resolve`);

export default api;
