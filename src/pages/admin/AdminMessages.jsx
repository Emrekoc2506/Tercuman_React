import React, { useState, useEffect } from "react";
import { getAdminMessages } from "../../services/api";
import { FaEnvelopeOpenText, FaHistory, FaUserSecret } from "react-icons/fa";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await getAdminMessages();
      if (data) {
        setMessages(data);
      }
    } catch (error) {
      console.warn("Gerçek mesajlar alınamadı, demo veriler yükleniyor.");
      setMessages([
        { id: 1, senderName: "Caner Berk", senderEmail: "caner@mail.com", translatorName: "Ahmet Yılmaz", message: "Merhaba, çeviri için fiyat alabilir miyim?", createdAt: new Date().toISOString() },
        { id: 2, senderName: "Elif Su", senderEmail: "elif@mail.com", translatorName: "Veli Can", message: "Yeminli tercüme yapıyor musunuz?", createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="section-title">
        <FaEnvelopeOpenText /> Mesaj Denetimi
      </div>

      <div style={{ 
        background: "white", 
        borderRadius: "20px", 
        boxShadow: "var(--card-shadow)",
        overflow: "hidden",
        padding: "24px"
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            <FaHistory style={{ fontSize: "3rem", marginBottom: "15px", opacity: 0.2 }} />
            <p>Sistemde henüz mesaj trafiği bulunmuyor.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <th style={thStyle}>Gönderen</th>
                <th style={thStyle}>Alıcı (Tercüman)</th>
                <th style={thStyle}>Mesaj İçeriği</th>
                <th style={thStyle}>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg.id} style={{ borderBottom: "1px solid #f1f5f9" }} className="table-row-hover">
                  <td style={tdStyle}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "600", color: "#1e293b" }}>{msg.senderName}</span>
                      <span style={{ fontSize: "0.85rem", color: "#64748b" }}>{msg.senderEmail}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569" }}>
                      <FaUserSecret style={{ color: "#94a3b8" }} />
                      {msg.translatorName || "Bilinmiyor"}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ 
                      maxWidth: "300px", 
                      fontSize: "0.9rem", 
                      color: "#334155",
                      lineHeight: "1.5"
                    }}>
                      {msg.message}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                      {new Date(msg.createdAt).toLocaleDateString("tr-TR")}<br/>
                      {new Date(msg.createdAt).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const thStyle = { padding: "18px 12px", color: "#475569", fontWeight: "600", fontSize: "0.9rem" };
const tdStyle = { padding: "18px 12px" };

export default AdminMessages;
