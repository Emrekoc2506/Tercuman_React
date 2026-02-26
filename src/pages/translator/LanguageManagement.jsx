import React, { useState, useEffect } from "react";
import {
  getTranslatorLanguages,
  addTranslatorLanguage,
  deleteTranslatorLanguage,
} from "../../services/api";

// ==============================================================================
// LANGUAGE MANAGEMENT (DİL YÖNETİMİ)
// ==============================================================================
// Çevirmenin bildiği dilleri listelediği ve yeni dil eklediği sayfa.
// Tablo yapısı ve Ekleme Formu içerir.

const LanguageManagement = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Yeni dil ekleme formu state'leri
  const [sourceLang, setSourceLang] = useState("");
  const [targetLang, setTargetLang] = useState("");

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const res = await getTranslatorLanguages();
      if (res.data.success) {
        setLanguages(res.data.data);
      }
    } catch (error) {
      console.error("Diller yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLanguage = async (e) => {
    e.preventDefault();
    if (!sourceLang || !targetLang) return;

    try {
      const res = await addTranslatorLanguage({
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
      });
      if (res.data.success) {
        alert("Dil başarıyla eklendi.");
        setSourceLang("");
        setTargetLang("");
        fetchLanguages(); // Listeyi yenile
      }
    } catch (error) {
      alert(
        "Ekleme hatası: " +
          (error.response?.data?.message || "Bilinmeyen hata"),
      );
    }
  };

  const handleDeleteLanguage = async (id) => {
    if (!window.confirm("Bu dili silmek istediğinize emin misiniz?")) return;

    try {
      const res = await deleteTranslatorLanguage(id);
      if (res.data.success) {
        alert("Dil silindi.");
        fetchLanguages();
      }
    } catch (error) {
      alert(
        "Silme hatası: " + (error.response?.data?.message || "Bilinmeyen hata"),
      );
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dil Yönetimi</h1>

      {/* 1. DİL EKLEME FORMU */}
      <div
        style={{
          background: "#f9f9f9",
          padding: "20px",
          marginBottom: "30px",
          borderRadius: "8px",
        }}
      >
        <h3>Yeni Dil Ekle</h3>
        <form
          onSubmit={handleAddLanguage}
          style={{ display: "flex", gap: "10px" }}
        >
          <input
            type="text"
            placeholder="Kaynak Dil (Örn: TR)"
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            style={{ padding: "8px" }}
          />
          <span style={{ alignSelf: "center" }}>➜</span>
          <input
            type="text"
            placeholder="Hedef Dil (Örn: EN)"
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            style={{ padding: "8px" }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              background: "#28a745",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Ekle
          </button>
        </form>
      </div>

      {/* 2. DİL LİSTESİ TABLOSU */}
      <h3>Bildiğim Diller</h3>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ background: "#eee" }}>
              <th>Kaynak Dil</th>
              <th>Hedef Dil</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {languages.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>
                  Henüz dil eklemediniz.
                </td>
              </tr>
            ) : (
              languages.map((lang) => (
                <tr key={lang.id}>
                  <td>{lang.sourceLanguage}</td>
                  <td>{lang.targetLanguage}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteLanguage(lang.id)}
                      style={{
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        cursor: "pointer",
                      }}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LanguageManagement;
