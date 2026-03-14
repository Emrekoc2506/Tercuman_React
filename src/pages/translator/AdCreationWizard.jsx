import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLanguages, getCities, createListing, uploadListingImages } from "../../services/api";
import { FaCamera, FaTimes, FaImage } from "react-icons/fa";
import "../../css/adCreation.css";

const AdCreationWizard = () => {
  const navigate = useNavigate();

  // Sihirbaz (Stepper) Adımları
  const steps = [
    { id: 1, label: "Temel Bilgiler" },
    { id: 2, label: "İlan Detayları" },
    { id: 3, label: "Onay & Yayınla" },
  ];

  const [currentStep, setCurrentStep] = useState(1);

  // API'den gelecek veriler
  const [languages, setLanguages] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Backend'e gönderilecek orijinal Form Verileri
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    experienceLevel: 1, // Default (1 = 0-1 Yıl)
    serviceType: 1, // Default (1 = Online)
    sourceLanguageId: "",
    targetLanguageId: "",
    cityId: "",
  });

  // Hata mesajları
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]); // [File, File, ...]
  const [previews, setPreviews] = useState([]); // [url, url, ...]

  // Sayfa ilk yüklendiğinde dilleri ve şehirleri çek
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [langRes, cityRes] = await Promise.all([
          getLanguages(),
          getCities(),
        ]);
        // Backend standart dönüş modeli gereği datalar `res.data` içerisinde,
        // ancak direkt dizi dönüyorsa `res.data` kullanılır.
        const langData = langRes.data?.data || langRes.data || [];
        const cityData = cityRes.data?.data || cityRes.data || [];

        setLanguages(langData);
        setCities(cityData);
      } catch (error) {
        console.error("Başlangıç verileri yüklenirken hata:", error);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchInitialData();
  }, []);

  // Input değişimlerini yakalama
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Rakam olması gereken alanları (price, experienceLevel, serviceType) parse et
    let finalValue = value;
    if (
      type === "number" ||
      name === "experienceLevel" ||
      name === "serviceType"
    ) {
      finalValue = value ? Number(value) : "";
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    // Hata varsa ilgili hatayı temizle
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 10) {
      alert("En fazla 10 fotoğraf yükleyebilirsiniz.");
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  // --- ADIM VİDALASYONLARI ---

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.sourceLanguageId)
      newErrors.sourceLanguageId = "Kaynak dil seçmelisiniz.";
    if (!formData.targetLanguageId)
      newErrors.targetLanguageId = "Hedef dil seçmelisiniz.";
    if (
      formData.sourceLanguageId &&
      formData.targetLanguageId &&
      formData.sourceLanguageId === formData.targetLanguageId
    ) {
      newErrors.targetLanguageId = "Kaynak ve Hedef dil aynı olamaz.";
    }
    if (!formData.cityId) newErrors.cityId = "Şehir seçmelisiniz.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.title || formData.title.trim() === "")
      newErrors.title = "İlan başlığı zorunludur.";

    if (!formData.description || formData.description.trim().length < 20) {
      newErrors.description =
        "Açıklama en az 20 karakter uzunluğunda olmalıdır.";
    }

    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = "Geçerli bir fiyat girmelisiniz (0'dan büyük olmalı).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // İleri gitme
  const nextStep = () => {
    let isValid = false;
    if (currentStep === 1) isValid = validateStep1();
    if (currentStep === 2) isValid = validateStep2();

    if (isValid && currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Geri gitme
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // İlanı Gönderme (Backend Entegrasyonu)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;

    setIsSubmitting(true);
    try {
      // Body verisini oluştur (Backend'in beklediği JSON nesnesi)
      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        experienceLevel: Number(formData.experienceLevel),
        serviceType: Number(formData.serviceType),
        sourceLanguageId: formData.sourceLanguageId,
        targetLanguageId: formData.targetLanguageId,
        cityId: formData.cityId,
        createdAt: new Date().toISOString(),
      };

      console.log("İlan Gönderiliyor:", payload);

      const response = await createListing(payload);
      
      // Backend'den ID'yi al
      const listingData = response.data?.data || response.data;
      const listingId = listingData?.id;

      // Fotoğraflar varsa yükle
      if (listingId && selectedFiles.length > 0) {
        const imageFormData = new FormData();
        selectedFiles.forEach(file => {
          imageFormData.append("files", file);
        });
        await uploadListingImages(listingId, imageFormData);
      }

      alert("İlanınız başarıyla oluşturuldu!");
      navigate("/user/dashboard"); // İlan oluşturulduktan sonra dashboarda yönlendir
    } catch (error) {
      console.error("İlan oluşturulurken hata:", error);

      // Backend'den gelen spesifik hata mesajlarını konsola yazdır
      if (error.response && error.response.data) {
        console.error(
          "Backend Hata Detayı:",
          JSON.stringify(error.response.data, null, 2),
        );
      }

      alert(
        "Bir hata oluştu. Lütfen konsolu kontrol edin (F12) ve hatanın detayını atın.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // -- RENDER EDİLECEK ADIMLAR (STEPS) --

  const renderStep1 = () => (
    <div className="ad-form-content">
      <h3 style={{ marginBottom: "20px" }}>Dil ve Bölge Tercihleriniz</h3>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        {/* KAYNAK DİL */}
        <div className="form-group">
          <label>
            Kaynak Dil <span className="required">*</span>
          </label>
          <select
            className="form-control"
            name="sourceLanguageId"
            value={formData.sourceLanguageId}
            onChange={handleChange}
          >
            <option value="">Seçiniz...</option>
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
          {errors.sourceLanguageId && (
            <small style={{ color: "red" }}>{errors.sourceLanguageId}</small>
          )}
        </div>

        {/* HEDEF DİL */}
        <div className="form-group">
          <label>
            Hedef Dil <span className="required">*</span>
          </label>
          <select
            className="form-control"
            name="targetLanguageId"
            value={formData.targetLanguageId}
            onChange={handleChange}
          >
            <option value="">Seçiniz...</option>
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
          {errors.targetLanguageId && (
            <small style={{ color: "red" }}>{errors.targetLanguageId}</small>
          )}
        </div>
      </div>

      {/* ŞEHİR */}
      <div className="form-group" style={{ marginTop: "15px" }}>
        <label>
          Şehir <span className="required">*</span>
        </label>
        <select
          className="form-control"
          name="cityId"
          value={formData.cityId}
          onChange={handleChange}
        >
          <option value="">Seçiniz...</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
        {errors.cityId && (
          <small style={{ color: "red" }}>{errors.cityId}</small>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="ad-form-content">
      <h3 style={{ marginBottom: "20px" }}>Hizmetinizin Detayları</h3>

      {/* BAŞLIK */}
      <div className="form-group">
        <label>
          İlan Başlığı <span className="required">*</span>
        </label>
        <input
          type="text"
          className="form-control"
          name="title"
          placeholder="Örn: Arapça → Türkçe Özel Ders ve Yeminli Çeviri"
          value={formData.title}
          onChange={handleChange}
        />
        {errors.title && <small style={{ color: "red" }}>{errors.title}</small>}
      </div>

      {/* AÇIKLAMA */}
      <div className="form-group">
        <label>
          İlan Açıklaması <span className="required">*</span>
        </label>
        <textarea
          className="form-control"
          name="description"
          rows="5"
          placeholder="Deneyimlerinizi ve hizmetinizin kapsamını detaylıca anlatın (Min 20 karakter)..."
          value={formData.description}
          onChange={handleChange}
        ></textarea>
        {errors.description && (
          <small style={{ color: "red" }}>{errors.description}</small>
        )}
        <small
          style={{
            color: "#888",
            display: "block",
            textAlign: "right",
            marginTop: "5px",
          }}
        >
          {formData.description.length} / 20 karakter (Min)
        </small>
      </div>

      {/* 3'LÜ IZGARA: DENEYİM, FİYAT, HİZMET TÜRÜ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {/* DENEYİM (Enum: 1,2,3,4,5) */}
        <div className="form-group">
          <label>Deneyim (Yıl)</label>
          <select
            className="form-control"
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleChange}
          >
            <option value={1}>0-1 Yıl</option>
            <option value={2}>1-3 Yıl</option>
            <option value={3}>3-5 Yıl</option>
            <option value={4}>5-10 Yıl</option>
            <option value={5}>10+ Yıl</option>
          </select>
        </div>

        {/* HİZMET TÜRÜ (Enum: 1,2,3) */}
        <div className="form-group">
          <label>Hizmet Türü</label>
          <select
            className="form-control"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
          >
            <option value={1}>🏠 Sadece Online</option>
            <option value={2}>🤝 Yüz Yüze</option>
            <option value={3}>🌍 Online + Yüz Yüze</option>
          </select>
        </div>

        {/* FİYAT */}
        <div className="form-group">
          <label>
            Fiyat (TL) <span className="required">*</span>
          </label>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                padding: "0 10px",
                background: "#f4f4f4",
                border: "1px solid #ddd",
                borderRadius: "6px 0 0 6px",
                height: "42px",
                display: "flex",
                alignItems: "center",
              }}
            >
              ₺
            </span>
            <input
              type="number"
              className="form-control"
              name="price"
              min="1"
              placeholder="Örn: 500"
              value={formData.price}
              onChange={handleChange}
              style={{ borderRadius: "0 6px 6px 0", borderLeft: "none" }}
            />
          </div>
          {errors.price && (
            <small style={{ color: "red" }}>{errors.price}</small>
          )}
        </div>
      </div>

      {/* FOTOĞRAF YÜKLEME */}
      <div className="form-group" style={{ marginTop: "25px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FaImage /> İlan Fotoğrafları (Opsiyonel - Max 10)
        </label>
        <div 
          className="image-upload-grid" 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", 
            gap: "15px", 
            marginTop: "10px",
            padding: "20px",
            border: "2px dashed #e2e8f0",
            borderRadius: "12px",
            background: "#f8fafc"
          }}
        >
          {previews.map((url, index) => (
            <div key={index} style={{ position: "relative", width: "100px", height: "100px" }}>
              <img 
                src={url} 
                alt="preview" 
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} 
              />
              <button 
                type="button" 
                onClick={() => removeFile(index)}
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                }}
              >
                <FaTimes size={12} />
              </button>
            </div>
          ))}
          
          {selectedFiles.length < 10 && (
            <label 
              style={{ 
                width: "100px", 
                height: "100px", 
                border: "2px dashed #cbd5e0", 
                borderRadius: "8px", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center", 
                cursor: "pointer",
                color: "#64748b",
                fontSize: "0.8rem",
                gap: "5px"
              }}
            >
              <FaCamera size={20} />
              Ekle
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                style={{ display: "none" }} 
                onChange={handleFileChange} 
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div
      className="ad-form-content"
      style={{ textAlign: "center", padding: "40px 20px" }}
    >
      <h3 style={{ marginBottom: "15px", color: "#28a745" }}>
        🎉 Harika! İlanınız neredeyse hazır.
      </h3>
      <p style={{ color: "#555", marginBottom: "30px", fontSize: "16px" }}>
        Doldurduğunuz tüm bilgiler taslak olarak kaydedildi. Müşterilerin
        ilanınızı görüp satın alabilmesi için <strong>"İlanı Yayınla"</strong>{" "}
        butonuna basmanız yeterlidir.
      </p>

      <div
        style={{
          background: "#f9f9f9",
          padding: "20px",
          borderRadius: "8px",
          textAlign: "left",
          display: "inline-block",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <h4
          style={{
            borderBottom: "1px solid #ddd",
            paddingBottom: "10px",
            marginBottom: "15px",
          }}
        >
          İlan Özeti
        </h4>
        <p>
          <strong>Başlık:</strong> {formData.title}
        </p>
        <p>
          <strong>Fiyat:</strong> {formData.price} ₺
        </p>
        <p>
          <strong>Hizmet:</strong>{" "}
          {formData.serviceType === 1
            ? "Online"
            : formData.serviceType === 2
              ? "Yüz Yüze"
              : "Online & Yüz Yüze"}
        </p>
      </div>
    </div>
  );

  if (loadingInitial) {
    return (
      <div
        className="ad-creation-container"
        style={{ textAlign: "center", padding: "50px" }}
      >
        Yükleniyor... Diller ve Şehirler alınıyor.
      </div>
    );
  }

  return (
    <div className="ad-creation-container">
      <h2 className="ad-creation-title">Yeni İlan Oluştur</h2>

      {/* STEPPER HEADER */}
      <div className="stepper-container">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <div
              key={step.id}
              className={`step-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
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
      </div>

      {/* FOOTER BUTTONS */}
      <div className="wizard-footer">
        <button
          className="btn-wizard btn-prev"
          onClick={prevStep}
          disabled={currentStep === 1 || isSubmitting}
          style={{ visibility: currentStep === 1 ? "hidden" : "visible" }}
        >
          Geri
        </button>
        {currentStep < steps.length ? (
          <button className="btn-wizard btn-next" onClick={nextStep}>
            Devam Et
          </button>
        ) : (
          <button
            className="btn-wizard btn-submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Yayınlanıyor..." : "İlanı Yayınla"}
          </button>
        )}
      </div>
    </div>
  );
};

export default AdCreationWizard;
