# Backend Ekibi İçin Hata İnceleme Raporu

**Tarih:** 14 Nisan 2026
**Konu:** `FavoritesController` üzerinden `POST /api/Favorites/{listingId}` İsteği - HTTP 400 Bad Request Hatası

## 📌 Hata Tanımı
Frontend tarafında bir müşteri (Customer) ilan üzerindeki kalp ikonuna (Favoriye Ekle) tıkladığında aşağıdaki API çağrısı yapılmaktadır:
`POST /api/Favorites/d1ea2531-962e-42b7-8710-0768614dcf4c`

İstek başarıyla backend'e ulaşıyor ancak **HTTP 400 Bad Request** yanıtı dönüyor.

## 🔎 Yapılan Ön İnceleme

1. **Frontend Tarafı:**
   - İstek atılırken JWT (Authorization Bearer Token) başarıyla gönderilmektedir (`Customer` rolü yetkisi var).
   - `listingId` UUID (Guid) formatında doğru şekilde URL içerisinde gönderilmektedir.
   - ASP.NET Core API'ın boş POST gövdelerinde (body) sorun çıkarma ihtimaline karşı Frontend tarafından zorla `{}` (boş obje) gönderilmiştir.

2. **Backend Tarafında İncelediğimiz Yapı:**
   `FavoritesController.cs` içerisinde `AddFavorite` metodu şu şekildedir:
   ```csharp
   [HttpPost("{listingId}")]
   public async Task<IActionResult> AddFavorite(Guid listingId)
   {
       try
       {
           var userId = GetUserId();
           await _favoriteService.AddFavoriteAsync(userId, listingId);
           return Ok(ApiResponse<object>.Ok(null, "Listing added to favorites."));
       }
       catch (Exception ex)
       {
           // FRONTEND BURAYA (catch bloğu) DÜŞMÜŞ YANIT (BadRequest / 400) ALMAKTADIR.
           return BadRequest(ApiResponse<object>.Fail(ex.Message));
       }
   }
   ```

## 🛠 Backend Ekibinden Beklenen Aksiyonlar

Hatanın `AddFavoriteAsync(userId, listingId)` servisi içinden `Exception` fırlatması sebebiyle geldiği (%90) veya ASP.NET Core Model Binding sorunu sebebiyle oluştuğu öngörülmektedir. Sorunun çözümü için lütfen aşağıdaki 3 maddeyi kontrol ediniz:

1. **Service Kuralları (Business Rules):** 
   - `AddFavoriteAsync` içerisinde *"Aynı ilan daha önce eklenmiş mi?"*, *"Müşterinin yetkisi var mı?"*, *"Eklenmeye çalışılan ilan (listingId) veritabanında gerçekten var mı?"* gibi kontrollerin atıp atmadığına (Exception) bakılması rica olunur.
   - Swagger üzerinden geçerli bir müşteri token'ı ile mevcut bir `listingId` kullanıp POST işlemi test edilmelidir.

2. **Model Binding Sorunu İhtimali:**
   - Nadiren de olsa `[HttpPost("{listingId}")]` endpoint'inden Guid okurken ASP.NET Core `[FromRoute]` beklentisi içine girebilir. 
   - Denemek için parametreyi `AddFavorite([FromRoute] Guid listingId)` olarak güncelleyebilirsiniz.

3. **Loglama:** 
   - Lokal ortamınızda API'i çalıştırıp 400 hatası düştüğünde fırlayan Exception'ın `ex.Message` ve `ex.InnerException` detayına Console üzerinden bakmanız ve saptanılan hatayı gidermeniz (Örnek: Foreign Key Uyuşmazlığı) rica olunur.
