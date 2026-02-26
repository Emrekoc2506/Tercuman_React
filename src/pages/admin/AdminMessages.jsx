import React, { useState, useEffect } from "react";
import { getAdminMessages } from "../../services/api";

// ==============================================================================
// ADMIN MESSAGES (MESAJ YÖNETİMİ)
// ==============================================================================
// Admin'in sistemdeki tüm mesajları gördüğü sayfa.
// Çevirmenler ve müşteriler arasındaki iletişimi denetlemek için.

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await getAdminMessages();
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
      <h1>Mesaj Denetimi</h1>

      {messages.length === 0 ? (
        <p>Sistemde henüz mesaj bulunmuyor.</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
          }}
        >
          <thead>
            <tr style={{ background: "#eee" }}>
              <th>Gönderen</th>
              <th>Alıcı (Çevirmen)</th>
              <th>Mesaj</th>
              <th>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg.id}>
                <td>
                  <strong>{msg.senderName}</strong>
                  <br />
                  <small>{msg.senderEmail}</small>
                </td>
                <td>{msg.translatorName || "Bilinmiyor"}</td>
                <td>{msg.message}</td>
                <td>
                  {new Date(msg.createdAt).toLocaleDateString("tr-TR")}{" "}
                  {new Date(msg.createdAt).toLocaleTimeString("tr-TR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminMessages;
