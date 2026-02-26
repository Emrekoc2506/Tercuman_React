# Backend Ekibi İçin Geliştirme Talepleri (MiftahTEA)

Frontend uygulamasının (Home, Translator Dashboard, vb.) tam fonksiyonlu çalışabilmesi için aşağıdaki endpoint güncellemelerine ihtiyaç vardır.

## 1. Public Controller (`MiftahTEA/Controllers/PublicController.cs`)

**Endpoint:** `GET /api/public/translators`

**Mevcut Durum:**
Şu anda sadece `Id` ve `FullName` dönüyor.

**İstenen Değişiklik:**
Frontend'in çevirmen kartlarını doldurabilmesi için `Bio` ve `Languages` (Kaynak-Hedef dil çiftleri) bilgilerine ihtiyacı var.

Lütfen `GetTranslators` metodundaki `Select` sorgusunu şu şekilde güncelleyin:

```csharp
// ÖRNEK KOD
.Select(u => new
{
    u.Id,
    u.FullName,
    u.Bio, // EKLENDİ
    // Diller listesi mapping'i EKLENDİ
    languages = u.TranslatorLanguagePairs.Select(lp => new {
        sourceLanguage = lp.SourceLanguage.Code, // Örn: "TR"
        targetLanguage = lp.TargetLanguage.Code  // Örn: "EN"
    }).ToList()
})
```

## 2. CORS Ayarları (`Program.cs`)

Frontend `localhost:5173` üzerinden çalıştığı için, backend `Program.cs` dosyasında bu origin'e izin verilmelidir.

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.WithOrigins("http://localhost:5173")
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .AllowCredentials();
        });
});

// ... app.Build() sonrası:
app.UseCors("AllowAll");
```

## 3. Translator Language Management (`TranslatorController` veya `PublicController`)

**Endpoint:** `PUT /api/translator/languages` ve `POST /api/translator/languages`

Frontend tarafında dil ekleme/güncelleme formları hazır. Bu endpointlerin şu DTO'yu kabul ettiğinden emin olun:

```json
{
  "sourceLanguageId": "GUID",
  "targetLanguageId": "GUID",
  "basePrice": 100.0,
  "priceDescription": "1000 karakter başı"
}
```

## 4. Veritabanı (Migration)

Proje ilk ayağa kalktığında `MiftahDb` veritabanının oluştuğundan ve `Roles` tablosunda "Admin", "Translator", "Customer" verilerinin bulunduğundan emin olunmalıdır.
