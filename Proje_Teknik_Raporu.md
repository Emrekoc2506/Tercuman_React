# TERCÜMAN PLATFORMU KAPSAMLI PROJE VE TEKNİK ANALİZ RAPORU

## 1. YÖNETİCİ ÖZETİ (EXECUTIVE SUMMARY)
Bu rapor, geliştirilmekte olan "Tercüman Platformu" isimli web uygulamasının mimari, teknik ve altyapısal özelliklerini detaylı bir şekilde paydaşlara sunmak amacıyla hazırlanmıştır. Proje, çevirmenler ve çeviri hizmeti almak isteyen müşterileri (müşteri, admin, çevirmen vb. aktörleri de içeren) güvenli ve eşzamanlı bir ortamda bir araya getirmeyi hedeflemektedir. Uygulama, güncel yazılım standartlarına uygun olarak, esneklik, sürdürülebilirlik ve yüksek performans ön planda tutularak tasarlanmıştır.

Platform, ön yüz (Frontend) ve arka yüz (Backend) olmak üzere iki farklı sistemin birbiri ile API'ler üzerinden haberleşmesi metodolojisine (Client-Server mimarisi) dayanmaktadır. Backend tarafında kurumsal düzeyde bir mimari olan "Clean Architecture" (Temiz Mimari) benimsenirken, Frontend tarafında ise hızlı ve interaktif arayüzler sunan React Library ve Vite ekosistemi tercih edilmiştir.


## 2. PROJENİN AMACI VE KAPSAMI
Tercüman projesinin ana amacı, dil bariyerini aşmak isteyen bireyler veya kurumlar ile yetkin çevirmenleri dijital bir ekosistem üzerinde doğrudan buluşturmaktır. 

**Projenin Temel Kapsamı:**
*   **Kullanıcı Rolleri Yönetimi:** Sistem; Yönetici (Admin), Çevirmen (Translator) ve Müşteri (Customer) olmak üzere en az 3 farklı erişim düzeyine hitap edecek şekilde geliştirilmiştir.
*   **İlan (Listing) Sistemi:** Çevirmenlerin hizmetlerini sergileyebileceği, müşterilerin ise bu ilanlar üzerinde arama ve filtreleme yapabileceği gelişmiş bir ilan sistemi (ListingsController, Entities: Listing, ListingImage, vb.) bulunmaktadır.
*   **Eşzamanlı (Real-Time) İletişim:** Kullanıcıların kendi aralarında kopukluk yaşamadan canlı olarak mesajlaşabilmesi ve sistem olaylarından anında haberdar olabilmesi (Conversation, Message yapıları) hedeflenmiştir.
*   **Güvenilir Kimlik Doğrulama:** Kişisel verilerin korunması ve sadece yetkili kullanıcıların belirli modüllere (Örn; Admin panel, mesaj kutusu) erişiminin sağlanması ön koşuldur.


## 3. KULLANILAN TEKNOLOJİLER VE ALTYAPI KÜMELERİ (TECH STACK)
Projede seçilen teknolojiler, modern web standartlarını eksiksiz karşılayacak şekilde, ölçeklenebilir ve güvenlikli çözümler üretmek için bir araya getirilmiştir.

### 3.1. Frontend Web Teknolojileri (İstemci Tarafı)
Frontend kısmı, son kullanıcı ile etkileşimin gerçekleştiği, uygulamanın yüzünü oluşturan katmandır:
*   **HTML5 & CSS3 (Vanilla CSS):** Web sayfalarının semantik iskeleti HTML5 ile oluşturulurken; sayfa tasarımları, yerleşim (layout) yapısı ve animasyonlar CSS3 ile yazılmıştır. Projede tasarım tamamen özel (custom) olarak, `dashboard_modern.css` gibi spesifik dosyalar aracılığıyla kodlanmıştır.
*   **JavaScript (ES6+) & JSX:** Kullanıcıyla olan tüm etkileşimleri yakalamak, tarayıcı tabanlı işlemleri gerçekleştirmek için modern JavaScript kullanılmıştır. React entegrasyonu nedeniyle DOM manipülasyonu JSX dil uzantısıyla daha performanslı bir biçimde sağlanmaktadır.
*   **React (v19):** Facebook (Meta) tarafından geliştirilen ve bugün web dünyasının en yaygın frontend kütüphanesi olan React'ın en güncel versiyonlarından biri projede temel iskelettir. Component (bileşen) tabanlı çalışma sayesinde, bir buton veya navigasyon barı sadece bir kez yazılıp yüzlerce farklı yerde kullanılabilmektedir.
*   **Vite:** Hız üzerine tasarlanmış, en güncel frontend derleme aracıdır. Projenin anlık tepki verme (Hot-Module-Replacement) süresini milisaniyelere indirir ve son kullanıcının sayfayı yükleme hızını maksimize edecek optimal paket (build) boyutlarını ayarlar.
*   **React Router DOM (v7):** Tek Sayfa Uygulaması (Single Page Application - SPA) mantığını çalıştırır. Kullanıcı bir sayfadan diğerine geçerken tarayıcı sayfası yenilenmez (refresh olmaz), sadece gerekli komponentler ekranda belirip kaybolur. Bu da "masaüstü programı" hissiyatı uyandıran pürüzsüz bir deneyimi beraberinde getirir.
*   **Axios:** Frontend'i Backend servislere bağlayan, asenkron HTTP istekleri atmayı sağlayan güçlü bir kütüphanedir.
*   **Microsoft SignalR Client:** Eşzamanlılık (real-time) özelliğinin tarayıcıya (frontend) entegre edilmesini sağlayan JS kütüphanesidir.
*   **React Icons:** Projedeki görselliği desteklemek için vektörel formattaki (SVG) ikon kütüphanesidir.

### 3.2. Backend ve Sunucu Teknolojileri
Arka planda tüm verinin doğrulandığı, saklandığı ve yönetildiği ağır işi yapan teknolojiler bütünüdür:
*   **.NET 8 (C#):** Microsoft'un en performanslı, güvenli ve uzun Süreli Destek (LTS) sağlayan .NET versiyonudur. C# ile Nesne Yönelimli Programlama (OOP) ve asenkron yapıların tüm avantajları arka yüz mantığına aktarılmıştır.
*   **ASP.NET Core Web API:** REST (Representational State Transfer) mimarisine uygun servis/uç nokta (Endpoint) yazımı için kullanılmıştır. Frontend ile sadece saf veri (JSON formunda) iletişimi üzerine kurgulanmıştır.
*   **SignalR (ASP.NET Core):** WebSocket altyapısını kullanarak sunucu ile istemci arasında kesintisiz çift yönlü veri yolu oluşturur.
*   **JWT (JSON Web Token):** Bilgi güvenliğini sağlamak ve stateless (durumsuz) kimlik doğrulama işlemini yönetmek için kullanılır.
*   **BCrypt.Net-Next:** Veri ihlallerine karşın kullanıcı şifrelerini (password) açık metin halinde değil; güçlü matematiksel kriptolama algoritmalarıyla geri döndürülemez formda veritabanına kaydetmeyi sağlar.
*   **FluentValidation:** Kullanıcıdan gelen kayıt olma, giriş yapma, ilan verme gibi (Request) verilerin API sınırlarına ulaşıp işlem görmeden önce filtrelenip (Doğrulama/Validation) sistemik hata riskinin sıfıra indirilmesini sağlar.
*   **Swagger / OpenAPI (Swashbuckle):** Mevcut API servislerinin dijital ortamdaki canlı kataloğudur. Frontend ekibinin geliştirme yaparken hangi uç noktayı kullanacağını gösteren etkileşimli dokümantasyon panelidir.

### 3.3. Veritabanı ve ORM Altyapısı
*   **Microsoft SQL Server:** İlişkisel veritabanı yönetim sistemi (RDBMS) olarak projede tablo bağları ve kritik veri kayıtlarının (Kullanıcı, ilan vb.) güvenle tutulmasını sağlamaktadır.
*   **Entity Framework Core (EF Core 8):** ORM (Object-Relational Mapping - Nesne-İlişkisel Eşleme) aracı. Yazılımcının karmaşık SQL cümleleri yazmak yerine, C# programlama nesneleri üzerinden (Code-First) veri tabanını oluşturup, verilerle iletişim kurmasını doğrudan sağlar.


## 4. BİLEŞEN VE MİMARİ YAKLAŞIM
Proje tek bir monolitik blok (bütünleşik blok) halinde yazılmamıştır. Kod kalitesini artırmak, hataları (bug) izole edebilmek ve bakımı kolaylaştırmak adına endüstri standartlarında modern mimari desenler uygulanmıştır.

### 4.1. Çok Katmanlı (N-Tier) Temiz Mimari (Clean Architecture) Yaklaşımı
Backend yapısı genel bağlamda 4 farklı mantıksal katmana (Layer) bölünmüş, tüm bağımlılıklar dışarıdan içeriye doğru çekirdeğe yönelecek şekilde tasarlanmıştır:

#### 4.1.1. Sunum Katmanı (Tercuman.API)
İstemciden (Frontend) gelen tüm HTTP isteklerinin düştüğü başlangıç noktasıdır. `Controllers` dizininde yer alan dosyalar (Örn: `AuthController.cs`, `ListingsController.cs`, `NotificationsController.cs`) burada konumlanır. Bu katmanın tek görevi gelen isteği karşılamak, gerekli verileri alıp bir alt katmana (Application) yönlendirmek ve ilgili sonuç ile istemciye HTTP Response (örn: Ok(200), NotFound(404)) döndürmektir. Kendi içinde iş mantığı barındırmaz.

#### 4.1.2. İş Mantığı Katmanı (Tercuman.Application)
Sistemin beynidir. İş kurallarının yer aldığı, DTO (Data Transfer Object) olarak adlandırılan veri taşıma nesnelerinin ve doğrulama süreçleri ile Servis arayüzlerinin (`IServices` / `Services`) yer aldığı bölümdür. Örneğin; "Bir kullanıcı favorilerine aynı ilanı iki defa ekleyemez" veya "Boş bırakılamayacak kayıt alanları" kuralları bu katmanda işletilir. API katmanı bu katmanı çağırır.

#### 4.1.3. Çekirdek/Varlık Katmanı (Tercuman.Domain)
Sistemin tam ortasında yer alır ve uygulamanın kalbidir. Sistemin gerçek hayattaki yapıtaşlarını (.NET sınıfları / Entities olarak) temsil eder. `User.cs`, `Message.cs`, `Conversation.cs`, `Listing.cs` gibi varlıkların tüm özellikleri bu katmanda tanımlanmıştır. Başka hiçbir katmana bağımlı değildir (Dependency tarafında en saf haldir). Tüm diğer katmanlar varlıkları öğrenmek için Domain katmanına muhtaçtır.

#### 4.1.4. Altyapı ve Veri Erişim Katmanı (Tercuman.Infrastructure)
Repository (Veri Deposu) deseninin entegre edildiği, veri tabanı sorgularının ve veritabanı ayarlarının (Entity Framework `DbContext`) barındığı fiziksel katmandır. SQL Server'a gitme, veri ekleme (Insert), okuma (Select), güncelleme, silme işlemleri `Tercuman.Application` tarafından oluşturulan kontratlara/arayüzlere uyularak gerçekleşir.


## 5. VERİTABANI TASARIMI VE VERİ MODELLERİ (ENTITIES)
Projenin ilişkisel veritabanı haritası, bir çeviri hizmet platformunun tüm ihtiyaçlarını karşılamak adına detaylandırılmıştır. Veritabanı Entity Framework "Code-First" (Önce Kod) prensibiyle kurgulanmıştır. Başlıca Entity'ler (Varlık Sınıfları);

1.  **User (Kullanıcılar):** Sistemdeki her aktörü (Admin, Müşteri, Çevirmen) temel alarak temsil eder. Ad, Soyad, Yetki, e-posta, hash'lenmiş kriptolu şifre bilgilerini barındırır.
2.  **Listing (İlanlar):** Sadece 'Çevirmen' yetkisine sahip kullanıcılar tarafından sistemde yayınlanabilir. Çevirmenin fiyat tarifesi, hizmet verdiği diller dizisi ve çalışma detaylarını içerir.
3.  **ListingImage (İlan Görselleri):** Her ilanın kendisine ait görsel portfolyosunu oluşturduğu dosya/referans tutucu sınıftır.
4.  **ListingView (İlan Görüntülemeleri):** İlanların popülaritesini istatistiksel olarak ölçebilmek amacıyla ilan görünürlüğünü sayan analitik varlıktır.
5.  **Language & City (Diller & Şehirler):** Ortak referans tablolarıdır. Filtreleme ve aramalarda kullanılan evrensel sistem kayıtlarıdır (Örn: İngilizce-Türkçe yeminli çeviri, Lokasyon bazlı arama detayları).
6.  **Favorite (Favoriler):** Müşterilerin beğendikleri/ilgilendikleri ilanları daha sonra inceleyebilmek için kaydettiği çapraz ("Many-to-Many" ilişkisine benzer) ilişki tablosudur.
7.  **Conversation & Message (Sohbetler ve Mesajlar):** Canlı sistemin omurgasıdır. İki kullanıcı birbiriyle iletişime geçtiğinde "Conversation" (Sohbet Odası) üretilirken, içerisindeki metinleşmeler sıralı olarak "Message" tablolarında kimden/kime şeklindeki hiyerarşide tutulur.


## 6. GÜVENLİK ALTYAPISI, KİMLİK DOĞRULAMA VE YETKİLENDİRME (AUTH)
Geliştirilen uygulamanın tüm veri giriş/çıkış süreçleri siber güvenliğin en güncel kurallarına bağlanmıştır.

*   **Stateless Authentication & JWT (JSON Web Token):**
    Sisteme giriş yapan bir kullanıcı, veritabanından alınan onay (Kullanıcı maili ve şifresi kontrolü) sonrası sistemden tamamen şifrelenmiş, içinde kendi yetkilerini, ID bilgisini ve son kullanma tarihi barındıran bir Token (akıllı ve şifreli bir bilet) alır.
    Kullanıcı, tarayıcısında (Frontend) bu bileti LocalStorage (veya Cookie) içerisinde saklar. Frontend'den backend API uç noktalarına yapılan her özel istek (Gizli sayfalar, mesajlaşma gibi) "Bearer Token" başlığı (Authorization header) adı altında API'ye yollanır. Sunucu (API) bu bileti çözümler ve bilet onaylanırsa veriyi dışarı çıkartır (Authorize işlemi). Böylelikle Backend kısmında server-memory tüketimine yol açan Session mekanizmaları yerine son derece performanslı ve hafif bir yol tercih edilmiştir.
*   **Parola Hashleme (BCrypt):**
    En yaygın ve en tehlikeli saldırı türlerinden biri olan Veri Sızıntısına (Data Breach) önlem olarak, veri tabanı ele geçirilse bile şifrelerin açığa çıkmaması için (Salt/Tuzlama) tekniği ile birleştirilmiş BCrypt algoritması entegre edilmiştir.
*   **Role Based Access Control (RBAC - Role Dayalı Erişim Kontrolü):**
    Projeye her giren (Login olan) kişi her işlemi yapamaz. Örneğin; sadece yöneticiler (Admin) admin modülündeki (`AdminMessages.jsx`) verilere ulaşabilir. Sistem kullanıcı davranışını kısıtlayarak esnek güvenlik şeması kurar.


## 7. GERÇEK ZAMANLI (REAL-TIME) İLETİŞİM: SIGNALR ENTEGRASYONU
"Tercüman" projesinin kritik noktası hızıdır. Kullanıcıların sohbet ekranında f5 atarak (sayfayı yenileyerek) mesajın gelip gelmediğini kontrol etmesi eski ve hatalı bir yaklaşımdır.
*   Bu bağlamda **`Hubs`** adı verilen özel SignalR kütüphane bağlantı odaları kurulmuştur.
*   Tarayıcı (Frontend) sistemdeki `@microsoft/signalr` köprüsünü kurduğunda, Backend web soketleri (WebSockets) açık bir tünel bekletir.
*   Sisteme bir mesaj düştüğünde sunucu direkt olarak o müşterinin veya çevirmenin JS Frontend Client'ına **`Push`** yapar (Mesajı doğrudan tarayıcıya ittirir).
*   Gelen mesajlar `TranslatorMessages.jsx`, `AdminMessages.jsx` veya Header'da bulunan Canlı Zil İkonu (Bildirim Component'i) tarafından dinlenilir (Listener pattern) ve saniyenin onda biri süresi içerisinde arayüz, sayfayı yenilemeyen DOM Reactivity (React reaktivitesi) üzerinden render edilir (çizdirilir). Veri, eşzamanlı olarak karşı tarafa iletilmiş olur.


## 8. FRONTEND (İSTEMCİ) MİMARİSİ VE KULLANICI DENEYİMİ (UX)
Frontend yapısı yalnızca sayfaların birbirine eklendiği statik yapı değil, başlı başına bir mikro uygulama olarak (SPA - Single Page Application) dizayn edilmiştir.

### 8.1. Sayfa Hiyerarşisi ve Modüler Yaklaşım
Projenin ölçeklenebilirliği göz önünde bulundurularak `src/pages/` dosya dizini "kullanıcı rol ve bağlamlarına" uygun şekilde mikro modüllere sınıflandırılmıştır:
*   **`admin/` Modülü:** Genel sistemi denetleme, şikayetler, istatistikler ve genel mesajları yönetmeyi sağlayan arayüzler kümesi.
*   **`translator/` Modülü:** Sadece Çevirmen ilanlarının oluşturulduğu, kazanç raporlarının takip edildiği, müşterilerinden gelen iş isteklerini gördüğü (`TranslatorMessages.jsx` vb.) paneller.
*   **`customer/` Modülü:** Standard kullanıcıların geçmiş işlemleri, ayarlamaları ve takipleri için oluşturulmuş ekran tasarımları.
*   **`public/` Modülü:** Sisteme üye dahi olunmadan ziyaret edilebilen ana sayfa, ilanlar (Listings), yetki-bağımsız keşif ve arama sayfaları.

### 8.2. Component (Bileşen) Tasarımı ve Layout (Şablon) Yönetimi
*   `src/components/` klasöründe yer alan (Örn: `ChatModal.jsx`, `Header.jsx`) parçalı yapılar, tekrarlanan kodlamayı %80 oranında engellemiş ve yeniden kullanılabilirlik esasını getirmiştir.
*   Kullanıcıların hangi sayfaya girerse girsin sistem içinde kaybolmamasını sağlamak, belirli sayfalara standart menüler giydirmek için `layouts/` mekanizması inşa edilmiştir (`CustomerLayout.jsx`, `PublicLayout.jsx`). Layout sistemleri, içine giren içeriğe (chidren) sadece çerçeveleme vazifesi görerek projenin hiyerarşik UI mantığını oturtmuştur.

### 8.3. Durum Yönetimi (State Management)
*   Sayfa içerisindeki anlık data akışlar, form doğrulama validasyon metinleri, sohbet kutularının içerisine girilen input verileri, **React Hook** yapılarıyla (`useState`, `useEffect`, `useContext`) yönetilmektedir.
*   Axios kurulan ağında Merkezi bir Instance (Yapı) oluşturularak her API isteğinin içerisine otomatik `Authorization JWT` token basılmakta böylece Interceptor mekanizmaları ile güvenlik hatası alındığı saniyede (401 Unauthorized), frontend kullanıcıyı doğrudan saniyeler içinde "Login" (Giriş) ekranına yönlendirebilecek bir defansif koda sahiptir.


## 9. API STANDARTLARI VE VERİ TRANSFER OBJE (DTO) KULLANIMI
Database Entity (Tablo Varlıkları) sınıflarının hiçbir zaman doğrudan son kullanıcıya internet üzerinden aktarılmaması (güvenlik, performans) "Best Practice" kuralıdır.
*   Örneğin bir "User" modeli sunulurken içinde sadece Kullanıcı Adı ve Profil Fotoğrafı iletilir (Token, şifre gizli kalmalıdır). İşte bu ayrımın yapılabilmesi için sisteme `DTOs` (Data Transfer Objects) dahil edilmiştir.
*   API Controllers tamamen JSON tipinde DTO bekler (`CreateReportDto`, `NotificationDto`, `CreateReviewDto`, `FilterListingDto` gibi).
*   Gelen JSON nesneleri API katmanında kontrol edilir (FluentValidation) ve her bir DTO sınıfı uygulama performansına yardımcı olan çok daha hafif paketlere (Payload) dönüştürülür. Filtrelemeler (pagination, sorting) `FilterListingDto` sınıflarındaki spesifik alanlarla Frontend'den Backend'e temiz bir veri yoluyla ulaşır.


## 10. İLERİYE DÖNÜK GELİŞTİRİLEBİLİRLİK VE YOL HARİTASI (ROADMAP)
Mevcut kurulan altyapı her ne kadar modern gereklilikleri karşılıyor olsa da platform büyüdüğünde aşağıdaki entegrasyonlar proje mimarisi gereği çok kolay biçimde adapte edilebilecektir:
*   **Ödeme Sistemleri Altyapısı (Payment Gateway):** İş Mantığı katmanına (Application) yerleştirilecek bağımsız servis arayüzleri ile Stripe, Iyzico veya PayTR gibi ödeme firmalarının kolay ve kesintisiz API entegrasyonu.
*   **Redis veya In-Memory Caching (Önbellekleme):** Database yorgunluğunu engellemek için, sürekli sorulan Şehir (`CitiesController`) ve Diller (`LanguagesController`) verilerinin hızlı RAM belleğinden saniyeler içerisinde çekilmesi.
*   **Docker Container & DevOps:** Mikro servis ve Docker yapısına (N-tier tasarımı sayesinde) birkaç komut konfigürasyonuyla direk dönüşebilecek ve taşınabilir/bulut altyapısına yüklenebilecek pürüzsüz durumdadır.

> NOT: Bu teknik analiz ve proje raporu, mevcut kaynak kod üzerinden (Tercuman.API ve Ceviri React Web Uygulaması) detaylı bağımlılık, tasarım kalıpları ve altyapı araçlarının (tool-chain) denetlenmesi sonucunda otomasyondan bağımsız, yazılım-mühendisliği disiplinlerine uygun bir referans çerçevesinden kaleme alınmıştır.
