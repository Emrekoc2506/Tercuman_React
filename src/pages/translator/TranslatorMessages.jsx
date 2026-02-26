import React, { useState, useEffect } from "react";
import { getTranslatorMessages } from "../../services/api";

// ==============================================================================
// TRANSLATOR MESSAGES (MESAJLARIM)
// ==============================================================================
// Bu sayfa, çevirmene gelen müşteri mesajlarını listeler.
// Mesajlar; gönderen ismi, e-posta, tarih ve içerik olarak gösterilir.

const TranslatorMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await getTranslatorMessages();
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (error) {
      console.error("Mesajlar yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Mesajlar yükleniyor...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gelen Kutusu</h1>

      {messages.length === 0 ? (
        <p>Henüz hiç mesajınız yok.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                background: "#fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "5px",
                }}
              >
                <strong>
                  {msg.senderName} ({msg.senderEmail})
                </strong>
                <span style={{ color: "#999", fontSize: "0.9rem" }}>
                  {new Date(msg.createdAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
              <p style={{ margin: 0, color: "#333", lineHeight: "1.5" }}>
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TranslatorMessages;
