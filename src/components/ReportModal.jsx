import React, { useState } from "react";
import { createReport } from "../services/api";

const ReportModal = ({ isOpen, onClose, listingId }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const reasons = [
    "Yanıltıcı İçerik",
    "Spam veya Tekrar",
    "Hakaret / Uygunsuz Dil",
    "Dolandırıcılık Şüphesi",
    "Yanlış Kategori",
    "Diğer",
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return alert("Lütfen bir şikayet sebebi seçiniz.");
    if (description.length < 10) return alert("Lütfen en az 10 karakterlik bir açıklama yazınız.");

    setLoading(true);
    try {
      await createReport({
        listingId: parseInt(listingId),
        reason,
        description,
      });
      alert("Şikayetiniz başarıyla iletildi. Ekibimiz inceleyecektir.");
      onClose();
    } catch (error) {
      console.error("Rapor gönderme hatası:", error);
      alert(
        error.response?.data?.message || 
        "Şikayet gönderilirken bir hata oluştu. (Zaten şikayet etmiş olabilirsiniz)"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>🚩 İlanı Rapor Et</h2>
          <button onClick={onClose} style={styles.closeBtn}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Şikayet Sebebi</label>
            <select 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              style={styles.select}
              required
            >
              <option value="">Seçiniz...</option>
              {reasons.map((r, index) => (
                <option key={index} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Açıklama (Minimum 10 Karakter)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.textarea}
              placeholder="Şikayetinizi detaylandırın..."
              required
            />
          </div>

          <div style={styles.footer}>
            <button 
              type="button" 
              onClick={onClose} 
              style={styles.cancelBtn}
              disabled={loading}
            >
              İptal
            </button>
            <button 
              type="submit" 
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Gönderiliyor..." : "Raporu Gönder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "450px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  title: {
    margin: 0,
    fontSize: "1.2rem",
    color: "#d32f2f",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#999",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontWeight: "600",
    fontSize: "0.9rem",
    color: "#444",
  },
  select: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "1rem",
  },
  textarea: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    minHeight: "100px",
    resize: "vertical",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "10px",
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#d32f2f",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default ReportModal;
