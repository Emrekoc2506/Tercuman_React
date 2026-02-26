import React, { useState, useEffect } from "react";
import api from "../services/api"; // Az önce oluşturduğumuz bağlantı merkezini çağırdık

const AdminPanel = () => {
  // Backend'den gelecek verileri tutmak için bir "kutu" (state) oluşturuyoruz.
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Veri gelene kadar "Yükleniyor" demek için.

  // useEffect: Sayfa ilk açıldığında çalışacak kod bloğu.
  useEffect(() => {
    verileriGetir();
  }, []);

  const verileriGetir = async () => {
    try {
      // Backend'deki "api/products" adresine GET isteği atıyoruz.
      const response = await api.get("/Product");
      setProducts(response.data); // Gelen veriyi "products" kutusuna koyuyoruz.
      setLoading(false); // Yükleme bitti.
    } catch (error) {
      console.error("Veri çekerken hata oluştu:", error);
      setLoading(false);
    }
  };

  if (loading) return <div>Veriler yükleniyor, bekleyin hocam...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Paneli - Ürünler</h2>
      <ul>
        {/* products içindeki her bir öğeyi ekrana yazdırıyoruz */}
        {products.map((urun, index) => (
          <li key={index}>{urun}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
