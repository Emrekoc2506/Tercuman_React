import React, { useState, useEffect } from "react";
import {
  getTranslatorProfile,
  updateTranslatorProfile,
  toggleTranslatorProfileStatus,
  uploadProfileImage
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
  FaUser
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
  
  // Password states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Control states for locking
  const [isEmailLocked, setIsEmailLocked] = useState(true);
  const [isPhoneLocked, setIsPhoneLocked] = useState(true);

  // Masking states
  const [showEmailFull, setShowEmailFull] = useState(false);
  const [showPhoneFull, setShowPhoneFull] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log("Profil bilgileri getiriliyor...");
      const res = await getTranslatorProfile();

      if (res.data) {
        const profileData = res.data;
        setFullName(profileData.fullName || "");
        setEmail(profileData.email || "");
        setPhoneNumber(profileData.phoneNumber || "");
        setGender(profileData.gender || 0);
        setIsActive(profileData.isActive || false);
        setProfileImage(profileData.profileImageUrl || "");
      }
    } catch (error) {
      console.error("Profil bilgisi alınamadı:", error);
      if (error.response?.status === 401) {
        setMessage({ text: "Oturum süreniz dolmuş olabilir, lütfen tekrar giriş yapın.", type: "error" });
      } else {
        setMessage({ text: "Profil bilgileri yüklenirken bir hata oluştu.", type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      setMessage({ text: "Şifreler eşleşmiyor!", type: "error" });
      return;
    }

    try {
      setMessage({ text: "Kaydediliyor...", type: "info" });
      
      const payload = {
        fullName,
        email,
        phoneNumber,
        gender
      };

      if (password) {
        payload.password = password;
      }

      const res = await updateTranslatorProfile(payload);

      if (res.status === 200 || res.data.success) {
        setMessage({ text: "Profiliniz başarıyla güncellendi!", type: "success" });
        setPassword("");
        setConfirmPassword("");
        setIsEmailLocked(true);
        setIsPhoneLocked(true);
      } else {
        setMessage({ text: "Güncelleme başarısız oldu.", type: "error" });
      }
    } catch (error) {
      setMessage({
        text: "Hata: " + (error.response?.data?.message || "Bilinmeyen bir hata oluştu"),
        type: "error",
      });
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
      console.error("Durum değiştirme hatası:", error);
      setMessage({ text: "Durum değiştirilirken hata oluştu!", type: "error" });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleEmailUnlock = () => {
    if (isEmailLocked) {
      setEmail(""); // Boşalt
    }
    setIsEmailLocked(!isEmailLocked);
  };

  const handlePhoneUnlock = () => {
    if (isPhoneLocked) {
      setPhoneNumber(""); // Boşalt
    }
    setIsPhoneLocked(!isPhoneLocked);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadProfileImage(formData);
      if (res.data?.imageUrl) {
        setProfileImage(res.data.imageUrl);
        setMessage({ text: "Profil fotoğrafı güncellendi.", type: "success" });
      }
    } catch (error) {
      console.error("Fotoğraf yükleme hatası:", error);
      setMessage({ text: "Fotoğraf yüklenirken bir hata oluştu.", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  // Masking helpers
  const maskEmail = (str) => {
    if (!str || showEmailFull || !isEmailLocked) return str;
    const [name, domain] = str.split("@");
    if (!domain) return str;
    return `${name.substring(0, 3)}***@${domain}`;
  };

  const maskPhone = (str) => {
    if (!str || showPhoneFull || !isPhoneLocked) return str;
    if (str.length < 5) return str;
    return `${str.substring(0, 3)}****${str.substring(str.length - 3)}`;
  };

  const getGenderText = (g) => {
    // Backend JsonStringEnumConverter kullandığı için string gelebilir ("Male", "Female")
    // Bazı durumlarda integer da gelebilir (1, 2). Her iki durumu da kontrol ediyoruz.
    if (g === 1 || g === "Male") return "Erkek";
    if (g === 2 || g === "Female") return "Kadın";
    return "Belirtilmemiş";
  };

  if (loading)
    return (
      <div className="glass-panel" style={{ padding: "40px", textAlign: "center", margin: "40px" }}>
        <p>Profil bilgileri yükleniyor...</p>
      </div>
    );

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 className="section-title">
        <FaUserEdit style={{ color: "var(--primary-color)" }} /> Profil ve Güvenlik Ayarları
      </h2>

      {/* STATUS TOGGLE */}
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
          <h4 style={{ margin: 0, color: "#1e293b" }}>İlan Görünürlüğü</h4>
          <p style={{ margin: "5px 0 0 0", fontSize: "0.9rem", color: isActive ? "#16a34a" : "#dc2626", fontWeight: "600" }}>
            {isActive ? <FaCheckCircle style={{ verticalAlign: "middle", marginRight: "5px" }} /> : <FaExclamationCircle style={{ verticalAlign: "middle", marginRight: "5px" }} />}
            {isActive ? "Aktif: Müşteriler sizi görebilir" : "Pasif: Müşteriler sizi göremez"}
          </p>
        </div>

        <button
          onClick={handleToggleStatus}
          className="btn-modern"
          style={{
            padding: "10px 20px",
            background: isActive ? "#dc2626" : "#22c55e",
            fontSize: "0.85rem",
          }}
        >
          {isActive ? <><FaEyeSlash style={{ marginRight: "8px" }} /> İlanı Pasife Al</> : <><FaEye style={{ marginRight: "8px" }} /> İlanı Yayınla</>}
        </button>
      </div>

      {/* NOTIFICATION MESSAGE */}
      {message.text && (
        <div
          className="glass-panel"
          style={{
            padding: "15px 20px",
            marginBottom: "20px",
            color: "white",
            background: message.type === "success" ? "#22c55e" : message.type === "error" ? "#ef4444" : "var(--primary-color)",
            fontWeight: "600",
            textAlign: "center"
          }}
        >
          {message.text}
        </div>
      )}

      {/* UPDATE FORM */}
      <div className="glass-panel" style={{ padding: "30px" }}>
        {/* Profile Photo Section */}
        <div className="profile-photo-section" style={{ textAlign: "center", marginBottom: "30px", position: "relative" }}>
          <div 
            className="profile-image-container" 
            onClick={handleImageClick}
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
              position: "relative"
            }}
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <FaUser size={50} color="#cbd5e0" />
            )}
            <div className="photo-overlay" style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(0,0,0,0.4)",
              padding: "4px 0",
              color: "#fff",
              fontSize: "0.7rem",
              opacity: 0,
              transition: "opacity 0.2s"
            }}>
              <FaCamera style={{ marginRight: "4px" }} /> Değiştir
            </div>
            {/* CSS to show overlay on hover - easier as inline style if possible or we rely on some class */}
            <style>{`
              .profile-image-container:hover .photo-overlay { opacity: 1 !important; }
            `}</style>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: "none" }} 
            accept="image/*" 
            onChange={handleImageUpload} 
          />
          <h3 style={{ marginTop: "15px", marginBottom: "5px", color: "#1e293b" }}>{fullName || "Kullanıcı"}</h3>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>Profil bilgilerinizi buradan düzenleyebilirsiniz.</p>
        </div>

        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* FULL NAME */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontWeight: "700", display: "block", marginBottom: "8px", color: "#334155" }}>Ad Soyad</label>
              <input type="text" required className="modern-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tam isminizi girin" />
            </div>

            {/* EMAIL */}
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontWeight: "700", color: "#334155" }}><FaEnvelope style={{ marginRight: "5px" }} /> E-posta</label>
                <button type="button" onClick={handleEmailUnlock} style={{ background: "none", border: "none", color: "var(--primary-color)", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}>
                  {isEmailLocked ? <><FaEdit size={12} /> Düzenle</> : <><FaLockOpen size={12} /> Kilitle</>}
                </button>
              </div>
              <input
                type="email"
                required
                className="modern-input"
                readOnly={isEmailLocked}
                value={isEmailLocked ? maskEmail(email) : email}
                onFocus={() => setShowEmailFull(true)}
                onBlur={() => setShowEmailFull(false)}
                onChange={(e) => setEmail(e.target.value)}
                style={{ background: isEmailLocked ? "#f8fafc" : "white", cursor: isEmailLocked ? "default" : "text" }}
              />
              {isEmailLocked && <FaLock size={12} style={{ position: "absolute", right: "15px", top: "45px", color: "#94a3b8" }} />}
            </div>

            {/* PHONE */}
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontWeight: "700", color: "#334155" }}><FaPhoneAlt style={{ marginRight: "5px" }} /> Telefon</label>
                <button type="button" onClick={handlePhoneUnlock} style={{ background: "none", border: "none", color: "var(--primary-color)", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}>
                  {isPhoneLocked ? <><FaEdit size={12} /> Düzenle</> : <><FaLockOpen size={12} /> Kilitle</>}
                </button>
              </div>
              <input
                type="text"
                className="modern-input"
                readOnly={isPhoneLocked}
                value={isPhoneLocked ? maskPhone(phoneNumber) : phoneNumber}
                onFocus={() => setShowPhoneFull(true)}
                onBlur={() => setShowPhoneFull(false)}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{ background: isPhoneLocked ? "#f8fafc" : "white", cursor: isPhoneLocked ? "default" : "text" }}
              />
              {isPhoneLocked && <FaLock size={12} style={{ position: "absolute", right: "15px", top: "45px", color: "#94a3b8" }} />}
            </div>

            {/* GENDER (Read Only) */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontWeight: "700", display: "block", marginBottom: "8px", color: "#334155" }}><FaVenusMars style={{ marginRight: "5px" }} /> Cinsiyet</label>
              <input type="text" readOnly className="modern-input" value={getGenderText(gender)} style={{ background: "#f1f5f9", color: "#64748b", cursor: "not-allowed" }} />
            </div>

            {/* PASSWORD SECTION */}
            <div style={{ gridColumn: "1 / -1", marginTop: "10px", padding: "20px", background: "rgba(79, 70, 229, 0.03)", borderRadius: "16px", border: "1px dashed rgba(79, 70, 229, 0.2)" }}>
              <h4 style={{ margin: "0 0 15px 0", display: "flex", alignItems: "center", gap: "8px", color: "var(--primary-color)" }}><FaKey size={14} /> Şifre Güncelle</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ fontWeight: "600", display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Yeni Şifre</label>
                  <input type="password" className="modern-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ padding: "10px 15px", fontSize: "0.9rem" }} />
                </div>
                <div>
                  <label style={{ fontWeight: "600", display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Şifre Tekrar</label>
                  <input type="password" className="modern-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" style={{ padding: "10px 15px", fontSize: "0.9rem" }} />
                </div>
              </div>
              <p style={{ margin: "10px 0 0 0", fontSize: "0.75rem", color: "#64748b" }}>* Şifrenizi değiştirmek istemiyorsanız bu alanları boş bırakın.</p>
            </div>
          </div>

          <button type="submit" className="btn-modern" style={{ width: "100%", padding: "15px" }}>
            <FaSave style={{ marginRight: "10px" }} /> Değişiklikleri Kaydet
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileUpdate;
