import React, { useState } from "react";
import { sendContactMessage } from "../services/api"; // API fonksiyonunu çağır

// ==============================================================================
// CONTACT MODAL (İLETİŞİM FORMU PENCERESİ)
// ==============================================================================
// Bu bileşen, bir çevirmen seçildiğinde açılan pop-up penceredir.
// Kullanıcı ismini, e-postasını ve mesajını girip "Gönder"e basar.

const ContactModal = ({ translatorId, translatorName, onClose }) => {
  // Form verilerini tutan state'ler
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");

  // İşlem durumunu (Yükleniyor / Hata / Başarılı) tutan state'ler
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. API'ye gönderilecek veriyi hazırla
      const payload = {
        translatorId: translatorId, // Kime gidecek?
        senderName: senderName, // Kim gönderiyor?
        senderEmail: senderEmail, // E-posta adresi ne?
        message: message, // Mesaj ne?
      };

      // 2. API isteğini gönder (POST /public/contact)
      const res = await sendContactMessage(payload);

      // 3. Başarılı ise kullanıcıya bilgi ver
      if (res.data.success) {
        setSuccess(true);
        // Formu temizle
        setSenderName("");
        setSenderEmail("");
        setMessage("");
        // 2 saniye sonra pencereyi kapat
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error("Mesaj gönderme hatası:", err);
      setError(
        err.response?.data?.message ||
          "Mesaj gönderilemedi. Lütfen tekrar deneyin.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Modal'ın dışına tıklayınca kapanması için arka plan stili
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Yarı saydam siyah
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalStyle = {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "500px",
    position: "relative",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Kapatma Butonu (Sağ üst köşe) */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          &times;
        </button>

        <h3 style={{ marginTop: 0 }}>Çevirmene Mesaj Gönder</h3>
        <p style={{ color: "#666" }}>
          Sayın <strong>{translatorName}</strong> için mesajınızı aşağıya
          bırakın.
        </p>

        {success ? (
          <div
            style={{
              padding: "20px",
              background: "#d4edda",
              color: "#155724",
              borderRadius: "5px",
              textAlign: "center",
            }}
          >
            ✅ Mesajınız başarıyla gönderildi!
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {/* Hata Mesajı */}
            {error && (
              <div style={{ color: "red", fontSize: "0.9rem" }}>{error}</div>
            )}

            {/* İsim Alanı */}
            <div>
              <label>Adınız Soyadınız:</label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            {/* Email Alanı */}
            <div>
              <label>E-posta Adresiniz:</label>
              <input
                type="email"
                required
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            {/* Mesaj Alanı */}
            <div>
              <label>Mesajınız:</label>
              <textarea
                required
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              ></textarea>
            </div>

            {/* Gönder Butonu */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px",
                background: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "1rem",
              }}
            >
              {loading ? "Gönderiliyor..." : "Mesajı Gönder"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactModal;
