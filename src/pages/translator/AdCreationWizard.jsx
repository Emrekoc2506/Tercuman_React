// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getLanguages,
  getCities,
  createListing,
  uploadListingImages,
  filterListings,
} from "../../services/api";
import { FaCamera, FaTimes, FaImage, FaPlus, FaTrash, FaGraduationCap, FaLink, FaAward, FaClock, FaCloudUploadAlt } from "react-icons/fa";
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

  // --- DİPLOMA VE SERTİFİKA STATE'LERİ ---
  const [diplomas, setDiplomas] = useState([]);
  const [showDiplomaForm, setShowDiplomaForm] = useState(false);
  const [newDiploma, setNewDiploma] = useState({ title: "", institution: "", date: "", link: "", image: null });

  const [certificates, setCertificates] = useState([]);
  const [showCertForm, setShowCertForm] = useState(false);
  const [newCert, setNewCert] = useState({ title: "", organization: "", date: "", link: "", image: null });

  // Sayfa ilk yüklendiğinde dilleri ve şehirleri çek ve localStorage'dan mevcut belgeleri yükle
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [langRes, cityRes] = await Promise.all([
          getLanguages(),
          getCities(),
        ]);
        setLanguages(Array.isArray(langRes) ? langRes : []);
        setCities(Array.isArray(cityRes) ? cityRes : []);
        
        // Mevcut belgeleri yükle
        const savedDiplomas = localStorage.getItem("translator_diplomas");
        const savedCerts = localStorage.getItem("translator_certificates");
        if (savedDiplomas) setDiplomas(JSON.parse(savedDiplomas));
        if (savedCerts) setCertificates(JSON.parse(savedCerts));
      } catch (error) {
        console.error("Başlangıç verileri yüklenirken hata:", error);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchInitialData();
  }, []);

  const saveDocsToStorage = (type, data) => {
    localStorage.setItem(`translator_${type}`, JSON.stringify(data));
  };

  const handleAddDiploma = () => {
    if (newDiploma.title && newDiploma.institution) {
      const updated = [...diplomas, { ...newDiploma, id: Date.now(), status: "Pending" }];
      setDiplomas(updated);
      saveDocsToStorage("diplomas", updated);
      setNewDiploma({ title: "", institution: "", date: "", link: "", image: null });
      setShowDiplomaForm(false);
    }
  };

  const handleDeleteDiploma = (id) => {
    const updated = diplomas.filter(d => d.id !== id);
    setDiplomas(updated);
    saveDocsToStorage("diplomas", updated);
  };

  const handleAddCert = () => {
    if (newCert.title && newCert.organization) {
      const updated = [...certificates, { ...newCert, id: Date.now(), status: "Pending" }];
      setCertificates(updated);
      saveDocsToStorage("certificates", updated);
      setNewCert({ title: "", organization: "", date: "", link: "", image: null });
      setShowCertForm(false);
    }
  };

  const handleDeleteCert = (id) => {
    const updated = certificates.filter(c => c.id !== id);
    setCertificates(updated);
    saveDocsToStorage("certificates", updated);
  };

  const handleDocFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB Limit for demo
        alert("Dosya boyutu çok büyük (Max 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "diploma") {
          setNewDiploma({ ...newDiploma, image: reader.result });
        } else {
          setNewCert({ ...newCert, image: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
    const newPreviews = files.map((file) => URL.createObjectURL(file));
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

      // Backend oluşturulan ilanın ID'sini dönmediği için (response.id = null),
      // ilanı anında filtreleme ile geri bularak ID'sini alıyoruz:
      let listingId = response?.id ?? null;

      if (!listingId) {
        // Oluşturduğumuz ilanı başlığına göre bulalım
        const fetchFilters = await filterListings({
          searchKeyword: payload.title,
          page: 1,
          pageSize: 10,
        });

        // Gelen listede bizim ilanı, Başlık ve Fiyat eşleşmesinden tespit edelim
        const itemsList = fetchFilters?.items || (Array.isArray(fetchFilters) ? fetchFilters : []);
        const matchingListing = itemsList.find(
          (l) => l.title === payload.title && l.price === payload.price,
        );
        listingId = matchingListing?.id || null;
      }

      // Fotoğraflar varsa yükle
      if (listingId && selectedFiles.length > 0) {
        const imageFormData = new FormData();
        selectedFiles.forEach((file) => {
          imageFormData.append("files", file);
        });
        await uploadListingImages(listingId, imageFormData);
      } else if (selectedFiles.length > 0 && !listingId) {
        console.warn(
          "İlan oluşturuldu fakat ID'si bulunamadığı için fotoğraflar yüklenemedi!",
        );
      }

      alert("İlanınız başarıyla oluşturuldu!");
      navigate("/user/dashboard"); // İlan oluşturulduktan sonra dashboarda yönlendir
    } catch (error) {
      console.error("İlan oluşturulurken hata:", error);

      let backendMsg = "Bilinmeyen sunucu hatası";
      if (error.response && error.response.data) {
        backendMsg = error.response.data.message || error.response.data.title || JSON.stringify(error.response.data);
        console.error("Backend Hata Detayı:", JSON.stringify(error.response.data, null, 2));
      } else {
        backendMsg = error.message;
      }

      alert(`İlan oluşturulurken bir hata oluştu:\n\n${backendMsg}\n\nLütfen formu kontrol edin veya backend ekibine bu mesajı iletin.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -- RENDER EDİLECEK ADIMLAR (STEPS) --

  const renderStep1 = () => {
    return (
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
  };

  const renderStep2 = () => { 
    return (
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
            background: "#f8fafc",
          }}
        >
          {previews.map((url, index) => (
            <div
              key={index}
              style={{ position: "relative", width: "100px", height: "100px" }}
            >
              <img
                src={url}
                alt="preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
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
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
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
                gap: "5px",
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

      {/* DİPLOMA VE SERTİFİKA EKLEME ALANI (YENİ) */}
      <div style={{ marginTop: "30px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        
        {/* SOL: DİPLOMALAR */}
        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h4 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "#1e3a8a", fontSize: "1rem" }}>
              <FaGraduationCap /> Akademik Diplomalar
            </h4>
            <button 
              type="button" 
              onClick={() => setShowDiplomaForm(true)}
              style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: "600" }}
            >
              <FaPlus /> Yeni Ekle
            </button>
          </div>

          {showDiplomaForm && (
            <div style={{ background: "#f0f7ff", padding: "15px", borderRadius: "8px", marginBottom: "15px", border: "1px dashed #3b82f6" }}>
              <input 
                placeholder="Diploma Adı (Örn: İngilizce Öğretmenliği)" 
                className="form-control" 
                style={{ marginBottom: "10px", fontSize: "0.9rem" }}
                value={newDiploma.title}
                onChange={(e) => setNewDiploma({...newDiploma, title: e.target.value})}
              />
              <input 
                placeholder="Üniversite/Kurum" 
                className="form-control" 
                style={{ marginBottom: "10px", fontSize: "0.9rem" }}
                value={newDiploma.institution}
                onChange={(e) => setNewDiploma({...newDiploma, institution: e.target.value})}
              />
              <input 
                placeholder="Belge/e-Devlet Linki (Opsiyonel)" 
                className="form-control" 
                style={{ marginBottom: "10px", fontSize: "0.9rem" }}
                value={newDiploma.link}
                onChange={(e) => setNewDiploma({...newDiploma, link: e.target.value})}
              />
              <div style={{ marginBottom: "10px" }}>
                <label className="btn-wizard" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#e2e8f0", color: "#475569", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", width: "100%", justifyContent: "center" }}>
                  <FaCloudUploadAlt /> {newDiploma.image ? "Fotoğraf Değiştir" : "Diploma Fotoğrafı Ekle"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleDocFileChange(e, "diploma")} />
                </label>
                {newDiploma.image && (
                  <div style={{ marginTop: "10px", textAlign: "center" }}>
                    <img src={newDiploma.image} alt="preview" style={{ maxWidth: "100%", maxHeight: "100px", borderRadius: "8px", border: "1px solid #ddd" }} />
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={handleAddDiploma} style={{ flex: 1, background: "#3b82f6", color: "#fff", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>Kaydet</button>
                <button type="button" onClick={() => { setShowDiplomaForm(false); setNewDiploma({...newDiploma, image: null}); }} style={{ flex: 1, background: "#94a3b8", color: "#fff", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer" }}>İptal</button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {diplomas.map(dip => (
              <div key={dip.id} className="certification-item blue" style={{ padding: "12px", fontSize: "0.85rem", justifyContent: "space-between", backgroundColor: "#f8fafc" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                  {dip.image ? (
                    <img src={dip.image} alt="dip" style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover", border: "1px solid #bfdbfe" }} />
                  ) : (
                    <div className="cert-icon blue" style={{ width: "40px", height: "40px", fontSize: "1rem" }}>
                      <FaGraduationCap />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "700", color: "#1e293b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      {dip.title}
                      {dip.link && <a href={dip.link} target="_blank" rel="noopener noreferrer"><FaLink size={12} color="#3b82f6" /></a>}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{dip.institution}</div>
                    <div style={{ fontSize: "0.75rem", color: "#3b82f6", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px", fontWeight: "600" }}>
                      <FaClock /> Onay Bekliyor
                    </div>
                  </div>
                </div>
                <FaTrash 
                  style={{ color: "#ef4444", cursor: "pointer", opacity: "0.7", marginLeft: "10px" }} 
                  onClick={() => handleDeleteDiploma(dip.id)} 
                />
              </div>
            ))}
            {diplomas.length === 0 && !showDiplomaForm && (
              <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", border: "1px dashed #e2e8f0", borderRadius: "8px" }}>
                <FaGraduationCap size={24} style={{ marginBottom: "8px", opacity: "0.5" }} />
                <p style={{ fontSize: "0.85rem", margin: 0 }}>Eklenmiş diploma bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>

        {/* SAĞ: SERTİFİKALAR */}
        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h4 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "#b45309", fontSize: "1rem" }}>
              <FaAward /> Uzmanlık Sertifikaları
            </h4>
            <button 
              type="button" 
              onClick={() => setShowCertForm(true)}
              style={{ background: "#fbbf24", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: "600" }}
            >
              <FaPlus /> Yeni Ekle
            </button>
          </div>

          {showCertForm && (
            <div style={{ background: "#fffbeb", padding: "15px", borderRadius: "8px", marginBottom: "15px", border: "1px dashed #fbbf24" }}>
              <input 
                placeholder="Sertifika Adı (Örn: IELTS 8.5)" 
                className="form-control" 
                style={{ marginBottom: "10px", fontSize: "0.9rem" }}
                value={newCert.title}
                onChange={(e) => setNewCert({...newCert, title: e.target.value})}
              />
              <input 
                placeholder="Veren Kurum" 
                className="form-control" 
                style={{ marginBottom: "10px", fontSize: "0.9rem" }}
                value={newCert.organization}
                onChange={(e) => setNewCert({...newCert, organization: e.target.value})}
              />
              <input 
                placeholder="Sertifika Bağlantısı (Opsiyonel)" 
                className="form-control" 
                style={{ marginBottom: "10px", fontSize: "0.9rem" }}
                value={newCert.link}
                onChange={(e) => setNewCert({ ...newCert, link: e.target.value })}
              />
              <div style={{ marginBottom: "10px" }}>
                <label className="btn-wizard" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#fef3c7", color: "#92400e", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", width: "100%", justifyContent: "center" }}>
                  <FaCloudUploadAlt /> {newCert.image ? "Fotoğraf Değiştir" : "Sertifika Fotoğrafı Ekle"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleDocFileChange(e, "certificate")} />
                </label>
                {newCert.image && (
                  <div style={{ marginTop: "10px", textAlign: "center" }}>
                    <img src={newCert.image} alt="preview" style={{ maxWidth: "100%", maxHeight: "100px", borderRadius: "8px", border: "1px solid #fcd34d" }} />
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={handleAddCert} style={{ flex: 1, background: "#fbbf24", color: "#fff", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>Kaydet</button>
                <button type="button" onClick={() => { setShowCertForm(false); setNewCert({...newCert, image: null}); }} style={{ flex: 1, background: "#94a3b8", color: "#fff", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer" }}>İptal</button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {certificates.map(cert => (
              <div key={cert.id} className="certification-item gold" style={{ padding: "12px", fontSize: "0.85rem", justifyContent: "space-between", backgroundColor: "#fffbeb" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                  {cert.image ? (
                    <img src={cert.image} alt="cert" style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover", border: "1px solid #fde68a" }} />
                  ) : (
                    <div className="cert-icon gold" style={{ width: "40px", height: "40px", fontSize: "1rem" }}>
                      <FaAward />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "700", color: "#92400e", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      {cert.title}
                      {cert.link && <a href={cert.link} target="_blank" rel="noopener noreferrer"><FaLink size={12} color="#fbbf24" /></a>}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#b45309" }}>{cert.organization}</div>
                    <div style={{ fontSize: "0.75rem", color: "#d97706", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px", fontWeight: "600" }}>
                      <FaClock /> Onay Bekliyor
                    </div>
                  </div>
                </div>
                <FaTrash 
                  style={{ color: "#ef4444", cursor: "pointer", opacity: "0.7", marginLeft: "10px" }} 
                  onClick={() => handleDeleteCert(cert.id)} 
                />
              </div>
            ))}
            {certificates.length === 0 && !showCertForm && (
              <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", border: "1px dashed #fcd34d", borderRadius: "8px" }}>
                <FaAward size={24} style={{ marginBottom: "8px", opacity: "0.5" }} />
                <p style={{ fontSize: "0.85rem", margin: 0 }}>Eklenmiş sertifika bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
    );
  };

  const renderStep3 = () => {
    return (
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
  };

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
