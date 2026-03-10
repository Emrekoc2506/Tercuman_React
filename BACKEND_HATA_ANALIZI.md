# 🚨 Backend Ekibi İçin Hata Raporu: 401 Unauthorized Sorunu

**Sorun:**
Kullanıcı giriş yaptıktan belli bir süre sonra (yaklaşık 15 dakika) `/api/Notifications` ve diğer yetki gerektiren tüm API istekleri `401 Unauthorized` hatası vermeye başlıyor.

Frontend tarafındaki Axios Interceptor (otomatik yenileyici ajan) bu hatayı yakalıyor, ancak yeni bir token alamadığı için hata konsola düşüyor ve sistem kilitleniyor.

**Yapılan Hata Analizi ve Tespit Edilen Eksikler:**

Backend (TercumanAPI) kodlarını detaylı incelediğimizde sorunun temel kaynağı **Refresh Token (Yenileme Jetonu) mimarisinin backend tarafında hiç uygulanmamış olmasıdır.**

Aşağıdaki darboğazlar ve eksikler tespit edilmiştir:

### 1. Token Süresi Çok Kısa (`appsettings.json`)

Backend projenizin `appsettings.json` dosyasında JWT ömrü **15 dakika** olarak ayarlanmış:

```json
"Jwt": {
  "Key": "THIS_IS_A_SUPER_SECRET...",
  "Issuer": "TercumanAPI",
  "Audience": "TercumanClient",
  "ExpiryMinutes": "15"  // <---- 15 dakika sonra token ölüyor.
}
```

15 dakika sonra token geçerliliğini yitirdiği için `[Authorize]` etiketli tüm Controller'lar (örn. `NotificationsController`) haklı olarak 401 döndürüyor.

### 2. Login İşleminde Sadece Access Token Dönüyor (`AuthController.cs` & `AuthService.cs`)

Frontend `LoginPage.jsx` dosyası giriş yaptıktan sonra hem `token` hem de `refreshToken` bekliyor:

```javascript
// Frontend Beklentisi:
const incomingRefreshToken = responseData.refreshToken;
if (incomingRefreshToken)
  localStorage.setItem("refreshToken", incomingRefreshToken);
```

Fakat backend'in `AuthController.cs > Login` ve `AuthService.cs > LoginAsync` metoduna bahktığımızda sadece tek bir string döndüğünü görüyoruz:

```csharp
// Backend mevcut durum:
return Ok(new {
    success = true,
    token // Sadece 15 dakikalık access token dönüyor. Refresh token yok!
});
```

### 3. Refresh Endpoint'i Bulunmuyor (`AuthController.cs`)

Frontend tarafında 401 hatası alındığında arka planda sessizce şu adrese istek atılmak üzere tasarlandı:
`POST /api/auth/refresh`
Fakat C# projesi içerisinde `/refresh` endpoint'ini karşılayacak hiçbir Controller/Metot bulunmamakta.

---

## 🛠 Çözüm İçin Backend Ekibinden Beklenen Eklentiler:

Frontend ve Backend'in senkronize çalışabilmesi ve kullanıcıların 15 dakikada bir sistemden atılmasını engellemek için aşağıdaki adımların uygulanması rica olunur:

1. **`LoginDto` / `TokenDto` Güncellemesi:**
   `LoginAsync` metodu sadece `string` dönmek yerine bir nesne dönmelidir.
   `{ AccessToken: "...", RefreshToken: "..." }`

2. **Refresh Token Üretimi:**
   `AuthService` içinde JWT Access token üretilirken, rastgele bir string (Guid veya kriptografik) olarak `RefreshToken` üretilmeli ve bu token veritabanında kullanıcı (User nesnesi) üzerine, bitiş tarihi ile birlikte (örn: 7 gün) kaydedilmelidir.

3. **Yenileme Endpoint'i (`/api/auth/refresh`):**
   `AuthController` içerisine `[HttpPost("refresh")]` metodu eklenmeli. Bu metot, frontend'den gelen geçerli `RefreshToken`'i alıp, veritabanından doğrulamalı ve kullanıcıya YENİ bir `AccessToken` (ve opsiyonel olarak yeni bir refresh token) dönmelidir.

> **Geçici Çözüm (Aksi Halde Geliştirme Yapılamıyorsa):**
> Eğer şu aşamada Refresh Token kodlanamıyorsa, geçici olarak `appsettings.json` içindeki `"ExpiryMinutes"` değerini `"15"` yerine `"10080"` (7 gün) veya çok daha yüksek bir sayıya çekerek 401 hatalarının önü geçici süreyle kesilebilir.
