import * as signalR from "@microsoft/signalr";

class ChatService {
  constructor() {
    this.connection = null;
    this.messageCallbacks = [];
  }

  // Bağlantıyı başlat
  async startConnection() {
    if (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Connected
    ) {
      console.log("Zaten bağlı.");
      return;
    }

    const token = localStorage.getItem("token");

    this.connection = new signalR.HubConnectionBuilder()
      // Hub URL'si backend'e göre değişebilir ("/chatHub" veya "http://localhost:xxxx/chatHub" vb.)
      .withUrl("/chatHub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect() // Koptuğunda otomatik tekrar bağlanmayı dener
      .build();

    // Gelen mesajı dinle (Backend 'ReceiveMessage' göndermeli)
    this.connection.on("ReceiveMessage", (senderId, messageText, timestamp) => {
      this.messageCallbacks.forEach((cb) =>
        cb(senderId, messageText, timestamp),
      );
    });

    try {
      await this.connection.start();
      console.log("SignalR bağlantısı başarılı!");
    } catch (err) {
      console.error("SignalR bağlantı hatası:", err);
    }
  }

  // Gelen mesajlar için callback ekle
  onMessageReceived(callback) {
    this.messageCallbacks.push(callback);
  }

  // Callback çıkar (Component unmount olduğunda vb.)
  removeMessageCallback(callback) {
    this.messageCallbacks = this.messageCallbacks.filter(
      (cb) => cb !== callback,
    );
  }

  // Mesaj gönder (Backend'de 'SendMessage' metodunu tetikler)
  async sendMessage(receiverId, messageText) {
    if (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Connected
    ) {
      try {
        await this.connection.invoke("SendMessage", receiverId, messageText);
        console.log("Mesaj gönderildi.");
      } catch (err) {
        console.error("Mesaj gönderim hatası:", err);
        throw err;
      }
    } else {
      console.error("SignalR bağlı değil. Mesaj gönderilemedi.");
      // Bağlantı yoksa başlatmayı dene
      await this.startConnection();
      await this.connection.invoke("SendMessage", receiverId, messageText);
    }
  }

  // Bağlantıyı durdur
  async stopConnection() {
    if (this.connection) {
      this.messageCallbacks = [];
      await this.connection.stop();
      console.log("SignalR bağlantısı durduruldu.");
    }
  }
}

const chatService = new ChatService();
export default chatService;
