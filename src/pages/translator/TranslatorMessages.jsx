import React, { useState, useEffect, useRef } from "react";
import { getTranslatorMessages, getConversations } from "../../services/api";
import chatService from "../../services/chatService";
import { FaUserCircle } from "react-icons/fa";

// ==============================================================================
// TRANSLATOR MESSAGES (MESAJLARIM) - SPLIT VIEW CHAT
// ==============================================================================
// Çevirmene gelen offline "Contact" mesajları ve online "SignalR" mesajlarını birleştirir.
// WhatsApp Web benzeri ikiye bölünmüş bir chat tasarımı sağlar.

const TranslatorMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Sayfa yüklendiğinde sohbet listesini çek
  useEffect(() => {
    const fetchCurrentUserId = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          return payload[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ];
        } catch (e) {
          return null;
        }
      }
      return null;
    };
    const currentUserId = fetchCurrentUserId();
    fetchMessages(currentUserId);
  }, []);

  const selectedConversationRef = useRef(null);
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // SignalR bağlantısı ve mesaj dinleme
  useEffect(() => {
    let isMounted = true;
    const setupChat = async () => {
      try {
        await chatService.startConnection();
        if (isMounted) setIsConnected(true);
      } catch (err) {
        console.error("SignalR başlatılamadı", err);
      }
    };

    const handleReceiveMessage = (message) => {
      const currentConv = selectedConversationRef.current;
      
      // Soldaki son mesaj alanını her halükarda güncelle
      setConversations((prev) =>
        prev.map((c) =>
          c.id === message.conversationId
            ? {
                ...c,
                lastMessage: message.text,
                lastMessageDate: message.createdDate,
              }
            : c,
        ),
      );

      // Sadece o anki açık olan sohbetin mesajları arasına ekle
      if (currentConv && currentConv.id === message.conversationId) {
        const newMsg = {
          id: message.id,
          text: message.text,
          timestamp: message.createdDate,
          isMine: false,
        };
        setMessages((prev) => [...prev, newMsg]);
      }
    };

    setupChat();
    chatService.onMessageReceived(handleReceiveMessage);

    return () => {
      isMounted = false;
      chatService.removeMessageCallback(handleReceiveMessage);
    };
  }, []);

  const fetchMessages = async (currentUserId) => {
    try {
      setLoading(true);
      const res = await getConversations();

      // api.js interceptor zaten "data" yi acarak yolladigi icin
      // res direkt array olur
      if (res && Array.isArray(res)) {
        const mappedConversations = res.map((conv) => {
          // Karşı tarafın bilgisini bul (Ben olmayan taraf)
          const isUser1Me = conv.user1Id === currentUserId;
          const otherUser = isUser1Me ? conv.user2 : conv.user1;
          const otherUserId = isUser1Me ? conv.user2Id : conv.user1Id;

          return {
            id: conv.conversationId, // Backend ConversationListDto 'ConversationId' dönüyor
            name: conv.userName || "Kullanıcı", // DTO'da UserName zaten var
            lastMessage: conv.lastMessage || "Henüz mesaj yok",
            lastMessageDate: conv.lastMessageDate || new Date().toISOString(),
            receiverId: conv.userId, // DTO'da UserId (karşı tarafın ID'si) zaten var
          };
        });

        setConversations(
          mappedConversations.sort(
            (a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate),
          ),
        );
      }
    } catch (error) {
      console.error("Konuşmalar yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationMessages = async (convId) => {
    const token = localStorage.getItem("token");
    let currentUserId = null;
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      currentUserId =
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];
    }

    try {
      const res = await getTranslatorMessages(convId);
      if (res && Array.isArray(res)) {
        setMessages(
          res.map((msg) => ({
            id: msg.id,
            text: msg.text,
            timestamp: msg.createdDate,
            isMine: msg.senderId === currentUserId,
          })),
        );
      }
    } catch (err) {
      console.error("Mesajlar yüklenemedi:", err);
    }
  };

  // Sohbet değiştiğinde sağ taraftaki mesaj alanını yenile
  useEffect(() => {
    if (selectedConversation) {
      loadConversationMessages(selectedConversation.id);
    }
    scrollToBottom();
  }, [selectedConversation]);

  // Yeni mesaj geldiğinde / yazıldığında aşağı kaydır
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConversation) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      timestamp: new Date().toISOString(),
      isMine: true,
    };

    setMessages((prev) => [...prev, newMessage]);

    // Update conversation list
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id
          ? {
              ...c,
              lastMessage: inputText,
              lastMessageDate: newMessage.timestamp,
              history: [...messages, newMessage],
            }
          : c,
      ),
    );

    setInputText("");

    try {
      // Backend tarafında SendMessage(conversationId, receiverId, text) bekliyor.
      await chatService.sendMessage(
        selectedConversation.id,
        selectedConversation.receiverId,
        inputText,
      );
    } catch (err) {
      console.error("SignalR Mesaj gönderme hatası:", err);
    }
  };

  if (loading)
    return <div style={{ padding: "20px" }}>Mesajlar yükleniyor...</div>;

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 70px)",
        backgroundColor: "#f2f2f2",
      }}
    >
      {/* Sol Panel: Sohbet Listesi */}
      <div
        style={{
          width: "30%",
          minWidth: "280px",
          borderRight: "1px solid #ddd",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #ddd",
            backgroundColor: "#f8f9fa",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#333" }}>
            Mesajlarım
          </h2>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.length === 0 ? (
            <p style={{ padding: "20px", color: "#888", textAlign: "center" }}>
              Henüz hiç mesajınız yok.
            </p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                style={{
                  padding: "15px",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  backgroundColor:
                    selectedConversation?.id === conv.id ? "#f0f2f5" : "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#4f46e5",
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "bold",
                    flexShrink: 0,
                    fontSize: "1.2rem",
                  }}
                >
                  {conv.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "5px",
                    }}
                  >
                    <strong
                      style={{
                        color: "#333",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontSize: "0.95rem",
                      }}
                    >
                      {conv.name}
                    </strong>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#888",
                        flexShrink: 0,
                      }}
                    >
                      {new Date(conv.lastMessageDate).toLocaleDateString(
                        "tr-TR",
                      )}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#666",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {conv.lastMessage}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sağ Panel: Aktif Sohbet Alanı (Chat Box) */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#e5ddd5", // WhatsApp arkaplan rengi
          // Kırık url kaldırıldı.
        }}
      >
        {selectedConversation ? (
          <>
            {/* Sohbet Header */}
            <div
              style={{
                padding: "15px 25px",
                backgroundColor: "#f0f2f5",
                borderBottom: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  backgroundColor: "#4f46e5",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                }}
              >
                {selectedConversation.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <strong style={{ display: "block", color: "#333" }}>
                  {selectedConversation.name}
                </strong>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: isConnected ? "#28a745" : "#888",
                  }}
                >
                  {isConnected ? "Çevrimiçi (SignalR Bağlı)" : "Bağlanıyor..."}
                </span>
              </div>
            </div>

            {/* Sohbet Mesajları Akışı */}
            <div
              style={{
                flex: 1,
                padding: "20px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  fontSize: "0.8rem",
                  color: "#555",
                  backgroundColor: "#fff0c2",
                  padding: "5px 15px",
                  borderRadius: "15px",
                  alignSelf: "center",
                  marginBottom: "10px",
                }}
              >
                Sohbet geçmişi ve yeni mesajlar uçtan uca şifrelenmiştir.
              </div>
              {messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  style={{
                    alignSelf: msg.isMine ? "flex-end" : "flex-start",
                    backgroundColor: msg.isMine ? "#dcf8c6" : "#fff",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    maxWidth: "75%",
                    boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      color: "#333",
                      fontSize: "0.95rem",
                      lineHeight: "1.4",
                      marginBottom: "4px",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.text}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#999",
                      textAlign: "right",
                      marginTop: "-4px",
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Mesaj Gönderme Alanı (Input) */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: "15px",
                backgroundColor: "#f0f2f5",
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Bir mesaj yazın..."
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  borderRadius: "25px",
                  border: "none",
                  outline: "none",
                  fontSize: "0.95rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                style={{
                  padding: "0 20px",
                  height: "44px",
                  backgroundColor: inputText.trim() ? "#4f46e5" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "22px",
                  cursor: inputText.trim() ? "pointer" : "default",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background-color 0.2s",
                }}
              >
                Gönder
              </button>
            </form>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              color: "#888",
            }}
          >
            <div
              style={{ fontSize: "5rem", opacity: 0.5, marginBottom: "15px" }}
            >
              💬
            </div>
            <h2 style={{ fontWeight: "normal", color: "#555" }}>
              TercumanAPI Web'e Hoş Geldiniz
            </h2>
            <p>
              Mesajlaşmaya başlamak için sol taraftaki listeden bir sohbet
              seçin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslatorMessages;
