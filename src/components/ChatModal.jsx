import React, { useState, useEffect, useRef } from "react";
import chatService from "../services/chatService";

const ChatModal = ({ receiverId, receiverName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Otomatik aşağı kaydırma
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let isMounted = true;

    // SignalR bağlantısını başlat ve gelen mesajları dinle
    const setupChat = async () => {
      try {
        await chatService.startConnection();
        if (isMounted) setIsConnected(true);
      } catch (err) {
        console.error("ChatModal: Bağlantı başlatılamadı", err);
      }
    };

    const handleReceiveMessage = (senderId, text, timestamp) => {
      // Sadece ilgili kişiden (veya genel test için) gelen mesajları state'e ekle
      // Gerçek senaryoda: if (senderId === receiverId) ...
      setMessages((prev) => [
        ...prev,
        { senderId, text, timestamp: timestamp || new Date().toISOString() },
      ]);
    };

    setupChat();
    chatService.onMessageReceived(handleReceiveMessage);

    return () => {
      isMounted = false;
      chatService.removeMessageCallback(handleReceiveMessage);
    };
  }, [receiverId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      await chatService.sendMessage(receiverId, inputText);
      // Mesajı kendi ekranımıza da ekleyelim (Backend ekolu (echo) geri dönmüyorsa)
      setMessages((prev) => [
        ...prev,
        {
          senderId: "ME", // Kendi mesajım olduğunu belirtmek için
          text: inputText,
          timestamp: new Date().toISOString(),
        },
      ]);
      setInputText("");
    } catch (err) {
      alert("Mesaj gönderilemedi.");
    }
  };

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalStyle = {
    backgroundColor: "white",
    width: "90%",
    maxWidth: "400px",
    height: "500px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    overflow: "hidden",
  };

  const headerStyle = {
    backgroundColor: "#007BFF",
    color: "white",
    padding: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const chatContainerStyle = {
    flex: 1,
    padding: "15px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    backgroundColor: "#f5f6fa",
  };

  const inputContainerStyle = {
    display: "flex",
    borderTop: "1px solid #ddd",
    padding: "10px",
    backgroundColor: "white",
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
            {receiverName} ile Sohbet
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>

        <div style={chatContainerStyle}>
          {messages.length === 0 ? (
            <div
              style={{ textAlign: "center", color: "#888", marginTop: "20px" }}
            >
              Henüz mesaj yok. İlk yazan sen ol!
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMine = msg.senderId === "ME";
              return (
                <div
                  key={index}
                  style={{
                    alignSelf: isMine ? "flex-end" : "flex-start",
                    backgroundColor: isMine ? "#007BFF" : "#E4E6EB",
                    color: isMine ? "white" : "black",
                    padding: "10px 14px",
                    borderRadius: isMine
                      ? "15px 15px 0 15px"
                      : "15px 15px 15px 0",
                    maxWidth: "75%",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.text}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} style={inputContainerStyle}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isConnected ? "Bir mesaj yazın..." : "Bağlanıyor..."}
            disabled={!isConnected}
            style={{
              flex: 1,
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "20px",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || !isConnected}
            style={{
              marginLeft: "10px",
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Gönder
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
