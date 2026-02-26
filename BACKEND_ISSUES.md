# Backend Issues & Frontend Integration Gaps

Frontend geliştiricisi olarak backend kodlarını incelediğimde aşağıdaki eksiklikleri ve uyumsuzlukları tespit ettim. Düzgün bir entegrasyon için bu muldeler backend ekibi tarafından düzeltilmesi gerekmektedir.

## 1. Eksik Endpoint'ler (KRİTİK)

- **Şifremi Unuttum (Forgot Password):**
  - Frontend tasarımında "Şifremi Unuttum" sayfası var ama backend `AuthController` içinde buna karşılık gelen bir endpoint yok.
  - **Gereken:** `POST /api/auth/forgot-password`

- **Çevirmen Onaylama (Approve Translator):**
  - Admin panelinde "Bekleyen Çevirmenler" listesi var ama onları **onaylayacak** (`IsTranslatorApproved = true` yapacak) bir endpoint yok.
  - `ChangeUserRole` sadece rolü değiştiriyor, onay durumunu güncellemiyor olabilir.
  - **Gereken:** `PUT /api/admin/approve-translator/{id}` veya `ToggleUserStatus` fonksiyonunun bu işi yaptığından emin olunmalı.

## 2. Veri Tutarsızlığı (BUG RİSKİ)

- **IsApproved vs IsTranslatorApproved:**
  - `User.cs` entity'sinde hem `IsApproved` hem de `IsTranslatorızApproved` alanları var.
  - `PublicController` çevirmenleri listelerken `IsApproved == true` şartına bakıyor.
  - `AdminController` dashboard ise `IsTranslatorApproved == false` olanları sayıyor.
  - **Risk:** Admin bir çevirmeni onaylasa bile (`IsTranslatorApproved = true`), eğer `IsApproved` da true yapılmazsa o çevirmen vitrinde (Public list) görünmeyebilir. Bu iki alanın mantığı birleştirilmeli veya senkronize edilmeli.

## 3. Yanlış Konumlandırılmış Endpoint'ler (Kod Kalitesi)

- **Profil Güncelleme (`UpdateProfile`):**
  - Çevirmenin kendi profilini güncellediği bu metod `TranslatorController` yerine **`AdminController`** içinde yazılmış.
  - Bu nedenle frontend şu garip adrese istek atmak zorunda kalıyor: `PUT /api/Admin/update-profile` (Halbuki rolü Translator).
  - **Öneri:** Bu metod `TranslatorController` içine taşınmalı -> `/api/translator/update-profile`.

- **Dil Yönetimi (`Update/Delete Language`):**
  - Dil ekleme (`POST`) `TranslatorController` içinde iken, güncelleme (`PUT`) ve silme (`DELETE`) **`PublicController`** içinde.
  - Bu nedenle frontend dil silmek için `DELETE /api/Public/languages/{id}` adresine gidiyor.
  - **Öneri:** Tüm dil yönetimi işlemleri `TranslatorController` altında toplanmalı.

## 4. Frontend İçin Yapılacaklar (Geçici Çözümler)

Backend düzeltilene kadar frontend (`src/services/api.js`) tarafında şu düzenlemeleri yapacağım:

- `updateTranslatorProfile` isteğini `/admin/update-profile` adresine yönlendireceğim.
- `update/deleteTranslatorLanguage` isteklerini `/public/languages` adresine yönlendireceğim.
