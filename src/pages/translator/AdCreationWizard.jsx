import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/adCreation.css";

const AdCreationWizard = () => {
  const navigate = useNavigate();

  // Sihirbaz (Stepper) Adımları
  const steps = [
    { id: 1, label: "Kategori Seçimi" },
    { id: 2, label: "İlan Detayları" },
    { id: 3, label: "Medya Yükleme" },
    { id: 4, label: "İletişim & Onay" },
  ];

  const [currentStep, setCurrentStep] = useState(1);

  // Form Verileri (State)
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    price: "",
    currency: "TL",
    location: "Online",
    photos: [], // Çoklu fotoğraf için File dizisi
    photoPreviews: [], // Ekranda göstermek için Base64/URL dizisi
    contactPreference: "telefon",
    showFullName: true,
    agreedToTerms: false,
  });

  // Hata mesajları için
  const [errors, setErrors] = useState({});

  // Input değişimlerini yakalama
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Fotoğraf Yükleme İşlemi (Çoklu)
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Maksimum 10 fotoğraf limiti koyalım
    if (formData.photos.length + files.length > 10) {
      alert("En fazla 10 fotoğraf yükleyebilirsiniz.");
      return;
    }

    const newPhotos = [...formData.photos, ...files];
    setFormData((prev) => ({ ...prev, photos: newPhotos }));

    // Önizleme için FileReader kullanımı
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          photoPreviews: [...prev.photoPreviews, reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  // İleri Gitmeden Önce Temel Validasyon
  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1 && !formData.category) {
      newErrors.category = "Lütfen bir kategori seçiniz.";
    }
    if (currentStep === 2) {
      if (!formData.title) newErrors.title = "İlan başlığı zorunludur.";
      if (!formData.description)
        newErrors.description = "Açıklama alanı zorunludur.";
      if (!formData.price) newErrors.price = "Fiyat alanı zorunludur.";
    }
    if (currentStep === 4 && !formData.agreedToTerms) {
      newErrors.agreedToTerms = "İlan verme kurallarını kabul etmelisiniz.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep() && currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    console.log(
      "🚀 MOCK: İlan verileri backend'e gönderilmeye hazır:",
      formData,
    );
    alert(
      "Frontend Arayüzü Hazır! C# Backend ekibi 'TranslatorAds' tablosunu ve /api/translator/ads endpointini yazdıktan sonra bu ilan gerçek anlamda kaydedilecektir.",
    );
    navigate("/translator/dashboard");
  };

  // -- RENDER EDİLECEK ADIMLAR (STEPS) --

  const renderStep1 = () => (
    <div className="ad-form-content">
      <h3 style={{ marginBottom: "20px" }}>
        Hangi hizmeti vermek istiyorsunuz?
      </h3>
      {errors.category && (
        <div style={{ color: "red", marginBottom: "15px" }}>
          {errors.category}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        <div
          className={`category-card ${
            formData.category === "Yazılı Çeviri" ? "selected" : ""
          }`}
          onClick={() =>
            setFormData({ ...formData, category: "Yazılı Çeviri" })
          }
        >
          <h4>📝 Yazılı Çeviri</h4>
          <p style={{ fontSize: "12px", color: "#666" }}>
            Noter onaylı, akademik, tıbbi, hukuki veya edebi çeviri hizmetleri.
          </p>
        </div>
        <div
          className={`category-card ${
            formData.category === "Akademik & Sınav Hazırlık" ? "selected" : ""
          }`}
          onClick={() =>
            setFormData({ ...formData, category: "Akademik & Sınav Hazırlık" })
          }
        >
          <h4>� Akademik & Sınav Hazırlık</h4>
          <p style={{ fontSize: "12px", color: "#666" }}>
            YKS, LGS, KPSS hazırlık veya Üniversite derslerine takviye
            eğitimleri.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="ad-form-content">
      <div className="form-group">
        <label>
          İlan Başlığı <span className="required">*</span>
        </label>
        <input
          type="text"
          className="form-control"
          name="title"
          placeholder="Örn: İngilizce - Türkçe Tıbbi Metin Çevirisi"
          value={formData.title}
          onChange={handleChange}
        />
        {errors.title && <small style={{ color: "red" }}>{errors.title}</small>}
      </div>

      <div className="form-group">
        <label>
          Açıklama <span className="required">*</span>
        </label>
        <textarea
          className="form-control"
          name="description"
          rows="6"
          placeholder="Deneyimlerinizi, teslimat sürenizi ve sağladığınız kaliteyi detaylıca anlatın..."
          value={formData.description}
          onChange={handleChange}
        ></textarea>
        {errors.description && (
          <small style={{ color: "red" }}>{errors.description}</small>
        )}
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>
            Fiyat <span className="required">*</span>
          </label>
          <div style={{ display: "flex" }}>
            <input
              type="number"
              className="form-control"
              name="price"
              placeholder="Örn: 250"
              value={formData.price}
              onChange={handleChange}
              style={{ borderRadius: "6px 0 0 6px" }}
            />
            <select
              className="form-control"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              style={{
                width: "80px",
                borderRadius: "0 6px 6px 0",
                borderLeft: "none",
              }}
            >
              <option value="TL">TL</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          {errors.price && (
            <small style={{ color: "red" }}>{errors.price}</small>
          )}
        </div>

        <div className="form-group" style={{ flex: 1 }}>
          <label>Hizmet Yeri</label>
          <select
            className="form-control"
            name="location"
            value={formData.location}
            onChange={handleChange}
          >
            <option value="Online">Sadece Online (Uzaktan)</option>
            <option value="Yüz Yüze">Yüz Yüze (Bölgesel)</option>
            <option value="Hibrit">Hibrit (Fark Etmez)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="ad-form-content">
      <h3 style={{ marginBottom: "10px" }}>İlanınız için Fotoğraf Seçin</h3>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
        Sertifikalarınızı, CV'nizi veya sizi profesyonel yansıtan görselleri
        yükleyerek müşterilerin güvenini kazanın.
      </p>

      <label className="photo-upload-box">
        <input
          type="file"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={handlePhotoUpload}
        />
        <div style={{ fontSize: "40px", color: "#007bff" }}>📷</div>
        <strong
          style={{ color: "#007bff", display: "block", marginTop: "10px" }}
        >
          Bilgisayardan Fotoğraf Ekle
        </strong>
        <p style={{ color: "#888", fontSize: "12px" }}>veya sürükle bırak</p>
      </label>

      <div style={{ fontSize: "12px", color: "#888", marginTop: "10px" }}>
        Eklediğiniz Fotoğraf Adedi: {formData.photos.length} / 10
      </div>

      {formData.photoPreviews.length > 0 && (
        <div className="uploaded-photos">
          {formData.photoPreviews.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Yüklenen ${index + 1}`}
              className="photo-preview"
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="ad-form-content">
      <h3 style={{ marginBottom: "20px" }}>Size nasıl ulaşılsın?</h3>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="contactPreference"
            value="telefon"
            checked={formData.contactPreference === "telefon"}
            onChange={handleChange}
          />
          Telefon numaralarım ile
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="contactPreference"
            value="mesaj"
            checked={formData.contactPreference === "mesaj"}
            onChange={handleChange}
          />
          Sadece Site İçi Mesajlar ile
        </label>
      </div>

      <div
        style={{
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginBottom: "30px",
          background: "#fafafa",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
            borderBottom: "1px solid #eee",
            paddingBottom: "10px",
          }}
        >
          <span style={{ color: "#555" }}>İlanınızda Görünecek İsim:</span>
          <strong>Profilinizdeki İsim Soyisim</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#555" }}>Telefon (Eğer izin verirseniz):</span>
          <strong>Sistemde Kayıtlı Telefonunuz</strong>
        </div>
      </div>

      <div className="form-group">
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            name="agreedToTerms"
            checked={formData.agreedToTerms}
            onChange={handleChange}
            style={{ width: "18px", height: "18px" }}
          />
          <span>
            İlan verme kurallarını okudum, kabul ediyorum.{" "}
            <span className="required">*</span>
          </span>
        </label>
        {errors.agreedToTerms && (
          <small style={{ color: "red", display: "block", marginTop: "5px" }}>
            {errors.agreedToTerms}
          </small>
        )}
      </div>
    </div>
  );

  return (
    <div className="ad-creation-container">
      <h2 className="ad-creation-title">Yeni İlan Ekle</h2>

      {/* STEPPER HEADER */}
      <div className="stepper-container">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <div
              key={step.id}
              className={`step-item ${isActive ? "active" : ""} ${
                isCompleted ? "completed" : ""
              }`}
            >
              <div className="step-number">{isCompleted ? "✓" : step.id}</div>
              <div className="step-label">{step.label}</div>
            </div>
          );
        })}
      </div>

      {/* FORM CONTENT */}
      <div className="stepper-body">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      {/* FOOTER BUTTONS */}
      <div className="wizard-footer">
        <button
          className="btn-wizard btn-prev"
          onClick={prevStep}
          disabled={currentStep === 1}
          style={{ visibility: currentStep === 1 ? "hidden" : "visible" }}
        >
          Geri
        </button>
        {currentStep < steps.length ? (
          <button className="btn-wizard btn-next" onClick={nextStep}>
            Devam Et
          </button>
        ) : (
          <button className="btn-wizard btn-submit" onClick={handleSubmit}>
            İlanı Yayınla
          </button>
        )}
      </div>
    </div>
  );
};

export default AdCreationWizard;
