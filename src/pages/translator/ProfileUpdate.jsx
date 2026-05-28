import React, { useState, useEffect } from "react";
import {
  getTranslatorProfile,
  updateTranslatorProfile,
  toggleTranslatorProfileStatus,
  uploadProfileImage,
} from "../../services/api";
import {
  FaUserEdit,
  FaSave,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationCircle,
  FaEnvelope,
  FaPhoneAlt,
  FaVenusMars,
  FaLock,
  FaLockOpen,
  FaEdit,
  FaKey,
  FaCamera,
  FaUser,
  FaPlus,
  FaTrash,
  FaGraduationCap,
  FaLink,
  FaAward,
  FaClock,
} from "react-icons/fa";

const ProfileUpdate = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [profileImage, setProfileImage] = useState("");
  const fileInputRef = React.useRef(null);

  const [isEmailLocked, setIsEmailLocked] = useState(true);
  const [isPhoneLocked, setIsPhoneLocked] = useState(true);
  const [showEmailFull, setShowEmailFull] = useState(false);
  const [showPhoneFull, setShowPhoneFull] = useState(false);

  // Demo Diplomas State
  const [diplomas, setDiplomas] = useState([
    {
      id: 1,
      title: "Mütercim Tercümanlık (Lisans)",
      institution: "İstanbul Üniversitesi",
      date: "2020-06",
      link: "https://edevlet.gov.tr/belge/123",
    },
  ]);
  const [showDiplomaForm, setShowDiplomaForm] = useState(false);
  const [newDiploma, setNewDiploma] = useState({
    title: "",
    institution: "",
    date: "",
    link: "",
  });

  // Demo Certifications State (RESTORED)
  const [certificates, setCertificates] = useState([
    {
      id: 1,
      title: "Yeminli Tercümanlık Belgesi",
      organization: "Noterler Birliği",
      date: "2023-01",
    },
  ]);
  const [showCertForm, setShowCertForm] = useState(false);
  const [newCert, setNewCert] = useState({
    title: "",
    organization: "",
    date: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profileData = await getTranslatorProfile();
      if (profileData) {
        setFullName(profileData.fullName || "");
        setEmail(profileData.email || "");
        setPhoneNumber(profileData.phoneNumber || "");
        setGender(profileData.gender || 0);
        setIsActive(profileData.isActive || false);
        setProfileImage(profileData.profileImageUrl || "");
      }
    } catch (error) {
      console.error("Profil bilgisi alınamadı:", error);
    } finally {
      // Yerel hafızadaki belgeleri yükle
      const savedDiplomas = localStorage.getItem("translator_diplomas");
      const savedCerts = localStorage.getItem("translator_certificates");
      if (savedDiplomas) setDiplomas(JSON.parse(savedDiplomas));
      if (savedCerts) setCertificates(JSON.parse(savedCerts));
      
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setMessage({ text: "Kaydediliyor...", type: "info" });
      const res = await updateTranslatorProfile({
        fullName,
        email,
        phoneNumber,
        gender,
      });
      if (res.status === 200 || res.data.success) {
        setMessage({
          text: "Profiliniz başarıyla güncellendi!",
          type: "success",
        });
        setIsEmailLocked(true);
        setIsPhoneLocked(true);
      }
    } catch (error) {
      setMessage({ text: "Hata oluştu.", type: "error" });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleToggleStatus = async () => {
    try {
      const res = await toggleTranslatorProfileStatus();
      if (res.status === 200 || res.data?.success) {
        setIsActive(!isActive);
        setMessage({
          text: `İlanınız "${!isActive ? "Aktif" : "Pasif"}" duruma getirildi.`,
          type: "success",
        });
      }
    } catch (error) {
      setMessage({ text: "Hata oluştu!", type: "error" });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadProfileImage(formData);
      if (res.data?.success) {
        setProfileImage(`${res.data.imageUrl}?v=${Date.now()}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const maskEmail = (str) => {
    if (!str || showEmailFull || !isEmailLocked) return str;
    const [name, domain] = str.split("@");
    return `${name.substring(0, 3)}***@${domain}`;
  };

  const maskPhone = (str) => {
    if (!str || showPhoneFull || !isPhoneLocked) return str;
    return `${str.substring(0, 3)}****${str.substring(str.length - 3)}`;
  };

  const handleAddDiploma = () => {
    if (newDiploma.title && newDiploma.institution) {
      const updated = [...diplomas, { ...newDiploma, id: Date.now(), status: "Pending" }];
      setDiplomas(updated);
      localStorage.setItem("translator_diplomas", JSON.stringify(updated));
      setNewDiploma({ title: "", institution: "", date: "", link: "" });
      setShowDiplomaForm(false);
    }
  };

  const handleDeleteDiploma = (id) => {
    const updated = diplomas.filter((d) => d.id !== id);
    setDiplomas(updated);
    localStorage.setItem("translator_diplomas", JSON.stringify(updated));
  };

  const handleAddCert = () => {
    if (newCert.title && newCert.organization) {
      const updated = [...certificates, { ...newCert, id: Date.now(), status: "Pending" }];
      setCertificates(updated);
      localStorage.setItem("translator_certificates", JSON.stringify(updated));
      setNewCert({ title: "", organization: "", date: "" });
      setShowCertForm(false);
    }
  };

  const handleDeleteCert = (id) => {
    const updated = certificates.filter((c) => c.id !== id);
    setCertificates(updated);
    localStorage.setItem("translator_certificates", JSON.stringify(updated));
  };

  const getGenderText = (g) => {
    if (g === 1 || g === "Male") return "Erkek";
    if (g === 2 || g === "Female") return "Kadın";
    return "Belirtilmemiş";
  };

  if (loading)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>Yükleniyor...</div>
    );

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "50px" }}>
      <h2 className="section-title">
        <FaUserEdit /> Profil Ayarları
      </h2>

      {/* Mesaj Bildirimi */}
      {message.text && (
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            color: "white",
            background: message.type === "success" ? "#22c55e" : "#ef4444",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          {message.text}
        </div>
      )}

      {/* DURUM KONTROLÜ */}
      <div
        className="glass-panel"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
          marginBottom: "30px",
          borderLeft: isActive ? "5px solid #22c55e" : "5px solid #ef4444",
        }}
      >
        <div>
          <h4 style={{ margin: 0 }}>İlan Görünürlüğü</h4>
          <p
            style={{
              margin: "5px 0 0 0",
              fontSize: "0.9rem",
              color: isActive ? "#16a34a" : "#dc2626",
              fontWeight: "600",
            }}
          >
            {isActive ? <FaCheckCircle /> : <FaExclamationCircle />}{" "}
            {isActive ? "Aktif" : "Pasif"}
          </p>
        </div>
        <button
          onClick={handleToggleStatus}
          className="btn-modern"
          style={{ background: isActive ? "#dc2626" : "#22c55e" }}
        >
          {isActive ? (
            <>
              <FaEyeSlash /> Pasife Al
            </>
          ) : (
            <>
              <FaEye /> Yayınla
            </>
          )}
        </button>
      </div>

      {/* PROFİL BAŞLIK VE FOTO */}
      <div
        className="glass-panel"
        style={{ padding: "30px", textAlign: "center", marginBottom: "30px" }}
      >
        <div
          className="profile-image-container"
          onClick={() => fileInputRef.current.click()}
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            margin: "0 auto",
            background: "#eef2f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: "4px solid #fff",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <FaUser size={50} color="#cbd5e0" />
          )}
          <div
            className="photo-overlay"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(0,0,0,0.4)",
              padding: "4px 0",
              color: "#fff",
              fontSize: "0.7rem",
            }}
          >
            <FaCamera /> Değiştir
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleImageUpload}
        />
        <h3 style={{ marginTop: "15px", marginBottom: "5px" }}>
          {fullName || "Kullanıcı"}
        </h3>
      </div>

      {/* DİPLOMA BÖLÜMÜ (Mavi Kutucuk) */}
      <div
        className="glass-panel"
        style={{
          padding: "25px",
          marginBottom: "30px",
          borderLeft: "5px solid #3b82f6",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "1.1rem",
            }}
          >
            <FaGraduationCap style={{ color: "#3b82f6" }} /> 🎓 Diplomalarım
          </h3>
          {!showDiplomaForm && (
            <button
              className="btn-modern"
              style={{
                background: "#3b82f6",
                padding: "8px 15px",
                fontSize: "0.8rem",
              }}
              onClick={() => setShowDiplomaForm(true)}
            >
              <FaPlus /> Diploma Ekle
            </button>
          )}
        </div>

        {showDiplomaForm && (
          <div
            className="glass-panel"
            style={{
              background: "#eff6ff",
              padding: "20px",
              marginBottom: "20px",
              border: "1px dashed #3b82f6",
            }}
          >
            <h4
              style={{ marginTop: 0, marginBottom: "15px", fontSize: "0.9rem" }}
            >
              Yeni Diploma Bilgileri
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
              }}
            >
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    marginBottom: "5px",
                  }}
                >
                  Diploma / Bölüm
                </label>
                <input
                  className="modern-input"
                  value={newDiploma.title}
                  onChange={(e) =>
                    setNewDiploma({ ...newDiploma, title: e.target.value })
                  }
                  placeholder="Örn: İngilizce Mütercim Tercümanlık"
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    marginBottom: "5px",
                  }}
                >
                  Üniversite
                </label>
                <input
                  className="modern-input"
                  value={newDiploma.institution}
                  onChange={(e) =>
                    setNewDiploma({
                      ...newDiploma,
                      institution: e.target.value,
                    })
                  }
                  placeholder="Örn: Boğaziçi Üniversitesi"
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    marginBottom: "5px",
                  }}
                >
                  Tarih
                </label>
                <input
                  type="month"
                  className="modern-input"
                  value={newDiploma.date}
                  onChange={(e) =>
                    setNewDiploma({ ...newDiploma, date: e.target.value })
                  }
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    marginBottom: "5px",
                  }}
                >
                  e-Devlet Belge Linki
                </label>
                <input
                  className="modern-input"
                  value={newDiploma.link}
                  onChange={(e) =>
                    setNewDiploma({ ...newDiploma, link: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                className="btn-modern"
                style={{ flex: 1, background: "#3b82f6" }}
                onClick={handleAddDiploma}
              >
                Kaydet
              </button>
              <button
                className="btn-modern"
                style={{ flex: 1, background: "#94a3b8" }}
                onClick={() => setShowDiplomaForm(false)}
              >
                İptal
              </button>
            </div>
          </div>
        )}

        <div className="cert-manage-list">
          {diplomas.map((dip) => (
            <div
              key={dip.id}
              className="certification-item blue"
              style={{
                marginBottom: "15px",
                backgroundColor: "#fff",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <div className="cert-icon blue">
                  <FaGraduationCap />
                </div>
                <div className="cert-info">
                  <h4 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    {dip.title}
                    {dip.status === "Verified" ? (
                      <FaCheckCircle style={{ color: "#22c55e", fontSize: "0.9rem" }} title="Onaylı" />
                    ) : (
                      <FaClock style={{ color: "#94a3b8", fontSize: "0.9rem" }} title="Onay Bekliyor" />
                    )}
                  </h4>
                  <p style={{ margin: 0 }}>
                    {dip.institution} • {dip.date || "Tarih Belirtilmedi"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteDiploma(dip.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                  padding: "5px",
                }}
              >
                <FaTrash />
              </button>
            </div>
          ))}
          {diplomas.length === 0 && (
            <p style={{ textAlign: "center", color: "#94a3b8" }}>
              Henüz diploma eklenmemiş.
            </p>
          )}
        </div>
      </div>

      {/* SERTİFİKA BÖLÜMÜ (RESTORED) */}
      <div
        className="glass-panel"
        style={{
          padding: "25px",
          marginBottom: "30px",
          borderLeft: "5px solid #fbbf24",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "1.1rem",
            }}
          >
            <FaAward style={{ color: "#fbbf24" }} /> ⭐ Sertifikalarım
          </h3>
          {!showCertForm && (
            <button
              className="btn-modern"
              style={{
                background: "#fbbf24",
                padding: "8px 15px",
                fontSize: "0.8rem",
              }}
              onClick={() => setShowCertForm(true)}
            >
              <FaPlus /> Sertifika Ekle
            </button>
          )}
        </div>

        {showCertForm && (
          <div
            className="glass-panel"
            style={{
              background: "#fffbeb",
              padding: "20px",
              marginBottom: "20px",
              border: "1px dashed #fbbf24",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
              }}
            >
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    marginBottom: "5px",
                  }}
                >
                  Sertifika Adı
                </label>
                <input
                  className="modern-input"
                  value={newCert.title}
                  onChange={(e) =>
                    setNewCert({ ...newCert, title: e.target.value })
                  }
                  placeholder="Örn: Yeminli Tercümanlık Belgesi"
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    marginBottom: "5px",
                  }}
                >
                  Kurum
                </label>
                <input
                  className="modern-input"
                  value={newCert.organization}
                  onChange={(e) =>
                    setNewCert({ ...newCert, organization: e.target.value })
                  }
                  placeholder="Örn: Noterler Birliği"
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    marginBottom: "5px",
                  }}
                >
                  Tarih
                </label>
                <input
                  type="month"
                  className="modern-input"
                  value={newCert.date}
                  onChange={(e) =>
                    setNewCert({ ...newCert, date: e.target.value })
                  }
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                className="btn-modern"
                style={{ flex: 1, background: "#fbbf24" }}
                onClick={handleAddCert}
              >
                Kaydet
              </button>
              <button
                className="btn-modern"
                style={{ flex: 1, background: "#94a3b8" }}
                onClick={() => setShowCertForm(false)}
              >
                İptal
              </button>
            </div>
          </div>
        )}

        <div className="cert-manage-list">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="certification-item gold"
              style={{
                marginBottom: "15px",
                backgroundColor: "#fff",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <div className="cert-icon gold">
                  <FaAward />
                </div>
                <div className="cert-info">
                  <h4 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    {cert.title}
                    {cert.status === "Verified" ? (
                      <FaCheckCircle style={{ color: "#22c55e", fontSize: "0.9rem" }} title="Onaylı" />
                    ) : (
                      <FaClock style={{ color: "#f59e0b", fontSize: "0.9rem" }} title="Onay Bekliyor" />
                    )}
                  </h4>
                  <p style={{ margin: 0 }}>
                    {cert.organization} • {cert.date || "Tarih Belirtilmedi"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteCert(cert.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                  padding: "5px",
                }}
              >
                <FaTrash />
              </button>
            </div>
          ))}
          {certificates.length === 0 && (
            <p style={{ textAlign: "center", color: "#94a3b8" }}>
              Henüz sertifika eklenmemiş.
            </p>
          )}
        </div>
      </div>

      {/* BİLGİ GÜNCELLEME FORMU */}
      <form
        onSubmit={handleUpdate}
        className="glass-panel"
        style={{
          padding: "30px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Kişisel Bilgiler</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "5px",
              }}
            >
              Ad Soyad
            </label>
            <input
              className="modern-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div style={{ position: "relative" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "5px",
              }}
            >
              E-posta
            </label>
            <input
              className="modern-input"
              readOnly={isEmailLocked}
              value={isEmailLocked ? maskEmail(email) : email}
              onFocus={() => setShowEmailFull(true)}
              onBlur={() => setShowEmailFull(false)}
              onChange={(e) => setEmail(e.target.value)}
              style={{ background: isEmailLocked ? "#f8fafc" : "#fff" }}
            />
            <FaEdit
              onClick={() => setIsEmailLocked(!isEmailLocked)}
              style={{
                position: "absolute",
                right: "10px",
                bottom: "12px",
                cursor: "pointer",
                color: "#3b82f6",
              }}
            />
          </div>
          <div style={{ position: "relative" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "5px",
              }}
            >
              Telefon
            </label>
            <input
              className="modern-input"
              readOnly={isPhoneLocked}
              value={isPhoneLocked ? maskPhone(phoneNumber) : phoneNumber}
              onFocus={() => setShowPhoneFull(true)}
              onBlur={() => setShowPhoneFull(false)}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={{ background: isPhoneLocked ? "#f8fafc" : "#fff" }}
            />
            <FaEdit
              onClick={() => setIsPhoneLocked(!isPhoneLocked)}
              style={{
                position: "absolute",
                right: "10px",
                bottom: "12px",
                cursor: "pointer",
                color: "#3b82f6",
              }}
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn-modern"
          style={{ width: "100%", padding: "12px" }}
        >
          <FaSave /> Bilgileri Kaydet
        </button>
      </form>
    </div>
  );
};

export default ProfileUpdate;
