# 🚨 Backend Ekibi İçin Geliştirme Talebi: Cinsiyet ve Tarih Eksikliği

**Sorunlar:**

1. Kullanıcılar kayıt olurken "Gender" (Cinsiyet) bilgisi `RegisterDto` içerisinde gönderiliyor; ancak bu bilgi veritabanında (`User` tablosunda) tutulmadığı için frontend tarafında "İlan Detayları" sayfasında **Cinsiyet: Belirtilmemiş** olarak gözüküyor.
2. Ana sayfada listelenen ilanlarda (Listings) **Tarih** bilgisi gözükmüyor, çünkü `ListingDto` içerisinde ilanın oluşturulma tarihi (`CreatedDate`) dönülmüyor.

Aşağıdaki düzenlemelerin backend projesine entegre edilmesi rica olunur:

### 1. `User` Entity'sine Cinsiyet Alanının Eklenmesi

`Tercuman.Domin.Entities.User.cs` sınıfına Cinsiyet bilgisi eklenmeli ve veritabanı Migration'ı (Update-Database) yapılmalıdır:

```csharp
public class User : BaseEntity
{
    // ... diğer proplar
    public string? Gender { get; set; }
}
```

### 2. Kayıt Olurken Bilginin Veritabanına Yazılması

`AuthService.cs` içerisindeki `RegisterAsync` metodunda kullanıcı oluşturulurken `Gender` eşleştirmesi yapılmalıdır:

```csharp
var user = new User
{
    FullName = dto.FullName,
    Email = dto.Email, // Email vb. alanlar...
    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),

    // EKLENMESİ GEREKEN SATIR
    Gender = dto.Gender
};
```

### 3. İlan Çekerken Cinsiyet ve Tarih Bilgilerinin DTO'lara Eklenmesi

Frontend'in ilan detaylarını düzgün gösterebilmesi için ilgili DTO'lara `Gender` ve ana sayfadaki ilan kartları için `CreatedDate` alanı açılmalıdır.

**`ListingDetailDto.cs` İçin:**

```csharp
public string Gender { get; set; }
```

**`ListingDto.cs` İçin:**

```csharp
public string Gender { get; set; }
public DateTime CreatedDate { get; set; }
```

### 4. Fetch (Getirme) İşlemlerinde Mapping Yapılması

`ListingService.cs` içerisinde ilanları listeleyen ve detay getiren (`GetPagedAsync`, `FilterAsync`, `GetDetailAsync`) metotlarda kullanıcının `Gender` bilgisi ve ilanların `CreatedDate` bilgisi eşleştirilmelidir:

```csharp
// Örnek Mapping Setlemesi:
Gender = listing.User?.Gender ?? "Belirtilmedi"

// Ana sayfa listesinin (ListingDto) MapToDto metodunda:
CreatedDate = listing.CreatedDate
```

_(Not: `ListingRepository.cs` içindeki sorgulara `.Include(x => x.User)` eklenmesi gerekebilir, yoksa `listing.User` null gelebilir)._

İlgili eklemeler ve DB migration işlemleri tamamlandıktan sonra frontend tarafına dokunmadan bu iki eksiklik (Cinsiyet ve Tarih) direkt olarak ekranda görünür olacaktır. Kolay gelsin!
